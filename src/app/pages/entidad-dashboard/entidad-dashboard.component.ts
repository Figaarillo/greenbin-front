import { Component, inject, OnInit } from '@angular/core'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { MatSidenavModule } from '@angular/material/sidenav'
import { Router, RouterModule } from '@angular/router'
import { EntidadService } from '../../services/entidad/entidad.service'

@Component({
  selector: 'app-entidad-dashboard',
  standalone: true,
  imports: [SidenavComponent, MatSidenavModule, RouterModule],
  templateUrl: './entidad-dashboard.component.html',
  styleUrl: './entidad-dashboard.component.scss'
})
export class EntidadDashboardComponent implements OnInit {
  name = ''
  router = inject(Router)
  email = ''
  entidadServ = inject(EntidadService)
  ngOnInit(): void {
    const info = localStorage.getItem('entidadInfo') || ''
    const entidadInfo = JSON.parse(info)
    this.email = entidadInfo.email
    this.name = entidadInfo.name
  }

  logOut() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.setItem('respoEdit', 'false')
    this.router.navigateByUrl('/login-admin')
  }
}
