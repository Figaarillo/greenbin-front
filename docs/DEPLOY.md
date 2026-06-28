# Deploy del front (GreenBin) en Railway — guía de estudio

> Estado: el build SSR es deployable (`pnpm run build` → exit 0). Este documento
> explica QUÉ se hizo, POR QUÉ, y los próximos pasos.

## Parte 1 — Los 3 conceptos que hay que entender

### 1.1 SSR ≠ Prerender ≠ SPA

| | Dónde corre tu componente | Cuándo |
|---|---|---|
| **SPA** | Solo en el navegador | Cuando el usuario abre la página |
| **SSR** | En el servidor (Node) y luego en el navegador | En cada request, en runtime |
| **Prerender (SSG)** | En el servidor (Node) | En build-time, genera HTML estático |

La app tenía SSR **y** prerender. El prerender ejecuta TODAS las rutas en Node
durante la compilación; ahí es donde reventaba el build.

### 1.2 El navegador y Node son dos mundos distintos

Cuando un componente corre en Node (SSR o prerender) **no existe el navegador**:
no hay `localStorage`, `window`, `document` (Angular lo simula parcialmente con
domino), `google` (Maps), `history`. Acceder a ellos directo tira
`ReferenceError: X is not defined`. Ese fue el error original (`localStorage`).

> Regla SSR: todo acceso a una API del navegador va guardado por
> `isPlatformBrowser()` o detrás de una abstracción que lo haga.

### 1.3 El bundle del navegador es estático

El JS del navegador queda congelado en el build y se descarga en la máquina del
usuario; **no puede leer las env vars de Railway** (viven en el servidor). Por eso
`localhost:8080` hardcodeado rompe en producción aunque el build pase.

## Parte 2 — Diagnóstico

El primer build parecía colgado (CPU congelada, sin output): la salida se perdía
en la cadena `npm → npx → ng` sin TTY. El proceso estaba dormido en `epoll_wait`.
Al matarlo y releer el log apareció lo real: decenas de
`localStorage is not defined`.

> Lección: "el build se cuelga" rara vez es lo que parece. Andá al log y al
> proceso reales.

## Parte 3 — Los fixes

### 3.1 `StorageService` SSR-safe
Guard de plataforma centralizado en una sola clase
(`src/app/services/storage/storage.service.ts`). Todo el código pasó de
`localStorage.X` a `this.storage.X`. En el server devuelve `null`/no-op; en el
browser usa el `localStorage` real.

### 3.2 Prerender apagado, SSR mantenido
`angular.json`: `"prerender": false`. El build deja de ejecutar componentes en
build-time. SSR sigue corriendo por request en Railway. Prerender no aporta nada
en una app detrás de login.

### 3.3 pnpm forzado
`packageManager: pnpm@9.6.0`, `engines`, `preinstall: only-allow pnpm` (bloquea
npm/yarn), `package-lock.json` borrado, `pnpm-lock.yaml` regenerado (corrige el
mismatch `@angular/google-maps` 18 vs 17). CI migrado a pnpm.

### 3.4 `railway.json`
Build `pnpm run build`; start `node dist/greenbin-front/server/server.mjs` (NO
`pnpm start`, que es `ng serve`).

### 3.5 API URL en runtime
`InjectionToken API_BASE_URL` (`src/app/config/api.config.ts`):
- Server: lee `process.env['API_URL']` (`app.config.server.ts`).
- `server.ts` inyecta `window.__API_URL__` en el HTML.
- Browser: lo lee (`app.config.ts`).

```
Railway env API_URL ─▶ server.ts (process.env) ─▶ <script>window.__API_URL__=…</script> ─▶ browser
```

## Parte 4 — Próximos pasos

**Para deployar y que funcione**
1. En Railway: setear `API_URL` = URL pública del backend.
2. Conectar el repo (auto-deploy) y pushear.
3. Habilitar **CORS** en el backend para el dominio del front.

**Calidad**
4. ✅ Mapas envueltos en `@defer (on immediate)` (4 templates) → no se
   renderizan en SSR (se acabaron los `google is not defined`) y se
   lazy-loadean en el cliente.
5. Tests: los specs default fueron eliminados (estaban rotos / mal
   configurados). **La infra de testing queda intacta** (target de karma en
   `angular.json`, `tsconfig.spec.json`, devDeps jasmine/karma, script
   `test`). Para reactivar: agregar specs limpios y restaurar el step en
   `.github/workflows/main.yml` con un launcher `ChromeHeadlessNoSandbox`:
   ```js
   // karma.conf.js
   browsers: ['ChromeHeadlessNoSandbox'],
   customLaunchers: {
     ChromeHeadlessNoSandbox: { base: 'ChromeHeadless', flags: ['--no-sandbox', '--disable-gpu'] }
   }
   ```
6. ✅ `scripts/npm-build-wrapper.js` borrado (el build es `ng build` pelado).

**Arquitectura**
7. Reevaluar si se necesita SSR (app auth-gated → SPA podría ser mejor).
8. Seguridad: JWT en `localStorage` queda expuesto a XSS; evaluar cookies `httpOnly`.
9. Bundle inicial ~977kb: lazy-loading de rutas con `loadComponent`.
