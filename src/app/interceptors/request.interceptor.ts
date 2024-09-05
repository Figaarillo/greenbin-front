import { HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { catchError, tap, throwError } from 'rxjs'
import Swal from 'sweetalert2'

export const requestInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = 'http://localhost:8080'
  const router = inject(Router)
  const routesToNotify: {
    url: string
    method: string
    errorMessage: string
    successMessage: string
    routeToNavigate: string
  }[] = [
    /* ACA ESPECIFICAR LAS RUTAS CON EL METODO EL CUAL NECESITA SER NOTIFICADO EL EXITO O ERROR */
    {
      url: '/api/neighbor/signup',
      method: 'POST',
      errorMessage: 'Error al crear el vecino, por favor revise los datos y vuelva a intentarlo',
      successMessage: 'El vecino se ha creado con exito',
      routeToNavigate: ''
    },
    {
      url: '/api/neighbor',
      method: 'PUT',
      errorMessage: 'Error al editar el vecino, por favor revise los datos y vuelva a intentarlo',
      successMessage: 'El vecino se ha editado con exito',
      routeToNavigate: ''
    }
  ]

  const shouldNotify = routesToNotify.find(route => req.url.includes(apiUrl + route.url) && req.method === route.method)

  return next(req).pipe(
    tap({
      complete: () => {
        if (shouldNotify) {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-success ',
              cancelButton: 'btn btn-danger'
            }
          })
          swalWithBootstrapButtons
            .fire({
              title: '¡Creado con éxito!',
              text: shouldNotify.successMessage,
              icon: 'success'
            })
            .then(() => {
              if (shouldNotify.routeToNavigate.length > 0) {
                router.navigate([shouldNotify.routeToNavigate])
              }
            })
        }
      }
    }),
    catchError((err: any) => {
      if (shouldNotify) {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-success ',
            cancelButton: 'btn btn-danger'
          }
        })
        swalWithBootstrapButtons.fire({
          title: 'Ha ocurrido un error',
          text: shouldNotify.errorMessage,
          icon: 'error'
        })
      }
      return throwError(() => err)
    })
  )
}
