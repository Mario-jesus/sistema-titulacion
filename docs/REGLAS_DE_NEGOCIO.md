# Reglas de Negocio — Sistema de Titulación

> **Propósito:** Este documento describe todas las reglas de negocio del sistema, extraídas directamente de los mocks (MSW handlers). Está pensado como contexto para una IA QA que realizará pruebas E2E.

---

## Tabla de Contenidos

1. [Usuarios de prueba (credenciales)](#1-usuarios-de-prueba)
2. [Autenticación](#2-autenticación)
3. [Gestión de Usuarios](#3-gestión-de-usuarios)
4. [Estudiantes — Estructura y Estados](#4-estudiantes--estructura-y-estados)
5. [Estudiantes — Transiciones de Estado](#5-estudiantes--transiciones-de-estado)
6. [Estudiantes — Proceso de Titulación (processStatus)](#6-estudiantes--proceso-de-titulación-processstatus)
7. [Titulaciones (Graduations)](#7-titulaciones-graduations)
8. [Campos Capturados (CapturedFields)](#8-campos-capturados-capturedfields)
9. [Carreras](#9-carreras)
10. [Generaciones](#10-generaciones)
11. [Nuevo Ingreso (New Admissions)](#11-nuevo-ingreso-new-admissions)
12. [Ingreso y Egreso](#12-ingreso-y-egreso)
13. [Reportes](#13-reportes)
14. [Dashboard](#14-dashboard)
15. [Paginación y Filtros (comportamiento común)](#15-paginación-y-filtros-comportamiento-común)
16. [Códigos de Error de Referencia](#16-códigos-de-error-de-referencia)

---

## 1. Usuarios de Prueba

El sistema tiene dos usuarios precargados:

| Email               | Contraseña    | Rol   |
| ------------------- | ------------- | ----- |
| `admin@example.com` | `password123` | ADMIN |
| `staff@example.com` | `password123` | STAFF |

---

## 2. Autenticación

### Login (`POST /auth/login`)

- **email** y **password** son obligatorios. Si alguno falta → `401 INVALID_CREDENTIALS`.
- Si el email no existe en el sistema → `401 INVALID_CREDENTIALS`.
- Si la contraseña es incorrecta → `401 INVALID_CREDENTIALS`.
- Si la cuenta está desactivada (`isActive: false`) → `403 ACCOUNT_DISABLED`.
- **Rate limiting en login:** máximo **5 intentos** en una ventana de **15 minutos**. Al excederse → `429 TOO_MANY_REQUESTS`.
- Al hacer login exitoso: se genera un **access token** y un **refresh token** (rotación). El token previo del usuario queda invalidado.
- La respuesta incluye: `{ user, token, refreshToken, expiresIn }`.
- Cada login exitoso actualiza `lastLogin` del usuario.

### Refresh Token (`POST /auth/refresh`)

- **refreshToken** es obligatorio en el body → si falta `400 MISSING_REFRESH_TOKEN`.
- Si el refresh token es inválido o expirado → `401 INVALID_REFRESH_TOKEN`.
- Implementa **rotación de tokens**: al refrescar, el token viejo se invalida y se emite uno nuevo.
- Si la cuenta del usuario está desactivada → `403 ACCOUNT_DISABLED`.
- **Rate limiting en refresh:** máximo **10 intentos** en una ventana de **15 minutos** → `429 TOO_MANY_REQUESTS`.

### Obtener usuario actual (`GET /auth/me`)

- Requiere header `Authorization: Bearer <token>`.
- Si el token falta o es inválido → `401 UNAUTHORIZED`.
- Retorna el objeto `{ user }` del usuario autenticado.

### Logout (`POST /auth/logout`)

- No requiere autenticación para operar (el token puede estar expirado).
- Si se proporciona **refreshToken** en el body, lo invalida.
- Siempre retorna `200 { message: 'Logout exitoso' }`.

---

## 3. Gestión de Usuarios

### Roles disponibles

- `ADMIN`: acceso total.
- `STAFF`: acceso limitado (no puede listar, crear, editar ni eliminar usuarios de otros).

### Permisos por endpoint

| Acción                                                         | ADMIN             | STAFF               |
| -------------------------------------------------------------- | ----------------- | ------------------- |
| Listar usuarios (`GET /users`)                                 | ✅                | ❌ (403)            |
| Ver usuario específico                                         | ✅ (cualquiera)   | ✅ (solo el propio) |
| Crear usuario (`POST /users`)                                  | ✅                | ❌ (403)            |
| Editar usuario (`PUT/PATCH /users/:id`)                        | ✅                | ❌ (403)            |
| Eliminar usuario (`DELETE /users/:id`)                         | ✅                | ❌ (403)            |
| Activar usuario (`POST /users/:id/activate`)                   | ✅                | ❌ (403)            |
| Desactivar usuario (`POST /users/:id/deactivate`)              | ✅                | ❌ (403)            |
| Cambiar contraseña propia (`POST /users/me/change-password`)   | ✅                | ✅                  |
| Cambiar contraseña de otro (`POST /users/:id/change-password`) | ✅ (no la propia) | ❌ (403)            |
| Actualizar perfil propio (`PATCH /users/me`)                   | ✅                | ✅                  |

> Todos los endpoints de usuarios requieren autenticación. Sin token → `401 UNAUTHORIZED`.

### Validaciones al crear usuario

- `username`: requerido, solo **letras y números** (sin espacios ni caracteres especiales). → Si tiene caracteres inválidos: `400 VALIDATION_ERROR`.
- `email`: requerido, debe tener formato válido (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
- `password`: requerido, debe cumplir:
  - Mínimo **8 caracteres**
  - Al menos **un número**
  - Al menos **una letra minúscula**
  - Al menos **una letra mayúscula**
  - Al menos **un símbolo** (`!@#$%^&*()_+-=[]{}...`)
- `username` y `email` deben ser únicos → `409 DUPLICATE_ERROR`.
- El rol por defecto es `STAFF` si no se especifica.

### Restricciones importantes

- Un admin **no puede eliminarse a sí mismo** → `400 VALIDATION_ERROR`.
- Un admin **no puede desactivarse a sí mismo** → `400 VALIDATION_ERROR`.
- Un admin **no puede usar** `POST /users/:id/change-password` para cambiar su propia contraseña (debe usar `/users/me/change-password`) → `400 VALIDATION_ERROR`.
- El campo `avatar` **solo es visible y actualizable** por el propio usuario desde `PATCH /users/me`. Los endpoints de administración (`GET /users/:id`, `PUT/PATCH /users/:id`) **no devuelven ni aceptan** `avatar`.

### Cambio de contraseña propia (`POST /users/me/change-password`)

- Requiere `currentPassword` y `newPassword`.
- Valida que la contraseña actual sea correcta → si no lo es: `400 INVALID_PASSWORD`.
- La nueva contraseña debe cumplir los mismos requisitos de formato.
- La nueva contraseña **debe ser diferente** a la actual → `400 VALIDATION_ERROR`.

### Cambio de contraseña por admin (`POST /users/:id/change-password`)

- Solo para administradores (no pueden cambiar la propia).
- **No requiere** `currentPassword`.
- Debe cumplir requisitos de formato de contraseña.

---

## 4. Estudiantes — Estructura y Estados

### Campos del estudiante

| Campo              | Tipo    | Obligatorio | Notas                                        |
| ------------------ | ------- | ----------- | -------------------------------------------- |
| `controlNumber`    | string  | ✅          | Único en el sistema                          |
| `firstName`        | string  | ✅          |                                              |
| `paternalLastName` | string  | ✅          |                                              |
| `maternalLastName` | string  | ❌          |                                              |
| `email`            | string  | ✅          | Único en el sistema, se guarda en minúsculas |
| `phoneNumber`      | string  | ❌          |                                              |
| `birthDate`        | date    | ❌          | Formato `YYYY-MM-DD` en respuestas           |
| `sex`              | enum    | ❌          | `MASCULINO` \| `FEMENINO`                    |
| `careerId`         | string  | ✅          | Debe existir                                 |
| `generationId`     | string  | ✅          | Debe existir                                 |
| `isEgressed`       | boolean | ❌          | `false` por defecto                          |
| `status`           | enum    | ❌          | `ACTIVO` por defecto                         |
| `processStatus`    | enum    | ❌          | `NOT_STARTED` por defecto                    |
| `hasIdCard`        | boolean | ❌          | Solo `true` si `processStatus === GRADUATED` |

### Status del estudiante (estados administrativos)

| Valor       | Descripción                       |
| ----------- | --------------------------------- |
| `ACTIVO`    | Estudiante activo en el sistema   |
| `PAUSADO`   | Proceso pausado temporalmente     |
| `CANCELADO` | Proceso cancelado permanentemente |

### ProcessStatus (estado del proceso de titulación)

| Valor         | Descripción                   |
| ------------- | ----------------------------- |
| `NOT_STARTED` | Aún no ha iniciado el proceso |
| `IN_PROCESS`  | En proceso de titulación      |
| `SCHEDULED`   | Fecha de examen agendada      |
| `GRADUATED`   | Ya titulado                   |

---

## 5. Estudiantes — Transiciones de Estado

### Regla clave: `hasIdCard`

> Solo un estudiante con `processStatus === GRADUATED` puede tener `hasIdCard: true`. Si el processStatus es cualquier otro, el sistema **fuerza automáticamente** `hasIdCard: false` al guardar.

### Transiciones de `status` (endpoint `POST /students/:id/status`)

```
ACTIVO  →  PAUSADO    ✅
ACTIVO  →  CANCELADO  ✅ (excepto si está egresado o graduado)
PAUSADO →  ACTIVO     ✅
CANCELADO → cualquier estado  ❌ (estado terminal)
```

**Restricciones adicionales en status:**

- Un estudiante con `processStatus === GRADUATED` **NO puede ser pausado ni cancelado** → `400 INVALID_STATUS_TRANSITION`.
- Un estudiante con `isEgressed === true` **NO puede ser cancelado** → `400 INVALID_STATUS_TRANSITION`.

### Egreso (`POST /students/:id/egress`)

- Solo se puede marcar como egresado si aún **no está egresado** (`isEgressed === false`).
- Si ya está egresado → `400 ALREADY_EGRESSED`.

### Desmarcar egreso (`POST /students/:id/unegress`)

- Solo se puede si el estudiante **está egresado** (`isEgressed === true`).
- **No se puede** si tiene `CapturedFields` o `Graduation` asociados (está en proceso o titulado) → `400 CANNOT_UNEGRESS`.

---

## 6. Estudiantes — Proceso de Titulación (processStatus)

### Endpoint: `POST /students/:id/process-status`

Las transiciones válidas son:

```
NOT_STARTED → IN_PROCESS    ✅ (requiere: isEgressed=true, status=ACTIVO)
NOT_STARTED → SCHEDULED     ✅ (requiere: isEgressed=true, status=ACTIVO)
NOT_STARTED → GRADUATED     ✅ (requiere: isEgressed=true, status=ACTIVO)
IN_PROCESS  → SCHEDULED     ✅
IN_PROCESS  → NOT_STARTED   ✅
SCHEDULED   → GRADUATED     ✅
SCHEDULED   → IN_PROCESS    ✅
GRADUATED   → cualquier     ❌ (estado terminal)
```

**Regla:** Solo estudiantes con `processStatus === NOT_STARTED` pueden pasar a `IN_PROCESS`.

**Precondiciones para salir de `NOT_STARTED`:**

- El estudiante debe estar **egresado** (`isEgressed === true`) → `400 STUDENT_NOT_EGRESSED`.
- El estudiante debe estar **activo** (`status === ACTIVO`) → `400 INVALID_STATUS_FOR_PROCESS`.

**Para `IN_PROCESS`, `SCHEDULED` y `GRADUATED`, el estudiante debe estar egresado.**

**Para transición a `SCHEDULED`:**

- Se requiere `scheduledDate` en el body → `400 SCHEDULED_DATE_REQUIRED`.

**Para transición a `GRADUATED`:**

- Se puede enviar opcionalmente: `graduationDate`, `idCardNumber`, `idCardIssueDate`, `hasIdCard`.
- Si ya existe un registro de `Graduation` para el estudiante, se actualiza; si no, se crea uno nuevo.
- `hasIdCard` solo se activa si el nuevo estado es `GRADUATED`.

---

## 7. Titulaciones (Graduations)

### Creación (`POST /graduations`)

**Campos requeridos:**

- `studentId`: debe existir.
- `president`, `secretary`, `vocal`, `substituteVocal`: todos requeridos (comité de titulación).

**Reglas de negocio:**

- Solo puede existir **una titulación por estudiante** → `409 DUPLICATE_ERROR`.
- **Solo estudiantes con `processStatus === GRADUATED`** pueden tener `graduationDate`, `idCardNumber` e `idCardIssueDate`. Si el estudiante no está titulado y se envían estos campos → `400 VALIDATION_ERROR`.
- Si el estudiante **está titulado**, `graduationDate` es **requerido** → `400 VALIDATION_ERROR`.
- La `graduationDate` debe ser **menor o igual a la fecha actual** → `400 INVALID_GRADUATION_DATE`.
- La `graduationOptionId` es **opcional**.

### Actualización (`PUT/PATCH /graduations/student/:id`)

- Los mismos campos del comité no pueden quedar vacíos si se envían.
- Las reglas de `graduationDate` e `idCardNumber` aplican igual que en la creación.
- No puede haber dos registros apuntando al mismo estudiante → `409 DUPLICATE_ERROR`.

### Marcar como graduado (`POST /graduations/:studentId/graduate`)

- Requiere que exista un registro de `Graduation` para el estudiante → `404 GRADUATION_NOT_FOUND`.
- El estudiante debe existir, estar **egresado** y **activo** (no pausado ni cancelado).
- Si `graduationDate` existe y es **futura** → `400 INVALID_GRADUATION_DATE`.

### Desmarcar titulación (`POST /graduations/:studentId/ungraduate`)

- Revierte el `processStatus` del estudiante a `IN_PROCESS`.
- Elimina `graduationDate`, `idCardNumber` e `idCardIssueDate` del registro.
- Pone `hasIdCard: false` en el estudiante.
- El registro de Graduation **no se elimina**, solo se limpia.

### Eliminación (`DELETE /graduations/student/:id`)

- Elimina completamente el registro de titulación del estudiante.

---

## 8. Campos Capturados (CapturedFields)

El registro de "campos capturados" representa los datos del proceso de titulación del estudiante (proyecto y empresa).

### Creación (`POST /captured-fields`)

**Campos requeridos:**

- `studentId`: debe existir.
- `projectName`: nombre del proyecto (no vacío).
- `company`: nombre de la empresa (no vacío).
- `processDate`: fecha del proceso.

**Reglas:**

- Solo un registro por estudiante → `409 DUPLICATE_ERROR`.
- El estudiante debe estar en estado **ACTIVO** (no pausado ni cancelado) → `400 INVALID_STUDENT_STATUS`.

### Actualización (`PUT/PATCH /captured-fields/student/:id`)

- `projectName` y `company` no pueden quedar vacíos si se envían.
- El estudiante asociado debe estar **ACTIVO**.

### Relación con egreso

- Si un estudiante tiene `CapturedFields`, **no puede desmarcarse como no egresado** (ver sección 5).

---

## 9. Carreras

### Creación (`POST /careers`)

**Campos requeridos:**

- `name`: nombre completo (único en el sistema).
- `shortName`: nombre corto (único en el sistema).
- `modalityId`: debe existir en el catálogo de modalidades.

**Unicidad:** tanto `name` como `shortName` deben ser únicos (comparación insensible a mayúsculas) → `409 DUPLICATE_ERROR`.

### Activación / Desactivación

- `POST /careers/:id/activate` → pone `isActive: true`.
- `POST /careers/:id/deactivate` → pone `isActive: false`.

### Filtros disponibles en listado

- `activeOnly=true`: solo carreras activas.
- `search` / `q`: busca en `name` y `shortName`.
- Ordenamiento: `name`, `shortName`, `createdAt`, `isActive`.

---

## 10. Generaciones

### Creación (`POST /generations`)

**Campos requeridos:**

- `name`: nombre (único en el sistema).
- `startYear` y `endYear`: fechas de inicio y fin.

**Validaciones:**

- `startYear` debe ser **anterior** a `endYear` → `400 VALIDATION_ERROR`.
- `name` debe ser único → `409 DUPLICATE_ERROR`.

### Filtros disponibles en listado

- `activeOnly=true`: solo generaciones activas.
- `search` / `q`: busca en `name`.
- Ordenamiento: `name`, `startYear`, `endYear`, `createdAt`, `isActive` (default: `startYear` descendente).

---

## 11. Nuevo Ingreso (New Admissions)

Los registros de nuevo ingreso registran la cantidad de alumnos de nuevo ingreso por carrera y generación, separados por sexo.

### Creación (`POST /new-admissions`)

**Campos requeridos:**

- `careerId`: debe existir.
- `generationId`: debe existir.
- `maleCount`: número ≥ 0.
- `femaleCount`: número ≥ 0.

**Unicidad:** Solo puede existir **un registro por combinación carrera + generación** → `409 DUPLICATE_ERROR`.

### Activación / Desactivación

- `POST /new-admissions/:id/activate` → `isActive: true`.
- `POST /new-admissions/:id/deactivate` → `isActive: false`.

### Uso en reportes y dashboard

- Los ingresos (`admissionNumber`) se calculan como la suma de `maleCount + femaleCount` de todos los registros activos para esa combinación generación-carrera.

---

## 12. Ingreso y Egreso

El módulo de ingreso-egreso es **de solo lectura** (calculado dinámicamente). No existe creación manual.

### Cálculo

- **Ingreso (admissionNumber):** suma de `maleCount + femaleCount` de los registros de ingreso activos para esa generación y carrera.
- **Egreso (egressNumber):** cantidad de estudiantes con `isEgressed === true` para esa generación y carrera.

### Filtros en listado (`GET /ingress-egress`)

- `careerId`, `generationId`, `search` / `q` (busca en nombre de carrera y generación).
- Ordenamiento: `careerName`, `generationName`, `admissionNumber`, `egressNumber`.

---

## 13. Reportes

### Endpoint: `POST /reports/generate`

#### Tipos de reporte

- `por-generaciones`: agrupa datos por generación.
- `por-carreras`: agrupa datos por carrera.

#### Parámetros de la solicitud

| Parámetro                   | Descripción                                                           |
| --------------------------- | --------------------------------------------------------------------- |
| `reportType`                | `'por-generaciones'` \| `'por-carreras'`                              |
| `dateRange`                 | `{ type: 'general' \| 'specific', startYear?, endYear? }`             |
| `careers`                   | `{ type: 'general' \| 'specific', selected?: string[] }`              |
| `graduationRateDenominator` | `'ingreso'` \| `'egreso'` — denominator para calcular % de titulación |
| `includeOtherValue`         | `boolean` — si incluir el valor del denominador no seleccionado       |
| `sex`                       | `'general'` \| `'MASCULINO'` \| `'FEMENINO'` — filtro de sexo         |

#### Tipos de respuesta (tableType)

- **`summary`**: cuando `dateRange: 'general'` Y `careers: 'general'` → resumen global único.
- **`table`**: cuando hay fechas específicas sin carreras específicas (por generaciones) o con carreras (por carreras).
- **`grouped`**: cuando hay carreras específicas en el reporte por generaciones.

#### Reglas de cálculo

- `ingreso`: suma de registros de ingreso **activos** (`isActive: true`) para la combinación generación-carrera. Para filtro de sexo: `MASCULINO` usa `maleCount`, `FEMENINO` usa `femaleCount`.
- `egreso`: estudiantes con `isEgressed === true`.
- `titulados`: estudiantes con `processStatus === GRADUATED`.
- `porcentaje = (titulados / denominador) * 100` (2 decimales). Si el denominador es 0 → `porcentaje = 0`.

#### Filtros de generaciones por rango de años

- Se filtra basándose en el **año de inicio** de la generación (`startYear`).
- Si `startYear` especificado: generación debe empezar en o después.
- Si `endYear` especificado: generación debe empezar en o antes.

---

## 14. Dashboard

### Endpoint: `GET /dashboard`

Retorna estadísticas calculadas dinámicamente:

| Métrica             | Cálculo                                                          |
| ------------------- | ---------------------------------------------------------------- |
| `totalStudents`     | Total de estudiantes en el sistema                               |
| `activeStudents`    | Estudiantes con `status === ACTIVO`                              |
| `inProgress`        | Estudiantes con `processStatus === IN_PROCESS`                   |
| `scheduled`         | Estudiantes con `processStatus === SCHEDULED`                    |
| `graduatedStudents` | Estudiantes con `processStatus === GRADUATED`                    |
| `egressedStudents`  | Estudiantes con `isEgressed === true`                            |
| `totalAdmissions`   | Suma de todos los registros de ingreso (maleCount + femaleCount) |
| `totalEgresses`     | Cantidad de estudiantes egresados                                |
| `egressRate`        | `(egresados / ingresos) * 100`                                   |
| `graduationRate`    | `(titulados / egresados) * 100`                                  |

**Gráficas incluidas:**

- `ingressEgressByGeneration`: Últimas **6 generaciones** ordenadas por año de inicio.
- `statusDistribution`: Distribución de Ingreso / Egreso / Titulados.
- `studentsByCareer`: Top **6 carreras** con más estudiantes.
- `recentStudents`: Últimos **5 estudiantes** agregados (por `createdAt` descendente).

---

## 15. Paginación y Filtros (comportamiento común)

Todos los listados implementan paginación estándar:

### Query params de paginación

| Parámetro   | Default | Descripción                                             |
| ----------- | ------- | ------------------------------------------------------- |
| `page`      | `1`     | Página actual (mínimo 1)                                |
| `limit`     | `10`    | Registros por página                                    |
| `sortBy`    | varía   | Campo de ordenamiento (validado contra lista permitida) |
| `sortOrder` | varía   | `asc` \| `desc`                                         |

### Respuesta de paginación

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

### Búsqueda por texto

- Parámetros aceptados: `search` o `q` (ambos equivalentes).
- Búsqueda **insensible a mayúsculas**.

### Campos de búsqueda por entidad

| Entidad                                          | Campos de búsqueda                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------------- |
| Estudiantes                                      | `firstName`, `paternalLastName`, `maternalLastName`, `controlNumber`, `email` |
| Estudiantes en proceso / programados / titulados | `fullName`, `controlNumber`                                                   |
| Usuarios                                         | `username`, `email`                                                           |
| Carreras                                         | `name`, `shortName`                                                           |
| Generaciones                                     | `name`                                                                        |
| Nuevo Ingreso                                    | `description`                                                                 |
| Ingreso-Egreso                                   | `careerName`, `generationName`                                                |

### Ordenamiento en estudiantes

Campos válidos: `firstName`, `paternalLastName`, `controlNumber`, `email`, `birthDate`, `createdAt`, `isEgressed`, `status`. Default: `paternalLastName asc`.

---

## 16. Códigos de Error de Referencia

| Código                              | HTTP | Descripción                                         |
| ----------------------------------- | ---- | --------------------------------------------------- |
| `INVALID_CREDENTIALS`               | 401  | Email o contraseña incorrectos                      |
| `ACCOUNT_DISABLED`                  | 403  | Cuenta desactivada                                  |
| `UNAUTHORIZED`                      | 401  | Token inválido o no proporcionado                   |
| `FORBIDDEN`                         | 403  | Sin permisos para esta acción                       |
| `TOO_MANY_REQUESTS`                 | 429  | Rate limit excedido                                 |
| `MISSING_REFRESH_TOKEN`             | 400  | Refresh token no enviado                            |
| `INVALID_REFRESH_TOKEN`             | 401  | Refresh token inválido o expirado                   |
| `VALIDATION_ERROR`                  | 400  | Error de validación de campo                        |
| `DUPLICATE_ERROR`                   | 409  | Ya existe un registro con ese valor                 |
| `STUDENT_NOT_FOUND`                 | 404  | Estudiante no encontrado                            |
| `CAREER_NOT_FOUND`                  | 404  | Carrera no encontrada                               |
| `GENERATION_NOT_FOUND`              | 404  | Generación no encontrada                            |
| `GRADUATION_NOT_FOUND`              | 404  | Titulación no encontrada                            |
| `GRADUATION_OPTION_NOT_FOUND`       | 404  | Opción de titulación no encontrada                  |
| `MODALITY_NOT_FOUND`                | 404  | Modalidad no encontrada                             |
| `NEW_ADMISSION_NOT_FOUND`           | 404  | Registro de ingreso no encontrado                   |
| `USER_NOT_FOUND`                    | 404  | Usuario no encontrado                               |
| `CAPTURED_FIELDS_NOT_FOUND`         | 404  | Campos capturados no encontrados                    |
| `INVALID_STATUS_TRANSITION`         | 400  | Transición de estado inválida                       |
| `INVALID_PROCESS_STATUS_TRANSITION` | 400  | Transición de processStatus inválida                |
| `ALREADY_EGRESSED`                  | 400  | El estudiante ya está egresado                      |
| `NOT_EGRESSED`                      | 400  | El estudiante no está egresado                      |
| `CANNOT_UNEGRESS`                   | 400  | No se puede desmarcar egreso (tiene proceso activo) |
| `STUDENT_NOT_EGRESSED`              | 400  | Estudiante debe estar egresado para este proceso    |
| `INVALID_STATUS_FOR_PROCESS`        | 400  | Estado del estudiante no permite este proceso       |
| `INVALID_GRADUATION_DATE`           | 400  | Fecha de titulación futura o inválida               |
| `SCHEDULED_DATE_REQUIRED`           | 400  | Fecha programada requerida para estado SCHEDULED    |
| `INVALID_STUDENT_STATUS`            | 400  | Estado del estudiante no permite la operación       |
| `INVALID_PASSWORD`                  | 400  | Contraseña actual incorrecta                        |
| `REPORT_TYPE_NOT_SUPPORTED`         | 400  | Tipo de reporte no soportado                        |
| `NO_CAREERS_FOUND`                  | 400  | No se encontraron carreras para el reporte          |
| `NO_GENERATIONS_FOUND`              | 400  | No se encontraron generaciones para el reporte      |

---

## Notas para el QA

1. **El sistema usa MSW** (Mock Service Worker) para interceptar las peticiones en el navegador. Los datos persisten en memoria durante la sesión, pero se **reinician al recargar la página**.

2. **Formato de fechas:** Las fechas en respuestas siempre son ISO 8601. `birthDate` viene como `YYYY-MM-DD` (sin hora).

3. **Emails:** se almacenan en **minúsculas** siempre. Las validaciones de duplicados son insensibles a mayúsculas.

4. **Flujo típico de titulación de un estudiante:**

   ```
   Crear estudiante (status: ACTIVO, processStatus: NOT_STARTED)
       ↓
   Marcar como egresado (POST /students/:id/egress)
       ↓
   Crear CapturedFields (POST /captured-fields) → processStatus: IN_PROCESS
       ↓
   Crear Graduation con fecha programada (POST /graduations) → processStatus: SCHEDULED
       ↓
   Marcar como titulado (POST /students/:id/process-status con processStatus: GRADUATED)
   ```

5. **Unicidad de campos:** `controlNumber` y `email` son únicos entre todos los estudiantes. `username` y `email` son únicos entre todos los usuarios.

6. **hasIdCard:** Si por algún motivo se intenta guardar `hasIdCard: true` en un estudiante que no esté titulado, el sistema lo **fuerza automáticamente a `false`**.
