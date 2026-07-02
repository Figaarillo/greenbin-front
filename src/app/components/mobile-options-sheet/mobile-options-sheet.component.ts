import { Component, EventEmitter, Input, OnDestroy, Output, inject, viewChild } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component'
import { ModificarVecinoComponent } from '../../pages/modificar-vecino/modificar-vecino.component'
import { ModificarResponsableComponent } from '../../pages/modificar-responsable/modificar-responsable.component'
import { ModificarLocalComponent } from '../../pages/modificar-local/modificar-local.component'
import { ThemeService } from '../../services/theme/theme.service'
import { TextSizeService } from '../../services/text-size/text-size.service'
import { NotificationsPrefService } from '../../services/notifications-pref/notifications-pref.service'

@Component({
  selector: 'app-mobile-options-sheet',
  standalone: true,
  imports: [
    MatIconModule,
    MatSlideToggleModule,
    BottomSheetComponent,
    ModificarVecinoComponent,
    ModificarResponsableComponent,
    ModificarLocalComponent
  ],
  templateUrl: './mobile-options-sheet.component.html',
  styleUrl: './mobile-options-sheet.component.scss'
})
export class MobileOptionsSheetComponent implements OnDestroy {
  /** 'vecino' | 'responsable' | 'local' — decide qué form embebido renderizar. */
  @Input({ required: true }) role!: string
  @Input() userName: string = ''
  @Input() userSubtitle: string = ''
  @Input() userDetail: string = ''
  @Input() userPhoto: string = '/assets/profile.png'
  /** Página completa de edición, para "Gestionar cuenta completa" (ej. eliminar cuenta). */
  @Input() profileRoute: string = ''
  /** Id del usuario logueado, necesario para el form embebido de responsable. */
  @Input() userId: string = ''

  @Output() close = new EventEmitter<void>()
  @Output() navigateFullPage = new EventEmitter<string>()

  private readonly sheet = viewChild.required(BottomSheetComponent)
  private theme = inject(ThemeService)
  private textSize = inject(TextSizeService)
  private notifPref = inject(NotificationsPrefService)

  view: 'options' | 'edit' = 'options'
  themeMode = this.theme.getTheme()
  textSizeMode = this.textSize.getSize()
  notificationsEnabled = this.notifPref.isEnabled()

  /** Vista previa local de la nueva foto (blob URL). No se sube a ningún lado
   *  todavía — es solo para mostrar cómo se vería el cambio reflejado arriba. */
  previewPhoto: string | null = null

  ngOnDestroy(): void {
    this.revokePreview()
  }

  displayPhoto(): string {
    return this.previewPhoto ?? this.userPhoto
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    this.revokePreview()
    this.previewPhoto = URL.createObjectURL(file)
  }

  private revokePreview(): void {
    if (this.previewPhoto) {
      URL.revokeObjectURL(this.previewPhoto)
      this.previewPhoto = null
    }
  }

  isOpen(): boolean {
    return this.sheet().isOpen()
  }

  open(): void {
    this.view = 'options'
    this.sheet().open()
  }

  toggle(): void {
    this.sheet().toggle()
  }

  closeSheet(): void {
    this.sheet().closeSheet()
  }

  // La vista solo se resetea cuando el sheet terminó de cerrarse (el shell
  // ya espera 250ms antes de emitir 'closed'), para no ver el flash del
  // formulario volviendo a la lista de opciones en medio de la animación.
  onSheetClosed(): void {
    this.view = 'options'
    this.close.emit()
  }

  openEdit(): void {
    this.view = 'edit'
  }

  backToOptions(): void {
    this.view = 'options'
  }

  onThemeToggle(): void {
    this.themeMode = this.theme.toggle()
  }

  onTextSizeToggle(): void {
    this.textSizeMode = this.textSize.toggle()
  }

  onNotificationsToggle(): void {
    this.notificationsEnabled = this.notifPref.toggle()
  }

  onGestionarCuentaCompleta(): void {
    this.closeSheet()
    this.navigateFullPage.emit(this.profileRoute)
  }
}
