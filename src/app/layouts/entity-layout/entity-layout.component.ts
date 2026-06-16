import { Component, inject, OnInit } from '@angular/core'
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router'
import { Location } from '@angular/common'
import { BreakpointObserver } from '@angular/cdk/layout'
import { CommonModule } from '@angular/common'
import { filter } from 'rxjs'

@Component({
  selector: 'app-entity-layout',
  standalone: true,
  imports: [RouterModule, RouterOutlet, CommonModule],
  templateUrl: './entity-layout.component.html',
  styleUrl: './entity-layout.component.scss'
})
export class EntityLayoutComponent implements OnInit {
  name = ''
  email = ''
  router = inject(Router)
  private location = inject(Location)
  private breakpointObserver = inject(BreakpointObserver)

  isMobile = false
  currentTitle = ''

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
    const info = localStorage.getItem('entidadInfo') || ''
    const entidadInfo = JSON.parse(info)
    this.email = entidadInfo.email
    this.name = entidadInfo.name

    this.breakpointObserver.observe('(max-width: 1124px)').subscribe(result => {
      this.isMobile = result.matches
    })

    // Muestra en el header en qué menú estás parado, según la ruta activa.
    this.updateTitle(this.router.url)
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      this.updateTitle((event as NavigationEnd).urlAfterRedirects)
    })
  }

  private updateTitle(url: string): void {
    const segments = url.split('?')[0].split('/').filter(Boolean)
    const last = segments[segments.length - 1] ?? ''
    this.currentTitle = this.menuTitles[last] ?? ''
  }

  goBack(): void {
    this.location.back()
  }

  logOut(): void {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.setItem('respoEdit', 'false')
    this.router.navigateByUrl('/login-admin')
  }
}
