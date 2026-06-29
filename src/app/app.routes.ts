import { Routes } from '@angular/router'
import {
  authGuardGuard,
  entityGuard,
  isLogged,
  localGuard,
  superadminGuard,
  vecinoGuard
} from './guard/auth-guard.guard'
import { response } from 'express'

export const routes: Routes = [
  {
    path: '',
    data: { animation: 'homePage' },
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'listar-entidades',
    canActivate: [isLogged],
    loadComponent: () =>
      import('./pages/consultar-entidad/consultar-entidad.component').then(m => m.ConsultarEntidadComponent)
  },
  {
    path: 'registrar-entidad',
    canActivate: [isLogged],
    loadComponent: () =>
      import('./pages/registrar-entidad/registrar-entidad.component').then(m => m.RegistrarEntidadComponent)
  },
  {
    path: 'modificar-entidad/:id',
    canActivate: [isLogged],
    loadComponent: () =>
      import('./pages/modificar-entidad/modificar-entidad.component').then(m => m.ModificarEntidadComponent)
  },
  // ── Flat registrations (no layout) ────────────────
  {
    path: 'registrar-vecino',
    loadComponent: () =>
      import('./pages/registrar-vecino/registrar-vecino.component').then(m => m.RegistrarVecinoComponent)
  },
  {
    path: 'registrar-local',
    loadComponent: () =>
      import('./pages/registrar-local/registrar-local.component').then(m => m.RegistrarLocalComponent)
  },
  // ── Auth ───────────────────────────────────────────
  {
    path: 'login',
    data: { animation: 'loginPage' },
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'login-admin',
    data: { animation: 'loginPage' },
    loadComponent: () => import('./pages/login-entidad/login-entidad.component').then(m => m.LoginEntidadComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'superadmin/login',
    data: { animation: 'loginPage' },
    loadComponent: () =>
      import('./pages/login-superadmin/login-superadmin.component').then(m => m.LoginSuperadminComponent)
  },
  // ── Superadmin ─────────────────────────────────────
  {
    path: 'superadmin/dashboard',
    canActivate: [superadminGuard],
    loadComponent: () =>
      import('./pages/superadmin-dashboard/superadmin-dashboard.component').then(m => m.SuperadminDashboardComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/superadmin-overview/superadmin-overview.component').then(m => m.SuperadminOverviewComponent)
      },
      {
        path: 'registrar-entidad',
        loadComponent: () =>
          import('./pages/superadmin-registrar-entidad/superadmin-registrar-entidad.component').then(
            m => m.SuperadminRegistrarEntidadComponent
          )
      },
      {
        path: 'listar-entidades',
        loadComponent: () =>
          import('./pages/superadmin-listar-entidades/superadmin-listar-entidades.component').then(
            m => m.SuperadminListarEntidadesComponent
          )
      }
    ]
  },
  // ── Shared across roles (no specific layout) ─────
  {
    path: 'entrega',
    canActivate: [isLogged, authGuardGuard],
    loadComponent: () =>
      import('./pages/entrega-residuos/entrega-residuos.component').then(m => m.EntregaResiduosComponent)
  },
  {
    path: 'test',
    loadComponent: () => import('./components/map-view/map-view.component').then(m => m.MapViewComponent)
  },
  // ── Modificar pages (keep flat, may be accessed from outside layouts) ──
  {
    path: 'modificar-responsable/:id',
    canActivate: [isLogged],
    loadComponent: () =>
      import('./pages/modificar-responsable/modificar-responsable.component').then(m => m.ModificarResponsableComponent)
  },
  {
    path: 'modificar-cupon/:id',
    canActivate: [isLogged, localGuard],
    loadComponent: () =>
      import('./pages/modificar-cupon/modificar-cupon.component').then(m => m.ModificarCuponComponent)
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
  },
  // ══════════════════════════════════════════════════════════
  //  LAYOUT PARENTS (sidebar + router-outlet per role)
  // ══════════════════════════════════════════════════════════

  // ── Vecino layout ───────────────────────────────────
  {
    path: 'vecino',
    data: { role: 'vecino' },
    canActivate: [isLogged, vecinoGuard],
    loadComponent: () => import('./layouts/role-layout/role-layout.component').then(m => m.RoleLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./pages/landing-vecino/landing-vecino.component').then(m => m.LandingVecinoComponent)
      },
      {
        path: 'mis-cupones',
        canActivate: [isLogged, vecinoGuard],
        loadComponent: () =>
          import('./pages/mis-cupones-vecino/mis-cupones-vecino.component').then(m => m.MisCuponesVecinoComponent)
      },
      {
        path: 'puntos-verdes',
        canActivate: [isLogged, vecinoGuard],
        loadComponent: () => import('./pages/visualizar-pv/visualizar-pv.component').then(m => m.VisualizarPvComponent)
      },
      {
        path: 'modificar-vecino',
        canActivate: [isLogged, vecinoGuard],
        loadComponent: () =>
          import('./pages/modificar-vecino/modificar-vecino.component').then(m => m.ModificarVecinoComponent)
      },
      {
        path: 'mis-reciclados',
        loadComponent: () =>
          import('./pages/mis-reciclados/mis-reciclados.component').then(m => m.MisRecicladosComponent)
      },
      {
        path: 'cupones',
        canActivate: [isLogged, vecinoGuard],
        loadComponent: () =>
          import('./pages/catalogo-cupones/catalogo-cupones.component').then(m => m.CatalogoCuponesComponent)
      }
    ]
  },
  // ── Responsable layout ──────────────────────────────
  {
    path: 'responsable',
    data: { role: 'responsable' },
    canActivate: [isLogged, authGuardGuard],
    loadComponent: () => import('./layouts/role-layout/role-layout.component').then(m => m.RoleLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./pages/landing-responsable/landing-responsable.component').then(m => m.LandingResponsableComponent)
      },
      {
        path: 'historial-responsable',
        canActivate: [isLogged, authGuardGuard],
        loadComponent: () =>
          import('./pages/historial-responsable/historial-responsable.component').then(
            m => m.HistorialResponsableComponent
          )
      }
    ]
  },
  // ── Local layout ────────────────────────────────────
  {
    path: 'local',
    data: { role: 'local' },
    canActivate: [isLogged, localGuard],
    loadComponent: () => import('./layouts/role-layout/role-layout.component').then(m => m.RoleLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        loadComponent: () => import('./pages/home-local/home-local.component').then(m => m.HomeLocalComponent)
      },
      {
        path: 'cupones-ofrecidos',
        canActivate: [isLogged, localGuard],
        loadComponent: () =>
          import('./pages/mis-cupones-local/mis-cupones-local.component').then(m => m.MisCuponesLocalComponent)
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
        path: 'registrar-cupon',
        canActivate: [isLogged, localGuard],
        loadComponent: () =>
          import('./pages/registrar-cupon/registrar-cupon.component').then(m => m.RegistrarCuponComponent)
      },
      {
        path: 'estadisticas-local',
        canActivate: [isLogged, localGuard],
        loadComponent: () =>
          import('./pages/estadisticas-local/estadisticas-local.component').then(m => m.EstadisticasLocalComponent)
      }
    ]
  },
  // ── Entity layout (sidebar + router-outlet) ──────────
  {
    path: 'entidad',
    canActivate: [isLogged, entityGuard],
    loadComponent: () => import('./layouts/entity-layout/entity-layout.component').then(m => m.EntityLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/entidad-dashboard/entidad-dashboard.component').then(m => m.EntidadDashboardComponent)
      },
      {
        path: 'registrar-responsable',
        loadComponent: () =>
          import('./pages/registrar-responsable/registrar-responsable.component').then(
            m => m.RegistrarResponsableComponent
          )
      },
      {
        path: 'listar-responsables',
        loadComponent: () =>
          import('./pages/consultar-responsables/consultar-responsables.component').then(
            m => m.ConsultarResponsablesComponent
          )
      },
      {
        path: 'registrar-punto-verde',
        loadComponent: () =>
          import('./pages/registrar-punto-verde/registrar-punto-verde.component').then(
            m => m.RegistrarPuntoVerdeComponent
          )
      },
      {
        path: 'consultar-puntos-verdes',
        loadComponent: () =>
          import('./pages/consultar-puntos-verdes/consultar-puntos-verdes.component').then(
            m => m.ConsultarPuntosVerdesComponent
          )
      },
      {
        path: 'consultar-vecinos',
        loadComponent: () =>
          import('./pages/consultar-vecinos/consultar-vecinos.component').then(m => m.ConsultarVecinosComponent)
      },
      {
        path: 'consultar-locales',
        loadComponent: () =>
          import('./pages/consultar-locales/consultar-locales.component').then(m => m.ConsultarLocalesComponent)
      },
      {
        path: 'registrar-categoria',
        loadComponent: () =>
          import('./pages/registrar-categoria/registrar-categoria.component').then(m => m.RegistrarCategoriaComponent)
      },
      {
        path: 'consultar-categorias',
        loadComponent: () =>
          import('./pages/consultar-categorias/consultar-categorias.component').then(
            m => m.ConsultarCategoriasComponent
          )
      }
    ]
  },
  // ══════════════════════════════════════════════════════════
  //  LEGACY REDIRECTS (flat routes → layout children)
  // ══════════════════════════════════════════════════════════
  // Vecino
  { path: 'puntos-verdes', redirectTo: 'vecino/puntos-verdes', pathMatch: 'full' },
  { path: 'cupones', redirectTo: 'vecino/cupones', pathMatch: 'full' },
  { path: 'mis-cupones', redirectTo: 'vecino/mis-cupones', pathMatch: 'full' },
  { path: 'modificar-vecino', redirectTo: 'vecino/modificar-vecino', pathMatch: 'full' },
  { path: 'mis-reciclados', redirectTo: 'vecino/mis-reciclados', pathMatch: 'full' },
  // Responsable
  { path: 'historial-responsable', redirectTo: 'responsable/historial-responsable', pathMatch: 'full' },
  // Local
  { path: 'estadisticas-local', redirectTo: 'local/estadisticas-local', pathMatch: 'full' },
  { path: 'cupones-ofrecidos', redirectTo: 'local/cupones-ofrecidos', pathMatch: 'full' },
  { path: 'modificar-local', redirectTo: 'local/modificar-local', pathMatch: 'full' },
  { path: 'usar-cupon', redirectTo: 'local/usar-cupon', pathMatch: 'full' },
  { path: 'registrar-cupon', redirectTo: 'local/registrar-cupon', pathMatch: 'full' },
  // Entity
  { path: 'listar-responsables', redirectTo: 'entidad/listar-responsables', pathMatch: 'full' },
  { path: 'consultar-puntos-verdes', redirectTo: 'entidad/consultar-puntos-verdes', pathMatch: 'full' },
  { path: 'registrar-punto-verde', redirectTo: 'entidad/registrar-punto-verde', pathMatch: 'full' },
  { path: 'registrar-responsable', redirectTo: 'entidad/registrar-responsable', pathMatch: 'full' },
  { path: 'consultar-vecinos', redirectTo: 'entidad/consultar-vecinos', pathMatch: 'full' },
  { path: 'consultar-locales', redirectTo: 'entidad/consultar-locales', pathMatch: 'full' },
  { path: 'registrar-categoria', redirectTo: 'entidad/registrar-categoria', pathMatch: 'full' },
  { path: 'consultar-categorias', redirectTo: 'entidad/consultar-categorias', pathMatch: 'full' }
]
