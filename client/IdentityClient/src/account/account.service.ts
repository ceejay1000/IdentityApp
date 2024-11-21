import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Register } from '../app/shared/models/Register';
import { environment } from '../environments/environment.development';
import { Login } from '../app/shared/models/Login';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { User } from '../app/shared/models/User';
import { map, of } from 'rxjs';
import { Route, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
  // deps: [HttpClientModule],
})
export class AccountService {
  private userSource = new ReplaySubject<User | null>();
  user$ = this.userSource.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(model: Login) {
    return this.http.post(`${environment.appUrl}api/account/login`, model);
  }
  logout() {
    localStorage.removeItem(environment.userKey);
    this.userSource.next(null);
    this.router.navigateByUrl('/');
  }

  register(model: Register) {
    return this.http.post<User>(
      `${environment.appUrl}api/account/register`,
      model
    );
    // .pipe(
    //   map((user: User) => {
    //     if (user !== null) {
    //       this.setUser(user);
    //       return;
    //     }
    //     return null;
    //   })
    // );
  }

  getJwt() {
    const key = localStorage.getItem(environment.userKey);

    if (key) {
      let user: User = JSON.parse(key);
      return user.jwt;
    }

    return null;
  }

  refreshUser(jwt: string | null) {
    if (jwt === null) {
      this.userSource.next(null);
      return of(undefined);
    }

    let headers = new HttpHeaders();
    headers = headers.set('Authorizaation', 'Bearer ' + jwt);
    return this.http
      .get<User>(`${environment.appUrl}api/account/refresh-user-token`)
      .pipe(
        map((user: User) => {
          if (user) {
            this.setUser(user);
          }
        })
      );
  }

  private setUser(user: User) {
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    this.userSource.next(user);

    // this.user$.subscribe({
    //   next: (response) => console.log(response),
    // });
  }
}
