import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  const expectedRoles = route.data['roles'] as string[];
  const user = authService.getCurrentUser();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (expectedRoles && expectedRoles.length > 0) {
    if (authService.hasAnyRole(expectedRoles)) {
      return true;
    } else {
      toastr.error('No tiene permisos para acceder a esta sección', 'Acceso denegado');
      router.navigate(['/dashboard']);
      return false;
    }
  }

  return true;
};
