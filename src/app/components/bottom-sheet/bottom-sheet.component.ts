import { Component, ElementRef, EventEmitter, inject, Input, OnDestroy, Output, signal } from '@angular/core'
import { DOCUMENT } from '@angular/common'
import { ScrollLockService } from '../../services/scroll-lock/scroll-lock.service'

/**
 * Overlays que viven fuera del panel en el DOM pero pertenecen a él:
 * mat-select, datepicker y menús del CDK, más los diálogos de SweetAlert.
 * Un tap ahí no es "tocar afuera" y no debe cerrar el sheet.
 */
const EXTERNAL_OVERLAYS = '.cdk-overlay-container, .swal2-container'

/**
 * Shell reutilizable de bottom-sheet: backdrop con blur, clip que recorta la
 * animación a la altura del tabbar, y panel deslizante desde abajo.
 *
 * Solo aporta la mecánica (abrir/cerrar/animar). El contenido se proyecta:
 *   <app-bottom-sheet #sheet>
 *     ...contenido...
 *   </app-bottom-sheet>
 *
 * El acento lo hereda de [data-role] del contenedor padre.
 */
@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  templateUrl: './bottom-sheet.component.html',
  styleUrl: './bottom-sheet.component.scss'
})
export class BottomSheetComponent implements OnDestroy {
  private readonly scrollLock = inject(ScrollLockService)
  private readonly host = inject(ElementRef<HTMLElement>)
  private readonly document = inject(DOCUMENT)

  /** Limpia el listener de "tocar afuera". Definido solo mientras está abierto. */
  private stopOutsideTap?: () => void

  /** Barrita superior. El menú la oculta para conservar su look con foto. */
  @Input() handle = true

  @Output() closed = new EventEmitter<void>()

  readonly isOpen = signal(false)

  open(): void {
    // Idempotente: si ya estaba abierto (ej. se reabre con otro cupón sin
    // cerrar antes), no volver a bloquear o el contador queda desbalanceado.
    if (!this.isOpen()) {
      this.scrollLock.lock()
      this.listenForOutsideTap()
    }
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
    if (this.isOpen()) {
      this.scrollLock.unlock()
    }
    this.stopOutsideTap?.()
    this.stopOutsideTap = undefined
    this.isOpen.set(false)
    // dar tiempo a la animación de salida antes de emitir
    setTimeout(() => this.closed.emit(), 250)
  }

  /**
   * Cierra al tocar cualquier cosa fuera del panel — incluido el mobile-tabbar,
   * que queda por encima del backdrop y por eso no lo cierra por sí solo.
   * Va acá y no en cada sheet: los seis que proyectan contenido lo heredan.
   */
  private listenForOutsideTap(): void {
    const onOutsideTap = (event: MouseEvent): void => {
      const target = event.target as HTMLElement | null
      if (target == null) return

      const panel = this.host.nativeElement.querySelector('.sheet-panel')
      if (panel?.contains(target) === true) return
      if (target.closest(EXTERNAL_OVERLAYS) != null) return

      // Un tap afuera solo descarta, como el backdrop: no dispara además la
      // acción del elemento de abajo (ej. navegar al tocar "Opciones").
      event.preventDefault()
      event.stopPropagation()
      this.closeSheet()
    }

    // En el próximo tick: si no, el mismo click que abrió el sheet
    // (la campanita, el botón del menú) lo cerraría al instante.
    const timer = setTimeout(() => {
      this.document.addEventListener('click', onOutsideTap, true)
    })

    this.stopOutsideTap = () => {
      clearTimeout(timer)
      this.document.removeEventListener('click', onOutsideTap, true)
    }
  }

  ngOnDestroy(): void {
    // Si la página se destruye (navegación afuera) con el sheet todavía
    // abierto, liberar el lock para no dejar el scroll trabado.
    if (this.isOpen()) {
      this.scrollLock.unlock()
    }
    this.stopOutsideTap?.()
  }
}
