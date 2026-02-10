# Scripts de Despliegue para Windows

Este directorio contiene scripts optimizados para desplegar la aplicación Angular en Windows.

## Archivos Disponibles

### 1. `deploy.ps1` (Recomendado)

Script de PowerShell con todas las características avanzadas.

**Uso:**

```powershell
# Básico
.\deploy.ps1 -AngularBuildEnv production

# Con confirmación automática
.\deploy.ps1 -AngularBuildEnv qa -Force

# Otros ambientes
.\deploy.ps1 -AngularBuildEnv development
```

**Características:**

- ✅ Manejo robusto de errores
- ✅ Colores en la salida
- ✅ Validación de parámetros
- ✅ Limpieza automática en caso de error
- ✅ Información detallada del progreso

### 2. `deploy.sh` (Original)

Script Bash para Git Bash o WSL.

**Uso:**

```bash
# Básico
./deploy.sh --angular_build_env production

# Con confirmación automática
./deploy.sh --angular_build_env qa --force
```

## Ambientes Disponibles

- `development` - Ambiente de desarrollo
- `qa` - Ambiente de testing/QA
- `production` - Ambiente de producción

## Requisitos Previos

1. **Docker Desktop** instalado y corriendo
2. **Node.js y npm** instalados
3. **PowerShell 5.0+** (para deploy.ps1)

## Verificación Rápida

```powershell
# Verificar Docker
docker --version
docker info

# Verificar Node.js
node --version
npm --version

# Verificar PowerShell
$PSVersionTable.PSVersion
```

## Solución de Problemas

### Error: "execution policy"

```powershell
# Permitir ejecución de scripts (ejecutar como administrador)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "Docker no está corriendo"

1. Abrir Docker Desktop
2. Esperar a que inicie completamente
3. Ejecutar el comando de nuevo

### Error: "Puerto ocupado"

```powershell
# Ver qué está usando el puerto 4200
netstat -ano | findstr :4200

# Detener el contenedor anterior si existe
docker stop web-inventario-application-container
docker rm web-inventario-application-container
```

## Ejemplos de Uso Completo

### Desarrollo Rápido

```powershell
# Deployment rápido de desarrollo
.\deploy.ps1 -AngularBuildEnv development -Force
```

### Deployment de Producción

```powershell
# Deployment de producción con confirmación
.\deploy.ps1 -AngularBuildEnv production
# Se pedirá confirmación antes de continuar
```

### Verificar Estado

```powershell
# Ver contenedores corriendo
docker ps

# Ver logs de la aplicación
docker logs web-inventario-application-container

# Acceder a la aplicación
Start-Process "http://localhost:4200"
```

## Comandos Útiles Post-Deployment

```powershell
# Ver estado del contenedor
docker ps | findstr web-inventario-application

# Ver logs en tiempo real
docker logs -f web-inventario-application-container

# Detener la aplicación
docker stop web-inventario-application-container

# Reiniciar la aplicación
docker restart web-inventario-application-container

# Eliminar completamente
docker stop web-inventario-application-container
docker rm web-inventario-application-container
docker rmi web-inventario-application:latest
```

## Estructura del Proyecto

```
├── deploy.ps1      # Script PowerShell (recomendado)
├── deploy.sh       # Script Bash (original)
├── Dockerfile      # Configuración Docker
├── nginx.conf      # Configuración Nginx
└── package.json    # Dependencias Node.js
```

## Notas Importantes

- **PowerShell es recomendado** por su mejor manejo de errores y salida colorizada
- Los scripts **limpian automáticamente** contenedores e imágenes anteriores
- Se crea automáticamente la **red Docker** `inventario-network` si no existe
- La aplicación estará disponible en **http://localhost:4200**
- Usar `--force` o `-Force` para **deployment automatizado** sin confirmación
