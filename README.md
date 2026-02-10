# Sistema de Inventario - Front-end Angular

## Novedades de la Versión 1

Este proyecto corresponde al **front-end** del sistema de inventario, desarrollado en Angular. En esta versión se han implementado las siguientes funcionalidades:

- configuraciones de build para diferentes ambientes (desarrollo, QA, producción)
- script automatizado de despliegue con Docker

## Notas

En esta version todavia no se han implementado las funcionalidades de la aplicación, solo la estructura y el proceso de despliegue.

## Requisitos

- Node.js 18+ y npm
- Angular CLI (instalar con `npm install -g @angular/cli`)

## Instalación

1. Clona el repositorio o descarga el código.
2. Entra en la carpeta `front-end`:

   ```bash
   cd front-end
   ```

3. Instala las dependencias:

   ```bash
   npm install
   ```

## Ejecución en desarrollo

Para iniciar el servidor de desarrollo:

```bash
ng serve
```

La aplicación estará disponible en `http://localhost:4200`.

## Despliegue (Build)

Para generar la versión lista para producción:

```bash
ng build --configuration production
```

Los archivos generados estarán en la carpeta `dist/`.

## Configuración

Puedes modificar variables de entorno y endpoints en los archivos de configuración dentro de `src/app/`.

## Estructura básica

- `src/`: Código fuente Angular
- `public/`: Recursos estáticos
- `angular.json`: Configuración del proyecto
- `package.json`: Dependencias y scripts

## Conexión con el Back-end

La aplicación Angular consume la API REST del back-end Spring Boot. Asegúrate de que el back-end esté corriendo y que los endpoints estén configurados correctamente.

## Despliegue con Script Automatizado

El proyecto incluye un script `deploy.sh` que automatiza el proceso completo de build y despliegue con Docker:

```bash
# Despliegue en producción
./deploy.sh --angular_build_env production

# Despliegue en desarrollo
./deploy.sh --angular_build_env development

# Despliegue sin confirmación (automático)
./deploy.sh --angular_build_env production --force
```

**Ambientes disponibles:**

- `development`: Build para desarrollo
- `qa`: Build para QA/Testing
- `production`: Build optimizado para producción

**El script realiza:**

1. Validaciones del sistema (Docker)
2. Instalación de dependencias (`npm install`)
3. Build de Angular con la configuración seleccionada
4. Limpieza de contenedores/imágenes anteriores
5. Construcción de nueva imagen Docker
6. Despliegue del contenedor con red Docker

## Docker Manual

Para desplegar manualmente siguiendo los mismos pasos del script:

1. **Validar Docker:**

   ```bash
   docker info
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Construir la aplicación:**

   ```bash
   # Para producción
   npm run build --configuration=production
   # Para desarrollo
   npm run build --configuration=development
   # Para QA
   npm run build --configuration=qa
   ```

4. **Limpiar contenedores/imágenes anteriores:**

   ```bash
   docker stop web-inventario-application-container || true
   docker rm -f web-inventario-application-container || true
   docker rmi -f web-inventario-application:latest || true
   ```

5. **Construir nueva imagen Docker:**

   ```bash
   docker build -t web-inventario-application:latest .
   ```

6. **Crear/verificar red Docker:**

   ```bash
   docker network create inventario-network || true
   ```

7. **Ejecutar contenedor:**

   ```bash
   docker run -d \
     --name web-inventario-application-container \
     --network inventario-network \
     -p 4200:4200 \
     web-inventario-application:latest
   ```

8. **Verificar despliegue:**
   ```bash
   docker ps | grep web-inventario-application-container
   ```

La aplicación estará disponible en `http://localhost:4200`.
