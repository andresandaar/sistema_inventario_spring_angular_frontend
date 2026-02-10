# ============================================================================
# Script de despliegue para aplicación Angular en Windows PowerShell
# ============================================================================

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("development", "qa", "production")]
    [string]$AngularBuildEnv,
    
    [switch]$Force
)

# Configuración de errores
$ErrorActionPreference = "Stop"

# Variables para tracking de errores
$CurrentStep = ""
$StartTime = Get-Date

# ============================================================================
# Variables de configuración
# ============================================================================
$PROYECTO_NAME = "web-inventario-application"
$FRONTEND_CONTAINER = "$PROYECTO_NAME-container"
$IMAGE_NAME = "$PROYECTO_NAME`:latest"
$NETWORK_NAME = "inventario-network"
$CONTAINER_TIMEOUT = 60  # Timeout en segundos para esperar que el contenedor arranque
$SERVICE_PORT = "4200"

# ============================================================================
# Función de limpieza en caso de error
# ============================================================================
function Cleanup-OnError {
    Write-Host ""
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host "ERROR: El despliegue falló en el paso: $CurrentStep" -ForegroundColor Red
    Write-Host "============================================================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Ejecutando limpieza de emergencia..." -ForegroundColor Yellow
    
    # Limpiar contenedor si existe
    try {
        docker stop $FRONTEND_CONTAINER 2>$null
        docker rm -f $FRONTEND_CONTAINER 2>$null
        Write-Host "Limpieza completada" -ForegroundColor Green
    }
    catch {
        Write-Host "No se pudo completar la limpieza automática" -ForegroundColor Yellow
    }
}

# Registrar manejo de errores
trap {
    Cleanup-OnError
    break
}

Write-Host "============================================================================" -ForegroundColor Cyan
Write-Host "=== Iniciando despliegue ===" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Cyan

# ============================================================================
# Validaciones iniciales
# ============================================================================
Write-Host "Validaciones iniciales" -ForegroundColor Yellow

$CurrentStep = "Validaciones del sistema"
Write-Host "$CurrentStep..." -ForegroundColor Yellow

# Verificar Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker no está instalado o no está en el PATH"
}

try {
    docker info | Out-Null
}
catch {
    throw "Docker no está corriendo o no es accesible"
}

Write-Host "Ambiente de compilación seleccionado: $AngularBuildEnv" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Confirmación de despliegue
# ============================================================================
Write-Host "Confirmación de despliegue..." -ForegroundColor Yellow

if (-not $Force) {
    $confirm = Read-Host "¿Continuar con el despliegue? (s/n)"
    Write-Host ""
    
    if ($confirm -notin @("s", "S", "y", "Y", "si", "Si", "SI")) {
        Write-Host "Despliegue cancelado por el usuario" -ForegroundColor Yellow
        exit 0
    }
}

Write-Host "  Confirmación recibida" -ForegroundColor Green
Write-Host ""

# ============================================================================
# Compilar la aplicación Angular
# ============================================================================
$CurrentStep = "Compilando aplicación Angular"
Write-Host "[6/10] $CurrentStep..." -ForegroundColor Yellow

Write-Host "Instalando/actualizando dependencias..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    throw "Error al instalar dependencias de npm"
}

Write-Host "Construyendo aplicación en modo $AngularBuildEnv..." -ForegroundColor Cyan
npm run build --configuration=$AngularBuildEnv
if ($LASTEXITCODE -ne 0) {
    throw "Error al construir la aplicación Angular"
}

Write-Host "Build completado exitosamente" -ForegroundColor Green

# ============================================================================
# Detener y limpiar contenedor/imagen anterior
# ============================================================================
$CurrentStep = "Limpiando contenedor anterior"
Write-Host ""
Write-Host "[7/10] Deteniendo y limpiando contenedor frontend anterior..." -ForegroundColor Yellow

try {
    docker stop $FRONTEND_CONTAINER 2>$null
    Write-Host "  Contenedor detenido" -ForegroundColor Green
}
catch {
    Write-Host "  No había contenedor corriendo" -ForegroundColor Gray
}

try {
    docker rm -f $FRONTEND_CONTAINER 2>$null
    Write-Host "  Contenedor eliminado" -ForegroundColor Green
}
catch {
    Write-Host "  No había contenedor para eliminar" -ForegroundColor Gray
}

try {
    docker rmi -f $IMAGE_NAME 2>$null
    Write-Host "  Imagen anterior eliminada" -ForegroundColor Green
}
catch {
    Write-Host "  No había imagen anterior para eliminar" -ForegroundColor Gray
}

# ============================================================================
# Construir nueva imagen Docker
# ============================================================================
$CurrentStep = "Construyendo imagen Docker"
Write-Host "[8/10] Construyendo nueva imagen Docker frontend..." -ForegroundColor Yellow

docker build -t $IMAGE_NAME .
if ($LASTEXITCODE -ne 0) {
    throw "Error al construir la imagen Docker"
}

Write-Host "  Imagen construida exitosamente" -ForegroundColor Green

# ============================================================================
# Verificar/Crear red Docker
# ============================================================================
$CurrentStep = "Verificando red Docker"
Write-Host "[9/10] Verificando red Docker..." -ForegroundColor Yellow

$networkExists = docker network ls --format "{{.Name}}" | Where-Object { $_ -eq $NETWORK_NAME }

if ($networkExists) {
    Write-Host "    Red '$NETWORK_NAME' ya existe" -ForegroundColor Green
}
else {
    Write-Host "  → Creando red '$NETWORK_NAME'..." -ForegroundColor Cyan
    docker network create $NETWORK_NAME
    if ($LASTEXITCODE -ne 0) {
        throw "Error al crear la red Docker"
    }
    Write-Host "Red '$NETWORK_NAME' creada" -ForegroundColor Green
}

# ============================================================================
# Ejecutar nuevo contenedor frontend
# ============================================================================
$CurrentStep = "Ejecutando contenedor"
Write-Host "[10/10] Ejecutando nuevo contenedor frontend..." -ForegroundColor Yellow

docker run -d --name $FRONTEND_CONTAINER --network $NETWORK_NAME -p "${SERVICE_PORT}:${SERVICE_PORT}" $IMAGE_NAME
if ($LASTEXITCODE -ne 0) {
    throw "Error al ejecutar el contenedor"
}

# ============================================================================
# Verificación final
# ============================================================================
$CurrentStep = "Verificación final"
Write-Host "Verificando que el contenedor esté funcionando..." -ForegroundColor Yellow

# Esperar con timeout para que el contenedor esté listo
Write-Host "  → Esperando que el contenedor esté listo (timeout: $($CONTAINER_TIMEOUT)s)..." -ForegroundColor Cyan
$waited = 0
$containerReady = $false

while ($waited -lt $CONTAINER_TIMEOUT) {
    $containerRunning = docker ps --format "{{.Names}}" | Where-Object { $_ -eq $FRONTEND_CONTAINER }
    
    if ($containerRunning) {
        # Verificar que el contenedor esté saludable
        try {
            $containerStatus = docker inspect --format='{{.State.Status}}' $FRONTEND_CONTAINER 2>$null
            if ($containerStatus -eq "running") {
                $containerReady = $true
                break
            }
        }
        catch {
            # Continuar esperando
        }
    }
    
    Start-Sleep -Seconds 1
    $waited++
}

if ($containerReady) {
    Write-Host "  Contenedor $FRONTEND_CONTAINER está ejecutándose correctamente" -ForegroundColor Green
}
else {
    Write-Host "Error: El contenedor $FRONTEND_CONTAINER no respondió en $CONTAINER_TIMEOUT segundos" -ForegroundColor Red
    Write-Host "Verificando logs del contenedor:" -ForegroundColor Yellow
    docker logs $FRONTEND_CONTAINER --tail 50
    throw "El contenedor no se inició correctamente"
}

$endTime = Get-Date
$duration = $endTime - $StartTime

Write-Host ""
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "=== Despliegue completado exitosamente ===" -ForegroundColor Green
Write-Host "============================================================================" -ForegroundColor Green
Write-Host "La aplicación está disponible en http://localhost:$SERVICE_PORT" -ForegroundColor Cyan
Write-Host ""
Write-Host "Aplicación:     $PROYECTO_NAME" -ForegroundColor White
Write-Host "Ambiente:       $AngularBuildEnv" -ForegroundColor White
Write-Host "Contenedor:     $FRONTEND_CONTAINER" -ForegroundColor White
Write-Host "Red:            $NETWORK_NAME" -ForegroundColor White
Write-Host "Puerto:         $SERVICE_PORT" -ForegroundColor White
Write-Host "Duración:       $($duration.TotalSeconds) segundos" -ForegroundColor White
Write-Host ""
Write-Host "URL de acceso:  http://localhost:$SERVICE_PORT" -ForegroundColor Cyan
Write-Host "============================================================================" -ForegroundColor Green

# Mostrar información adicional sobre el contenedor
Write-Host ""
Write-Host "Comandos útiles:" -ForegroundColor Yellow
Write-Host "  Ver logs:      docker logs $FRONTEND_CONTAINER" -ForegroundColor Gray
Write-Host "  Detener:       docker stop $FRONTEND_CONTAINER" -ForegroundColor Gray
Write-Host "  Reiniciar:     docker restart $FRONTEND_CONTAINER" -ForegroundColor Gray
Write-Host "  Estado:        docker ps | findstr $FRONTEND_CONTAINER" -ForegroundColor Gray