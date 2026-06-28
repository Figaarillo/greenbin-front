import { StorageService } from '../../services/storage/storage.service'
import { inject, Component } from '@angular/core'
import { Router, RouterModule, RouterOutlet } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { MatRippleModule } from '@angular/material/core'
import { CommonModule } from '@angular/common'
import { SesionService } from '../../services/sesion/sesion.service'

interface NavItem {
  label: string
  icon: string
  route: string
}

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterModule, MatIconModule, MatRippleModule, CommonModule],
  templateUrl: './superadmin-dashboard.component.html',
  styleUrl: './superadmin-dashboard.component.scss'
})
export class SuperadminDashboardComponent {
  private storage = inject(StorageService)
  navItems: NavItem[] = [
    { label: 'Resumen', icon: 'dashboard', route: '/superadmin/dashboard' },
    { label: 'Listar entidades', icon: 'business', route: '/superadmin/dashboard/listar-entidades' },
    { label: 'Nueva entidad', icon: 'add_business', route: '/superadmin/dashboard/registrar-entidad' }
  ]

  constructor(
    private router: Router,
    private sesionService: SesionService
  ) {}

  isActive(route: string): boolean {
    return this.router.url === route
  }

  logout(): void {
    this.sesionService.setAccessToken('')
    this.sesionService.setRefreshToken('')
    this.storage.removeItem('rol')
    this.router.navigateByUrl('/superadmin/login')
  }
}
