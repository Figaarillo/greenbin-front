import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  inject,
  signal,
  viewChild
} from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component'
import { ModificarVecinoComponent } from '../../pages/modificar-vecino/modificar-vecino.component'
import { ModificarResponsableComponent } from '../../pages/modificar-responsable/modificar-responsable.component'
import { ModificarLocalComponent } from '../../pages/modificar-local/modificar-local.component'
import { ThemeService } from '../../services/theme/theme.service'
import { TextSizeService } from '../../services/text-size/text-size.service'
import { NotificationService } from '../../services/notification/notification.service'
import { NotificationPreference } from '../../services/interfaces/notification'

interface PreferenceRow {
  key: keyof NotificationPreference
  label: string
  /** Roles (vocabulario de UI: 'vecino' | 'responsable' | 'local') a los que aplica esta categoría. */
  roles: string[]
}

// Mapea cada categoría de notificación a los roles que realmente pueden
// recibirla (según qué evento de negocio la dispara en el backend), para no
// mostrarle a un local un toggle de "compra de cupones" que nunca le aplica.
// couponCreated aplica a 'local' (confirmación de que su cupón quedó creado)
// Y a 'vecino' (aviso de que hay un cupón nuevo disponible en el catálogo) —
// el backend ya dispara ambos eventos, ver register.usecase.ts del back.
const PREFERENCE_ROWS: PreferenceRow[] = [
  { key: 'couponPurchased', label: 'Compra de cupones', roles: ['vecino'] },
  { key: 'couponRedeemed', label: 'Canje de cupones', roles: ['vecino'] },
  { key: 'couponCreated', label: 'Cupones creados', roles: ['local', 'vecino'] },
  { key: 'pointsDelivered', label: 'Entregas de puntos', roles: ['vecino', 'responsable'] }
]

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
export class MobileOptionsSheetComponent implements OnInit, OnDestroy {
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
  @Output() photoChanged = new EventEmitter<string>()

  private readonly sheet = viewChild.required(BottomSheetComponent)
  private readonly platformId = inject(PLATFORM_ID)
  private theme = inject(ThemeService)
  private textSize = inject(TextSizeService)
  private notificationService = inject(NotificationService)

  view: 'options' | 'edit' | 'notifications' = 'options'
  themeMode = this.theme.getTheme()
  textSizeMode = this.textSize.getSize()
  readonly preferences = signal<NotificationPreference | null>(null)

  /** Vista previa local de la nueva foto (blob URL). No se sube a ningún lado
   *  todavía — es solo para mostrar cómo se vería el cambio reflejado arriba. */
  previewPhoto: string | null = null

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return

    this.notificationService.getPreferences().subscribe({
      next: resp => this.preferences.set(resp.data),
      error: () => {}
    })
  }

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
    this.photoChanged.emit(this.previewPhoto)
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

  visiblePreferenceRows(): PreferenceRow[] {
    return PREFERENCE_ROWS.filter(row => row.roles.includes(this.role))
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

  openNotifications(): void {
    this.view = 'notifications'
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

  onPreferenceToggle(row: PreferenceRow): void {
    const current = this.preferences()
    if (current == null) return

    const next = !current[row.key]
    this.preferences.set({ ...current, [row.key]: next })
    this.notificationService.updatePreferences({ [row.key]: next }).subscribe({ error: () => {} })
  }

  onEmailToggle(): void {
    const current = this.preferences()
    if (current == null) return

    const next = !current.emailEnabled
    this.preferences.set({ ...current, emailEnabled: next })
    this.notificationService.updatePreferences({ emailEnabled: next }).subscribe({ error: () => {} })
  }

  onGestionarCuentaCompleta(): void {
    this.closeSheet()
    this.navigateFullPage.emit(this.profileRoute)
  }
}
