# FrontEnd

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.0.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Docker Deployment

Este proyecto incluye scripts automatizados para deployment con Docker. Están disponibles versiones para diferentes sistemas operativos:

### 📁 Scripts Disponibles

- **`deploy.ps1`** - PowerShell (Windows - Recomendado)
- **`deploy.sh`** - Bash (Linux/macOS/WSL)

### 🚀 Uso Rápido

#### Windows PowerShell (Recomendado)

```powershell
# Development
.\deploy.ps1 -AngularBuildEnv development -Force

# Production
.\deploy.ps1 -AngularBuildEnv production

# QA
.\deploy.ps1 -AngularBuildEnv qa -Force
```

### 🔧 Ambientes Disponibles

- `development` - Desarrollo local
- `qa` - Testing/QA
- `production` - Producción

### 📋 Requisitos

- Docker Desktop instalado y corriendo
- Node.js y npm
- PowerShell 5.0+ (para scripts .ps1)

### 📖 Documentación Detallada

Para instrucciones completas y solución de problemas, consultar:

- [DEPLOY_WINDOWS.md](DEPLOY_WINDOWS.md) - Guía completa para Windows

### 🌐 Acceso a la Aplicación

Después del deployment, la aplicación estará disponible en:
**http://localhost:4200**

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
