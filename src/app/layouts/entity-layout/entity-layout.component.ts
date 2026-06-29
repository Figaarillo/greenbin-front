import { StorageService } from '../../services/storage/storage.service'
import { Component, DestroyRef, inject, OnInit } from '@angular/core'
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router'
import { Location } from '@angular/common'
import { BreakpointObserver } from '@angular/cdk/layout'
import { CommonModule } from '@angular/common'
import { filter } from 'rxjs'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { MobileTabbarComponent, TabExtraItem } from '../../components/mobile-tabbar/mobile-tabbar.component'

@Component({
  selector: 'app-entity-layout',
  standalone: true,
  imports: [RouterModule, RouterOutlet, CommonModule, MobileTabbarComponent],
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

  isMobile = false
  currentTitle = ''

  readonly middleItems: [TabExtraItem, TabExtraItem, TabExtraItem] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/entidad/dashboard' },
    { icon: 'home', label: '', route: '/entidad/dashboard', isFab: true },
    { icon: 'contacts', label: 'Listar', route: '/entidad/listar-responsables' }
  ]
  readonly profileRoute: string = '/entidad/dashboard'

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

    this.breakpointObserver
      .observe('(max-width: 1124px)')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        this.isMobile = result.matches
      })

    this.updateTitle(this.router.url)
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => {
        this.updateTitle((event as NavigationEnd).urlAfterRedirects)
      })
  }

  private updateTitle(url: string): void {
    const segments = url.split('?')[0].split('/').filter(Boolean)
    const last = segments[segments.length - 1] ?? ''
    this.currentTitle = this.menuTitles[last] ?? ''
  }

  onHamburgerClick(): void {
    const cb = document.getElementById('sidebar-toggle') as HTMLInputElement | null
    if (cb) cb.checked = !cb.checked
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
