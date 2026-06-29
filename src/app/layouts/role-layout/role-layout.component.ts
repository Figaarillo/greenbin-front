import { StorageService } from '../../services/storage/storage.service'
import { Component, OnInit, inject } from '@angular/core'
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router'
import { BreakpointObserver } from '@angular/cdk/layout'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { MobileTabbarComponent, TabItem } from '../../components/mobile-tabbar/mobile-tabbar.component'
import { SesionService } from '../../services/sesion/sesion.service'
import Swal from 'sweetalert2'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-role-layout',
  standalone: true,
  imports: [RouterModule, RouterOutlet, SidenavComponent, CommonModule, MobileTabbarComponent],
  templateUrl: './role-layout.component.html',
  styleUrl: './role-layout.component.scss'
})
export class RoleLayoutComponent implements OnInit {
  private storage = inject(StorageService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private breakpointObserver = inject(BreakpointObserver)
  private sesionService = inject(SesionService)

  role = 'vecino'
  isMobile = false
  userId = ''

  tabItems: TabItem[] = []

  ngOnInit(): void {
    this.role = this.route.snapshot.data['role'] || 'vecino'
    this.userId = this.sesionService.getUserId()

    // Tabbar items según el rol
    const items: Record<string, TabItem[]> = {
      vecino: [
        { icon: 'recycling', label: 'Puntos', route: '/vecino/puntos-verdes' },
        { icon: 'local_activity', label: '', route: '/vecino/cupones', isFab: true },
        { icon: 'account_circle', label: 'Perfil', route: '/vecino/modificar-vecino' }
      ],
      responsable: [
        { icon: 'bar_chart', label: 'Historial', route: '/responsable/historial-responsable' },
        { icon: 'recycling', label: '', route: '', isFab: true },
        { icon: 'account_circle', label: 'Perfil', route: '/modificar-responsable/' + this.userId }
      ],
      local: [
        { icon: 'local_activity', label: 'Cupones', route: '/local/cupones-ofrecidos' },
        { icon: 'qr_code_scanner', label: '', route: '/local/usar-cupon', isFab: true },
        { icon: 'account_circle', label: 'Perfil', route: '/local/modificar-local' }
      ]
    }
    this.tabItems = items[this.role] ?? []

    this.breakpointObserver.observe('(max-width: 959px)').subscribe(result => {
      this.isMobile = result.matches
    })
  }

  goEntrega(): void {
    const pvSelec = this.storage.getItem('puntoVerde') || ''
    if (pvSelec) {
      this.router.navigate(['/entrega'])
    } else {
      Swal.fire({ title: 'Tienes que seleccionar un punto verde.', icon: 'error' })
    }
  }
}
