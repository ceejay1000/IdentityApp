import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AccountService } from '../account/account.service';
import { AsyncPipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AsyncPipe, TitleCasePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  constructor(public accountService: AccountService) {}

  logout() {
    this.accountService.logout();
  }
}
