import { HttpInterceptorFn } from '@angular/common/http'
import { finalize } from 'rxjs'
import { LoadingService } from '../services/loading/loading.service'
import { inject } from '@angular/core'

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService)
  loadingService.showLoading()
  return next(req).pipe(
    finalize(async () => {
      loadingService.hideLoading()
    })
  )
}
