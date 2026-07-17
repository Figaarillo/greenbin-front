import { StorageService } from '../../services/storage/storage.service'
import { inject, Component, DestroyRef, OnInit, PLATFORM_ID } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router'
import { BreakpointObserver } from '@angular/cdk/layout'
import { filter } from 'rxjs'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component'
import { NotificationPanelComponent } from '../../components/notification-panel/notification-panel.component'
import { AnimatedNumberComponent } from '../../components/animated-number/animated-number.component'
import { VecinoService } from '../../services/vecino/vecino.service'
import { StatisticsService } from '../../services/statistics/statistics.service'
import { SesionService } from '../../services/sesion/sesion.service'
import { RealtimeService } from '../../services/notification/realtime.service'
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common'
import { SkeletonComponent } from '../../components/skeleton/skeleton.component'

@Component({
  selector: 'app-landing-vecino',
  standalone: true,
  imports: [
    MatIconModule,
    PageHeaderComponent,
    NotificationBellComponent,
    NotificationPanelComponent,
    AnimatedNumberComponent,
    RouterModule,
    CommonModule,
    DatePipe,
    SkeletonComponent
  ],
  templateUrl: './landing-vecino.component.html',
  styleUrl: './landing-vecino.component.scss'
})
export class LandingVecinoComponent implements OnInit {
  private storage = inject(StorageService)
  private platformId = inject(PLATFORM_ID)
  private sesionService = inject(SesionService)
  private realtimeService = inject(RealtimeService)
  private destroyRef = inject(DestroyRef)
  loading = true
  title = 'GreenBin'
  id = ''
  readonly puntos = this.sesionService.points
  name = ''
  historial: any[] = []
  historialVisible: any[] = []
  mostrarTodo: boolean = false
  LIMITE = 5
  isDesktop = false
  mesKg = 0
  mesPuntos = 0
  mesEntregas = 0
  mesLoading = true

  constructor(
    private vecinoServ: VecinoService,
    private statisticsService: StatisticsService,
    private breakpointObserver: BreakpointObserver
  ) {
    const info = this.storage.getItem('usuarioInfo') || '{}'
    const usuarioInfo = JSON.parse(info)
    this.name = usuarioInfo.firstname
    this.id = usuarioInfo.id
  }

  ngOnInit(): void {
    // En pantallas anchas el sidenav queda fijo y desplegado; en mobile es drawer.
    this.breakpointObserver.observe('(min-width: 960px)').subscribe(result => {
      this.isDesktop = result.matches
    })

    // El fetch corre solo en el navegador: en SSR loading queda true y el
    // servidor renderiza el skeleton de la lista.
    if (!isPlatformBrowser(this.platformId)) return

    this.vecinoServ.get(this.id).subscribe((resp: any) => {
      this.sesionService.setPoints(String(resp.data.points))
    })

    // Cuando el responsable registra una entrega, el saldo sube en vivo (con
    // animación) sin que el vecino tenga que recargar la página.
    this.realtimeService.events$
      .pipe(
        filter(event => event.category === 'POINTS_DELIVERED'),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => {
        const totalPoints = event.data?.['totalPoints']
        if (typeof totalPoints === 'number') {
          this.sesionService.setPoints(String(totalPoints))
        }
      })

    this.vecinoServ.getMyTransactions(this.id).subscribe({
      next: (resp: any) => {
        const cupones = (resp.data || []).map((t: any) => ({
          tipo: 'cupon',
          descripcion: `Canje cupón "${t.coupon?.title}"`,
          puntos: -t.costInPoints,
          fecha: t.adquisitionDate ?? t.createdAt
        }))
        this.historial = [...cupones].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        this.historialVisible = this.historial.slice(0, this.LIMITE)
        this.loading = false
      },
      error: () => (this.loading = false)
    })

    const primerDiaDelMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    this.statisticsService.getNeighborDeliveries(this.id, primerDiaDelMes.toISOString()).subscribe({
      next: (resp: any) => {
        const deliveries = resp.data || []
        this.mesEntregas = deliveries.length
        this.mesPuntos = deliveries.reduce((sum: number, d: any) => sum + d.totalPoints, 0)
        this.mesKg = deliveries.reduce(
          (sum: number, d: any) => sum + d.details.reduce((s: number, det: any) => s + det.weight, 0),
          0
        )
        this.mesLoading = false
      },
      error: () => (this.mesLoading = false)
    })

    this.vecinoServ.getMyWasteTransactions(this.id).subscribe({
      next: (resp: any) => {
        const residuos = (resp.data || []).map((t: any) => ({
          tipo: 'residuo',
          descripcion: `Entrega en ${t.greenPoint?.name ?? 'Punto Verde'}`,
          puntos: t.totalPoints,
          fecha: t.date
        }))
        this.historial = [...this.historial, ...residuos].sort(
          (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        )
        this.historialVisible = this.historial.slice(0, this.LIMITE)
        this.loading = false
      },
      error: () => (this.loading = false)
    })
  }

  toggleHistorial() {
    this.mostrarTodo = !this.mostrarTodo
    this.historialVisible = this.mostrarTodo ? this.historial : this.historial.slice(0, this.LIMITE)
  }
}
