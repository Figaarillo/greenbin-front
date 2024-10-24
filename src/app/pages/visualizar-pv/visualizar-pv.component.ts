import { Component } from '@angular/core'
import { GoogleMapsModule } from '@angular/google-maps'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MapInputComponent } from '../../components/map-input/map-input.component'

@Component({
  selector: 'app-visualizar-pv',
  standalone: true,

  imports: [GoogleMapsModule, MatToolbarModule, MapInputComponent],
  templateUrl: './visualizar-pv.component.html',
  styleUrl: './visualizar-pv.component.scss'
})
export class VisualizarPvComponent {
  options: google.maps.MapOptions = {
    mapId: 'DEMO_MAP_ID',
    center: { lat: -32.40751, lng: -63.24016 },
    zoom: 14
  }
}
