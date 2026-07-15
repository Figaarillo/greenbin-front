import { StorageService } from '../../services/storage/storage.service'
import { inject, Component, OnInit, PLATFORM_ID } from '@angular/core'
import { CommonModule, isPlatformBrowser } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { NgChartsModule } from 'ng2-charts'
import { Chart, registerables, ChartData, ChartOptions } from 'chart.js'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { SkeletonComponent } from '../../components/skeleton/skeleton.component'

Chart.register(...registerables)

@Component({
  selector: 'app-estadisticas-local',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, NgChartsModule, NavbarComponent, SkeletonComponent],
  templateUrl: './estadisticas-local.component.html',
  styleUrl: './estadisticas-local.component.scss'
})
export class EstadisticasLocalComponent implements OnInit {
  private storage = inject(StorageService)
  private platformId = inject(PLATFORM_ID)
  private route = inject(ActivatedRoute)
  private rewardPartnerId = ''
  private allTransactions: any[] = []
  loading = true

  /** true cuando entra por la ruta de entidad (viendo el ROI de un local ajeno). */
  viewingAsEntity = false
  navTitle = 'Estadísticas'
  navBackRoute = '/local'

  dateFrom = ''
  dateTo = ''
  hasData = false

  // KPI cards
  totalAdquirido = 0
  totalUsado = 0
  totalExpirado = 0
  totalPuntos = 0

  // ROI: valor de negocio para el local (clientes, no solo cupones)
  uniqueNeighbors = 0
  newNeighbors = 0
  avgVisitsPerNeighbor = 0
  byCoupon: Array<{
    couponId: string
    title: string
    redemptions: number
    uniqueNeighbors: number
    newNeighbors: number
    pointsSpent: number
  }> = []

  // Bar chart - status distribution
  barData: ChartData<'bar'> = {
    labels: ['Adquirido', 'Usado', 'Expirado'],
    datasets: [{ data: [], label: 'Cupones', backgroundColor: ['#2196f3', '#4caf50', '#f44336'] }]
  }
  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  }

  // Pie chart - discount ranges
  pieData: ChartData<'pie'> = {
    labels: ['< 25%', '25% – 50%', '50% – 75%', '> 75%'],
    datasets: [{ data: [], backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#9c27b0'] }]
  }
  pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: ctx => {
            const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0)
            const value = ctx.parsed as number
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0'
            return ` ${ctx.label}: ${value} cupones (${pct}%)`
          }
        }
      }
    }
  }

  constructor(private localService: LocalAdheridoService) {}

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('id')
    if (idFromRoute) {
      this.rewardPartnerId = idFromRoute
      this.viewingAsEntity = true
      this.navTitle = 'Panel de ROI'
      this.navBackRoute = '/entidad/consultar-locales'
    } else {
      const info = this.storage.getItem('usuarioInfo') || '{}'
      this.rewardPartnerId = JSON.parse(info).id
    }
    if (isPlatformBrowser(this.platformId)) this.loadData()
  }

  loadData(): void {
    this.loading = true
    this.localService.getCouponTransactions(this.rewardPartnerId).subscribe({
      next: (resp: any) => {
        this.allTransactions = resp.data ?? []
        this.applyFilterAndBuild()
        this.loading = false
      },
      error: () => (this.loading = false)
    })
  }

  applyGlobalFilter(): void {
    this.applyFilterAndBuild()
  }

  clearGlobalFilter(): void {
    this.dateFrom = ''
    this.dateTo = ''
    this.applyFilterAndBuild()
  }

  private applyFilterAndBuild(): void {
    const from = this.dateFrom ? new Date(this.dateFrom).getTime() : null
    const to = this.dateTo ? new Date(this.dateTo + 'T23:59:59').getTime() : null

    const filtered = this.allTransactions.filter(t => {
      const ref = new Date(t.redeemDate ?? t.adquisitionDate ?? t.createdAt).getTime()
      if (from != null && ref < from) return false
      if (to != null && ref > to) return false
      return true
    })

    this.buildStats(filtered)
  }

  private buildStats(transactions: any[]): void {
    this.hasData = transactions.length > 0

    // KPIs
    this.totalAdquirido = transactions.filter(t => t.status === 'ADQUIRIDO').length
    this.totalUsado = transactions.filter(t => t.status === 'USADO').length
    this.totalExpirado = transactions.filter(t => t.status === 'EXPIRADO').length
    this.totalPuntos = transactions.filter(t => t.status === 'USADO').reduce((sum, t) => sum + (t.costInPoints ?? 0), 0)

    // Bar chart
    this.barData = {
      labels: ['Adquirido', 'Usado', 'Expirado'],
      datasets: [
        {
          data: [this.totalAdquirido, this.totalUsado, this.totalExpirado],
          label: 'Cupones',
          backgroundColor: ['#2196f3', '#4caf50', '#f44336']
        }
      ]
    }

    // Pie chart - discount ranges
    const ranges = [0, 0, 0, 0] // <25, 25-50, 50-75, >75
    for (const t of transactions) {
      const d = t.coupon?.discount ?? 0
      if (d < 25) ranges[0]++
      else if (d < 50) ranges[1]++
      else if (d < 75) ranges[2]++
      else ranges[3]++
    }

    this.pieData = {
      labels: ['< 25%', '25% – 50%', '50% – 75%', '> 75%'],
      datasets: [
        {
          data: ranges,
          backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#9c27b0']
        }
      ]
    }

    this.buildRoi(transactions)
  }

  // ROI: la "primera visita" de cada vecino se calcula sobre TODO el
  // histórico (this.allTransactions), no sobre el rango filtrado — si no,
  // un vecino que ya había venido antes del filtro parecería "nuevo" al
  // volver a canjear dentro del rango.
  private buildRoi(transactions: any[]): void {
    const usadosHistorico = this.allTransactions.filter(t => t.status === 'USADO' && t.redeemDate)
    const firstVisitByNeighbor = new Map<string, number>()
    for (const t of usadosHistorico) {
      const neighborId = t.neighbor?.id
      if (!neighborId) continue
      const ts = new Date(t.redeemDate).getTime()
      const current = firstVisitByNeighbor.get(neighborId)
      if (current == null || ts < current) firstVisitByNeighbor.set(neighborId, ts)
    }

    const usados = transactions.filter(t => t.status === 'USADO' && t.redeemDate)
    const isFirstVisit = (t: any): boolean =>
      firstVisitByNeighbor.get(t.neighbor?.id) === new Date(t.redeemDate).getTime()

    this.uniqueNeighbors = new Set(usados.map(t => t.neighbor?.id)).size
    this.newNeighbors = usados.filter(isFirstVisit).length
    this.avgVisitsPerNeighbor = this.uniqueNeighbors > 0 ? usados.length / this.uniqueNeighbors : 0

    const byCouponMap = new Map<
      string,
      {
        couponId: string
        title: string
        redemptions: number
        neighbors: Set<string>
        newNeighbors: number
        pointsSpent: number
      }
    >()
    for (const t of usados) {
      const couponId = t.coupon?.id ?? 'sin-cupon'
      const entry = byCouponMap.get(couponId) ?? {
        couponId,
        title: t.coupon?.title ?? 'Cupón eliminado',
        redemptions: 0,
        neighbors: new Set<string>(),
        newNeighbors: 0,
        pointsSpent: 0
      }
      entry.redemptions++
      if (t.neighbor?.id) entry.neighbors.add(t.neighbor.id)
      entry.pointsSpent += t.costInPoints ?? 0
      if (isFirstVisit(t)) entry.newNeighbors++
      byCouponMap.set(couponId, entry)
    }

    this.byCoupon = Array.from(byCouponMap.values())
      .map(({ neighbors, ...rest }) => ({ ...rest, uniqueNeighbors: neighbors.size }))
      .sort((a, b) => b.newNeighbors - a.newNeighbors)
  }
}
