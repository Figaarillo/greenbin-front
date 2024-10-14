import { Component } from '@angular/core'
import { GoogleMapsModule } from '@angular/google-maps'

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [GoogleMapsModule],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss'
})
export class MapViewComponent {
  position = {
    lat: 12.31,
    lng: 23.44
  }
  label = {
    color: 'green',
    text: 'Punto Verde'
  }
  display: any
  center: google.maps.LatLngLiteral = {
    lat: 22.2736308,
    lng: 70.7512555
  }
  zoom = 6
  selectCoords(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.position = event.latLng.toJSON()
  }
}
