import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { NgChartsModule } from 'ng2-charts'
import { Chart, registerables } from 'chart.js'
import { ChartData, ChartOptions } from 'chart.js'
import { StatisticsService } from '../../services/statistics/statistics.service'
import type { NeighborDelivery } from '../../services/interfaces/statistics'

Chart.register(...registerables)

@Component({
  selector: 'app-mis-reciclados',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, NgChartsModule],
  templateUrl: './mis-reciclados.component.html',
  styleUrl: './mis-reciclados.component.scss'
})
export class MisRecicladosComponent implements OnInit {
  deliveries: NeighborDelivery[] = []
  id = ''

  totalWeight = 0
  totalPoints = 0
  totalTransactions = 0

  dateFrom = ''
  dateTo = ''

  pieData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] }
  pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' }
    }
  }

  barData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Kg reciclados' }] }
  barOptions: ChartOptions<'bar'> = {
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
  barChartWidth = '100%'

  constructor(private statsService: StatisticsService) {}

  ngOnInit(): void {
    const info = localStorage.getItem('usuarioInfo') || ''
    const userInfo = JSON.parse(info)
    this.id = userInfo.id
    this.loadDeliveries()
  }

  loadDeliveries(): void {
    const from = this.dateFrom || undefined
    const to = this.dateTo || undefined
    this.statsService.getNeighborDeliveries(this.id, from, to).subscribe((res: any) => {
      this.deliveries = res.data ?? []
      this.buildStats()
    })
  }

  applyGlobalFilter(): void {
    this.loadDeliveries()
  }

  clearGlobalFilter(): void {
    this.dateFrom = ''
    this.dateTo = ''
    this.loadDeliveries()
  }

  buildStats(): void {
    this.totalWeight = 0
    this.totalPoints = 0
    this.totalTransactions = 0

    const categoryMap = new Map<string, number>()

    for (const delivery of this.deliveries) {
      this.totalPoints += delivery.totalPoints
      this.totalTransactions++
      for (const detail of delivery.details) {
        this.totalWeight += detail.weight
        const current = categoryMap.get(detail.categoryName) ?? 0
        categoryMap.set(detail.categoryName, current + detail.weight)
      }
    }

    const colors = ['#4caf50', '#ff9800', '#2196f3', '#f44336', '#9c27b0', '#00bcd4', '#ffeb3b', '#795548']

    this.pieData = {
      labels: Array.from(categoryMap.keys()),
      datasets: [
        {
          data: Array.from(categoryMap.values()),
          backgroundColor: colors.slice(0, categoryMap.size)
        }
      ]
    }

    // Bar chart - kg per month
    const monthMap = new Map<string, number>()
    for (const delivery of this.deliveries) {
      const date = new Date(delivery.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const weight = delivery.details.reduce((sum, d) => sum + d.weight, 0)
      monthMap.set(key, (monthMap.get(key) ?? 0) + weight)
    }

    const sortedMonths = Array.from(monthMap.keys()).sort()
    const monthLabels = sortedMonths.map(m => {
      const [year, month] = m.split('-').map(Number)
      return new Date(year, month - 1).toLocaleDateString('es-AR', { year: 'numeric', month: 'short' })
    })

    if (sortedMonths.length > 6) {
      this.barChartWidth = `${sortedMonths.length * 80}px`
    } else {
      this.barChartWidth = '100%'
    }

    this.barData = {
      labels: monthLabels,
      datasets: [
        {
          data: sortedMonths.map(m => monthMap.get(m) ?? 0),
          label: 'Kg reciclados',
          backgroundColor: '#4caf50'
        }
      ]
    }
  }
}
