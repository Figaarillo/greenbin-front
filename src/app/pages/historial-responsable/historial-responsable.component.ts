import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { NgChartsModule } from 'ng2-charts'
import { Chart, registerables, ChartData, ChartOptions } from 'chart.js'
import { WasteDeliveryService } from '../../services/WasteDelivery/waste-delivery.service'
import { SesionService } from '../../services/sesion/sesion.service'

Chart.register(...registerables)

@Component({
  selector: 'app-historial-responsable',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, NgChartsModule],
  templateUrl: './historial-responsable.component.html',
  styleUrl: './historial-responsable.component.scss'
})
export class HistorialResponsableComponent implements OnInit {
  allTransactions: any[] = []
  transactions: any[] = []

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

  constructor(
    private wasteDeliveryService: WasteDeliveryService,
    private sesionService: SesionService
  ) {}

  ngOnInit(): void {
    const responsibleId = this.sesionService.getUserId()
    this.wasteDeliveryService.listByResponsible(responsibleId).subscribe({
      next: (resp: any) => {
        this.allTransactions = resp.data ?? []
        this.applyFilterAndBuild()
      },
      error: () => {}
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
    this.transactions = this.allTransactions.filter(tx => {
      const ts = new Date(tx.date).getTime()
      if (from != null && ts < from) return false
      if (to != null && ts > to) return false
      return true
    })
    this.buildStats()
  }

  buildStats(): void {
    this.totalWeight = 0
    this.totalPoints = 0
    this.totalTransactions = 0

    const categoryMap = new Map<string, number>()

    for (const tx of this.transactions) {
      this.totalPoints += tx.totalPoints
      this.totalTransactions++

      for (const detail of tx.transactionDetails || []) {
        const weight = detail.weight ?? 0
        this.totalWeight += weight

        const categoryName = detail.waste?.category?.name ?? 'Sin categoría'
        categoryMap.set(categoryName, (categoryMap.get(categoryName) ?? 0) + weight)
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
    for (const tx of this.transactions) {
      const date = new Date(tx.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const weight = (tx.transactionDetails || []).reduce((sum: number, d: any) => sum + (d.weight ?? 0), 0)
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
