import { Routes } from '@angular/router'
import { authGuardGuard, entityGuard, isLogged, localGuard, vecinoGuard } from './guard/auth-guard.guard'
import { response } from 'express'

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'listar-entidades',
    canActivate: [isLogged],
    loadComponent: () =>
      import('./pages/consultar-entidad/consultar-entidad.component').then(m => m.ConsultarEntidadComponent)
  },
  {
    path: 'listar-responsables',
    canActivate: [isLogged, entityGuard],
    loadComponent: () =>
      import('./pages/consultar-responsables/consultar-responsables.component').then(
        m => m.ConsultarResponsablesComponent
      )
  },
  {
    path: 'consultar-puntos-verdes',
    canActivate: [isLogged, entityGuard],
    loadComponent: () =>
      import('./pages/consultar-puntos-verdes/consultar-puntos-verdes.component').then(
        m => m.ConsultarPuntosVerdesComponent
      )
  },
  {
    path: 'registrar-entidad',
    canActivate: [isLogged],
    loadComponent: () =>
      import('./pages/registrar-entidad/registrar-entidad.component').then(m => m.RegistrarEntidadComponent)
  },
  {
    path: 'modificar-entidad/:id', // Nota el parámetro :id'
    canActivate: [isLogged],
    loadComponent: () =>
      import('./pages/modificar-entidad/modificar-entidad.component').then(m => m.ModificarEntidadComponent)
  },
  {
    path: 'registrar-punto-verde',
    canActivate: [isLogged, entityGuard],
    loadComponent: () =>
      import('./pages/registrar-punto-verde/registrar-punto-verde.component').then(m => m.RegistrarPuntoVerdeComponent)
  },
  {
    path: 'registrar-responsable',
    canActivate: [isLogged, entityGuard],
    loadComponent: () =>
      import('./pages/registrar-responsable/registrar-responsable.component').then(m => m.RegistrarResponsableComponent)
  },
  {
    path: 'modificar-responsable/:id',
    canActivate: [isLogged],
    loadComponent: () =>
      import('./pages/modificar-responsable/modificar-responsable.component').then(m => m.ModificarResponsableComponent)
  },
  {
    path: 'registrar-vecino',
    loadComponent: () =>
      import('./pages/registrar-vecino/registrar-vecino.component').then(m => m.RegistrarVecinoComponent)
  },
  {
    path: 'modificar-vecino',
    canActivate: [isLogged, vecinoGuard],
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
    canActivate: [isLogged, vecinoGuard],
    //canActivate: [vecinoGuard],

    loadComponent: () => import('./pages/landing-vecino/landing-vecino.component').then(m => m.LandingVecinoComponent)
  },
  {
    path: 'responsable',
    canActivate: [isLogged, authGuardGuard],
    //canActivate: [authGuardGuard],
    loadComponent: () =>
      import('./pages/landing-responsable/landing-responsable.component').then(m => m.LandingResponsableComponent)
  },
  {
    path: 'entrega',
    canActivate: [isLogged, authGuardGuard],
    loadComponent: () =>
      import('./pages/entrega-residuos/entrega-residuos.component').then(m => m.EntregaResiduosComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'test',
    loadComponent: () => import('./components/map-view/map-view.component').then(m => m.MapViewComponent)
  },
  {
    path: 'puntos-verdes',
    canActivate: [isLogged, vecinoGuard],
    loadComponent: () => import('./pages/visualizar-pv/visualizar-pv.component').then(m => m.VisualizarPvComponent)
  },
  {
    path: 'entidad',
    canActivate: [isLogged, entityGuard],
    loadComponent: () =>
      import('./pages/entidad-dashboard/entidad-dashboard.component').then(m => m.EntidadDashboardComponent)
  },
  {
    path: 'login-admin',
    loadComponent: () => import('./pages/login-entidad/login-entidad.component').then(m => m.LoginEntidadComponent)
  },
  {
    path: 'cupones',
    canActivate: [isLogged, vecinoGuard],
    loadComponent: () =>
      import('./pages/catalogo-cupones/catalogo-cupones.component').then(m => m.CatalogoCuponesComponent)
  },
  {
    path: 'local',
    canActivate: [isLogged, localGuard],
    loadComponent: () => import('./pages/home-local/home-local.component').then(m => m.HomeLocalComponent)
  },
  {
    path: 'registrar-cupon',
    canActivate: [isLogged, localGuard],
    loadComponent: () =>
      import('./pages/registrar-cupon/registrar-cupon.component').then(m => m.RegistrarCuponComponent)
  },
  {
    path: 'mis-cupones',
    canActivate: [isLogged, vecinoGuard],
    loadComponent: () =>
      import('./pages/mis-cupones-vecino/mis-cupones-vecino.component').then(m => m.MisCuponesVecinoComponent)
  },
  {
    path: 'cupones-ofrecidos',
    canActivate: [isLogged, localGuard],
    loadComponent: () =>
      import('./pages/mis-cupones-local/mis-cupones-local.component').then(m => m.MisCuponesLocalComponent)
  },
  {
    path: 'mis-reciclados',
    //canActivate: [isLogged, localGuard],
    loadComponent: () => import('./pages/mis-reciclados/mis-reciclados.component').then(m => m.MisRecicladosComponent)
  },
  {
    path: 'modificar-local',
    canActivate: [isLogged, localGuard],
    loadComponent: () =>
      import('./pages/modificar-local/modificar-local.component').then(m => m.ModificarLocalComponent)
  },

  {
    path: 'usar-cupon',
    canActivate: [isLogged, localGuard],
    loadComponent: () => import('./pages/usar-cupon/usar-cupon.component').then(m => m.UsarCuponComponent)
  },

  {
    path: 'consultar-vecinos',
    canActivate: [isLogged, entityGuard],
    loadComponent: () =>
      import('./pages/consultar-vecinos/consultar-vecinos.component').then(m => m.ConsultarVecinosComponent)
  },

  {
    path: 'modificar-cupon/:id',
    canActivate: [isLogged, localGuard],
    loadComponent: () =>
      import('./pages/modificar-cupon/modificar-cupon.component').then(m => m.ModificarCuponComponent)
  },

  {
    path: 'consultar-locales',
    canActivate: [isLogged, entityGuard],
    loadComponent: () =>
      import('./pages/consultar-locales/consultar-locales.component').then(m => m.ConsultarLocalesComponent)
  },

  {
    path: 'registrar-categoria',
    canActivate: [isLogged, entityGuard],
    loadComponent: () =>
      import('./pages/registrar-categoria/registrar-categoria.component').then(m => m.RegistrarCategoriaComponent)
  },

  {
    path: 'consultar-categorias',
    canActivate: [isLogged, entityGuard],
    loadComponent: () =>
      import('./pages/consultar-categorias/consultar-categorias.component').then(m => m.ConsultarCategoriasComponent)
  },

  {
    path: 'modificar-categoria/:id',
    canActivate: [isLogged, entityGuard],
    loadComponent: () =>
      import('./pages/modificar-categoria/modificar-categoria.component').then(m => m.ModificarCategoriaComponent)
  },

  {
    path: 'modificar-punto-verde/:id',
    canActivate: [isLogged, entityGuard],
    loadComponent: () =>
      import('./pages/modificar-punto-verde/modificar-punto-verde.component').then(m => m.ModificarPuntoVerdeComponent)
  }
]
