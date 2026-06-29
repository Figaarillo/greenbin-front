import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'

export type TabExtraItem = {
  icon: string
  label: string
  /** Ruta de navegación. Vacía/sin ruta → emite extraClick con su índice. */
  route?: string
}

@Component({
  selector: 'app-mobile-tabbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './mobile-tabbar.component.html',
  styleUrl: './mobile-tabbar.component.scss'
})
export class MobileTabbarComponent {
  /** Dos ítems variables (según rol) que van a izquierda/derecha del Home */
  @Input({ required: true }) extraItems!: [TabExtraItem, TabExtraItem]

  /** Ruta del botón Home (central, FAB) */
  @Input() homeRoute: string = '/'

  /** Ruta del botón Perfil (extremo derecho) */
  @Input() profileRoute: string = ''

  /** Color accent para el estado activo (pasa un CSS var o color) */
  @Input() accentColor: string = 'var(--accent)'

  /** Emitido al clickear el botón hamburguesa (extremo izquierdo) */
  @Output() hamburgerClick = new EventEmitter<void>()

  /** Emitido cuando un extraItem no tiene ruta definida */
  @Output() extraClick = new EventEmitter<number>()
}
