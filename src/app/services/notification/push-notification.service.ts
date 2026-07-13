import { inject, Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { SwPush } from '@angular/service-worker'
import { firstValueFrom } from 'rxjs'
import { filter, take } from 'rxjs/operators'
import { API_BASE_URL } from '../../config/api.config'

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly swPush = inject(SwPush)
  private readonly http = inject(HttpClient)
  private readonly apiBase = inject(API_BASE_URL)
  private readonly url = `${this.apiBase}/api/notifications/push`

  get isSupported(): boolean {
    return this.swPush.isEnabled
  }

  async isSubscribed(): Promise<boolean> {
    if (!this.isSupported) return false
    const subscription = await firstValueFrom(this.swPush.subscription.pipe(take(1)))
    return subscription != null
  }

  async subscribe(): Promise<void> {
    if (!this.isSupported) return

    const { data } = await firstValueFrom(this.http.get<{ data: { publicKey: string } }>(`${this.url}/public-key`))
    const subscription = await this.swPush.requestSubscription({ serverPublicKey: data.publicKey })

    await firstValueFrom(this.http.post(`${this.url}/subscribe`, subscription.toJSON()))
  }

  async unsubscribe(): Promise<void> {
    if (!this.isSupported) return

    const subscription = await firstValueFrom(
      this.swPush.subscription.pipe(
        filter((s): s is PushSubscription => s != null),
        take(1)
      )
    )
    if (subscription == null) return

    await firstValueFrom(this.http.delete(`${this.url}/subscribe`, { body: { endpoint: subscription.endpoint } }))
    await subscription.unsubscribe()
  }
}
