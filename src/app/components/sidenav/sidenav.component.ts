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
  username = 'Usuario'
  ngOnInit() {
    // Suscribirse al estado de autenticación
    this.sesionServ.isLogging$.subscribe(isLoggedIn => {
      this.setItems() // Actualizar el menú cuando cambie el estado
    })
  }

  setItems() {
    console.log('adklajdsk')
    console.log(this.sesionServ.isLogging())
    const isLogged = localStorage.getItem('isLogged') || ''
    if (isLogged == 'true') {
      console.log('aca')
      this.username = localStorage.getItem('username') || 'Usuario'
      const rol = localStorage.getItem('rol')
      if (rol == 'responsable') {
        this.menuItems.set([
          { icon: 'recycling', label: 'Registrar entrega', route: 'home' },
          { icon: 'history', label: 'Historial entregas', route: 'contacto' },
          { icon: 'info', label: 'Contacto', route: 'contacto' },
          { icon: 'close', label: 'Cerrar Sesión', route: 'home' }
        ])
      } else if (rol == 'vecino') {
        this.menuItems.set([
          { icon: 'account_circle', label: 'Mi perfil', route: 'contacto' },
          { icon: 'location_on', label: 'Puntos verdes', route: 'puntos-verdes' },
          { icon: 'history', label: 'Historial entregas', route: 'contacto' },

          { icon: 'close', label: 'Cerrar Sesión', route: 'home' }
        ])
      } else if (rol == 'comercio') {
        this.menuItems.set([
          { icon: 'account_circle', label: 'Mi perfil', route: 'contacto' },
          { icon: 'confirmation_number', label: 'Mis cupones', route: 'puntos-verdes' },
          { icon: 'info', label: 'Contacto', route: 'contacto' },

          { icon: 'close', label: 'Cerrar Sesión', route: 'home' }
        ])
      }
    } else {
      this.menuItems.set([
        { icon: 'home', label: 'Home', route: 'home' },
        { icon: 'info', label: 'Contacto', route: 'contacto' }

        // Otros elementos para usuarios logueados
      ])
    }
  }

  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('isLogged')
    this.router.navigateByUrl('login')
  }

  navigateTo(route: string) {
    console.log('ss')
  }

  // this.router.navigate([route]);
}
