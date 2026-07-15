import { Directive, HostBinding, HostListener, PLATFORM_ID, inject } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'

/**
 * Agrega la clase `is-scrolled` al host cuando la página bajó unos pocos
 * píxeles. Pensado para headers `position: sticky` que necesitan una sombra
 * sutil solo mientras el contenido pasa por debajo, no en reposo arriba.
 */
@Directive({
  selector: '[appScrollShadow]',
  standalone: true
})
export class ScrollShadowDirective {
  private readonly platformId = inject(PLATFORM_ID)

  @HostBinding('class.is-scrolled') isScrolled = false

  @HostListener('window:scroll')
  onScroll(): void {
    if (!isPlatformBrowser(this.platformId)) return
    this.isScrolled = window.scrollY > 4
  }
}
