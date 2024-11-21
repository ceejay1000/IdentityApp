import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { AccountService } from '../account/account.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'IdentityClient';

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.refreshUser();
  }

  refreshUser() {
    const jwt = this.accountService.getJwt();

    if (jwt) {
      this.accountService.refreshUser(jwt).subscribe({
        next: () => {},
        error: (_) => {
          this.accountService.logout();
        },
      });
    } else {
      this.accountService.refreshUser(null).subscribe();
    }
  }
}
