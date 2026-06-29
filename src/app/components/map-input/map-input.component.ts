import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core'
import { GoogleMapsModule } from '@angular/google-maps'

@Component({
  selector: 'app-map-input',
  standalone: true,
  imports: [GoogleMapsModule],
  templateUrl: './map-input.component.html',
  styleUrl: './map-input.component.scss'
})
export class MapInputComponent implements AfterViewInit {
  @Input() type: string = 'punto-verde'
  @Input() initialCenter: google.maps.LatLngLiteral | null = null
  @Input() city: string = ', Argentina'
  @Output() coordinates = new EventEmitter<google.maps.LatLngLiteral>()

  @ViewChild('inputMapContainer', { static: true }) contenedorPadre!: ElementRef
  anchoVariable: number = 0

  actualizarAncho() {
    this.anchoVariable = this.contenedorPadre.nativeElement.offsetWidth
    //console.log("ancho actual "+this.anchoVariable)
  }

  position = {
    lat: 0,
    lng: 0
  }
  zoom = 15
  center: google.maps.LatLngLiteral = {
    lat: -32.938055555556,
    lng: -63.241666666667
  }

  markerOptions!: google.maps.marker.AdvancedMarkerElementOptions // No inicializado

  ngAfterViewInit() {
    if (this.initialCenter) {
      this.center = this.initialCenter
      this.position = this.initialCenter
    }
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
      .catch(error => {
        console.error('Error al cargar la biblioteca de marcadores:', error)
      })
  }

  getByAddress(address: string): void {
    //alert('asdasd')
    const geocoder = new google.maps.Geocoder()
    geocoder.geocode({ address: address + this.city }, (results: any, status: any) => {
      if (status === 'OK') {
        const location = results[0].geometry.location
        this.center = {
          lat: location.lat(),
          lng: location.lng()
        }
        this.position = this.center
        this.zoom = 16
        this.coordinates.emit(this.position)
        console.log('Coordinates:', this.coordinates) // Muestra las coordenadas en la consola
      } else {
        this.zoom = 13
        console.log('Geocode was not successful for the following reason: ' + status)
      }
    })
  }

  createMarker() {
    if (this.type == 'local') {
      this.markerOptions = {
        position: this.position,
        content: this.localMarker().element
      }
    } else if (this.type == 'punto-verde') {
      this.markerOptions = {
        position: this.position,
        content: this.puntoVerdeMarker().element
      }
    }
  }

  puntoVerdeMarker(): google.maps.marker.PinElement {
    const icon = document.createElement('span')
    icon.className = 'material-icons'
    icon.style.color = '#FFFFFF' // Color del icono
    icon.innerText = 'recycling' // Nombre del icono}
    const pinElement = new google.maps.marker.PinElement({
      background: '##20a517', // Color verde
      glyph: icon, //'♻️',
      glyphColor: '#FFFFFF',
      scale: 1.5,
      borderColor: '#20a517'
    })
    return pinElement
  }
  /** Crea el SVG de la tiendita */
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

  localMarker(): google.maps.marker.PinElement {
    const pinElement = new google.maps.marker.PinElement({
      background: '#b87d0d',
      glyph: this.createTienditaSvg(),
      glyphColor: '#FFFFFF',
      scale: 1.5,
      borderColor: '#e0a019'
    })
    return pinElement
  }
  selectCoords(event: google.maps.MapMouseEvent): void {
    if (event.latLng != null) {
      this.position = event.latLng.toJSON()
      this.coordinates.emit(this.position)
    }
  }
}
