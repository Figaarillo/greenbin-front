import { Component, EventEmitter, Input, Output } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'

export type TabItem = {
  icon: string
  label: string
  /** Ruta de navegación. Vacía si el item requiere una acción (fabClick). */
  route: string
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
  @Input({ required: true }) items!: TabItem[]
  @Output() fabClick = new EventEmitter<void>()

  onItemClick(item: TabItem): void {
    if (item.isFab && !item.route) {
      this.fabClick.emit()
    }
  }
}
