import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <button
              (click)="toggleSidebar.emit()"
              class="md:hidden mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
              </svg>
            </button>

            <div>
              <h2 class="text-xl font-semibold text-primary-700">
                Sistema de Control de Inventario
              </h2>
              <p class="text-sm text-gray-500">Gestión integral de productos y movimientos</p>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <div class="relative hidden md:block">
              <button
                class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                  />
                </svg>
                <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>

            <!-- User Profile -->
            <div class="hidden md:flex items-center space-x-3">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span class="text-primary-700 font-semibold text-sm">
                  {{ userInitials }}
                </span>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-gray-900">
                  {{ user?.fullName || user?.username }}
                </p>
                <p class="text-xs text-gray-500">{{ userRole }}</p>
              </div>
            </div>

            <!-- Mobile user info -->
            <div class="md:hidden">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span class="text-primary-700 font-semibold text-sm">
                  {{ userInitials }}
                </span>
              </div>
            </div>

            <!-- Logout Button -->
            <button (click)="logout()" class="btn btn-secondary text-sm">
              <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                />
              </svg>
              <span class="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  private readonly authService = inject(AuthService);

  get user() {
    return this.authService.currentUser();
  }

  get userInitials(): string {
    if (!this.user?.username) return '?';
    return this.user.username.charAt(0).toUpperCase();
  }

  get userRole(): string {
    if (!this.user?.role) return '';
    return this.user.role.replace('ROLE_', '');
  }

  logout(): void {
    this.authService.logout();
  }
}
