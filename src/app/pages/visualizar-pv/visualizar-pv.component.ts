import { StorageService } from '../../services/storage/storage.service'
import { Component, inject, OnInit, ViewChild } from '@angular/core'
import { BreakpointObserver } from '@angular/cdk/layout'
import { GoogleMapsModule } from '@angular/google-maps'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MapInputComponent } from '../../components/map-input/map-input.component'
import { CommonModule } from '@angular/common'
import { ModalPvComponent } from '../../components/modal-pv/modal-pv.component'
import { PuntoVerdeService } from '../../services/punto-verde/punto-verde.service'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'

@Component({
  selector: 'app-visualizar-pv',
  standalone: true,

  imports: [
    GoogleMapsModule,
    MatToolbarModule,
    MapInputComponent,
    CommonModule,
    ModalPvComponent,
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
  pvServices = inject(PuntoVerdeService)
  options: google.maps.MapOptions = {
    mapId: 'DEMO_MAP_ID',
    center: { lat: -32.938055555556, lng: -63.241666666667 },
    zoom: 15
  }

  puntosVerdes: any[] = []
  // En mobile el mapa a 80vh se extendía por detrás del tabbar fijo (z-index 300,
  // ~90px de alto), tapando los markers de la parte inferior y capturando el tap
  // el tabbar en vez del mapa. Se achica para que quede por completo arriba de él.
  mapHeight = '80vh'

  ngOnInit() {
    this.breakpointObserver.observe('(max-width: 959px)').subscribe(result => {
      this.mapHeight = result.matches ? '55vh' : '80vh'
    })

    // La entidad usa 'entidadInfo' (su sesión); el vecino usa 'usuarioInfo.entity',
    // que el backend ahora puebla con la entidad completa (id + coordinates).
    const entidadInfo = JSON.parse(this.storage.getItem('entidadInfo') || '{}')
    const usuarioInfo = JSON.parse(this.storage.getItem('usuarioInfo') || '{}')
    const entidad = entidadInfo?.id ? entidadInfo : usuarioInfo.entity
    const entityId = entidad?.id ?? usuarioInfo.entityId

    // Centramos el mapa en la ciudad de la entidad, haya o no puntos verdes.
    if (entidad?.coordinates) {
      this.options = {
        ...this.options,
        center: { lat: entidad.coordinates.latitude, lng: entidad.coordinates.longitude }
      }
    }

    this.pvServices.list(entityId).subscribe((res: any) => {
      this.puntosVerdes = res ?? []

      // En SSR no hay DOM: los markers (document.createElement) se arman en el
      // cliente cuando ngOnInit vuelve a correr tras hidratar.
      if (typeof document === 'undefined') return

      const img = 'assets/recycle.png'
      this.puntosVerdes.forEach(location => {
        // El icono visual mide 24px, pero el area tocable es de 44px (minimo
        // recomendado para touch): asi el marker sigue siendo facil de tocar
        // con el dedo aunque se vea igual de chico.
        const hitArea = document.createElement('div')
        hitArea.style.display = 'flex'
        hitArea.style.alignItems = 'center'
        hitArea.style.justifyContent = 'center'
        hitArea.style.width = '44px'
        hitArea.style.height = '44px'
        hitArea.style.cursor = 'pointer'

        const imgTag = document.createElement('img')
        imgTag.src = img
        imgTag.width = 24
        imgTag.height = 24
        hitArea.appendChild(imgTag)

        location.content = hitArea
      })
    })
  }

  abrirModal(location: any) {
    this.modal?.openModal(location)
  }
}
