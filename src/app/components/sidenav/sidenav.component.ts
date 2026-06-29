import { StorageService } from '../../services/storage/storage.service'
import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { SesionService } from '../../services/sesion/sesion.service'
import { Router } from '@angular/router'

export type MenuItem = {
  icon: string
  label: string
  route: string
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MatListModule, MatIconModule, CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent implements OnInit {
  private storage = inject(StorageService)
  private sesionServ = inject(SesionService)
  router = inject(Router)

  menuItems = signal<MenuItem[]>([])
  nombreCompleto = ''
  username = ''
  dni = ''
  rol = ''

  ngOnInit() {
    this.rol = this.sesionServ.getRole()

    // usuarioInfo es la fuente de verdad: el login lo guarda siempre antes de navegar.
    // Los campos de sesionService actúan como fallback para sesiones previas.
    const raw = this.storage.getItem('usuarioInfo') || '{}'
    const info = JSON.parse(raw)

    const firstname = info.firstname ?? info.name ?? this.sesionServ.getFirstname() ?? ''
    const lastname = info.lastname ?? this.sesionServ.getLastname() ?? ''
    this.nombreCompleto = [firstname, lastname].filter(Boolean).map(this.formatearNombre).join(' ')
    this.username = info.username ?? this.sesionServ.getUsername() ?? ''
    this.dni = info.dni ?? this.sesionServ.getDni() ?? ''

    this.setItems()
  }

  formatearNombre(value: string): string {
    if (!value) return ''
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  }

  setItems() {
    const menuByRole: Record<string, MenuItem[]> = {
      responsible: [
        { icon: 'home', label: 'Inicio', route: '/responsable/inicio' },
        { icon: 'recycling', label: 'Registrar entrega', route: '/entrega' },
        { icon: 'history', label: 'Historial entregas', route: '/responsable/historial-responsable' },
        { icon: 'close', label: 'Cerrar Sesión', route: '' }
      ],
      neighbor: [
        { icon: 'home', label: 'Inicio', route: '/vecino/inicio' },
        { icon: 'account_circle', label: 'Mi perfil', route: '/vecino/modificar-vecino' },
        { icon: 'local_activity', label: 'Mis Cupones', route: '/vecino/mis-cupones' },
        { icon: 'location_on', label: 'Puntos verdes', route: '/vecino/puntos-verdes' },
        { icon: 'history', label: 'Historial entregas', route: '/vecino/mis-reciclados' },
        { icon: 'close', label: 'Cerrar Sesión', route: '' }
      ],
      'reward-partner': [
        { icon: 'home', label: 'Inicio', route: '/local/inicio' },
        { icon: 'account_circle', label: 'Mi perfil', route: '/local/modificar-local' },
        { icon: 'confirmation_number', label: 'Mis cupones', route: '/local/cupones-ofrecidos' },
        { icon: 'confirmation_number', label: 'Crear cupón', route: '/local/registrar-cupon' },
        { icon: 'qr_code_scanner', label: 'Usar cupón', route: '/local/usar-cupon' },
        { icon: 'close', label: 'Cerrar Sesión', route: '' }
      ],
      entity: [
        { icon: 'business', label: 'Dashboard', route: '/entidad/dashboard' },
        { icon: 'people', label: 'Listar Vecinos', route: '/entidad/consultar-vecinos' },
        { icon: 'supervised_user_circle', label: 'Listar Responsables', route: '/entidad/listar-responsables' },
        { icon: 'store', label: 'Listar Locales', route: '/entidad/consultar-locales' },
        { icon: 'close', label: 'Cerrar Sesión', route: '' }
      ]
    }

    this.menuItems.set(menuByRole[this.rol] ?? [])
  }

  logout() {
    this.sesionServ.logout()
  }

  navigateTo(route: string) {
    this.router.navigateByUrl(route)
  }
}
