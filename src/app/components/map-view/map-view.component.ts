import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import { GoogleMapsModule } from '@angular/google-maps'
import { PuntoVerde } from '../../services/interfaces/punto-verde'
import { LocalAdherido } from '../../services/interfaces/local-adherido'
import { SkeletonComponent } from '../skeleton/skeleton.component'

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [GoogleMapsModule, SkeletonComponent],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss'
})
export class MapViewComponent implements AfterViewInit {
  @Input() puntosVerdes: PuntoVerde[] = []
  @Input() localesAdheridos: LocalAdherido[] = []
  @Input() height: string | number = 220
  @Input() zoom = 13

  @Output() puntoVerdeClick = new EventEmitter<PuntoVerde>()
  @Output() localAdheridoClick = new EventEmitter<LocalAdherido>()
  @Output() mapReady = new EventEmitter<google.maps.Map>()

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

  // En true si la API de Maps no cargó (ej. API key inválida) o si crear un
  // pin tira una excepción: en ese caso dejamos de intentar dibujar el mapa
  // y mostramos el skeleton en su lugar, en vez de romper la pantalla entera.
  mapError = false

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
      .catch(() => {
        this.mapError = true
      })
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

  // Construir un PinElement puede tirar (ej. la API de Maps quedó en un
  // estado roto por una API key inválida): si eso pasa, marcamos mapError
  // para que el template pase al skeleton en vez de crashear a mitad del
  // @for, y devolvemos el marcador sin content (Maps dibuja su pin default).
  getPuntoVerdeMarkerOptions(puntoVerde: PuntoVerde): google.maps.marker.AdvancedMarkerElementOptions {
    const markerOptions: google.maps.marker.AdvancedMarkerElementOptions = {
      position: {
        lat: puntoVerde.coordinates.latitude,
        lng: puntoVerde.coordinates.longitude
      },
      content: this.safePinElement(() => this.createPuntoVerdePin())
    }
    return markerOptions
  }

  getLocalAdheridoMarkerOptions(localAdherido: LocalAdherido): google.maps.marker.AdvancedMarkerElementOptions {
    const markerOptions: google.maps.marker.AdvancedMarkerElementOptions = {
      position: {
        lat: localAdherido.coordinates.latitude,
        lng: localAdherido.coordinates.longitude
      },
      content: this.safePinElement(() => this.createLocalAdheridoPin())
    }
    return markerOptions
  }

  private safePinElement(build: () => google.maps.marker.PinElement): HTMLElement | undefined {
    try {
      return build().element
    } catch {
      this.mapError = true
      return undefined
    }
  }

  onMapInitialized(map: google.maps.Map) {
    this.mapReady.emit(map)
  }

  coordToPosition(obj: PuntoVerde | LocalAdherido) {
    return {
      lat: obj.coordinates.latitude,
      lng: obj.coordinates.longitude
    }
  }
}
