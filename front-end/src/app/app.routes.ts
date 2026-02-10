import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Redirect root to login if not authenticated
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  // Direct login route for convenience
  {
    path: 'login',
    redirectTo: '/auth/login',
  },

  // Auth routes (sin layout)
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then((r) => r.authRoutes),
  },

  // Main application routes (con layout)
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./modules/dashboard/dashboard.component').then((c) => c.DashboardComponent),
  },
  // Movements module (Future implementation)
  // {
  //   path: 'movements',
  //   canActivate: [authGuard],
  //   loadChildren: () => import('./modules/movements/movements.routes').then(r => r.movementsRoutes)
  // },

  // Reports module (Future implementation)
  // {
  //   path: 'reports',
  //   canActivate: [authGuard],
  //   loadChildren: () => import('./modules/reports/reports.routes').then(r => r.reportsRoutes)
  // },

  // Settings module (Future implementation)
  // {
  //   path: 'settings',
  //   canActivate: [authGuard],
  //   loadChildren: () => import('./modules/settings/settings.routes').then(r => r.settingsRoutes)
  // },

  // Wildcard route - should be last
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
