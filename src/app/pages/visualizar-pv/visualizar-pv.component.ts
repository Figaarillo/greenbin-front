import { Component, inject, OnInit, ViewChild } from '@angular/core'
import { GoogleMapsModule } from '@angular/google-maps'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MapInputComponent } from '../../components/map-input/map-input.component'
import { CommonModule } from '@angular/common'
import { ModalPvComponent } from '../../components/modal-pv/modal-pv.component'
import { PuntoVerdeService } from '../../services/punto-verde/punto-verde.service'
import { MatIconModule } from '@angular/material/icon'
import { Router, RouterModule } from '@angular/router'
import { NavbarComponent } from '../../components/navbar/navbar.component'

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
    NavbarComponent
  ],
  templateUrl: './visualizar-pv.component.html',
  styleUrl: './visualizar-pv.component.scss'
})
export class VisualizarPvComponent implements OnInit {
  @ViewChild(ModalPvComponent) modal?: ModalPvComponent
  pvServices = inject(PuntoVerdeService)
  options: google.maps.MapOptions = {
    mapId: 'DEMO_MAP_ID',
    center: { lat: -32.938055555556, lng: -63.241666666667 },
    zoom: 15
  }

  puntosVerdes: any[] = []

  ngOnInit() {
    const entidadInfo = JSON.parse(localStorage.getItem('entidadInfo') || '{}')
    this.pvServices.list(entidadInfo.id).subscribe((res: any) => {
      this.puntosVerdes = res

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
