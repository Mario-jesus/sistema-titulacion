# Especificación del Backend API — Sistema de Titulación

> **Propósito:** Documento técnico detallado extraído de los mocks MSW del frontend. Sirve como contrato para implementar todos los módulos del backend.
>
> **Base URL:** `http://localhost:3000/api/v1`

---

## Tabla de Contenidos

1. [Convenciones Generales](#1-convenciones-generales)
2. [Autenticación (Auth)](#2-autenticación-auth)
3. [Usuarios](#3-usuarios)
4. [Modalidades](#4-modalidades)
5. [Carreras](#5-carreras)
6. [Generaciones](#6-generaciones)
7. [Opciones de Titulación](#7-opciones-de-titulación)
8. [Nuevo Ingreso (New Admissions)](#8-nuevo-ingreso-new-admissions)
9. [Estudiantes](#9-estudiantes)
10. [Campos Capturados (CapturedFields)](#10-campos-capturados-capturedfields)
11. [Titulaciones (Graduations)](#11-titulaciones-graduations)
12. [Ingreso y Egreso](#12-ingreso-y-egreso)
13. [Dashboard](#13-dashboard)
14. [Reportes](#14-reportes)
15. [Respaldos (Backups)](#15-respaldos-backups)
16. [Modelos de Datos](#16-modelos-de-datos)
17. [Códigos de Error](#17-códigos-de-error)
18. [Paginación Estándar](#18-paginación-estándar)

---

## 1. Convenciones Generales

### 1.1. Formato de Respuesta de Error

Todas las respuestas de error siguen este formato:

```json
{
  "error": "Mensaje legible para el usuario",
  "code": "CODIGO_DE_ERROR"
}
```

### 1.2. Autenticación

- Header: `Authorization: Bearer <token>`
- Si el token falta o es inválido → `401 UNAUTHORIZED`
- Si el usuario no tiene permisos → `403 FORBIDDEN`

### 1.3. Serialización de Fechas

| Campo                                                | Formato de salida                             |
| ---------------------------------------------------- | --------------------------------------------- |
| `createdAt`, `updatedAt`, `lastLogin`                | ISO 8601 completo: `2024-01-15T10:00:00.000Z` |
| `birthDate`, `processDate`                           | Solo fecha: `YYYY-MM-DD`                      |
| `startYear`, `endYear`                               | ISO 8601 completo                             |
| `graduationDate`, `scheduledDate`, `idCardIssueDate` | ISO 8601 completo                             |

### 1.4. Normalización de Datos

- **Email**: siempre se almacena en minúsculas (`.toLowerCase()`)
- **Strings**: se aplica `.trim()` antes de guardar
- **Búsquedas**: case-insensitive

### 1.5. Permisos por Rol

| Rol     | Descripción                                                      |
| ------- | ---------------------------------------------------------------- |
| `ADMIN` | Acceso total                                                     |
| `STAFF` | Acceso operativo. NO puede: gestionar usuarios, generar reportes |

---

## 2. Autenticación (Auth)

### 2.1. POST `/auth/login`

Inicia sesión y genera tokens de acceso.

**Request Body:**

```json
{
  "email": "string (requerido)",
  "password": "string (requerido)"
}
```

**Flujo de validación (en orden):**

1. Rate limiting: máx **5 intentos** en ventana de **15 minutos** → `429 TOO_MANY_REQUESTS`
2. `email` y `password` presentes → si falta alguno: `401 INVALID_CREDENTIALS`
3. Buscar usuario por email (case-insensitive) → no encontrado: `401 INVALID_CREDENTIALS`
4. Validar contraseña → incorrecta: `401 INVALID_CREDENTIALS`
5. Validar cuenta activa (`isActive === true`) → inactiva: `403 ACCOUNT_DISABLED`

**Acciones en éxito:**

- Invalidar refresh token previo del usuario (rotación)
- Actualizar `lastLogin` y `updatedAt` del usuario
- Generar nuevo `token` y `refreshToken`
- Almacenar el nuevo `refreshToken`

**Response (200):**

```json
{
  "user": {
    /* objeto User completo con avatar */
  },
  "token": "string",
  "refreshToken": "string",
  "expiresIn": 3600
}
```

### 2.2. POST `/auth/refresh`

Renueva el token de acceso usando un refresh token válido.

**Request Body:**

```json
{
  "refreshToken": "string (requerido)"
}
```

**Flujo de validación:**

1. Rate limiting: máx **10 intentos** en ventana de **15 minutos** → `429 TOO_MANY_REQUESTS`
2. `refreshToken` presente → falta: `400 MISSING_REFRESH_TOKEN`
3. Extraer `userId` del refresh token → inválido: `401 INVALID_REFRESH_TOKEN`
4. Validar que sea el último refresh token emitido (rotación) → inválido: `401 INVALID_REFRESH_TOKEN`
5. Buscar usuario → no encontrado: `401 INVALID_REFRESH_TOKEN`
6. Cuenta activa → inactiva: `403 ACCOUNT_DISABLED`

**Acciones en éxito:**

- Invalidar refresh token usado
- Generar nuevo par `token` + `refreshToken`
- Almacenar nuevo refresh token

**Response (200):**

```json
{
  "token": "string",
  "refreshToken": "string",
  "expiresIn": 3600
}
```

### 2.3. GET `/auth/me`

Retorna la información del usuario autenticado.

**Headers:** `Authorization: Bearer <token>` (requerido)

**Validación:**

- Token presente y válido → extraer `userId` → buscar usuario
- Cualquier fallo → `401 UNAUTHORIZED`

**Response (200):**

```json
{
  "user": {
    /* objeto User completo con avatar */
  }
}
```

### 2.4. POST `/auth/logout`

Cierra sesión. No requiere autenticación válida (el token puede estar expirado).

**Request Body (opcional):**

```json
{
  "refreshToken": "string (opcional)"
}
```

**Acciones:**

- Si se proporciona `refreshToken`, invalidarlo
- Si hay token válido en el header, invalidar el refresh token del usuario

**Response (200):**

```json
{
  "message": "Logout exitoso"
}
```

---

## 3. Usuarios

> Todos los endpoints requieren autenticación.

### 3.1. GET `/users` — Listar usuarios

**Permisos:** Solo `ADMIN` → STAFF recibe `403 FORBIDDEN`

**Query Parameters:**

| Param          | Tipo               | Default    | Descripción                     |
| -------------- | ------------------ | ---------- | ------------------------------- |
| `page`         | number             | `1`        | Página actual (mín 1)           |
| `limit`        | number             | `10`       | Items por página                |
| `activeOnly`   | boolean            | `false`    | Solo usuarios activos           |
| `role`         | `ADMIN` \| `STAFF` | —          | Filtrar por rol                 |
| `search` / `q` | string             | —          | Búsqueda en `username`, `email` |
| `sortBy`       | string             | `username` | Campo de ordenamiento           |
| `sortOrder`    | `asc` \| `desc`    | `asc`      | Dirección                       |

**Campos de ordenamiento válidos:** `username`, `email`, `role`, `createdAt`, `lastLogin`, `isActive`

**Response:** [Paginación estándar](#18-paginación-estándar) con array de `User` (sin `avatar`)

### 3.2. GET `/users/:id` — Detalle de usuario

**Permisos:** `ADMIN` puede ver cualquiera. `STAFF` solo puede ver el propio → `403 FORBIDDEN`

**Response (200):** Objeto `User` sin `avatar`. Fechas como ISO strings. Si no existe → `404 USER_NOT_FOUND`

### 3.3. POST `/users` — Crear usuario

**Permisos:** Solo `ADMIN`

**Request Body:**

```json
{
  "username": "string (requerido)",
  "email": "string (requerido)",
  "password": "string (requerido)",
  "avatar": "string | null (opcional)",
  "role": "ADMIN | STAFF (default: STAFF)",
  "isActive": "boolean (default: true)"
}
```

**Validaciones:**

1. `username`: requerido, no vacío, alfanumérico (`/^[a-zA-Z0-9]+$/`), sin espacios
2. `email`: requerido, formato válido (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
3. `password`: requerido, mínimo 8 caracteres, al menos: 1 número, 1 minúscula, 1 mayúscula, 1 símbolo (`!@#$%^&*()_+-=[]{}...`)
4. `username` único (case-insensitive) → `409 DUPLICATE_ERROR`
5. `email` único (case-insensitive) → `409 DUPLICATE_ERROR`

**Campos auto-generados:**

- `id`: auto-incremental
- `lastLogin`: `null`
- `createdAt`, `updatedAt`: fecha actual

**Response (201):** Objeto `User` sin `avatar`

### 3.4. PUT `/users/:id` — Actualizar usuario (completo)

**Permisos:** Solo `ADMIN`

**Request Body:**

```json
{
  "username": "string (opcional)",
  "email": "string (opcional)",
  "role": "ADMIN | STAFF (opcional)",
  "isActive": "boolean (opcional)"
}
```

**Validaciones:**

- `username`: si se envía, no vacío, alfanumérico, único excluyendo el propio
- `email`: si se envía, formato válido, único excluyendo el propio
- NO acepta `avatar` ni `password`

**Response (200):** Objeto `User` sin `avatar`

### 3.5. PATCH `/users/me` — Actualizar perfil propio

**Permisos:** Cualquier usuario autenticado

**Request Body:**

```json
{
  "username": "string (opcional)",
  "email": "string (opcional)",
  "avatar": "string | null (opcional)"
}
```

**Validaciones:** Mismas que PUT pero solo `username`, `email`, `avatar`. No puede cambiar `role` ni `isActive`.

**Response (200):** Objeto `User` **con** `avatar`

> **Nota importante:** `PATCH /users/me` debe registrarse ANTES de `PATCH /users/:id` para que `:id` no capture `"me"`.

### 3.6. PATCH `/users/:id` — Actualizar usuario (parcial)

**Permisos:** Solo `ADMIN`. Mismas validaciones que PUT.

### 3.7. DELETE `/users/:id` — Eliminar usuario

**Permisos:** Solo `ADMIN`

**Restricciones:**

- No puede eliminarse a sí mismo → `400 VALIDATION_ERROR`

**Response (200):**

```json
{ "message": "Usuario eliminado exitosamente" }
```

### 3.8. POST `/users/:id/activate` — Activar usuario

**Permisos:** Solo `ADMIN`

**Response (200):** Objeto `User` actualizado (sin `avatar`)

### 3.9. POST `/users/:id/deactivate` — Desactivar usuario

**Permisos:** Solo `ADMIN`

**Restricciones:**

- No puede desactivarse a sí mismo → `400 VALIDATION_ERROR`

**Response (200):** Objeto `User` actualizado (sin `avatar`)

### 3.10. POST `/users/me/change-password` — Cambiar contraseña propia

**Permisos:** Cualquier usuario autenticado

**Request Body:**

```json
{
  "currentPassword": "string (requerido)",
  "newPassword": "string (requerido)"
}
```

**Validaciones:**

1. `currentPassword` requerido
2. `newPassword` requerido
3. `currentPassword` debe ser correcta → `400 INVALID_PASSWORD`
4. `newPassword` debe cumplir formato (8+ chars, número, minúscula, mayúscula, símbolo)
5. `newPassword` debe ser diferente a `currentPassword` → `400 VALIDATION_ERROR`

> **Nota:** Este handler debe registrarse ANTES de `POST /users/:id/change-password`.

**Response (200):**

```json
{ "message": "Contraseña actualizada exitosamente" }
```

### 3.11. POST `/users/:id/change-password` — Cambiar contraseña de otro (admin)

**Permisos:** Solo `ADMIN`

**Restricciones:**

- No puede usar este endpoint para su propia contraseña → `400 VALIDATION_ERROR`
- No requiere `currentPassword`

**Request Body:**

```json
{
  "newPassword": "string (requerido)"
}
```

**Validaciones:**

1. `newPassword` requerido, formato válido

**Response (200):**

```json
{ "message": "Contraseña actualizada exitosamente" }
```

---

## 4. Modalidades

> Todos requieren autenticación. Escritura restringida: `STAFF` recibe `403 FORBIDDEN` en POST/PUT/PATCH/DELETE.

### Endpoints

| Método | Ruta                         | Descripción           |
| ------ | ---------------------------- | --------------------- |
| GET    | `/modalities`                | Listar                |
| GET    | `/modalities/:id`            | Detalle               |
| POST   | `/modalities`                | Crear                 |
| PUT    | `/modalities/:id`            | Actualizar (completo) |
| PATCH  | `/modalities/:id`            | Actualizar (parcial)  |
| DELETE | `/modalities/:id`            | Eliminar              |
| POST   | `/modalities/:id/activate`   | Activar               |
| POST   | `/modalities/:id/deactivate` | Desactivar            |

### Modelo: Modality

```typescript
{
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### GET `/modalities` — Listar

**Query Parameters:**

| Param          | Default | Descripción                     |
| -------------- | ------- | ------------------------------- |
| `page`         | `1`     | Página                          |
| `limit`        | `10`    | Items por página                |
| `activeOnly`   | `false` | Solo activas                    |
| `search` / `q` | —       | Búsqueda en `name`              |
| `sortBy`       | `name`  | `name`, `createdAt`, `isActive` |
| `sortOrder`    | `asc`   | `asc` / `desc`                  |

### POST `/modalities` — Crear

**Request Body:**

```json
{
  "name": "string (requerido)",
  "description": "string | null (opcional)",
  "isActive": "boolean (default: true)"
}
```

**Validaciones:**

- `name` requerido, no vacío
- `name` único (case-insensitive) → `409 DUPLICATE_ERROR`

**Response (201):** Objeto `Modality`

### PUT/PATCH — Actualizar

Mismas validaciones. Duplicado excluye el registro actual. Error si no existe → `404 MODALITY_NOT_FOUND`

---

## 5. Carreras

> Escritura restringida a `ADMIN` (staff guard).

### Endpoints

Mismo patrón CRUD + activate/deactivate que Modalidades, ruta base: `/careers`

### Modelo: Career

```typescript
{
  id: string;
  name: string;
  shortName: string;
  modalityId: string;
  modality: Modality; // Populado automáticamente
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### GET `/careers` — Listar

**Query:** Paginación estándar + `activeOnly`, `search`/`q` (busca en `name` y `shortName`), `sortBy` (`name`, `shortName`, `createdAt`, `isActive`), `sortOrder` (default: `name asc`)

### POST `/careers` — Crear

**Request Body:**

```json
{
  "name": "string (requerido)",
  "shortName": "string (requerido)",
  "modalityId": "string (requerido)",
  "description": "string | null (opcional)",
  "isActive": "boolean (default: true)"
}
```

**Validaciones:**

1. `name` requerido, no vacío
2. `shortName` requerido, no vacío
3. `modalityId` debe existir → `404 MODALITY_NOT_FOUND`
4. `name` único (case-insensitive) → `409 DUPLICATE_ERROR`
5. `shortName` único (case-insensitive) → `409 DUPLICATE_ERROR`

**Respuesta:** Incluye el objeto `modality` populado dentro del objeto `Career`

---

## 6. Generaciones

> Escritura restringida a `ADMIN` (staff guard).

### Endpoints

Mismo patrón CRUD + activate/deactivate, ruta base: `/generations`

### Modelo: Generation

```typescript
{
  id: string;
  name: string | null;
  startYear: Date;
  endYear: Date;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### GET `/generations` — Listar

**Query:** Paginación estándar + `activeOnly`, `search`/`q` (en `name`), `sortBy` (`name`, `startYear`, `endYear`, `createdAt`, `isActive`), `sortOrder` (default: `startYear desc`)

### POST `/generations` — Crear

**Request Body:**

```json
{
  "name": "string (requerido)",
  "startYear": "Date (requerido)",
  "endYear": "Date (requerido)",
  "description": "string | null (opcional)",
  "isActive": "boolean (default: true)"
}
```

**Validaciones:**

1. `name` requerido
2. `startYear` y `endYear` requeridos
3. `startYear < endYear` → `400 VALIDATION_ERROR`
4. `name` único → `409 DUPLICATE_ERROR`

---

## 7. Opciones de Titulación

> Escritura restringida a `ADMIN` (staff guard).

### Endpoints

Mismo patrón CRUD + activate/deactivate, ruta base: `/graduation-options`

### Modelo: GraduationOption

```typescript
{
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

Misma lógica que Modalidades: `sortBy` (`name`, `createdAt`, `isActive`), default `name asc`, `name` único.

Error not found: `GRADUATION_OPTION_NOT_FOUND`

---

## 8. Nuevo Ingreso (New Admissions)

> Escritura restringida a `ADMIN` (staff guard).

### Endpoints

Mismo patrón CRUD + activate/deactivate, ruta base: `/new-admissions`

### Modelo: NewAdmission

```typescript
{
  id: string;
  generationId: string;
  careerId: string;
  maleCount: number;
  femaleCount: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### GET `/new-admissions` — Listar

**Query:** Paginación estándar + filtros por `careerId`, `generationId`, `activeOnly`, `search`/`q` (en `description`), `sortBy` (`maleCount`, `femaleCount`, `createdAt`, `isActive`), default: `createdAt desc`

### POST `/new-admissions` — Crear

**Request Body:**

```json
{
  "generationId": "string (requerido)",
  "careerId": "string (requerido)",
  "maleCount": "number >= 0 (requerido)",
  "femaleCount": "number >= 0 (requerido)",
  "description": "string | null (opcional)",
  "isActive": "boolean (default: true)"
}
```

**Validaciones:**

1. `careerId` requerido, debe existir → `404 CAREER_NOT_FOUND`
2. `generationId` requerido, debe existir → `404 GENERATION_NOT_FOUND`
3. `maleCount` >= 0
4. `femaleCount` >= 0
5. **Clave compuesta única**: `careerId` + `generationId` → `409 DUPLICATE_ERROR`

---

## 9. Estudiantes

> No tiene staff guard. Todos los usuarios autenticados pueden gestionar estudiantes.

### Endpoints

| Método | Ruta                           | Descripción                   |
| ------ | ------------------------------ | ----------------------------- |
| GET    | `/students`                    | Listar todos                  |
| GET    | `/students/in-progress`        | Listar en proceso             |
| GET    | `/students/scheduled`          | Listar programados            |
| GET    | `/students/graduated`          | Listar titulados              |
| GET    | `/students/:id`                | Detalle                       |
| POST   | `/students`                    | Crear                         |
| PUT    | `/students/:id`                | Actualizar (completo)         |
| PATCH  | `/students/:id`                | Actualizar (parcial)          |
| DELETE | `/students/:id`                | Eliminar                      |
| POST   | `/students/:id/status`         | Cambiar status administrativo |
| POST   | `/students/:id/egress`         | Marcar como egresado          |
| POST   | `/students/:id/unegress`       | Desmarcar como egresado       |
| POST   | `/students/:id/process-status` | Actualizar estado del proceso |

### Modelo: Student

```typescript
{
  id: string;
  careerId: string;
  generationId: string;
  controlNumber: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  phoneNumber: string;
  email: string;
  birthDate: Date; // Serializa como YYYY-MM-DD
  sex: 'MASCULINO' | 'FEMENINO';
  isEgressed: boolean;
  status: 'ACTIVO' | 'PAUSADO' | 'CANCELADO';
  processStatus: 'NOT_STARTED' | 'IN_PROCESS' | 'SCHEDULED' | 'GRADUATED';
  hasIdCard: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 9.1. GET `/students` — Listar

**Query Parameters:**

| Param           | Default            | Descripción                                                                               |
| --------------- | ------------------ | ----------------------------------------------------------------------------------------- |
| `page`          | `1`                | Página                                                                                    |
| `limit`         | `10`               | Items por página                                                                          |
| `careerId`      | —                  | Filtro por carrera                                                                        |
| `generationId`  | —                  | Filtro por generación                                                                     |
| `status`        | —                  | Filtro por status                                                                         |
| `processStatus` | —                  | Filtro por processStatus                                                                  |
| `isEgressed`    | —                  | `true`/`false`/`1`/`0`                                                                    |
| `search` / `q`  | —                  | Búsqueda en `firstName`, `paternalLastName`, `maternalLastName`, `controlNumber`, `email` |
| `sortBy`        | `paternalLastName` | Campo de orden                                                                            |
| `sortOrder`     | `asc`              | Dirección                                                                                 |

**Campos de ordenamiento válidos:** `firstName`, `paternalLastName`, `controlNumber`, `email`, `birthDate`, `createdAt`, `isEgressed`, `status`

### 9.2. GET `/students/in-progress` — Estudiantes en proceso

Filtra estudiantes con `status === ACTIVO` Y `processStatus === IN_PROCESS`.

**Query:** `page`, `limit`, `careerId`, `generationId`, `sex`, `search`/`q`

**Campos de búsqueda:** nombre completo, número de control

**sortBy válidos:** `fullName`, `controlNumber`, `sex`, `careerId`, `graduationOptionId` (default: `fullName asc`)

**Respuesta (campos por item):**

```json
{
  "controlNumber": "string",
  "fullName": "string",
  "sex": "string",
  "careerId": "string",
  "graduationOptionId": "string | null",
  "projectName": "string | null"
}
```

### 9.3. GET `/students/scheduled` — Estudiantes programados

Filtra estudiantes con `status === ACTIVO` Y `processStatus === SCHEDULED`.

**sortBy válidos:** `controlNumber`, `fullName`, `sex`, `careerId`, `graduationOptionId`, `graduationDate`, `scheduledDate`

**Respuesta (campos por item):**

```json
{
  "controlNumber": "string",
  "fullName": "string",
  "sex": "string",
  "careerId": "string",
  "generationId": "string",
  "graduationOptionId": "string | null",
  "hasIdCard": "boolean",
  "graduationDate": "string | null (YYYY-MM-DD)",
  "scheduledDate": "string | null (YYYY-MM-DD)"
}
```

### 9.4. GET `/students/graduated` — Estudiantes titulados

Filtra estudiantes con `status === ACTIVO` Y `processStatus === GRADUATED`.

Misma estructura de respuesta que scheduled.

### 9.5. POST `/students` — Crear

**Request Body:**

```json
{
  "careerId": "string (requerido)",
  "generationId": "string (requerido)",
  "controlNumber": "string (requerido)",
  "firstName": "string (requerido)",
  "paternalLastName": "string (requerido)",
  "maternalLastName": "string (opcional)",
  "phoneNumber": "string (opcional)",
  "email": "string (requerido)",
  "birthDate": "Date (requerido)",
  "sex": "MASCULINO | FEMENINO (requerido)",
  "isEgressed": "boolean (default: false)",
  "status": "ACTIVO | PAUSADO | CANCELADO (default: ACTIVO)",
  "processStatus": "NOT_STARTED | IN_PROCESS | SCHEDULED | GRADUATED (default: NOT_STARTED)",
  "hasIdCard": "boolean (default: false)"
}
```

**Validaciones:**

1. `firstName` requerido, no vacío
2. `paternalLastName` requerido, no vacío
3. `controlNumber` requerido, no vacío
4. `email` requerido, no vacío
5. `careerId` requerido, debe existir → `404 CAREER_NOT_FOUND`
6. `generationId` requerido, debe existir → `404 GENERATION_NOT_FOUND`
7. `controlNumber` único → `409 DUPLICATE_ERROR`
8. `email` único (case-insensitive) → `409 DUPLICATE_ERROR`

**Regla `hasIdCard`:** Solo se permite `hasIdCard: true` si `processStatus === GRADUATED`. En cualquier otro caso se fuerza a `false`.

### 9.6. PUT/PATCH `/students/:id` — Actualizar

Mismas validaciones que crear. Duplicados excluyen el registro actual. Valida transiciones de `status` si se cambia:

**Transiciones de status válidas:**

```
ACTIVO → PAUSADO     ✅
ACTIVO → CANCELADO   ✅ (con restricciones)
PAUSADO → ACTIVO     ✅
CANCELADO → *        ❌ (estado terminal)
```

### 9.7. POST `/students/:id/status` — Cambiar status

**Request Body:**

```json
{
  "status": "ACTIVO | PAUSADO | CANCELADO"
}
```

**Validaciones (en orden):**

1. Estudiante existe → `404 STUDENT_NOT_FOUND`
2. `status` requerido
3. Si está CANCELADO → `400 INVALID_STATUS_TRANSITION` (estado terminal)
4. Si está GRADUADO (`processStatus === GRADUATED`) y se intenta PAUSAR o CANCELAR → `400 INVALID_STATUS_TRANSITION`
5. Si está EGRESADO (`isEgressed === true`) y se intenta CANCELAR → `400 INVALID_STATUS_TRANSITION`
6. ACTIVO solo puede ir a PAUSADO o CANCELADO
7. PAUSADO solo puede ir a ACTIVO

### 9.8. POST `/students/:id/egress` — Marcar como egresado

**Validaciones:**

- Estudiante existe → `404`
- Ya está egresado → `400 ALREADY_EGRESSED`

**Acciones:** `isEgressed = true`

### 9.9. POST `/students/:id/unegress` — Desmarcar como egresado

**Validaciones:**

- Estudiante existe → `404`
- No está egresado → `400 NOT_EGRESSED`
- Tiene CapturedFields O Graduation asociados → `400 CANNOT_UNEGRESS`

**Acciones:** `isEgressed = false`

### 9.10. POST `/students/:id/process-status` — Actualizar processStatus

**Request Body:**

```json
{
  "processStatus": "NOT_STARTED | IN_PROCESS | SCHEDULED | GRADUATED (requerido)",
  "hasIdCard": "boolean (opcional)",
  "scheduledDate": "string ISO (opcional, para SCHEDULED)",
  "graduationDate": "string ISO (opcional, para GRADUATED)",
  "idCardNumber": "string (opcional, para GRADUATED)",
  "idCardIssueDate": "string ISO (opcional, para GRADUATED)"
}
```

**Transiciones válidas:**

```
NOT_STARTED → IN_PROCESS    ✅ (requiere: isEgressed, status ACTIVO)
NOT_STARTED → SCHEDULED     ✅ (requiere: isEgressed, status ACTIVO)
NOT_STARTED → GRADUATED     ✅ (requiere: isEgressed, status ACTIVO)
IN_PROCESS  → SCHEDULED     ✅
IN_PROCESS  → NOT_STARTED   ✅
SCHEDULED   → GRADUATED     ✅
SCHEDULED   → IN_PROCESS    ✅
GRADUATED   → *             ❌ (estado terminal)
```

**Validaciones detalladas:**

1. Estudiante existe → `404`
2. `processStatus` requerido
3. GRADUATED es estado terminal → `400 INVALID_PROCESS_STATUS_TRANSITION`
4. Solo NOT_STARTED puede pasar a IN_PROCESS → `400 INVALID_PROCESS_STATUS_TRANSITION`
5. Para salir de NOT_STARTED: debe estar egresado → `400 STUDENT_NOT_EGRESSED`
6. Para salir de NOT_STARTED: debe estar ACTIVO → `400 INVALID_STATUS_FOR_PROCESS`
7. Para IN_PROCESS, SCHEDULED, GRADUATED: debe estar egresado → `400 STUDENT_NOT_EGRESSED`

**Efectos colaterales al pasar a GRADUATED:**

- Si existe un registro `Graduation`, se actualiza con `graduationDate`, `idCardNumber`, `idCardIssueDate`
- Si NO existe, se crea un nuevo registro `Graduation` con campos vacíos para comité
- `hasIdCard` solo es `true` si `processStatus === GRADUATED`

**Efectos colaterales al pasar a SCHEDULED:**

- Si existe `Graduation` y se envía `scheduledDate`, se actualiza

---

## 10. Campos Capturados (CapturedFields)

> Sin staff guard. Cualquier usuario autenticado puede gestionar.

### Endpoints

| Método | Ruta                           | Descripción                      |
| ------ | ------------------------------ | -------------------------------- |
| GET    | `/captured-fields/student/:id` | Obtener por studentId            |
| POST   | `/captured-fields`             | Crear                            |
| PUT    | `/captured-fields/student/:id` | Actualizar por studentId         |
| PATCH  | `/captured-fields/student/:id` | Actualizar parcial por studentId |
| DELETE | `/captured-fields/student/:id` | Eliminar por studentId           |

### Modelo: CapturedFields

```typescript
{
  id: string;
  studentId: string;
  processDate: Date; // Serializa como YYYY-MM-DD
  projectName: string;
  company: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### POST `/captured-fields` — Crear

**Request Body:**

```json
{
  "studentId": "string (requerido)",
  "processDate": "Date (requerido)",
  "projectName": "string (requerido)",
  "company": "string (requerido)"
}
```

**Validaciones:**

1. `studentId` requerido, estudiante debe existir → `404 STUDENT_NOT_FOUND`
2. `projectName` requerido, no vacío
3. `company` requerido, no vacío
4. `processDate` requerido
5. Estudiante debe tener `status === ACTIVO` → `400 INVALID_STUDENT_STATUS`
6. Solo un registro por estudiante → `409 DUPLICATE_ERROR`

### PUT/PATCH — Actualizar

- Busca por `studentId` (no por `id` del captured-fields)
- Estudiante debe estar ACTIVO
- `projectName` y `company` no pueden quedar vacíos si se envían

---

## 11. Titulaciones (Graduations)

> Sin staff guard. Cualquier usuario autenticado puede gestionar.

### Endpoints

| Método | Ruta                                 | Descripción              |
| ------ | ------------------------------------ | ------------------------ |
| GET    | `/graduations/student/:id`           | Obtener por studentId    |
| POST   | `/graduations`                       | Crear                    |
| PUT    | `/graduations/student/:id`           | Actualizar por studentId |
| PATCH  | `/graduations/student/:id`           | Actualizar parcial       |
| DELETE | `/graduations/student/:id`           | Eliminar                 |
| POST   | `/graduations/:studentId/graduate`   | Marcar como graduado     |
| POST   | `/graduations/:studentId/ungraduate` | Desmarcar como graduado  |

### Modelo: Graduation

```typescript
{
  id: string;
  studentId: string;
  graduationOptionId: string | null;
  graduationDate?: Date;          // Fecha de titulación
  scheduledDate?: Date;           // Fecha programada
  president: string;
  secretary: string;
  vocal: string;
  substituteVocal: string;
  notes: string | null;
  idCardNumber?: string;          // Cédula profesional
  idCardIssueDate?: Date;         // Fecha de emisión de cédula
  createdAt: Date;
  updatedAt: Date;
}
```

### POST `/graduations` — Crear

**Request Body:**

```json
{
  "studentId": "string (requerido)",
  "graduationOptionId": "string | null (opcional)",
  "graduationDate": "Date (condicional)",
  "scheduledDate": "Date (opcional)",
  "president": "string (requerido)",
  "secretary": "string (requerido)",
  "vocal": "string (requerido)",
  "substituteVocal": "string (requerido)",
  "notes": "string | null (opcional)",
  "idCardNumber": "string (opcional)",
  "idCardIssueDate": "Date (opcional)"
}
```

**Validaciones:**

1. `studentId` requerido, estudiante debe existir → `404 STUDENT_NOT_FOUND`
2. `president`, `secretary`, `vocal`, `substituteVocal` requeridos
3. Si `graduationOptionId` se envía, debe existir → `404 GRADUATION_OPTION_NOT_FOUND`
4. Solo un registro por estudiante → `409 DUPLICATE_ERROR`
5. Si el estudiante tiene `processStatus === GRADUATED`:
   - `graduationDate` es requerido → `400 VALIDATION_ERROR`
   - `graduationDate <= hoy` → `400 INVALID_GRADUATION_DATE`
6. Si el estudiante NO es GRADUATED:
   - `graduationDate`, `idCardNumber`, `idCardIssueDate` se descartan (se fuerzan a `undefined`)

### PUT/PATCH — Actualizar

- Busca por `studentId`
- Mismas reglas condicionales sobre campos según processStatus del estudiante
- `president`, `secretary`, `vocal`, `substituteVocal` no pueden quedar vacíos

### POST `/graduations/:studentId/graduate` — Marcar como graduado

**Validaciones:**

1. Debe existir registro de Graduation → `404 GRADUATION_NOT_FOUND`
2. Estudiante debe existir → `404 STUDENT_NOT_FOUND`
3. Estudiante debe estar egresado (`isEgressed === true`)
4. Estudiante debe estar ACTIVO (no PAUSADO ni CANCELADO) → `400 INVALID_STUDENT_STATUS`
5. Si `graduationDate` existe y es futura → `400 INVALID_GRADUATION_DATE`

**Acciones:**

- `student.processStatus = GRADUATED`
- `student.hasIdCard = true`

### POST `/graduations/:studentId/ungraduate` — Desmarcar como graduado

**Acciones:**

- `student.processStatus = IN_PROCESS`
- `student.hasIdCard = false`
- Limpia: `graduation.graduationDate`, `graduation.idCardNumber`, `graduation.idCardIssueDate` → `undefined`
- El registro de Graduation NO se elimina

---

## 12. Ingreso y Egreso

> Solo lectura. Datos calculados dinámicamente.

### Endpoints

| Método | Ruta                                      | Descripción |
| ------ | ----------------------------------------- | ----------- |
| GET    | `/ingress-egress`                         | Listar      |
| GET    | `/ingress-egress/:generationId/:careerId` | Detalle     |

### Modelo: IngressEgress (calculado)

```typescript
{
  id: string; // "{generationId}-{careerId}"
  generationId: string;
  careerId: string;
  generationName: string | null;
  careerName: string;
  admissionNumber: number; // Suma de maleCount + femaleCount de registros de ingreso
  egressNumber: number; // Conteo de estudiantes con isEgressed === true
}
```

### Cálculo

El endpoint agrega datos de dos fuentes:

1. **De `NewAdmissions`**: Para cada combinación generación+carrera, suma `maleCount + femaleCount` de los registros activos → `admissionNumber`
2. **De `Students`**: Cuenta estudiantes con `isEgressed === true` para esa combinación generación+carrera → `egressNumber`
3. También incluye combinaciones de estudiantes que no tienen registro de ingreso (admissionNumber = 0)

### GET `/ingress-egress` — Listar

**Query:** Paginación + `careerId`, `generationId`, `search`/`q` (en `careerName`, `generationName`), `sortBy` (`careerName`, `generationName`, `admissionNumber`, `egressNumber`), default: `careerName asc`

### GET `/ingress-egress/:generationId/:careerId` — Detalle

Valida que generación y carrera existan. Calcula métricas on-the-fly.

---

## 13. Dashboard

> Solo lectura. Un único endpoint.

### GET `/dashboard`

**Response (200):**

```json
{
  "stats": {
    "totalStudents": "number",
    "activeStudents": "number",
    "inProgress": "number",
    "scheduled": "number",
    "graduatedStudents": "number",
    "egressedStudents": "number",
    "totalAdmissions": "number",
    "totalEgresses": "number",
    "egressRate": "number (2 decimales)",
    "graduationRate": "number (2 decimales)"
  },
  "ingressEgressByGeneration": [
    {
      "generationName": "2020-2024",
      "admissions": "number",
      "egresses": "number"
    }
  ],
  "statusDistribution": [
    { "name": "Ingreso", "value": "number" },
    { "name": "Egreso", "value": "number" },
    { "name": "Titulados", "value": "number" }
  ],
  "studentsByCareer": [{ "careerName": "string", "students": "number" }],
  "recentStudents": [
    {
      "name": "string (nombre completo)",
      "career": "string (nombre de carrera)",
      "date": "string (createdAt formateado)"
    }
  ]
}
```

### Cálculo de estadísticas

| Métrica             | Cálculo                                                                    |
| ------------------- | -------------------------------------------------------------------------- |
| `totalStudents`     | Total de estudiantes                                                       |
| `activeStudents`    | Estudiantes con `status === ACTIVO`                                        |
| `inProgress`        | Estudiantes con `processStatus === IN_PROCESS`                             |
| `scheduled`         | Estudiantes con `processStatus === SCHEDULED`                              |
| `graduatedStudents` | Estudiantes con `processStatus === GRADUATED`                              |
| `egressedStudents`  | Estudiantes con `isEgressed === true`                                      |
| `totalAdmissions`   | Suma de `maleCount + femaleCount` de todos los registros de nuevo ingreso  |
| `totalEgresses`     | Igual que `egressedStudents`                                               |
| `egressRate`        | `(egressedStudents / totalAdmissions) * 100` (0 si totalAdmissions = 0)    |
| `graduationRate`    | `(graduatedStudents / egressedStudents) * 100` (0 si egressedStudents = 0) |

### Gráficas

| Gráfica                     | Detalles                                                                                                                                                                   |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ingressEgressByGeneration` | Últimas **6 generaciones** ordenadas por `startYear` asc. Formato: `"startYear-endYear"`. `admissions` = suma de registros de ingreso. `egresses` = estudiantes egresados. |
| `statusDistribution`        | Distribución de ingreso/egreso/titulados. Solo incluye valores > 0.                                                                                                        |
| `studentsByCareer`          | **Top 6** carreras con más estudiantes, orden desc.                                                                                                                        |
| `recentStudents`            | Últimos **5 estudiantes** por `createdAt` desc.                                                                                                                            |

---

## 14. Reportes

### POST `/reports/generate`

**Permisos:** Solo `ADMIN` → STAFF recibe `403 FORBIDDEN`

**Request Body:**

```json
{
  "reportType": "'por-generaciones' | 'por-carreras' (requerido)",
  "dateRange": {
    "type": "'general' | 'specific'",
    "startYear": "number (opcional)",
    "endYear": "number (opcional)"
  },
  "careers": {
    "type": "'general' | 'specific'",
    "selected": ["string[] (IDs de carreras, opcional)"]
  },
  "graduationRateDenominator": "'ingreso' | 'egreso'",
  "includeOtherValue": "boolean",
  "sex": "'general' | 'MASCULINO' | 'FEMENINO' (default: general)"
}
```

### Tipos de respuesta

La respuesta incluye un campo `tableType` que determina la estructura:

#### Tipo `summary` (dateRange general + careers general)

```json
{
  "tableType": "summary",
  "data": {
    "ingreso": "number",
    "egreso": "number",
    "titulados": "number",
    "porcentaje": "number (2 decimales)",
    "otherValue": "number (opcional, si includeOtherValue)"
  }
}
```

#### Tipo `table` (fechas específicas sin carreras específicas)

```json
{
  "tableType": "table",
  "data": [
    {
      "name": "string (nombre generación o carrera)",
      "ingreso": "number",
      "egreso": "number",
      "titulados": "number",
      "porcentaje": "number",
      "otherValue": "number (opcional)"
    }
  ]
}
```

Para `por-carreras` con fechas específicas, cada fila incluye:

```json
{
  "name": "string",
  "ingreso": "number",
  "egreso": "number",
  "titulados": "number",
  "porcentaje": "number",
  "otherValue": "number (opcional)",
  "valuesByGeneration": {
    "generationId": {
      "ingreso": "number",
      "egreso": "number",
      "titulados": "number",
      "porcentaje": "number"
    }
  }
}
```

#### Tipo `grouped` (carreras específicas + por-generaciones)

```json
{
  "tableType": "grouped",
  "data": [
    {
      "generationName": "string",
      "generationId": "string",
      "careers": [
        {
          "careerId": "string",
          "careerName": "string",
          "ingreso": "number",
          "egreso": "number",
          "titulados": "number",
          "porcentaje": "number",
          "otherValue": "number (opcional)"
        }
      ],
      "totals": {
        "ingreso": "number",
        "egreso": "number",
        "titulados": "number",
        "porcentaje": "number",
        "otherValue": "number (opcional)"
      }
    }
  ]
}
```

### Cálculos de métricas

| Métrica            | Cálculo                                                                           |
| ------------------ | --------------------------------------------------------------------------------- |
| `ingreso`          | Suma de cupos activos (por sexo si aplica filtro)                                 |
| `egreso`           | Estudiantes con `isEgressed === true` (por sexo si aplica)                        |
| `titulados`        | Estudiantes con `processStatus === GRADUATED` (por sexo si aplica)                |
| `porcentaje`       | `(titulados / denominador) * 100` con 2 decimales                                 |
| Denominador        | `ingreso` si `graduationRateDenominator === 'ingreso'`, `egreso` si es `'egreso'` |
| Si denominador = 0 | `porcentaje = 0`                                                                  |

### Filtro de sexo

- `MASCULINO`: registros de ingreso usa `maleCount`, estudiantes filtrados por `sex === MASCULINO`
- `FEMENINO`: registros de ingreso usa `femaleCount`, estudiantes filtrados por `sex === FEMENINO`
- `general`: suma ambos conteos, todos los estudiantes

### Filtro de generaciones

Se filtra por el **año** del campo `startYear` de la generación:

- Si `startYear` especificado: `generación.startYear.getFullYear() >= startYear`
- Si `endYear` especificado: `generación.startYear.getFullYear() <= endYear`

### Errores posibles

| Código                      | HTTP | Condición                         |
| --------------------------- | ---- | --------------------------------- |
| `FORBIDDEN`                 | 403  | Usuario STAFF                     |
| `REPORT_TYPE_NOT_SUPPORTED` | 400  | reportType inválido               |
| `NO_CAREERS_FOUND`          | 400  | No hay carreras que coincidan     |
| `NO_GENERATIONS_FOUND`      | 400  | No hay generaciones que coincidan |
| `CAREERS_REQUIRED`          | 400  | Faltan carreras seleccionadas     |

---

## 15. Respaldos (Backups)

> Sin staff guard. Cualquier usuario autenticado.

### Endpoints

| Método | Ruta                    | Descripción |
| ------ | ----------------------- | ----------- |
| GET    | `/backups`              | Listar      |
| GET    | `/backups/:id`          | Detalle     |
| POST   | `/backups`              | Crear       |
| DELETE | `/backups/:id`          | Eliminar    |
| GET    | `/backups/:id/download` | Descargar   |
| POST   | `/backups/:id/restore`  | Restaurar   |
| POST   | `/backups/upload`       | Subir       |

### Modelo: Backup

```typescript
{
  id: string;
  name: string;
  description: string | null;
  status: 'AVAILABLE' | 'IN_PROGRESS' | 'FAILED' | 'UNAVAILABLE';
  size: number;
  tablesCount: number;
  recordsCount: number;
  createdAt: string;
  completedAt: string | null;
  createdBy: string;
  filePath: string | null;
}
```

### GET `/backups` — Listar

**Query:** `page`, `limit`, `search`/`q` (en `name`, `description`). Siempre ordenado por `createdAt desc`.

### POST `/backups` — Crear

**Request Body:**

```json
{
  "name": "string (requerido)",
  "description": "string (opcional)"
}
```

Nuevo backup: `status = IN_PROGRESS`, contadores en 0, `createdBy` = email del usuario autenticado.

### GET `/backups/:id/download`

Solo si `status === AVAILABLE` y `filePath` existe → si no: `400 BACKUP_NOT_AVAILABLE`

**Response:** `{ message, downloadUrl }`

### POST `/backups/:id/restore`

Solo si `status === AVAILABLE` → si no: `400 BACKUP_NOT_AVAILABLE`

**Response:** `{ message, backupId }`

---

## 16. Modelos de Datos

### Resumen de relaciones

```
Modality (1) ──── (N) Career
Career   (1) ──── (N) Student
Generation (1) ── (N) Student
Career + Generation ── (1) NewAdmission  (clave compuesta única)
Student  (1) ──── (0..1) CapturedFields
Student  (1) ──── (0..1) Graduation
GraduationOption (1) ── (N) Graduation (opcional)
```

### Campos únicos

| Entidad          | Campos únicos                           |
| ---------------- | --------------------------------------- |
| User             | `username`, `email`                     |
| Student          | `controlNumber`, `email`                |
| Career           | `name`, `shortName`                     |
| Generation       | `name` (si se proporciona)              |
| Modality         | `name`                                  |
| GraduationOption | `name`                                  |
| NewAdmission     | `careerId` + `generationId` (compuesto) |
| CapturedFields   | `studentId` (1:1)                       |
| Graduation       | `studentId` (1:1)                       |

### Campos con isActive

Entidades con estado activo/inactivo: `User`, `Career`, `Generation`, `Modality`, `GraduationOption`, `NewAdmission`

---

## 17. Códigos de Error

| Código                              | HTTP | Descripción                                       |
| ----------------------------------- | ---- | ------------------------------------------------- |
| `INVALID_CREDENTIALS`               | 401  | Email o contraseña incorrectos                    |
| `ACCOUNT_DISABLED`                  | 403  | Cuenta desactivada                                |
| `UNAUTHORIZED`                      | 401  | Token inválido o no proporcionado                 |
| `FORBIDDEN`                         | 403  | Sin permisos para esta acción                     |
| `TOO_MANY_REQUESTS`                 | 429  | Rate limit excedido                               |
| `MISSING_REFRESH_TOKEN`             | 400  | Refresh token no enviado                          |
| `INVALID_REFRESH_TOKEN`             | 401  | Refresh token inválido o expirado                 |
| `VALIDATION_ERROR`                  | 400  | Error de validación genérico                      |
| `DUPLICATE_ERROR`                   | 409  | Ya existe registro con ese valor                  |
| `STUDENT_NOT_FOUND`                 | 404  | Estudiante no encontrado                          |
| `CAREER_NOT_FOUND`                  | 404  | Carrera no encontrada                             |
| `GENERATION_NOT_FOUND`              | 404  | Generación no encontrada                          |
| `GRADUATION_NOT_FOUND`              | 404  | Titulación no encontrada                          |
| `GRADUATION_OPTION_NOT_FOUND`       | 404  | Opción de titulación no encontrada                |
| `MODALITY_NOT_FOUND`                | 404  | Modalidad no encontrada                           |
| `NEW_ADMISSION_NOT_FOUND`           | 404  | Registro de ingreso no encontrado                 |
| `USER_NOT_FOUND`                    | 404  | Usuario no encontrado                             |
| `CAPTURED_FIELDS_NOT_FOUND`         | 404  | Campos capturados no encontrados                  |
| `BACKUP_NOT_FOUND`                  | 404  | Respaldo no encontrado                            |
| `BACKUP_NOT_AVAILABLE`              | 400  | Respaldo no disponible para descarga/restauración |
| `INVALID_STATUS_TRANSITION`         | 400  | Transición de status inválida                     |
| `INVALID_PROCESS_STATUS_TRANSITION` | 400  | Transición de processStatus inválida              |
| `ALREADY_EGRESSED`                  | 400  | Ya está egresado                                  |
| `NOT_EGRESSED`                      | 400  | No está egresado                                  |
| `CANNOT_UNEGRESS`                   | 400  | No se puede desmarcar egreso                      |
| `STUDENT_NOT_EGRESSED`              | 400  | Debe estar egresado para este proceso             |
| `INVALID_STATUS_FOR_PROCESS`        | 400  | Estado no permite este proceso                    |
| `INVALID_GRADUATION_DATE`           | 400  | Fecha de titulación futura o inválida             |
| `SCHEDULED_DATE_REQUIRED`           | 400  | Fecha programada requerida                        |
| `INVALID_STUDENT_STATUS`            | 400  | Estado del estudiante no permite la operación     |
| `INVALID_PASSWORD`                  | 400  | Contraseña actual incorrecta                      |
| `REPORT_TYPE_NOT_SUPPORTED`         | 400  | Tipo de reporte no soportado                      |
| `NO_CAREERS_FOUND`                  | 400  | No se encontraron carreras                        |
| `NO_GENERATIONS_FOUND`              | 400  | No se encontraron generaciones                    |
| `CAREERS_REQUIRED`                  | 400  | Carreras requeridas para el reporte               |

---

## 18. Paginación Estándar

Todos los endpoints de listado siguen este contrato:

### Query Parameters

| Param          | Tipo            | Default | Descripción                            |
| -------------- | --------------- | ------- | -------------------------------------- |
| `page`         | number          | `1`     | Página actual (mínimo 1)               |
| `limit`        | number          | `10`    | Items por página                       |
| `search` / `q` | string          | —       | Búsqueda por texto                     |
| `sortBy`       | string          | varía   | Campo de ordenamiento                  |
| `sortOrder`    | `asc` \| `desc` | varía   | Dirección                              |
| `activeOnly`   | boolean         | `false` | Solo registros activos (donde aplique) |

### Response

```json
{
  "data": [],
  "pagination": {
    "total": 50,
    "limit": 10,
    "totalPages": 5,
    "page": 1,
    "pagingCounter": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2
  }
}
```

### Lógica de cálculo

```
offset = (page - 1) * limit
totalPages = Math.ceil(total / limit) || 1
currentPage = Math.min(page, totalPages)
pagingCounter = total > 0 ? offset + 1 : 0
hasPrevPage = currentPage > 1
hasNextPage = currentPage < totalPages
prevPage = hasPrevPage ? currentPage - 1 : null
nextPage = hasNextPage ? currentPage + 1 : null
```

---

## Notas de Implementación

### Prioridades de orden de handlers

Algunos endpoints tienen rutas que pueden colisionar con parámetros dinámicos. El backend debe definirlos en este orden:

1. `PATCH /users/me` → antes de `PATCH /users/:id`
2. `POST /users/me/change-password` → antes de `POST /users/:id/change-password`
3. `GET /students/in-progress` → antes de `GET /students/:id`
4. `GET /students/scheduled` → antes de `GET /students/:id`
5. `GET /students/graduated` → antes de `GET /students/:id`

### Validación de contraseñas

Regex para validación completa:

- Longitud: `password.length >= 8`
- Número: `/\d/`
- Minúscula: `/[a-z]/`
- Mayúscula: `/[A-Z]/`
- Símbolo: `/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/`

### Validación de username

Solo alfanumérico: `/^[a-zA-Z0-9]+$/`

### Validación de email

Formato básico: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Rate Limiting

| Tipo    | Máx intentos | Ventana    |
| ------- | ------------ | ---------- |
| LOGIN   | 5            | 15 minutos |
| REFRESH | 10           | 15 minutos |

### Campo avatar

- Solo visible en: `GET /auth/me`, `POST /auth/login`, `PATCH /users/me`
- NO incluido en: `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`, `PATCH /users/:id`

---

**Última actualización:** Generado desde análisis de mocks MSW del frontend
