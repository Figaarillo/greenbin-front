import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { ResponsablesService } from '../services/responsables/responsables.service'
import { VecinoService } from '../services/vecino/vecino.service'
import { LocalAdheridoService } from '../services/local-adherido/local-adherido.service'
import { visitAll } from '@angular/compiler'
import { SesionService } from '../services/sesion/sesion.service'
import { EntidadService } from '../services/entidad/entidad.service'
import { SuperadminService } from '../services/superadmin/superadmin.service'

export const isLogged: CanActivateFn = async (route, state) => {
  const router = inject(Router)
  const sesionService = inject(SesionService)
  const token = sesionService.getAccessToken()
  const refresh = sesionService.getRefreshToken()
  if (token && refresh) {
    return true
  } else {
    router.navigateByUrl('')
    return false
  }
}

export const authGuardGuard: CanActivateFn = async (route, state) => {
  const responServices = inject(ResponsablesService)

  const router = inject(Router)
  let validate = false
  await responServices.roleValidator().then(
    (resp: any) => {
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
    router.navigateByUrl('/login')
    return false
  }
}
export const localGuard: CanActivateFn = async (route, state) => {
  const localServices = inject(LocalAdheridoService)

  const router = inject(Router)
  let validate = false
  await localServices.roleValidator().then(
    (resp: any) => {
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
    router.navigateByUrl('/login')
    return false
  }
}
export const entityGuard: CanActivateFn = async (route, state) => {
  const entityServices = inject(EntidadService)

  const router = inject(Router)
  let validate = false
  await entityServices.roleValidator().then(
    (resp: any) => {
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
    router.navigateByUrl('')
    return false
  }
}

export const superadminGuard: CanActivateFn = async (route, state) => {
  const superadminService = inject(SuperadminService)
  const router = inject(Router)
  let validate = false

  await superadminService.roleValidator().then(
    (resp: any) => {
      if (resp?.data?.isValid) {
        validate = true
      }
    },
    () => {
      validate = false
    }
  )

  if (validate) {
    return true
  } else {
    router.navigateByUrl('/superadmin/login')
    return false
  }
}
