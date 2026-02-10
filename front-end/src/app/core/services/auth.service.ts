import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  AuthResponse,
  UserInfo,
  RegisterRequest,
  RefreshRequest,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // Signals
  currentUser = signal<UserInfo | null>(null);
  private _isAuthenticated = signal(false);

  // Computed signals
  isAuthenticated = computed(() => this._isAuthenticated());
  userRole = computed(() => this.currentUser()?.role || '');

  constructor() {
    this.loadCurrentUser();
    this.checkAuthenticationStatus();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.saveTokens(response);
        this.loadCurrentUser();
        this._isAuthenticated.set(true);
        this.toastr.success('Inicio de sesión exitoso', 'Bienvenido');
      }),
      catchError((error) => {
        this.toastr.error('Credenciales incorrectas', 'Error de autenticación');
        return throwError(() => error);
      }),
    );
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        this.saveTokens(response);
        this.loadCurrentUser();
        this._isAuthenticated.set(true);
        this.toastr.success('Registro exitoso', 'Bienvenido');
      }),
      catchError((error) => {
        const message = error.error?.message || 'Error en el registro';
        this.toastr.error(message, 'Error');
        return throwError(() => error);
      }),
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
      next: () => {
        this.clearTokensAndRedirect();
      },
      error: () => {
        this.clearTokensAndRedirect();
      },
    });
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const refreshRequest: RefreshRequest = { refreshToken };

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, refreshRequest).pipe(
      tap((response) => {
        this.saveTokens(response);
      }),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      }),
    );
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUser();
  }

  hasRole(role: string): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // Admin tiene acceso a todos
    if (user.role === 'ROLE_ADMIN') return true;

    return user.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  private saveTokens(response: AuthResponse): void {
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);

    const userInfo: UserInfo = {
      username: response.username,
      role: response.role,
      fullName: response.fullName,
      email: response.email, // Añadiendo email si está disponible
    };

    localStorage.setItem('user', JSON.stringify(userInfo));
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  private clearTokensAndRedirect(): void {
    this.clearTokens();
    this.currentUser.set(null);
    this._isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
    this.toastr.info('Sesión cerrada', 'Hasta pronto');
  }

  private loadCurrentUser(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr) as UserInfo;
        this.currentUser.set(user);
      } catch (error) {
        console.error('Failed to parse user data from localStorage:', error);
        this.clearTokens();
      }
    }
  }

  private checkAuthenticationStatus(): void {
    const token = localStorage.getItem('accessToken');
    const isValid = !!token && !this.isTokenExpired(token);
    this._isAuthenticated.set(isValid);

    if (!isValid && token) {
      // Token exists but is expired, clear it
      this.clearTokens();
      this.currentUser.set(null);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }
}
