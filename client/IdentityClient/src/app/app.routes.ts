import { Routes } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { LoginComponent } from '../account/login/login.component';
import { RegisterComponent } from '../account/register/register.component';
import { PlayComponent } from '../account/play/play.component';
import { authorizationGuard } from './shared/gaurds/authorization.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authorizationGuard],
    children: [{ path: 'play', component: PlayComponent }],
  },
  { path: 'account/login', component: LoginComponent },
  { path: 'account/register', component: RegisterComponent },
  // { path: 'play', component: PlayComponent },
  //   {
  //     path: 'account',
  //     loadChildren: () =>
  //       import('../account/account.module').then(
  //         (module) => module.AccountModule
  //       ),
  //   },
  { path: 'not-found', component: NotFoundComponent },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'not-found',
  },
];
