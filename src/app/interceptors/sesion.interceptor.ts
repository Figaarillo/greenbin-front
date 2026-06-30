import { HttpInterceptorFn } from '@angular/common/http'
import { SesionService } from '../services/sesion/sesion.service'
import { inject } from '@angular/core'
import { catchError, throwError } from 'rxjs'
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
        //refrescar el token (ESTAS PETICIONES SIGUIENTES NO PASARAN POR LOS INTERCEPTORS ANTERIORES)
        sesionService.sendRefreshToken(sesionService.getRole()).subscribe(obj => {
          sesionService.setAccessToken(obj.data.accessToken)
          sesionService.sendRefreshToken(obj.data.refreshToken)
        })
        //volver a enviar la peticion
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${sesionService.getAccessToken()}`
          }
        })
        return next(clonedRequest)
      }
      // Propaga otros errores normalmente
      return throwError(() => error)
    })
  )
}
