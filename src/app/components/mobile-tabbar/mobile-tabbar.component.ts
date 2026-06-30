import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'

export type TabExtraItem = {
  icon: string
  label: string
  /** Ruta de navegación. Vacía/sin ruta → emite middleClick con su índice. */
  route?: string
  /** Marca este item como FAB (botón central flotante) */
  isFab?: boolean
}

@Component({
  selector: 'app-mobile-tabbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './mobile-tabbar.component.html',
  styleUrl: './mobile-tabbar.component.scss'
})
export class MobileTabbarComponent {
  /** Tres ítems del centro, en el orden exacto en que se renderizan.
   *  Cualquiera puede llevar isFab:true para recibir estilo de FAB. */
  @Input({ required: true }) middleItems!: [TabExtraItem, TabExtraItem, TabExtraItem]

  /** Ruta del botón Perfil (extremo derecho) */
  @Input() profileRoute: string = ''

  /** Color accent para el estado activo (pasa un CSS var o color) */
  @Input() accentColor: string = 'var(--accent)'

  /** Emitido al clickear el botón hamburguesa (extremo izquierdo) */
  @Output() hamburgerClick = new EventEmitter<void>()

  /** Emitido cuando un middleItem no tiene ruta definida (pasa el índice 0-2) */
  @Output() middleClick = new EventEmitter<number>()
}
