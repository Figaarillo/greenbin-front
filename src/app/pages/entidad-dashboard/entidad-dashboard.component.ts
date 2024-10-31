import { Component, inject, OnInit } from '@angular/core'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { MatSidenavModule } from '@angular/material/sidenav'
import { Router, RouterModule } from '@angular/router'

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
  ngOnInit(): void {
    this.name = localStorage.getItem('username') || ''
  }

  logOut() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    this.router.navigateByUrl('/login-admin')
  }
}
