import { Component, OnInit } from '@angular/core'
import { GoogleMapsModule } from '@angular/google-maps'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MapInputComponent } from '../../components/map-input/map-input.component'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-visualizar-pv',
  standalone: true,

  imports: [GoogleMapsModule, MatToolbarModule, MapInputComponent, CommonModule],
  templateUrl: './visualizar-pv.component.html',
  styleUrl: './visualizar-pv.component.scss'
})
export class VisualizarPvComponent implements OnInit {
  options: google.maps.MapOptions = {
    mapId: 'DEMO_MAP_ID',
    center: { lat: -32.40751, lng: -63.24016 },
    zoom: 14
  }

  nzLocations: any[] = [
    { lat: -32.415625641488475, lng: -63.23945804187315 },
    { lat: -32.41533418604155, lng: -63.24143192091275 },
    { lat: -32.41649757614851, lng: -63.241427618732054 }
  ]

  ngOnInit() {
    const img = 'assets/recycle.png'
    this.nzLocations.forEach(location => {
      let imgTag = document.createElement('img')
      imgTag.src = img
      imgTag.width = 24
      imgTag.height = 24
      location.content = imgTag
    })
  }

  console() {
    alert('anda')
  }
}
