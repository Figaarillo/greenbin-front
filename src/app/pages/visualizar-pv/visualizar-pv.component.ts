import { StorageService } from '../../services/storage/storage.service'
import { Component, inject, OnInit, ViewChild } from '@angular/core'
import { BreakpointObserver } from '@angular/cdk/layout'
import { MapViewComponent } from '../../components/map-view/map-view.component'
import { CommonModule } from '@angular/common'
import { ModalPvComponent } from '../../components/modal-pv/modal-pv.component'
import { ModalLocalAdheridoComponent } from '../../components/modal-local-adherido/modal-local-adherido.component'
import { PuntoVerdeService } from '../../services/punto-verde/punto-verde.service'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { PuntoVerde } from '../../services/interfaces/punto-verde'
import { LocalAdherido } from '../../services/interfaces/local-adherido'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'

@Component({
  selector: 'app-visualizar-pv',
  standalone: true,

  imports: [
    MapViewComponent,
    CommonModule,
    ModalPvComponent,
    ModalLocalAdheridoComponent,
    MatIconModule,
    RouterModule,
    PageHeaderComponent
  ],
  templateUrl: './visualizar-pv.component.html',
  styleUrl: './visualizar-pv.component.scss'
})
export class VisualizarPvComponent implements OnInit {
  private storage = inject(StorageService)
  private breakpointObserver = inject(BreakpointObserver)
  @ViewChild(ModalPvComponent) modal?: ModalPvComponent
  @ViewChild(ModalLocalAdheridoComponent) modalLocal?: ModalLocalAdheridoComponent
  pvServices = inject(PuntoVerdeService)
  localAdheridoService = inject(LocalAdheridoService)
  center: google.maps.LatLngLiteral = { lat: -32.938055555556, lng: -63.241666666667 }
  zoom = 15

  puntosVerdes: PuntoVerde[] = []
  localesAdheridos: LocalAdherido[] = []
  // En mobile el mapa a 80vh se extendía por detrás del tabbar fijo (z-index 300,
  // ~90px de alto), tapando los markers de la parte inferior y capturando el tap
  // el tabbar en vez del mapa. Se achica para que quede por completo arriba de él.
  mapHeight = '80vh'

  // El mapa se inicializa mientras su contenedor todavia puede estar
  // asentando el layout (dentro de un @defer, con el header sticky recien
  // pintandose). Si el tamano cambia despues sin avisarle a la API, el mapa
  // sigue creyendo que tiene el tamano viejo: los tiles se ven bien (el
  // browser los reescala visualmente) pero la capa interactiva de los
  // markers queda desalineada, por eso el primer tap no abre nada. Entrar y
  // salir de pantalla completa dispara un resize nativo que la Maps API sí
  // escucha, y "arregla" el desalineo -- de ahi el bug. Se disparan resizes
  // explicitos en los mismos momentos en que el contenedor puede cambiar de
  // tamano, sin depender de que el usuario togglee fullscreen.
  private googleMapInstance: google.maps.Map | null = null

  onMapReady(map: google.maps.Map): void {
    this.googleMapInstance = map
    this.triggerMapResize()
  }

  private triggerMapResize(): void {
    if (this.googleMapInstance == null) return
    // Un tick despues del cambio de layout, para que el contenedor ya tenga
    // su tamano final cuando la API recalcula.
    setTimeout(() => {
      if (this.googleMapInstance != null) {
        google.maps.event.trigger(this.googleMapInstance, 'resize')
      }
    })
  }

  ngOnInit() {
    this.breakpointObserver.observe('(max-width: 959px)').subscribe(result => {
      this.mapHeight = result.matches ? '55vh' : '80vh'
      this.triggerMapResize()
    })

    // La entidad usa 'entidadInfo' (su sesión); el vecino usa 'usuarioInfo.entity',
    // que el backend ahora puebla con la entidad completa (id + coordinates).
    const entidadInfo = JSON.parse(this.storage.getItem('entidadInfo') || '{}')
    const usuarioInfo = JSON.parse(this.storage.getItem('usuarioInfo') || '{}')
    const entidad = entidadInfo?.id ? entidadInfo : usuarioInfo.entity
    const entityId = entidad?.id ?? usuarioInfo.entityId

    // Centramos el mapa en la ciudad de la entidad, haya o no puntos verdes.
    if (entidad?.coordinates) {
      this.center = { lat: entidad.coordinates.latitude, lng: entidad.coordinates.longitude }
    }

    this.pvServices.list(entityId).subscribe((res: any) => {
      this.puntosVerdes = res ?? []
    })

    this.localAdheridoService.list(entityId).subscribe((res: any) => {
      this.localesAdheridos = res ?? []
    })
  }

  abrirModal(location: PuntoVerde) {
    this.modal?.openModal(location)
  }

  abrirModalLocal(local: LocalAdherido) {
    this.modalLocal?.openModal(local)
  }
}
