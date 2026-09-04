# Wani connect

![Versión](https://img.shields.io/badge/versi%C3%B3n-1.0.0-0B1F3A)
![Estado](https://img.shields.io/badge/estado-en%20desarrollo-yellow)
![Plataformas](https://img.shields.io/badge/plataformas-Android%20%7C%20iOS%20%7C%20Web-green)
![Licencia](https://img.shields.io/badge/licencia-privada-lightgrey)

> Aplicación móvil para explorar y conectar con las Ciudades Creativas de Nicaragua.

Wani connect facilita el descubrimiento de las Ciudades Creativas de Nicaragua — Bluefields, Estelí, Granada, Juigalpa, León, Managua, Masaya, Matagalpa, Nagarote y San Juan de Oriente — mediante un mapa interactivo con rutas turísticas y de navegación. Conecta a visitantes y locales con el patrimonio cultural y gastronómico del país, impulsando la economía creativa. El proyecto es un monorepo con un frontend en React Native (Expo) y un backend en Spring Boot.

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Scripts Disponibles](#scripts-disponibles)
- [Tests](#tests)
- [Cómo Contribuir](#cómo-contribuir)
- [Licencia](#licencia)
- [Autores](#autores)

---

## Descripción

Wani connect es una aplicación móvil (iOS, Android y web) para explorar las Ciudades Creativas de Nicaragua, una red reconocida por el Ministerio de Turismo y UNESCO. Incluye un mapa interactivo del país con detección de ubicación, rutas de navegación entre departamentos, y rutas turísticas con paradas e información de cada ciudad. Busca promover la economía creativa nicaragüense conectando a visitantes con el patrimonio material e inmaterial del país.

## Características

- **Mapa interactivo de Nicaragua** con polígonos departamentales, marcadores por ciudad y modos de vista satelital y vectorial.
- **Rutas de navegación** entre la ubicación del usuario y cada ciudad creativa, con distancia y tiempo estimado (servicio OSRM).
- **Rutas turísticas** con paradas, descripciones e imágenes para las ciudades creativas del proyecto.
- **Sección de Eventos**: calendario mensual navegable que marca los días con eventos y lista los del mes visible; si el mes no tiene eventos, indica en qué meses hay y permite saltar a ellos con un toque.
- **Notificaciones**: push (Firebase Cloud Messaging) para eventos próximos, enviadas automáticamente por el backend; y notificaciones locales programables por evento desde su detalle.
- **Panel de administración web** (`/admin`) para crear, editar y eliminar eventos, protegido con login propio independiente del flujo de la app.
- **Perfil**: foto guardada en la base de datos y servida por una URL pública con versión.
- **Seguridad**: verificación en dos pasos con app autenticadora (TOTP) y cambio de contraseña.
- **Autenticación** por correo/contraseña y con Google (Firebase Auth + JWT).
- **Soporte multiplataforma**: Android, iOS y web.
- **Interfaz bilingüe** (español/inglés) y tema oscuro/claro.

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | React Native + Expo | SDK 57 (React Native 0.86.2) |
| **Frontend (UI)** | React | 19.2.3 |
| **Frontend (lenguaje)** | TypeScript | 6.0.3 |
| **Navegación** | expo-router | 57.0.11 |
| **HTTP client** | Axios | 1.18.1 |
| **Autenticación (cliente)** | Firebase Auth (SDK JS) | 12.16.0 |
| **Mapas** | Leaflet + OSRM (WebView/iframe) | Leaflet 1.9.4 |
| **Backend** | Spring Boot | 4.1.0 |
| **Backend (lenguaje)** | Java | 21 |
| **Build** | Apache Maven (wrapper) | 3.9.16 |
| **Persistencia** | Spring Data JPA | — |
| **Base de datos** | Microsoft SQL Server | — |
| **Seguridad** | Spring Security + JWT (jjwt) | 0.12.5 |
| **Firebase (servidor)** | firebase-admin | 9.3.0 |
| **Despliegue backend** | Docker / Render | — |

## Requisitos Previos

### Obligatorios

| Herramienta | Versión mínima | Verificación |
|------------|---------------|--------------|
| **Node.js** | v24+ | `node --version` |
| **npm** | v11+ | `npm --version` |
| **Java JDK** | 21+ | `java -version` |
| **Apache Maven** | 3.9+ (o usar el wrapper) | `mvn -version` |
| **Git** | 2.x | `git --version` |
| **Microsoft SQL Server** | — | solo si se corre el backend localmente |

> El repositorio incluye el wrapper de Maven (`mvnw` / `mvnw.cmd`), por lo que no es estrictamente necesario instalar Maven por separado.

### Opcionales

- **Android Studio** — emulador Android
- **Xcode** — simulador iOS (solo macOS)
- **EAS CLI** — builds en la nube: `npm install -g eas-cli`

> **Nota para builds Android locales:** el prebuild nativo (`expo prebuild` / Gradle) puede requerir JDK 17. Si tu JDK por defecto es más nuevo y la compilación nativa falla, fija la ruta con `org.gradle.java.home=<RUTA_JDK_17>` en `Frontend/The_Stallions/android/gradle.properties`. El backend sí compila y corre con JDK 21+.

## Instalación

```bash
git clone https://github.com/Eduard8813/The-Stallions.git
cd The-Stallions
```

### Frontend (Expo / React Native)

```bash
cd Frontend/The_Stallions
npm install
```

### Backend (Spring Boot)

```bash
cd Backend/the_stallions
# Unix/macOS
./mvnw install
# Windows
mvnw.cmd install
```

## Configuración

El proyecto requiere variables de entorno para conectarse a Firebase, a la API y a la base de datos. No se versionan valores reales: se copian plantillas y se completan localmente.

### Frontend (`.env`)

Crea un archivo `.env` en `Frontend/The_Stallions/` a partir de esta plantilla (`.env.example`):

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

> Nota: las variables con prefijo `EXPO_PUBLIC_` se incrustan en el bundle y son visibles en el cliente.

### Backend (`application.properties`)

Configura `Backend/the_stallions/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:sqlserver://<HOST>:1433;databaseName=<DB>;encrypt=true;trustServerCertificate=true
spring.datasource.username=<USUARIO>
spring.datasource.password=<PASSWORD>
spring.jpa.hibernate.ddl-auto=update

jwt.secret=<SECRETO_JWT_MÍNIMO_32_CARACTERES>
jwt.expiration-ms=3600000

firebase.credentials-path=firebase-credentials.json

# URL pública del backend (para construir enlaces en notificaciones y fotos)
app.base-url=<URL_BASE>

# Panel de administración (/admin/login)
app.admin.username=<USUARIO_ADMIN>
app.admin.password=<PASSWORD_ADMIN>
```

- `firebase-credentials.json` es la *service account* de Firebase que debe existir en el classpath (`src/main/resources/`).
- En despliegue, Firebase también puede configurarse con la variable de entorno `FIREBASE_CREDENTIALS_JSON` con el contenido del JSON (ver `FirebaseConfig`).

> **Seguridad:** no comitees credenciales reales. En producción, sobrescribe estos valores con variables de entorno del proveedor de despliegue.

## Uso

### Desarrollo

Backend (servidor en `http://localhost:8080`):

```bash
cd Backend/the_stallions
# Unix/macOS
./mvnw spring-boot:run
# Windows
mvnw.cmd spring-boot:run
```

Frontend (dev server de Expo):

```bash
cd Frontend/The_Stallions
npm start
# o directamente en una plataforma:
npm run android   # emulador/dispositivo Android
npm run ios       # simulador iOS
npm run web       # navegador
```

Panel de administración de eventos (con el backend corriendo):

```
http://localhost:8080/admin/login
```

Entra con las credenciales definidas en `app.admin.username` / `app.admin.password`. Desde ahí se crean, editan y eliminan los eventos que consume la app.

### Producción

Backend — build del JAR o imagen Docker:

```bash
cd Backend/the_stallions
./mvnw clean package -DskipTests

# Alternativa con Docker
docker build -t the-stallions .
docker run -p 8080:8080 the-stallions
```

Frontend — export estático web o build con EAS:

```bash
cd Frontend/The_Stallions
npx expo export --platform web
# o build de binario móvil:
npx eas build --platform android
```

## Estructura del Proyecto

```
The-Stallions/
├── Backend/
│   └── the_stallions/              # API REST Spring Boot
│       ├── pom.xml
│       ├── Dockerfile
│       ├── mvnw / mvnw.cmd         # Wrapper de Maven
│       └── src/
│           ├── main/java/...       # Código fuente Java (controladores, servicios, seguridad, DTOs)
│           └── main/resources/     # application.properties, firebase-credentials.json
├── Frontend/
│   └── The_Stallions/              # App Expo (React Native)
│       ├── app.json                # Configuración de Expo
│       ├── package.json
│       ├── .env                    # Variables de entorno locales (no versionar)
│       └── src/
│           ├── app/                # Rutas (expo-router): (auth), (tabs), eventos/, profile/
│           ├── auth/               # Pantallas de login/registro
│           ├── components/         # Componentes (mapa, botones, inputs, calendario de eventos)
│           ├── config/             # Configuración de Firebase
│           ├── constants/          # Tema y constantes de UI
│           ├── context/            # Contextos (Auth, Lang)
│           ├── hooks/              # Hooks (Google Auth, tema)
│           ├── screens/            # Pantallas (en desarrollo)
│           ├── services/           # Cliente HTTP y servicios de la API
│           ├── types/              # Tipos de TypeScript compartidos
│           └── utils/              # Validadores y utilidades
├── Documents/                      # Documentación técnica del proyecto
└── README.md
```

## Scripts Disponibles

### Frontend (`Frontend/The_Stallions/`)

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor de desarrollo de Expo |
| `npm run android` | Ejecuta la app en emulador/dispositivo Android |
| `npm run ios` | Ejecuta la app en el simulador iOS |
| `npm run web` | Ejecuta la app en el navegador |
| `npm run lint` | Ejecuta ESLint con la configuración de Expo |
| `npm run reset-project` | Restaura el proyecto a su estado inicial |

### Backend (`Backend/the_stallions/`)

| Comando | Descripción |
|---------|-------------|
| `./mvnw spring-boot:run` | Ejecuta la API en desarrollo (Unix/macOS) |
| `mvnw.cmd spring-boot:run` | Ejecuta la API en desarrollo (Windows) |
| `./mvnw test` | Ejecuta los tests |
| `./mvnw clean install` | Compila, ejecuta tests y genera el artefacto |
| `./mvnw clean package -DskipTests` | Compila y genera el JAR sin ejecutar tests |

## Tests

```bash
# Backend: test de contexto de Spring Boot
cd Backend/the_stallions
./mvnw test
```

El frontend no tiene tests automatizados por ahora; se usa el linter como verificación estática:

```bash
cd Frontend/The_Stallions
npm run lint
```

## Cómo Contribuir

Toda la información sobre el flujo de trabajo, estándares de código y cómo enviar cambios está en [CONTRIBUTING.md](CONTRIBUTING.md).

Resumen del flujo de ramas:

```
main          ← rama principal, estable
├── frontend  ← desarrollo del frontend (Expo/React Native)
└── backend   ← desarrollo del backend (Spring Boot)
```

1. Clonar el repositorio: `git clone https://github.com/Eduard8813/The-Stallions.git`
2. Crear una rama feature desde `frontend` o `backend`.
3. Realizar los cambios con commits de mensaje descriptivo.
4. Hacer push y abrir un Pull Request hacia `frontend` o `backend`.

## Licencia

Uso privado. No se permite la distribución ni el uso comercial sin autorización.

> Nota: el archivo `Frontend/The_Stallions/LICENSE` corresponde a la licencia MIT del template de Expo incluido por `create-expo-app`, y no constituye la licencia del proyecto.

## Autores

- **Eduard8813** — mantenedor principal ([GitHub](https://github.com/Eduard8813))
