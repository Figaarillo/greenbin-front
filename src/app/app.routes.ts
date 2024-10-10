import { Routes } from '@angular/router'
import { authGuardGuard, vecinoGuard } from './guard/auth-guard.guard'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'listar-entidades',
    loadComponent: () =>
      import('./pages/consultar-entidad/consultar-entidad.component').then(m => m.ConsultarEntidadComponent)
  },
  {
    path: 'listar-responsables',
    loadComponent: () =>
      import('./pages/consultar-responsables/consultar-responsables.component').then(
        m => m.ConsultarResponsablesComponent
      )
  },
  {
    path: 'registrar-entidad',
    loadComponent: () =>
      import('./pages/registrar-entidad/registrar-entidad.component').then(m => m.RegistrarEntidadComponent)
  },
  {
    path: 'modificar-entidad/:id', // Nota el parámetro :id'
    loadComponent: () =>
      import('./pages/modificar-entidad/modificar-entidad.component').then(m => m.ModificarEntidadComponent)
  },
  {
    path: 'registrar-punto-verde',
    loadComponent: () =>
      import('./pages/registrar-punto-verde/registrar-punto-verde.component').then(m => m.RegistrarPuntoVerdeComponent)
  },
  {
    path: 'registrar-responsable',
    loadComponent: () =>
      import('./pages/registrar-responsable/registrar-responsable.component').then(m => m.RegistrarResponsableComponent)
  },
  {
    path: 'modificar-responsable/:id',
    loadComponent: () =>
      import('./pages/modificar-responsable/modificar-responsable.component').then(m => m.ModificarResponsableComponent)
  },
  {
    path: 'registrar-vecino',
    loadComponent: () =>
      import('./pages/registrar-vecino/registrar-vecino.component').then(m => m.RegistrarVecinoComponent)
  },
  {
    path: 'modificar-vecino/:id', // Nota el parámetro :id'
    loadComponent: () =>
      import('./pages/modificar-vecino/modificar-vecino.component').then(m => m.ModificarVecinoComponent)
  },
  {
    path: 'registrar-local',
    loadComponent: () =>
      import('./pages/registrar-local/registrar-local.component').then(m => m.RegistrarLocalComponent)
  },
  {
    path: 'vecino',
    canActivate: [vecinoGuard],

    loadComponent: () => import('./pages/landing-vecino/landing-vecino.component').then(m => m.LandingVecinoComponent)
  },
  {
    path: 'responsable',
    canActivate: [authGuardGuard],
    loadComponent: () =>
      import('./pages/landing-responsable/landing-responsable.component').then(m => m.LandingResponsableComponent)
  },
  {
    path: 'entrega',
    loadComponent: () =>
      import('./pages/entrega-residuos/entrega-residuos.component').then(m => m.EntregaResiduosComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  }
]
