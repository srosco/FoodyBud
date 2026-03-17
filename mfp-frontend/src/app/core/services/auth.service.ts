import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = `${environment.apiUrl}/auth`;

  login(email: string, password: string) {
    return this.http.post<{ access_token: string }>(`${this.base}/login`, { email, password }).pipe(
      tap(({ access_token }) => localStorage.setItem(TOKEN_KEY, access_token)),
    );
  }

  register(email: string, password: string) {
    return this.http.post<{ access_token: string }>(`${this.base}/register`, { email, password }).pipe(
      tap(({ access_token }) => localStorage.setItem(TOKEN_KEY, access_token)),
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
