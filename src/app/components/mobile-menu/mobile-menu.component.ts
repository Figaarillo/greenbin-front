import { Component, EventEmitter, Input, Output, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'

export type MobileMenuItem = {
  icon: string
  label: string
  route: string
}

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss'
})
export class MobileMenuComponent {
  @Input({ required: true }) items!: MobileMenuItem[]
  @Input() accentColor: string = 'var(--accent)'

  // Datos del usuario
  @Input() userName: string = ''
  @Input() userSubtitle: string = ''
  @Input() userDetail: string = ''
  @Input() userPhoto: string = '/assets/profile.png'

  @Output() close = new EventEmitter<void>()
  @Output() navigate = new EventEmitter<string>()
  @Output() doLogout = new EventEmitter<void>()

  readonly isOpen = signal(false)

  open(): void {
    this.isOpen.set(true)
  }

  toggle(): void {
    if (this.isOpen()) {
      this.closeSheet()
    } else {
      this.open()
    }
  }

  closeSheet(): void {
    this.isOpen.set(false)
    // dar tiempo a la animación de salida antes de emitir
    setTimeout(() => this.close.emit(), 250)
  }

  onItemClick(item: MobileMenuItem): void {
    if (item.label === 'Cerrar Sesión') {
      this.doLogout.emit()
    } else {
      this.navigate.emit(item.route)
    }
    this.closeSheet()
  }

  onBackdropClick(event: MouseEvent): void {
    // solo cerrar si el click fue en el backdrop, no en el panel
    if ((event.target as HTMLElement).classList.contains('menu-backdrop')) {
      this.closeSheet()
    }
  }
}
