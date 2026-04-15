# Contrato API: Graduation Options y New Admissions

> **Propósito:** Documento consolidado del contrato final para los módulos `graduation-options` y `new-admissions`. Sirve como checklist de implementación y validación de compatibilidad frontend-backend.
>
> **Base URL:** `http://localhost:3000/api/v1`
>
> **Fuentes:** BACKEND*API_SPEC.md (secciones 7 y 8), endpoints.ts, graduationOptionsService, newAdmissionsService, types.ts, plan_api_go*+\_na

---

## 1. Checklist de Endpoints por Módulo

### 1.1. Graduation Options (`/graduation-options`)

| Método | Ruta                                 | Descripción                     | Permisos    |
| ------ | ------------------------------------ | ------------------------------- | ----------- |
| GET    | `/graduation-options`                | Listar con paginación y filtros | Autenticado |
| GET    | `/graduation-options/:id`            | Detalle por ID                  | Autenticado |
| POST   | `/graduation-options`                | Crear                           | Solo ADMIN  |
| PUT    | `/graduation-options/:id`            | Actualizar (completo)           | Solo ADMIN  |
| PATCH  | `/graduation-options/:id`            | Actualizar (parcial)            | Solo ADMIN  |
| DELETE | `/graduation-options/:id`            | Eliminar                        | Solo ADMIN  |
| POST   | `/graduation-options/:id/activate`   | Activar                         | Solo ADMIN  |
| POST   | `/graduation-options/:id/deactivate` | Desactivar                      | Solo ADMIN  |

### 1.2. New Admissions (`/new-admissions`)

| Método | Ruta                             | Descripción                     | Permisos    |
| ------ | -------------------------------- | ------------------------------- | ----------- |
| GET    | `/new-admissions`                | Listar con paginación y filtros | Autenticado |
| GET    | `/new-admissions/:id`            | Detalle por ID                  | Autenticado |
| POST   | `/new-admissions`                | Crear                           | Solo ADMIN  |
| PUT    | `/new-admissions/:id`            | Actualizar (completo)           | Solo ADMIN  |
| PATCH  | `/new-admissions/:id`            | Actualizar (parcial)            | Solo ADMIN  |
| DELETE | `/new-admissions/:id`            | Eliminar                        | Solo ADMIN  |
| POST   | `/new-admissions/:id/activate`   | Activar                         | Solo ADMIN  |
| POST   | `/new-admissions/:id/deactivate` | Desactivar                      | Solo ADMIN  |

---

## 2. Checklist de Códigos de Error por Endpoint

### 2.1. Graduation Options

| Endpoint   | Códigos de error posibles                                                         |
| ---------- | --------------------------------------------------------------------------------- |
| GET list   | `FORBIDDEN` (401/403 si no autenticado)                                           |
| GET :id    | `GRADUATION_OPTION_NOT_FOUND`, `FORBIDDEN`                                        |
| POST       | `VALIDATION_ERROR`, `DUPLICATE_ERROR`, `FORBIDDEN`                                |
| PUT        | `VALIDATION_ERROR`, `DUPLICATE_ERROR`, `GRADUATION_OPTION_NOT_FOUND`, `FORBIDDEN` |
| PATCH      | `VALIDATION_ERROR`, `DUPLICATE_ERROR`, `GRADUATION_OPTION_NOT_FOUND`, `FORBIDDEN` |
| DELETE     | `GRADUATION_OPTION_NOT_FOUND`, `FORBIDDEN`                                        |
| activate   | `GRADUATION_OPTION_NOT_FOUND`, `FORBIDDEN`                                        |
| deactivate | `GRADUATION_OPTION_NOT_FOUND`, `FORBIDDEN`                                        |

### 2.2. New Admissions

| Endpoint   | Códigos de error posibles                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| GET list   | `FORBIDDEN` (401/403 si no autenticado)                                                                                   |
| GET :id    | `NEW_ADMISSION_NOT_FOUND`, `FORBIDDEN`                                                                                    |
| POST       | `VALIDATION_ERROR`, `DUPLICATE_ERROR`, `CAREER_NOT_FOUND`, `GENERATION_NOT_FOUND`, `FORBIDDEN`                            |
| PUT        | `VALIDATION_ERROR`, `DUPLICATE_ERROR`, `NEW_ADMISSION_NOT_FOUND`, `CAREER_NOT_FOUND`, `GENERATION_NOT_FOUND`, `FORBIDDEN` |
| PATCH      | `VALIDATION_ERROR`, `DUPLICATE_ERROR`, `NEW_ADMISSION_NOT_FOUND`, `CAREER_NOT_FOUND`, `GENERATION_NOT_FOUND`, `FORBIDDEN` |
| DELETE     | `NEW_ADMISSION_NOT_FOUND`, `FORBIDDEN`                                                                                    |
| activate   | `NEW_ADMISSION_NOT_FOUND`, `FORBIDDEN`                                                                                    |
| deactivate | `NEW_ADMISSION_NOT_FOUND`, `FORBIDDEN`                                                                                    |

### 2.3. Formato de respuesta de error

```json
{
  "error": "Mensaje legible para el usuario",
  "code": "CODIGO_DE_ERROR"
}
```

---

## 3. Parámetros de Query para List

### 3.1. Graduation Options — GET `/graduation-options`

| Param          | Tipo            | Default | Descripción                           |
| -------------- | --------------- | ------- | ------------------------------------- |
| `page`         | number          | `1`     | Página actual (mín 1)                 |
| `limit`        | number          | `10`    | Items por página                      |
| `search` / `q` | string          | —       | Búsqueda en `name` (case-insensitive) |
| `activeOnly`   | boolean         | `false` | Solo registros activos                |
| `sortBy`       | string          | `name`  | Campo de ordenamiento                 |
| `sortOrder`    | `asc` \| `desc` | `asc`   | Dirección                             |

### 3.2. New Admissions — GET `/new-admissions`

| Param          | Tipo            | Default     | Descripción                                  |
| -------------- | --------------- | ----------- | -------------------------------------------- |
| `page`         | number          | `1`         | Página actual (mín 1)                        |
| `limit`        | number          | `10`        | Items por página                             |
| `search` / `q` | string          | —           | Búsqueda en `description` (case-insensitive) |
| `activeOnly`   | boolean         | `false`     | Solo registros activos                       |
| `sortBy`       | string          | `createdAt` | Campo de ordenamiento                        |
| `sortOrder`    | `asc` \| `desc` | `desc`      | Dirección                                    |
| `careerId`     | string          | —           | Filtrar por carrera                          |
| `generationId` | string          | —           | Filtrar por generación                       |

---

## 4. Campos de Sort Válidos por Módulo

### 4.1. Graduation Options

| Campo       | Descripción            |
| ----------- | ---------------------- |
| `name`      | Nombre (default)       |
| `createdAt` | Fecha de creación      |
| `isActive`  | Estado activo/inactivo |

### 4.2. New Admissions

| Campo         | Descripción                 |
| ------------- | --------------------------- |
| `maleCount`   | Conteo masculino            |
| `femaleCount` | Conteo femenino             |
| `createdAt`   | Fecha de creación (default) |
| `isActive`    | Estado activo/inactivo      |

---

## 5. Validaciones de Body por Endpoint

### 5.1. Graduation Options

#### POST `/graduation-options` — Crear

```json
{
  "name": "string (requerido)",
  "description": "string | null (opcional)",
  "isActive": "boolean (default: true)"
}
```

| Campo         | Validación                                       |
| ------------- | ------------------------------------------------ |
| `name`        | Requerido, no vacío, `.trim()` antes de guardar  |
| `name`        | Único (case-insensitive) → `409 DUPLICATE_ERROR` |
| `description` | Opcional, puede ser `null`                       |
| `isActive`    | Opcional, default `true`                         |

#### PUT `/graduation-options/:id` — Actualizar completo

```json
{
  "name": "string (opcional)",
  "description": "string | null (opcional)",
  "isActive": "boolean (opcional)"
}
```

| Campo         | Validación                                                 |
| ------------- | ---------------------------------------------------------- |
| `name`        | Si se envía: no vacío, único excluyendo el registro actual |
| `description` | Opcional                                                   |
| `isActive`    | Opcional                                                   |
| Registro      | Debe existir → `404 GRADUATION_OPTION_NOT_FOUND`           |

#### PATCH `/graduation-options/:id` — Actualizar parcial

Mismas validaciones que PUT. Solo se actualizan los campos enviados.

---

### 5.2. New Admissions

#### POST `/new-admissions` — Crear

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

| Campo           | Validación                                                |
| --------------- | --------------------------------------------------------- |
| `generationId`  | Requerido, debe existir → `404 GENERATION_NOT_FOUND`      |
| `careerId`      | Requerido, debe existir → `404 CAREER_NOT_FOUND`          |
| `maleCount`     | Requerido, `>= 0`                                         |
| `femaleCount`   | Requerido, `>= 0`                                         |
| `description`   | Opcional, puede ser `null`                                |
| `isActive`      | Opcional, default `true`                                  |
| Clave compuesta | `careerId` + `generationId` única → `409 DUPLICATE_ERROR` |

#### PUT `/new-admissions/:id` — Actualizar completo

```json
{
  "generationId": "string (opcional)",
  "careerId": "string (opcional)",
  "maleCount": "number >= 0 (opcional)",
  "femaleCount": "number >= 0 (opcional)",
  "description": "string | null (opcional)",
  "isActive": "boolean (opcional)"
}
```

| Campo           | Validación                                                  |
| --------------- | ----------------------------------------------------------- |
| `generationId`  | Si se envía: debe existir → `404 GENERATION_NOT_FOUND`      |
| `careerId`      | Si se envía: debe existir → `404 CAREER_NOT_FOUND`          |
| `maleCount`     | Si se envía: `>= 0`                                         |
| `femaleCount`   | Si se envía: `>= 0`                                         |
| Clave compuesta | Única excluyendo el registro actual → `409 DUPLICATE_ERROR` |
| Registro        | Debe existir → `404 NEW_ADMISSION_NOT_FOUND`                |

#### PATCH `/new-admissions/:id` — Actualizar parcial

Mismas validaciones que PUT. Solo se actualizan los campos enviados.

---

## 6. Formato de Respuesta Paginada

### 6.1. Estructura estándar

Todos los endpoints de listado (`GET /graduation-options`, `GET /new-admissions`) retornan:

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

### 6.2. Lógica de cálculo

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

### 6.3. Modelos de datos en `data`

#### GraduationOption

```typescript
{
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

#### NewAdmission

```typescript
{
  id: string;
  generationId: string;
  careerId: string;
  maleCount: number;
  femaleCount: number;
  description: string | null;
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### 6.4. Serialización

- Usar `id` como string (no exponer `_id` ni `__v` de Mongoose)
- Fechas en formato ISO 8601 completo: `2024-01-15T10:00:00.000Z`
- Soporte de `limit` alto (ej. `999999`) para export de tablas en frontend

---

## 7. Resumen de Compatibilidad Frontend

### 7.1. graduationOptionsService

| Método             | Endpoint                                  | HTTP |
| ------------------ | ----------------------------------------- | ---- |
| `list(params)`     | GET `/graduation-options`                 | 200  |
| `getById(id)`      | GET `/graduation-options/:id`             | 200  |
| `create(data)`     | POST `/graduation-options`                | 201  |
| `update(id, data)` | PUT `/graduation-options/:id`             | 200  |
| `patch(id, data)`  | PATCH `/graduation-options/:id`           | 200  |
| `delete(id)`       | DELETE `/graduation-options/:id`          | 200  |
| `activate(id)`     | POST `/graduation-options/:id/activate`   | 200  |
| `deactivate(id)`   | POST `/graduation-options/:id/deactivate` | 200  |

### 7.2. newAdmissionsService

| Método             | Endpoint                              | HTTP |
| ------------------ | ------------------------------------- | ---- |
| `list(params)`     | GET `/new-admissions`                 | 200  |
| `getById(id)`      | GET `/new-admissions/:id`             | 200  |
| `create(data)`     | POST `/new-admissions`                | 201  |
| `update(id, data)` | PUT `/new-admissions/:id`             | 200  |
| `patch(id, data)`  | PATCH `/new-admissions/:id`           | 200  |
| `delete(id)`       | DELETE `/new-admissions/:id`          | 200  |
| `activate(id)`     | POST `/new-admissions/:id/activate`   | 200  |
| `deactivate(id)`   | POST `/new-admissions/:id/deactivate` | 200  |

---

## 8. Referencias

- [BACKEND_API_SPEC.md](./BACKEND_API_SPEC.md) — Secciones 7 y 8
- [endpoints.ts](../libs/frontend/shared/src/api/endpoints.ts) — GRADUATION_OPTIONS, NEW_ADMISSIONS
- [graduationOptionsService.ts](../libs/frontend/features/src/graduation-options/api/graduationOptionsService.ts)
- [newAdmissionsService.ts](../libs/frontend/features/src/new-admissions/api/newAdmissionsService.ts)
- [Plan API GO + NA](../.cursor/plans/plan_api_go_+_na_90840fbe.plan.md)
