import { Component, Input } from '@angular/core'
import { GoogleMapsModule } from '@angular/google-maps'

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [GoogleMapsModule],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss'
})
export class MapViewComponent {}
