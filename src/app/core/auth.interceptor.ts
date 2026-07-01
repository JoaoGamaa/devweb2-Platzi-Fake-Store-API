import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { API_BASE_URL } from './api.config';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getAccessToken();

  const authenticatedRequest =
    token && request.url.startsWith(API_BASE_URL) && !request.url.includes('/auth/login')
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authService.clearSession();
        void router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
