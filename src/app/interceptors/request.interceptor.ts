import { HttpInterceptorFn } from '@angular/common/http'
import { catchError, tap, throwError } from 'rxjs'

export const requestInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = 'http://localhost:8080'
  const routesToNotify: { url: string; method: string }[] = [
    /* ACA ESPECIFICAR LAS RUTAS CON EL METODO EL CUAL NECESITA SER NOTIFICADO EL EXITO O ERROR */
    { url: '/api/entity', method: 'POST' },
    { url: '/api/entity', method: 'PUT' },
    { url: '/api/entity', method: 'DELETE' },
    { url: '/api/responsible', method: 'POST' },
    { url: '/api/responsible', method: 'PUT' },
    { url: '/api/responsible', method: 'DELETE' }
  ]

  const shouldNotify = routesToNotify.some(route => req.url.includes(apiUrl + route.url) && req.method === route.method)

  return next(req)
    .pipe /* DESCOMENTAR CUANDO SE IMPLEMENTE EL INTERCEPTOR
    tap(
      { complete: () => {
        if (shouldNotify) {
          alert(`Éxito en la petición a ${req.method} ${req.url}`);
        }
      } 
    }
    ),
    catchError((err:any)=>{
      if (shouldNotify) {
        alert(`Error en la petición a ${req.method} ${req.url}`);
      }
      return throwError(() => err); 
    })*/
    ()
}
