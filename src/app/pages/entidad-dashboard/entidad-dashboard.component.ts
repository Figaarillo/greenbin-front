import { StorageService } from '../../services/storage/storage.service'
import { Component, DestroyRef, inject, OnInit, PLATFORM_ID } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { CommonModule, isPlatformBrowser } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NgChartsModule } from 'ng2-charts'
import { Chart, registerables } from 'chart.js'
import { ChartData, ChartOptions, TooltipItem } from 'chart.js'
import { Observable, Subject, of } from 'rxjs'
import { catchError, map, switchMap, tap } from 'rxjs/operators'
import { StatisticsService } from '../../services/statistics/statistics.service'
import { SkeletonComponent } from '../../components/skeleton/skeleton.component'
import {
  type PeriodWindow,
  type RangeKey,
  buildSpark,
  comparisonLabelFor,
  fillPeriodGaps,
  formatPeriod,
  groupByForRange,
  pctChange,
  previousWindow,
  rangeLabelFor,
  toLocalIso,
  topCategoriesFrom,
  windowForRange
} from '../../services/statistics/dashboard-period.util'
import type {
  TotalRecycled,
  GreenPointRanking,
  WasteByCategory,
  WasteByPeriod,
  RewardPartnerRanking,
  Co2Avoided,
  PointsBalance
} from '../../services/interfaces/statistics'

Chart.register(...registerables)

// Paleta de marca ($gb-green y tokens), no colores random.
const CATEGORY_COLORS = ['#1e9e5a', '#e0a019', '#3a77b5', '#e5484d', '#7c3aed', '#34d399', '#a3782f', '#0f5132']
const RANKING_LIMIT = 10

// ── BLOQUE DESMONTABLE: equivalencias de CO2 ────────────────────────────────
// Si se decide sacar la equivalencia del dashboard, alcanza con borrar esta
// constante, `co2Trees`, `co2DetailOpen`, `toggleCo2Detail()`, el getter
// `co2Equivalences` y el bloque `.co2-detail` del template. Nada más depende
// de esto: el KPI de kg de CO2 sigue funcionando solo.
//
// Los factores son promedios de divulgación, no valores certificados. Por eso
// la tabla muestra el factor de cada fila: el número es auditable de un vistazo.
const CO2_EQUIVALENCES = [
  {
    label: 'Árboles absorbiendo CO2 durante un año',
    unit: 'árboles',
    kgPerUnit: 21,
    note: '21 kg de CO2 por árbol al año'
  },
  { label: 'Kilómetros en auto no recorridos', unit: 'km', kgPerUnit: 0.12, note: '120 g de CO2 por kilómetro' },
  { label: 'Litros de nafta no quemados', unit: 'litros', kgPerUnit: 2.31, note: '2,31 kg de CO2 por litro' },
  { label: 'Días de consumo eléctrico de un hogar', unit: 'días', kgPerUnit: 4.6, note: '4,6 kg de CO2 por día' }
]
const CO2_KG_PER_TREE_YEAR = CO2_EQUIVALENCES[0].kgPerUnit

const kg = (value: number): string => `${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg`

@Component({
  selector: 'app-entidad-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NgChartsModule, SkeletonComponent],
  templateUrl: './entidad-dashboard.component.html',
  styleUrl: './entidad-dashboard.component.scss'
})
export class EntidadDashboardComponent implements OnInit {
  private storage = inject(StorageService)
  private platformId = inject(PLATFORM_ID)
  private destroyRef = inject(DestroyRef)
  loading = true
  name = ''
  email = ''
  entidadId = ''
  statsServ = inject(StatisticsService)

  // Cada request se dispara desde este subject y se consume con `switchMap`,
  // así un cambio de rango cancela el pedido anterior en vez de dejar que una
  // respuesta lenta pise los datos del rango nuevo.
  private readonly window$ = new Subject<PeriodWindow>()

  // ── Estados de error por tarjeta ──
  // Aislados a propósito: si se cae el donut, los KPIs y la serie siguen vivos.
  errorTotals = false
  errorRanking = false
  errorCategory = false
  errorPeriod = false
  errorCounts = false
  errorPartners = false
  errorCo2 = false
  errorPoints = false

  // ── Estados vacíos ── (sin datos ≠ error: se comunican distinto)
  hasRanking = false
  hasCategories = false
  hasPeriod = false
  hasPartners = false
  hasCo2 = false
  hasPoints = false

  // ── Filtro de período (rango rápido segmentado) ──
  selectedRange: RangeKey = '30d'
  dateFrom = ''
  dateTo = ''
  rangeLabel = ''
  comparisonLabel = ''

  // ── KPIs ──
  totalWeight = 0
  totalPoints = 0
  totalTransactions = 0

  // Tendencia vs. la ventana anterior de igual longitud (null = sin base de comparación)
  trendWeight: number | null = null
  trendPoints: number | null = null
  trendTransactions: number | null = null

  // Sparkline del KPI de kg (serie real de waste-by-period)
  sparkPoints = ''
  sparkFill = ''

  // ── Rail derecho ──
  topCategories: { name: string; weight: number; pct: number; color: string }[] = []
  countPuntosVerdes: number | null = null
  countResponsables: number | null = null
  countVecinos: number | null = null
  countLocales: number | null = null

  // ── Serie temporal (área) ──
  periodData: ChartData<'line'> = { labels: [], datasets: [] }
  periodOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: items => `Período: ${items[0].label}`,
          label: (item: TooltipItem<'line'>) => `Reciclado: ${kg(item.parsed.y ?? 0)}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7c72', font: { size: 11 } }, border: { display: false } },
      y: { grid: { color: '#e2e8e0' }, ticks: { color: '#6b7c72', font: { size: 11 } }, border: { display: false } }
    }
  }

  // ── Donut por categoría ──
  pieData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] }
  pieOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, boxWidth: 8, boxHeight: 8, color: '#6b7c72', font: { size: 12 } }
      },
      tooltip: {
        callbacks: {
          // El donut sin el % obliga a estimar el ángulo a ojo. Con el peso y la
          // participación al lado, el dato se lee sin interpretar el dibujo.
          label: (item: TooltipItem<'doughnut'>) => {
            const total = (item.dataset.data as number[]).reduce((sum, value) => sum + (value ?? 0), 0)
            const share = total > 0 ? Math.round((item.parsed / total) * 100) : 0
            return `${item.label}: ${kg(item.parsed)} (${share}% del total)`
          }
        }
      }
    }
  }

  // ── Ranking de puntos verdes ──
  rankingData: ChartData<'bar'> = { labels: [], datasets: [] }
  rankingOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: items => items[0].label,
          label: (item: TooltipItem<'bar'>) => `Recolectado: ${kg(item.parsed.y ?? 0)}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7c72', font: { size: 11 } }, border: { display: false } },
      y: { grid: { color: '#e2e8e0' }, ticks: { color: '#6b7c72', font: { size: 11 } }, border: { display: false } }
    }
  }

  // ── Gestión de puntos ──
  // Los puntos otorgados son un PASIVO del municipio: los vecinos los pueden
  // gastar en cualquier momento en los locales adheridos. El KPI de arriba sólo
  // muestra lo otorgado en el período; acá está el saldo acumulado real.
  pointsGranted = 0
  pointsSpent = 0
  pointsOutstanding = 0
  neighborsWithBalance = 0
  pointsSpentPct = 0
  pointsOutstandingPct = 0

  // ── CO2 evitado ──
  // "1.240 kg de CO2" no le dice nada a nadie. El equivalente en árboles da una
  // referencia intuitiva para comunicarle el impacto a los vecinos.
  totalCo2 = 0
  co2Trees = 0
  co2DetailOpen = false

  toggleCo2Detail(): void {
    this.co2DetailOpen = !this.co2DetailOpen
  }

  /** Todas las equivalencias del total actual, con el factor usado en cada una. */
  get co2Equivalences(): Array<{ label: string; unit: string; kgPerUnit: number; note: string; value: number }> {
    return CO2_EQUIVALENCES.map(e => ({ ...e, value: this.totalCo2 / e.kgPerUnit }))
  }
  co2Data: ChartData<'bar'> = { labels: [], datasets: [] }
  co2Options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (item: TooltipItem<'bar'>) => `${(item.parsed.x ?? 0).toFixed(1)} kg de CO2 evitados`,
          footer: items => {
            const weight = this.co2Weights[items[0].dataIndex] ?? 0
            return `a partir de ${kg(weight)} reciclados`
          }
        }
      }
    },
    scales: {
      x: { grid: { color: '#e2e8e0' }, ticks: { color: '#6b7c72', font: { size: 11 } }, border: { display: false } },
      y: { grid: { display: false }, ticks: { color: '#6b7c72', font: { size: 11 } }, border: { display: false } }
    }
  }

  /** Kg reciclados por categoría, alineados con las barras de CO2 (para el tooltip). */
  private co2Weights: number[] = []

  // ── Locales por cupones ──
  // Barras apiladas: un local con muchos "adquiridos" y pocos "usados" tiene un
  // problema distinto al que directamente no mueve cupones. Un solo número lo
  // escondería; el apilado deja ver el embudo completo.
  partnersData: ChartData<'bar'> = { labels: [], datasets: [] }
  partnersOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, boxWidth: 8, boxHeight: 8, color: '#6b7c72', font: { size: 12 } }
      },
      tooltip: {
        callbacks: {
          label: (item: TooltipItem<'bar'>) => `${item.dataset.label}: ${item.parsed.x ?? 0} cupones`,
          footer: items => {
            const points = this.partnerPoints[items[0].dataIndex] ?? 0
            return `${points.toLocaleString('es-AR')} puntos gastados por vecinos`
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: { color: '#e2e8e0' },
        ticks: { color: '#6b7c72', font: { size: 11 }, precision: 0 },
        border: { display: false }
      },
      y: {
        stacked: true,
        grid: { display: false },
        ticks: { color: '#6b7c72', font: { size: 11 } },
        border: { display: false }
      }
    }
  }

  /** Puntos gastados por local, en el mismo orden que las barras (para el tooltip). */
  private partnerPoints: number[] = []

  ngOnInit(): void {
    const info = this.storage.getItem('entidadInfo')
    let entidadInfo: any = {}
    try {
      entidadInfo = info ? JSON.parse(info) : {}
    } catch {
      entidadInfo = {}
    }
    this.email = entidadInfo?.email ?? ''
    this.name = entidadInfo?.name ?? ''
    this.entidadId = entidadInfo?.id ?? ''
    if (isPlatformBrowser(this.platformId)) {
      this.wireStats()
      this.loadCounts()
      this.loadPointsBalance()
      this.loadAllStats()
    }
  }

  setRange(range: RangeKey): void {
    this.selectedRange = range
    if (range !== 'custom') this.loadAllStats()
  }

  applyCustomRange(): void {
    if (this.dateFrom || this.dateTo) this.loadAllStats()
  }

  loadAllStats(): void {
    const window = this.currentWindow()
    this.updateRangeLabel(window.from, window.to)
    this.window$.next(window)
  }

  private currentWindow(): PeriodWindow {
    return windowForRange(this.selectedRange, this.dateFrom, this.dateTo)
  }

  /** Fecha de calendario en hora local (ver `toLocalIso` en el util). */
  toLocalIso(date: Date): string {
    return toLocalIso(date)
  }

  private updateRangeLabel(from?: string, to?: string): void {
    this.rangeLabel = rangeLabelFor(from, to)
  }

  private updateComparisonLabel(from?: string, to?: string): void {
    this.comparisonLabel = comparisonLabelFor(from, to)
  }

  /**
   * Cada tarjeta escucha el mismo `window$` con su propio `switchMap`, así un
   * cambio de rango aborta los cuatro requests en vuelo. El `catchError` va
   * DENTRO del switchMap: si se resolviera afuera, un 500 completaría el stream
   * y la tarjeta quedaría muerta hasta recargar la página.
   */
  private wireStats(): void {
    this.window$
      .pipe(
        tap(() => (this.errorTotals = false)),
        switchMap(w =>
          this.statsServ.getTotalRecycled(this.entidadId, w.from, w.to).pipe(
            // Los KPIs se pintan apenas llegan los totales. La tendencia es un
            // segundo request: encadenarla antes de mostrar los números dejaría
            // las tarjetas en blanco esperando un dato secundario.
            tap((res: any) => {
              const data = res.data as TotalRecycled
              this.totalWeight = data.totalWeight
              this.totalPoints = data.totalPoints
              this.totalTransactions = data.totalTransactions
              this.updateComparisonLabel(w.from, w.to)
              this.loading = false
            }),
            switchMap((res: any) => this.withTrends(res.data as TotalRecycled, w)),
            catchError(() => {
              this.errorTotals = true
              this.loading = false
              return of(null)
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe()

    this.window$
      .pipe(
        tap(() => (this.errorRanking = false)),
        switchMap(w =>
          this.statsServ.getGreenPointsRanking(this.entidadId, w.from, w.to, RANKING_LIMIT).pipe(
            catchError(() => {
              this.errorRanking = true
              return of({ data: [] })
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: any) => this.applyRanking(res.data ?? []))

    this.window$
      .pipe(
        tap(() => (this.errorCo2 = false)),
        switchMap(w =>
          this.statsServ.getCo2Avoided(this.entidadId, w.from, w.to).pipe(
            catchError(() => {
              this.errorCo2 = true
              return of({ data: { totalCo2: 0, byCategory: [] } })
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: any) => this.applyCo2(res.data ?? { totalCo2: 0, byCategory: [] }))

    this.window$
      .pipe(
        tap(() => (this.errorPartners = false)),
        switchMap(w =>
          this.statsServ.getRewardPartnersRanking(this.entidadId, w.from, w.to, RANKING_LIMIT).pipe(
            catchError(() => {
              this.errorPartners = true
              return of({ data: [] })
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: any) => this.applyPartners(res.data ?? []))

    this.window$
      .pipe(
        tap(() => (this.errorCategory = false)),
        switchMap(w =>
          this.statsServ.getWasteByCategory(this.entidadId, w.from, w.to).pipe(
            catchError(() => {
              this.errorCategory = true
              return of({ data: [] })
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: any) => this.applyCategories(res.data ?? []))

    this.window$
      .pipe(
        tap(() => (this.errorPeriod = false)),
        switchMap(w => {
          const groupBy = this.groupByForRange(w.from, w.to)
          return this.statsServ.getWasteByPeriod(this.entidadId, groupBy, w.from, w.to).pipe(
            map((res: any) => ({ rows: (res.data ?? []) as WasteByPeriod[], groupBy, window: w })),
            catchError(() => {
              this.errorPeriod = true
              return of({ rows: [] as WasteByPeriod[], groupBy, window: w })
            })
          )
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ rows, groupBy, window }) => this.applyPeriod(rows, groupBy, window))
  }

  // Compara contra la ventana inmediatamente anterior de igual longitud.
  private withTrends(current: TotalRecycled, w: PeriodWindow): Observable<TotalRecycled> {
    this.trendWeight = this.trendPoints = this.trendTransactions = null
    if (!w.from || !w.to) return of(current)

    const prev = previousWindow(w.from, w.to)
    return this.statsServ.getTotalRecycled(this.entidadId, prev.from, prev.to).pipe(
      map((res: any) => {
        const p = res.data as TotalRecycled
        this.trendWeight = pctChange(p.totalWeight, current.totalWeight)
        this.trendPoints = pctChange(p.totalPoints, current.totalPoints)
        this.trendTransactions = pctChange(p.totalTransactions, current.totalTransactions)
        return current
      }),
      // La tendencia es un adorno: si falla, los KPIs igual se muestran.
      catchError(() => of(current))
    )
  }

  private applyRanking(data: GreenPointRanking[]): void {
    this.hasRanking = data.length > 0
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
  }

  private applyCo2(data: Co2Avoided): void {
    const byCategory = data.byCategory ?? []
    this.totalCo2 = data.totalCo2 ?? 0
    this.hasCo2 = byCategory.length > 0
    this.co2Trees = Math.round(this.totalCo2 / CO2_KG_PER_TREE_YEAR)
    this.co2Weights = byCategory.map(c => c.totalWeight)
    this.co2Data = {
      labels: byCategory.map(c => c.categoryName),
      datasets: [
        {
          data: byCategory.map(c => c.co2),
          label: 'Kg de CO2 evitados',
          backgroundColor: '#0f5132',
          hoverBackgroundColor: '#1e9e5a',
          borderRadius: 6,
          maxBarThickness: 26
        }
      ]
    }
  }

  private applyPartners(data: RewardPartnerRanking[]): void {
    this.hasPartners = data.length > 0
    this.partnerPoints = data.map(d => d.pointsSpent)
    this.partnersData = {
      labels: data.map(d => d.name),
      datasets: [
        {
          data: data.map(d => d.used),
          label: 'Usados',
          backgroundColor: '#1e9e5a',
          borderRadius: 4,
          maxBarThickness: 22
        },
        {
          data: data.map(d => d.acquired),
          label: 'Sin usar',
          backgroundColor: '#e0a019',
          borderRadius: 4,
          maxBarThickness: 22
        },
        {
          data: data.map(d => d.expired),
          label: 'Vencidos',
          backgroundColor: '#e5484d',
          borderRadius: 4,
          maxBarThickness: 22
        }
      ]
    }
  }

  private applyCategories(data: WasteByCategory[]): void {
    this.hasCategories = data.length > 0
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

    this.topCategories = topCategoriesFrom(data, CATEGORY_COLORS)
  }

  private applyPeriod(rows: WasteByPeriod[], groupBy: string, w: PeriodWindow): void {
    const data = fillPeriodGaps(rows, groupBy, w.from, w.to)
    this.hasPeriod = rows.length > 0
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
    const spark = buildSpark(weights)
    this.sparkPoints = spark.points
    this.sparkFill = spark.fill
  }

  /** Rellena los períodos sin entregas con cero (ver util compartido). */
  fillPeriodGaps(rows: WasteByPeriod[], groupBy: string, from?: string, to?: string): WasteByPeriod[] {
    return fillPeriodGaps(rows, groupBy, from, to)
  }

  private groupByForRange(from?: string, to?: string): string {
    return groupByForRange(this.selectedRange, from, to)
  }

  /**
   * Saldo acumulado, sin filtro de período: los vecinos gastan puntos que
   * ganaron hace meses, así que acotarlo al rango daría un número sin sentido.
   * Por eso se pide una sola vez y no cuelga de `window$`.
   */
  private loadPointsBalance(): void {
    this.statsServ
      .getPointsBalance(this.entidadId)
      .pipe(
        catchError(() => {
          this.errorPoints = true
          return of(null)
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: any) => {
        const data = res?.data as PointsBalance | undefined
        if (data == null) return
        this.pointsGranted = data.granted
        this.pointsSpent = data.spent
        this.pointsOutstanding = data.outstanding
        this.neighborsWithBalance = data.neighborsWithBalance
        this.hasPoints = data.granted > 0
        this.pointsSpentPct = data.granted > 0 ? Math.round((data.spent / data.granted) * 100) : 0
        this.pointsOutstandingPct = data.granted > 0 ? 100 - this.pointsSpentPct : 0
      })
  }

  private loadCounts(): void {
    this.statsServ
      .getEntityCounts(this.entidadId)
      .pipe(
        catchError(() => {
          this.errorCounts = true
          return of(null)
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: any) => {
        if (res?.data == null) return
        this.countPuntosVerdes = res.data.greenPoints
        this.countResponsables = res.data.responsibles
        this.countVecinos = res.data.neighbors
        this.countLocales = res.data.rewardPartners
      })
  }

  formatPeriod(period: string, groupBy: string): string {
    return formatPeriod(period, groupBy)
  }
}
