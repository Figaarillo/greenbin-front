import { StorageService } from '../../services/storage/storage.service'
import { Component, DestroyRef, OnDestroy, OnInit, PLATFORM_ID, inject, viewChild } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { ActivatedRoute, NavigationStart, Router, RouterModule, RouterOutlet } from '@angular/router'
import { BreakpointObserver } from '@angular/cdk/layout'
import { filter } from 'rxjs'
import { isPlatformBrowser, CommonModule } from '@angular/common'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { MobileTabbarComponent, TabExtraItem } from '../../components/mobile-tabbar/mobile-tabbar.component'
import { MobileMenuComponent, MobileMenuItem } from '../../components/mobile-menu/mobile-menu.component'
import { MobileOptionsSheetComponent } from '../../components/mobile-options-sheet/mobile-options-sheet.component'
import { SesionService } from '../../services/sesion/sesion.service'
import { RealtimeService } from '../../services/notification/realtime.service'

@Component({
  selector: 'app-role-layout',
  standalone: true,
  imports: [
    RouterModule,
    RouterOutlet,
    SidenavComponent,
    CommonModule,
    MobileTabbarComponent,
    MobileMenuComponent,
    MobileOptionsSheetComponent
  ],
  templateUrl: './role-layout.component.html',
  styleUrl: './role-layout.component.scss'
})
export class RoleLayoutComponent implements OnInit, OnDestroy {
  private storage = inject(StorageService)
  private route = inject(ActivatedRoute)
  private router = inject(Router)
  private breakpointObserver = inject(BreakpointObserver)
  private sesionService = inject(SesionService)
  private realtimeService = inject(RealtimeService)
  private platformId = inject(PLATFORM_ID)
  private destroyRef = inject(DestroyRef)

  role = 'vecino'
  isMobile = false
  userId = ''

  readonly menu = viewChild(MobileMenuComponent)
  readonly optionsSheet = viewChild(MobileOptionsSheetComponent)

  middleItems: [TabExtraItem, TabExtraItem, TabExtraItem] = [
    { icon: '', label: '' },
    { icon: '', label: '', isFab: true },
    { icon: '', label: '' }
  ]
  profileRoute: string = ''
  /** No hay foto de perfil real en el backend todavía: mismo default que usa MobileMenuComponent. */
  userPhoto: string = '/assets/profile.png'

  menuItems: MobileMenuItem[] = []
  userName = ''
  userSubtitle = ''
  userDetail = ''

  ngOnInit(): void {
    // El stream SSE solo tiene sentido en el navegador (SSR no mantiene
    // conexiones abiertas) y una vez que hay sesión.
    if (isPlatformBrowser(this.platformId)) {
      this.realtimeService.start()
    }

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
          { icon: 'local_activity', label: 'Mis Cupones', route: '/vecino/mis-cupones' },
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
          { icon: 'recycling', label: 'Registrar entrega', route: '/responsable/entrega' },
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
      .subscribe(() => {
        this.menu()?.closeSheet()
        this.optionsSheet()?.closeSheet()
      })
  }

  ngOnDestroy(): void {
    this.realtimeService.stop()
  }

  onHamburgerClick(): void {
    if (this.isMobile) {
      // Solo puede haber un bottom-sheet abierto a la vez.
      this.optionsSheet()?.closeSheet()
      this.menu()?.toggle()
    } else {
      const cb = document.getElementById('sidebar-toggle') as HTMLInputElement | null
      if (cb) cb.checked = !cb.checked
    }
  }

  onOptionsClick(): void {
    if (this.isMobile) {
      this.menu()?.closeSheet()
      this.optionsSheet()?.toggle()
    }
  }

  onOptionsFullPageNav(route: string): void {
    this.router.navigateByUrl(route)
  }

  onMenuNavigate(route: string): void {
    this.router.navigateByUrl(route)
  }

  onMenuLogout(): void {
    this.sesionService.logout()
  }

  /** Tocar un tab en la ruta en la que ya estás no navega (Angular ignora
   *  la misma URL), así que le avisamos directo a la pantalla ruteada: si
   *  implementa closeOpenSheet(), que cierre lo que tenga abierto. */
  onSameRouteClick(routedComponent: unknown): void {
    ;(routedComponent as { closeOpenSheet?: () => void } | null)?.closeOpenSheet?.()
  }

  onMiddleClick(index: number): void {
    this.menu()?.closeSheet()
    this.optionsSheet()?.closeSheet()
    if (this.middleItems[index].icon === 'recycling' && this.role === 'responsable') {
      // La propia pantalla de Entregar pide el punto verde si todavía no hay uno elegido.
      this.router.navigate(['/responsable/entrega'])
    }
  }
}
