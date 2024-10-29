import { HttpInterceptorFn } from '@angular/common/http'

export const sesionInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req)
}
