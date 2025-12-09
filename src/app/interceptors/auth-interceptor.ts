import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const cookieService = inject(CookieService);
  const token = cookieService.get('token');

  // Ignorar peticiones a APIs externas (como Google Calendar)
  if (req.url.includes('googleapis.com')) {
    return next(req);
  }

  // Agregar token a la petición si existe
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Manejar errores
  return next(authReq).pipe(
    catchError((error) => {
      // Solo cerrar sesión si el 401 viene de nuestra propia API (o no es de Google)
      if (error.status === 401 && !req.url.includes('googleapis.com')) {
        // Token inválido o expirado
        cookieService.delete('token', '/');
        sessionStorage.removeItem('user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
