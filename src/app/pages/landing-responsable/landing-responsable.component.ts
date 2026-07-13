import { StorageService } from '../../services/storage/storage.service'
import { inject, Component, OnInit, PLATFORM_ID } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatSelectModule } from '@angular/material/select'
import { MatToolbarModule } from '@angular/material/toolbar'
import { RouterModule, Router } from '@angular/router'
import { SesionService } from '../../services/sesion/sesion.service'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { PuntoVerdeService } from '../../services/punto-verde/punto-verde.service'
import { WasteDeliveryService } from '../../services/WasteDelivery/waste-delivery.service'
import { PuntoVerde } from '../../services/interfaces/punto-verde'
import Swal from 'sweetalert2'
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common'
import { SkeletonComponent } from '../../components/skeleton/skeleton.component'
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component'
import { NotificationPanelComponent } from '../../components/notification-panel/notification-panel.component'

@Component({
  selector: 'app-landing-responsable',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatToolbarModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    SidenavComponent,
    RouterModule,
    CommonModule,
    DatePipe,
    SkeletonComponent,
    NotificationBellComponent,
    NotificationPanelComponent
  ],
  templateUrl: './landing-responsable.component.html',
  styleUrl: './landing-responsable.component.scss'
})
export class LandingResponsableComponent implements OnInit {
  private storage = inject(StorageService)
  private platformId = inject(PLATFORM_ID)
  loading = true
  listPtoVerde: PuntoVerde[] = []
  ptoVerde = new FormControl()
  nombre: string = ''
  pvSelec: string = ''
  historial: any[] = []
  historialVisible: any[] = []
  mostrarTodo: boolean = false
  LIMITE = 5

  constructor(
    private router: Router,
    private sesionService: SesionService,
    private pvService: PuntoVerdeService,
    private wasteDeliveryService: WasteDeliveryService
  ) {
    this.nombre = this.formatearNombre(this.sesionService.getFirstname())
    const entidadInfo = JSON.parse(this.storage.getItem('entidadInfo') || '{}')
    if (isPlatformBrowser(this.platformId)) {
      this.pvService.list(entidadInfo.id).subscribe((res: any) => {
        this.listPtoVerde = res ?? []
      })
    }
    const ptoVerdeSeleccionado = this.storage.getItem('puntoVerde') || ''
    this.pvSelec = ptoVerdeSeleccionado
    this.ptoVerde = new FormControl(ptoVerdeSeleccionado)
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return
    const responsibleId = this.sesionService.getUserId()
    this.wasteDeliveryService.listByResponsible(responsibleId).subscribe({
      next: (resp: any) => {
        this.historial = (resp.data || [])
          .map((t: any) => ({
            descripcion: `Entrega de ${t.neighbor?.firstname} ${t.neighbor?.lastname} en ${t.greenPoint?.name ?? 'Punto Verde'}`,
            puntos: t.totalPoints,
            fecha: t.date
          }))
          .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
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

  onChange(event: any) {
    this.storage.setItem('puntoVerde', event.value)
    this.pvSelec = event.value
  }

  editResponsible() {
    this.router.navigate(['/responsable/modificar-responsable', this.sesionService.getUserId()])
  }

  routeEntrega() {
    if (this.pvSelec != '') {
      this.router.navigate(['/responsable/entrega'])
    } else {
      Swal.fire({
        title: 'Tienes que seleccionar un punto verde.',
        icon: 'error'
      })
    }
  }

  formatearNombre(value: string): string {
    if (!value) return ''
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  }
}
