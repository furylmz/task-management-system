import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ErrorHandlerService } from '../services/error-handler';

export const errorInterceptor: HttpInterceptorFn = (
  request,
  next
) => {
  const errorHandlerService = inject(ErrorHandlerService);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const apiError = errorHandlerService.handle(error);

      console.error('API error:', apiError);

      return throwError(() => apiError);
    })
  );
};