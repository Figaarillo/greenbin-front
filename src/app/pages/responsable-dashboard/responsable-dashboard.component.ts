import { StorageService } from '../../services/storage/storage.service'
import { Component, DestroyRef, inject, OnInit, PLATFORM_ID } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { CommonModule, isPlatformBrowser } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { NgChartsModule } from 'ng2-charts'
import { Chart, registerables } from 'chart.js'
import { ChartData, ChartOptions, TooltipItem } from 'chart.js'
import { Observable, Subject, of } from 'rxjs'
import { catchError, map, switchMap, tap } from 'rxjs/operators'
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
  topCategoriesFrom,
  windowForRange
} from '../../services/statistics/dashboard-period.util'

Chart.register(...registerables)

// Misma paleta de marca que entidad-dashboard, no colores random.
const CATEGORY_COLORS = ['#1e9e5a', '#e0a019', '#3a77b5', '#e5484d', '#7c3aed', '#34d399', '#a3782f', '#0f5132']
const RANKING_LIMIT = 10

const kg = (value: number): string => `${value.toLocaleString('es-AR', { maximumFractionDigits: 1 })} kg`

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
  private destroyRef = inject(DestroyRef)
  loading = true
  entidadId = ''

  // Un switchMap por tarjeta: cambiar de rango cancela lo que esté en vuelo en
  // vez de dejar que una respuesta lenta pise los datos del rango nuevo.
  private readonly window$ = new Subject<PeriodWindow>()

  // Estados de error aislados: si se cae el donut, los KPIs siguen vivos.
  errorTotals = false
  errorRanking = false
  errorCategory = false
  errorPeriod = false
  errorPuntos = false

  // Estados vacíos (sin datos ≠ error: se comunican distinto)
  hasRanking = false
  hasCategories = false
  hasPeriod = false

  // ── Filtro de período ──
  selectedRange: RangeKey = '30d'
  dateFrom = ''
  dateTo = ''
  rangeLabel = ''
  comparisonLabel = ''

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
          // Sin el % hay que estimar el ángulo a ojo.
          label: (item: TooltipItem<'doughnut'>) => {
            const total = (item.dataset.data as number[]).reduce((sum, value) => sum + (value ?? 0), 0)
            const share = total > 0 ? Math.round((item.parsed / total) * 100) : 0
            return `${item.label}: ${kg(item.parsed)} (${share}% del total)`
          }
        }
      }
    }
  }

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
      this.wireStats()
      this.loadPuntosVerdes()
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

  onPuntoVerdeChange(id: string): void {
    this.puntoVerdeSeleccionado = id
    this.storage.setItem('puntoVerde', id)
    this.loadTopVecinos()
  }

  loadAllStats(): void {
    const w = windowForRange(this.selectedRange, this.dateFrom, this.dateTo)
    this.rangeLabel = rangeLabelFor(w.from, w.to)
    this.comparisonLabel = comparisonLabelFor(w.from, w.to)
    this.window$.next(w)
  }

  private loadPuntosVerdes(): void {
    this.pvServ
      .list(this.entidadId)
      .pipe(
        catchError(() => {
          this.errorPuntos = true
          return of([])
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: any) => (this.listPuntosVerdes = res ?? []))
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

  /**
   * Cada tarjeta escucha el mismo `window$`. El `catchError` va DENTRO del
   * switchMap: afuera completaría el stream y la tarjeta quedaría muerta hasta
   * recargar la página.
   */
  private wireStats(): void {
    this.window$
      .pipe(
        tap(() => (this.errorTotals = false)),
        switchMap(w =>
          this.statsServ.getTotalRecycled(this.entidadId, w.from, w.to).pipe(
            // Los KPIs se pintan apenas llegan los totales; la tendencia es un
            // segundo request y no debe demorar los números.
            tap((res: any) => {
              const data = res.data as TotalRecycled
              this.totalWeight = data.totalWeight
              this.totalPoints = data.totalPoints
              this.totalTransactions = data.totalTransactions
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
          const groupBy = groupByForRange(this.selectedRange, w.from, w.to)
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

  formatPeriod(period: string, groupBy: string): string {
    return formatPeriod(period, groupBy)
  }
}
