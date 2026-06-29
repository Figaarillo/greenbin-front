import { StorageService } from '../../services/storage/storage.service'
import { inject, Component, OnInit, ViewChild } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatDividerModule } from '@angular/material/divider'
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { Router, RouterModule } from '@angular/router'
import { BreakpointObserver } from '@angular/cdk/layout'
import { SesionService } from '../../services/sesion/sesion.service'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'
import { VecinoService } from '../../services/vecino/vecino.service'
import { CommonModule, DatePipe } from '@angular/common'

@Component({
  selector: 'app-landing-vecino',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatSidenavModule,
    MatToolbarModule,
    SidenavComponent,
    PageHeaderComponent,
    RouterModule,
    CommonModule,
    DatePipe
  ],
  templateUrl: './landing-vecino.component.html',
  styleUrl: './landing-vecino.component.scss'
})
export class LandingVecinoComponent implements OnInit {
  private storage = inject(StorageService)
  title = 'GreenBin'
  @ViewChild(MatSidenav, { static: true })
  sidenav!: MatSidenav
  id = ''
  puntos: string = ''
  name = ''
  historial: any[] = []
  historialVisible: any[] = []
  mostrarTodo: boolean = false
  LIMITE = 5
  isDesktop = false

  constructor(
    private router: Router,
    private sesionService: SesionService,
    private vecinoServ: VecinoService,
    private breakpointObserver: BreakpointObserver
  ) {
    const info = this.storage.getItem('usuarioInfo') || ''
    const usuarioInfo = JSON.parse(info)
    this.name = usuarioInfo.firstname
    this.id = usuarioInfo.id
  }

  ngOnInit(): void {
    // En pantallas anchas el sidenav queda fijo y desplegado; en mobile es drawer.
    this.breakpointObserver.observe('(min-width: 960px)').subscribe(result => {
      this.isDesktop = result.matches
    })

    this.vecinoServ.get(this.id).subscribe((resp: any) => {
      this.puntos = resp.data.points
      this.storage.setItem('points', this.puntos)
    })

    this.vecinoServ.getMyTransactions(this.id).subscribe((resp: any) => {
      const cupones = (resp.data || []).map((t: any) => ({
        tipo: 'cupon',
        descripcion: `Canje cupón "${t.coupon?.title}"`,
        puntos: -t.costInPoints,
        fecha: t.adquisitionDate ?? t.createdAt
      }))
      this.historial = [...cupones].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      this.historialVisible = this.historial.slice(0, this.LIMITE)
    })

    this.vecinoServ.getMyWasteTransactions(this.id).subscribe((resp: any) => {
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
    })
  }

  toggleHistorial() {
    this.mostrarTodo = !this.mostrarTodo
    this.historialVisible = this.mostrarTodo ? this.historial : this.historial.slice(0, this.LIMITE)
  }
}
