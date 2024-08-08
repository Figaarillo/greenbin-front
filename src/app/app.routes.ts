import { Routes } from '@angular/router'
import { ConsultarEntidadComponent } from './pages/consultar-entidad/consultar-entidad.component'

export const routes: Routes = [
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
  }
]
