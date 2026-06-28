import { mergeApplicationConfig, ApplicationConfig } from '@angular/core'
import { provideServerRendering } from '@angular/platform-server'
import { appConfig } from './app.config'
import { API_BASE_URL, DEFAULT_API_BASE_URL } from './config/api.config'

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    // On the server, the API host comes from the runtime environment.
    { provide: API_BASE_URL, useFactory: () => process.env['API_URL'] ?? DEFAULT_API_BASE_URL }
  ]
}

export const config = mergeApplicationConfig(appConfig, serverConfig)
