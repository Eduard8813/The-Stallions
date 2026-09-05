# Wani Connect (The Stallions)

Plataforma móvil + web para descubrir y conectar con las Ciudades Creativas de Nicaragua. Reúne en una sola app: mapa interactivo de lugares, agenda de eventos con recordatorios, directorio de emprendimientos locales y una comunidad social de fotos (subir, comentar, dar like), con inicio de sesión por correo o Google, verificación en dos pasos (TOTP) y más funciones de seguridad y privacidad.

El proyecto es un **monorepo** con dos aplicaciones:

| App | Tecnología | Ruta |
|---|---|---|
| Frontend | Expo (React Native 0.86, React 19, TypeScript) | `Frontend/The_Stallions` |
| Backend | Spring Boot 4 (Java 21, Maven) | `Backend/the_stallions` |

> Estado: en desarrollo (v1.0.0 de la app móvil / 0.0.1-SNAPSHOT del backend). No se incluyen insignias de CI/CD porque el repositorio no cuenta con pipelines configurados todavía (ver [Despliegue](#12-despliegue)).

## Tabla de contenidos

1. [Arquitectura](#1-arquitectura)
2. [Estructura modular](#2-estructura-modular)
3. [Dependencias y requisitos](#3-dependencias-y-requisitos)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Instalación y puesta en marcha](#5-instalación-y-puesta-en-marcha)
6. [Scripts](#6-scripts)
7. [Endpoints de la API](#7-endpoints-de-la-api)
8. [Base de datos](#8-base-de-datos)
9. [Pruebas](#9-pruebas)
10. [Despliegue](#10-despliegue)
11. [Contribución](#11-contribución)
12. [Licencia y autores](#12-licencia-y-autores)
13. [Pendientes para completar manualmente](#13-pendientes-para-completar-manualmente)

---

## 1. Arquitectura

Patrón general: **SPA móvil (Expo) conectada a una API REST stateless (JWT) + panel administrativo server-rendered** en un único backend Spring Boot.

```text
┌──────────────────────────────┐        ┌───────────────────────────────────────────────┐
│  FRONTEND · Expo/React Native │  HTTPS │  BACKEND · Spring Boot 4 (Puerto 8080)        │
│  expo-router (file-based)     │--------►│                                              │
│  axios + JWT (SecureStore)    │        │  /api/**        → REST JSON stateless (JWT)   │
│  Firebase Auth (Google)       │        │  /admin/**      → Thymeleaf + formulario      │
│  Notificaciones push (FCM)    │        │  @Scheduled     → recordatorio de eventos FCM │
│  Mapas Leaflet/OSRM (WebView) │        │  JPA/Hibernate  → SQL Server (Somee.com)      │
└──────────────────────────────┘        └───────────────────────────────────────────────┘
```

### Por qué estas decisiones

1. **API REST stateless con JWT + registro de sesiones** en la tabla `UserSessions`. El token mantiene la API sin estado (simple de escalar y consumir desde móvil/web), mientras que el registro de sesiones permite listarlas y revocarlas desde la app (`/api/user/sessions`), y el `logout` invalida la sesión asociada al token.
2. **Panel admin separado con Thymeleaf y login por formulario** (`/admin/**`), con cadena de seguridad independiente de la API JWT. El CRUD de eventos y emprendimientos queda fuera del alcance de la app móvil sin exponer endpoints de escritura abiertos.
3. **Imágenes guardadas como BLOB en SQL Server** (`varbinary(max)`) y servidas por endpoints dedicados (`/api/eventos/{id}/foto`, `/api/emprendimientos/{id}/foto`, `/api/user/photo/{id}`, `/api/fotos/{id}/imagen`). Se elige la base de datos como almacenamiento para evitar depender de un CDN en la etapa inicial; los campos `*Url` ya existen para migrar a almacenamiento externo sin cambios de contrato.
4. **Recordatorios push con FCM programados por `@Scheduled`** (`cron` diario a las 08:00). El scheduler `EventoNotificacionScheduler` detecta eventos de los próximos 24-48 h y envía una notificación al topic de FCM `eventos`, al que se suscriben los clientes. Atacado con un topic (no con tokens por usuario) para simplicidad operativa.

### Acceso y seguridad

- **Cadena 1 — `/admin/**`**: login por formulario (`/admin/login`), usuario en memoria definido por `app.admin.username` / `app.admin.password` (rol `ADMIN`).
- **Cadena 2 — `/api/**`**: sin estado, CSRF desactivado, CORS configurado. Rutas públicas: `/api/auth/**`, `/api/user/photo/**`, `GET /api/fotos/*/imagen`, `GET /api/eventos/**`, `GET /api/emprendimientos/**`. El resto exige JWT (`Authorization: Bearer <token>`).
- **Autenticación**: correo+contraseña (BCrypt) o Google (ID token de Firebase verificado con Firebase Admin). La cuenta queda ligada a su `provider` (`LOCAL` o `GOOGLE`).
- **2FA**: TOTP (RFC 6238) verificable con apps como Google Authenticator o Authy. El secreto se genera en el backend (`TOTP.generateSecret()`), se registra en el dispositivo y se valida por `challengeId`.
- **Tokens**: librería `jjwt` 0.12.5; vigencia configurable (`jwt.expiration-ms`, por defecto 1 h).

---

## 2. Estructura modular

### Frontend (`Frontend/The_Stallions`)

```text
Frontend/The_Stallions/
├── app.json                     # nombre "Wani Connect", slug "the-stallions", paquete Android com.eduard8813steam.thestallions
├── package.json                 # dependencias y scripts npm
├── .env                         # variables locales (NO versionar secretos)
├── assets/                      # fuentes Gilroy, imágenes e iconos
├── scripts/reset-project.js     # utilidad del template de Expo (dev)
└── src/
    ├── app/                     # rutas definidas por archivos (expo-router)
    │   ├── _layout.tsx          # providers (Lang, Theme, Auth) + gate biométrico + listener de fin de sesión
    │   ├── index.tsx            # puerta de autenticación/biometría → redirige a (tabs) o (auth)
    │   ├── (auth)/              # login.tsx, register.tsx, two-factor.tsx
    │   ├── (tabs)/              # navegación inferior y pantallas principales
    │   │   ├── _layout.tsx      # define la barra de pestañas (5 visibles + rutas ocultas)
    │   │   ├── index.tsx        # Explorar
    │   │   ├── eventos/         # listado y detalle dinámico (eventos/[id].tsx)
    │   │   ├── camera.tsx       # captura y subida de fotos (carrusel por grupo)
    │   │   ├── comunidad.tsx    # feed de la comunidad
    │   │   ├── perfil.tsx       # perfil propio
    │   │   ├── misFotos.tsx / misFotosComunidad.tsx / notificaciones.tsx / mensajes.tsx / mapa.tsx  # rutas ocultas (href: null)
    │   └── profile/             # edit.tsx, help.tsx, privacy.tsx, security.tsx
    ├── components/              # UI reutilizable: NicaraguaMap, AuthButton, GoogleButton, BiometricUnlockGate, TOTPSetupModal, LangToggle, CalendarioEventos, ...
    ├── config/                  # firebaseConfig.js (inicializa Firebase Auth con persistencia)
    ├── constants/               # tema, colores y espaciados
    ├── context/                 # AuthContext, LangContext (i18n ES/EN), ThemeContext
    ├── hooks/                   # use-theme, use-color-scheme, useAsync, useGoogleAuth
    └── services/                # lógica de negocio y acceso a datos
        ├── api.js               # cliente axios (base URL, interceptor JWT, resolución de URL de imágenes)
        ├── authService.js       # login, register, google, 2FA
        ├── userService.ts       # perfil, seguridad, sesiones, notificaciones, privacidad, bloqueos, exportación
        ├── eventosService.ts    # eventos y descarga ICS
        ├── token.ts             # persistencia del JWT (SecureStore/AsyncStorage)
        ├── biometrics.ts        # autenticación biométrica (expo-local-authentication)
        ├── localSettings.ts     # preferencias locales del dispositivo
        ├── dataExportService.ts # exportación de datos (PDF/JSON)
        ├── privacyService.ts    # ajustes de privacidad
        ├── notificationsService.ts / notificationsPermissions.ts  # push
        ├── mockApi.ts           # capa mock para funciones sin backend real (sesión expirada simulada)
        └── events.ts            # bus de eventos globales de la app
```

**Convenciones de nomenclatura (frontend):** pantallas y rutas en español (`eventos`, `comunidad`, `perfil`, `misFotos`); servicios, hooks y utilidades en inglés (`userService`, `token`, `biometrics`); componentes en PascalCase. Textos de UI con i18n vía `LangContext` (objeto `t`).

> Nota: `src/app/explore.tsx` es código de ejemplo del template de Expo sin uso en la app (ver sección 13).

### Backend (`Backend/the_stallions`)

```text
Backend/the_stallions/
├── pom.xml                      # Spring Boot parent 4.1.0, Java 21
├── Dockerfile                   # build multi-stage (maven → temurin 21-jre)
├── mvnw / mvnw.cmd              # Maven Wrapper (.mvn/)
├── src/main/
│   ├── java/com/aplicacion/movil/the_stallions/
│   │   ├── config/              # SecurityConfig, FirebaseConfig, FirebaseTokenService
│   │   ├── controller/          # Auth, User, Evento, Emprendimiento, Foto, AdminEvento, AdminEmprendimiento, AdminLoginPage
│   │   ├── dto/                 # Request/ (entrada) y Response/ (salida)
│   │   ├── model/               # entidades JPA (Users, Eventos, Emprendimientos, Photos, ...)
│   │   ├── repository/          # Spring Data JPA
│   │   ├── scheduler/           # EventoNotificacionScheduler (cron 0 0 8 * * *)
│   │   ├── security/            # JwtUtils, JwtAuthenticationFilter, TOTP (RFC 6238)
│   │   └── service/             # AuthService, UserService, EventoService, EmprendimientoService, FotoService, CommentService, FcmService
│   └── resources/
│       ├── application.properties
│       ├── templates/admin/     # páginas Thymeleaf: login, eventos, evento-form, emprendimientos, emprendimiento-form
│       └── firebase-credentials.json  # ⚠ service account de Firebase (ver sección 13)
└── src/test/                    # pruebas (ver sección 9)
```

**Convenciones de nomenclatura (backend):** rutas REST en plural español para dominio de negocio (`/api/eventos`, `/api/emprendimientos`, `/api/fotos`); controladores mixtos español/inglés (`EventoController`, `UserController`, `FotoController`); DTOs agrupados por `Request`/`Response`. Comentarios y mensajes de error en español.

> Hallazgo de consistencia: las columnas JPA mezclan estilos. `Photos`/`Comments` usan `snake_case` (`photo_id`, `fecha_upload`), mientras `Users`, `Eventos`, `Emprendimientos`, `Sessions` y demás usan `PascalCase` (`PasswordHash`, `CreatedAt`). Al mantenerse con `ddl-auto=update`, el esquema es coherente con las entidades, pero la convención debería unificarse (ver sección 13).

---

## 3. Dependencias y requisitos

### Frontend — librerías principales

| Librería | Versión | Propósito |
|---|---|---|
| `expo` | ~57.0.11 | SDK y tooling de la app |
| `expo-router` | ~57.0.11 | Navegación basada en archivos (`src/app`) |
| `react` / `react-native` | 19.2.3 / 0.86.2 | Framework UI |
| `typescript` | ~6.0.3 | Tipado estático |
| `axios` | ^1.18.1 | Cliente HTTP hacia la API (con interceptor JWT) |
| `firebase` | ^12.16.0 | Firebase Auth (login con Google) y Firebase Cloud Messaging |
| `@react-native-google-signin/google-signin` | ^16.1.4 | Inicio de sesión con Google nativo |
| `expo-secure-store` | ~57.0.1 | Almacenamiento seguro del JWT y preferencias |
| `expo-local-authentication` | ~57.0.2 | Desbloqueo con huella / Face ID |
| `expo-notifications` | ~57.0.9 | Notificaciones push (FCM) locales/remotas |
| `expo-location` | ~57.0.8 | Ubicación (tab de mapa) |
| `expo-image-picker` | ~57.0.8 | Selección/captura de fotos |
| `expo-print` / `expo-sharing` | ~57.0.1 / ~57.0.16 | Exportación de datos (PDF) |
| `qrcode-generator` | ^2.0.4 | QR `otpauth://` para registrar el secreto TOTP |
| `react-native-webview` | 13.16.1 | Vista del mapa (Leaflet/OSRM) |
| `react-native-reanimated` | 4.5.1 | Animaciones |
| `@react-native-async-storage/async-storage` | 2.2.0 | Persistencia (p. ej. sesión de Firebase en RN) |
| `eslint` + `eslint-config-expo` | ^9.0.0 / ~57.0.0 | Linter |

### Backend — dependencias (pom.xml)

| Dependencia | Versión | Propósito |
|---|---|---|
| `spring-boot-starter-parent` | 4.1.0 | Padre de configuración de Spring Boot |
| `spring-boot-starter-web` | (parent) | API REST y servidor web |
| `spring-boot-starter-security` | (parent) | Autenticación/authorización (JWT + panel admin) |
| `spring-boot-starter-data-jpa` | (parent) | Persistencia con Hibernate |
| `spring-boot-starter-thymeleaf` | (parent) | Panel de administración server-rendered |
| `spring-boot-starter-validation` | (parent) | Validación de DTOs (`jakarta.validation`) |
| `mssql-jdbc` | (parent) | Driver de SQL Server |
| `jjwt-api` / `jjwt-impl` / `jjwt-jackson` | 0.12.5 | Creación y validación de JWT |
| `firebase-admin` | 9.3.0 | Verificación del ID token de Google y FCM |
| `lombok` | (parent) | Reducción de boilerplate |
| `spring-boot-devtools` | (parent, runtime) | Recarga en desarrollo |
| `spring-boot-starter-test` | (parent, test) | JUnit 5 y utilidades de prueba |

### Requisitos previos

- Backend: **JDK 21**, **Maven 3.9+** (o el wrapper incluido `mvnw`/`mvnw.cmd`), y una instancia de **SQL Server** (el proyecto apunta por defecto a un hosting de Somee.com; en desarrollo local debe apuntarse a tu propia BD).
- Frontend: **Node.js 20+** y **npm**; para ejecutar en dispositivo físico o emulador, **Expo Go** (SDK 57) o una build de desarrollo (`expo run:android` / `expo run:ios`). La app también corre en web (`expo start --web`).
- Cuentas externas necesarias: **Firebase** (Auth + FCM/credenciales de service account) y, opcional, credenciales de **Google Sign-In** (Web/Android/iOS) y de **Somee.com** (o la BD que uses).

---

## 4. Variables de entorno

### Frontend (`Frontend/The_Stallions/.env`)

Todas son prefijadas con `EXPO_PUBLIC_` para que Expo las incruste en el bundle. El valor **no debe versionarse**; el README documenta los nombres pero el archivo `.env` está en `.gitignore`.

| Variable | Descripción | Tipo | Requerida | Dónde se consume |
|---|---|---|---|---|
| `EXPO_PUBLIC_API_URL` | URL base del backend **sin** `/api` (p. ej. `https://api.midominio.com` o `http://192.168.1.10:8080`) | `string` | Recomendada* | `src/services/api.js` |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | API key del proyecto Firebase | `string` | Sí | `src/config/firebaseConfig.js` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación (`<proyecto>.firebaseapp.com`) | `string` | Sí | `src/config/firebaseConfig.js` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto Firebase | `string` | Sí | `src/config/firebaseConfig.js` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket de Firebase Storage | `string` | Sí (configuración) | `src/config/firebaseConfig.js` |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID de FCM | `string` | Sí (push) | `src/config/firebaseConfig.js` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | App ID de Firebase | `string` | Sí | `src/config/firebaseConfig.js` |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Client ID OAuth Web de Google (login con Google) | `string` | Sí | `src/hooks/useGoogleAuth.js` |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Client ID OAuth de Android (build nativa) | `string` | Opcional (solo Android) | `src/hooks/useGoogleAuth.js` |

<!-- TODO: variable no documentada, confirmar con el equipo --!> `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` (Client ID OAuth iOS): no aparece definida en el `.env` actual ni referenciada en `src/`. Si se habilita el login con Google en iOS, hay que definirla y añadirla a `useGoogleAuth.js`.

\* `EXPO_PUBLIC_API_URL` no es estrictamente obligatoria: `src/services/api.js` cae a `http://<host de Metro>:8080` (detecta la IP del dev server) y finalmente a `http://localhost:8080`.

**Pasos para crear `.env`:**
1. Ve a `Frontend/The_Stallions/` y crea el archivo `.env`.
2. Copia las claves de Firebase desde la consola de Firebase (pestaña *Project settings → General* y *Cloud Messaging*) en las `EXPO_PUBLIC_FIREBASE_*`.
3. Genera los Client IDs OAuth Web/Android/iOS en Google Cloud Console y complétalos en `EXPO_PUBLIC_GOOGLE_*`.
4. Define `EXPO_PUBLIC_API_URL` con la URL de tu backend (IP local o dominio público).
5. Reinicia `npm start` (un cambio de `.env` exige reiniciar el proceso de Expo) y verifica que la app autentica y consulta la API.

> La plantilla `.env.example` referenciada por versiones anteriores del README **aún no existe** en el repositorio (ver sección 13); los pasos anteriores equivalen a su creación.

### Backend (variables de entorno / `application.properties`)

Spring Boot permite sobrescribir cada propiedad por variable de entorno con la nomenclatura relajada (mayúsculas, `_` en vez de `.`).

| Variable de entorno | Propiedad | Descripción | Requerida |
|---|---|---|---|
| `SPRING_DATASOURCE_URL` | `spring.datasource.url` | JDBC URL de SQL Server | Sí |
| `SPRING_DATASOURCE_USERNAME` | `spring.datasource.username` | Usuario de la BD | Sí |
| `SPRING_DATASOURCE_PASSWORD` | `spring.datasource.password` | Contraseña de la BD | Sí |
| `JWT_SECRET` | `jwt.secret` | Secreto HMAC del JWT (mín. 32 caracteres) | Sí (producción) |
| `JWT_EXPIRATION_MS` | `jwt.expiration-ms` | Vigencia del token en ms (default `3600000`) | No |
| `FIREBASE_CREDENTIALS_JSON` | `firebase.credentials-path` | JSON del service account de Firebase (alternativa al archivo en `resources/`) | No* |
| `APP_BASE_URL` | `app.base-url` | URL pública del backend para construir la foto de perfil; vacío = usar el host de la petición | No |
| `APP_ADMIN_USERNAME` | `app.admin.username` | Usuario del panel `/admin` | Sí (producción) |
| `APP_ADMIN_PASSWORD` | `app.admin.password` | Contraseña del panel `/admin` | Sí (producción) |
| `SPRING_SERVLET_MULTIPART_MAX_FILE_SIZE` / `MAX_REQUEST_SIZE` | `spring.servlet.multipart.*` | Límites de subida de archivos (default `10MB`) | No |

\* `firebase.credentials-path` apunta al archivo incluido en `resources/`. Si se define `FIREBASE_CREDENTIALS_JSON`, `FirebaseConfig` usa ese valor y **no** el archivo (ver sección 13 sobre el riesgo de secretos versionados).

---

## 5. Instalación y puesta en marcha

### Backend

1. Requisitos: JDK 21 y Maven (o usa `mvnw`/`mvnw.cmd`).
2. Configura tu SQL Server y define las variables `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` y `JWT_SECRET` (además de `APP_ADMIN_USERNAME`/`APP_ADMIN_PASSWORD` en producción).
3. (Opcional para notificaciones push) Coloca tu service account de Firebase como `firebase-credentials.json` en `src/main/resources/` o expórtalo en `FIREBASE_CREDENTIALS_JSON`. Si no se configura, la app arranca pero `FcmService` registrará errores de envío.
4. Arranca:

   ```bash
   cd Backend/the_stallions
   ./mvnw spring-boot:run
   ```

5. Verifica: API pública en `http://localhost:8080/api/eventos` y panel admin en `http://localhost:8080/admin/login`.

> El esquema de BD se sincroniza automáticamente al arrancar (`spring.jpa.hibernate.ddl-auto=update`).

### Frontend

1. Requisitos: Node.js 20+ y npm.
2. Instala las dependencias y crea `.env` (ver sección 4):

   ```bash
   cd Frontend/The_Stallions
   npm install
   ```

3. Arranca Expo:

   ```bash
   npm start
   ```

   - `a` → emulador Android · `i` → simulador iOS · `w` → web.
   - En dispositivo físico, apunta `EXPO_PUBLIC_API_URL` a la IP de la máquina donde corre el backend (puerto 8080).

4. La mayoría de flujos usan el backend real vía `axios`; algunas funcionalidades pasan aún por `mockApi` (ver sección 13).

---

## 6. Scripts

### Frontend (`Frontend/The_Stallions`)

| Script | Comando | Descripción |
|---|---|---|
| start | `npm start` | Inicia el servidor de desarrollo de Expo |
| android | `npm run android` | Build y ejecución en Android (`expo run:android`) |
| ios | `npm run ios` | Build y ejecución en iOS (`expo run:ios`) |
| web | `npm run web` | Versión web (`expo start --web`) |
| lint | `npm run lint` | Linter (`expo lint`) |
| reset-project | `npm run reset-project` | Utilidad del template de Expo (resetea el proyecto; no usar en este repo) |

### Backend (`Backend/the_stallions`)

| Script | Comando | Descripción |
|---|---|---|
| spring-boot:run | `./mvnw spring-boot:run` | Arranca API + panel admin (puerto 8080) |
| test | `./mvnw test` | Ejecuta las pruebas |
| package | `./mvnw clean package` | Genera el JAR (`target/the_stallions-0.0.1-SNAPSHOT.jar`) |
| docker build | `docker build -t the-stallions .` | Imagen multietapa (JDK 21) |
| docker run | `docker run -p 8080:8080 -e SPRING_DATASOURCE_URL=... the-stallions` | Ejecuta el contenedor |

> En Windows usa `.\mvnw.cmd` en lugar de `./mvnw`.

---

## 7. Endpoints de la API

Base: `http://<host>:8080/api`. Salvo los marcados como públicos, todos requieren cabecera `Authorization: Bearer <token>`.

### Autenticación — `/api/auth` (públicos)

| Método | Ruta | Descripción | Parámetros |
|---|---|---|---|
| POST | `/api/auth/register` | Registro con correo+contraseña | `{ email, password, fullName }` |
| POST | `/api/auth/login` | Inicio de sesión | `{ email, password }` |
| POST | `/api/auth/google` | Login/registro con Google | `{ idToken }` (ID token de Firebase) |
| POST | `/api/auth/2fa/verify` | Verifica el código TOTP de un desafío | `{ challengeId, code }` |
| POST | `/api/auth/2fa/resend` | Validación del desafío (con TOTP no hay reenvío real; el código se regenera en la app de autenticación) | `{ challengeId }` |
| POST | `/api/auth/logout` | Cierra la sesión del token | cabecera `Authorization` |

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

Cuando el usuario tiene 2FA activo, `token` es `null`, `requiresTwoFactor` es `true` y llega `challengeId`; hay que completar el flujo con `/auth/2fa/verify`.

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
| GET | `/api/eventos` | Lista de eventos | `?categoria=FERIADO\|CONMEMORACION\|CELEBRACION` (opcional) |
| GET | `/api/eventos/{id}` | Detalle de un evento | — |
| GET | `/api/eventos/{id}/foto` | Bytes de la foto del evento (**público**) | — |
| POST | `/api/eventos/{id}/foto` | Sube/reemplaza foto (`multipart`, campo `foto`) | requiere JWT |
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
| GET | `/api/emprendimientos` | Lista de emprendimientos | `?tipo=<rubro>` (opcional) |
| GET | `/api/emprendimientos/categorias` | Rubros/tipos disponibles | — |
| GET | `/api/emprendimientos/{id}` | Detalle | — |
| GET | `/api/emprendimientos/{id}/foto` | Bytes de la foto (**público**) | — |
| POST | `/api/emprendimientos` | Crea (201) | body `EmprendimientoRequest` |
| PUT | `/api/emprendimientos/{id}` | Actualiza | body `EmprendimientoRequest` |
| POST | `/api/emprendimientos/{id}/foto` | Sube foto (`multipart`, campo `foto`) | — |
| DELETE | `/api/emprendimientos/{id}` | Elimina (204) | — |

Los métodos de escritura exigen JWT. El campo `tipo` es libre (artesanía, gastronomía, etc.), no un enum.

### Fotos y comunidad — `/api/fotos`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/fotos` | Sube foto. `multipart/form-data`: `photo` (archivo), `visibilidad` (`PRIVADA`/`PUBLICA`), `descripcion` (opcional), `grupoId` (opcional, para carrusel) |
| GET | `/api/fotos/mias` | Fotografías propias (privadas y públicas) |
| GET | `/api/fotos/comunidad` | Feed público paginado: `?page=1&pageSize=10` |
| GET | `/api/fotos/comunidad/posts` | Posts públicos (agrupa fotos con mismo `grupoId`): `?page=&pageSize=` |
| PUT | `/api/fotos/{id}` | Cambia visibilidad de foto propia: `{ "visibilidad": "PUBLICA" }` |
| DELETE | `/api/fotos/{id}` | Elimina foto propia (204) |
| GET | `/api/fotos/{id}/imagen` | Bytes de la imagen (**público**; las privadas solo para su dueño; acepta `?token=` para servir imágenes privadas al cliente móvil) |
| POST | `/api/fotos/{id}/like` | Toggle de like del usuario autenticado |
| GET | `/api/fotos/{id}/comentarios` | Lista comentarios de la foto |
| POST | `/api/fotos/{id}/comentarios` | Agrega comentario: `{ "texto": "..." }` |
| PUT | `/api/fotos/comentarios/{id}` | Edita comentario propio: `{ "texto": "..." }` |
| DELETE | `/api/fotos/comentarios/{id}` | Elimina comentario propio (204) |
| GET | `/api/fotos/notificaciones` | Notificaciones del usuario autenticado |
| PUT | `/api/fotos/notificaciones/{id}/leida` | Marca notificación como leída (204) |

Los likes se almacenan como JSON en la columna `usuarios_like` de `Photos` (ver sección 8).

Ejemplo de subida:

```bash
curl -X POST http://localhost:8080/api/fotos \
  -H "Authorization: Bearer <token>" \
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

La gestión de fotos de la comunidad, usuarios y notificaciones no dispone aún de pantalla de administración (ver sección 13).

---

## 8. Base de datos

Backend: **SQL Server** con **Hibernate** (`ddl-auto=update`), dialecto `SQLServerDialect`. Las imágenes se guardan como BLOB (`varbinary(max)`).

| Tabla | Descripción | Campos destacados |
|---|---|---|
| `Users` | Usuarios | `id`, `email`, `PasswordHash`, `FullName`, `provider` (`LOCAL`/`GOOGLE`), `ProviderId`, `PhotoUrl`/`PhotoData`/`PhotoContentType`, `Username`, `Phone`, `BirthDate`, `Gender`, `City`, `Bio`, `TwoFactorEnabled`, `TotpSecret`, `IsEnabled`, `CreatedAt`, `UpdatedAt` |
| `Eventos` | Eventos culturales | `id`, `titulo`, `fecha`, `FechaFin`, `categoria` (`FERIADO`/`CONMEMORACION`/`CELEBRACION`), `descripcion`, `FotoData`/`FotoContentType`/`FotoUrl`, `CreatedAt`, `UpdatedAt` |
| `Emprendimientos` | Emprendimientos locales | `id`, `nombre`, `tipo` (rubro libre), `descripcion`, `lat`, `lng`, `ContactoTelefono`, `ContactoEmail`, `ContactoRedes`, `FotoData`/`FotoContentType`/`FotoUrl`, `CreatedAt`, `UpdatedAt` |
| `Photos` | Fotos de la comunidad | `id`, `user_id` (FK), `visibilidad` (`PRIVADA`/`PUBLICA`), `url`, `photo_data` (BLOB), `content_type`, `descripcion`, `fecha_upload`, `grupo_id` (agrupa fotos de un mismo post/carrusel), `usuarios_like` (JSON, `nvarchar(max)`) |
| `Comments` | Comentarios de fotos | `id`, `photo_id` (FK), `user_id` (FK), `texto` (`nvarchar(max)`), `fecha`, `editado` |
| `Notifications` | Notificaciones in-app | `id`, `usuario_destino_id` (FK), `usuario_origen_id` (FK), `tipo` (like/comentario/…), `mensaje`, `relacion_id`, `leida`, `fecha` |
| `UserSessions` | Sesiones activas | `id`, `UserId` (FK), `Device`, `Platform`, `Location`, `LastActive`, `IsActive`, `TokenId` (único), `CreatedAt` |
| `TwoFactorChallenges` | Desafíos 2FA pendientes | `id`, `ChallengeId` (único), `Email`, `CodeHash`, `ExpiresAt` (5 min), `Used`, `CreatedAt` |
| `BlockedUsers` | Usuarios bloqueados | `id`, `UserId` (FK), `BlockedUserId`, `Name`, `Username` |
| `UserNotifications` | Preferencias de notificaciones | `id`, `UserId` (FK), `SettingsJson` (`nvarchar(max)`) |
| `UserPrivacy` | Preferencias de privacidad | `id`, `UserId` (FK), `Visibility`, `ShowEmail`, `ShowPhone`, `ShowLocation`, `Discoverable` |
| `DataExports` | Solicitudes de exportación de datos | `id`, `UserId` (FK), `ExportId` (único), `Status` (default `processing`), `AvailableForHours` (default 48), `CreatedAt` |

Enums: `AuthProvider { LOCAL, GOOGLE }`, `Visibilidad { PRIVADA, PUBLICA }`, `CategoriaEvento { FERIADO, CONMEMORACION, CELEBRACION }`.

---

## 9. Pruebas

### Backend

- Framework: **JUnit 5** (`spring-boot-starter-test`).
- Situación actual: existe una única prueba de humo, `TheStallionsApplicationTests#contextLoads`, que verifica que el contexto de Spring arranca. No hay cobertura configurada ni tests unitarios de servicios/controladores.
- Ejecutar:

  ```bash
  cd Backend/the_stallions
  ./mvnw test
  ```

### Frontend

- No hay suite de pruebas configurada en el proyecto (sin `jest`/`vitest` en `package.json`).
- Verificación por linter:

  ```bash
  cd Frontend/The_Stallions
  npm run lint
  ```

---

## 10. Despliegue

**CI/CD:** no configurado. El directorio `.github/` del repositorio no contiene pipelines (workflows) para build, test o deploy. Debe definirse (p. ej., GitHub Actions para: build backend con Maven, build frontend con Expo/EAS, y despliegue de la imagen Docker del backend).

**Backend:**

- Existe un `Dockerfile` multietapa: build con `maven:3.9.6-eclipse-temurin-21` y runtime `eclipse-temurin:21-jre`, expone el puerto `8080`.
- `CorsConfigurationSource` ya permite, además de orígenes locales de desarrollo (`localhost:19006/8081/8082`, `exp://…`), el origen `https://the-stallions.onrender.com` — huella de un despliegue previo en Render. Verificar si ese despliegue sigue vigente y si debe mantenerse (ver sección 13).
- En producción es obligatorio sobrescribir por entorno los secretos de `application.properties` (BD, JWT, admin, Firebase).

**Frontend:**

- Configuración nativa en `app.json`: paquete Android `com.eduard8813steam.thestallions`, `googleServicesFile` apuntando a `./google-services.json`, tablets iOS soportadas.
- Builds nativos vía Expo/EAS o `expo run:*`; también publicable como web (`expo start --web / expo export`).

---

## 11. Contribución

Consulta la guía completa en **[CONTRIBUTING.md](CONTRIBUTING.md)**. Resumen:

- **Modelo de ramas por capa:** `main` (estable) con ramas de integración `frontend` y `backend`, y ramas `feature/*`, `fix/*`, `chore/*` y `docs/*` creadas desde la capa correspondiente. No se hace commit directo a `main`, `frontend` ni `backend`.
- **Pull requests:** se abren hacia `frontend` o `backend` (no a `main`), incluyendo qué se resuelve, cómo se probó y capturas si hay cambio visual.
- **Convención de commits** (verificada en el historial del repo y en `CONTRIBUTING.md`):

  ```
  <tipo>(<ámbito>): <descripción>
  ```

  Tipos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`. Ámbito indica la capa (`frontend`/`backend`). Ejemplos reales del historial: `feat: restyle ...`, `fix: corregir ...`, `docs(...)`. Mensajes de una sola línea, en español.
- **Antes del PR:** `./mvnw test` en backend y `npm run lint` en frontend.
- Cada cambio de instalación/scripts/uso debe reflejarse en este README.

---

## 12. Licencia y autores

- No hay archivo `LICENSE` en la raíz del repositorio; la versión anterior del README describía la licencia como **privada**. Confirmar y definir la licencia del proyecto (ver sección 13).
- `Frontend/The_Stallions/LICENSE` es la licencia MIT de la plantilla base de Expo y aplica únicamente al código de andamiaje inicial, no al proyecto en su conjunto.
- **Autores:** [Eduard8813](https://github.com/Eduard8813) y el equipo de desarrollo "The Stallions".

---

## 13. Pendientes para completar manualmente

Items detectados durante la auditoría que requieren confirmación o limpieza por parte del equipo:

- **Seguridad — no documentado en el README a propósito:** `Backend/the_stallions/src/main/resources/application.properties` contiene credenciales reales de BD y del panel de administración, y `src/main/resources/firebase-credentials.json` versiona el service account de Firebase. Recomendación: rotar las credenciales, eliminarlas del repositorio y moverlas a variables de entorno (ver sección 4 y `CONTRIBUTING.md`).
- **`Frontend/The_Stallions/.env.example` no existe.** Crear la plantilla con las variables de la sección 4.
- **`src/app/explore.tsx`** es una pantalla de ejemplo del template de Expo sin relación con la app real; eliminarla o marcarla como fuera de uso.
- **`mensajes.tsx`** es un placeholder (no hay controlador/mensajería en el backend); el tab está oculto (`href: null`). Definir si la funcionalidad de mensajes se implementa o se retira hasta nuevo aviso.
- **`mockApi.ts`** indica que algunas funcionalidades siguen en simulación (`MOCK_FLAGS.sessionExpired`). Confirmar cuáles pantallas/servicios aún dependen del mock y migrarlas al backend real.
- **`app.base-url` está vacía** en `application.properties`; en producción definirla para que las URLs de foto de perfil sean absolutas.
- **Deploy en Render:** el origen `https://the-stallions.onrender.com` en CORS sugiere un despliegue previo; confirmar estado y documentarlo en la sección de despliegue junto con el CI/CD a crear.
- **Tests:** solo existe `contextLoads` en backend y ninguno en frontend; ampliar cobertura y definir comandos.
- **Convención de columnas JPA:** unificar `PascalCase` vs `snake_case` en las entidades.
- **2FA por correo:** se retiró el flujo de código por correo; quedan campos legado (`CodeHash`) y usuarios con `TwoFactorEnabled` sin `TotpSecret` se desactivan automáticamente al iniciar sesión. Revisar si procede limpiar datos legado.
- **Licencia:** definir el archivo `LICENSE` de la raíz.