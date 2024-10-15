import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { ResponsableService } from '../services/responsable/responsable.service'
import { VecinoService } from '../services/vecino/vecino.service'
import { LocalAdheridoService } from '../services/local-adherido/local-adherido.service'
import { catchError, switchMap, throwError } from 'rxjs'

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const respoService = inject(ResponsableService)
  const neighborServ = inject(VecinoService)
  const localServ = inject(LocalAdheridoService)

  const token = localStorage.getItem('accessToken') || ''
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  })
  return next(authReq).pipe(
    catchError(err => {
      return respoService.refreshToken().pipe(
        switchMap(res => {
          localStorage.setItem('accessToken', res.data.accessToken)
          const newReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${res.accessToken}`
            }
          })

          return next(newReq)
        }),
        catchError(refreshErr => {
          const error = new Error(refreshErr)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          return throwError(() => error)
        })
      )
    })
  )
}
