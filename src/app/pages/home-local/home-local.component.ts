import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { RouterModule } from '@angular/router'
import { MatCardModule } from '@angular/material/card'

@Component({
  selector: 'app-home-local',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatSidenavModule,
    MatToolbarModule,
    SidenavComponent,
    RouterModule,
    MatCardModule
  ],
  templateUrl: './home-local.component.html',
  styleUrl: './home-local.component.scss'
})
export class HomeLocalComponent {
  name
  constructor() {
    const info = localStorage.getItem('usuarioInfo') || ''
    const usuarioInfo = JSON.parse(info)

    this.name = usuarioInfo.name
  }
}
