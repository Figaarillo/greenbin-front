import { StorageService } from '../../services/storage/storage.service'
import { Component, inject, OnInit } from '@angular/core'
import { MatSidenavModule } from '@angular/material/sidenav'
import { Router, RouterModule } from '@angular/router'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NgChartsModule } from 'ng2-charts'
import { Chart, registerables } from 'chart.js'
import { ChartData, ChartOptions } from 'chart.js'
import { EntidadService } from '../../services/entidad/entidad.service'
import { StatisticsService } from '../../services/statistics/statistics.service'
import type {
  TotalRecycled,
  GreenPointRanking,
  WasteByCategory,
  WasteByPeriod
} from '../../services/interfaces/statistics'

Chart.register(...registerables)

@Component({
  selector: 'app-entidad-dashboard',
  standalone: true,
  imports: [MatSidenavModule, RouterModule, CommonModule, FormsModule, NgChartsModule],
  templateUrl: './entidad-dashboard.component.html',
  styleUrl: './entidad-dashboard.component.scss'
})
export class EntidadDashboardComponent implements OnInit {
  private storage = inject(StorageService)
  name = ''
  email = ''
  entidadId = ''
  router = inject(Router)
  entidadServ = inject(EntidadService)
  statsServ = inject(StatisticsService)

  // Summary cards
  totalWeight = 0
  totalPoints = 0
  totalTransactions = 0

  // Date filters for period chart
  dateFrom = ''
  dateTo = ''

  // Pie chart - Waste by category
  pieData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] }
  pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  }

  // Bar chart - Green points ranking
  rankingData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Kg recolectados' }] }
  rankingOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  }

  // Bar chart - Waste by period
  periodData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Kg reciclados' }] }
  periodOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    datasets: {
      bar: {
        barPercentage: 0.4,
        categoryPercentage: 0.5
      }
    }
  }
  periodChartWidth = '100%'

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
    this.loadAllStats()
  }

  loadAllStats(): void {
    const from = this.dateFrom || undefined
    const to = this.dateTo || undefined
    this.loadTotalRecycled(from, to)
    this.loadRanking(from, to)
    this.loadByCategory(from, to)
    this.loadByPeriod(from, to)
  }

  loadTotalRecycled(from?: string, to?: string): void {
    this.statsServ.getTotalRecycled(this.entidadId, from, to).subscribe((res: any) => {
      const data: TotalRecycled = res.data
      this.totalWeight = data.totalWeight
      this.totalPoints = data.totalPoints
      this.totalTransactions = data.totalTransactions
    })
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
            backgroundColor: '#4caf50'
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
            backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#f44336', '#9c27b0', '#00bcd4', '#ffeb3b', '#795548']
          }
        ]
      }
    })
  }

  loadByPeriod(from?: string, to?: string): void {
    this.statsServ.getWasteByPeriod(this.entidadId, 'month', from, to).subscribe((res: any) => {
      const data: WasteByPeriod[] = res.data
      const monthCount = data.length
      if (monthCount > 6) {
        const widthPerMonth = 80
        this.periodChartWidth = `${monthCount * widthPerMonth}px`
      } else {
        this.periodChartWidth = '100%'
      }
      this.periodData = {
        labels: data.map(d => this.formatPeriod(d.period)),
        datasets: [
          {
            data: data.map(d => d.totalWeight),
            label: 'Kg reciclados',
            backgroundColor: '#2196f3'
          }
        ]
      }
    })
  }

  applyGlobalFilter(): void {
    this.loadAllStats()
  }

  clearGlobalFilter(): void {
    this.dateFrom = ''
    this.dateTo = ''
    this.loadAllStats()
  }

  formatPeriod(period: string): string {
    const [yearMonth] = period.split(/[ T]/)
    const [year, month] = yearMonth.split('-').map(Number)
    const date = new Date(year, month - 1)
    return date.toLocaleDateString('es-AR', { year: 'numeric', month: 'short' })
  }

  logOut(): void {
    this.storage.removeItem('accessToken')
    this.storage.removeItem('refreshToken')
    this.storage.setItem('respoEdit', 'false')
    this.router.navigateByUrl('/login-admin')
  }
}
