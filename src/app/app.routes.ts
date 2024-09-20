import { Routes } from '@angular/router'

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
    loadComponent: () => import('./pages/landing-vecino/landing-vecino.component').then(m => m.LandingVecinoComponent)
  }
]
