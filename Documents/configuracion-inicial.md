# Configuración Inicial del Proyecto

> **Código de referencia:** CFG-001  
> **Estado:** Completado y verificado  
> **Fecha:** Julio 2026  

Este documento describe el estado configurado y verificado de cada punto de la configuración inicial del proyecto Wani connect. Todos los ítems han sido implementados y confirmados en el código fuente actual.

---

## CFG-001.1 — Repositorio en GitHub

| Campo | Valor |
|-------|-------|
| **Plataforma** | GitHub |
| **Propietario** | Eduard8813 |
| **Nombre** | The-Stallions |
| **URL** | `https://github.com/Eduard8813/The-Stallions` |
| **Visibilidad** | Privado |

El repositorio fue creado en GitHub y funciona como punto central del proyecto. Se estructura como un monorepo que contiene tanto el frontend como el backend en carpetas independientes dentro de la misma raíz.

---

## CFG-001.2 — Ramas (main, frontend, backend)

Se configuraron tres ramas permanentes con un propósito específico para cada una:

| Rama | Propósito | Estado actual |
|------|-----------|---------------|
| `main` | Rama principal y estable del proyecto | Activa (rama por defecto) |
| `frontend` | Desarrollo del frontend (Expo/React Native) | Activa |
| `backend` | Desarrollo del backend (Spring Boot) | Activa |

```
main          ← rama por defecto,合并 desde frontend y backend
├── frontend  ← desarrollo del cliente móvil
└── backend   ← desarrollo del servidor API
```

Las ramas `frontend` y `backend` existen tanto localmente como en el repositorio remoto. El flujo de trabajo es:

1. Se desarrolla en la rama correspondiente (`frontend` o `backend`)
2. Se crea un Pull Request hacia `main`
3. Se revisa y fusiona una vez verificado

**Últimos commits en `main`:**

```
321f897 Merge pull request #9 from Eduard8813/frontend
bad0df2 feat(frontend): implementar mapa interactivo de Nicaragua
1ac15ec fix(auth): corregir lógica de autenticación con Google
6afafdf chore(seguridad): actualizar gitignore del frontend
908e6ef Merge branch 'main' into frontend
```

---

## CFG-001.3 — Proyecto React Native (Expo)

| Campo | Valor |
|-------|-------|
| **Framework** | React Native con Expo |
| **SDK Expo** | 57 |
| **React** | 19.2.3 |
| **React Native** | 0.86.0 |
| **Router** | expo-router ~57.0.6 |
| **TypeScript** | ~6.0.3 |
| **Ubicación** | `Frontend/The_Stallions/` |

### Configuración de `app.json`

| Campo | Valor |
|-------|-------|
| `name` | Wani connect |
| `slug` | the-stallions |
| `version` | 1.0.0 |
| `orientation` | portrait |
| `scheme` | thestallions |
| `android.package` | com.eduard8813steam.thestallions |
| `owner` | eduard8813s-team |
| `eas.projectId` | c2e2a501-d62a-4609-9f62-c5366ddeacb3 |
| `typedRoutes` | true (experimental) |
| `reactCompiler` | true (experimental) |

### Plugins activos

- `expo-router` — enrutamiento basado en archivos
- `expo-splash-screen` — pantalla de inicio personalizada
- `expo-secure-store` — almacenamiento seguro para tokens
- `expo-web-browser` — apertura de navegador externo

### Dependencias principales

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| expo | ~57.0.7 | Framework base |
| react-native | 0.86.0 | Runtime de React Native |
| firebase | ^12.16.0 | SDK de Firebase (auth en cliente) |
| axios | ^1.18.1 | Cliente HTTP para API |
| expo-auth-session | ~57.0.3 | OAuth con Google |
| expo-secure-store | ~57.0.1 | Almacenamiento seguro de tokens |
| @react-navigation/native | ^7.3.9 | Navegación nativa |
| react-native-webview | ^14.0.1 | Visualización de contenido web (mapa) |
| react-native-reanimated | 4.5.0 | Animaciones de alto rendimiento |

---

## CFG-001.4 — Proyecto Spring Boot

| Campo | Valor |
|-------|-------|
| **Framework** | Spring Boot |
| **Versión** | 4.1.0 |
| **Java (source)** | 21 |
| **Grupo** | com.aplicacion.movil |
| **ArtifactId** | the_stallions |
| **Version** | 0.0.1-SNAPSHOT |
| **Ubicación** | `Backend/the_stallions/` |

### Paquetes de la aplicación

```
com.aplicacion.movil.the_stallions
├── config/          → SecurityConfig, FirebaseConfig, FirebaseTokenService
├── controller/      → AuthController
├── dto/Request/     → LoginRequest, RegisterRequest, GoogleAuthRequest
├── dto/Response/    → AuthResponse, ErrorResponse
├── exception/       → GlobalExceptionHandler
├── model/           → User, AuthProvider
├── repository/      → UserRepository
├── security/        → JwtUtils, JwtAuthenticationFilter
└── service/         → AuthService
```

---

## CFG-001.5 — Archivo .gitignore

El proyecto cuenta con dos archivos `.gitignore` independientes, uno para cada componente:

### Frontend (`Frontend/The_Stallions/.gitignore`)

Excluye:

- `node_modules/` — dependencias npm
- `.expo/`, `dist/`, `web-build/` — artefactos de Expo
- `/ios`, `/android` — carpetas nativas generadas
- `.env`, `.env*.local` — variables de entorno con secretos
- `*.tsbuildinfo` — caché de TypeScript
- `.claude/`, `CLAUDE.md`, `AGENTS.md` — configuraciones de asistentes IA
- `package-lock.json` — archivo de bloqueo
- `**/google-services.json` — credenciales Firebase Android

### Backend (`Backend/the_stallions/.gitignore`)

Excluye:

- `target/` — artefactos de compilación Maven
- `.mvn/wrapper/maven-wrapper.jar` — wrapper binario
- `credentials/` — carpeta de credenciales Firebase
- `*firebase-adminsdk*.json`, `firebase-credentials.json` — claves Firebase
- `.env`, `*.env` — variables de entorno
- Archivos de IDE: `.idea`, `*.iws`, `*.iml`, `.vscode/`, `.classpath`, `.project`
- `build/` — compilaciones Gradle/alternativas

---

## CFG-001.6 — Estructura de carpetas

El proyecto采用 una estructura de monorepo con separación clara entre frontend y backend:

```
The-Stallions/
├── .git/
├── .github/
│   └── modernize/java-upgrade/
├── Backend/
│   └── the_stallions/
│       ├── pom.xml
│       ├── mvnw / mvnw.cmd
│       ├── .mvn/wrapper/maven-wrapper.properties
│       ├── Dockerfile
│       ├── HELP.md
│       └── src/
│           ├── main/
│           │   ├── java/com/aplicacion/movil/the_stallions/
│           │   │   ├── TheStallionsApplication.java
│           │   │   ├── config/
│           │   │   ├── controller/
│           │   │   ├── dto/Request/ & dto/Response/
│           │   │   ├── exception/
│           │   │   ├── model/
│           │   │   ├── repository/
│           │   │   ├── security/
│           │   │   └── service/
│           │   └── resources/
│           │       └── application.properties
│           └── test/java/.../TheStallionsApplicationTests.java
├── Documents/
│   ├── README.md
│   ├── configuracion-inicial.md
│   ├── guia-uso.md
│   ├── arquitectura.md
│   ├── api-reference.md
│   └── changelog.md
├── Frontend/
│   └── The_Stallions/
│       ├── package.json
│       ├── app.json
│       ├── metro.config.js
│       ├── tsconfig.json
│       ├── eas.json
│       ├── .env
│       ├── .gitignore
│       └── src/
│           ├── app/              # Rutas (expo-router)
│           │   ├── _layout.tsx
│           │   ├── index.tsx
│           │   ├── (auth)/       # Pantallas de autenticación
│           │   └── (tabs)/       # Tabs principales
│           ├── auth/             # Pantallas de login alternativas
│           ├── components/       # Componentes UI reutilizables
│           ├── config/           # Configuración (Firebase)
│           ├── constants/        # Constantes (theme)
│           ├── context/          # Contextos React (Auth, Lang)
│           ├── hooks/            # Custom hooks
│           ├── screens/          # Pantallas legacy
│           ├── services/         # Servicios API (Axios)
│           └── utils/            # Utilidades (validators)
├── Documents/                    # Documentación
└── README.md                     # README raíz del proyecto
```

---

## CFG-001.7 — Configuración de Maven

| Campo | Valor |
|-------|-------|
| **Maven wrapper** | Incluido (mvnw, mvnw.cmd) |
| **Maven versión** | 3.9.16 (sistema) |
| **Spring Boot Parent** | 4.1.0 |
| **Java source** | 21 |

### Dependencias del `pom.xml`

| Dependencia | Versión | Propósito |
|------------|---------|-----------|
| spring-boot-starter-security | (parent) | Autenticación y autorización |
| spring-boot-starter-web | (parent) | Servidor web y REST |
| spring-boot-starter-data-jpa | (parent) | Acceso a datos con JPA/Hibernate |
| spring-boot-starter-thymeleaf | (parent) | Motor de plantillas |
| spring-boot-starter-validation | (parent) | Validación de DTOs |
| spring-boot-devtools | (parent, runtime) | Hot reload en desarrollo |
| mssql-jdbc | (runtime) | Driver JDBC para SQL Server |
| lombok | (optional) | Generación de boilerplate |
| spring-boot-starter-test | (test) | Framework de testing |
| jjwt-api / jjwt-impl / jjwt-jackson | 0.12.5 | Generación y validación de tokens JWT |
| firebase-admin | 9.3.0 | SDK Admin de Firebase para verificación de tokens |

### Plugins configurados

- **spring-boot-maven-plugin** — Empaqueta la aplicación como JAR ejecutable, excluyendo Lombok del build final
- **maven-compiler-plugin** — Configurado con annotation processor de Lombok para compilación y test-compile

---

## CFG-001.8 — Configuración de Node.js y npm

| Campo | Valor |
|-------|-------|
| **Node.js** | v24.18.0 |
| **npm** | 11.16.0 |
| **package name** | the_stallions |
| **main entry** | expo-router/entry |
| **private** | true |

### Scripts disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| `start` | `expo start` | Inicia el servidor de desarrollo Expo |
| `android` | `expo run:android` | Ejecuta en Android (dispositivo/emulador) |
| `ios` | `expo run:ios` | Ejecuta en iOS (simulador) |
| `web` | `expo start --web` | Ejecuta en navegador web |
| `lint` | `expo lint` | Ejecuta ESLint con configuración Expo |
| `reset-project` | `node ./scripts/reset-project.js` | Restaura proyecto al estado inicial |

### Configuración de TypeScript

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/assets/*": ["./assets/*"]
    }
  }
}
```

- **strict**: true — habilita todas las verificaciones estrictas de TypeScript
- **Aliases**: `@/` mapea a `./src/` y `@/assets/` a `./assets/`

---

## CFG-001.9 — Variables de entorno

### Frontend

El archivo `.env.example` está disponible en `Frontend/The_Stallions/.env.example`. Las variables reales se almacenan en `.env` (excluido del repositorio mediante `.gitignore`).

| Variable | Propósito | Ejemplo de valor |
|----------|-----------|-----------------|
| `EXPO_PUBLIC_API_URL` | URL base del backend Spring Boot | `https://the-stallions.onrender.com` |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Clave API de Firebase | *(excluida del repo)* |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Dominio de autenticación Firebase | `the-stallions-7c7c6.firebaseapp.com` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | ID del proyecto Firebase | `the-stallions-7c7c6` |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Bucket de almacenamiento Firebase | *(excluida)* |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID del remitente de mensajes Firebase | *(excluida)* |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | ID de la aplicación Firebase | *(excluida)* |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Client ID de Google OAuth (web) | *(excluida)* |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Client ID de Google OAuth (Android) | *(excluida)* |

> **Nota:** El prefijo `EXPO_PUBLIC_` hace que estas variables estén disponibles en el código del cliente. No colocar secretos sensibles aquí.

### Backend

Las variables del backend se configuran en `application.properties` y se gestionan mediante variables de entorno del servidor:

| Propiedad | Propósito |
|-----------|-----------|
| `spring.datasource.url` | URL de conexión a SQL Server |
| `spring.datasource.username` | Usuario de la base de datos |
| `spring.datasource.password` | Contraseña de la base de datos |
| `jwt.secret` | Clave secreta para firmar tokens JWT (mínimo 32 caracteres) |
| `jwt.expiration-ms` | Tiempo de expiración del JWT en milisegundos (3600000 = 1 hora) |
| `firebase.credentials-path` | Ruta al archivo de credenciales Firebase Admin |

---

## CFG-001.10 — Verificación de compilación inicial

### Verificación del Backend

```bash
cd Backend/the_stallions

# Compilar el proyecto
./mvnw clean compile          # Unix/macOS
mvnw.cmd clean compile        # Windows

# Ejecutar tests
./mvnw test                   # Unix/macOS
mvnw.cmd test                 # Windows

# Ejecutar la aplicación
./mvnw spring-boot:run         # Unix/macOS
mvnw.cmd spring-boot:run       # Windows
```

La aplicación arranca en el puerto 8080 por defecto. Se verifica con:

```bash
curl http://localhost:8080/api/auth/login
```

### Verificación del Frontend

```bash
cd Frontend/The_Stallions

# Instalar dependencias
npm install

# Verificar que el proyecto inicia correctamente
npx expo start

# Lint (verificación de código)
npm run lint
```

El servidor de desarrollo Expo se inicia en `http://localhost:8081` (por defecto).

### Verificación de la estructura completa

Se confirmó que el repositorio contiene:

- **18 archivos Java** en el backend (1 punto de entrada, 3 configuraciones, 1 controlador, 6 DTOs, 1 manejador de excepciones, 2 modelos, 1 repositorio, 2 seguridad, 1 servicio, 1 test)
- **42 archivos TypeScript/JavaScript** en el frontend (41 fuentes + 1 configuración)
- **Ambos `.gitignore`** funcionando correctamente
- **Maven wrapper** presente y funcional
- **Variables de entorno** configuradas con `.env.example` como plantilla
