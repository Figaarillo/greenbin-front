import { mergeApplicationConfig, ApplicationConfig } from '@angular/core'
import { provideServerRendering } from '@angular/platform-server'
import { appConfig } from './app.config'
import { API_BASE_URL, DEFAULT_API_BASE_URL, RECAPTCHA_SITE_KEY, DEFAULT_RECAPTCHA_SITE_KEY } from './config/api.config'

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    { provide: API_BASE_URL, useFactory: () => process.env['API_URL'] ?? DEFAULT_API_BASE_URL },
    { provide: RECAPTCHA_SITE_KEY, useFactory: () => process.env['RECAPTCHA_SITE_KEY'] ?? DEFAULT_RECAPTCHA_SITE_KEY }
  ]
}

export const config = mergeApplicationConfig(appConfig, serverConfig)
