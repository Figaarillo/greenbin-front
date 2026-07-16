import { Component, DestroyRef, EventEmitter, OnInit, Output, PLATFORM_ID, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { isPlatformBrowser } from '@angular/common'
import { MatBadgeModule } from '@angular/material/badge'
import { MatIconModule } from '@angular/material/icon'
import { NotificationService } from '../../services/notification/notification.service'
import { RealtimeService } from '../../services/notification/realtime.service'

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [MatBadgeModule, MatIconModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss'
})
export class NotificationBellComponent implements OnInit {
  @Output() opened = new EventEmitter<void>()

  private readonly platformId = inject(PLATFORM_ID)
  private readonly notificationService = inject(NotificationService)
  private readonly realtimeService = inject(RealtimeService)
  private readonly destroyRef = inject(DestroyRef)

  readonly unreadCount = signal(0)

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return

    this.refresh()
    // Cada evento que llega por este canal ya representa una notificación
    // recién creada para este usuario (el dispatcher del backend persiste
    // antes de emitir por SSE) — no hace falta pollear, solo refrescar
    // el contador cuando algo nuevo llega.
    this.realtimeService.events$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refresh())
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
