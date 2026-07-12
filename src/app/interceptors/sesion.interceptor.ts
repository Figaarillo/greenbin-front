import { HttpInterceptorFn } from '@angular/common/http'
import { SesionService } from '../services/sesion/sesion.service'
import { inject } from '@angular/core'
import { catchError, switchMap, throwError } from 'rxjs'
import { IS_REFRESH_TOKEN_REQUEST } from './httpContextToken'

export const sesionInterceptor: HttpInterceptorFn = (req, next) => {
  const sesionService = inject(SesionService)

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        const isRefreshTokenRequest = req.context.get(IS_REFRESH_TOKEN_REQUEST)
        if (isRefreshTokenRequest || req.url.includes('/auth/login')) {
          sesionService.logout()
          return throwError(() => error)
        }
        const role = sesionService.getRole()
        if (!role) {
          return throwError(() => error)
        }
        // Refrescar el token y RECIÉN cuando llega el nuevo, reintentar la
        // petición con ese token fresco. Antes se reintentaba en paralelo con
        // el token viejo (getAccessToken aún no actualizado) y el reintento
        // fallaba siempre con 401.
        return sesionService.sendRefreshToken(role).pipe(
          catchError(refreshError => {
            // Solo el fallo del REFRESH en si (token vencido/invalido) implica
            // cerrar sesion. El catchError va ANTES del switchMap a propósito:
            // si en cambio envolviera tambien el reintento, cualquier fallo del
            // reintento (por una razon ajena al login, ej. un 401/500 puntual
            // de OTRO endpoint) cerraba la sesion igual, aunque el refresh
            // hubiera funcionado bien. Esto se notaba con navegacion rapida
            // (ej. boton atras varias veces), donde varios guards disparan
            // validate-role en simultaneo y cualquier reintento con hipo
            // desloguea al usuario sin que su token haya expirado.
            sesionService.logout()
            return throwError(() => refreshError)
          }),
          switchMap(obj => {
            const accessToken = obj.data.accessToken
            sesionService.setAccessToken(accessToken)
            const clonedRequest = req.clone({
              setHeaders: { Authorization: `Bearer ${accessToken}` }
            })
            return next(clonedRequest)
          })
        )
      }
      // Propaga otros errores normalmente
      return throwError(() => error)
    })
  )
}
