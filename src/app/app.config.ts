import { ApplicationConfig, isDevMode } from '@angular/core'
import { provideRouter, withViewTransitions } from '@angular/router'

import { routes } from './app.routes'
import { provideClientHydration, withNoHttpTransferCache } from '@angular/platform-browser'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { provideServiceWorker } from '@angular/service-worker'
import { requestInterceptor } from './interceptors/request.interceptor'
import { authInterceptor } from './interceptors/auth.interceptor'
import { loaderInterceptor } from './interceptors/loader.interceptor'
import { sesionInterceptor } from './interceptors/sesion.interceptor'
import { API_BASE_URL, DEFAULT_API_BASE_URL, RECAPTCHA_SITE_KEY, DEFAULT_RECAPTCHA_SITE_KEY } from './config/api.config'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    // El SSR no tiene acceso a localStorage, así que sus peticiones salen sin
    // auth y devuelven vacío. Con el transfer cache activo (default en v17) el
    // cliente reusaba esas respuestas vacías en el primer render y los datos
    // recién cargaban al re-navegar. Lo desactivamos: la hidratación del DOM se
    // mantiene, pero los datos siempre se piden frescos a la red con el token.
    provideClientHydration(withNoHttpTransferCache()),
    provideHttpClient(withInterceptors([requestInterceptor, loaderInterceptor, authInterceptor, sesionInterceptor])),
    provideAnimationsAsync(),
    // El service worker de Angular es lo que permite recibir push con la app cerrada
    // (SwPush escucha el evento 'push' y muestra la notificación del sistema).
    // Deshabilitado en dev porque interfiere con el hot-reload.
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    {
      provide: API_BASE_URL,
      useFactory: () => (globalThis as unknown as { __API_URL__?: string }).__API_URL__ ?? DEFAULT_API_BASE_URL
    },
    {
      provide: RECAPTCHA_SITE_KEY,
      useFactory: () =>
        (globalThis as unknown as { __RECAPTCHA_SITE_KEY__?: string }).__RECAPTCHA_SITE_KEY__ ??
        DEFAULT_RECAPTCHA_SITE_KEY
    }
  ]
}
