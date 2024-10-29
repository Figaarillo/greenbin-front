import { HttpInterceptorFn } from '@angular/common/http'
import { SesionService } from '../services/sesion/sesion.service'
import { inject } from '@angular/core'
import { catchError, switchMap, throwError } from 'rxjs'
import { IS_REFRESH_TOKEN_REQUEST } from './httpContextToken'

export const sesionInterceptor: HttpInterceptorFn = (req, next) => {
  const sesionService = inject(SesionService)

  return next(req).pipe(
    catchError(error => {
      // Verifica si el error es un 401
      if (error.status === 401) {
        const isRefreshTokenRequest = req.context.get(IS_REFRESH_TOKEN_REQUEST) // Lee la propiedad del contexto
        if (!isRefreshTokenRequest) {
          return sesionService.sendRefreshToken(sesionService.getRole()).pipe(
            switchMap(() => {
              // Si el token fue renovado, vuelve a enviar la petición original
              return next(req)
            }),
            catchError(err => {
              //desloguear y enviar al login
              sesionService.logout()
              return throwError(() => err)
            })
          )
        } else {
          //desloguear y enviar al login
          sesionService.logout()
          //"dropea" el error para que no se propague por los demas interceptors
          return throwError(() => new Error('No Autorizado'))
        }
      }
      // Propaga el errores permitiendo que siga con el curso normal
      return throwError(() => error)
    })
  )
}
