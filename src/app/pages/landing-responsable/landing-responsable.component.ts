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
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { PuntoVerdeService } from '../../services/punto-verde/punto-verde.service'
import { PuntoVerde } from '../../services/interfaces/punto-verde'

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
    SidenavComponent,
    RouterModule
  ],
  templateUrl: './landing-responsable.component.html',
  styleUrl: './landing-responsable.component.scss'
})
export class LandingResponsableComponent {
  listPtoVerde: PuntoVerde[] = []
  ptoVerde = new FormControl()
  nombre: string = ''

  constructor(
    private router: Router,
    private sesionService: SesionService,
    private pvService: PuntoVerdeService
  ) {
    this.nombre = this.formatearNombre(this.sesionService.getFirstname())
    this.pvService.list().subscribe((res: any) => {
      this.listPtoVerde = res
    })
  }

  onChange(event: any) {
    console.log('adjk')
    console.log(event.value)
    localStorage.setItem('puntoVerde', event.value)
  }

  editResponsible() {
    this.router.navigate(['/modificar-responsable', this.sesionService.getUserId()])
  }

  formatearNombre(value: string): string {
    if (!value) return ''
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  }
}
