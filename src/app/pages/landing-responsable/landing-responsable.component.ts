import { Component } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatSelectModule } from '@angular/material/select'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { ActivatedRoute, RouterModule, Router } from '@angular/router'
import { SesionService } from '../../services/sesion/sesion.service'

@Component({
  selector: 'app-landing-responsable',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatSidenavModule,
    MatToolbarModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './landing-responsable.component.html',
  styleUrl: './landing-responsable.component.scss'
})
export class LandingResponsableComponent {
  listPtoVerde: any[] = [
    { id: 'steak-0', name: 'Escuela Juan Castillo' },
    { id: 'pizza-1', name: 'Cooperativa' },
    { id: 'tacos-2', name: 'Municerca' }
  ]
  ptoVerde = new FormControl(this.listPtoVerde[2].id)

  constructor(
    private router: Router,
    private sesionService: SesionService
  ) {}

  editResponsible() {
    this.router.navigate(['/modificar-responsable', this.sesionService.getUserId()])
  }
}
