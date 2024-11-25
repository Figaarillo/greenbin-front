import { Component, OnInit, ViewChild } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatDividerModule } from '@angular/material/divider'
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { Router, RouterModule } from '@angular/router'
import { SesionService } from '../../services/sesion/sesion.service'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { VecinoService } from '../../services/vecino/vecino.service'

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
export class LandingVecinoComponent implements OnInit {
  title = 'GreenBin'
  @ViewChild(MatSidenav, { static: true })
  sidenav!: MatSidenav
  id = ''
  puntos: string = ''
  name = ''
  constructor(
    private router: Router,
    private sesionService: SesionService,
    private vecinoServ: VecinoService
  ) {
    const info = localStorage.getItem('usuarioInfo') || ''
    const usuarioInfo = JSON.parse(info)

    this.name = usuarioInfo.firstname
    this.id = usuarioInfo.id
  }

  ngOnInit(): void {
    this.vecinoServ.get(this.id).subscribe((resp: any) => {
      this.puntos = resp.data.points
    })
  }

  formatearNombre(value: string): string {
    if (!value) return ''
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  }
}
