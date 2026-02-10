import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar z-40">
      <div class="p-6 border-b border-primary-600">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mr-3">
            <span class="text-white font-bold text-xl">📦</span>
          </div>
          <div>
            <h1 class="text-xl font-bold text-white">QASO SYSTEM</h1>
            <p class="text-white/60 text-xs">Control de Inventario</p>
          </div>
        </div>
      </div>

      <nav class="py-4 flex-1">
        <ul class="space-y-1">
          <li *ngFor="let item of filteredMenuItems">
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-link group"
              [class.active]="isActive(item.route)"
            >
              <span class="nav-icon group-hover:scale-110 transition-transform">{{
                item.icon
              }}</span>
              <span>{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t border-primary-600">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
            <span class="text-white font-bold">{{ userInitials }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-white text-sm font-medium truncate">
              {{ user?.fullName || user?.username }}
            </p>
            <p class="text-white/60 text-xs">{{ user?.role?.replace('ROLE_', '') }}</p>
          </div>
        </div>

        <button
          (click)="logout()"
          class="w-full flex items-center px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
        >
          <span class="mr-3">🚪</span>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class SidebarComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  @Input() isOpen = false;
  @Output() toggleSidebar = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: '📊',
      route: '/dashboard',
      roles: ['ROLE_ADMIN', 'ROLE_USER', 'ROLE_MANAGER'],
    },
    {
      label: 'Productos',
      icon: '📦',
      route: '/products',
      roles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
    },
    {
      label: 'Movimientos',
      icon: '📋',
      route: '/movements',
      roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER'],
    },
    {
      label: 'Inventario',
      icon: '📊',
      route: '/inventory',
      roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER'],
    },
    {
      label: 'Reportes',
      icon: '📈',
      route: '/reports',
      roles: ['ROLE_ADMIN', 'ROLE_MANAGER'],
    },
    {
      label: 'Búsqueda',
      icon: '🔍',
      route: '/search',
      roles: ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_USER'],
    },
    {
      label: 'Administración',
      icon: '⚙️',
      route: '/admin',
      roles: ['ROLE_ADMIN'],
    },
  ];

  currentRoute = '';

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });

    // Note: No need to subscribe to currentUser since it's now a signal
  }

  get user() {
    return this.authService.currentUser();
  }

  get filteredMenuItems(): MenuItem[] {
    return this.menuItems.filter((item) =>
      item.roles.some((role) => this.authService.hasRole(role)),
    );
  }

  get userInitials(): string {
    const user = this.authService.currentUser();
    if (!user?.username) return '?';
    return user.username.charAt(0).toUpperCase();
  }

  isActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  logout(): void {
    this.authService.logout();
  }
}
