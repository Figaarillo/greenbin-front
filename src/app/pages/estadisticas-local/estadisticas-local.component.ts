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
    const from = this.dateFrom ? new Date(this.dateFrom).toISOString() : undefined
    const to = this.dateTo ? new Date(this.dateTo + 'T23:59:59').toISOString() : undefined

    this.localService.getRewardPartnerStats(this.rewardPartnerId, from, to).subscribe({
      next: (resp: any) => {
        this.applyStats(resp.data)
        this.loading = false
      },
      error: () => (this.loading = false)
    })
  }

  applyGlobalFilter(): void {
    this.loadData()
  }

  clearGlobalFilter(): void {
    this.dateFrom = ''
    this.dateTo = ''
    this.loadData()
  }

  private applyStats(stats: any): void {
    this.hasData = stats.totalAdquirido + stats.totalUsado + stats.totalExpirado > 0

    this.totalAdquirido = stats.totalAdquirido
    this.totalUsado = stats.totalUsado
    this.totalExpirado = stats.totalExpirado
    this.totalPuntos = stats.totalPuntos
    this.uniqueNeighbors = stats.uniqueNeighbors
    this.newNeighbors = stats.newNeighbors
    this.avgVisitsPerNeighbor = stats.avgVisitsPerNeighbor
    this.byCoupon = stats.byCoupon

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

    this.pieData = {
      labels: ['< 25%', '25% – 50%', '50% – 75%', '> 75%'],
      datasets: [
        {
          data: [
            stats.discountRanges.lt25,
            stats.discountRanges.from25to50,
            stats.discountRanges.from50to75,
            stats.discountRanges.gt75
          ],
          backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#9c27b0']
        }
      ]
    }
  }
}
