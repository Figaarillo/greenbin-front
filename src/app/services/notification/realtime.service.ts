import { inject, Injectable } from '@angular/core'
import { Subject } from 'rxjs'
import { API_BASE_URL } from '../../config/api.config'
import { SesionService } from '../sesion/sesion.service'
import { NotificationCategory } from '../interfaces/notification'

export interface RealtimeEvent {
  category: NotificationCategory
  title: string
  body: string
  data?: Record<string, unknown>
}

const RECONNECT_DELAY_MS = 5000

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly apiBase = inject(API_BASE_URL)
  private readonly sesionService = inject(SesionService)

  private readonly eventsSubject = new Subject<RealtimeEvent>()
  readonly events$ = this.eventsSubject.asObservable()

  private abortController: AbortController | null = null
  private stopped = false
  private reconnectHandle: ReturnType<typeof setTimeout> | null = null

  start(): void {
    // requestSubscription ya en curso o pedido explícitamente detenido: no
    // abrir una segunda conexión en paralelo.
    if (this.abortController != null) return
    this.stopped = false
    void this.connect()
  }

  stop(): void {
    this.stopped = true
    if (this.reconnectHandle != null) {
      clearTimeout(this.reconnectHandle)
      this.reconnectHandle = null
    }
    this.abortController?.abort()
    this.abortController = null
  }

  // fetch + ReadableStream en vez de EventSource nativo: EventSource no
  // permite mandar el header Authorization, y poner el JWT como query param
  // lo expone en logs del server/history del navegador. Con fetch podemos
  // mandar el mismo Bearer token que ya usa el interceptor HTTP normal.
  private async connect(): Promise<void> {
    this.abortController = new AbortController()

    try {
      const response = await fetch(`${this.apiBase}/api/notifications/stream`, {
        headers: {
          Authorization: `Bearer ${this.sesionService.getAccessToken()}`,
          Accept: 'text/event-stream',
          // El ngsw intercepta fetch() para su lógica de caché, y eso rompe
          // una respuesta streaming (text/event-stream) que nunca termina.
          'ngsw-bypass': 'true'
        },
        signal: this.abortController.signal
      })

      if (response.status === 401) {
        // Token inválido/expirado: reintentar no lo arregla, hace falta
        // volver a autenticarse. Se corta el loop y el servicio queda listo
        // para que un start() posterior (post-login) abra la conexión de nuevo.
        this.abortController = null
        return
      }

      if (response.body == null) {
        this.scheduleReconnect()
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      for (;;) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const chunks = buffer.split('\n\n')
        buffer = chunks.pop() ?? ''

        for (const chunk of chunks) {
          const dataLine = chunk.split('\n').find(line => line.startsWith('data:'))
          if (dataLine == null) continue

          try {
            this.eventsSubject.next(JSON.parse(dataLine.slice('data:'.length).trim()) as RealtimeEvent)
          } catch {
            // Chunk corrupto/parcial: se ignora, no vale la pena tirar abajo la conexión por uno.
          }
        }
      }
    } catch {
      // Abort intencional (stop()) o corte de red: en ambos casos cae acá,
      // se distingue con `this.stopped` antes de reintentar.
    }

    this.abortController = null
    this.scheduleReconnect()
  }

  private scheduleReconnect(): void {
    if (this.stopped) return
    this.reconnectHandle = setTimeout(() => {
      this.reconnectHandle = null
      void this.connect()
    }, RECONNECT_DELAY_MS)
  }
}
