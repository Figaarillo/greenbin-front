import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core'
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

  actualizarAncho() {
    this.anchoVariable = this.contenedorPadre.nativeElement.offsetWidth
    //console.log("ancho actual "+this.anchoVariable)
  }

  position = {
    lat: 0,
    lng: 0
  }
  zoom = 6
  center: google.maps.LatLngLiteral = {
    lat: -32.6,
    lng: -63.8
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
