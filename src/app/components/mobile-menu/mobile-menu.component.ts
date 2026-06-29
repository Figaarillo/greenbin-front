import { Component, EventEmitter, Input, Output, viewChild } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component'

export type MobileMenuItem = {
  icon: string
  label: string
  route: string
}

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [MatIconModule, BottomSheetComponent],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss'
})
export class MobileMenuComponent {
  @Input({ required: true }) items!: MobileMenuItem[]

  // Datos del usuario
  @Input() userName: string = ''
  @Input() userSubtitle: string = ''
  @Input() userDetail: string = ''
  @Input() userPhoto: string = '/assets/profile.png'

  @Output() close = new EventEmitter<void>()
  @Output() navigate = new EventEmitter<string>()
  @Output() doLogout = new EventEmitter<void>()

  // La física vive en el shell; el menú solo delega.
  private readonly sheet = viewChild.required(BottomSheetComponent)

  open(): void {
    this.sheet().open()
  }

  toggle(): void {
    this.sheet().toggle()
  }

  closeSheet(): void {
    this.sheet().closeSheet()
  }

  onItemClick(item: MobileMenuItem): void {
    if (item.label === 'Cerrar Sesión') {
      this.doLogout.emit()
    } else {
      this.navigate.emit(item.route)
    }
    this.closeSheet()
  }
}
