import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);
  return next(req).pipe(
    catchError((err) => {
      const isAuthRoute = (req.url.includes('/auth/login') || req.url.includes('/auth/register'));
      const is401 = err.status === 401;
      if (!is401 || isAuthRoute) {
        const message = (err.error?.message as string) ?? 'Une erreur est survenue';
        snack.open(message, 'Fermer', { duration: 4000 });
      }
      return throwError(() => err);
    }),
  );
};
