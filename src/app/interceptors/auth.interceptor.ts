import { HttpInterceptorFn, HttpResponse } from '@angular/common/http'
import { SesionService } from '../services/sesion/sesion.service'
import { inject } from '@angular/core'
import { tap, catchError, throwError } from 'rxjs'
import { LoginResponse } from '../services/interfaces/login-response'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sesionService = inject(SesionService)
  return next(req).pipe(
    tap({
      next: event => {
        if (event instanceof HttpResponse && req.url.includes('/auth/login')) {
          // Aquí obtienes el objeto de la respuesta
          const loginData = event.body as any // Cambia esto al tipo que esperas
          sesionService.setLoginData(<LoginResponse>loginData.data)
        }
      },
      error: err => {
        // Manejo del error si es necesario
        console.error(err)
      }
    }),
    catchError((err: any) => {
      //aca deberia tratar de usar el refresh login creo nose
      return throwError(() => err)
    })
  )
}
