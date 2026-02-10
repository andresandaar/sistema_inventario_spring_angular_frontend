#!/bin/bash

set -e  # Salir si algÃºn comando falla

# Variables para tracking de errores
CURRENT_STEP=""
START_TIME=$(date +%s)
# ============================================================================
# Variables de configuración
# ============================================================================
PROYECTO_NAME="web-inventario-application"
FRONTEND_CONTAINER="$PROYECTO_NAME-container"
IMAGE_NAME="$PROYECTO_NAME:latest"
NETWORK_NAME="inventario-network"
CONTAINER_TIMEOUT=60  # Timeout en segundos para esperar que el contenedor arranque
SERVICE_PORT="4200"
CONFIGURATION=""
FORCE=false

# ============================================================================
# Función de limpieza en caso de error
# ============================================================================
cleanup_on_error() {
    echo ""
    echo "============================================================================"
    echo "ERROR: El despliegue falló en el paso: $CURRENT_STEP"
    echo "============================================================================"
    echo ""
    echo "Ejecutando limpieza de emergencia..."
    # Limpiar contenedor si existe
    docker stop $FRONTEND_CONTAINER 2>/dev/null || true
    docker rm -f $FRONTEND_CONTAINER 2>/dev/null || true
    echo "Limpieza completada"
}

# Registrar trap para limpieza automática
trap cleanup_on_error ERR

echo "============================================================================"
echo "=== Iniciando despliegue ==="
echo "============================================================================"

# ============================================================================
# Validaciones iniciales
# ============================================================================
echo "Validaciones iniciales"

echo "Parsear argumentos de línea de comandos..."

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case $1 in
        --angular_build_env)
            CONFIGURATION="$2"
            shift 2
            ;;
        --force)
            FORCE=true
            shift
            ;;
        *)
          echo "Error: Argumento desconocido '$1'"
            echo ""
            echo "Uso correcto:"
            echo "  ./deploy.sh --angular_build_env <ambiente> [--force]"
            echo "Ambientes permitidos: development, qa, production"
            exit 1
            ;;
    esac
done


# Validar que el ambiente fue especificado
if [ -z "$CONFIGURATION" ]; then
   echo "Error: Falta el argumento obligatorio --angular_build_env"
   echo "Ambientes permitidos: development, qa, production"
   exit 1
fi

# Validar que el ambiente sea válido
if [[ "$CONFIGURATION" != "development" && "$CONFIGURATION" != "qa" && "$CONFIGURATION" != "production" ]]; then
    echo "Error: El ambiente '$CONFIGURATION' no es válido"
    echo "Ambientes permitidos: development, qa, production"
    exit 1
fi

CURRENT_STEP="Validaciones del sistema"
echo "$CURRENT_STEP..."

command -v docker >/dev/null || { echo "Docker no instalado"; exit 1; }
docker info >/dev/null || { echo "Docker no está corriendo"; exit 1; }

echo "Ambiente de compilación seleccionado: $CONFIGURATION"
echo ""

# ============================================================================
# Paso 4: Confirmación de despliegue
# ============================================================================
echo "Confirmación de despliegue..."

if [ "$FORCE" = false ]; then
    read -p "¿Continuar con el despliegue? (s/n): " confirm
    echo ""

    if [ "$confirm" != "s" ] && [ "$confirm" != "S" ]; then
        echo "Despliegue cancelado por el usuario"
        exit 0
    fi
fi

echo "  Confirmación recibida"
echo ""

# ============================================================================
# Paso 6: Compilar la aplicación Angular
# ============================================================================
echo "[6/10] Compilando aplicación Angular..."

echo 'Instalando/actualizando dependencias...'
npm install
echo "Construyendo aplicación en modo $CONFIGURATION..."
npm run build --configuration=$CONFIGURATION
echo 'Build completado exitosamente'


# ============================================================================
# Paso 7: Detener y limpiar contenedor/imagen anterior
# ============================================================================
echo ""
echo "[7/10] Deteniendo y limpiando contenedor frontend anterior..."
docker stop $FRONTEND_CONTAINER || true
docker rm -f $FRONTEND_CONTAINER || true
docker rmi -f $IMAGE_NAME || true

# ============================================================================
# Paso 8: Construir nueva imagen Docker
# ============================================================================
echo "[8/10] Construyendo nueva imagen Docker frontend..."
docker build -t $IMAGE_NAME .

# ============================================================================
# Paso 9: Verificar/Crear red Docker
# ============================================================================
echo "[9/10] Verificando red Docker..."
if docker network ls --format '{{.Name}}' | grep -q "^${NETWORK_NAME}$"; then
    echo "    Red '$NETWORK_NAME' ya existe"
else
    echo "  → Creando red '$NETWORK_NAME'..."
    docker network create $NETWORK_NAME
    echo "Red '$NETWORK_NAME' creada"
fi

# ============================================================================
# Paso 10: Ejecutar nuevo contenedor frontend
# ============================================================================
echo "[10/10] Ejecutando nuevo contenedor frontend..."
docker run -d \
    --name $FRONTEND_CONTAINER \
    --network $NETWORK_NAME \
    -p $SERVICE_PORT:$SERVICE_PORT \
    $IMAGE_NAME

# ============================================================================
# Verificación final
# ============================================================================
echo "Verificando que el contenedor esté funcionando..."

# Esperar con timeout para que el contenedor esté listo
echo "  → Esperando que el contenedor esté listo (timeout: ${CONTAINER_TIMEOUT}s)..."
WAITED=0
CONTAINER_READY=false

while [ $WAITED -lt $CONTAINER_TIMEOUT ]; do
    if docker ps | grep -q $FRONTEND_CONTAINER; then
        # Verificar que el contenedor esté saludable
        CONTAINER_STATUS=$(docker inspect --format='{{.State.Status}}' $FRONTEND_CONTAINER 2>/dev/null || echo "not_found")
        if [ "$CONTAINER_STATUS" = "running" ]; then
            CONTAINER_READY=true
            break
        fi
    fi
    sleep 1
    WAITED=$((WAITED + 1))
done

if [ "$CONTAINER_READY" = true ]; then
    echo "  Contenedor $FRONTEND_CONTAINER está ejecutándose correctamente"
else
    echo "Error: El contenedor $FRONTEND_CONTAINER no respondió en ${CONTAINER_TIMEOUT} segundos"
    echo "Verificando logs del contenedor:"
    docker logs $FRONTEND_CONTAINER 2>&1 | tail -n 50
    exit 1
fi


echo ""
echo "============================================================================"
echo "=== Despliegue completado exitosamente ==="
echo "============================================================================"
echo "La aplicación está disponible en http://localhost:$SERVICE_PORT"
echo ""
echo "Aplicación:     $PROYECTO_NAME"
echo "Ambiente:       $CONFIGURATION"
echo "Contenedor:     $FRONTEND_CONTAINER"
echo "Red:            $NETWORK_NAME"
echo "Puerto:         $SERVICE_PORT"
echo ""
echo "URL de acceso:  http://localhost:$SERVICE_PORT"
echo "============================================================================"