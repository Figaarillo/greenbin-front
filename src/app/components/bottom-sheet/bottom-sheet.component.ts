import { Component, EventEmitter, inject, Input, OnDestroy, Output, signal } from '@angular/core'
import { ScrollLockService } from '../../services/scroll-lock/scroll-lock.service'

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

  /** Barrita superior. El menú la oculta para conservar su look con foto. */
  @Input() handle = true

  @Output() closed = new EventEmitter<void>()

  readonly isOpen = signal(false)

  open(): void {
    // Idempotente: si ya estaba abierto (ej. se reabre con otro cupón sin
    // cerrar antes), no volver a bloquear o el contador queda desbalanceado.
    if (!this.isOpen()) {
      this.scrollLock.lock()
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
    this.isOpen.set(false)
    // dar tiempo a la animación de salida antes de emitir
    setTimeout(() => this.closed.emit(), 250)
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('sheet-backdrop')) {
      this.closeSheet()
    }
  }

  ngOnDestroy(): void {
    // Si la página se destruye (navegación afuera) con el sheet todavía
    // abierto, liberar el lock para no dejar el scroll trabado.
    if (this.isOpen()) {
      this.scrollLock.unlock()
    }
  }
}
