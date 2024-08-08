import { Routes } from '@angular/router'

export const routes: Routes = [
  {
    path: 'consultar',
    loadComponent: () =>
      import('./pages/consultar-entidad/consultar-entidad.component').then(m => m.ConsultarEntidadComponent)
  },
  {
    path: 'registrar',
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
  }
]
