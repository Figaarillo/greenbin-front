import { StorageService } from '../../services/storage/storage.service'
import { inject, Component, OnInit, PLATFORM_ID } from '@angular/core'
import { CommonModule, isPlatformBrowser } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { SkeletonComponent } from '../../components/skeleton/skeleton.component'
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component'
import { NotificationPanelComponent } from '../../components/notification-panel/notification-panel.component'

type RangeKey = '7d' | '30d' | '90d' | '1y' | 'custom'

interface CouponRow {
  couponId: string
  title: string
  total: number
  redemptions: number
  uniqueNeighbors: number
  newNeighbors: number
  pointsSpent: number
  conversion: number
}

interface FunnelRow {
  key: string
  label: string
  hint: string
  value: number
  pct: number
  color: string
}

interface RangeRow {
  label: string
  value: number
  pct: number
  color: string
}

const DAY_MS = 86400000

// Estados de cupón: paleta de STATUS. Los estados se separan por LUMINOSIDAD
// además de por tono — verde y rojo con la misma claridad son indistinguibles
// en deuteranopía (el par original daba ΔE 4,1; este da 8,7).
// El ámbar queda en 2:1 contra la superficie, por eso toda marca lleva su valor
// escrito al lado y la tarjeta ofrece vista de tabla.
const ST_TOTAL = '#243330'
const ST_USADO = '#2f8f63'
const ST_SIN_USAR = '#e0b04a'
const ST_VENCIDO = '#8f3540'

// Los rangos de descuento son categorías ORDENADAS: rampa de un solo tono
// claro→oscuro (luminosidad monótona verificada).
//
// Es azul y no verde a propósito: en verde se confundía con el estado "usados"
// del embudo, y en ámbar sumaba amarillo sobre el acento del local. Neutra, no
// compite con ninguno de los dos roles (ΔE 15,4 contra el verde de estado).
const SEQ = ['#e4e8f4', '#b0bfe0', '#6c81b0', '#3b4d76']

@Component({
  selector: 'app-estadisticas-local',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatIconModule,
    NavbarComponent,
    SkeletonComponent,
    NotificationBellComponent,
    NotificationPanelComponent
  ],
  templateUrl: './estadisticas-local.component.html',
  styleUrl: './estadisticas-local.component.scss'
})
export class EstadisticasLocalComponent implements OnInit {
  private storage = inject(StorageService)
  private platformId = inject(PLATFORM_ID)
  private route = inject(ActivatedRoute)
  private rewardPartnerId = ''
  loading = true
  error = false

  /** true cuando entra por la ruta de entidad (viendo el ROI de un local ajeno). */
  viewingAsEntity = false
  navTitle = 'Mi retorno'
  navBackRoute = '/local'

  // ── Filtro de período ──
  selectedRange: RangeKey = '90d'
  dateFrom = ''
  dateTo = ''
  rangeLabel = ''
  hasData = false

  // ── Totales ──
  totalAdquirido = 0
  totalUsado = 0
  totalExpirado = 0
  totalPuntos = 0
  totalCanjeado = 0

  // ── ROI: valor de negocio para el local (clientes, no sólo cupones) ──
  uniqueNeighbors = 0
  newNeighbors = 0
  recurringNeighbors = 0
  newNeighborsPct = 0
  avgVisitsPerNeighbor = 0

  // ── Embudo ──
  funnel: FunnelRow[] = []
  /** Porcentaje de lo canjeado que terminó en una visita al local. */
  conversion = 0
  showFunnelTable = false

  // ── Rangos de descuento (ordenados) ──
  discountRows: RangeRow[] = []
  hasDiscounts = false

  byCoupon: CouponRow[] = []

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

  setRange(range: RangeKey): void {
    this.selectedRange = range
    if (range !== 'custom') this.loadData()
  }

  applyCustomRange(): void {
    if (this.dateFrom || this.dateTo) this.loadData()
  }

  toggleFunnelTable(): void {
    this.showFunnelTable = !this.showFunnelTable
  }

  loadData(): void {
    this.loading = true
    this.error = false
    const { from, to } = this.currentWindow()
    this.updateRangeLabel(from, to)

    this.localService.getRewardPartnerStats(this.rewardPartnerId, from, to).subscribe({
      next: (resp: any) => {
        this.applyStats(resp.data)
        this.loading = false
      },
      error: () => {
        this.error = true
        this.loading = false
      }
    })
  }

  /**
   * Se mandan instantes exactos resueltos en la zona del usuario. Usar
   * `toISOString()` sobre una fecha suelta la convierte a UTC y corre el rango
   * un día; y un `to` a medianoche descarta todo lo del día en curso.
   */
  private currentWindow(): { from?: string; to?: string } {
    if (this.selectedRange === 'custom') {
      return {
        from: this.dateFrom ? this.startOfDay(this.dateFrom) : undefined,
        to: this.dateTo ? this.endOfDay(this.dateTo) : undefined
      }
    }
    const days: Record<Exclude<RangeKey, 'custom'>, number> = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }
    const now = new Date()
    const from = new Date(now.getTime() - days[this.selectedRange] * DAY_MS)
    from.setHours(0, 0, 0, 0)
    const to = new Date(now)
    to.setHours(23, 59, 59, 999)
    return { from: from.toISOString(), to: to.toISOString() }
  }

  private startOfDay(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d, 0, 0, 0, 0).toISOString()
  }

  private endOfDay(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number)
    return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString()
  }

  private updateRangeLabel(from?: string, to?: string): void {
    if (!from || !to) {
      this.rangeLabel = 'Todo el historial'
      return
    }
    const fmt = (iso: string) =>
      new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
    this.rangeLabel = `${fmt(from)} – ${fmt(to)}`
  }

  private applyStats(stats: any): void {
    this.totalAdquirido = stats.totalAdquirido ?? 0
    this.totalUsado = stats.totalUsado ?? 0
    this.totalExpirado = stats.totalExpirado ?? 0
    this.totalPuntos = stats.totalPuntos ?? 0
    this.totalCanjeado = this.totalAdquirido + this.totalUsado + this.totalExpirado
    this.hasData = this.totalCanjeado > 0

    this.uniqueNeighbors = stats.uniqueNeighbors ?? 0
    this.newNeighbors = stats.newNeighbors ?? 0
    this.recurringNeighbors = Math.max(this.uniqueNeighbors - this.newNeighbors, 0)
    this.newNeighborsPct = this.uniqueNeighbors > 0 ? Math.round((this.newNeighbors / this.uniqueNeighbors) * 100) : 0
    this.avgVisitsPerNeighbor = stats.avgVisitsPerNeighbor ?? 0
    this.conversion = this.totalCanjeado > 0 ? Math.round((this.totalUsado / this.totalCanjeado) * 100) : 0

    const pct = (value: number): number => (this.totalCanjeado > 0 ? (value / this.totalCanjeado) * 100 : 0)
    this.funnel = [
      {
        key: 'canjeados',
        label: 'Canjeados',
        hint: 'Cupones que los vecinos compraron con sus puntos',
        value: this.totalCanjeado,
        pct: 100,
        color: ST_TOTAL
      },
      {
        key: 'usados',
        label: 'Usados',
        hint: 'El vecino presentó el cupón en el local',
        value: this.totalUsado,
        pct: pct(this.totalUsado),
        color: ST_USADO
      },
      {
        key: 'sinusar',
        label: 'Sin usar',
        hint: 'Canjeados y todavía vigentes, sin presentar',
        value: this.totalAdquirido,
        pct: pct(this.totalAdquirido),
        color: ST_SIN_USAR
      },
      {
        key: 'vencidos',
        label: 'Vencidos',
        hint: 'Expiraron antes de que el vecino los usara',
        value: this.totalExpirado,
        pct: pct(this.totalExpirado),
        color: ST_VENCIDO
      }
    ]

    const ranges = stats.discountRanges ?? { lt25: 0, from25to50: 0, from50to75: 0, gt75: 0 }
    const values = [ranges.lt25 ?? 0, ranges.from25to50 ?? 0, ranges.from50to75 ?? 0, ranges.gt75 ?? 0]
    const maxRange = Math.max(...values, 1)
    this.hasDiscounts = values.some(v => v > 0)
    this.discountRows = ['Menor a 25%', '25% – 50%', '50% – 75%', 'Mayor a 75%'].map((label, i) => ({
      label,
      value: values[i],
      pct: (values[i] / maxRange) * 100,
      color: SEQ[i]
    }))

    this.byCoupon = ((stats.byCoupon ?? []) as CouponRow[]).map(c => ({
      ...c,
      conversion: c.total > 0 ? Math.round((c.redemptions / c.total) * 100) : 0
    }))
  }

  /** Semáforo de la conversión por cupón: acompaña al número, no lo reemplaza. */
  conversionClass(pct: number): string {
    if (pct >= 65) return 'good'
    if (pct >= 45) return 'mid'
    return 'low'
  }
}
