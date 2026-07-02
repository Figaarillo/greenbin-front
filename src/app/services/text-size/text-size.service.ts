import { Injectable, PLATFORM_ID, inject } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { StorageService } from '../storage/storage.service'

export type TextSize = 'normal' | 'large'

const STORAGE_KEY = 'gb-text-size'

@Injectable({
  providedIn: 'root'
})
export class TextSizeService {
  private readonly storage = inject(StorageService)
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))

  getSize(): TextSize {
    return this.storage.getItem(STORAGE_KEY) === 'large' ? 'large' : 'normal'
  }

  setSize(size: TextSize): void {
    this.storage.setItem(STORAGE_KEY, size)
    this.apply(size)
  }

  toggle(): TextSize {
    const next: TextSize = this.getSize() === 'normal' ? 'large' : 'normal'
    this.setSize(next)
    return next
  }

  /** Aplica la clase al <html>. Llamar al bootear la app y tras cada cambio. */
  apply(size: TextSize = this.getSize()): void {
    if (!this.isBrowser) return
    document.documentElement.classList.toggle('gb-text-lg', size === 'large')
  }
}
