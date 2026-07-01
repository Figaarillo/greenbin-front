import { StorageService } from '../../services/storage/storage.service'
import { Component, inject, OnInit, ViewChild } from '@angular/core'
import { GoogleMapsModule } from '@angular/google-maps'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MapInputComponent } from '../../components/map-input/map-input.component'
import { CommonModule } from '@angular/common'
import { ModalPvComponent } from '../../components/modal-pv/modal-pv.component'
import { PuntoVerdeService } from '../../services/punto-verde/punto-verde.service'
import { MatIconModule } from '@angular/material/icon'
import { Router, RouterModule } from '@angular/router'
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
  @ViewChild(ModalPvComponent) modal?: ModalPvComponent
  pvServices = inject(PuntoVerdeService)
  options: google.maps.MapOptions = {
    mapId: 'DEMO_MAP_ID',
    center: { lat: -32.938055555556, lng: -63.241666666667 },
    zoom: 15
  }

  puntosVerdes: any[] = []

  ngOnInit() {
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

      const img = 'assets/recycle.png'
      this.puntosVerdes.forEach(location => {
        let imgTag = document.createElement('img')
        imgTag.src = img
        imgTag.width = 24
        imgTag.height = 24
        location.content = imgTag
      })
    })
  }

  abrirModal(location: any) {
    this.modal?.openModal(location)
  }
}
