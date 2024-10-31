import { Component, ViewChild } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatDividerModule } from '@angular/material/divider'
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { Router, RouterModule } from '@angular/router'
import { SesionService } from '../../services/sesion/sesion.service'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'

@Component({
  selector: 'app-landing-vecino',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatSidenavModule,
    MatToolbarModule,
    SidenavComponent,
    RouterModule
  ],
  templateUrl: './landing-vecino.component.html',
  styleUrl: './landing-vecino.component.scss'
})
export class LandingVecinoComponent {
  title = 'GreenBin'
  @ViewChild(MatSidenav, { static: true })
  sidenav!: MatSidenav

  puntos: string = ''
  nombre: string = ''
  constructor(
    private router: Router,
    private sesionService: SesionService
  ) {
    this.puntos = sesionService.getPoints()
    this.nombre = this.formatearNombre(sesionService.getFirstname())
  }

  editNeighbor() {
    this.router.navigate(['/modificar-vecino', this.sesionService.getUserId()])
  }

  formatearNombre(value: string): string {
    if (!value) return ''
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  }
}
