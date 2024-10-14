import { Component, computed, signal, ViewChild, viewChild } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { NavbarComponent } from './components/navbar/navbar.component'
import { SidenavComponent } from './components/sidenav/sidenav.component'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav'
import { MatListModule } from '@angular/material/list'
import { CommonModule } from '@angular/common'
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    SidenavComponent,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    CommonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild(MatSidenav, { static: true })
  sidenav!: MatSidenav

  title = 'greenbin-front'
}
