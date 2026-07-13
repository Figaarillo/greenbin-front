import { Component, EventEmitter, Output, inject, signal, viewChild } from '@angular/core'
import { DatePipe } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component'
import { SkeletonComponent } from '../skeleton/skeleton.component'
import { NotificationService } from '../../services/notification/notification.service'
import { PushNotificationService } from '../../services/notification/push-notification.service'
import { Notification, NotificationCategory } from '../../services/interfaces/notification'

const CATEGORY_ICONS: Record<NotificationCategory, string> = {
  COUPON_PURCHASED: 'local_activity',
  COUPON_REDEEMED: 'redeem',
  COUPON_CREATED: 'add_circle',
  POINTS_DELIVERED: 'arrow_upward'
}

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [DatePipe, MatIconModule, BottomSheetComponent, SkeletonComponent],
  templateUrl: './notification-panel.component.html',
  styleUrl: './notification-panel.component.scss'
})
export class NotificationPanelComponent {
  @Output() closed = new EventEmitter<void>()

  private readonly notificationService = inject(NotificationService)
  private readonly pushNotificationService = inject(PushNotificationService)
  private readonly sheet = viewChild.required(BottomSheetComponent)

  readonly loading = signal(true)
  readonly notifications = signal<Notification[]>([])
  readonly pushSupported = signal(false)
  readonly pushSubscribed = signal(false)

  open(): void {
    this.sheet().open()
    this.fetch()
    this.refreshPushState()
  }

  closeSheet(): void {
    this.sheet().closeSheet()
  }

  onSheetClosed(): void {
    this.closed.emit()
  }

  hasUnread(): boolean {
    return this.notifications().some(n => n.readAt == null)
  }

  iconFor(category: NotificationCategory): string {
    return CATEGORY_ICONS[category]
  }

  onNotificationClick(notification: Notification): void {
    if (notification.readAt != null) return

    this.notifications.update(list =>
      list.map(n => (n.id === notification.id ? { ...n, readAt: new Date().toISOString() } : n))
    )
    this.notificationService.markAsRead(notification.id).subscribe({ error: () => {} })
  }

  markAllAsRead(): void {
    const now = new Date().toISOString()
    this.notifications.update(list => list.map(n => ({ ...n, readAt: n.readAt ?? now })))
    this.notificationService.markAllAsRead().subscribe({ error: () => {} })
  }

  async togglePush(): Promise<void> {
    try {
      if (this.pushSubscribed()) {
        await this.pushNotificationService.unsubscribe()
      } else {
        await this.pushNotificationService.subscribe()
      }
    } catch (error) {
      console.error('No se pudo actualizar la suscripción a notificaciones push', error)
    }
    await this.refreshPushState()
  }

  private async refreshPushState(): Promise<void> {
    this.pushSupported.set(this.pushNotificationService.isSupported)
    if (!this.pushSupported()) return
    this.pushSubscribed.set(await this.pushNotificationService.isSubscribed())
  }

  private fetch(): void {
    this.loading.set(true)
    this.notificationService.list().subscribe({
      next: resp => {
        this.notifications.set(resp.data)
        this.loading.set(false)
      },
      error: () => this.loading.set(false)
    })
  }
}
