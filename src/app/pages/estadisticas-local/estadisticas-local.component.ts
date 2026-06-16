import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { NgChartsModule } from 'ng2-charts'
import { Chart, registerables, ChartData, ChartOptions } from 'chart.js'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { NavbarComponent } from '../../components/navbar/navbar.component'

Chart.register(...registerables)

@Component({
  selector: 'app-estadisticas-local',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule, NgChartsModule, NavbarComponent],
  templateUrl: './estadisticas-local.component.html',
  styleUrl: './estadisticas-local.component.scss'
})
export class EstadisticasLocalComponent implements OnInit {
  private rewardPartnerId = ''
  private allTransactions: any[] = []

  dateFrom = ''
  dateTo = ''
  hasData = false

  // KPI cards
  totalAdquirido = 0
  totalUsado = 0
  totalExpirado = 0
  totalPuntos = 0

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
    const info = localStorage.getItem('usuarioInfo') || ''
    this.rewardPartnerId = JSON.parse(info).id
    this.loadData()
  }

  loadData(): void {
    this.localService.getCouponTransactions(this.rewardPartnerId).subscribe((resp: any) => {
      this.allTransactions = resp.data ?? []
      this.applyFilterAndBuild()
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
  }
}
