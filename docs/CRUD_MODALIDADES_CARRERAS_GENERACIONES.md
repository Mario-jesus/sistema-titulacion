# Especificación para CRUD: Modalidades, Carreras y Generaciones

> Documento de análisis y guía para desarrollar los módulos backend siguiendo la estructura existente de `@backend/users`.

---

## 1. Estructura de Referencia: Módulo Users

Cada módulo backend sigue esta estructura en `libs/backend/<module>/src/`:

```
libs/backend/users/
├── src/
│   ├── index.ts              # Exporta router, controller, service, model
│   ├── users.routes.ts       # Define rutas y middlewares
│   ├── users.controller.ts  # Handlers HTTP, validación con Zod
│   ├── users.service.ts     # Lógica de negocio, acceso a BD
│   ├── schemas/
│   │   └── users.schemas.ts  # Schemas Zod para request body
│   ├── models/
│   │   └── User.model.ts     # Modelo Mongoose
│   └── utils/
│       └── pagination.ts     # buildPagination, parsePaginationQuery
```

### Patrones clave

1. **Model**: Mongoose Schema con `timestamps: true`, `toJSON` transform para `id` en lugar de `_id`
2. **Service**: Usa `AppError` de `@backend/shared` para errores (statusCode, code, message)
3. **Controller**: Valida con `schema.safeParse(req.body)`, retorna `{ error, code, details }` en 400
4. **Routes**: Middleware `requireAdmin` para escritura (según BACKEND_API_SPEC: staff guard en modalidades, carreras, generaciones)
5. **Paginación**: Reutilizar `parsePaginationQuery` y `buildPagination` (o crear util compartida)
6. **DI**: Registrar en `container.ts` y montar en `main.ts`

---

## 2. Dependencias entre Módulos

| Módulo       | Dependencias | Orden de creación  |
| ------------ | ------------ | ------------------ |
| Modalidades  | Ninguna      | 1 (primero)        |
| Generaciones | Ninguna      | 2 (paralelo con 1) |
| Carreras     | Modalidades  | 3 (después de 1)   |

---

## 3. Módulo Modalidades

### 3.1. Modelo Mongoose

```typescript
// IModality
{
  _id: ObjectId;
  name: string; // required, unique
  description: string | null;
  isActive: boolean; // default: true
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2. Endpoints (según BACKEND_API_SPEC y API_ENDPOINTS)

| Método | Ruta                         | Permisos | Descripción                                 |
| ------ | ---------------------------- | -------- | ------------------------------------------- |
| GET    | `/modalities`                | Auth     | Listar (paginado, activeOnly, search, sort) |
| GET    | `/modalities/:id`            | Auth     | Detalle                                     |
| POST   | `/modalities`                | ADMIN    | Crear                                       |
| PUT    | `/modalities/:id`            | ADMIN    | Actualizar completo                         |
| PATCH  | `/modalities/:id`            | ADMIN    | Actualizar parcial                          |
| DELETE | `/modalities/:id`            | ADMIN    | Eliminar                                    |
| POST   | `/modalities/:id/activate`   | ADMIN    | Activar                                     |
| POST   | `/modalities/:id/deactivate` | ADMIN    | Desactivar                                  |

### 3.3. Query params (GET list)

- `page`, `limit` (paginación)
- `activeOnly` (boolean)
- `search` / `q` (búsqueda en `name`)
- `sortBy`: `name`, `createdAt`, `isActive` (default: `name`)
- `sortOrder`: `asc` | `desc` (default: `asc`)

### 3.4. Validaciones

- **Crear**: `name` requerido, no vacío. `name` único (case-insensitive) → `409 DUPLICATE_ERROR`
- **Actualizar**: Mismas validaciones. Duplicado excluye el registro actual.
- **Eliminar**: Validar que no tenga carreras asociadas (si se implementa en backend)

### 3.5. Códigos de error

- `MODALITY_NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `DUPLICATE_ERROR` (409)

---

## 4. Módulo Generaciones

### 4.1. Modelo Mongoose

```typescript
// IGeneration
{
  _id: ObjectId;
  name: string | null; // opcional pero si se da debe ser único
  startYear: Date; // required
  endYear: Date; // required
  description: string | null;
  isActive: boolean; // default: true
  createdAt: Date;
  updatedAt: Date;
}
```

**Validación**: `startYear < endYear`

### 4.2. Endpoints

Mismo patrón que modalidades: GET list, GET :id, POST, PUT, PATCH, DELETE, activate, deactivate.

### 4.3. Query params (GET list)

- `sortBy`: `name`, `startYear`, `endYear`, `createdAt`, `isActive` (default: `startYear`)
- `sortOrder`: default `desc` para startYear

### 4.4. Validaciones

- **Crear**: `name` (opcional), `startYear`, `endYear` requeridos. `startYear < endYear` → `400 VALIDATION_ERROR`. `name` único si se proporciona.
- **Actualizar**: Revalidar fechas si cambian.

### 4.5. Códigos de error

- `GENERATION_NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `DUPLICATE_ERROR` (409)

---

## 5. Módulo Carreras

### 5.1. Modelo Mongoose

```typescript
// ICareer
{
  _id: ObjectId;
  name: string; // required, unique
  shortName: string; // required, unique
  modalityId: ObjectId; // ref: Modality
  description: string | null;
  isActive: boolean; // default: true
  createdAt: Date;
  updatedAt: Date;
}
```

**Populate**: En respuestas incluir `modality` como objeto (populate de Modality).

### 5.2. Endpoints

Mismo patrón CRUD + activate/deactivate. Ruta base: `/careers`

### 5.3. Query params (GET list)

- `sortBy`: `name`, `shortName`, `createdAt`, `isActive` (default: `name`)
- Búsqueda en `name` y `shortName`

### 5.4. Validaciones

- **Crear**: `name`, `shortName`, `modalityId` requeridos. `modalityId` debe existir → `404 MODALITY_NOT_FOUND`. `name` y `shortName` únicos (case-insensitive) → `409 DUPLICATE_ERROR`
- **Actualizar**: Mismas validaciones. Duplicados excluyen el registro actual.
- **Eliminar**: Validar que no tenga estudiantes ni cupos asociados (si se implementa)

### 5.5. Códigos de error

- `CAREER_NOT_FOUND` (404)
- `MODALITY_NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `DUPLICATE_ERROR` (409)

---

## 6. Integración en la Aplicación

### 6.1. tsconfig.base.json

Agregar paths:

```json
"@backend/modalities": ["libs/backend/modalities/src/index.ts"],
"@backend/modalities/*": ["libs/backend/modalities/src/*"],
"@backend/careers": ["libs/backend/careers/src/index.ts"],
"@backend/careers/*": ["libs/backend/careers/src/*"],
"@backend/generations": ["libs/backend/generations/src/index.ts"],
"@backend/generations/*": ["libs/backend/generations/src/*"]
```

### 6.2. container.ts

Registrar modelos, servicios y controladores para cada módulo. Careers depende de ModalityModel.

### 6.3. main.ts

Montar routers bajo `env.API_PREFIX`:

```typescript
a.use(`${env.API_PREFIX}/modalities`, createRequireAuth(...), createModalitiesRouter(...));
a.use(`${env.API_PREFIX}/careers`, createRequireAuth(...), createCareersRouter(...));
a.use(`${env.API_PREFIX}/generations`, createRequireAuth(...), createGenerationsRouter(...));
```

**Importante**: Usar `requireAdmin` para POST, PUT, PATCH, DELETE, activate, deactivate (staff guard según BACKEND_API_SPEC). GET list y GET :id pueden ser accesibles por cualquier usuario autenticado.

---

## 7. Formato de Respuesta

### Listado (todos los módulos)

```json
{
  "data": [...],
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

### Detalle / Crear / Actualizar

Objeto plano con `id` (no `_id`), fechas como ISO strings.

### Career con populate

```json
{
  "id": "...",
  "name": "...",
  "shortName": "...",
  "modalityId": "...",
  "modality": {
    "id": "...",
    "name": "...",
    "description": "...",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "description": "...",
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## 8. Seeds (opcional)

Crear seeds para modalidades, generaciones y carreras en `libs/backend/seeds/` para datos iniciales de desarrollo, siguiendo el patrón de `users.seed.ts`.

---

## 9. Referencias

- **Estructura Users**: `libs/backend/users/`
- **API Spec**: `docs/BACKEND_API_SPEC.md` (secciones 4, 5, 6)
- **Frontend types**: `libs/frontend/features/src/{modalities,careers,generations}/model/types.ts`
- **API Endpoints**: `libs/frontend/shared/src/api/endpoints.ts`
- **env.API_PREFIX**: Revisar `libs/backend/core/src/config/env.ts` (ej: `/api/v1`)
