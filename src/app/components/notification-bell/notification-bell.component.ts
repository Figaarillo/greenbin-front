import { Component, EventEmitter, OnDestroy, OnInit, Output, PLATFORM_ID, inject, signal } from '@angular/core'
import { isPlatformBrowser } from '@angular/common'
import { MatBadgeModule } from '@angular/material/badge'
import { MatIconModule } from '@angular/material/icon'
import { NotificationService } from '../../services/notification/notification.service'

const POLL_INTERVAL_MS = 30000

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [MatBadgeModule, MatIconModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  @Output() opened = new EventEmitter<void>()

  private readonly platformId = inject(PLATFORM_ID)
  private readonly notificationService = inject(NotificationService)
  private pollHandle?: ReturnType<typeof setInterval>

  readonly unreadCount = signal(0)

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return

    this.refresh()
    this.pollHandle = setInterval(() => this.refresh(), POLL_INTERVAL_MS)
  }

  ngOnDestroy(): void {
    if (this.pollHandle != null) clearInterval(this.pollHandle)
  }

  refresh(): void {
    this.notificationService.unreadCount().subscribe({
      next: resp => this.unreadCount.set(resp.data.count),
      error: () => {}
    })
  }

  onClick(): void {
    this.opened.emit()
  }
}
