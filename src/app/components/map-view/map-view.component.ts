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

  // Se marca en true recien cuando la libreria 'marker' terminó de cargar:
  // recien ahi existe google.maps.marker.PinElement para poder crear pines.
  markerLibraryReady = false

  ngAfterViewInit() {
    google.maps
      .importLibrary('marker')
      .then(() => {
        this.markerLibraryReady = true
        this.actualizarAncho()
        const resizeObserver = new ResizeObserver(() => {
          this.actualizarAncho()
        })
        resizeObserver.observe(this.contenedorPadre.nativeElement)
      })
      .catch(() => {})
  }

  /** Crea el SVG de la tiendita (reward partner) */
  private createTienditaSvg(): SVGElement {
    const xmlns = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(xmlns, 'svg')
    svg.setAttribute('viewBox', '0 0 64 64')
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')

    const roof = document.createElementNS(xmlns, 'path')
    roof.setAttribute('d', 'M8 26 L32 10 L56 26 L56 30 L8 30 Z')
    roof.setAttribute('fill', '#ffffff')

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

  /** Punto Verde — reciclaje. Un PinElement nuevo por marcador: su `.element`
   *  es un nodo DOM real y no puede compartirse entre varios AdvancedMarkerElement
   *  (el browser lo reubica en el último marcador creado, dejando sin content —
   *  y sin click funcional — a todos los anteriores). */
  private createPuntoVerdePin(): google.maps.marker.PinElement {
    const icon = document.createElement('span')
    icon.className = 'material-icons'
    icon.style.color = '#FFFFFF'
    icon.innerText = 'recycling'

    return new google.maps.marker.PinElement({
      background: '#1e88e5',
      glyph: icon,
      glyphColor: '#FFFFFF',
      scale: 1.5,
      borderColor: '#19cb26'
    })
  }

  /** Reward Partner — tiendita ámbar. Mismo motivo: PinElement nuevo por marcador. */
  private createLocalAdheridoPin(): google.maps.marker.PinElement {
    return new google.maps.marker.PinElement({
      background: '#b87d0d',
      glyph: this.createTienditaSvg(),
      glyphColor: '#FFFFFF',
      scale: 1.5,
      borderColor: '#e0a019'
    })
  }

  getPuntoVerdeMarkerOptions(puntoVerde: PuntoVerde): google.maps.marker.AdvancedMarkerElementOptions {
    const markerOptions: google.maps.marker.AdvancedMarkerElementOptions = {
      position: {
        lat: puntoVerde.coordinates.latitude,
        lng: puntoVerde.coordinates.longitude
      },
      content: this.createPuntoVerdePin().element
    }
    return markerOptions
  }

  getLocalAdheridoMarkerOptions(localAdherido: LocalAdherido): google.maps.marker.AdvancedMarkerElementOptions {
    const markerOptions: google.maps.marker.AdvancedMarkerElementOptions = {
      position: {
        lat: localAdherido.coordinates.latitude,
        lng: localAdherido.coordinates.longitude
      },
      content: this.createLocalAdheridoPin().element //el pin element da el estilo al marcador
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
