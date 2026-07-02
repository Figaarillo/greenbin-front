import { Injectable, inject } from '@angular/core'
import { StorageService } from '../storage/storage.service'

const STORAGE_KEY = 'gb-notifications-enabled'

/**
 * MOCK: solo persiste la preferencia del usuario. No pide permisos de
 * notificación ni dispara ninguna suscripción push real todavía — es un
 * placeholder de UI a la espera de que se implemente el envío real.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationsPrefService {
  private readonly storage = inject(StorageService)

  isEnabled(): boolean {
    return this.storage.getItem(STORAGE_KEY) === 'true'
  }

  setEnabled(enabled: boolean): void {
    this.storage.setItem(STORAGE_KEY, String(enabled))
  }

  toggle(): boolean {
    const next = !this.isEnabled()
    this.setEnabled(next)
    return next
  }
}
