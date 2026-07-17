import { StorageService } from '../../services/storage/storage.service'
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core'
import { CommonModule, isPlatformBrowser } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { NgChartsModule } from 'ng2-charts'
import { Chart, registerables } from 'chart.js'
import { ChartData, ChartOptions } from 'chart.js'
import { StatisticsService } from '../../services/statistics/statistics.service'
import { PuntoVerdeService } from '../../services/punto-verde/punto-verde.service'
import { SkeletonComponent } from '../../components/skeleton/skeleton.component'
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component'
import { NotificationPanelComponent } from '../../components/notification-panel/notification-panel.component'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'
import { PuntoVerde } from '../../services/interfaces/punto-verde'
import type {
  TotalRecycled,
  GreenPointRanking,
  WasteByCategory,
  WasteByPeriod
} from '../../services/interfaces/statistics'

Chart.register(...registerables)

type RangeKey = '7d' | '30d' | '90d' | '1y' | 'custom'

// Misma paleta de marca que entidad-dashboard, no colores random.
const CATEGORY_COLORS = ['#1e9e5a', '#e0a019', '#3a77b5', '#e5484d', '#7c3aed', '#34d399', '#a3782f', '#0f5132']
const DAY_MS = 86400000

@Component({
  selector: 'app-responsable-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    NgChartsModule,
    SkeletonComponent,
    NotificationBellComponent,
    NotificationPanelComponent,
    PageHeaderComponent
  ],
  templateUrl: './responsable-dashboard.component.html',
  styleUrl: './responsable-dashboard.component.scss'
})
export class ResponsableDashboardComponent implements OnInit {
  private storage = inject(StorageService)
  private platformId = inject(PLATFORM_ID)
  private statsServ = inject(StatisticsService)
  private pvServ = inject(PuntoVerdeService)
  loading = true
  entidadId = ''

  // ── Filtro de período ──
  selectedRange: RangeKey = '30d'
  dateFrom = ''
  dateTo = ''
  rangeLabel = ''

  // ── KPIs ──
  totalWeight = 0
  totalPoints = 0
  totalTransactions = 0
  trendWeight: number | null = null
  trendPoints: number | null = null
  trendTransactions: number | null = null
  sparkPoints = ''
  sparkFill = ''

  // ── Rail derecho: ranking de vecinos del punto verde elegido ──
  listPuntosVerdes: PuntoVerde[] = []
  puntoVerdeSeleccionado = ''
  topVecinos: any[] = []

  topCategories: { name: string; weight: number; pct: number; color: string }[] = []

  periodData: ChartData<'line'> = { labels: [], datasets: [] }
  periodOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7c72', font: { size: 11 } }, border: { display: false } },
      y: { grid: { color: '#e2e8e0' }, ticks: { color: '#6b7c72', font: { size: 11 } }, border: { display: false } }
    }
  }

  pieData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] }
  pieOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, boxWidth: 8, boxHeight: 8, color: '#6b7c72', font: { size: 12 } }
      }
    }
  }

  rankingData: ChartData<'bar'> = { labels: [], datasets: [] }
  rankingOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7c72', font: { size: 11 } }, border: { display: false } },
      y: { grid: { color: '#e2e8e0' }, ticks: { color: '#6b7c72', font: { size: 11 } }, border: { display: false } }
    }
  }

  ngOnInit(): void {
    // El responsable guarda su perfil bajo 'usuarioInfo' (no 'entidadInfo',
    // esa clave es exclusiva del rol entidad — ver ROLE_CONFIG en
    // login.component.ts). La relación con la entidad no viene populada,
    // así que el backend la serializa como el string crudo en 'entity',
    // no como 'entityId' ni como un objeto anidado.
    const usuarioInfo = JSON.parse(this.storage.getItem('usuarioInfo') || '{}')
    this.entidadId = usuarioInfo?.entity ?? ''
    this.puntoVerdeSeleccionado = this.storage.getItem('puntoVerde') || ''

    if (isPlatformBrowser(this.platformId)) {
      this.pvServ.list(this.entidadId).subscribe((res: any) => {
        this.listPuntosVerdes = res ?? []
      })
      this.loadAllStats()
      this.loadTopVecinos()
    }
  }

  setRange(range: RangeKey): void {
    this.selectedRange = range
    if (range !== 'custom') this.loadAllStats()
  }

  applyCustomRange(): void {
    if (this.dateFrom || this.dateTo) this.loadAllStats()
  }

  onPuntoVerdeChange(id: string): void {
    this.puntoVerdeSeleccionado = id
    this.storage.setItem('puntoVerde', id)
    this.loadTopVecinos()
  }

  private loadTopVecinos(): void {
    if (!this.puntoVerdeSeleccionado) {
      this.topVecinos = []
      return
    }
    this.statsServ.getNeighborRankingByGreenPoint(this.puntoVerdeSeleccionado).subscribe({
      next: (resp: any) => (this.topVecinos = (resp.data || []).slice(0, 5)),
      error: () => (this.topVecinos = [])
    })
  }

  loadAllStats(): void {
    const { from, to } = this.currentWindow()
    this.updateRangeLabel(from, to)
    this.loadTotals(from, to)
    this.loadRanking(from, to)
    this.loadByCategory(from, to)
    this.loadByPeriod(from, to)
  }

  private currentWindow(): { from?: string; to?: string } {
    if (this.selectedRange === 'custom') {
      return { from: this.dateFrom || undefined, to: this.dateTo || undefined }
    }
    const days: Record<Exclude<RangeKey, 'custom'>, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
    const to = new Date()
    const from = new Date(to.getTime() - days[this.selectedRange] * DAY_MS)
    return { from: this.toIso(from), to: this.toIso(to) }
  }

  private toIso(date: Date): string {
    return date.toISOString().slice(0, 10)
  }

  private updateRangeLabel(from?: string, to?: string): void {
    if (!from || !to) {
      this.rangeLabel = 'Todo el historial'
      return
    }
    const f = new Date(from + 'T00:00:00')
    const t = new Date(to + 'T00:00:00')
    const fmt = (d: Date) => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
    this.rangeLabel = `${fmt(f)} – ${fmt(t)} ${t.getFullYear()}`
  }

  loadTotals(from?: string, to?: string): void {
    this.statsServ.getTotalRecycled(this.entidadId, from, to).subscribe({
      next: (res: any) => {
        const data: TotalRecycled = res.data
        this.totalWeight = data.totalWeight
        this.totalPoints = data.totalPoints
        this.totalTransactions = data.totalTransactions
        this.loadTrends(data, from, to)
        this.loading = false
      },
      error: () => (this.loading = false)
    })
  }

  private loadTrends(current: TotalRecycled, from?: string, to?: string): void {
    this.trendWeight = this.trendPoints = this.trendTransactions = null
    if (!from || !to) return
    const f = new Date(from + 'T00:00:00')
    const t = new Date(to + 'T00:00:00')
    const span = t.getTime() - f.getTime()
    const prevTo = new Date(f.getTime() - DAY_MS)
    const prevFrom = new Date(prevTo.getTime() - span)
    this.statsServ.getTotalRecycled(this.entidadId, this.toIso(prevFrom), this.toIso(prevTo)).subscribe((res: any) => {
      const prev: TotalRecycled = res.data
      this.trendWeight = this.pctChange(prev.totalWeight, current.totalWeight)
      this.trendPoints = this.pctChange(prev.totalPoints, current.totalPoints)
      this.trendTransactions = this.pctChange(prev.totalTransactions, current.totalTransactions)
    })
  }

  private pctChange(prev: number, curr: number): number | null {
    if (!prev) return null
    return ((curr - prev) / prev) * 100
  }

  loadRanking(from?: string, to?: string): void {
    this.statsServ.getGreenPointsRanking(this.entidadId, from, to).subscribe((res: any) => {
      const data: GreenPointRanking[] = res.data
      this.rankingData = {
        labels: data.map(d => d.name),
        datasets: [
          {
            data: data.map(d => d.totalWeight),
            label: 'Kg recolectados',
            backgroundColor: '#1e9e5a',
            hoverBackgroundColor: '#34d399',
            borderRadius: 8,
            maxBarThickness: 46
          }
        ]
      }
    })
  }

  loadByCategory(from?: string, to?: string): void {
    this.statsServ.getWasteByCategory(this.entidadId, from, to).subscribe((res: any) => {
      const data: WasteByCategory[] = res.data
      this.pieData = {
        labels: data.map(d => d.categoryName),
        datasets: [
          {
            data: data.map(d => d.totalWeight),
            backgroundColor: CATEGORY_COLORS,
            borderColor: '#ffffff',
            borderWidth: 2
          }
        ]
      }
      const sorted = [...data].sort((a, b) => b.totalWeight - a.totalWeight)
      const max = sorted[0]?.totalWeight || 1
      this.topCategories = sorted.slice(0, 4).map((d, i) => ({
        name: d.categoryName,
        weight: d.totalWeight,
        pct: Math.round((d.totalWeight / max) * 100),
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
      }))
    })
  }

  loadByPeriod(from?: string, to?: string): void {
    const groupBy = this.groupByForRange(from, to)
    this.statsServ.getWasteByPeriod(this.entidadId, groupBy, from, to).subscribe((res: any) => {
      const data: WasteByPeriod[] = res.data
      const weights = data.map(d => d.totalWeight)
      this.periodData = {
        labels: data.map(d => this.formatPeriod(d.period, groupBy)),
        datasets: [
          {
            data: weights,
            label: 'Kg reciclados',
            borderColor: '#1e9e5a',
            backgroundColor: 'rgba(30, 158, 90, 0.12)',
            pointBackgroundColor: '#1e9e5a',
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 3,
            fill: true,
            tension: 0.35
          }
        ]
      }
      this.buildSpark(weights)
    })
  }

  private groupByForRange(from?: string, to?: string): string {
    switch (this.selectedRange) {
      case '7d':
        return 'day'
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

  private buildSpark(series: number[]): void {
    if (series.length < 2) {
      this.sparkPoints = ''
      this.sparkFill = ''
      return
    }
    const max = Math.max(...series)
    const min = Math.min(...series)
    const range = max - min || 1
    const stepX = 220 / (series.length - 1)
    const points = series
      .map((value, i) => `${Math.round(i * stepX)},${Math.round(2 + (1 - (value - min) / range) * 28)}`)
      .join(' ')
    this.sparkPoints = points
    this.sparkFill = `${points} 220,34 0,34`
  }

  formatPeriod(period: string, groupBy: string): string {
    const [datePart] = period.split(/[ T]/)
    const [year, month, day] = datePart.split('-').map(Number)
    const date = new Date(year, month - 1, day || 1)
    if (groupBy === 'year') return String(year)
    if (groupBy === 'month') return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'short' })
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  }
}
