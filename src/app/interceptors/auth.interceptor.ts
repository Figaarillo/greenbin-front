import { HttpInterceptorFn, HttpResponse } from '@angular/common/http'
import { SesionService } from '../services/sesion/sesion.service'
import { inject } from '@angular/core'
import { tap } from 'rxjs'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sesionService = inject(SesionService)

  //si no es una ruta de registro, o peticion de refresh-token, se agrega el encabezado con el bearerToken

  return next(req).pipe(
    tap({
      next: event => {
        if (event instanceof HttpResponse && !req.url.includes('/auth/login')) {
          const token = sesionService.getAccessToken()
          if (token) {
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            })
          }
        }
      }
    })
  )
}
