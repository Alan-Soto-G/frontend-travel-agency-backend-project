
import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/authentication/auth.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const permissionGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar autenticación primero
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Obtener la configuración de permisos desde la data de la ruta
  const apiUrl = route.data['apiUrl'] as string;
  const method = route.data['method'] as string || 'GET';

  // Si no hay configuración de permisos, permitir acceso
  if (!apiUrl) {
    console.warn('No se configuró apiUrl para esta ruta, permitiendo acceso');
    return true;
  }

  // Validar permiso con el backend
  return authService.validatePermission(apiUrl, method).pipe(
    map(hasPermission => {
      if (!hasPermission) {
        console.warn(`Sin permiso para acceder a ${apiUrl}`);
        router.navigate(['/login']);
        return false;
      }
      return true;
    }),
    catchError(error => {
      console.error('Error al validar permisos:', error);
      router.navigate(['/login']);
      return of(false);
    })
  );
};
