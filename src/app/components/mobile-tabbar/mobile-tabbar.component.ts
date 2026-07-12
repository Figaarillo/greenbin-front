import { Component, EventEmitter, inject, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'
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
  private router = inject(Router)

  /** Tres ítems del centro, en el orden exacto en que se renderizan.
   *  Cualquiera puede llevar isFab:true para recibir estilo de FAB. */
  @Input({ required: true }) middleItems!: [TabExtraItem, TabExtraItem, TabExtraItem]

  /** Ruta del botón Perfil (extremo derecho). Se usa como fallback cuando no hay userPhoto. */
  @Input() profileRoute: string = ''

  /** Si se pasa, el extremo derecho muestra el avatar y pasa a ser un botón de Opciones
   *  (emite optionsClick) en vez del link "Perfil" de siempre. */
  @Input() userPhoto?: string

  /** Estado activo del botón de Opciones (el sheet asociado está abierto). */
  @Input() optionsOpen = false

  /** Color accent para el estado activo (pasa un CSS var o color) */
  @Input() accentColor: string = 'var(--accent)'

  /** Emitido al clickear el botón hamburguesa (extremo izquierdo) */
  @Output() hamburgerClick = new EventEmitter<void>()

  /** Emitido cuando un middleItem no tiene ruta definida (pasa el índice 0-2) */
  @Output() middleClick = new EventEmitter<number>()

  /** Emitido al clickear el botón de Opciones (solo cuando hay userPhoto) */
  @Output() optionsClick = new EventEmitter<void>()

  /** Emitido al tocar el tab de la ruta en la que ya estás parado (routerLink
   *  no dispara nada en ese caso: Angular ignora la navegación a la misma URL
   *  por default). El layout lo usa para avisarle a la pantalla actual que
   *  cierre cualquier sheet/modal que tenga abierto. */
  @Output() sameRouteClick = new EventEmitter<void>()

  onTabClick(item: TabExtraItem): void {
    if (item.route && this.router.url === item.route) {
      this.sameRouteClick.emit()
    }
  }
}
