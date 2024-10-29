import { Component } from '@angular/core'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { MatSidenavModule } from '@angular/material/sidenav'
import { RouterModule } from '@angular/router'

@Component({
  selector: 'app-entidad-dashboard',
  standalone: true,
  imports: [SidenavComponent, MatSidenavModule, RouterModule],
  templateUrl: './entidad-dashboard.component.html',
  styleUrl: './entidad-dashboard.component.scss'
})
export class EntidadDashboardComponent {}
