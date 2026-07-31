import { HttpInterceptorFn } from '@angular/common/http'
import { SesionService } from '../services/sesion/sesion.service'
import { inject } from '@angular/core'
import { IS_REFRESH_TOKEN_REQUEST } from './httpContextToken'

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const sesionService = inject(SesionService)
  const isPublicAuthRoute =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/reset-password')
  //si no es una ruta de registro, login u otra ruta pública de auth, o peticion de refresh-token, se agrega el encabezado con el bearerToken
  if (!isPublicAuthRoute) {
    const accessToken = sesionService.getAccessToken()
    const refreshToken = sesionService.getRefreshToken()
    const isRefreshTokenRequest = req.context.get(IS_REFRESH_TOKEN_REQUEST)
    if (isRefreshTokenRequest && refreshToken != null) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${refreshToken}` } })
    } else if (!isRefreshTokenRequest && accessToken != null) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
    }
  }

  return next(req)
}
