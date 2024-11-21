import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AccountService } from '../account.service';
import { SharedService } from '../../app/shared/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { HttpClientModule } from '@angular/common/http';
import { ValidationMessagesComponent } from '../../app/shared/components/validation-messages/validation-messages.component';
import { take } from 'rxjs';
import { User } from '../../app/shared/models/User';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [HttpClientModule, ReactiveFormsModule, ValidationMessagesComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [BsModalService, AccountService, SharedService],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  submitted = false;
  errorMessages: string[] = [];
  returnUrl: any;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private sharedService: SharedService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.accountService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/');
        } else {
          this.route.queryParamMap.subscribe({
            next: (params) => {
              if (params) {
                this.returnUrl = params.get('returnUrl');
              }
            },
          });
        }
      },
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }
  initializeForm() {
    this.loginForm = this.formBuilder.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  login() {
    this.submitted = true;
    this.errorMessages = [];
    console.log(this.loginForm.value);

    if (this.loginForm.valid) {
      this.accountService.login(this.loginForm.value).subscribe({
        next: (res: any) => {
          if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this.router.navigateByUrl('/');
          }
        },
        error: (err) => {
          if (err.error.errors) {
            this.errorMessages = err.error.errors;
          } else {
            this.errorMessages.push(err.error);
          }
          console.log(err);
        },
      });
    }
  }
}
