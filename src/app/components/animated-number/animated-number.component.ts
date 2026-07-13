import { Component, Input, OnChanges, OnDestroy, PLATFORM_ID, SimpleChanges, inject, signal } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'

@Component({
  selector: 'app-animated-number',
  standalone: true,
  template: '{{ displayValue() }}'
})
export class AnimatedNumberComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) value = 0
  @Input() durationMs = 700

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))
  private frameId: number | null = null
  private initialized = false

  readonly displayValue = signal(0)

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['value']
    if (change == null) return

    // Primera carga (llega el valor inicial de la página): se muestra directo,
    // sin animar desde 0 -- la animación es para cambios EN VIVO, no para el load.
    if (!this.initialized) {
      this.initialized = true
      this.displayValue.set(this.value)
      return
    }

    const from = (change.previousValue as number) ?? this.value
    const to = change.currentValue as number
    if (from === to) return

    this.animate(from, to)
  }

  ngOnDestroy(): void {
    if (this.frameId != null && this.isBrowser) cancelAnimationFrame(this.frameId)
  }

  private animate(from: number, to: number): void {
    if (!this.isBrowser) {
      this.displayValue.set(to)
      return
    }
    if (this.frameId != null) cancelAnimationFrame(this.frameId)

    const start = performance.now()
    const step = (now: number): void => {
      const progress = Math.min((now - start) / this.durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      this.displayValue.set(Math.round(from + (to - from) * eased))

      this.frameId = progress < 1 ? requestAnimationFrame(step) : null
    }
    this.frameId = requestAnimationFrame(step)
  }
}
