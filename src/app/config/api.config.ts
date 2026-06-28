import { InjectionToken } from '@angular/core'

/**
 * Base URL of the backend API host — host only, no trailing slash, no `/api`.
 *
 * Resolved at RUNTIME so the same build can target different backends:
 *  - On the server (SSR): from `process.env['API_URL']` (see app.config.server.ts).
 *  - On the browser: from `window.__API_URL__`, which the SSR server injects
 *    into the HTML at request time (see server.ts), falling back to the default.
 *
 * Set `API_URL` in the Railway dashboard to your public backend URL.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL')

/** Fallback used for local dev when no runtime value is provided. */
export const DEFAULT_API_BASE_URL = 'http://localhost:8080'
