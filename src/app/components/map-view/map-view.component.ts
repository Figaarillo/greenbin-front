import { Component, ElementRef, Input, ViewChild } from '@angular/core'
import { GoogleMapsModule } from '@angular/google-maps'
import { PuntoVerde } from '../../services/interfaces/punto-verde'
import { LocalAdherido } from '../../services/interfaces/local-adherido'

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [GoogleMapsModule],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss'
})
export class MapViewComponent {
  @Input() puntosVerdes: PuntoVerde[] = []
  @Input() localesAdheridos: LocalAdherido[] = []

  zoom = 13
  center: google.maps.LatLngLiteral = {
    //centro, puesto a mano las coordenadas de vm
    lat: -32.414964,
    lng: -63.242764
  }

  @ViewChild('viewMapContainer', { static: true }) contenedorPadre!: ElementRef
  anchoVariable: number = 0

  actualizarAncho() {
    this.anchoVariable = this.contenedorPadre.nativeElement.offsetWidth
    //console.log("ancho actual "+this.anchoVariable)
  }

  localAdheridoIcon = document.createElement('span')
  localAdheridoPinElement!: google.maps.marker.PinElement
  PuntoVerdeIcon = document.createElement('span')
  PuntoVerdePinElement!: google.maps.marker.PinElement

  constructor() {
    this.localAdheridoIcon.className = 'material-icons'
    this.localAdheridoIcon.style.color = '#FFFFFF' // Color del icono
    this.localAdheridoIcon.innerText = 'store' // Nombre del icono}
    this.localAdheridoPinElement = new google.maps.marker.PinElement({
      background: '#1e88e5', // Color verde
      glyph: this.localAdheridoIcon, //'♻️',
      glyphColor: '#FFFFFF',
      scale: 1.5,
      borderColor: '#19cb26'
    })
    this.PuntoVerdeIcon.className = 'material-icons'
    this.PuntoVerdeIcon.style.color = '#FFFFFF' // Color del icono
    this.PuntoVerdeIcon.innerText = 'recycling' // Nombre del icono}
    this.PuntoVerdePinElement = new google.maps.marker.PinElement({
      background: '#1e88e5', // Color verde
      glyph: this.PuntoVerdeIcon, //'♻️',
      glyphColor: '#FFFFFF',
      scale: 1.5,
      borderColor: '#19cb26'
    })
  }

  getPuntoVerdeMarkerOptions(puntoVerde: PuntoVerde): google.maps.marker.AdvancedMarkerElementOptions {
    const markerOptions: google.maps.marker.AdvancedMarkerElementOptions = {
      position: {
        lat: puntoVerde.coordinates.latitude,
        lng: puntoVerde.coordinates.longitude
      },
      content: this.PuntoVerdePinElement.element
    }
    return markerOptions
  }

  getLocalAdheridoMarkerOptions(localAdherido: LocalAdherido): google.maps.marker.AdvancedMarkerElementOptions {
    const markerOptions: google.maps.marker.AdvancedMarkerElementOptions = {
      /*
      position: {
        lat: localAdherido.coordinates.latitude,
        lng: localAdherido.coordinates.longitude
      },*/
      content: this.localAdheridoPinElement.element //el pin element da el estilo al marcador
    }
    return markerOptions
  }
}
