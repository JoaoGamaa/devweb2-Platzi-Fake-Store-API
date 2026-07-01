import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_BASE_URL } from './api.config';
import { AuthCredentials, AuthResponse } from './api.models';

const ACCESS_TOKEN_KEY = 'platzi_fake_store_access_token';
const REFRESH_TOKEN_KEY = 'platzi_fake_store_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly token = signal<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));

  readonly isLoggedIn = computed(() => this.hasValidToken(this.token()));

  login(credentials: AuthCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, response.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
        this.token.set(response.access_token);
      }),
    );
  }

  logout(): void {
    this.clearSession();
  }

  clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.token.set(null);
  }

  getAccessToken(): string | null {
    const currentToken = this.token();
    return this.hasValidToken(currentToken) ? currentToken : null;
  }

  private hasValidToken(token: string | null): boolean {
    if (!token) {
      return false;
    }

    const payload = this.decodePayload(token);
    if (!payload?.exp) {
      return true;
    }

    return payload.exp * 1000 > Date.now();
  }

  private decodePayload(token: string): { exp?: number } | null {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)) as { exp?: number };
    } catch {
      return null;
    }
  }
}
