import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['john@mail.com', [Validators.required, Validators.email]],
    password: ['changeme', [Validators.required]],
  });

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  submit(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.authService
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: () => {
          const redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/produtos';
          void this.router.navigateByUrl(redirectTo);
        },
        error: () => {
          this.errorMessage.set('Não foi possível autenticar. Confira e-mail e senha.');
        },
      });
  }
}
