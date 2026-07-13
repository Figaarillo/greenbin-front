import { StorageService } from '../../services/storage/storage.service'
import { inject, Component, OnInit, PLATFORM_ID } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatDividerModule } from '@angular/material/divider'
import { MatToolbarModule } from '@angular/material/toolbar'
import { RouterModule } from '@angular/router'
import { BreakpointObserver } from '@angular/cdk/layout'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component'
import { NotificationPanelComponent } from '../../components/notification-panel/notification-panel.component'
import { VecinoService } from '../../services/vecino/vecino.service'
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common'
import { SkeletonComponent } from '../../components/skeleton/skeleton.component'

@Component({
  selector: 'app-landing-vecino',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatToolbarModule,
    SidenavComponent,
    PageHeaderComponent,
    NotificationBellComponent,
    NotificationPanelComponent,
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
  loading = true
  title = 'GreenBin'
  id = ''
  puntos: string = ''
  name = ''
  historial: any[] = []
  historialVisible: any[] = []
  mostrarTodo: boolean = false
  LIMITE = 5
  isDesktop = false

  constructor(
    private vecinoServ: VecinoService,
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
      this.puntos = resp.data.points
      this.storage.setItem('points', this.puntos)
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
