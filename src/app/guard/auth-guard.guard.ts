import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { ResponsablesService } from '../services/responsables/responsables.service'
import { VecinoService } from '../services/vecino/vecino.service'
import { LocalAdheridoService } from '../services/local-adherido/local-adherido.service'
import { visitAll } from '@angular/compiler'

export const authGuardGuard: CanActivateFn = async (route, state) => {
  const responServices = inject(ResponsablesService)

  const router = inject(Router)
  const token = localStorage.getItem('accessToken')
  let validate = false
  await responServices.roleValidator().then(
    (resp: any) => {
      console.log('entraadajsk')
      if (resp.data.isValid) {
        validate = resp.data.isValid
      }
    },
    error => {
      validate = false
    }
  )

  if (validate) {
    return true
  } else {
    console.log('entra')
    router.navigateByUrl('/login')
    return false
  }
}
export const vecinoGuard: CanActivateFn = async (route, state) => {
  const neighborServices = inject(VecinoService)

  const router = inject(Router)

  let validate = false
  await neighborServices.roleValidator().then(
    (resp: any) => {
      console.log('entraadajsk')
      if (resp.data.isValid) {
        validate = resp.data.isValid
      }
    },
    error => {
      validate = false
    }
  )

  if (validate) {
    return true
  } else {
    console.log('entra')
    router.navigateByUrl('/login')
    return false
  }
}
export const localGuard: CanActivateFn = async (route, state) => {
  const localServices = inject(LocalAdheridoService)

  const router = inject(Router)
  const token = localStorage.getItem('accessToken')
  let validate = false
  await localServices.roleValidator().then(
    (resp: any) => {
      console.log('entraadajsk')
      if (resp.data.isValid) {
        validate = resp.data.isValid
      }
    },
    error => {
      validate = false
    }
  )

  if (validate) {
    return true
  } else {
    console.log('entra')
    router.navigateByUrl('/login')
    return false
  }
}
