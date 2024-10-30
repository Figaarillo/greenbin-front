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

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([requestInterceptor, loaderInterceptor, authInterceptor, sesionInterceptor])),
    provideAnimationsAsync()
  ]
}
