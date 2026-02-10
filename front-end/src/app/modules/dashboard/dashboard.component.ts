import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Dashboard General</h1>
          <p class="text-gray-600 mt-1">Resumen del sistema de control de inventario</p>
        </div>
        <div class="flex space-x-3">
          <button (click)="refreshData()" [disabled]="loading()" class="btn btn-primary">
            <svg
              [class.animate-spin]="loading()"
              class="w-4 h-4 mr-2"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M17.65,6.35C16.2,4.9 14.21,4 12,4c-4.42,0 -7.99,3.58 -7.99,8s3.57,8 7.99,8c3.73,0 6.84,-2.55 7.73,-6h-2.08c-0.82,2.33 -3.04,4 -5.65,4c-3.31,0 -6,-2.69 -6,-6s2.69,-6 6,-6c1.66,0 3.14,0.69 4.22,1.78L13,11h7V4L17.65,6.35z"
              />
            </svg>
            {{ loading() ? 'Actualizando...' : 'Actualizar' }}
          </button>
          <button routerLink="/products/new" class="btn btn-success">
            <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,13h-6v6h-2v-6H5v-2h6V5h2v6h6V13z" />
            </svg>
            Nuevo Producto
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          *ngFor="let stat of statsCards()"
          class="stat-card hover:scale-105 transform transition-all duration-200"
        >
          <div class="flex items-center justify-between">
            <div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
            <div [class]="stat.iconClass">
              {{ stat.icon }}
            </div>
          </div>
          <div class="mt-3">
            <div [class]="stat.trendClass">
              {{ stat.trend }}
            </div>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Stock Alerts - Takes 2 columns -->
        <div class="lg:col-span-2">
          <div class="card">
            <div class="card-header flex justify-between items-center">
              <div>
                <h3 class="text-lg font-semibold text-primary-700">Alertas de Stock</h3>
                <p class="text-gray-600 text-sm">Productos que requieren atención inmediata</p>
              </div>
              <div class="flex space-x-2">
                <button (click)="loadAlerts()" class="btn btn-warning text-sm">
                  <svg class="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                  </svg>
                  Ver Alertas
                </button>
                <button routerLink="/products" class="btn btn-secondary text-sm">Ver Todos</button>
              </div>
            </div>

            <div class="card-body">
              <div *ngIf="alertsLoading" class="flex justify-center py-8">
                <svg
                  class="w-8 h-8 animate-spin text-primary-500"
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
              </div>

              <div *ngIf="!alertsLoading">
                <div *ngIf="alerts.length === 0" class="text-center py-12">
                  <div
                    class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
                  >
                    <svg class="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M12,2C6.48,2 2,6.48 2,12s4.48,10 10,10 10,-4.48 10,-10S17.52,2 12,2zM10,17l-5,-5 1.41,-1.41L10,14.17l7.59,-7.59L19,8l-9,9z"
                      />
                    </svg>
                  </div>
                  <h4 class="text-lg font-medium text-gray-900 mb-2">¡Excelente!</h4>
                  <p class="text-gray-600">No hay productos con alertas de stock</p>
                </div>

                <div *ngIf="alerts.length > 0">
                  <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div class="flex items-center">
                      <svg
                        class="w-5 h-5 text-yellow-600 mr-3"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                      </svg>
                      <p class="text-yellow-800 font-medium">
                        {{ alerts().length }} producto(s) requieren atención inmediata
                      </p>
                    </div>
                  </div>

                  <div class="space-y-3 max-h-64 overflow-y-auto">
                    <div
                      *ngFor="let alert of alerts().slice(0, 5)"
                      class="flex items-center justify-between p-3 rounded-lg border"
                      [class.bg-red-50]="alert.status === 'SIN_STOCK'"
                      [class.border-red-200]="alert.status === 'SIN_STOCK'"
                      [class.bg-yellow-50]="alert.status === 'STOCK_BAJO'"
                      [class.border-yellow-200]="alert.status === 'STOCK_BAJO'"
                    >
                      <div class="flex-1">
                        <div class="flex items-center space-x-3">
                          <span class="font-mono text-sm font-semibold">{{
                            alert.productCode
                          }}</span>
                          <span class="font-medium">{{ alert.productName }}</span>
                        </div>
                        <div class="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>Stock: {{ alert.currentStock }}</span>
                          <span>Min: {{ alert.minStock }}</span>
                        </div>
                      </div>
                      <div class="flex items-center space-x-3">
                        <span
                          [class.badge-danger]="alert.status === 'SIN_STOCK'"
                          [class.badge-warning]="alert.status === 'STOCK_BAJO'"
                          class="badge text-xs"
                        >
                          {{ alert.status === 'SIN_STOCK' ? 'Sin Stock' : 'Stock Bajo' }}
                        </span>
                        <button
                          (click)="goToProduct(alert.productCode)"
                          class="btn btn-info text-xs px-2 py-1"
                        >
                          Ver
                        </button>
                      </div>
                    </div>
                  </div>

                  <div *ngIf="alerts.length > 5" class="mt-3 text-center">
                    <button
                      routerLink="/products"
                      class="text-primary-600 hover:text-primary-500 text-sm font-medium"
                    >
                      Ver {{ alerts.length - 5 }} productos más →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions - Takes 1 column -->
        <div>
          <div class="card">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-primary-700">Acciones Rápidas</h3>
              <p class="text-gray-600 text-sm">Operaciones frecuentes</p>
            </div>
            <div class="card-body">
              <div class="space-y-3">
                <button
                  routerLink="/products/new"
                  class="w-full btn btn-success text-left justify-start"
                >
                  <svg class="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19,13h-6v6h-2v-6H5v-2h6V5h2v6h6V13z" />
                  </svg>
                  Agregar Producto
                </button>

                <button
                  routerLink="/movements/new"
                  class="w-full btn btn-primary text-left justify-start"
                >
                  <svg class="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"
                    />
                  </svg>
                  Registrar Movimiento
                </button>

                <button
                  routerLink="/search"
                  class="w-full btn btn-secondary text-left justify-start"
                >
                  <svg class="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"
                    />
                  </svg>
                  Buscar Productos
                </button>

                <button
                  routerLink="/reports"
                  class="w-full btn btn-warning text-left justify-start"
                >
                  <svg class="w-4 h-4 mr-3" viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z"
                    />
                  </svg>
                  Generar Reportes
                </button>
              </div>
            </div>
          </div>

          <!-- System Info -->
          <div class="card mt-6">
            <div class="card-header">
              <h3 class="text-lg font-semibold text-primary-700">Información del Sistema</h3>
            </div>
            <div class="card-body text-sm space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Versión:</span>
                <span class="font-medium">1.0.0</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Última actualización:</span>
                <span class="font-medium">{{ lastUpdate() | date: 'short' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Estado del servidor:</span>
                <span class="flex items-center text-green-600">
                  <div class="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  Conectado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly toastr = inject(ToastrService);

  statsCards = signal([
    {
      label: 'Total Productos',
      value: '0',
      icon: '📦',
      iconClass: 'text-3xl',
      trend: '+0% desde ayer',
      trendClass: 'text-sm text-green-600',
    },
    {
      label: 'Movimientos Hoy',
      value: '0',
      icon: '📋',
      iconClass: 'text-3xl',
      trend: '+0% desde ayer',
      trendClass: 'text-sm text-blue-600',
    },
    {
      label: 'Sin Stock',
      value: '0',
      icon: '⚠️',
      iconClass: 'text-3xl',
      trend: 'Crítico',
      trendClass: 'text-sm text-red-600',
    },
    {
      label: 'Stock Bajo',
      value: '0',
      icon: '📊',
      iconClass: 'text-3xl',
      trend: 'Atención',
      trendClass: 'text-sm text-yellow-600',
    },
  ]);

  alerts = signal<any[]>([]);
  loading = signal(false);
  alertsLoading = signal(false);
  lastUpdate = signal(new Date());

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadAlerts();
  }

  refreshData(): void {
    this.loadDashboardData();
    this.loadAlerts();
  }

  loadDashboardData(): void {
    this.loading.set(true);

  }

  loadAlerts(): void {
    this.alertsLoading.set(true);

  }

  goToProduct(code: string): void {
    // Navigate to product details
    console.log('Navigate to product:', code);
    this.toastr.info(`Navegando a producto: ${code}`);
  }
}
