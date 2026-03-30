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
      url: '/api/neighbor',
      method: 'POST',
      errorMessage: 'Error al crear el vecino, por favor revise los datos y vuelva a intentarlo',
      successMessage: 'El vecino se ha creado con éxito',
      routeToNavigate: '/vecino'
    },
    // {
    //   url: '/api/neighbor',
    //   method: 'PUT',
    //   errorMessage: 'Error al editar el vecino, por favor revise los datos y vuelva a intentarlo',
    //   successMessage: 'El vecino se ha editado con éxito',
    //   routeToNavigate: ''
    // },
    {
      url: '/api/neighbor/auth/login',
      method: 'POST',
      errorMessage: 'Usuario o contraseña incorrecta',
      successMessage: 'Bienvenido',
      routeToNavigate: '/vecino'
    },
    {
      url: '/api/responsible/auth/login',
      method: 'POST',
      errorMessage: 'Usuario o contraseña incorrecta',
      successMessage: 'Bienvenido',
      routeToNavigate: '/responsable'
    },
    {
      url: '/api/reward-partner/auth/login',
      method: 'POST',
      errorMessage: 'Usuario o contraseña incorrecta',
      successMessage: 'Bienvenido',
      routeToNavigate: '/local'
    },
    {
      url: '/api/green-point',
      method: 'POST',
      errorMessage: 'Error al crear el punto verde, por favor revise los datos y vuelva a intentarlo',
      successMessage: 'El punto verde se ha creado con éxito',
      routeToNavigate: '/entidad'
    },
    {
      url: '/api/neighbor',
      method: 'POST',
      errorMessage: 'Error al crear el vecino, por favor revise los datos y vuelva a intentarlo',
      successMessage: 'El vecino se ha creado con éxito',
      routeToNavigate: '/vecino'
    },
    {
      url: '/api/neighbor',
      method: 'PUT',
      errorMessage: 'Error al editar el vecino, por favor revise los datos y vuelva a intentarlo',
      successMessage: 'El vecino se ha editado con éxito',
      routeToNavigate: ''
    },
    {
      url: '/api/coupon',
      method: 'POST',
      errorMessage: 'Error al crear el cupón, por favor revise los datos y vuelva a intentarlo',
      successMessage: 'El cupón se ha creado con éxito',
      routeToNavigate: '/local'
    },
    {
      url: '/api/redeem-coupon',
      method: 'POST',
      errorMessage:
        'Error al comprar el cupón, por favor revise los datos y vuelva a intentarlo. Recuerda que puedes canjear solo 1 vez el cupón.',
      successMessage: 'El cupón se ha comprado con éxito',
      routeToNavigate: ''
    },
    {
      url: '/api/coupon-transaction/use',
      method: 'POST',
      errorMessage: 'Código inválido o cupón no disponible.',
      successMessage: 'Cupón utilizado con éxito',
      routeToNavigate: ''
    },

    {
      url: '/api/waste-category',
      method: 'POST',
      errorMessage: 'Error al crear la categoría, por favor revise los datos y vuelva a intentarlo',
      successMessage: 'La categoría se ha creado con éxito',
      routeToNavigate: '/entidad'
    },

    {
      url: '/api/waste-category/:id',
      method: 'PUT',
      errorMessage: 'Error al modificar la categoría, por favor revise los datos y vuelva a intentarlo',
      successMessage: 'La categoría se ha modificado con éxito',
      routeToNavigate: '/consultar-categorias'
    }
  ]

  const shouldNotify = routesToNotify.find(route => {
    if (route.method !== req.method) return false
    if (route.url.includes(':id')) return req.url.startsWith(apiUrl + route.url.replace('/:id', '/'))
    return req.url === apiUrl + route.url
  })

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
              title: '¡Genial!',
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
