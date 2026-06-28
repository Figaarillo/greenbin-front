import { ApplicationConfig } from '@angular/core'
import { provideRouter } from '@angular/router'

import { routes } from './app.routes'
import { provideClientHydration } from '@angular/platform-browser'
import { provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { requestInterceptor } from './interceptors/request.interceptor'
import { authInterceptor } from './interceptors/auth.interceptor'
import { loaderInterceptor } from './interceptors/loader.interceptor'
import { sesionInterceptor } from './interceptors/sesion.interceptor'
import { API_BASE_URL, DEFAULT_API_BASE_URL } from './config/api.config'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([requestInterceptor, loaderInterceptor, authInterceptor, sesionInterceptor])),
    provideAnimationsAsync(),
    {
      provide: API_BASE_URL,
      // Injected by the SSR server into the HTML at request time; falls back for `ng serve`.
      useFactory: () => (globalThis as unknown as { __API_URL__?: string }).__API_URL__ ?? DEFAULT_API_BASE_URL
    }
  ]
}
