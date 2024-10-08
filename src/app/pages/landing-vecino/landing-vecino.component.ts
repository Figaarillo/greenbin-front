import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatDividerModule } from '@angular/material/divider'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { Router } from '@angular/router'
import { SesionService } from '../../services/sesion/sesion.service'

@Component({
  selector: 'app-landing-vecino',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatListModule, MatDividerModule, MatSidenavModule, MatToolbarModule],
  templateUrl: './landing-vecino.component.html',
  styleUrl: './landing-vecino.component.scss'
})
export class LandingVecinoComponent {
  constructor(
    private router: Router,
    private sesionService: SesionService
  ) {}

  editNeighbor() {
    this.router.navigate(['/modificar-vecino', this.sesionService.getUserId()])
  }
}
