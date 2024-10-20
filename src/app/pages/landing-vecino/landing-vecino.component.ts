import { Component, ViewChild } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatDividerModule } from '@angular/material/divider'
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { Router } from '@angular/router'
import { SesionService } from '../../services/sesion/sesion.service'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
@Component({
  selector: 'app-landing-vecino',
  standalone: true,
  imports: [
    SidenavComponent,
    NavbarComponent,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatSidenavModule,
    MatToolbarModule
  ],
  templateUrl: './landing-vecino.component.html',
  styleUrl: './landing-vecino.component.scss'
})
export class LandingVecinoComponent {
  title = 'GreenBin'
  @ViewChild(MatSidenav, { static: true })
  sidenav!: MatSidenav
  constructor(
    private router: Router,
    private sesionService: SesionService
  ) {}

  editNeighbor() {
    this.router.navigate(['/modificar-vecino', this.sesionService.getUserId()])
  }
}
