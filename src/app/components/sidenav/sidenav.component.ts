import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, signal } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { SesionService } from '../../services/sesion/sesion.service'

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
  isLoggedIn: boolean = true
  menuItems = signal<MenuItem[]>([])
  username = 'Usuario'
  ngOnInit() {
    // Suscribirse al estado de autenticación
    this.sesionServ.isLogging$.subscribe(isLoggedIn => {
      this.isLoggedIn = true
      this.setItems() // Actualizar el menú cuando cambie el estado
    })
  }

  setItems() {
    console.log('adklajdsk')
    console.log(this.sesionServ.isLogging())
    if (this.isLoggedIn) {
      this.username = localStorage.getItem('username') || 'Usuario'
      const rol = localStorage.getItem('rol')
      if (rol == 'responsable') {
        this.menuItems.set([
          { icon: 'recycling', label: 'Registrar entrega', route: 'home' },
          { icon: 'history', label: 'Historial entregas', route: 'contacto' },
          { icon: 'info', label: 'Contacto', route: 'contacto' }
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
}
