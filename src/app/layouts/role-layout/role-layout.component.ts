import { StorageService } from '../../services/storage/storage.service'
import { Component, OnInit, inject } from '@angular/core'
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router'
import { BreakpointObserver } from '@angular/cdk/layout'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { MobileTabbarComponent, TabExtraItem } from '../../components/mobile-tabbar/mobile-tabbar.component'
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

  extraItems: [TabExtraItem, TabExtraItem] = [
    { icon: '', label: '' },
    { icon: '', label: '' }
  ]
  homeRoute: string = '/'
  profileRoute: string = ''

  ngOnInit(): void {
    this.role = this.route.snapshot.data['role'] || 'vecino'
    this.userId = this.sesionService.getUserId()

    const items: Record<string, { extra: [TabExtraItem, TabExtraItem]; home: string; profile: string }> = {
      vecino: {
        extra: [
          { icon: 'local_activity', label: 'Cupones', route: '/vecino/cupones' },
          { icon: 'recycling', label: 'Puntos', route: '/vecino/puntos-verdes' }
        ],
        home: '/vecino/inicio',
        profile: '/vecino/modificar-vecino'
      },
      responsable: {
        extra: [
          { icon: 'recycling', label: 'Entregar', route: '' },
          { icon: 'bar_chart', label: 'Historial', route: '/responsable/historial-responsable' }
        ],
        home: '/responsable/inicio',
        profile: '/modificar-responsable/' + this.userId
      },
      local: {
        extra: [
          { icon: 'local_activity', label: 'Cupones', route: '/local/cupones-ofrecidos' },
          { icon: 'qr_code_scanner', label: 'Escanear', route: '/local/usar-cupon' }
        ],
        home: '/local/inicio',
        profile: '/local/modificar-local'
      }
    }
    const cfg = items[this.role]
    if (cfg) {
      this.extraItems = cfg.extra
      this.homeRoute = cfg.home
      this.profileRoute = cfg.profile
    }

    this.breakpointObserver.observe('(max-width: 959px)').subscribe(result => {
      this.isMobile = result.matches
    })
  }

  onHamburgerClick(): void {
    const cb = document.getElementById('sidebar-toggle') as HTMLInputElement | null
    if (cb) cb.checked = !cb.checked
  }

  onExtraClick(index: number): void {
    if (index === 0 && this.role === 'responsable') {
      this.goEntrega()
    }
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
