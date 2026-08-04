# Contributing a Wani connect

¡Gracias por tu interés en contribuir a Wani connect! Este documento describe cómo participar de forma ordenada en el repositorio, siguiendo el flujo de trabajo establecido.

## Índice

- [Flujo de Ramas](#flujo-de-ramas)
- [Empezar](#empezar)
- [Forma de Desarrollo](#forma-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Pruebas y Verificación](#pruebas-y-verificación)
- [Enviar un Pull Request](#enviar-un-pull-request)
- [Reportar Bugs y Sugerir Mejoras](#reportar-bugs-y-sugerir-mejoras)

## Flujo de Ramas

El repositorio usa un modelo de ramas por capa:

```
main          ← rama principal, estable
├── frontend  ← desarrollo del frontend (Expo/React Native)
└── backend   ← desarrollo del backend (Spring Boot)
```

- `main` es la rama estable. Solo recibe código verificado mediante pull requests.
- `frontend` y `backend` son las ramas de integración para cada capa.
- Nunca se hace commit directo a `main`, `frontend` o `backend`.

## Empezar

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/Eduard8813/The-Stallions.git
   cd The-Stallions
   ```

2. Crear una rama feature desde la rama correspondiente a tu cambio:

   ```bash
   git checkout frontend
   git checkout -b feature/nombre-descripcion
   ```

   ```bash
   git checkout backend
   git checkout -b feature/nombre-descripcion
   ```

   Convenciones de prefijos:
   - `feature/` — nueva funcionalidad
   - `fix/` — corrección de errores
   - `chore/` — tareas de mantenimiento (dependencias, configuración)
   - `docs/` — cambios de documentación

3. Realizar los cambios.

## Forma de Desarrollo

- Trabaja en la rama de la capa que modifiques (`frontend` o `backend`). Si tu cambio toca ambas, divide el trabajo en PRs separados.
- Mantén los cambios pequeños y enfocados en un solo objetivo.
- No comitees archivos generados ni dependencias: `node_modules/`, `target/`, `dist/`, `.expo/`, etc.
- No comitees secretos ni credenciales (claves de API, contraseñas, archivos de service account). Usa variables de entorno.
- Actualiza la documentación (`README.md`, `Documents/`) cuando tu cambio altere instalación, configuración, scripts o uso.
- Escribe commits de una sola línea con un mensaje descriptivo. Ejemplo:

  ```
  feat(frontend): agregar pantalla de perfil
  ```

  Formato sugerido: `<tipo>(<ámbito>): <descripción>` con tipos `feat`, `fix`, `chore`, `docs`, `refactor`, `test`.

## Estándares de Código

### Frontend (Expo / React Native)

- TypeScript en archivos `.tsx`/`.ts` para componentes y utilidades nuevas.
- Mantén componentes reutilizables en `src/components/` y lógica de negocio en `src/services/` o `src/hooks/`.
- Respeta la estructura existente de `src/app` (rutas), `src/context`, `src/constants`.
- Sin librerías nuevas sin justificación; consulta antes de agregar dependencias.

### Backend (Spring Boot / Java)

- Sigue la estructura por capas: `controller`, `service`, `repository`, `model`, `dto`, `config`, `security`.
- Usa validación con `jakarta.validation` en los DTOs.
- No expongas errores internos al cliente; usa `GlobalExceptionHandler`.
- Sin datos sensibles en `application.properties`.

## Pruebas y Verificación

Antes de enviar tu PR, verifica que todo pase:

```bash
# Backend: compilar y ejecutar tests
cd Backend/the_stallions
./mvnw test

# Frontend: linter
cd Frontend/The_Stallions
npm run lint
```

El backend debe compilar y el frontend debe pasar el linter sin errores. Si tu cambio introduce funcionalidad nueva, agrega tests cuando sea posible.

## Enviar un Pull Request

1. Asegúrate de que tu rama esté al día con su rama base:

   ```bash
   git checkout feature/nombre-descripcion
   git pull origin frontend   # o backend, según corresponda
   ```

2. Haz push de tu rama:

   ```bash
   git push origin feature/nombre-descripcion
   ```

3. Abre un Pull Request hacia `frontend` o `backend`, no hacia `main`. Incluye:
   - Qué problema resuelve o qué funcionalidad agrega.
   - Cómo se probó.
   - Screenshots o capturas si es un cambio visual en el frontend.

4. Espera la revisión. Atiende los comentarios y actualiza tu rama en lugar de abrir PRs nuevos.

## Reportar Bugs y Sugerir Mejoras

Usa las [issues de GitHub](https://github.com/Eduard8813/The-Stallions/issues) del repositorio:

- Para bugs, describe el comportamiento esperado, el observado y los pasos para reproducirlo.
- Para mejoras, explica el contexto y el valor del cambio propuesto.
