# Wani Connect (The Stallions)

![Versión](https://img.shields.io/badge/versión-1.0.0-blue)
![Estado](https://img.shields.io/badge/estado-en%20desarrollo-orange)
![Plataformas](https://img.shields.io/badge/plataformas-Android%20%7C%20iOS%20%7C%20Web-yellow)
![Licencia](https://img.shields.io/badge/licencia-privada-red)

> Readme técnico: Documentación técnica completa: Arquitectura, dependencias, variables de entorno, estructura modular, scripts y ejemplos de endpoints.

Aplicación móvil y web para explorar y conectar con las Ciudades Creativas de Nicaragua: Bluefields, Estelí, Granada, Juigalpa, León, Managua, Masaya, Matagalpa, Nagarote y San Juan de Oriente. Incluye mapa interactivo con rutas turísticas y de navegación, agenda de eventos con recordatorios, directorio de emprendimientos locales y una comunidad social de fotos. Conecta a visitantes y locales con el patrimonio cultural y gastronómico del país, impulsando la economía creativa.

El proyecto es un monorepo con dos aplicaciones:

| Aplicación | Tecnología | Ruta |
|---|---|---|
| Frontend | Expo (React Native 0.86, React 19, TypeScript) | `Frontend/The_Stallions` |
| Backend | Spring Boot 4 (Java 21, Maven), JPA/Hibernate + SQL Server | `Backend/the_stallions` |

Estado: en desarrollo (v1.0.0 de la app móvil / 0.0.1-SNAPSHOT del backend). No se incluyen insignias de CI/build porque el repositorio aún no cuenta con pipelines (ver [sección 13](#13-despliegue)).

---

## Índice

1. [Descripción](#1-descripción)
2. [Características](#2-características)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Arquitectura](#4-arquitectura)
5. [Estructura modular](#5-estructura-modular)
6. [Dependencias y requisitos](#6-dependencias-y-requisitos)
7. [Variables de entorno](#7-variables-de-entorno)
8. [Instalación, configuración y uso](#8-instalación-configuración-y-uso)
9. [Scripts](#9-scripts)
10. [Endpoints de la API](#10-endpoints-de-la-api)
11. [Base de datos](#11-base-de-datos)
12. [Pruebas](#12-pruebas)
13. [Despliegue](#13-despliegue)
14. [Contribución](#14-contribución)
15. [Licencia y autores](#15-licencia-y-autores)

---

## 1. Descripción

Wani Connect es una aplicación móvil (iOS, Android y web) para explorar las Ciudades Creativas de Nicaragua, una red reconocida por INTUR y la Red Nacional de Ciudades Creativas. Incluye un mapa interactivo del país con detección de ubicación, rutas de navegación entre departamentos y rutas turísticas con paradas e información de cada ciudad. Además integra una comunidad social de fotos (subir, comentar y dar like), un directorio de emprendimientos locales con ubicación y contacto, y una agenda de eventos con recordatorios push. Busca promover la economía creativa nicaragüense conectando a visitantes con el patrimonio material e inmaterial del país.

## 2. Características

- **Mapa interactivo** de Nicaragua con polígonos departamentales, marcadores por ciudad, emprendimientos y modos de vista satelital y vectorial.
- **Rutas de navegación** entre la ubicación del usuario y cada ciudad creativa/emprendimiento, con distancia y tiempo estimado (servicio OSRM).
- **Rutas turísticas** con paradas, descripciones e imágenes para las ciudades creativas del proyecto.
- **Sección de Eventos**: calendario mensual navegable que marca los días con eventos y lista los del mes visible; si el mes no tiene eventos, indica en qué meses hay y permite saltar a ellos. Descarga en formato iCalendar (`.ics`).
- **Notificaciones push** (Firebase Cloud Messaging) para eventos próximos, enviadas automáticamente por el backend, y notificaciones locales programables por evento desde su detalle.
- **Comunidad de fotos**: cámara, muro de la comunidad con carruseles (fotos agrupadas), fotos privadas/públicas, likes y comentarios, y notificaciones in-app de actividad.
- **Directorio de emprendimientos** por rubro con ubicación en mapa y contactos.
- **Panel de administración web** (`/admin`) para crear, editar y eliminar eventos y emprendimientos, protegido con login propio independiente de la app.
- **Perfil**: foto guardada en la base de datos y servida por URL pública con caché, edición de datos y ajustes de privacidad.
- **Seguridad**: verificación en dos pasos con app autenticadora (TOTP), cambio de contraseña, sesiones activas revocables y con caducidad por inactividad, usuarios bloqueados y exportación de datos.
- **Control de acceso por roles** (RBAC): roles `USER`, `ADMIN` y `AUDITOR`, con API de asignación de roles, bitácora de auditoría y protección de rutas según permisos.
- **Autenticación** por correo/contraseña y con Google (Firebase Auth + JWT).
- **Desbloqueo biométrico** (huella / Face ID) con `expo-local-authentication`.
- **Interfaz bilingüe** (español/inglés) y tema oscuro/claro.
- **Soporte multiplataforma**: Android, iOS y web.

## 3. Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Frontend | React Native + Expo (SDK) | 57 (React Native 0.86.2) |
| Frontend (UI) | React | 19.2.3 |
| Frontend (lenguaje) | TypeScript | 6.0.3 |
| Navegación | expo-router (file-based routing) | 57.0.11 |
| HTTP client | Axios | 1.18.1 |
| Autenticación (cliente) | Firebase Auth / Google Sign-In | 12.16.0 / 16.1.4 |
| Mapas | Leaflet + OSRM (WebView/iframe) | 1.9.4 |
| Backend | Spring Boot | 4.1.0 |
| Backend (lenguaje) | Java | 21 |
| Build | Apache Maven (wrapper) | 3.9.16 |
| Persistencia | Spring Data JPA (Hibernate, `ddl-auto=update`) | — |
| Base de datos | Microsoft SQL Server | — |
| Seguridad | Spring Security + JWT (jjwt) | 0.12.5 |
| Firebase (servidor) | firebase-admin | 9.3.0 |
| 2FA | TOTP (RFC 6238), HMAC-SHA1, 6 dígitos/30 s | `security/TOTP.java` |
| Despliegue backend | Docker / Render (histórico) | — |

## 4. Arquitectura

Patrón general: SPA móvil (Expo) conectada a una API REST sin estado (JWT) más un panel administrativo server-rendered, dentro de un único backend Spring Boot.

```text
+------------------------------+        +-----------------------------------+
|  FRONTEND · Expo/React Native |  HTTPS |  BACKEND · Spring Boot 4 (8080)   |
|  expo-router (file-based)     |-------->|                                  |
|  axios + JWT (SecureStore)    |        |  /api/**   REST JSON stateless JWT|
|  Firebase Auth (Google)       |        |  /admin/** Thymeleaf + formulario |
|  Notificaciones push (FCM)    |        |  @Scheduled recordatorio FCM      |
|  Mapas Leaflet/OSRM (WebView) |        |  JPA/Hibernate SQL Server        |
+------------------------------+        +-----------------------------------+
```

### Decisiones de diseño

1. **API REST sin estado con JWT** + registro de sesiones en la tabla `UserSessions`. El token mantiene la API sin estado (fácil de escalar y consumir desde móvil/web), mientras el registro de sesiones permite listarlas y revocarlas desde la app (`/api/user/sessions`), y el logout invalida la sesión asociada al token.

2. **Panel admin separado con Thymeleaf** y login por formulario (`/admin/**`), con una cadena de seguridad independiente de la API JWT. El CRUD de eventos y emprendimientos queda fuera del alcance de la app móvil sin exponer endpoints de escritura abiertos.

3. **Imágenes guardadas como BLOB** en SQL Server (`varbinary(max)`) y servidas por endpoints dedicados (`/api/eventos/{id}/foto`, `/api/emprendimientos/{id}/foto`, `/api/user/photo/{id}`, `/api/fotos/{id}/imagen`). Se elige la base de datos como almacenamiento para no depender de un CDN en la etapa inicial; los campos `*Url` ya existen para migrar a almacenamiento externo sin cambios de contrato.

4. **Recordatorios push con FCM** programados por `@Scheduled` (cron diario a las 08:00). El `EventoNotificacionScheduler` detecta eventos de los próximos 24–48 h y envía una notificación al *topic* de FCM `eventos`, al que se suscriben los clientes. Un *topic* (y no tokens por usuario) simplifica la operación.

### Acceso y seguridad

- **Cadena 1** (`/admin/**`): login por formulario (`/admin/login`), usuario en memoria definido por `app.admin.username` / `app.admin.password` (rol `ADMIN`).
- **Cadena 2** (`/api/**`): sin estado, CSRF desactivado, CORS configurado. Rutas públicas: `/api/auth/**`, `/api/user/photo/**`, `GET /api/fotos/*/imagen`, `GET /api/eventos/**`, `GET /api/emprendimientos/**`. El resto exige JWT con el encabezado `Authorization: Bearer {token}`.
- **Autenticación**: correo+contraseña (BCrypt) o Google (ID token verificado con Firebase Admin). La cuenta queda ligada a su provider (`LOCAL` o `GOOGLE`).
- **2FA**: TOTP (RFC 6238) verificable con Google Authenticator o Authy. El secreto se genera en el backend (`TOTP.generateSecret()`), se registra en el dispositivo con un QR `otpauth://` y se valida por `challengeId`.
- **Tokens**: librería jjwt 0.12.5; vigencia configurable (`jwt.expiration-ms`, por defecto 1 hora).
- **RBAC**: roles `USER`, `ADMIN` y `AUDITOR`. El filtro JWT carga el usuario desde la base de datos en cada petición y expone la autoridad `ROLE_<rol>`, de modo que un cambio de rol aplica de inmediato sin esperar la caducidad del token.
- **API de administración** (`/api/admin/**`): protegida por reglas de ruta y a nivel de método (`@PreAuthorize`). `ADMIN` asigna roles (con bitácora de auditoría) y suspende/habilita cuentas; `ADMIN` y `AUDITOR` pueden leer el listado de usuarios y la bitácora.
- **Sesiones**: además de la vigencia del token, cada sesión expira por inactividad (`app.session.max-inactivity-minutes`, por defecto 720 = 12 h). Un proceso programado marca como inactivas las sesiones vencidas y el filtro verifica en cada petición que la sesión esté activa, no expirada y que la cuenta siga habilitada.
- **Errores de seguridad**: petición sin autenticación responde `401` y petición sin permisos responde `403`.

## 5. Estructura modular

### Frontend (`Frontend/The_Stallions`)

```text
Frontend/The_Stallions/
  app.json                   nombre "Wani Connect", slug "the-stallions",
                             paquete Android com.eduard8813steam.thestallions
  package.json               dependencias y scripts npm
  .env                       variables locales (no versionar)
  assets/                    fuentes Gilroy, imágenes e iconos
  scripts/reset-project.js   utilidad del template de Expo (solo dev)
  src/
    app/                     rutas definidas por archivos (expo-router)
      _layout.tsx            providers (Lang, Theme, Auth) + gate biométrico
      index.tsx              puerta de autenticación/biometría, redirige a
                             (tabs) o (auth)
      (auth)/                login.tsx, register.tsx, two-factor.tsx
      (tabs)/                navegación inferior y pantallas principales
        _layout.tsx          barra de pestañas (5 visibles + rutas ocultas)
        index.tsx            Explorar
        eventos/             listado y detalle dinámico (eventos/{id}.tsx)
        camera.tsx           captura y subida de fotos (carrusel por grupo)
        comunidad.tsx        feed de la comunidad
        perfil.tsx           perfil propio
        misFotos.tsx / misFotosComunidad.tsx / notificaciones.tsx /
        mapa.tsx                    rutas ocultas (href: null)
      profile/               edit.tsx, help.tsx, privacy.tsx, security.tsx
    components/              UI reutilizable: NicaraguaMap, AuthButton,
                             GoogleButton, BiometricUnlockGate,
                             TOTPSetupModal, LangToggle, CalendarioEventos...
    config/                  firebaseConfig.js (inicializa Firebase Auth)
    constants/               tema, colores y espaciados
    context/                 AuthContext, LangContext (i18n ES/EN), ThemeContext
    hooks/                   use-theme, use-color-scheme, useAsync, useGoogleAuth
    services/                lógica de negocio y acceso a datos
      api.js                 cliente axios (base URL, interceptor JWT,
                             resolución de URL de imágenes)
      authService.js         login, register, google, 2FA
      userService.ts         perfil, seguridad, sesiones, notificaciones,
                             privacidad, bloqueos, exportación
      eventosService.ts      eventos y descarga ICS
      token.ts               persistencia del JWT (SecureStore/AsyncStorage)
      biometrics.ts          autenticación biométrica
      localSettings.ts       preferencias locales del dispositivo
      dataExportService.ts   exportación de datos (PDF/JSON)
      privacyService.ts      ajustes de privacidad
      notificationsService.ts / notificationsPermissions.ts   push
      events.ts              bus de eventos globales de la app
```

**Convenciones de nomenclatura (frontend):** pantallas y rutas en español (`eventos`, `comunidad`, `perfil`, `misFotos`); servicios, hooks y utilidades en inglés (`userService`, `token`, `biometrics`); componentes en PascalCase. Textos de UI con i18n vía `LangContext` (objeto `t`).

### Backend (`Backend/the_stallions`)

```text
Backend/the_stallions/
  pom.xml                    Spring Boot parent 4.1.0, Java 21
  Dockerfile                 build multi-stage (maven -> temurin 21-jre)
  mvnw / mvnw.cmd            Maven Wrapper (.mvn/)
  src/main/
    java/com/aplicacion/movil/the_stallions/
      config/                SecurityConfig, FirebaseConfig, FirebaseTokenService
      controller/            Auth, User, Evento, Emprendimiento, Foto,
                             AdminEvento, AdminEmprendimiento, AdminLoginPage
      dto/                   Request/ (entrada) y Response/ (salida)
      model/                 entidades JPA (Users, Eventos, Emprendimientos,
                             Photos...)
      repository/            Spring Data JPA
      scheduler/             EventoNotificacionScheduler (cron 0 0 8 * * *)
      security/              JwtUtils, JwtAuthenticationFilter, TOTP
      service/               AuthService, UserService, EventoService,
                             EmprendimientoService, FotoService,
                             CommentService, FcmService
    resources/
      application.properties
      templates/admin/       páginas Thymeleaf: login, eventos, evento-form,
                             emprendimientos, emprendimiento-form
      firebase-credentials.json   service account de Firebase (riesgo de secretos
                             versionados, ver sección 7)
  src/test/                  pruebas (ver sección 12)
```

**Convenciones de nomenclatura (backend):** rutas REST en plural español para dominio de negocio (`/api/eventos`, `/api/emprendimientos`, `/api/fotos`); controladores mixtos español/inglés (`EventoController`, `UserController`, `FotoController`); DTOs agrupados por `Request`/`Response`. Comentarios y mensajes de error en español.

> Hallazgo de consistencia: las columnas JPA mezclan estilos. `Photos`/`Comments` usan `snake_case` (`photo_id`, `fecha_upload`), mientras `Users`, `Eventos`, `Emprendimientos`, `UserSessions` y demás usan `PascalCase` (`PasswordHash`, `CreatedAt`). Con `ddl-auto=update` el esquema es coherente con las entidades, pero la convención debería unificarse.

## 6. Dependencias y requisitos

### Frontend — librerías principales

| Paquete | Versión | Descripción |
|---|---|---|
| `expo` | ~57.0.11 | SDK y tooling de la app |
| `expo-router` | ~57.0.11 | Navegación basada en archivos |
| `react` / `react-native` | 19.2.3 / 0.86.2 | Framework UI |
| `typescript` | ~6.0.3 | Tipado estático |
| `axios` | ^1.18.1 | Cliente HTTP hacia la API (JWT) |
| `firebase` | ^12.16.0 | Firebase Auth (Google) + FCM |
| `@react-native-google-signin/google-signin` | ^16.1.4 | Login Google nativo |
| `expo-secure-store` | ~57.0.1 | Almacenamiento seguro del JWT |
| `expo-local-authentication` | ~57.0.2 | Desbloqueo con huella / Face ID |
| `expo-notifications` | ~57.0.9 | Notificaciones push (FCM) |
| `expo-location` | ~57.0.8 | Ubicación (tab de mapa) |
| `expo-image-picker` | ~57.0.8 | Selección/captura de fotos |
| `expo-print` / `expo-sharing` | ~57.0.1 / ~57.0.16 | Exportación de datos (PDF) |
| `qrcode-generator` | ^2.0.4 | QR `otpauth://` para registrar TOTP |
| `react-native-webview` | 13.16.1 | Vista del mapa (Leaflet/OSRM) |
| `react-native-reanimated` | 4.5.1 | Animaciones |
| `@react-native-async-storage/async-storage` | 2.2.0 | Persistencia |
| `eslint` + `eslint-config-expo` | ^9.0.0 / ~57.0.0 | Linter |

### Backend — dependencias (pom.xml)

| Dependencia | Versión | Descripción |
|---|---|---|
| `spring-boot-starter-parent` | 4.1.0 | Padre de configuración de Spring Boot |
| `spring-boot-starter-web` | — | API REST y servidor web |
| `spring-boot-starter-security` | — | JWT + panel admin |
| `spring-boot-starter-data-jpa` | — | Persistencia con Hibernate |
| `spring-boot-starter-thymeleaf` | — | Panel server-rendered |
| `spring-boot-starter-validation` | — | Validación de DTOs |
| `mssql-jdbc` | — | Driver de SQL Server |
| `jjwt-api` / `jjwt-impl` / `jjwt-jackson` | 0.12.5 | Creación y validación de JWT |
| `firebase-admin` | 9.3.0 | Verificación de ID token + FCM |
| `lombok` | — | Reducción de boilerplate |
| `spring-boot-devtools` | runtime | Recarga en desarrollo |
| `spring-boot-starter-test` | test | JUnit 5 y utilidades de prueba |

### Requisitos previos

| Herramienta | Versión | Verificar con |
|---|---|---|
| Node.js | 20+ (el proyecto se desarrolló con 24) | `node --version` |
| npm | v10+ | `npm --version` |
| Java JDK | 21+ | `java --version` |
| Apache Maven | 3.9+ (o usar el wrapper incluido) | `mvn --version` |
| Git | 2.x | `git --version` |
| Microsoft SQL Server | — | Solo si se corre el backend localmente |

Opcionales: Android Studio (emulador), Xcode (simulador iOS, solo macOS) y EAS CLI (builds en la nube: `npm install -g eas-cli`).

> **Nota para builds Android locales:** el prebuild nativo (`expo prebuild` / Gradle) puede requerir JDK 17. Si tu JDK por defecto es más nuevo y la compilación falla, fija la ruta con `org.gradle.java.home={RUTA_JDK_17}` en `Frontend/The_Stallions/android/gradle.properties`. El backend compila y corre con JDK 21+.

Cuentas externas necesarias: Firebase (Auth + FCM/service account), Google Cloud Console (Client IDs OAuth Web/Android/iOS) y la base de datos (Somee.com o tu propio SQL Server).

## 7. Variables de entorno

El proyecto requiere variables de entorno para conectarse a Firebase, a la API y a la base de datos. No se versionan valores reales: se copian plantillas y se completan localmente.

### Frontend — creación del `.env`

1. Ve a `Frontend/The_Stallions/` y crea el archivo `.env`.
2. Copia las claves de Firebase desde la consola de Firebase (*Project settings*, sección *General* y *Cloud Messaging*) en las `EXPO_PUBLIC_FIREBASE_*`.
3. Genera los Client IDs OAuth Web/Android/iOS en Google Cloud Console y complétalos en las `EXPO_PUBLIC_GOOGLE_*`.
4. Define `EXPO_PUBLIC_API_URL` con la URL de tu backend (IP local o dominio público).
5. Reinicia `npm start` (un cambio de `.env` exige reiniciar Expo) y verifica que la app autentica y consulta la API.

Las variables con prefijo `EXPO_PUBLIC_` se incrustan en el bundle y son visibles en el cliente.

**Plantilla de referencia** (se incluye como `Frontend/The_Stallions/.env.example`, listo para copiar como `.env`):

```env
# URL del backend (local o desplegado)
EXPO_PUBLIC_API_URL=http://localhost:8080

# Firebase (consolas de Firebase / Google Cloud)
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

# Google Sign-In (OAuth Client IDs)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
# Solo iOS
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
```

| Variable | Descripción | Requerida | Se consume en |
|---|---|---|---|
| `EXPO_PUBLIC_API_URL` | URL base del backend sin `/api` (p. ej. `http://192.168.1.10:8080`) | Recomendada* | `src/services/api.js` |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | API key del proyecto Firebase | Sí | `src/config/firebaseConfig.js` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación (`{proyecto}.firebaseapp.com`) | Sí | `src/config/firebaseConfig.js` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto Firebase | Sí | `src/config/firebaseConfig.js` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket de Firebase Storage | Sí (configuración) | `src/config/firebaseConfig.js` |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID de FCM | Sí (push) | `src/config/firebaseConfig.js` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | App ID de Firebase | Sí | `src/config/firebaseConfig.js` |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Client ID OAuth Web (login Google) | Sí | `src/hooks/useGoogleAuth.js` |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Client ID OAuth Android (build nativa) | Opcional (solo Android) | `src/hooks/useGoogleAuth.js` |

> **Pendiente por confirmar con el equipo:** `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` (Client ID OAuth iOS) aparece en la plantilla del README, pero NO está definida en el `.env` actual ni referenciada en `src/`. Si se habilita el login con Google en iOS, hay que definirla y añadirla a `useGoogleAuth.js`.

\* `EXPO_PUBLIC_API_URL` no es estrictamente obligatoria: `src/services/api.js` cae a `http://{host}:8080` (detecta la IP del dev server de Metro) y finalmente a `http://localhost:8080`.

### Backend — `application.properties` y variables de entorno

Configura `Backend/the_stallions/src/main/resources/application.properties` (o sobrescribe por variable de entorno, usando mayúsculas y guion bajo en lugar de punto; p. ej. `spring.datasource.url` se vuelve `SPRING_DATASOURCE_URL`):

```properties
spring.datasource.url=jdbc:sqlserver://{HOST}:1433;databaseName={DB};encrypt=true;trustServerCertificate=true
spring.datasource.username={USUARIO}
spring.datasource.password={CLAVE}
spring.jpa.hibernate.ddl-auto=update

jwt.secret={SECRETO_JWT_MINIMO_32_CARACTERES}
jwt.expiration-ms=3600000

# Inactividad máxima de una sesión (minutos) antes de expirarla
app.session.max-inactivity-minutes=720

firebase.credentials-path=firebase-credentials.json

# URL pública del backend (para construir enlaces en notificaciones y fotos)
app.base-url={URL_BASE}

# Panel de administración (/admin/login)
app.admin.username={USUARIO_ADMIN}
app.admin.password={CLAVE_ADMIN}
```

- `firebase-credentials.json` es el *service account* de Firebase que debe existir en el classpath (`src/main/resources/`).
- En despliegue, Firebase también puede configurarse con la variable de entorno `FIREBASE_CREDENTIALS_JSON` con el contenido del JSON (ver `FirebaseConfig`).

| Variable de entorno | Propiedad | Descripción | Requerida |
|---|---|---|---|
| `SPRING_DATASOURCE_URL` | `spring.datasource.url` | JDBC URL de SQL Server | Sí |
| `SPRING_DATASOURCE_USERNAME` | `spring.datasource.username` | Usuario de la BD | Sí |
| `SPRING_DATASOURCE_PASSWORD` | `spring.datasource.password` | Contraseña de la BD | Sí |
| `JWT_SECRET` | `jwt.secret` | Secreto HMAC de JWT (mínimo 32 caracteres) | Sí (producción) |
| `JWT_EXPIRATION_MS` | `jwt.expiration-ms` | Vigencia del token en ms (default `3600000`) | No |
| `FIREBASE_CREDENTIALS_JSON` | `firebase.credentials-path` | JSON del service account de Firebase (alternativa al archivo en `resources/`) | No* |
| `APP_BASE_URL` | `app.base-url` | URL pública del backend para construir la foto de perfil; vacío = usar el host de la petición | No |
| `APP_ADMIN_USERNAME` | `app.admin.username` | Usuario del panel `/admin` | Sí (producción) |
| `APP_ADMIN_PASSWORD` | `app.admin.password` | Contraseña del panel `/admin` | Sí (producción) |
| `SPRING_SERVLET_MULTIPART_MAX_FILE_SIZE` | `spring.servlet.multipart.max-file-size` | Límite de subida por archivo (default `10MB`) | No |
| `SPRING_SERVLET_MULTIPART_MAX_REQUEST_SIZE` | `spring.servlet.multipart.max-request-size` | Límite de subida por petición (default `10MB`) | No |

\* `firebase.credentials-path` apunta al archivo incluido en `resources/`. Si se define `FIREBASE_CREDENTIALS_JSON`, `FirebaseConfig` usa ese valor y **no** el archivo.

> **Seguridad:** no comitees credenciales reales. En producción, sobrescribe estos valores con variables de entorno del proveedor de despliegue.

## 8. Instalación, configuración y uso

### Clonar e instalar

```bash
git clone https://github.com/Eduard8813/The-Stallions.git
cd The-Stallions
```

**Frontend (Expo / React Native):**

```bash
cd Frontend/The_Stallions
npm install
```

**Backend (Spring Boot):**

```bash
cd Backend/the_stallions
# Unix/macOS
./mvnw install
# Windows
mvnw.cmd install
```

### Desarrollo

**Backend** (servidor en `http://localhost:8080`):

```bash
cd Backend/the_stallions
# Unix/macOS
./mvnw spring-boot:run
# Windows
mvnw.cmd spring-boot:run
```

Verifica: API pública en `http://localhost:8080/api/eventos` y panel admin en `http://localhost:8080/admin/login`.

> El esquema de BD se sincroniza automáticamente al arrancar (`spring.jpa.hibernate.ddl-auto=update`).

**Frontend** (dev server de Expo):

```bash
cd Frontend/The_Stallions
npm start
```

- `a` → emulador Android · `i` → simulador iOS · `w` → web.
- En dispositivo físico, apunta `EXPO_PUBLIC_API_URL` a la IP de la máquina donde corre el backend (puerto 8080).

**Panel de administración de eventos** (con el backend corriendo):

```
http://localhost:8080/admin/login
```

Entra con las credenciales definidas en `app.admin.username` / `app.admin.password`. Desde ahí se crean, editan y eliminan los eventos y emprendimientos que consume la app.

> Todos los flujos usan el backend real vía `axios`; la capa de simulación (`mockApi`) fue retirada y sus servicios se migraron al API.

### Producción

**Backend** — build del JAR o imagen Docker:

```bash
cd Backend/the_stallions
./mvnw clean package -DskipTests

# Alternativa con Docker
docker build -t the-stallions .
docker run -p 8080:8080 the-stallions
```

**Frontend** — export estático web o build con EAS:

```bash
cd Frontend/The_Stallions
npx expo export --platform web
# o build de binario móvil:
npx eas build --platform android
```

## 9. Scripts

### Frontend (`Frontend/The_Stallions`)

| Script | Comando | Descripción |
|---|---|---|
| start | `npm start` | Inicia el servidor de desarrollo de Expo |
| android | `npm run android` | Build y ejecución en Android (`expo run:android`) |
| ios | `npm run ios` | Build y ejecución en iOS (`expo run:ios`) |
| web | `npm run web` | Versión web (`expo start --web`) |
| lint | `npm run lint` | Linter (`expo lint`) |
| test | `npm test` / `npm run test:watch` | Suite de tests (Jest / jest-expo), modo interactivo opcional |
| reset-project | `npm run reset-project` | Utilidad del template de Expo (resetea el proyecto; no usar en este repo) |

### Backend (`Backend/the_stallions`)

| Script | Comando | Descripción |
|---|---|---|
| spring-boot:run | `./mvnw spring-boot:run` | Arranca API + panel admin (puerto 8080) |
| test | `./mvnw test` | Ejecuta las pruebas |
| clean install | `./mvnw clean install` | Compila, ejecuta tests y genera el artefacto |
| package | `./mvnw clean package -DskipTests` | Compila y genera el JAR sin ejecutar tests |
| docker build | `docker build -t the-stallions .` | Imagen multietapa (JDK 21) |
| docker run | `docker run -p 8080:8080 -e SPRING_DATASOURCE_URL=... the-stallions` | Ejecuta el contenedor |

> En Windows usa `mvnw.cmd` en lugar de `./mvnw`.

## 10. Endpoints de la API

Base: `http://{host}:8080/api`. Salvo los marcados como públicos, todos requieren la cabecera `Authorization: Bearer {token}`.

### Autenticación — `/api/auth` (públicos)

| Método | Ruta | Descripción | Parámetros |
|---|---|---|---|
| POST | `/api/auth/register` | Registro con correo+contraseña | `{ email, password, fullName }` |
| POST | `/api/auth/login` | Inicio de sesión | `{ email, password }` |
| POST | `/api/auth/google` | Login/registro con Google | `{ idToken }` (ID token de Firebase) |
| POST | `/api/auth/2fa/verify` | Verifica el código TOTP de un desafío | `{ challengeId, code }` |
| POST | `/api/auth/2fa/resend` | Validación del desafío (con TOTP no hay reenvío real; el código se regenera en la app de autenticación) | `{ challengeId }` |
| POST | `/api/auth/logout` | Cierra la sesión del token | Cabecera `Authorization` |

**Respuesta común de autenticación** (`AuthResponse`):

```json
{
  "token": "eyJhbGciOi...",
  "email": "usuario@example.com",
  "fullName": "Nombre Apellido",
  "requiresTwoFactor": false,
  "challengeId": null
}
```

Cuando el usuario tiene 2FA activo, `token` es `null`, `requiresTwoFactor` es `true` y llega `challengeId`; hay que completar el flujo con `/api/auth/2fa/verify`.

Ejemplo:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","password":"s3cr3t"}'
```

### Usuario — `/api/user`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/user/profile` | Perfil del usuario autenticado |
| PUT | `/api/user/profile` | Actualiza perfil (`UpdateProfileRequest`) |
| POST | `/api/user/profile/photo` | Sube foto de perfil (`multipart/form-data`, campo `photo`) |
| GET | `/api/user/photo/{userId}` | Bytes de la foto de perfil (**público**) |
| GET | `/api/user/security` | Estado de seguridad (2FA activo, TOTP, etc.) |
| PUT | `/api/user/security/password` | Cambia contraseña (`{ currentPassword, newPassword }`) |
| PATCH | `/api/user/security/2fa` | Activa/desactiva 2FA (`{ enabled }`) |
| GET | `/api/user/sessions` | Lista de sesiones activas |
| DELETE | `/api/user/sessions/{id}` | Revoca una sesión |
| GET | `/api/user/notifications` | Ajustes de notificaciones |
| PATCH | `/api/user/notifications` | Actualiza ajustes de notificaciones (patch parcial) |
| GET | `/api/user/privacy` | Ajustes de privacidad |
| PATCH | `/api/user/privacy` | Actualiza privacidad (patch parcial) |
| GET | `/api/user/blocked` | Usuarios bloqueados |
| DELETE | `/api/user/blocked/{id}` | Desbloquea usuario |
| POST | `/api/user/data-export` | Solicita exportación de datos |
| DELETE | `/api/user/account` | Elimina la cuenta |

### Eventos — `/api/eventos` (lectura pública)

| Método | Ruta | Descripción | Parámetros |
|---|---|---|---|
| GET | `/api/eventos` | Lista de eventos | `?categoria=FERIADO, CONMEMORACION, CELEBRACION` (opcional) |
| GET | `/api/eventos/{id}` | Detalle de un evento | — |
| GET | `/api/eventos/{id}/foto` | Bytes de la foto del evento (**público**) | — |
| POST | `/api/eventos/{id}/foto` | Sube/reemplaza foto (`multipart`, campo `foto`) | Requiere JWT |
| GET | `/api/eventos/{id}/ics` | Descarga del evento en formato iCalendar (`text/calendar`) | — |

Ejemplos:

```bash
curl http://localhost:8080/api/eventos?categoria=FERIADO

# Descargar como evento de calendario
curl http://localhost:8080/api/eventos/1/ics -o evento.ics
```

### Emprendimientos — `/api/emprendimientos` (lectura pública)

| Método | Ruta | Descripción | Parámetros |
|---|---|---|---|
| GET | `/api/emprendimientos` | Lista de emprendimientos | `?tipo={rubro}` (opcional) |
| GET | `/api/emprendimientos/categorias` | Rubros/tipos disponibles | — |
| GET | `/api/emprendimientos/{id}` | Detalle | — |
| GET | `/api/emprendimientos/{id}/foto` | Bytes de la foto (**público**) | — |
| POST | `/api/emprendimientos` | Crea (201) | Body `EmprendimientoRequest` |
| PUT | `/api/emprendimientos/{id}` | Actualiza | Body `EmprendimientoRequest` |
| POST | `/api/emprendimientos/{id}/foto` | Sube foto (`multipart`, campo `foto`) | — |
| DELETE | `/api/emprendimientos/{id}` | Elimina (204) | — |

Los métodos de escritura exigen JWT. El campo `tipo` es libre (artesanía, gastronomía, etc.), no un enum.

### Fotos y comunidad — `/api/fotos`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/fotos` | Sube foto. `multipart/form-data`: `photo` (archivo), `visibilidad` (`PRIVADA`/`PUBLICA`), `descripcion` (opcional), `grupoId` (opcional, para carrusel) |
| GET | `/api/fotos/mias` | Fotografías propias (privadas y públicas) |
| GET | `/api/fotos/comunidad` | Feed público paginado: `?page=1&pageSize=10` |
| GET | `/api/fotos/comunidad/posts` | Posts públicos (agrupa fotos con mismo `grupoId`): `?page=1&pageSize=10` |
| PUT | `/api/fotos/{id}` | Cambia visibilidad de foto propia: `{ "visibilidad": "PUBLICA" }` |
| DELETE | `/api/fotos/{id}` | Elimina foto propia (204) |
| GET | `/api/fotos/{id}/imagen` | Bytes de la imagen (**público**; las privadas solo para su dueño; acepta `?token={token}` para servir imágenes privadas al cliente móvil) |
| POST | `/api/fotos/{id}/like` | Toggle de like del usuario autenticado |
| GET | `/api/fotos/{id}/comentarios` | Lista comentarios de la foto |
| POST | `/api/fotos/{id}/comentarios` | Agrega comentario: `{ "texto": "..." }` |
| PUT | `/api/fotos/comentarios/{id}` | Edita comentario propio: `{ "texto": "..." }` |
| DELETE | `/api/fotos/comentarios/{id}` | Elimina comentario propio (204) |
| GET | `/api/fotos/notificaciones` | Notificaciones del usuario autenticado |
| PUT | `/api/fotos/notificaciones/{id}/leida` | Marca notificación como leída (204) |

Los likes se almacenan como JSON en la columna `usuarios_like` de `Photos` (ver [sección 11](#11-base-de-datos)).

Ejemplo de subida:

```bash
curl -X POST http://localhost:8080/api/fotos \
  -H "Authorization: Bearer {token}" \
  -F "photo=@/ruta/imagen.jpg" \
  -F "visibilidad=PUBLICA" \
  -F "descripcion=Plaza de la cultura"
```

### Panel de administración — `/admin/**`

CRUD server-rendered (Thymeleaf) para eventos y emprendimientos:

| Ruta | Descripción |
|---|---|
| `/admin/login` | Login por formulario (público) |
| `/admin/logout` | Cierre de sesión |
| `/admin/eventos` | Listado de eventos + alta/edición/baja |
| `/admin/eventos/nuevo`, `/admin/eventos/{id}/editar` | Formularios de evento |
| `/admin/emprendimientos` | Listado de emprendimientos + alta/edición/baja |
| `/admin/emprendimientos/nuevo`, `/admin/emprendimientos/{id}/editar` | Formularios de emprendimiento |

La gestión de fotos de la comunidad, usuarios y notificaciones no dispone aún de pantalla de administración.

### Administración de usuarios y roles — `/api/admin` (RBAC)

Acceso con JWT según el rol: `ADMIN` puede escribir y leer; `AUDITOR` solo puede leer (listado de usuarios y bitácora).

| Ruta | Método | Acceso | Descripción |
|---|---|---|---|
| `/api/admin/users` | GET | ADMIN, AUDITOR | Lista de usuarios (id, email, nombre, usuario, rol, estado, fecha de alta) |
| `/api/admin/users/{id}/role` | PUT | ADMIN | Asigna el rol (`USER`, `ADMIN`, `AUDITOR`); prohíbe cambiarse el rol a sí mismo y deja registro en la bitácora |
| `/api/admin/users/{id}/status` | PATCH | ADMIN | Habilita/suspende una cuenta; al suspender se revocan sus sesiones activas |
| `/api/admin/roles/audit` | GET | ADMIN, AUDITOR | Últimos 200 cambios de rol (usuario, quién lo cambió, roles anterior/nuevo, fecha) |

Los cambios de rol entran en vigor en la siguiente petición del usuario (el filtro JWT relee el rol desde la base de datos por cada request).

## 11. Base de datos

Backend: **SQL Server** con **Hibernate** (`ddl-auto=update`), dialecto `SQLServerDialect`. Las imágenes se guardan como BLOB (`varbinary(max)`).

| Tabla | Descripción | Campos destacados |
|---|---|---|
| `Users` | Usuarios | `id`, `email`, `PasswordHash`, `FullName`, `role` (`USER`/`ADMIN`/`AUDITOR`), `provider` (`LOCAL`/`GOOGLE`), `ProviderId`, `PhotoUrl`/`PhotoData`/`PhotoContentType`, `Username`, `Phone`, `BirthDate`, `Gender`, `City`, `Bio`, `TwoFactorEnabled`, `TotpSecret`, `IsEnabled`, `CreatedAt`, `UpdatedAt` |
| `Eventos` | Eventos culturales | `id`, `titulo`, `fecha`, `FechaFin`, `categoria` (`FERIADO`/`CONMEMORACION`/`CELEBRACION`), `descripcion`, `FotoData`/`FotoContentType`/`FotoUrl`, `CreatedAt`, `UpdatedAt` |
| `Emprendimientos` | Emprendimientos locales | `id`, `nombre`, `tipo` (rubro libre), `descripcion`, `lat`, `lng`, `ContactoTelefono`, `ContactoEmail`, `ContactoRedes`, `FotoData`/`FotoContentType`/`FotoUrl`, `CreatedAt`, `UpdatedAt` |
| `Photos` | Fotos de la comunidad | `id`, `user_id` (FK), `visibilidad` (`PRIVADA`/`PUBLICA`), `url`, `photo_data` (BLOB), `content_type`, `descripcion`, `fecha_upload`, `grupo_id` (agrupa fotos de un mismo post/carrusel), `usuarios_like` (JSON, `nvarchar(max)`) |
| `Comments` | Comentarios de fotos | `id`, `photo_id` (FK), `user_id` (FK), `texto` (`nvarchar(max)`), `fecha`, `editado` |
| `Notifications` | Notificaciones in-app | `id`, `usuario_destino_id` (FK), `usuario_origen_id` (FK), `tipo` (like/comentario/…), `mensaje`, `relacion_id`, `leida`, `fecha` |
| `UserSessions` | Sesiones activas | `id`, `UserId` (FK), `Device`, `Platform`, `Location`, `LastActive`, `IsActive`, `TokenId` (único), `CreatedAt` |
| `RoleChangeAudits` | Bitácora de cambios de rol | `id`, `UserId` (FK), `ChangedById`, `ChangedByEmail`, `FromRole`, `ToRole`, `CreatedAt` |
| `TwoFactorChallenges` | Desafíos 2FA pendientes | `id`, `ChallengeId` (único), `Email`, `CodeHash`, `ExpiresAt` (5 min), `Used`, `CreatedAt` |
| `BlockedUsers` | Usuarios bloqueados | `id`, `UserId` (FK), `BlockedUserId`, `Name`, `Username` |
| `UserNotifications` | Preferencias de notificaciones | `id`, `UserId` (FK), `SettingsJson` (`nvarchar(max)`) |
| `UserPrivacy` | Preferencias de privacidad | `id`, `UserId` (FK), `Visibility`, `ShowEmail`, `ShowPhone`, `ShowLocation`, `Discoverable` |
| `DataExports` | Solicitudes de exportación de datos | `id`, `UserId` (FK), `ExportId` (único), `Status` (default `processing`), `AvailableForHours` (default 48), `CreatedAt` |

Enums: `AuthProvider { LOCAL, GOOGLE }`, `Visibilidad { PRIVADA, PUBLICA }`, `CategoriaEvento { FERIADO, CONMEMORACION, CELEBRACION }`, `Rol { USER, ADMIN, AUDITOR }`.

## 12. Pruebas

### Backend

- Framework: **JUnit 5** (`spring-boot-starter-test`).
- Situación actual: prueba de humo `TheStallionsApplicationTests#contextLoads` (verifica que el contexto de Spring arranca), generación/verificación TOTP (`TOTPTest`) y reglas de sesión y roles (`SessionSecurityTest`). Se puede ampliar con tests de servicios/controladores.
- Ejecutar:

```bash
cd Backend/the_stallions
./mvnw test
```

### Frontend

- Framework: **Jest** (`jest-expo`, preset del SDK 57). La suite cubre utilidades puras; los componentes con dependencias nativas se pueden añadir progresivamente.
- Ejecutar:

```bash
cd Frontend/The_Stallions
npm test          # o npm run test:watch en modo interactivo
npm run lint      # verificación estática
```

## 13. Despliegue

**CI/CD:** no configurado. El directorio `.github/` del repositorio no contiene pipelines (workflows) para build, test o deploy. Debe definirse (p. ej., GitHub Actions para: build backend con Maven, build frontend con Expo/EAS, y despliegue de la imagen Docker del backend).

**Backend:**

- Existe un `Dockerfile` multietapa: build con `maven:3.9.6-eclipse-temurin-21` y runtime `eclipse-temurin:21-jre`, expone el puerto `8080`.
- `CorsConfigurationSource` ya permite, además de orígenes locales de desarrollo (`localhost:19006/8081/8082`, `exp://…`), el origen `https://the-stallions.onrender.com` — huella de un despliegue previo en Render. Verificar si ese despliegue sigue vigente.
- En producción es obligatorio sobrescribir por entorno los secretos de `application.properties` (BD, JWT, admin, Firebase).

**Frontend:**

- Configuración nativa en `app.json`: paquete Android `com.eduard8813steam.thestallions`, `googleServicesFile` apuntando a `./google-services.json`, tablets iOS soportadas.
- Builds nativos vía Expo/EAS o `expo run:*`; también publicable como web (`expo start --web` / `expo export`).

## 14. Contribución

Toda la información sobre el flujo de trabajo, estándares de código y cómo enviar cambios está en **[CONTRIBUTING.md](CONTRIBUTING.md)**.

**Modelo de ramas por capa:**

```text
main          ← rama principal, estable
├── frontend  ← desarrollo del frontend (Expo/React Native)
└── backend   ← desarrollo del backend (Spring Boot)
```

- **Pull requests:** se abren hacia `frontend` o `backend` (no a `main`), incluyendo qué se resuelve, cómo se probó y capturas si hay cambio visual. No se hace commit directo a `main`, `frontend` ni `backend`.
- **Convención de commits** (verificada en el historial del repo): `{tipo}({ámbito}): {descripción}` con tipos `feat`, `fix`, `chore`, `docs`, `refactor`, `test`; el ámbito indica la capa (`frontend`/`backend`). Mensajes de una sola línea, en español. Ejemplos reales: `feat: restyle ...`, `fix: corregir ...`, `docs(...)`.
- **Antes del PR:** `./mvnw test` en backend y `npm run lint` en frontend.
- Cada cambio de instalación/scripts/uso debe reflejarse en este README.

**Flujo resumido:** 1) clonar el repo, 2) crear una rama feature desde `frontend` o `backend`, 3) hacer los cambios con commits descriptivos, 4) hacer push y abrir un PR hacia `frontend` o `backend`.

## 15. Licencia y autores

**Uso privado.** No se permite la distribución ni el uso comercial sin autorización.

> Nota: el archivo `Frontend/The_Stallions/LICENSE` corresponde a la licencia MIT del template de Expo incluido por `create-expo-app`, y no constituye la licencia del proyecto. La licencia oficial del proyecto es el archivo `LICENSE` de la raíz (uso privado).

**Autores:**

- **Eduard8813** — mantenedor principal ([GitHub](https://github.com/Eduard8813)) y el equipo de desarrollo "The Stallions".