import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../../../account/account.service';
import { map } from 'rxjs';
import { SharedService } from '../shared.service';
import { User } from '../models/User';

export const authorizationGuard: CanActivateFn = (route, state) => {
  let accountService = inject(AccountService);
  let sharedService = inject(SharedService);
  let router = inject(Router);

  return accountService.user$.pipe(
    map((user: User | null) => {
      if (user) {
        return true;
      } else {
        sharedService.showNotification(
          false,
          'Restricted Area',
          'Leave immediately'
        );
        router.navigate(['account/login'], {
          queryParams: { returnUrl: state.url },
        });
        return false;
      }
    })
  );
};
