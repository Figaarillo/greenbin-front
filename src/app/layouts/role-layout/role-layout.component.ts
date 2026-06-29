import { StorageService } from '../../services/storage/storage.service'
import { Component, DestroyRef, OnInit, inject, viewChild } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, NavigationStart, Router, RouterModule, RouterOutlet } from '@angular/router'
import { BreakpointObserver } from '@angular/cdk/layout'
import { filter } from 'rxjs'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { MobileTabbarComponent, TabExtraItem } from '../../components/mobile-tabbar/mobile-tabbar.component'
import { MobileMenuComponent, MobileMenuItem } from '../../components/mobile-menu/mobile-menu.component'
import { SesionService } from '../../services/sesion/sesion.service'
import Swal from 'sweetalert2'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-role-layout',
  standalone: true,
  imports: [RouterModule, RouterOutlet, SidenavComponent, CommonModule, MobileTabbarComponent, MobileMenuComponent],
  templateUrl: './role-layout.component.html',
  styleUrl: './role-layout.component.scss'
})
export class RoleLayoutComponent implements OnInit {
  private storage = inject(StorageService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private breakpointObserver = inject(BreakpointObserver)
  private sesionService = inject(SesionService)
  private destroyRef = inject(DestroyRef)

  role = 'vecino'
  isMobile = false
  userId = ''

  readonly menu = viewChild(MobileMenuComponent)

  middleItems: [TabExtraItem, TabExtraItem, TabExtraItem] = [
    { icon: '', label: '' },
    { icon: '', label: '', isFab: true },
    { icon: '', label: '' }
  ]
  profileRoute: string = ''

  menuItems: MobileMenuItem[] = []
  userName = ''
  userSubtitle = ''
  userDetail = ''

  ngOnInit(): void {
    this.role = this.route.snapshot.data['role'] || 'vecino'
    this.userId = this.sesionService.getUserId()

    // Datos del usuario para el menú
    const raw = this.storage.getItem('usuarioInfo') || '{}'
    const info = JSON.parse(raw)
    const firstname = info.firstname ?? info.name ?? this.sesionService.getFirstname() ?? ''
    const lastname = info.lastname ?? this.sesionService.getLastname() ?? ''
    this.userName = info.username ?? this.sesionService.getUsername() ?? ''
    this.userSubtitle = [firstname, lastname]
      .filter(Boolean)
      .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
      .join(' ')
    this.userDetail = info.dni ?? this.sesionService.getDni() ?? ''

    // Config central de tabbar y menú por rol
    const config: Record<
      string,
      {
        middle: [TabExtraItem, TabExtraItem, TabExtraItem]
        profile: string
        menu: MobileMenuItem[]
      }
    > = {
      vecino: {
        middle: [
          { icon: 'local_activity', label: 'Cupones', route: '/vecino/cupones' },
          { icon: 'home', label: '', route: '/vecino/inicio', isFab: true },
          { icon: 'recycling', label: 'Puntos', route: '/vecino/puntos-verdes' }
        ],
        profile: '/vecino/modificar-vecino',
        menu: [
          { icon: 'home', label: 'Inicio', route: '/vecino/inicio' },
          { icon: 'account_circle', label: 'Mi perfil', route: '/vecino/modificar-vecino' },
          { icon: 'local_activity', label: 'Mis Cupones', route: '/vecino/cupones' },
          { icon: 'location_on', label: 'Puntos verdes', route: '/vecino/puntos-verdes' },
          { icon: 'history', label: 'Historial entregas', route: '/vecino/mis-reciclados' },
          { icon: 'close', label: 'Cerrar Sesión', route: '' }
        ]
      },
      responsable: {
        middle: [
          { icon: 'recycling', label: 'Entregar', route: '' },
          { icon: 'home', label: '', route: '/responsable/inicio', isFab: true },
          { icon: 'bar_chart', label: 'Historial', route: '/responsable/historial-responsable' }
        ],
        profile: '/responsable/modificar-responsable/' + this.userId,
        menu: [
          { icon: 'home', label: 'Inicio', route: '/responsable/inicio' },
          { icon: 'recycling', label: 'Registrar entrega', route: '/entrega' },
          { icon: 'history', label: 'Historial entregas', route: '/responsable/historial-responsable' },
          { icon: 'close', label: 'Cerrar Sesión', route: '' }
        ]
      },
      local: {
        middle: [
          { icon: 'local_activity', label: 'Cupones', route: '/local/cupones-ofrecidos' },
          { icon: 'home', label: '', route: '/local/inicio', isFab: true },
          { icon: 'qr_code_scanner', label: 'Escanear', route: '/local/usar-cupon' }
        ],
        profile: '/local/modificar-local',
        menu: [
          { icon: 'home', label: 'Inicio', route: '/local/inicio' },
          { icon: 'account_circle', label: 'Mi perfil', route: '/local/modificar-local' },
          { icon: 'confirmation_number', label: 'Mis cupones', route: '/local/cupones-ofrecidos' },
          { icon: 'confirmation_number', label: 'Crear cupón', route: '/local/registrar-cupon' },
          { icon: 'qr_code_scanner', label: 'Usar cupón', route: '/local/usar-cupon' },
          { icon: 'close', label: 'Cerrar Sesión', route: '' }
        ]
      }
    }
    const cfg = config[this.role]
    if (cfg) {
      this.middleItems = cfg.middle
      this.profileRoute = cfg.profile
      this.menuItems = cfg.menu
    }

    this.breakpointObserver.observe('(max-width: 959px)').subscribe(result => {
      this.isMobile = result.matches
    })

    this.router.events
      .pipe(
        filter(e => e instanceof NavigationStart),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.menu()?.closeSheet())
  }

  onHamburgerClick(): void {
    if (this.isMobile) {
      this.menu()?.toggle()
    } else {
      const cb = document.getElementById('sidebar-toggle') as HTMLInputElement | null
      if (cb) cb.checked = !cb.checked
    }
  }

  onMenuNavigate(route: string): void {
    this.router.navigateByUrl(route)
  }

  onMenuLogout(): void {
    this.sesionService.logout()
  }

  onMiddleClick(index: number): void {
    this.menu()?.closeSheet()
    if (this.middleItems[index].icon === 'recycling' && this.role === 'responsable') {
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
