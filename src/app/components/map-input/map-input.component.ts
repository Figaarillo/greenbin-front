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
  @Output() coordinates = new EventEmitter<google.maps.LatLngLiteral>()

  @ViewChild('inputMapContainer', { static: true }) contenedorPadre!: ElementRef
  anchoVariable: number = 0

  city: string = ',Villa Maria, Argentina'

  actualizarAncho() {
    this.anchoVariable = this.contenedorPadre.nativeElement.offsetWidth
    //console.log("ancho actual "+this.anchoVariable)
  }

  position = {
    lat: 0,
    lng: 0
  }
  zoom = 13
  center: google.maps.LatLngLiteral = {
    lat: -32.414964,
    lng: -63.242764
  }

  markerOptions!: google.maps.marker.AdvancedMarkerElementOptions // No inicializado

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
  localMarker(): google.maps.marker.PinElement {
    const icon = document.createElement('span')
    icon.className = 'material-icons'
    icon.style.color = '#FFFFFF' // Color del icono
    icon.innerText = 'store' // Nombre del icono}
    const pinElement = new google.maps.marker.PinElement({
      background: '#1e88e5', // Color verde
      glyph: icon, //'♻️',
      glyphColor: '#FFFFFF',
      scale: 1.5,
      borderColor: '#19cb26'
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
