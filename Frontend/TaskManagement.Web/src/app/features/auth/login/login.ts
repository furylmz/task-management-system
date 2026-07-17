import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import { finalize } from 'rxjs';

import { AuthService } from '../../../core/services/auth';
import { ApiErrorResponse } from '../../../core/models/api-response.model';
import { LoginRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly registrationSuccess =
    this.route.snapshot.queryParamMap.get('registered') === 'true';

  readonly loginForm = this.formBuilder.nonNullable.group({
    username: [
      '',
      [
        Validators.required
      ]
    ],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(6)
      ]
    ]
  });

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const request: LoginRequest = this.loginForm.getRawValue();

    this.authService.login(request)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: () => {
          const returnUrl =
            this.route.snapshot.queryParamMap.get('returnUrl')
            ?? '/tasks';

          this.router.navigateByUrl(returnUrl);
        },
        error: (error: ApiErrorResponse) => {
          this.errorMessage.set(error.message);
        }
      });
  }
}