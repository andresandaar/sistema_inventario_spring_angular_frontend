import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './shared/layout/sidebar/sidebar.component';
import { HeaderComponent } from './shared/layout/header/header.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly router = inject(Router);

  sidebarOpen = signal(false);
  isAuthPage = signal(false);

  ngOnInit() {
    // Escuchar cambios de ruta para detectar si estamos en páginas de autenticación
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const navEnd = event as NavigationEnd;
        this.isAuthPage.set(navEnd.urlAfterRedirects.startsWith('/auth') || navEnd.urlAfterRedirects === '/login');
      });

    // Verificar estado inicial
    this.isAuthPage.set(this.router.url.startsWith('/auth') || this.router.url === '/login');
  }

  toggleSidebar() {
    this.sidebarOpen.update((value) => !value);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }
}
