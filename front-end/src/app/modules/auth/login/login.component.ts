import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4"
    >
      <div class="max-w-md w-full">
        <!-- Logo y Header -->
        <div class="text-center mb-8 animate-fade-in">
          <div
            class="w-20 h-20 mx-auto mb-4 rounded-full bg-primary-500 flex items-center justify-center shadow-lg"
          >
            <span class="text-3xl text-white">📦</span>
          </div>
          <h1 class="text-3xl font-bold text-primary-800 mb-2">QASO SYSTEM</h1>
          <p class="text-gray-600">Sistema de Control de Inventario</p>
        </div>

        <!-- Form de Login -->
        <div class="card shadow-xl animate-slide-in">
          <div class="card-header">
            <h2 class="text-xl font-semibold text-primary-700">Iniciar Sesión</h2>
            <p class="text-gray-600 text-sm">Acceda a su cuenta del sistema</p>
          </div>

          <div class="card-body">
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="space-y-4">
                <!-- Usuario -->
                <div>
                  <label for="email" class="form-label">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                        />
                      </svg>
                      Correo Electrónico
                    </span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="form-input"
                    placeholder="Ingrese su correo electrónico"
                    [class.border-red-500]="
                      loginForm.get('email')?.invalid && loginForm.get('email')?.touched
                    "
                  />
                  @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                    <div class="text-red-600 text-sm mt-1 flex items-center">
                      <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M12 2L13.09 8.26L22 9L17 14L18.18 23L12 19.77L5.82 23L7 14L2 9L10.91 8.26L12 2Z"
                        />
                      </svg>
                      @if (loginForm.get('email')?.errors?.['required']) {
                        <span>El correo electrónico es requerido</span>
                      }
                      @if (loginForm.get('email')?.errors?.['email']) {
                        <span>Ingrese un correo electrónico válido</span>
                      }
                    </div>
                  }
                </div>

                <!-- Contraseña -->
                <div>
                  <label for="password" class="form-label">
                    <span class="flex items-center">
                      <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1s3.1,1.39,3.1,3.1V8z"
                        />
                      </svg>
                      Contraseña
                    </span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    formControlName="password"
                    class="form-input"
                    placeholder="Ingrese su contraseña"
                    [class.border-red-500]="
                      loginForm.get('password')?.invalid && loginForm.get('password')?.touched
                    "
                  />
                  @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                    <div class="text-red-600 text-sm mt-1 flex items-center">
                      <svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M12 2L13.09 8.26L22 9L17 14L18.18 23L12 19.77L5.82 23L7 14L2 9L10.91 8.26L12 2Z"
                        />
                      </svg>
                      La contraseña es requerida
                    </div>
                  }
                </div>

                <!-- Opciones adicionales -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label for="remember" class="ml-2 block text-sm text-gray-700">
                      Recordarme
                    </label>
                  </div>
                  <a
                    href="#"
                    class="text-sm text-primary-600 hover:text-primary-500 transition-colors"
                  >
                    ¿Olvidó su contraseña?
                  </a>
                </div>

                <!-- Botón Submit -->
                <div>
                  <button
                    type="submit"
                    [disabled]="loginForm.invalid || loading()"
                    class="btn btn-primary w-full justify-center"
                  >
                    @if (!loading()) {
                      <span class="flex items-center">
                        <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M10,17l5-5l-5-5v10z" />
                        </svg>
                        Iniciar Sesión
                      </span>
                    }
                    @if (loading()) {
                      <span class="flex items-center">
                        <svg
                          class="w-4 h-4 mr-2 animate-spin"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"
                            opacity=".25"
                          />
                          <path
                            d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z"
                          />
                        </svg>
                        Procesando...
                      </span>
                    }
                  </button>
                </div>
              </div>
            </form>

            <!-- Divider -->
            <div class="mt-6">
              <div class="relative">
                <div class="absolute inset-0 flex items-center">
                  <div class="w-full border-t border-gray-300"></div>
                </div>
                <div class="relative flex justify-center text-sm">
                  <span class="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>
            </div>

            <!-- Demo Credentials -->
            <div class="mt-4 p-4 bg-primary-50 rounded-lg">
              <h4 class="text-sm font-semibold text-primary-700 mb-2">Credenciales de Prueba:</h4>
              <div class="space-y-1 text-xs text-primary-600">
                <p><strong>Admin:</strong> admin / admin123</p>
                <p><strong>Usuario:</strong> user / user123</p>
              </div>
            </div>

            <div class="mt-6 text-center">
              <p class="text-sm text-gray-600">
                ¿Necesita una cuenta?
                <a
                  [routerLink]="['/register']"
                  class="text-primary-600 hover:text-primary-500 font-medium transition-colors"
                >
                  Contáctese con el administrador
                </a>
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="mt-6 text-center text-sm text-gray-500">
          <p>© 2024 QASO SYSTEM. Todos los derechos reservados.</p>
          <p class="mt-1">Versión 1.0 | Built with Angular & Tailwind CSS</p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm: FormGroup;
  loading = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.loading.set(true);
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        // Error handling is done in the service with toastr
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
