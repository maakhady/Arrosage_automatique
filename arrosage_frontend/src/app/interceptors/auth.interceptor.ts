// src/app/interceptors/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          // Si l'erreur contient une redirection spécifique
          if (error.error?.redirectTo) {
            router.navigate([error.error.redirectTo], {
              state: {
                sessionExpired: true,
                message: error.error.message
              }
            });
          } else {
            // Déconnexion et redirection par défaut
            authService.logoutAll();
            router.navigate(['/'], {
              state: {
                sessionExpired: true,
                message: 'Session expirée. Veuillez vous reconnecter.'
              }
            });
          }
        }
      }
      return throwError(() => error);
    })
  );
};
