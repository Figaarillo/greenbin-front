import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core'
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
export class MapViewComponent implements AfterViewInit {
  @Input() puntosVerdes: PuntoVerde[] = []
  @Input() localesAdheridos: LocalAdherido[] = []
  @Input() height: string | number = 220

  zoom = 13

  @Input() center: google.maps.LatLngLiteral = {
    //centro, puesto a mano las coordenadas de vm
    lat: -32.414964,
    lng: -63.242764
  }

  @ViewChild('viewMapContainer', { static: true }) contenedorPadre!: ElementRef
  anchoVariable: number = 0

  actualizarAncho() {
    this.anchoVariable = this.contenedorPadre.nativeElement.offsetWidth
  }

  localAdheridoPinElement!: google.maps.marker.PinElement
  PuntoVerdeIcon = document.createElement('span')
  PuntoVerdePinElement!: google.maps.marker.PinElement

  ngAfterViewInit() {
    google.maps
      .importLibrary('marker')
      .then(() => {
        this.createMarker()
        this.actualizarAncho()
        const resizeObserver = new ResizeObserver(() => {
          this.actualizarAncho()
        })
        resizeObserver.observe(this.contenedorPadre.nativeElement)
      })
      .catch(() => {})
  }

  /** Crea el SVG de la tiendita (reemplaza el Material Icon 'store') */
  private createTienditaSvg(): SVGElement {
    const xmlns = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(xmlns, 'svg')
    svg.setAttribute('viewBox', '0 0 64 64')
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')

    // Techo a dos aguas
    const roof = document.createElementNS(xmlns, 'path')
    roof.setAttribute('d', 'M8 26 L32 10 L56 26 L56 30 L8 30 Z')
    roof.setAttribute('fill', '#ffffff')

    // Base de la tienda
    const body = document.createElementNS(xmlns, 'rect')
    body.setAttribute('x', '14')
    body.setAttribute('y', '30')
    body.setAttribute('width', '36')
    body.setAttribute('height', '20')
    body.setAttribute('rx', '3')
    body.setAttribute('fill', '#ffffff')

    svg.appendChild(roof)
    svg.appendChild(body)
    return svg
  }

  createMarker() {
    // Reward Partner — tiendita ámbar
    this.localAdheridoPinElement = new google.maps.marker.PinElement({
      background: '#b87d0d',
      glyph: this.createTienditaSvg(),
      glyphColor: '#FFFFFF',
      scale: 1.5,
      borderColor: '#e0a019'
    })
    // Punto Verde — reciclaje (sin cambios)
    this.PuntoVerdeIcon.className = 'material-icons'
    this.PuntoVerdeIcon.style.color = '#FFFFFF'
    this.PuntoVerdeIcon.innerText = 'recycling'
    this.PuntoVerdePinElement = new google.maps.marker.PinElement({
      background: '#1e88e5',
      glyph: this.PuntoVerdeIcon,
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
      position: {
        lat: localAdherido.coordinates.latitude,
        lng: localAdherido.coordinates.longitude
      },
      content: this.localAdheridoPinElement.element //el pin element da el estilo al marcador
    }
    return markerOptions
  }

  coordToPosition(obj: PuntoVerde | LocalAdherido) {
    return {
      lat: obj.coordinates.latitude,
      lng: obj.coordinates.longitude
    }
  }

  setCenter(lat: number, lng: number) {
    this.center = {
      lat: lat,
      lng: lng
    }
  }
}
