import { Injectable, PLATFORM_ID, inject } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { StorageService } from '../storage/storage.service'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'gb-theme'

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly storage = inject(StorageService)
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))

  getTheme(): ThemeMode {
    return this.storage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  }

  setTheme(mode: ThemeMode): void {
    this.storage.setItem(STORAGE_KEY, mode)
    this.apply(mode)
  }

  toggle(): ThemeMode {
    const next: ThemeMode = this.getTheme() === 'light' ? 'dark' : 'light'
    this.setTheme(next)
    return next
  }

  /** Aplica el atributo al <html>. Llamar al bootear la app y tras cada cambio. */
  apply(mode: ThemeMode = this.getTheme()): void {
    if (!this.isBrowser) return
    document.documentElement.setAttribute('data-theme', mode)
  }
}
