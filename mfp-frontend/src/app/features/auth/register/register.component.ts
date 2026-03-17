import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const p = control.get('password')?.value;
  const c = control.get('confirm')?.value;
  return p && c && p !== c ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  template: `
    <div class="auth-page">
      <div class="auth-header">
        <mat-icon class="brand-icon">restaurant</mat-icon>
        <h1 class="brand-name">FoodyBud</h1>
        <p class="brand-sub">Créer un compte</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-card">
        <div class="field-group">
          <label class="field-label">Email</label>
          <input class="field-input" type="email" formControlName="email"
                 placeholder="ton@email.com" autocomplete="email" />
        </div>

        <div class="field-group">
          <label class="field-label">Mot de passe <span class="hint">(8 caractères min.)</span></label>
          <input class="field-input" type="password" formControlName="password"
                 placeholder="••••••••" autocomplete="new-password" />
        </div>

        <div class="field-group">
          <label class="field-label">Confirmer le mot de passe</label>
          <input class="field-input" type="password" formControlName="confirm"
                 placeholder="••••••••" autocomplete="new-password" />
          @if (form.hasError('mismatch') && form.get('confirm')?.dirty) {
            <span class="field-error">Les mots de passe ne correspondent pas</span>
          }
        </div>

        @if (error()) {
          <p class="auth-error">{{ error() }}</p>
        }

        <button class="submit-btn" type="submit" [disabled]="form.invalid || loading()">
          <mat-icon>person_add</mat-icon>
          {{ loading() ? 'Création...' : "S'inscrire" }}
        </button>

        <p class="auth-link">Déjà un compte ? <a routerLink="/login">Se connecter</a></p>
      </form>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100dvh; background: var(--bg); display: flex; flex-direction: column; align-items: center; padding: 48px 16px 48px; }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .brand-icon { font-size: 48px; width: 48px; height: 48px; color: var(--primary); }
    .brand-name { font-size: 28px; font-weight: 700; color: var(--font); margin: 8px 0 4px; }
    .brand-sub { color: var(--text-3); font-size: 14px; margin: 0; }
    .auth-card { width: 100%; max-width: 400px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 13px; font-weight: 500; color: var(--text-3); }
    .hint { font-weight: 400; color: var(--text-3); font-size: 12px; }
    .field-input { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; font-size: 15px; color: var(--font); outline: none; width: 100%; box-sizing: border-box; }
    .field-input:focus { border-color: var(--primary); }
    .field-error { font-size: 12px; color: #E84040; }
    .auth-error { color: #E84040; font-size: 13px; margin: 0; text-align: center; }
    .submit-btn { display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--primary); color: #fff; border: none; border-radius: 28px; padding: 14px 32px; font-size: 16px; font-weight: 600; cursor: pointer; width: 100%; box-shadow: 0 4px 16px rgba(0,0,0,0.12); transition: opacity 0.18s; }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-link { font-size: 13px; color: var(--text-3); text-align: center; margin: 0; }
    .auth-link a { color: var(--primary); text-decoration: none; font-weight: 500; }
  `],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
  }, { validators: passwordsMatch });

  loading = signal(false);
  error = signal('');

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.register(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors de la création du compte');
        this.loading.set(false);
      },
    });
  }
}
