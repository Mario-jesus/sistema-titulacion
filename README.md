# Sistema de Titulacion

Monorepo Nx con:

- `apps/sistema-titulacion-servidor`: API backend (Node.js + Express + MongoDB).
- `apps/sistema-titulacion-cliente`: frontend (React + Vite).
- `libs/backend/*` y `libs/frontend/*`: librerias compartidas y modulos por dominio.

## Requisitos

- Node.js 20+ (recomendado LTS).
- npm 10+.
- MongoDB local o remoto accesible desde el backend.

## Instalacion de dependencias

Desde la raiz del repositorio:

```bash
npm install
```

> Si prefieres una instalacion reproducible en CI/local, usa `npm ci`.

## Configuracion del entorno

### Backend (`apps/sistema-titulacion-servidor`)

1. Copia el archivo de ejemplo:

```bash
cp apps/sistema-titulacion-servidor/.env.example apps/sistema-titulacion-servidor/.env
```

2. Ajusta los valores en `apps/sistema-titulacion-servidor/.env`.

Variables clave:

- `HOST`: host de arranque del servidor (default `0.0.0.0`).
- `PORT`: puerto del backend (default `4000`).
- `API_PREFIX`: prefijo de rutas API (default `/api/v1`).
- `MONGODB_URI`: URI completa de MongoDB (tiene prioridad si existe).
- `MONGODB_HOST` + `DATABASE_NAME` (+ opcional `MONGODB_USER`, `MONGODB_PASSWORD`, `MONGODB_AUTH_SOURCE`): alternativa para construir `MONGODB_URI`.
- `CORS_ORIGIN`: origenes permitidos (coma separada) o `*`.
- `JWT_SECRET`, `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`: configuracion de autenticacion JWT. Para generar un secreto seguro: [jwtsecrets.com](https://jwtsecrets.com/).

### Frontend (`apps/sistema-titulacion-cliente`)

1. Crea el archivo local de entorno:

```bash
cp apps/sistema-titulacion-cliente/.env.example apps/sistema-titulacion-cliente/.env.local
```

2. Ajusta `apps/sistema-titulacion-cliente/.env.local` segun tu entorno.

Variables clave:

- `VITE_API_BASE_URL`: URL base del backend (ejemplo: `http://localhost:4000/api/v1`).
- `VITE_API_TIMEOUT`: timeout de requests en ms.
- `VITE_ENABLE_MOCK_API`: habilita MSW para mocks locales (`true`/`false`).
- `VITE_MOCK_API_DELAY`: latencia simulada en ms cuando se usan mocks.

## Ejecutar el proyecto en desarrollo

En terminales separadas:

```bash
npx nx serve @sistema-titulacion/sistema-titulacion-servidor
```

```bash
npx nx serve @sistema-titulacion/sistema-titulacion-cliente
```

Puertos por defecto:

- Backend: `http://localhost:4000`
- Frontend: `http://localhost:4200`

## Documentacion OpenAPI del servidor

Con el backend corriendo, la documentacion queda disponible en:

- Swagger UI: `http://localhost:4000/api-docs`
- OpenAPI JSON: `http://localhost:4000/api-docs.json`

Notas importantes:

- Las rutas del spec se generan con el prefijo configurado en `API_PREFIX` (por defecto `/api/v1`).
- Si cambias `PORT`, actualiza las URLs anteriores con el nuevo puerto.

## Comandos utiles

```bash
# Build
npx nx build @sistema-titulacion/sistema-titulacion-servidor
npx nx build @sistema-titulacion/sistema-titulacion-cliente

# Tests
npx nx test @sistema-titulacion/sistema-titulacion-servidor
npx nx test @sistema-titulacion/sistema-titulacion-cliente

# Semillas de datos
npm run seed:users
npm run seed:graduation-options
npm run seed:new-admissions
npm run seed:all
```
