import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { API_BASE_URL } from '../../config/api.config'
import { Notification, NotificationPreference, NotificationPreferencePatch } from '../interfaces/notification'

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiBase = inject(API_BASE_URL)
  private http = inject(HttpClient)
  private url: string = `${this.apiBase}/api/notifications`

  list(offset = 0, limit = 20): Observable<{ data: Notification[] }> {
    return this.http.get<{ data: Notification[] }>(this.url, { params: { offset, limit } })
  }

  unreadCount(): Observable<{ data: { count: number } }> {
    return this.http.get<{ data: { count: number } }>(`${this.url}/unread-count`)
  }

  markAsRead(id: string): Observable<any> {
    return this.http.put<any>(`${this.url}/${id}/read`, {})
  }

  markAllAsRead(): Observable<any> {
    return this.http.put<any>(`${this.url}/read-all`, {})
  }

  getPreferences(): Observable<{ data: NotificationPreference }> {
    return this.http.get<{ data: NotificationPreference }>(`${this.url}/preferences`)
  }

  updatePreferences(patch: NotificationPreferencePatch): Observable<{ data: NotificationPreference }> {
    return this.http.put<{ data: NotificationPreference }>(`${this.url}/preferences`, patch)
  }
}
