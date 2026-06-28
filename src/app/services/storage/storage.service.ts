import { Injectable, PLATFORM_ID, inject } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'

/**
 * SSR-safe wrapper around localStorage.
 *
 * During server-side rendering / prerender there is no `localStorage`
 * (it is a browser-only API), so every method becomes a no-op on the
 * server and returns null. On the browser it delegates to the real
 * localStorage. This keeps the platform guard in ONE place instead of
 * scattering `isPlatformBrowser` across the whole app.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID)
  private readonly isBrowser = isPlatformBrowser(this.platformId)

  getItem(key: string): string | null {
    if (!this.isBrowser) return null
    return localStorage.getItem(key)
  }

  setItem(key: string, value: string): void {
    if (!this.isBrowser) return
    localStorage.setItem(key, value)
  }

  removeItem(key: string): void {
    if (!this.isBrowser) return
    localStorage.removeItem(key)
  }

  clear(): void {
    if (!this.isBrowser) return
    localStorage.clear()
  }
}
