import { Routes } from '@angular/router'
import { ConsultarEntidadComponent } from './pages/consultar-entidad/consultar-entidad.component'

export const routes: Routes = [
  {
    path: 'consultar',
    loadComponent: () =>
      import('./pages/consultar-entidad/consultar-entidad.component').then(m => m.ConsultarEntidadComponent)
  }
]
