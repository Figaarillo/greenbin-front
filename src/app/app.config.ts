import { ApplicationConfig } from '@angular/core'
import { provideRouter, withViewTransitions } from '@angular/router'

import { routes } from './app.routes'
import { provideClientHydration } from '@angular/platform-browser'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { requestInterceptor } from './interceptors/request.interceptor'
import { authInterceptor } from './interceptors/auth.interceptor'
import { loaderInterceptor } from './interceptors/loader.interceptor'
import { sesionInterceptor } from './interceptors/sesion.interceptor'
import { API_BASE_URL, DEFAULT_API_BASE_URL, RECAPTCHA_SITE_KEY, DEFAULT_RECAPTCHA_SITE_KEY } from './config/api.config'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withViewTransitions()),
    provideClientHydration(),
    provideHttpClient(withInterceptors([requestInterceptor, loaderInterceptor, authInterceptor, sesionInterceptor])),
    provideAnimationsAsync(),
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
