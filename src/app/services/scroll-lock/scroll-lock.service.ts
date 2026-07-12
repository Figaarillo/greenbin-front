import { Injectable, PLATFORM_ID, inject } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'

/**
 * Bloquea el scroll de document.body mientras haya al menos un bottom-sheet
 * abierto. Usa un contador (no un booleano) porque puede haber más de un
 * BottomSheetComponent montado a la vez (ej. mobile-menu y un cupon-sheet de
 * página); si cada uno pisara el overflow de forma independiente, cerrar uno
 * podría reactivar el scroll mientras el otro sigue abierto.
 */
@Injectable({
  providedIn: 'root'
})
export class ScrollLockService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))
  private count = 0
  private previousOverflow = ''

  lock(): void {
    if (!this.isBrowser) return
    if (this.count === 0) {
      this.previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    this.count++
  }

  unlock(): void {
    if (!this.isBrowser) return
    this.count = Math.max(0, this.count - 1)
    if (this.count === 0) {
      document.body.style.overflow = this.previousOverflow
    }
  }
}
