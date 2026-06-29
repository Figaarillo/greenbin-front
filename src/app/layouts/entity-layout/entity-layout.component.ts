import { StorageService } from '../../services/storage/storage.service'
import { Component, DestroyRef, inject, OnInit, viewChild } from '@angular/core'
import { NavigationEnd, NavigationStart, Router, RouterModule, RouterOutlet } from '@angular/router'
import { Location } from '@angular/common'
import { BreakpointObserver } from '@angular/cdk/layout'
import { CommonModule } from '@angular/common'
import { filter } from 'rxjs'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { MobileTabbarComponent, TabExtraItem } from '../../components/mobile-tabbar/mobile-tabbar.component'
import { MobileMenuComponent, MobileMenuItem } from '../../components/mobile-menu/mobile-menu.component'

@Component({
  selector: 'app-entity-layout',
  standalone: true,
  imports: [RouterModule, RouterOutlet, CommonModule, MobileTabbarComponent, MobileMenuComponent],
  templateUrl: './entity-layout.component.html',
  styleUrl: './entity-layout.component.scss'
})
export class EntityLayoutComponent implements OnInit {
  private storage = inject(StorageService)
  private destroyRef = inject(DestroyRef)
  name = ''
  email = ''
  router = inject(Router)
  private location = inject(Location)
  private breakpointObserver = inject(BreakpointObserver)

  readonly menu = viewChild(MobileMenuComponent)

  isMobile = false
  currentTitle = ''

  readonly middleItems: [TabExtraItem, TabExtraItem, TabExtraItem] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/entidad/dashboard' },
    { icon: 'home', label: '', route: '/entidad/dashboard', isFab: true },
    { icon: 'contacts', label: 'Listar', route: '/entidad/listar-responsables' }
  ]
  readonly profileRoute: string = '/entidad/dashboard'

  readonly menuItems: MobileMenuItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/entidad/dashboard' },
    { icon: 'person_add', label: 'Registrar Responsable', route: '/entidad/registrar-responsable' },
    { icon: 'supervised_user_circle', label: 'Listar Responsables', route: '/entidad/listar-responsables' },
    { icon: 'location_on', label: 'Registrar Punto Verde', route: '/entidad/registrar-punto-verde' },
    { icon: 'map', label: 'Listar Puntos Verdes', route: '/entidad/consultar-puntos-verdes' },
    { icon: 'people', label: 'Listar Vecinos', route: '/entidad/consultar-vecinos' },
    { icon: 'store', label: 'Listar Locales', route: '/entidad/consultar-locales' },
    { icon: 'sell', label: 'Registrar Categoría', route: '/entidad/registrar-categoria' },
    { icon: 'list', label: 'Listar Categorías', route: '/entidad/consultar-categorias' },
    { icon: 'close', label: 'Cerrar Sesión', route: '' }
  ]
  userName = ''
  userSubtitle = ''

  private readonly menuTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    'registrar-responsable': 'Registrar Responsable',
    'listar-responsables': 'Listar Responsables',
    'registrar-punto-verde': 'Registrar Punto Verde',
    'consultar-puntos-verdes': 'Listar Puntos Verdes',
    'consultar-vecinos': 'Listar Vecinos',
    'consultar-locales': 'Listar Locales',
    'registrar-categoria': 'Registrar Categoría',
    'consultar-categorias': 'Listar Categorías'
  }

  ngOnInit(): void {
    const entidadInfo = JSON.parse(this.storage.getItem('entidadInfo') || '{}')
    this.email = entidadInfo.email ?? ''
    this.name = entidadInfo.name ?? ''
    this.userName = entidadInfo.name ?? ''
    this.userSubtitle = entidadInfo.email ?? ''

    this.breakpointObserver
      .observe('(max-width: 1124px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.isMobile = result.matches
      })

    this.updateTitle(this.router.url)
    this.router.events.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(event => {
      if (event instanceof NavigationStart) {
        this.menu()?.closeSheet()
      } else if (event instanceof NavigationEnd) {
        this.updateTitle(event.urlAfterRedirects)
      }
    })
  }

  private updateTitle(url: string): void {
    const segments = url.split('?')[0].split('/').filter(Boolean)
    const last = segments[segments.length - 1] ?? ''
    this.currentTitle = this.menuTitles[last] ?? ''
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
    this.logOut()
  }

  goBack(): void {
    this.location.back()
  }

  logOut(): void {
    this.storage.removeItem('accessToken')
    this.storage.removeItem('refreshToken')
    this.storage.setItem('respoEdit', 'false')
    this.router.navigateByUrl('/login-admin')
  }
}
