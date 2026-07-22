import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest, JwtPayload } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/Auth`;
  private readonly tokenKey = 'access_token';
  private readonly userKey = 'current_user';
  private readonly router = inject(Router);
  private logoutTimer: ReturnType<typeof setTimeout> | undefined;

  initializeSession(): void {
    const token = this.getToken();

    if (!token) {
      return;
    }

    if (this.isTokenExpired(token)) {
      this.clearSession();
      return;
    }

    this.scheduleAutoLogout(token);
  }

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => {
        this.storeSession(response);
        this.scheduleAutoLogout(response.token);
      }),
    );
  }

  register(request: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, request);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    const storedUser = localStorage.getItem(this.userKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      this.logout();
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.clearSession();
      return false;
    }

    return true;
  }

  private storeSession(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.user));
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');

      const decodedPayload = decodeURIComponent(
        atob(payload)
          .split('')
          .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join(''),
      );

      return JSON.parse(decodedPayload) as JwtPayload;
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);

    if (!payload || typeof payload.exp !== 'number') {
      return true;
    }

    const expirationTime = payload.exp * 1000;

    return expirationTime <= Date.now();
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = undefined;
    }
  }

  private scheduleAutoLogout(token: string): void {
    const payload = this.decodeToken(token);

    if (!payload || typeof payload.exp !== 'number') {
      this.logout();
      return;
    }

    const expirationTime = payload.exp * 1000;
    const remainingTime = expirationTime - Date.now();

    if (remainingTime <= 0) {
      this.logout();
      return;
    }

    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }

    this.logoutTimer = setTimeout(() => {
      this.logout();
    }, remainingTime);
  }
}
