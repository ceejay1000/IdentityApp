import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AccountService } from '../account.service';
import { HttpClientModule } from '@angular/common/http';
import { ValidationMessagesComponent } from '../../app/shared/components/validation-messages/validation-messages.component';
import { SharedService } from '../../app/shared/shared.service';
import { Router, RouterModule } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { User } from '../../app/shared/models/User';
import { environment } from '../../environments/environment.development';
import { ReplaySubject, take } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    ValidationMessagesComponent,
    RouterModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  providers: [AccountService, SharedService, BsModalService],
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup = new FormGroup({});
  submitted = false;
  errorMessages: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private sharedService: SharedService,
    private router: Router
  ) {
    this.accountService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/');
        }
      },
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.registerForm = this.formBuilder.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
        ],
      ],
      // email: ['', [Validators.pattern('/^S+@S+.S+$/'), Validators.required]],
      email: ['', [Validators.required]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
        ],
      ],
    });
  }

  register() {
    this.submitted = true;
    this.errorMessages = [];
    console.log(this.registerForm.value);
    console.warn(this.registerForm.get('email')?.errors);

    if (this.registerForm.valid) {
      console.log(this.registerForm.value);
      this.accountService.register(this.registerForm.value).subscribe({
        next: (res: any) => {
          this.sharedService.showNotification(
            true,
            res.value.title,
            res.value.message
          );
          this.router.navigateByUrl('/account/login');
          console.log(res);
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
