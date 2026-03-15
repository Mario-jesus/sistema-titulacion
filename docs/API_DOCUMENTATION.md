# Documentación de API - Sistema de Titulación

Esta documentación describe todos los endpoints requeridos por el sistema, basada en los mocks implementados con MSW (Mock Service Worker).

## Información General

### URL Base

```
http://localhost:3000/api/v1
```

### Autenticación

La mayoría de los endpoints requieren autenticación mediante Bearer Token JWT:

```
Authorization: Bearer <token>
```

El token se obtiene mediante el endpoint `/auth/login` y se puede refrescar con `/auth/refresh`.

### Formato de Respuesta

Todas las respuestas exitosas devuelven JSON. Las respuestas de lista incluyen paginación:

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 10,
    "totalPages": 10,
    "page": 1,
    "pagingCounter": 1,
    "hasPrevPage": false,
    "hasNextPage": true,
    "prevPage": null,
    "nextPage": 2
  }
}
```

### Códigos de Estado HTTP

- **200 OK**: Solicitud exitosa
- **201 Created**: Recurso creado exitosamente
- **400 Bad Request**: Error de validación
- **401 Unauthorized**: No autenticado o token inválido
- **403 Forbidden**: No tiene permisos
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto (duplicado, etc.)
- **429 Too Many Requests**: Demasiadas solicitudes (rate limiting)

### Códigos de Error Personalizados

Los errores incluyen un código de error personalizado:

- `INVALID_CREDENTIALS`: Credenciales inválidas
- `TOO_MANY_REQUESTS`: Rate limiting
- `VALIDATION_ERROR`: Error de validación
- `UNAUTHORIZED`: No autenticado
- `FORBIDDEN`: Sin permisos
- `NOT_FOUND`: Recurso no encontrado (varía según recurso)
- `DUPLICATE_ERROR`: Recurso duplicado
- `INVALID_STATUS_TRANSITION`: Transición de estado inválida
- `ACCOUNT_DISABLED`: Cuenta deshabilitada
- `STUDENT_NOT_FOUND`: Estudiante no encontrado
- `CAREER_NOT_FOUND`: Carrera no encontrada
- `GENERATION_NOT_FOUND`: Generación no encontrada
- `MODALITY_NOT_FOUND`: Modalidad no encontrada
- `GRADUATION_OPTION_NOT_FOUND`: Opción de titulación no encontrada
- `NEW_ADMISSION_NOT_FOUND`: Registro de ingreso no encontrado
- `USER_NOT_FOUND`: Usuario no encontrado
- `CAPTURED_FIELDS_NOT_FOUND`: Campos capturados no encontrados
- `GRADUATION_NOT_FOUND`: Titulación no encontrada

---

## 1. Autenticación

### POST /auth/login

Iniciar sesión y obtener tokens de autenticación.

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200:**

```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "avatar": "string | null",
    "role": "ADMIN | STAFF",
    "isActive": true,
    "lastLogin": "ISO8601 | null",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  },
  "token": "string",
  "refreshToken": "string",
  "expiresIn": 3600
}
```

**Errores:**

- **401**: Credenciales inválidas (`INVALID_CREDENTIALS`)
- **403**: Cuenta desactivada (`ACCOUNT_DISABLED`)
- **429**: Demasiados intentos (`TOO_MANY_REQUESTS`)

**Restricciones:**

- Rate limiting: máximo de intentos por tiempo determinado
- La cuenta debe estar activa (`isActive: true`)
- Se invalidan refresh tokens previos al iniciar sesión
- `lastLogin` se actualiza automáticamente a la fecha y hora actual cuando el usuario inicia sesión exitosamente

**Notas:**

- El campo `lastLogin` en la respuesta puede ser `null` si el usuario nunca se ha logueado antes
- El campo `lastLogin` se actualiza automáticamente en cada login exitoso

---

### POST /auth/refresh

Refrescar token de acceso usando refresh token.

**Request Body:**

```json
{
  "refreshToken": "string"
}
```

**Response 200:**

```json
{
  "token": "string",
  "refreshToken": "string",
  "expiresIn": 3600
}
```

**Errores:**

- **400**: Refresh token faltante (`MISSING_REFRESH_TOKEN`)
- **401**: Refresh token inválido o expirado (`INVALID_REFRESH_TOKEN`)
- **403**: Cuenta desactivada (`ACCOUNT_DISABLED`)
- **429**: Demasiados intentos (`TOO_MANY_REQUESTS`)

**Restricciones:**

- Rotación de tokens: el refresh token usado se invalida
- La cuenta debe estar activa
- Rate limiting aplicado

---

### GET /auth/me

Obtener información del usuario autenticado.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "avatar": "string | null",
    "role": "ADMIN | STAFF",
    "isActive": true,
    "lastLogin": "ISO8601 | null",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}
```

**Notas:**

- Este endpoint incluye el campo `avatar` porque el usuario está consultando su propio perfil
- El campo `lastLogin` puede ser `null` si el usuario nunca se ha logueado

**Errores:**

- **401**: Token inválido o faltante (`UNAUTHORIZED`)

---

### POST /auth/logout

Cerrar sesión e invalidar tokens.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body (opcional):**

```json
{
  "refreshToken": "string"
}
```

**Response 200:**

```json
{
  "message": "Logout exitoso"
}
```

**Restricciones:**

- No requiere autenticación válida (puede fallar si el token ya expiró)
- Invalida el refresh token si se proporciona

---

## 2. Usuarios

### GET /users

Listar usuarios (solo administradores).

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (number, default: 1): Página actual
- `limit` (number, default: 10): Items por página
- `activeOnly` (boolean, default: false): Solo usuarios activos
- `search` o `q` (string): Búsqueda por username o email
- `sortBy` (string, default: "username"): Campo de ordenamiento (`username`, `email`, `role`, `createdAt`, `lastLogin`, `isActive`)
- `sortOrder` (string, default: "asc"): Orden (`asc` | `desc`)

**Response 200:**

```json
{
  "data": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "ADMIN | STAFF",
      "isActive": true,
      "lastLogin": "ISO8601 | null",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "pagination": { ... }
}
```

**Notas:**

- El campo `avatar` no se incluye en esta respuesta (solo visible para el usuario propietario en `PATCH /users/me` o `GET /auth/me`)
- El campo `lastLogin` puede ser `null` si el usuario nunca se ha logueado

**Errores:**

- **401**: No autenticado (`UNAUTHORIZED`)
- **403**: No tiene permisos (solo admin) (`FORBIDDEN`)

---

### GET /users/:id

Obtener detalle de usuario.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "avatar": "string | null",
  "role": "ADMIN | STAFF",
  "isActive": true,
  "lastLogin": "ISO8601",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Errores:**

- **401**: No autenticado (`UNAUTHORIZED`)
- **403**: No tiene permisos (admin o propio usuario) (`FORBIDDEN`)
- **404**: Usuario no encontrado (`USER_NOT_FOUND`)

---

### POST /users

Crear usuario (solo administradores).

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "avatar": "string | null",
  "role": "ADMIN | STAFF",
  "isActive": true
}
```

**Response 201:**

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "avatar": "string | null",
  "role": "ADMIN | STAFF",
  "isActive": true,
  "lastLogin": "ISO8601",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Errores:**

- **400**: Validación fallida (`VALIDATION_ERROR`)
  - Username requerido
  - Email requerido y formato válido
  - Password requerido (mínimo 6 caracteres)
- **401**: No autenticado (`UNAUTHORIZED`)
- **403**: No tiene permisos (solo admin) (`FORBIDDEN`)
- **409**: Usuario duplicado (`DUPLICATE_ERROR`)
  - Username ya existe
  - Email ya existe

**Restricciones:**

- Solo administradores pueden crear usuarios
- Password mínimo 6 caracteres
- Email debe tener formato válido
- Username y email únicos

---

### PUT /users/:id

Actualizar usuario completo (solo administradores).

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "role": "ADMIN | STAFF",
  "isActive": true
}
```

**Response 200:**

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "role": "ADMIN | STAFF",
  "isActive": true,
  "lastLogin": "ISO8601 | null",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Notas:**

- El campo `avatar` no se incluye en esta respuesta (solo visible para el usuario propietario)
- El campo `lastLogin` puede ser `null` si el usuario nunca se ha logueado

**Errores:**

- **400**: Validación fallida (`VALIDATION_ERROR`)
  - Username debe ser alfanumérico (solo letras y números, sin espacios)
- **401**: No autenticado (`UNAUTHORIZED`)
- **403**: No tiene permisos (solo admin) (`FORBIDDEN`)
- **404**: Usuario no encontrado (`USER_NOT_FOUND`)
- **409**: Duplicado (`DUPLICATE_ERROR`)

---

### PATCH /users/:id

Actualización parcial de usuario (solo administradores).

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body (parcial):**

```json
{
  "username": "string",
  "email": "string",
  "role": "ADMIN | STAFF",
  "isActive": true
}
```

**Response 200:** (igual que PUT)

**Notas:**

- El campo `avatar` no se incluye en esta respuesta (solo visible para el usuario propietario)

**Errores:** (igual que PUT)

---

### PATCH /users/me

Actualizar perfil propio.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "avatar": "string | null"
}
```

**Response 200:**

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "avatar": "string | null",
  "role": "ADMIN | STAFF",
  "isActive": true,
  "lastLogin": "ISO8601 | null",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Notas:**

- Este endpoint es el único que incluye el campo `avatar` en la respuesta (el usuario puede ver y actualizar su propio avatar)
- El campo `lastLogin` puede ser `null` si el usuario nunca se ha logueado

**Errores:**

- **400**: Validación fallida (`VALIDATION_ERROR`)
  - Username debe ser alfanumérico (solo letras y números, sin espacios)
- **401**: No autenticado (`UNAUTHORIZED`)
- **409**: Duplicado (`DUPLICATE_ERROR`)

**Restricciones:**

- No se puede cambiar `role` ni `isActive`
- Solo se puede actualizar el propio perfil
- El campo `avatar` solo es visible/actualizable por el usuario propietario en este endpoint

---

### DELETE /users/:id

Eliminar usuario (solo administradores).

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "message": "Usuario eliminado exitosamente"
}
```

**Errores:**

- **400**: No puede eliminarse a sí mismo (`VALIDATION_ERROR`)
- **401**: No autenticado (`UNAUTHORIZED`)
- **403**: No tiene permisos (solo admin) (`FORBIDDEN`)
- **404**: Usuario no encontrado (`USER_NOT_FOUND`)

**Restricciones:**

- Un administrador no puede eliminarse a sí mismo

---

### POST /users/:id/activate

Activar usuario (solo administradores).

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:** (usuario actualizado)

**Errores:**

- **401**: No autenticado (`UNAUTHORIZED`)
- **403**: No tiene permisos (`FORBIDDEN`)
- **404**: Usuario no encontrado (`USER_NOT_FOUND`)

---

### POST /users/:id/deactivate

Desactivar usuario (solo administradores).

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:** (usuario actualizado)

**Errores:**

- **400**: No puede desactivarse a sí mismo (`VALIDATION_ERROR`)
- **401**: No autenticado (`UNAUTHORIZED`)
- **403**: No tiene permisos (`FORBIDDEN`)
- **404**: Usuario no encontrado (`USER_NOT_FOUND`)

**Restricciones:**

- Un administrador no puede desactivarse a sí mismo

---

### POST /users/:id/change-password

Cambiar contraseña de usuario.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response 200:**

```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

**Errores:**

- **400**: Validación fallida (`VALIDATION_ERROR`, `INVALID_PASSWORD`)
  - Contraseña actual incorrecta (si es propio usuario)
  - Nueva contraseña mínimo 6 caracteres
  - Nueva contraseña debe ser diferente a la actual
- **401**: No autenticado (`UNAUTHORIZED`)
- **403**: No tiene permisos (`FORBIDDEN`)
- **404**: Usuario no encontrado (`USER_NOT_FOUND`)

**Restricciones:**

- Usuario puede cambiar su propia contraseña (requiere `currentPassword`)
- Administradores pueden cambiar cualquier contraseña (no requieren `currentPassword`)

---

## 3. Estudiantes

### GET /students

Listar estudiantes con filtros y paginación.

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (number, default: 1)
- `limit` (number, default: 10)
- `careerId` (string): Filtrar por carrera
- `generationId` (string): Filtrar por generación
- `status` (string): Filtrar por estado (`ACTIVO`, `PAUSADO`, `CANCELADO`)
- `isEgressed` (boolean): Filtrar por egresados
- `search` o `q` (string): Búsqueda en nombre, apellidos, número de control, email
- `sortBy` (string, default: "paternalLastName"): Campo de ordenamiento
  - Validos: `firstName`, `paternalLastName`, `controlNumber`, `email`, `birthDate`, `createdAt`, `isEgressed`, `status`
- `sortOrder` (string, default: "asc"): `asc` | `desc`

**Response 200:**

```json
{
  "data": [
    {
      "id": "string",
      "careerId": "string",
      "generationId": "string",
      "controlNumber": "string",
      "firstName": "string",
      "paternalLastName": "string",
      "maternalLastName": "string",
      "phoneNumber": "string",
      "email": "string",
      "birthDate": "YYYY-MM-DD",
      "sex": "MASCULINO | FEMENINO",
      "isEgressed": false,
      "status": "ACTIVO | PAUSADO | CANCELADO",
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /students/in-progress

Listar estudiantes en proceso de titulación.

**Query Parameters:** (igual que GET /students, sin `isEgressed`)

**Response 200:**

```json
{
  "data": [
    {
      "controlNumber": "string",
      "fullName": "string",
      "sex": "string",
      "careerId": "string",
      "graduationOptionId": "string | null",
      "projectName": "string | null"
    }
  ],
  "pagination": { ... }
}
```

**Lógica de negocio:**

- Estudiante está en proceso si:
  - Status es `ACTIVO`
  - No está titulado (`isGraduated = false`)
  - Faltan datos en `CapturedFields` O `Graduation` (no en ambas)

---

### GET /students/scheduled

Listar estudiantes programados para titulación.

**Query Parameters:** (igual que GET /students)

**Response 200:**

```json
{
  "data": [
    {
      "controlNumber": "string",
      "fullName": "string",
      "sex": "string",
      "careerId": "string",
      "graduationOptionId": "string | null",
      "graduationDate": "YYYY-MM-DD | null",
      "isGraduated": false
    }
  ],
  "pagination": { ... }
}
```

**Lógica de negocio:**

- Estudiante está programado si:
  - Status es `ACTIVO`
  - No está titulado (`isGraduated = false`)
  - Tiene datos en AMBAS tablas: `CapturedFields` Y `Graduation`

---

### GET /students/graduated

Listar estudiantes graduados.

**Query Parameters:** (igual que GET /students)

**Response 200:**

```json
{
  "data": [
    {
      "controlNumber": "string",
      "fullName": "string",
      "sex": "string",
      "careerId": "string",
      "generationId": "string",
      "graduationOptionId": "string",
      "graduationDate": "YYYY-MM-DD"
    }
  ],
  "pagination": { ... }
}
```

**Lógica de negocio:**

- Estudiante está graduado si:
  - Status es `ACTIVO`
  - Tiene `Graduation` con `isGraduated = true`

---

### GET /students/:id

Obtener detalle de estudiante.

**Response 200:**

```json
{
  "id": "string",
  "careerId": "string",
  "generationId": "string",
  "controlNumber": "string",
  "firstName": "string",
  "paternalLastName": "string",
  "maternalLastName": "string",
  "phoneNumber": "string",
  "email": "string",
  "birthDate": "YYYY-MM-DD",
  "sex": "MASCULINO | FEMENINO",
  "isEgressed": false,
  "status": "ACTIVO | PAUSADO | CANCELADO",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Errores:**

- **404**: Estudiante no encontrado (`STUDENT_NOT_FOUND`)

---

### POST /students

Crear estudiante.

**Request Body:**

```json
{
  "careerId": "string",
  "generationId": "string",
  "controlNumber": "string",
  "firstName": "string",
  "paternalLastName": "string",
  "maternalLastName": "string",
  "phoneNumber": "string",
  "email": "string",
  "birthDate": "YYYY-MM-DD",
  "sex": "MASCULINO | FEMENINO",
  "isEgressed": false,
  "status": "ACTIVO | PAUSADO | CANCELADO"
}
```

**Response 201:** (igual que GET /students/:id)

**Errores:**

- **400**: Validación fallida (`VALIDATION_ERROR`)
  - `firstName`, `paternalLastName`, `controlNumber`, `email`, `careerId`, `generationId` requeridos
- **404**: Carrera o generación no encontrada (`CAREER_NOT_FOUND`, `GENERATION_NOT_FOUND`)
- **409**: Duplicado (`DUPLICATE_ERROR`)
  - Número de control ya existe
  - Email ya existe

**Restricciones:**

- `controlNumber` único
- `email` único
- `careerId` y `generationId` deben existir

---

### PUT /students/:id

Actualizar estudiante completo.

**Request Body:** (todos los campos opcionales excepto requeridos)

**Response 200:** (igual que GET /students/:id)

**Errores:**

- **400**: Validación fallida (`VALIDATION_ERROR`, `INVALID_STATUS_TRANSITION`)
- **404**: Estudiante, carrera o generación no encontrada
- **409**: Duplicado

**Restricciones de transición de estado:**

- `CANCELADO` → no puede cambiar
- `ACTIVO` → solo puede pasar a `PAUSADO` o `CANCELADO`
- `PAUSADO` → solo puede pasar a `ACTIVO`

---

### PATCH /students/:id

Actualización parcial de estudiante.

**Request Body:** (campos opcionales)

**Response 200:** (igual que GET /students/:id)

**Errores:** (igual que PUT)

---

### DELETE /students/:id

Eliminar estudiante.

**Response 200:**

```json
{
  "message": "Estudiante eliminado exitosamente"
}
```

**Errores:**

- **404**: Estudiante no encontrado (`STUDENT_NOT_FOUND`)

---

### POST /students/:id/status

Cambiar estado de estudiante.

**Request Body:**

```json
{
  "status": "ACTIVO | PAUSADO | CANCELADO"
}
```

**Response 200:** (estudiante actualizado)

**Errores:**

- **400**: Validación fallida (`VALIDATION_ERROR`, `INVALID_STATUS_TRANSITION`)
  - Estudiante cancelado no puede cambiar estado
  - Estudiante graduado no puede ser pausado ni cancelado
  - Estudiante egresado no puede ser cancelado
  - Estudiante activo solo puede pasar a pausado o cancelado
  - Estudiante pausado solo puede pasar a activo
- **404**: Estudiante no encontrado (`STUDENT_NOT_FOUND`)

---

### POST /students/:id/egress

Marcar estudiante como egresado.

**Response 200:** (estudiante actualizado con `isEgressed: true`)

**Errores:**

- **400**: Ya está marcado como egresado (`ALREADY_EGRESSED`)
- **404**: Estudiante no encontrado (`STUDENT_NOT_FOUND`)

---

### POST /students/:id/unegress

Marcar estudiante como no egresado.

**Response 200:** (estudiante actualizado con `isEgressed: false`)

**Errores:**

- **400**:
  - No está marcado como egresado (`NOT_EGRESSED`)
  - No se puede cambiar si está en proceso, programado o titulado (`CANNOT_UNEGRESS`)
- **404**: Estudiante no encontrado (`STUDENT_NOT_FOUND`)

**Restricciones:**

- No se puede cambiar a no egresado si tiene `CapturedFields` o `Graduation`

---

## 4. Carreras

### GET /careers

Listar carreras.

**Query Parameters:**

- `page`, `limit`: Paginación
- `activeOnly` (boolean): Solo carreras activas
- `search` o `q` (string): Búsqueda en nombre y nombre corto
- `sortBy` (string, default: "name"): `name`, `shortName`, `createdAt`, `isActive`
- `sortOrder` (string, default: "asc")

**Response 200:**

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "shortName": "string",
      "modalityId": "string",
      "modality": {
        "id": "string",
        "name": "string",
        "description": "string | null",
        "isActive": true,
        "createdAt": "ISO8601",
        "updatedAt": "ISO8601"
      },
      "description": "string | null",
      "isActive": true,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /careers/:id

Obtener detalle de carrera.

**Response 200:** (igual que elemento de lista)

**Errores:**

- **404**: Carrera no encontrada (`CAREER_NOT_FOUND`)

---

### POST /careers

Crear carrera.

**Request Body:**

```json
{
  "name": "string",
  "shortName": "string",
  "modalityId": "string",
  "description": "string | null",
  "isActive": true
}
```

**Response 201:** (carrera creada)

**Errores:**

- **400**: Validación fallida (`VALIDATION_ERROR`)
  - `name`, `shortName`, `modalityId` requeridos
- **404**: Modalidad no encontrada (`MODALITY_NOT_FOUND`)
- **409**: Duplicado (`DUPLICATE_ERROR`)
  - Nombre ya existe
  - Nombre corto ya existe

**Restricciones:**

- `name` único
- `shortName` único
- `modalityId` debe existir

---

### PUT /careers/:id

Actualizar carrera completa.

**Request Body:** (campos opcionales)

**Response 200:** (carrera actualizada)

**Errores:**

- **400**: Validación fallida
- **404**: Carrera o modalidad no encontrada
- **409**: Duplicado

---

### PATCH /careers/:id

Actualización parcial de carrera.

**Response 200:** (carrera actualizada)

**Errores:** (igual que PUT)

---

### DELETE /careers/:id

Eliminar carrera.

**Response 200:**

```json
{
  "message": "Carrera eliminada exitosamente"
}
```

**Errores:**

- **404**: Carrera no encontrada (`CAREER_NOT_FOUND`)

---

### POST /careers/:id/activate

Activar carrera.

**Response 200:** (carrera actualizada con `isActive: true`)

**Errores:**

- **404**: Carrera no encontrada (`CAREER_NOT_FOUND`)

---

### POST /careers/:id/deactivate

Desactivar carrera.

**Response 200:** (carrera actualizada con `isActive: false`)

**Errores:**

- **404**: Carrera no encontrada (`CAREER_NOT_FOUND`)

---

## 5. Generaciones

### GET /generations

Listar generaciones.

**Query Parameters:**

- `page`, `limit`: Paginación
- `activeOnly` (boolean): Solo generaciones activas
- `search` o `q` (string): Búsqueda en nombre
- `sortBy` (string, default: "startYear"): `name`, `startYear`, `endYear`, `createdAt`, `isActive`
- `sortOrder` (string, default: "desc")

**Response 200:**

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "startYear": "ISO8601",
      "endYear": "ISO8601",
      "description": "string | null",
      "isActive": true,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /generations/:id

Obtener detalle de generación.

**Response 200:** (igual que elemento de lista)

**Errores:**

- **404**: Generación no encontrada (`GENERATION_NOT_FOUND`)

---

### POST /generations

Crear generación.

**Request Body:**

```json
{
  "name": "string",
  "startYear": "ISO8601",
  "endYear": "ISO8601",
  "description": "string | null",
  "isActive": true
}
```

**Response 201:** (generación creada)

**Errores:**

- **400**: Validación fallida (`VALIDATION_ERROR`)
  - `name`, `startYear`, `endYear` requeridos
  - `startYear` debe ser anterior a `endYear`
- **409**: Duplicado (`DUPLICATE_ERROR`)
  - Nombre ya existe

**Restricciones:**

- `name` único
- `startYear < endYear`

---

### PUT /generations/:id

Actualizar generación completa.

**Errores:**

- **400**: Validación fallida
  - `startYear` debe ser anterior a `endYear`
- **404**: Generación no encontrada
- **409**: Duplicado

---

### PATCH /generations/:id

Actualización parcial de generación.

**Errores:** (igual que PUT)

---

### DELETE /generations/:id

Eliminar generación.

**Response 200:**

```json
{
  "message": "Generacion eliminada exitosamente"
}
```

**Errores:**

- **404**: Generación no encontrada (`GENERATION_NOT_FOUND`)

---

### POST /generations/:id/activate

Activar generación.

**Response 200:** (generación actualizada)

**Errores:**

- **404**: Generación no encontrada (`GENERATION_NOT_FOUND`)

---

### POST /generations/:id/deactivate

Desactivar generación.

**Response 200:** (generación actualizada)

**Errores:**

- **404**: Generación no encontrada (`GENERATION_NOT_FOUND`)

---

## 6. Modalidades

### GET /modalities

Listar modalidades.

**Query Parameters:**

- `page`, `limit`: Paginación
- `activeOnly` (boolean): Solo modalidades activas
- `search` o `q` (string): Búsqueda en nombre
- `sortBy` (string, default: "name"): `name`, `createdAt`, `isActive`
- `sortOrder` (string, default: "asc")

**Response 200:**

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string | null",
      "isActive": true,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /modalities/:id

Obtener detalle de modalidad.

**Errores:**

- **404**: Modalidad no encontrada (`MODALITY_NOT_FOUND`)

---

### POST /modalities

Crear modalidad.

**Request Body:**

```json
{
  "name": "string",
  "description": "string | null",
  "isActive": true
}
```

**Errores:**

- **400**: Validación fallida (`VALIDATION_ERROR`)
  - `name` requerido
- **409**: Duplicado (`DUPLICATE_ERROR`)
  - Nombre ya existe

**Restricciones:**

- `name` único

---

### PUT /modalities/:id

Actualizar modalidad completa.

**Errores:**

- **400**: Validación fallida
- **404**: Modalidad no encontrada
- **409**: Duplicado

---

### PATCH /modalities/:id

Actualización parcial de modalidad.

**Errores:** (igual que PUT)

---

### DELETE /modalities/:id

Eliminar modalidad.

**Response 200:**

```json
{
  "message": "Modalidad eliminada exitosamente"
}
```

**Errores:**

- **404**: Modalidad no encontrada (`MODALITY_NOT_FOUND`)

---

### POST /modalities/:id/activate

Activar modalidad.

**Response 200:** (modalidad actualizada)

**Errores:**

- **404**: Modalidad no encontrada (`MODALITY_NOT_FOUND`)

---

### POST /modalities/:id/deactivate

Desactivar modalidad.

**Response 200:** (modalidad actualizada)

**Errores:**

- **404**: Modalidad no encontrada (`MODALITY_NOT_FOUND`)

---

## 7. Opciones de Titulación

### GET /graduation-options

Listar opciones de titulación.

**Query Parameters:**

- `page`, `limit`: Paginación
- `activeOnly` (boolean): Solo opciones activas
- `search` o `q` (string): Búsqueda en nombre
- `sortBy` (string, default: "name"): `name`, `createdAt`, `isActive`
- `sortOrder` (string, default: "asc")

**Response 200:**

```json
{
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string | null",
      "isActive": true,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /graduation-options/:id

Obtener detalle de opción de titulación.

**Errores:**

- **404**: Opción no encontrada (`GRADUATION_OPTION_NOT_FOUND`)

---

### POST /graduation-options

Crear opción de titulación.

**Request Body:**

```json
{
  "name": "string",
  "description": "string | null",
  "isActive": true
}
```

**Errores:**

- **400**: Validación fallida (`VALIDATION_ERROR`)
  - `name` requerido
- **409**: Duplicado (`DUPLICATE_ERROR`)
  - Nombre ya existe

**Restricciones:**

- `name` único

---

### PUT /graduation-options/:id

Actualizar opción de titulación completa.

**Errores:**

- **400**: Validación fallida
- **404**: Opción no encontrada (`GRADUATION_OPTION_NOT_FOUND`)
- **409**: Duplicado

---

### PATCH /graduation-options/:id

Actualización parcial de opción de titulación.

**Errores:** (igual que PUT)

---

### DELETE /graduation-options/:id

Eliminar opción de titulación.

**Response 200:**

```json
{
  "message": "Opcion de titulacion eliminada exitosamente"
}
```

**Errores:**

- **404**: Opción no encontrada (`GRADUATION_OPTION_NOT_FOUND`)

---

### POST /graduation-options/:id/activate

Activar opción de titulación.

**Response 200:** (opción actualizada)

**Errores:**

- **404**: Opción no encontrada (`GRADUATION_OPTION_NOT_FOUND`)

---

### POST /graduation-options/:id/deactivate

Desactivar opción de titulación.

**Response 200:** (opción actualizada)

**Errores:**

- **404**: Opción no encontrada (`GRADUATION_OPTION_NOT_FOUND`)

---

## 8. Nuevo Ingreso (New Admissions)

### GET /new-admissions

Listar registros de nuevo ingreso.

**Query Parameters:**

- `page`, `limit`: Paginación
- `careerId` (string): Filtrar por carrera
- `generationId` (string): Filtrar por generación
- `activeOnly` (boolean): Solo registros activos
- `search` o `q` (string): Búsqueda en descripción
- `sortBy` (string, default: "createdAt"): `maleCount`, `femaleCount`, `createdAt`, `isActive`
- `sortOrder` (string, default: "desc")

**Response 200:**

```json
{
  "data": [
    {
      "id": "string",
      "generationId": "string",
      "careerId": "string",
      "maleCount": 0,
      "femaleCount": 0,
      "description": "string | null",
      "isActive": true,
      "createdAt": "ISO8601",
      "updatedAt": "ISO8601"
    }
  ],
  "pagination": { ... }
}
```

---

### GET /new-admissions/:id

Obtener detalle de registro de ingreso.

**Errores:**

- **404**: Registro de ingreso no encontrado (`NEW_ADMISSION_NOT_FOUND`)

---

### POST /new-admissions

Crear registro de nuevo ingreso.

**Request Body:**

```json
{
  "generationId": "string",
  "careerId": "string",
  "maleCount": 0,
  "femaleCount": 0,
  "description": "string | null",
  "isActive": true
}
```

**Errores:**

- **400**: Validación fallida (`VALIDATION_ERROR`)
  - `careerId`, `generationId`, `maleCount`, `femaleCount` requeridos
  - `maleCount` y `femaleCount` deben ser >= 0
- **404**: Carrera o generación no encontrada (`CAREER_NOT_FOUND`, `GENERATION_NOT_FOUND`)
- **409**: Duplicado (`DUPLICATE_ERROR`)
  - Ya existe un registro de ingreso para esta combinación carrera + generación

**Restricciones:**

- Combinación `careerId + generationId` única
- `maleCount` y `femaleCount` >= 0
- `careerId` y `generationId` deben existir

---

### PUT /new-admissions/:id

Actualizar registro de ingreso completo.

**Errores:**

- **400**: Validación fallida
- **404**: Registro de ingreso, carrera o generación no encontrada
- **409**: Duplicado (si cambia carrera o generación)

---

### PATCH /new-admissions/:id

Actualización parcial de registro de ingreso.

**Errores:** (igual que PUT)

---

### DELETE /new-admissions/:id

Eliminar registro de ingreso.

**Response 200:**

```json
{
  "message": "Registro eliminado exitosamente"
}
```

**Errores:**

- **404**: Registro de ingreso no encontrado (`NEW_ADMISSION_NOT_FOUND`)

---

### POST /new-admissions/:id/activate

Activar registro de ingreso.

**Response 200:** (registro actualizado)

**Errores:**

- **404**: Registro de ingreso no encontrado (`NEW_ADMISSION_NOT_FOUND`)

---

### POST /new-admissions/:id/deactivate

Desactivar registro de ingreso.

**Response 200:** (registro actualizado)

**Errores:**

- **404**: Registro de ingreso no encontrado (`NEW_ADMISSION_NOT_FOUND`)

---

## 9. Ingreso y Egreso

### GET /ingress-egress

Listar estadísticas de ingreso y egreso por generación y carrera.

**Query Parameters:**

- `page`, `limit`: Paginación
- `careerId` (string): Filtrar por carrera
- `generationId` (string): Filtrar por generación
- `search` o `q` (string): Búsqueda en nombre de carrera o generación
- `sortBy` (string, default: "careerName"): `careerName`, `generationName`, `admissionNumber`, `egressNumber`
- `sortOrder` (string, default: "asc")

**Response 200:**

```json
{
  "data": [
    {
      "id": "string",
      "generationId": "string",
      "careerId": "string",
      "generationName": "string",
      "careerName": "string",
      "admissionNumber": 0,
      "egressNumber": 0
    }
  ],
  "pagination": { ... }
}
```

**Notas:**

- Endpoint de solo lectura (no tiene CRUD)
- `admissionNumber`: Suma de `maleCount + femaleCount` de registros de nuevo ingreso para la combinación generación + carrera
- `egressNumber`: Conteo de estudiantes con `isEgressed = true` para la combinación generación + carrera

---

### GET /ingress-egress/:generationId/:careerId

Obtener estadísticas específicas de una combinación generación + carrera.

**Response 200:**

```json
{
  "id": "string",
  "generationId": "string",
  "careerId": "string",
  "generationName": "string",
  "careerName": "string",
  "admissionNumber": 0,
  "egressNumber": 0
}
```

**Errores:**

- **400**: Parámetros requeridos faltantes (`VALIDATION_ERROR`)
- **404**: Generación o carrera no encontrada (`GENERATION_NOT_FOUND`, `CAREER_NOT_FOUND`)

---

## 10. Campos Capturados

### GET /captured-fields/student/:id

Obtener campos capturados de un estudiante.

**Response 200:**

```json
{
  "id": "string",
  "studentId": "string",
  "processDate": "YYYY-MM-DD",
  "projectName": "string",
  "company": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Errores:**

- **404**: Campos capturados no encontrados (`CAPTURED_FIELDS_NOT_FOUND`)

**Notas:**

- Relación 1:1 con Student (identificado por `studentId`)

---

### POST /captured-fields

Crear campos capturados.

**Request Body:**

```json
{
  "studentId": "string",
  "processDate": "YYYY-MM-DD",
  "projectName": "string",
  "company": "string"
}
```

**Response 201:** (campos capturados creados)

**Errores:**

- **400**: Validación fallida (`VALIDATION_ERROR`, `INVALID_STUDENT_STATUS`, `STUDENT_ALREADY_GRADUATED`)
  - `studentId`, `processDate`, `projectName`, `company` requeridos
  - Estudiante debe estar ACTIVO
  - Estudiante no debe estar titulado
- **404**: Estudiante no encontrado (`STUDENT_NOT_FOUND`)
- **409**: Duplicado (`DUPLICATE_ERROR`)
  - Ya existe un registro para este estudiante

**Restricciones:**

- Solo un registro por estudiante
- Estudiante debe tener `status = ACTIVO`
- Estudiante no debe tener `Graduation` con `isGraduated = true`

---

### PUT /captured-fields/student/:id

Actualizar campos capturados por studentId.

**Request Body:**

```json
{
  "studentId": "string",
  "processDate": "YYYY-MM-DD",
  "projectName": "string",
  "company": "string"
}
```

**Response 200:** (campos capturados actualizados)

**Errores:**

- **400**: Validación fallida
  - `projectName` y `company` no pueden estar vacíos
  - Estudiante debe estar ACTIVO
  - Estudiante no debe estar titulado
- **404**: Campos capturados o estudiante no encontrado
- **409**: Duplicado (si cambia studentId)

---

### PATCH /captured-fields/student/:id

Actualización parcial de campos capturados.

**Errores:** (igual que PUT)

---

### DELETE /captured-fields/student/:id

Eliminar campos capturados por studentId.

**Response 200:**

```json
{
  "message": "Campos capturados eliminados exitosamente"
}
```

**Errores:**

- **404**: Campos capturados no encontrados (`CAPTURED_FIELDS_NOT_FOUND`)

---

## 11. Titulaciones

### GET /graduations/student/:id

Obtener titulación de un estudiante.

**Response 200:**

```json
{
  "id": "string",
  "studentId": "string",
  "graduationOptionId": "string | null",
  "graduationDate": "ISO8601",
  "isGraduated": false,
  "president": "string",
  "secretary": "string",
  "vocal": "string",
  "substituteVocal": "string",
  "notes": "string | null",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Errores:**

- **404**: Titulación no encontrada (`GRADUATION_NOT_FOUND`)

**Notas:**

- Relación 1:1 con Student (identificado por `studentId`)

---

### POST /graduations

Crear titulación.

**Request Body:**

```json
{
  "studentId": "string",
  "graduationOptionId": "string | null",
  "graduationDate": "ISO8601",
  "isGraduated": false,
  "president": "string",
  "secretary": "string",
  "vocal": "string",
  "substituteVocal": "string",
  "notes": "string | null"
}
```

**Response 201:** (titulación creada)

**Errores:**

- **400**: Validación fallida (`VALIDATION_ERROR`, `INVALID_STUDENT_STATUS`, `INVALID_GRADUATION_DATE`)
  - `studentId`, `graduationDate`, `president`, `secretary`, `vocal`, `substituteVocal` requeridos
  - Si `isGraduated = true`:
    - Estudiante debe estar egresado (`isEgressed = true`)
    - Estudiante debe estar ACTIVO
    - `graduationDate` debe ser <= fecha actual
- **404**: Estudiante o opción de titulación no encontrada (`STUDENT_NOT_FOUND`, `GRADUATION_OPTION_NOT_FOUND`)
- **409**: Duplicado (`DUPLICATE_ERROR`)
  - Ya existe una titulación para este estudiante

**Restricciones:**

- Solo un registro por estudiante
- Si `isGraduated = true`:
  - Estudiante debe tener `isEgressed = true`
  - Estudiante debe tener `status = ACTIVO`
  - `graduationDate <= fecha actual`

---

### PUT /graduations/student/:id

Actualizar titulación por studentId.

**Request Body:**

```json
{
  "studentId": "string",
  "graduationOptionId": "string | null",
  "graduationDate": "ISO8601",
  "isGraduated": false,
  "president": "string",
  "secretary": "string",
  "vocal": "string",
  "substituteVocal": "string",
  "notes": "string | null"
}
```

**Response 200:** (titulación actualizada)

**Errores:**

- **400**: Validación fallida
  - `president`, `secretary`, `vocal`, `substituteVocal` no pueden estar vacíos
  - Si `isGraduated = true`: validaciones iguales que POST
- **404**: Titulación, estudiante o opción no encontrada
- **409**: Duplicado (si cambia studentId)

---

### PATCH /graduations/student/:id

Actualización parcial de titulación.

**Errores:** (igual que PUT)

---

### DELETE /graduations/student/:id

Eliminar titulación por studentId.

**Response 200:**

```json
{
  "message": "Titulación eliminada exitosamente"
}
```

**Errores:**

- **404**: Titulación no encontrada (`GRADUATION_NOT_FOUND`)

---

### POST /graduations/:studentId/graduate

Marcar estudiante como titulado.

**Response 200:** (titulación actualizada con `isGraduated: true`)

**Errores:**

- **400**: Validación fallida (`INVALID_STUDENT_STATUS`, `INVALID_GRADUATION_DATE`)
  - Estudiante debe estar egresado
  - Estudiante debe estar ACTIVO
  - `graduationDate` debe ser <= fecha actual
- **404**: Titulación o estudiante no encontrada (`GRADUATION_NOT_FOUND`, `STUDENT_NOT_FOUND`)

**Restricciones:**

- Estudiante debe tener `isEgressed = true`
- Estudiante debe tener `status = ACTIVO`
- `graduationDate <= fecha actual`

---

### POST /graduations/:studentId/ungraduate

Desmarcar estudiante como titulado.

**Response 200:** (titulación actualizada con `isGraduated: false`)

**Errores:**

- **404**: Titulación no encontrada (`GRADUATION_NOT_FOUND`)

---

## 12. Dashboard

### GET /dashboard

Obtener datos consolidados del dashboard con estadísticas y visualizaciones.

**Headers:**

```
Authorization: Bearer <token>
```

**Response 200:**

```json
{
  "stats": {
    "totalStudents": 0,
    "activeStudents": 0,
    "inProgress": 0,
    "scheduled": 0,
    "graduatedStudents": 0,
    "egressedStudents": 0,
    "totalAdmissions": 0,
    "totalEgresses": 0,
    "egressRate": 0.0,
    "graduationRate": 0.0
  },
  "ingressEgressByGeneration": [
    {
      "generation": "string",
      "generationId": "string",
      "admissions": 0,
      "egresses": 0
    }
  ],
  "statusDistribution": [
    {
      "name": "string",
      "value": 0
    }
  ],
  "studentsByCareer": [
    {
      "career": "string",
      "careerId": "string",
      "students": 0
    }
  ],
  "recentStudents": [
    {
      "id": "string",
      "fullName": "string",
      "career": "string",
      "careerId": "string",
      "createdAt": "ISO8601"
    }
  ]
}
```

**Descripción de Campos:**

**stats:**

- `totalStudents`: Número total de estudiantes registrados en el sistema
- `activeStudents`: Número de estudiantes con `status = ACTIVO`
- `inProgress`: Estudiantes en proceso de titulación (activos, no titulados, con datos incompletos)
- `scheduled`: Estudiantes programados para titulación (activos, no titulados, con datos completos)
- `graduatedStudents`: Estudiantes titulados (`isGraduated = true`)
- `egressedStudents`: Estudiantes egresados (`isEgressed = true`)
- `totalAdmissions`: Suma total de alumnos registrados (`maleCount + femaleCount` de todos los registros de nuevo ingreso)
- `totalEgresses`: Total de estudiantes egresados (igual a `egressedStudents`)
- `egressRate`: Tasa de egreso calculada como `(totalEgresses / totalAdmissions) * 100` (redondeado a 2 decimales)
- `graduationRate`: Tasa de titulación calculada como `(graduatedStudents / totalEgresses) * 100` (redondeado a 2 decimales)

**ingressEgressByGeneration:**

- Array de objetos con estadísticas de ingreso y egreso por generación
- Muestra las 6 generaciones más recientes (ordenadas por año de inicio ascendente)
- `generation`: Etiqueta de la generación en formato "startYear-endYear" (ej: "2020-2024")
- `generationId`: ID de la generación
- `admissions`: Suma de `maleCount + femaleCount` de registros de nuevo ingreso para esta generación
- `egresses`: Conteo de estudiantes egresados de esta generación

**statusDistribution:**

- Array de objetos con distribución de Ingreso, Egreso y Titulación
- `name`: Nombre de la categoría ("Ingreso", "Egreso", "Titulados")
- `value`: Valor numérico de la categoría
- Solo incluye categorías con `value > 0`

**studentsByCareer:**

- Array de objetos con las top 6 carreras por número de estudiantes
- Ordenado descendente por número de estudiantes
- `career`: Nombre de la carrera
- `careerId`: ID de la carrera
- `students`: Número de estudiantes en esa carrera

**recentStudents:**

- Array de los 5 estudiantes más recientemente agregados
- Ordenado por `createdAt` descendente
- `id`: ID del estudiante
- `fullName`: Nombre completo del estudiante
- `career`: Nombre de la carrera
- `careerId`: ID de la carrera
- `createdAt`: Fecha de creación en formato ISO8601

**Lógica de Cálculo:**

**Estudiantes en Proceso (`inProgress`):**
Un estudiante está en proceso si:

- `status = ACTIVO`
- NO está titulado (no tiene `Graduation` con `isGraduated = true`)
- Tiene datos incompletos: falta información en `CapturedFields` O en `Graduation` (pero no en ambas)

**Estudiantes Programados (`scheduled`):**
Un estudiante está programado si:

- `status = ACTIVO`
- NO está titulado (`isGraduated = false` o no tiene `Graduation`)
- Tiene datos completos en AMBAS tablas: `CapturedFields` Y `Graduation`

**Tasas:**

- `egressRate`: Si `totalAdmissions = 0`, entonces `egressRate = 0`
- `graduationRate`: Si `totalEgresses = 0`, entonces `graduationRate = 0`

**Errores:**

- **401**: No autenticado (`UNAUTHORIZED`)

**Notas:**

- Endpoint de solo lectura (no tiene operaciones de escritura)
- Todos los datos se calculan dinámicamente desde las tablas base
- Las tasas se redondean a 2 decimales
- Si no hay datos, se devuelven valores en 0 o arrays vacíos
- Las visualizaciones limitan elementos para mantener legibilidad:
  - Generaciones: máximo 6
  - Carreras: máximo 6
  - Estudiantes recientes: máximo 5

---

## Notas Finales

### Formatos de Fecha

- **ISO8601**: Fecha y hora completa (ej: `2024-01-15T10:30:00.000Z`)
- **YYYY-MM-DD**: Solo fecha (ej: `2024-01-15`)

### Delays Simulados (en mocks)

Los mocks incluyen delays simulados para simular latencia de red:

- **GET**: 200-300ms
- **PUT/PATCH**: 300-400ms
- **POST**: 400-500ms
- **DELETE**: 300ms

### Rate Limiting

Aplicado en endpoints de autenticación:

- `/auth/login`: Máximo de intentos por tiempo determinado
- `/auth/refresh`: Máximo de intentos por tiempo determinado

### Validaciones Comunes

1. **Campos requeridos**: Se validan en todos los endpoints de creación
2. **Duplicados**: Se verifican campos únicos antes de crear/actualizar
3. **Relaciones**: Foreign keys deben existir antes de crear/actualizar
4. **Estados**: Se validan transiciones de estado según reglas de negocio
5. **Fechas**: Se validan rangos y comparaciones de fechas

### Códigos de Error Estándar

- `VALIDATION_ERROR`: Error de validación general
- `NOT_FOUND`: Recurso no encontrado (varía según recurso)
- `DUPLICATE_ERROR`: Recurso duplicado
- `UNAUTHORIZED`: No autenticado
- `FORBIDDEN`: Sin permisos
- `INVALID_STATUS_TRANSITION`: Transición de estado inválida
- `TOO_MANY_REQUESTS`: Rate limiting

### Paginación Estándar

Todos los endpoints de lista incluyen:

- `total`: Total de registros
- `limit`: Items por página
- `totalPages`: Total de páginas
- `page`: Página actual
- `pagingCounter`: Número del primer item de la página actual
- `hasPrevPage`: Boolean
- `hasNextPage`: Boolean
- `prevPage`: Número de página anterior o null
- `nextPage`: Número de página siguiente o null

---

**Última actualización**: Basado en mocks implementados con MSW (Mock Service Worker)
