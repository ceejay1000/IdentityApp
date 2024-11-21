import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AccountService } from '../../../account/account.service';
import { take } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  let accountService = inject(AccountService);
  accountService.user$.pipe(take(1)).subscribe({
    next: (user) => {
      if (user) {
        req = req.clone({
          setHeaders: {
            Authorization: 'Bearer ' + user.jwt,
          },
        });
      }
    },
  });
  return next(req);
};
