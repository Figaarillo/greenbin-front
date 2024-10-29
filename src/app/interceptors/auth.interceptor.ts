import { HttpInterceptorFn, HttpResponse } from '@angular/common/http'
import { SesionService } from '../services/sesion/sesion.service'
import { inject } from '@angular/core'
import { tap } from 'rxjs'
import { LoginResponse } from '../services/interfaces/login-response'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sesionService = inject(SesionService)

  //si no es una ruta de registro, o peticion de refresh-token, se agrega el encabezado con el bearerToken

  return next(req).pipe(
    tap({
      next: event => {
        if (event instanceof HttpResponse && req.url.includes('/auth/login')) {
          // Aquí obtienes el objeto de la respuesta
          const loginData = event.body as any // Cambia esto al tipo que esperas
          sesionService.setLoginData(<LoginResponse>loginData.data)
        } else {
          //agregar el token al header
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
