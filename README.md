# Sistema de Inventario Spring Angular

## Novedades de la Versión 2

En esta nueva versión se ha realizado un trabajo exhaustivo de refactorización y modernización del **Back-end**, enfocándose en los siguientes puntos clave:

-   **Modernización del Stack**: Actualización a **Java 21** y **Spring Boot 3.5.10** para garantizar el mejor rendimiento y soporte a largo plazo.
-   **Seguridad Mejorada**: Implementación limpia de **JWT** corregida y centralizada, eliminando usos de métodos obsoletos y asegurando las mejores prácticas en `SecurityConfig`.
-   **Calidad y Mantenibilidad**: Centralización de variables de entorno y configuración. Estandarización de DTOs y Mappers (MapStruct) para desacoplar las capas de la aplicación.
-   **Documentación Interactiva**: Inclusión de **Swagger UI** para visualizar y probar los endpoints directamente desde el navegador.
-   **Infraestructura**: Soporte mejorado para despliegue con contenedores **Docker**.

## Descripción General

Este proyecto es un sistema de inventario robusto desarrollado con **Spring Boot** (back-end) y **Angular** (front-end). Su objetivo es gestionar productos, controlar stocks y asegurar el acceso mediante un sistema de autenticación y autorización basado en **JWT**.

El backend está construido con **Java 21** y sigue las mejores prácticas de arquitectura en capas, utilizando **Maven** para la gestión de dependencias.

## Características Principales (Back-end)

-   **Lenguaje:** Java 21
-   **Framework:** Spring Boot 3.5.10
-   **Seguridad:** Spring Security con implementación de JWT (JSON Web Tokens).
-   **Base de Datos:** MySQL (con Spring Data JPA).
-   **Documentación de API:** Swagger UI / OpenAPI (SpringDoc).
-   **Mapeo de Objetos:** MapStruct.
-   **Monitoreo:** Spring Boot Actuator.
-   **Reducción de Código:** Lombok.

## Estructura del Back-end

El código fuente se encuentra organizado bajo el paquete `com.inventario` y sigue una arquitectura limpia:

-   `config/`: Configuraciones globales (Seguridad, Auditoría JPA, Swagger, App Properties).
-   `controller/`: Controladores REST (`AuthController`, `AdminController`).
-   `dto/`: Objetos de Transferencia de Datos.
-   `entity/`: Entidades JPA que mapean la base de datos.
-   `exception/`: Manejo centralizado de excepciones.
-   `mapper/`: Interfaces de MapStruct para conversión Entity-DTO.
-   `repository/`: Interfaces de repositorio (Spring Data JPA).
-   `security/`: Lógica de seguridad, filtros y configuración de JWT.
-   `service/`: Lógica de negocio.

## Requisitos Previos

-   **Java 21** o superior.
-   **Maven** 3.8+ (o usar el wrapper `mvnw` incluido).
-   **MySQL** (o un contenedor Docker con MySQL).

## Configuración y Ejecución

### 1. Base de Datos
Asegúrese de tener una instancia de MySQL corriendo. Configure las credenciales en `src/main/resources/application.properties` o `application.yml` (dependiendo de su configuración local).

Para inicializar la estructura de la base de datos y cargar los datos maestros (usuarios por defecto, unidades, etc.), **ejecute el script SQL**:

```bash
script/schema.sql
```

### 2. Construcción
Para compilar el proyecto y ejecutar las pruebas:

```bash
./mvnw clean install
```

### 3. Ejecución Local
Para iniciar la aplicación Spring Boot:

```bash
./mvnw spring-boot:run
```

La aplicación estará disponible en `http://localhost:8080`.

## Documentación de la API

Una vez iniciada la aplicación, puede acceder a la documentación interactiva de la API (Swagger UI) en:

-   URL: `http://localhost:8080/swagger-ui.html`
-   Docs JSON: `http://localhost:8080/v3/api-docs`

## Docker

El proyecto incluye soporte para Docker.
-   `Dockerfile`: Para crear la imagen de la aplicación.
-   `docker-compose.yml`: Para orquestar la aplicación junto con la base de datos.

```bash
docker-compose up -d
```

## Seguridad

El sistema utiliza **JWT** para proteger los endpoints.
-   **Auth**: Endpoint `/api/auth/**` para registro e inicio de sesión.
-   **Admin**: Endpoints protegidos en `/api/admin/**`.
