import { Component, OnInit } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { RouterModule, Router } from '@angular/router'
import { SesionService } from '../../services/sesion/sesion.service'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { PuntoVerdeService } from '../../services/punto-verde/punto-verde.service'
import { WasteDeliveryService } from '../../services/WasteDelivery/waste-delivery.service'
import { PuntoVerde } from '../../services/interfaces/punto-verde'
import Swal from 'sweetalert2'
import { CommonModule, DatePipe } from '@angular/common'

@Component({
  selector: 'app-landing-responsable',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatSidenavModule,
    MatToolbarModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    SidenavComponent,
    RouterModule,
    CommonModule,
    DatePipe
  ],
  templateUrl: './landing-responsable.component.html',
  styleUrl: './landing-responsable.component.scss'
})
export class LandingResponsableComponent implements OnInit {
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
    const entidadInfo = JSON.parse(localStorage.getItem('entidadInfo') || '{}')
    this.pvService.list(entidadInfo.id).subscribe((res: any) => {
      this.listPtoVerde = res
    })
    const ptoVerdeSeleccionado = localStorage.getItem('puntoVerde') || ''
    this.pvSelec = ptoVerdeSeleccionado
    this.ptoVerde = new FormControl(ptoVerdeSeleccionado)
  }

  ngOnInit(): void {
    const responsibleId = this.sesionService.getUserId()
    this.wasteDeliveryService.listByResponsible(responsibleId).subscribe((resp: any) => {
      this.historial = (resp.data || [])
        .map((t: any) => ({
          descripcion: `Entrega de ${t.neighbor?.firstname} ${t.neighbor?.lastname} en ${t.greenPoint?.name ?? 'Punto Verde'}`,
          puntos: t.totalPoints,
          fecha: t.date
        }))
        .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      this.historialVisible = this.historial.slice(0, this.LIMITE)
    })
  }

  toggleHistorial() {
    this.mostrarTodo = !this.mostrarTodo
    this.historialVisible = this.mostrarTodo ? this.historial : this.historial.slice(0, this.LIMITE)
  }

  onChange(event: any) {
    localStorage.setItem('puntoVerde', event.value)
    this.pvSelec = event.value
  }

  editResponsible() {
    this.router.navigate(['/modificar-responsable', this.sesionService.getUserId()])
  }

  routeEntrega() {
    if (this.pvSelec != '') {
      this.router.navigate(['/entrega'])
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
