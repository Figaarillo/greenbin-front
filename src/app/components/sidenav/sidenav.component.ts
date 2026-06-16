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
  sesionServ = inject(SesionService)
  router = inject(Router)

  menuItems = signal<MenuItem[]>([])
  nombreCompleto = ''
  username = ''
  dni = ''
  rol = ''
  ngOnInit() {
    this.nombreCompleto =
      this.formatearNombre(this.sesionServ.getFirstname()) + ' ' + this.formatearNombre(this.sesionServ.getLastname())
    this.username = this.sesionServ.getUsername()
    this.dni = this.sesionServ.getDni()
    this.rol = this.sesionServ.getRole()
    this.setItems()
    console.log('$$$')
    console.log(this.dni)
    console.log(this.nombreCompleto)
  }

  formatearNombre(value: string): string {
    if (!value) return ''
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  }

  setItems() {
    const rol = this.rol
    if (rol == 'responsible') {
      this.menuItems.set([
        { icon: 'home', label: 'Inicio', route: '/responsable/inicio' },
        { icon: 'recycling', label: 'Registrar entrega', route: '/entrega' },
        { icon: 'history', label: 'Historial entregas', route: '/responsable/historial-responsable' },
        { icon: 'close', label: 'Cerrar Sesión', route: '' }
      ])
    } else if (rol == 'neighbor') {
      const info = localStorage.getItem('usuarioInfo') || ''
      const usuarioInfo = JSON.parse(info)
      this.username = usuarioInfo.username
      this.menuItems.set([
        { icon: 'home', label: 'Inicio', route: '/vecino/inicio' },
        { icon: 'account_circle', label: 'Mi perfil', route: '/vecino/modificar-vecino' },
        { icon: 'local_activity', label: 'Mis Cupones', route: '/vecino/mis-cupones' },
        { icon: 'location_on', label: 'Puntos verdes', route: '/vecino/puntos-verdes' },
        { icon: 'history', label: 'Historial entregas', route: '/vecino/mis-reciclados' },
        { icon: 'close', label: 'Cerrar Sesión', route: '' }
      ])
    } else if (rol == 'reward-partner') {
      this.menuItems.set([
        { icon: 'home', label: 'Inicio', route: '/local/inicio' },
        { icon: 'account_circle', label: 'Mi perfil', route: '/local/modificar-local' },
        { icon: 'confirmation_number', label: 'Mis cupones', route: '/local/cupones-ofrecidos' },
        { icon: 'confirmation_number', label: 'Crear cupón', route: '/local/registrar-cupon' },
        { icon: 'qr_code_scanner', label: 'Usar cupón', route: '/local/usar-cupon' },
        { icon: 'close', label: 'Cerrar Sesión', route: '' }
      ])
    } else if (rol == 'entity') {
      this.menuItems.set([
        { icon: 'business', label: 'Dashboard', route: '/entidad/dashboard' },
        { icon: 'people', label: 'Listar Vecinos', route: '/entidad/consultar-vecinos' },
        { icon: 'supervised_user_circle', label: 'Listar Responsables', route: '/entidad/listar-responsables' },
        { icon: 'store', label: 'Listar Locales', route: '/entidad/consultar-locales' },
        { icon: 'close', label: 'Cerrar Sesión', route: '' }
      ])
    }
  }

  logout() {
    this.sesionServ.logout()
  }

  navigateTo(route: string) {
    this.router.navigateByUrl(route)
  }
}
