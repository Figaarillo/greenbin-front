import type { WasteByPeriod } from '../interfaces/statistics'

export type RangeKey = '7d' | '30d' | '90d' | '1y' | 'custom'
export interface PeriodWindow {
  from?: string
  to?: string
}

export const DAY_MS = 86400000

/**
 * Lógica de período compartida por los dashboards de entidad y responsable.
 * Vivía duplicada en los dos componentes, con los mismos bugs en ambos: se
 * arreglaba en uno y el otro seguía roto.
 */

/**
 * `toISOString()` convierte a UTC: en Argentina (UTC-3), a partir de las 21:00
 * devuelve la fecha de MAÑANA y corre todo el rango un día. Los filtros son
 * fechas de calendario, así que se arman con los componentes locales del Date.
 */
export function toLocalIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function windowForRange(range: RangeKey, dateFrom = '', dateTo = ''): PeriodWindow {
  if (range === 'custom') {
    return { from: dateFrom || undefined, to: dateTo || undefined }
  }
  const days: Record<Exclude<RangeKey, 'custom'>, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
  const to = new Date()
  const from = new Date(to.getTime() - days[range] * DAY_MS)
  return { from: toLocalIso(from), to: toLocalIso(to) }
}

/** Granularidad acorde al rango para que la serie no quede vacía ni saturada. */
export function groupByForRange(range: RangeKey, from?: string, to?: string): string {
  switch (range) {
    case '7d':
    case '30d':
      return 'day'
    case '90d':
      return 'week'
    case '1y':
      return 'month'
    default: {
      if (!from || !to) return 'month'
      const days = (new Date(to).getTime() - new Date(from).getTime()) / DAY_MS
      if (days <= 31) return 'day'
      if (days <= 180) return 'week'
      return 'month'
    }
  }
}

export function rangeLabelFor(from?: string, to?: string): string {
  if (!from || !to) return 'Todo el historial'
  const f = new Date(from + 'T00:00:00')
  const t = new Date(to + 'T00:00:00')
  const fmt = (d: Date): string => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  return `${fmt(f)} – ${fmt(t)} ${t.getFullYear()}`
}

/** Ventana inmediatamente anterior, de igual longitud, para comparar tendencia. */
export function previousWindow(from: string, to: string): PeriodWindow {
  const f = new Date(from + 'T00:00:00')
  const t = new Date(to + 'T00:00:00')
  const span = t.getTime() - f.getTime()
  const prevTo = new Date(f.getTime() - DAY_MS)
  const prevFrom = new Date(prevTo.getTime() - span)
  return { from: toLocalIso(prevFrom), to: toLocalIso(prevTo) }
}

export function comparisonLabelFor(from?: string, to?: string): string {
  if (!from || !to) return ''
  const prev = previousWindow(from, to)
  const fmt = (iso: string): string =>
    new Date(iso + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  return `vs. ${fmt(prev.from!)} – ${fmt(prev.to!)} (período anterior de igual duración)`
}

export function pctChange(prev: number, curr: number): number | null {
  if (!prev) return null
  return ((curr - prev) / prev) * 100
}

function truncateToBucket(date: Date, groupBy: string): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  if (groupBy === 'month') d.setDate(1)
  // DATE_TRUNC('week') de Postgres arranca en lunes; se replica acá para que las
  // claves del mapa coincidan con las que devuelve el backend.
  if (groupBy === 'week') d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

function bucketKey(period: string, groupBy: string): string {
  const [datePart] = period.split(/[ T]/)
  const [year, month, day] = datePart.split('-').map(Number)
  return toLocalIso(truncateToBucket(new Date(year, month - 1, day || 1), groupBy))
}

/**
 * El backend sólo devuelve los períodos CON entregas. Sin este relleno, Chart.js
 * une el lunes con el miércoles en línea recta y dibuja una tendencia suave
 * donde en realidad hubo un día en cero.
 */
export function fillPeriodGaps(rows: WasteByPeriod[], groupBy: string, from?: string, to?: string): WasteByPeriod[] {
  if (!from || !to || groupBy === 'year') return rows

  const byBucket = new Map<string, number>()
  for (const row of rows) byBucket.set(bucketKey(row.period, groupBy), row.totalWeight)

  const cursor = truncateToBucket(new Date(from + 'T00:00:00'), groupBy)
  const end = new Date(to + 'T00:00:00')
  const filled: WasteByPeriod[] = []

  // Cota de seguridad: un rango absurdo no debe congelar el navegador.
  for (let guard = 0; cursor <= end && guard < 800; guard++) {
    const key = toLocalIso(cursor)
    filled.push({ period: key, totalWeight: byBucket.get(key) ?? 0 })
    if (groupBy === 'month') cursor.setMonth(cursor.getMonth() + 1)
    else if (groupBy === 'week') cursor.setDate(cursor.getDate() + 7)
    else cursor.setDate(cursor.getDate() + 1)
  }

  return filled.length > 0 ? filled : rows
}

export function formatPeriod(period: string, groupBy: string): string {
  const [datePart] = period.split(/[ T]/)
  const [year, month, day] = datePart.split('-').map(Number)
  const date = new Date(year, month - 1, day || 1)
  if (groupBy === 'year') return String(year)
  if (groupBy === 'month') return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'short' })
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

/** Sparkline del KPI de kg: devuelve los puntos del polyline y del relleno. */
export function buildSpark(series: number[]): { points: string; fill: string } {
  if (series.length < 2) return { points: '', fill: '' }
  const max = Math.max(...series)
  const min = Math.min(...series)
  const range = max - min || 1
  const stepX = 220 / (series.length - 1)
  const points = series
    .map((value, i) => `${Math.round(i * stepX)},${Math.round(2 + (1 - (value - min) / range) * 28)}`)
    .join(' ')
  return { points, fill: `${points} 220,34 0,34` }
}

/**
 * Participación de cada categoría sobre el TOTAL del período. Dividir por el
 * máximo hacía que la primera siempre llegara al 100% y la barra no dijera nada.
 */
export function topCategoriesFrom(
  data: Array<{ categoryName: string; totalWeight: number }>,
  colors: string[],
  limit = 4
): Array<{ name: string; weight: number; pct: number; color: string }> {
  const sorted = [...data].sort((a, b) => b.totalWeight - a.totalWeight)
  const total = sorted.reduce((sum, d) => sum + d.totalWeight, 0)
  return sorted.slice(0, limit).map((d, i) => ({
    name: d.categoryName,
    weight: d.totalWeight,
    pct: total > 0 ? Math.round((d.totalWeight / total) * 100) : 0,
    color: colors[i % colors.length]
  }))
}
