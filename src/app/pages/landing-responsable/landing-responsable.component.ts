import { StorageService } from '../../services/storage/storage.service'
import { inject, Component, OnInit, PLATFORM_ID } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatSelectModule } from '@angular/material/select'
import { SesionService } from '../../services/sesion/sesion.service'
import { PuntoVerdeService } from '../../services/punto-verde/punto-verde.service'
import { WasteDeliveryService } from '../../services/WasteDelivery/waste-delivery.service'
import { StatisticsService } from '../../services/statistics/statistics.service'
import { PuntoVerde } from '../../services/interfaces/punto-verde'
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common'
import { SkeletonComponent } from '../../components/skeleton/skeleton.component'
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component'
import { NotificationPanelComponent } from '../../components/notification-panel/notification-panel.component'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'

@Component({
  selector: 'app-landing-responsable',
  standalone: true,
  imports: [
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    DatePipe,
    SkeletonComponent,
    NotificationBellComponent,
    NotificationPanelComponent,
    PageHeaderComponent
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
  topVecinos: any[] = []

  constructor(
    private sesionService: SesionService,
    private pvService: PuntoVerdeService,
    private wasteDeliveryService: WasteDeliveryService,
    private statisticsService: StatisticsService
  ) {
    this.nombre = this.formatearNombre(this.sesionService.getFirstname())
    // El responsable guarda su perfil bajo 'usuarioInfo' (no 'entidadInfo',
    // esa clave es exclusiva del rol entidad). La relacion con la entidad no
    // viene populada, asi que el backend la serializa como el string crudo
    // en 'entity', no como 'entityId'.
    const usuarioInfo = JSON.parse(this.storage.getItem('usuarioInfo') || '{}')
    if (isPlatformBrowser(this.platformId)) {
      this.pvService.list(usuarioInfo.entity).subscribe((res: any) => {
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

    this.loadTopVecinos()
  }

  private loadTopVecinos(): void {
    if (!this.pvSelec) {
      this.topVecinos = []
      return
    }
    this.statisticsService.getNeighborRankingByGreenPoint(this.pvSelec).subscribe({
      next: (resp: any) => (this.topVecinos = (resp.data || []).slice(0, 5)),
      error: () => (this.topVecinos = [])
    })
  }

  toggleHistorial() {
    this.mostrarTodo = !this.mostrarTodo
    this.historialVisible = this.mostrarTodo ? this.historial : this.historial.slice(0, this.LIMITE)
  }

  onChange(event: any) {
    this.storage.setItem('puntoVerde', event.value)
    this.pvSelec = event.value
    this.loadTopVecinos()
  }

  formatearNombre(value: string): string {
    if (!value) return ''
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  }
}
