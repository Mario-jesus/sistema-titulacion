# Requerimientos Funcionales - Sistema de Titulación

## 1. Introducción

### 1.1. Propósito

Este documento describe los requerimientos funcionales del Sistema de Titulación, una aplicación web para gestionar el proceso de titulación de estudiantes, incluyendo el control de ingreso, egreso, nuevo ingreso, opciones de titulación y el seguimiento del proceso de graduación.

### 1.2. Alcance

El sistema permite:

- Gestionar usuarios del sistema (administradores y personal)
- Gestionar entidades maestras (carreras, generaciones, modalidades, opciones de titulación)
- Gestionar registros de nuevo ingreso por carrera y generación
- Gestionar estudiantes y su proceso de titulación
- Capturar información del proceso de titulación
- Registrar titulaciones y comités
- Consultar estadísticas de ingreso y egreso

### 1.3. Usuarios del Sistema

- **Administrador (ADMIN)**: Acceso completo al sistema
- **Personal (STAFF)**: Acceso a funcionalidades operativas (gestión de estudiantes, titulaciones)

---

## 2. Módulos Funcionales

### 2.1. Autenticación y Autorización

#### 2.1.1. Login

**Descripción:** Los usuarios deben poder iniciar sesión en el sistema.

**Requerimientos:**

- El sistema debe permitir iniciar sesión con email y contraseña
- El sistema debe validar las credenciales antes de permitir el acceso
- El sistema debe generar tokens de acceso (JWT) y refresh tokens
- El sistema debe invalidar refresh tokens previos al iniciar una nueva sesión (rotación de tokens)
- El sistema debe implementar rate limiting para prevenir ataques de fuerza bruta
- El sistema debe validar que la cuenta esté activa antes de permitir el acceso

**Restricciones:**

- Las credenciales inválidas deben mostrar error genérico (no revelar si el email existe)
- Un usuario con cuenta desactivada no puede iniciar sesión
- Máximo de intentos fallidos permitidos por tiempo determinado (rate limiting)

**Validaciones:**

- Email: formato válido, no vacío
- Contraseña: no vacía
- Cuenta activa: `isActive = true`

**Comportamiento:**

- `lastLogin` se actualiza automáticamente a la fecha y hora actual cuando el usuario inicia sesión exitosamente

#### 2.1.2. Refresh Token

**Descripción:** Los usuarios deben poder refrescar su token de acceso.

**Requerimientos:**

- El sistema debe permitir refrescar el token usando un refresh token válido
- El sistema debe invalidar el refresh token usado (rotación)
- El sistema debe generar un nuevo par de tokens (access + refresh)
- El sistema debe validar que el refresh token sea el último válido para el usuario

**Restricciones:**

- El refresh token usado se invalida automáticamente
- Un refresh token solo puede usarse una vez
- La cuenta debe estar activa para refrescar tokens

**Validaciones:**

- Refresh token válido y no expirado
- Refresh token debe ser el último válido para el usuario (previene replay attacks)
- Cuenta activa: `isActive = true`

#### 2.1.3. Logout

**Descripción:** Los usuarios deben poder cerrar sesión.

**Requerimientos:**

- El sistema debe invalidar el refresh token del usuario al cerrar sesión
- El sistema debe permitir cerrar sesión incluso si el token de acceso expiró

**Restricciones:**

- El logout puede ejecutarse sin token válido (permite logout después de expiración)
- Se invalida el refresh token si se proporciona en el body

#### 2.1.4. Consultar Usuario Actual

**Descripción:** Los usuarios deben poder consultar su propia información.

**Requerimientos:**

- El sistema debe retornar la información del usuario autenticado
- El sistema debe validar el token de acceso

**Validaciones:**

- Token válido y no expirado

---

### 2.2. Gestión de Usuarios

#### 2.2.1. Listar Usuarios

**Descripción:** Los administradores deben poder listar usuarios del sistema.

**Requerimientos:**

- Solo administradores pueden ver la lista de usuarios
- El sistema debe permitir filtrar por estado activo/inactivo
- El sistema debe permitir búsqueda por username o email
- El sistema debe permitir ordenar por múltiples campos
- El sistema debe implementar paginación

**Permisos:**

- Solo rol ADMIN

**Filtros:**

- `activeOnly`: boolean - Solo usuarios activos
- `search`: string - Búsqueda en username o email

**Ordenamiento:**

- Campos: `username`, `email`, `role`, `createdAt`, `lastLogin`, `isActive`
- Orden: `asc` | `desc`

#### 2.2.2. Crear Usuario

**Descripción:** Los administradores deben poder crear nuevos usuarios.

**Requerimientos:**

- Solo administradores pueden crear usuarios
- El sistema debe validar que username y email sean únicos
- El sistema debe validar formato de email
- El sistema debe validar formato de username (alfanumérico, sin espacios)
- El sistema debe validar longitud mínima de contraseña
- El sistema debe asignar una contraseña inicial

**Permisos:**

- Solo rol ADMIN

**Validaciones:**

- `username`: requerido, no vacío, alfanumérico (solo letras y números), sin espacios, único
- `email`: requerido, formato válido, único, se normaliza a lowercase
- `password`: requerido, mínimo 6 caracteres
- `role`: ADMIN | STAFF (default: STAFF)
- `isActive`: boolean (default: true)

**Restricciones:**

- Username único en todo el sistema
- Username debe ser alfanumérico (solo letras [a-zA-Z] y números [0-9])
- Username no puede contener espacios
- Email único en todo el sistema
- Password mínimo 6 caracteres
- `lastLogin` se inicializa como `null` al crear un usuario
- `lastLogin` se actualiza automáticamente cuando el usuario inicia sesión
- `lastLogin` no puede ser establecido manualmente

#### 2.2.3. Actualizar Usuario

**Descripción:** Los administradores deben poder actualizar usuarios. Los usuarios deben poder actualizar su propio perfil.

**Requerimientos:**

- Los administradores pueden actualizar cualquier usuario
- Los usuarios pueden actualizar su propio perfil (limitado a username, email, avatar)
- El sistema debe validar unicidad de username y email
- El sistema debe validar formato de email
- El sistema debe validar formato de username (alfanumérico, sin espacios)

**Permisos:**

- ADMIN: puede actualizar cualquier usuario (todos los campos excepto password y avatar)
- Usuario: puede actualizar solo su propio perfil (username, email, avatar)
- El campo `avatar` solo es visible/actualizable por el usuario propietario en su perfil propio (`PATCH /users/me`)
- Los administradores NO pueden ver ni actualizar el campo `avatar` de otros usuarios

**Validaciones:**

- `username`: no vacío si se proporciona, alfanumérico (solo letras y números), sin espacios, único si cambia
- `email`: formato válido si se proporciona, único si cambia
- Los usuarios no pueden cambiar su `role` ni `isActive`
- Los administradores no pueden actualizar el campo `avatar` de otros usuarios

**Restricciones:**

- Un usuario no puede cambiar su propio rol
- Un usuario no puede cambiar su propio estado activo/inactivo
- El campo `avatar` no se incluye en las respuestas de `GET /users`, `GET /users/:id`, `POST /users`, `PUT /users/:id`, `PATCH /users/:id`
- El campo `avatar` solo se incluye en `PATCH /users/me`, `GET /auth/me`, y `POST /auth/login`

#### 2.2.4. Cambiar Contraseña

**Descripción:** Los usuarios deben poder cambiar su contraseña. Los administradores deben poder cambiar la contraseña de cualquier usuario.

**Requerimientos:**

- Los usuarios deben proporcionar su contraseña actual
- Los administradores pueden cambiar cualquier contraseña sin contraseña actual
- El sistema debe validar que la nueva contraseña sea diferente a la actual
- El sistema debe validar longitud mínima de contraseña

**Permisos:**

- Usuario: puede cambiar su propia contraseña (requiere contraseña actual)
- ADMIN: puede cambiar cualquier contraseña (no requiere contraseña actual)

**Validaciones:**

- `currentPassword`: requerido para usuarios (no requerido para admin)
- `newPassword`: requerido, mínimo 6 caracteres, diferente a la actual
- Si es propio usuario: contraseña actual debe ser correcta

**Restricciones:**

- Nueva contraseña debe ser diferente a la actual
- Mínimo 6 caracteres

#### 2.2.5. Activar/Desactivar Usuario

**Descripción:** Los administradores deben poder activar o desactivar usuarios.

**Requerimientos:**

- Solo administradores pueden activar/desactivar usuarios
- Un administrador no puede desactivarse a sí mismo
- Un usuario desactivado no puede iniciar sesión

**Permisos:**

- Solo rol ADMIN

**Restricciones:**

- Un administrador no puede desactivarse a sí mismo
- Un administrador no puede eliminarse a sí mismo

#### 2.2.6. Eliminar Usuario

**Descripción:** Los administradores deben poder eliminar usuarios.

**Requerimientos:**

- Solo administradores pueden eliminar usuarios
- Un administrador no puede eliminarse a sí mismo

**Permisos:**

- Solo rol ADMIN

**Restricciones:**

- Un administrador no puede eliminarse a sí mismo

---

### 2.3. Dashboard

#### 2.3.1. Descripción

El dashboard proporciona una vista general consolidada de las estadísticas y métricas clave del sistema de titulación. Permite visualizar información agregada sobre estudiantes, ingresos, egresos, titulaciones y distribuciones por generación y carrera.

#### 2.3.2. Métricas Principales

El dashboard muestra las siguientes métricas en tarjetas de resumen:

**Primera Fila de Métricas:**

- **Total Estudiantes**: Número total de estudiantes registrados en el sistema
  - Subtítulo: Muestra el número de estudiantes activos
- **En Proceso**: Estudiantes que requieren atención en su proceso de titulación
  - Subtítulo: "Requieren atención"
  - Cálculo: Estudiantes con `status = ACTIVO`, no titulados, y que tienen datos incompletos (faltan datos en `CapturedFields` O `Graduation`, pero no en ambas)
- **Programados**: Estudiantes listos para ser titulados
  - Subtítulo: "Listos para titular"
  - Cálculo: Estudiantes con `status = ACTIVO`, no titulados, y que tienen datos completos en AMBAS tablas (`CapturedFields` Y `Graduation`)
- **Titulados**: Estudiantes que han completado el proceso de titulación
  - Subtítulo: Muestra la tasa de titulación como porcentaje
  - Cálculo: Estudiantes con `Graduation` donde `isGraduated = true`

**Segunda Fila de Métricas:**

- **Egresados**: Total de estudiantes egresados
  - Subtítulo: "Estudiantes egresados"
  - Cálculo: Estudiantes con `isEgressed = true`
- **Total Ingresos**: Total de alumnos registrados (nuevo ingreso)
  - Subtítulo: "Alumnos registrados"
  - Cálculo: Suma de `maleCount + femaleCount` de todos los registros de nuevo ingreso (`NewAdmission`)
- **Tasa de Egresos**: Porcentaje de egresos sobre ingresos
  - Subtítulo: "Egresados / Ingresos"
  - Cálculo: `(totalEgresses / totalAdmissions) * 100`
- **Tasa de Titulación**: Porcentaje de titulados sobre egresados
  - Subtítulo: "Titulados / Egresados"
  - Cálculo: `(graduatedStudents / totalEgresses) * 100`

#### 2.3.3. Visualizaciones

**Gráfica de Ingreso vs Egreso por Generación:**

- Muestra un gráfico de barras comparando ingresos y egresos por generación
- Muestra las 6 generaciones más recientes (ordenadas por año de inicio ascendente)
- Cada barra muestra:
  - `admissions`: Suma de `maleCount + femaleCount` de registros de nuevo ingreso para esa generación
  - `egresses`: Conteo de estudiantes egresados de esa generación
- Formato de etiqueta: "startYear-endYear" (ej: "2020-2024")

**Gráfica de Distribución: Ingreso, Egreso y Titulación:**

- Muestra un gráfico de pastel con la distribución de:
  - **Ingreso**: Total de alumnos de nuevo ingreso
  - **Egreso**: Total de estudiantes egresados
  - **Titulados**: Total de estudiantes titulados
- Incluye porcentajes y valores absolutos
- Solo muestra categorías con valor > 0

**Gráfica de Estudiantes por Carrera (Top 6):**

- Muestra un gráfico de barras horizontales con las 6 carreras con más estudiantes
- Ordenado por número de estudiantes descendente
- Muestra el nombre de la carrera y el número de estudiantes

**Tabla de Últimos Estudiantes Agregados:**

- Muestra los 5 estudiantes más recientemente agregados al sistema
- Ordenado por `createdAt` descendente
- Columnas:
  - **Estudiante**: Nombre completo (firstName + paternalLastName + maternalLastName)
  - **Carrera**: Nombre de la carrera
  - **Fecha**: Fecha de creación formateada (formato localizado)

#### 2.3.4. Cálculos y Lógica de Negocio

**Estudiantes en Proceso:**
Un estudiante está "en proceso" si cumple TODAS las condiciones:

1. `status = ACTIVO`
2. NO está titulado (no tiene `Graduation` con `isGraduated = true`)
3. Tiene datos incompletos: falta información en `CapturedFields` O en `Graduation` (pero no en ambas)
   - Si tiene datos en ambas tablas, NO es un estudiante en proceso
   - Si no tiene datos en ninguna tabla, SÍ es un estudiante en proceso
   - Si tiene datos solo en una tabla, SÍ es un estudiante en proceso

**Estudiantes Programados:**
Un estudiante está "programado" si cumple TODAS las condiciones:

1. `status = ACTIVO`
2. NO está titulado (`isGraduated = false` o no tiene `Graduation`)
3. Tiene datos completos en AMBAS tablas:
   - Tiene registro en `CapturedFields`
   - Tiene registro en `Graduation`

**Tasas de Rendimiento:**

- **Tasa de Egreso**: `(egresados / ingresos) * 100`
  - Si no hay ingresos, la tasa es 0
- **Tasa de Titulación**: `(titulados / egresados) * 100`
  - Si no hay egresados, la tasa es 0

**Ingreso vs Egreso por Generación:**

- Se agrupa por generación
- Para cada generación:
  - **Ingresos**: Suma de `maleCount + femaleCount` de todos los registros de nuevo ingreso donde `generationId` coincide
  - **Egresos**: Conteo de estudiantes donde `generationId` coincide y `isEgressed = true`
- Se ordenan por año de inicio ascendente
- Se muestran solo las 6 generaciones más recientes

**Estudiantes por Carrera:**

- Se agrupa por `careerId`
- Se cuenta el número de estudiantes por carrera
- Se ordena descendente por número de estudiantes
- Se muestran solo las top 6 carreras

#### 2.3.5. Restricciones

- El dashboard es de solo lectura (no permite modificaciones)
- Todos los datos se calculan dinámicamente desde las tablas base
- Las tasas se redondean a 2 decimales
- Si no hay datos, se muestran valores en 0
- Las visualizaciones limitan la cantidad de elementos mostrados para mantener la legibilidad:
  - Generaciones: máximo 6
  - Carreras: máximo 6
  - Estudiantes recientes: máximo 5

#### 2.3.6. Permisos

- **ADMIN**: Acceso completo al dashboard
- **STAFF**: Acceso completo al dashboard

**Nota**: Todos los usuarios autenticados pueden acceder al dashboard.

---

### 2.4. Gestión de Modalidades

#### 2.4.1. Definición

Una modalidad es una categoría que agrupa carreras (ej: "Presencial", "Semipresencial", "En línea").

#### 2.4.2. CRUD de Modalidades

**Campos:**

- `id`: Identificador único
- `name`: Nombre de la modalidad (requerido, único)
- `description`: Descripción opcional
- `isActive`: Estado activo/inactivo (boolean)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

**Validaciones:**

- `name`: requerido, no vacío, único en el sistema
- `description`: opcional, puede ser null

**Restricciones:**

- Nombre único en todo el sistema
- No se puede eliminar una modalidad si tiene carreras asociadas (validar en backend)

**Operaciones:**

- Listar: paginado, filtro por activos, búsqueda por nombre, ordenamiento
- Crear: requiere nombre único
- Actualizar: validar nombre único si cambia
- Eliminar: validar que no tenga carreras asociadas
- Activar/Desactivar: cambiar estado `isActive`

---

### 2.5. Gestión de Carreras

#### 2.5.1. Definición

Una carrera representa un programa académico que pertenece a una modalidad.

#### 2.5.2. CRUD de Carreras

**Campos:**

- `id`: Identificador único
- `name`: Nombre completo de la carrera (requerido, único)
- `shortName`: Nombre corto o abreviación (requerido, único)
- `modalityId`: ID de la modalidad (requerido, foreign key)
- `modality`: Objeto de modalidad (populado automáticamente)
- `description`: Descripción opcional
- `isActive`: Estado activo/inactivo (boolean)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

**Validaciones:**

- `name`: requerido, no vacío, único en el sistema
- `shortName`: requerido, no vacío, único en el sistema
- `modalityId`: requerido, debe existir en la tabla de modalidades
- `description`: opcional, puede ser null

**Restricciones:**

- Nombre único en todo el sistema
- Nombre corto único en todo el sistema
- `modalityId` debe referenciar una modalidad existente
- No se puede eliminar una carrera si tiene estudiantes o registros de nuevo ingreso asociados (validar en backend)

**Operaciones:**

- Listar: paginado, filtro por activos, búsqueda en nombre y nombre corto, ordenamiento
- Crear: requiere nombre, nombre corto y modalidad válida
- Actualizar: validar nombre y nombre corto únicos si cambian
- Eliminar: validar que no tenga estudiantes ni registros de nuevo ingreso asociados
- Activar/Desactivar: cambiar estado `isActive`

---

### 2.6. Gestión de Generaciones

#### 2.6.1. Definición

Una generación representa un periodo académico con fechas de inicio y fin.

#### 2.6.2. CRUD de Generaciones

**Campos:**

- `id`: Identificador único
- `name`: Nombre de la generación (puede ser null, pero si se proporciona debe ser único)
- `startYear`: Fecha de inicio (requerido, tipo Date)
- `endYear`: Fecha de fin (requerido, tipo Date)
- `description`: Descripción opcional
- `isActive`: Estado activo/inactivo (boolean)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

**Validaciones:**

- `name`: opcional, pero si se proporciona debe ser único y no vacío
- `startYear`: requerido, tipo Date
- `endYear`: requerido, tipo Date
- `startYear < endYear`: la fecha de inicio debe ser anterior a la fecha de fin

**Restricciones:**

- Si se proporciona nombre, debe ser único en el sistema
- `startYear` debe ser anterior a `endYear`
- No se puede eliminar una generación si tiene estudiantes o registros de nuevo ingreso asociados (validar en backend)

**Operaciones:**

- Listar: paginado, filtro por activos, búsqueda por nombre, ordenamiento (default: startYear desc)
- Crear: requiere nombre, startYear, endYear con validación de fechas
- Actualizar: validar fechas y nombre único si cambia
- Eliminar: validar que no tenga estudiantes ni registros de nuevo ingreso asociados
- Activar/Desactivar: cambiar estado `isActive`

---

### 2.7. Gestión de Opciones de Titulación

#### 2.7.1. Definición

Una opción de titulación representa las diferentes formas en que un estudiante puede titularse (ej: "Tesis", "Examen General", "Experiencia Profesional").

#### 2.7.2. CRUD de Opciones de Titulación

**Campos:**

- `id`: Identificador único
- `name`: Nombre de la opción (requerido, único)
- `description`: Descripción opcional
- `isActive`: Estado activo/inactivo (boolean)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

**Validaciones:**

- `name`: requerido, no vacío, único en el sistema
- `description`: opcional, puede ser null

**Restricciones:**

- Nombre único en todo el sistema
- No se puede eliminar una opción si tiene titulaciones asociadas (validar en backend)

**Operaciones:**

- Listar: paginado, filtro por activos, búsqueda por nombre, ordenamiento
- Crear: requiere nombre único
- Actualizar: validar nombre único si cambia
- Eliminar: validar que no tenga titulaciones asociadas
- Activar/Desactivar: cambiar estado `isActive`

---

### 2.8. Gestión de Nuevo Ingreso

#### 2.8.1. Definición

Un registro de nuevo ingreso representa la cantidad de alumnos (hombres y mujeres) registrados para una combinación específica de carrera y generación.

#### 2.8.2. CRUD de Nuevo Ingreso

**Campos:**

- `id`: Identificador único
- `generationId`: ID de la generación (requerido, foreign key)
- `careerId`: ID de la carrera (requerido, foreign key)
- `maleCount`: Número de alumnos hombres (requerido, número >= 0)
- `femaleCount`: Número de alumnas mujeres (requerido, número >= 0)
- `description`: Descripción opcional
- `isActive`: Estado activo/inactivo (boolean)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

**Validaciones:**

- `generationId`: requerido, debe existir en la tabla de generaciones
- `careerId`: requerido, debe existir en la tabla de carreras
- `maleCount`: requerido, número entero >= 0
- `femaleCount`: requerido, número entero >= 0
- `description`: opcional, puede ser null

**Restricciones:**

- Combinación `careerId + generationId` única (no puede haber dos registros para la misma carrera y generación)
- `maleCount` y `femaleCount` deben ser >= 0
- `generationId` y `careerId` deben existir
- No se puede eliminar un registro de nuevo ingreso si tiene datos de ingreso asociados (validar en backend)

**Operaciones:**

- Listar: paginado, filtros por carrera, generación, activos, búsqueda en descripción, ordenamiento
- Crear: requiere carrera, generación y conteos (hombres/mujeres), validar unicidad de combinación
- Actualizar: validar unicidad si cambia carrera o generación
- Eliminar: eliminar registro de nuevo ingreso
- Activar/Desactivar: cambiar estado `isActive`

---

### 2.9. Gestión de Estudiantes

#### 2.9.1. Definición

Un estudiante representa a una persona inscrita en una carrera y generación específicas.

#### 2.9.2. Modelo de Datos

**Campos:**

- `id`: Identificador único
- `careerId`: ID de la carrera (requerido, foreign key)
- `generationId`: ID de la generación (requerido, foreign key)
- `controlNumber`: Número de control (requerido, único)
- `firstName`: Nombre(s) (requerido)
- `paternalLastName`: Apellido paterno (requerido)
- `maternalLastName`: Apellido materno (opcional)
- `phoneNumber`: Teléfono (opcional)
- `email`: Email (requerido, único)
- `birthDate`: Fecha de nacimiento (requerido, tipo Date)
- `sex`: Sexo - `MASCULINO` | `FEMENINO` (requerido)
- `isEgressed`: Indica si es egresado (boolean, default: false)
- `status`: Estado - `ACTIVO` | `PAUSADO` | `CANCELADO` (requerido, default: ACTIVO)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

#### 2.9.3. Estados del Estudiante

**Estados posibles:**

- **ACTIVO**: El estudiante está activo en el sistema
- **PAUSADO**: El estudiante está temporalmente pausado
- **CANCELADO**: El estudiante ha sido cancelado (estado final)

**Transiciones de Estado permitidas:**

1. **ACTIVO → PAUSADO**: Permitido

   - Un estudiante activo puede ser pausado

2. **ACTIVO → CANCELADO**: Permitido (con restricciones)

   - Un estudiante activo puede ser cancelado
   - **Restricción**: Un estudiante graduado NO puede ser cancelado
   - **Restricción**: Un estudiante egresado NO puede ser cancelado

3. **PAUSADO → ACTIVO**: Permitido

   - Un estudiante pausado puede ser reactivado

4. **CANCELADO → cualquier estado**: NO permitido
   - Un estudiante cancelado NO puede cambiar su estado (estado final)

**Reglas de Negocio:**

- Un estudiante graduado (`isGraduated = true`) NO puede ser pausado ni cancelado
- Un estudiante egresado (`isEgressed = true`) NO puede ser cancelado
- Un estudiante cancelado NO puede cambiar su estado
- Solo estudiantes ACTIVOS pueden tener procesos de titulación activos

#### 2.9.4. CRUD de Estudiantes

**Validaciones:**

- `careerId`: requerido, debe existir en la tabla de carreras
- `generationId`: requerido, debe existir en la tabla de generaciones
- `controlNumber`: requerido, no vacío, único en el sistema
- `firstName`: requerido, no vacío
- `paternalLastName`: requerido, no vacío
- `maternalLastName`: opcional
- `email`: requerido, formato válido, único en el sistema, se normaliza a lowercase
- `birthDate`: requerido, tipo Date válido
- `sex`: requerido, valor del enum (MASCULINO | FEMENINO)
- `status`: requerido, valor del enum (default: ACTIVO)

**Restricciones:**

- `controlNumber` único en todo el sistema
- `email` único en todo el sistema
- `careerId` y `generationId` deben existir
- No se puede eliminar un estudiante si tiene titulación o campos capturados (validar en backend)

**Operaciones:**

- Listar: paginado, filtros múltiples (carrera, generación, estado, egresado), búsqueda en nombre, apellidos, número de control, email, ordenamiento
- Crear: validar todos los campos requeridos y unicidad
- Actualizar: validar campos y transiciones de estado
- Eliminar: eliminar estudiante (validar que no tenga datos relacionados)
- Cambiar estado: endpoint específico con validación de transiciones

#### 2.9.5. Marcar como Egresado / No Egresado

**Marcar como Egresado:**

- Permite marcar un estudiante como egresado (`isEgressed = true`)
- **Restricción**: No se puede marcar como egresado si ya lo está

**Marcar como No Egresado:**

- Permite desmarcar un estudiante como egresado (`isEgressed = false`)
- **Restricción**: No se puede cambiar a no egresado si el estudiante tiene:
  - Campos capturados (`CapturedFields`)
  - Titulación (`Graduation`)
  - Está en proceso o programado para titulación

#### 2.9.6. Listados Especiales de Estudiantes

**Estudiantes en Proceso:**

- Un estudiante está "en proceso" si:
  - Status es `ACTIVO`
  - NO está titulado (`isGraduated = false` o no tiene `Graduation`)
  - Faltan datos en `CapturedFields` O `Graduation` (no en ambas)
  - Es decir: tiene datos incompletos en al menos una de las dos tablas

**Estudiantes Programados:**

- Un estudiante está "programado" si:
  - Status es `ACTIVO`
  - NO está titulado (`isGraduated = false`)
  - Tiene datos en AMBAS tablas: `CapturedFields` Y `Graduation`
  - Está listo para ser titulado

**Estudiantes Graduados:**

- Un estudiante está "graduado" si:
  - Status es `ACTIVO`
  - Tiene `Graduation` con `isGraduated = true`

---

### 2.10. Gestión de Campos Capturados

#### 2.10.1. Definición

Los campos capturados almacenan información del proyecto o trabajo del estudiante durante el proceso de titulación.

#### 2.10.2. Modelo de Datos

**Campos:**

- `id`: Identificador único
- `studentId`: ID del estudiante (requerido, foreign key, único - relación 1:1)
- `processDate`: Fecha de proceso (requerido, tipo Date)
- `projectName`: Nombre del proyecto (requerido)
- `company`: Nombre de la empresa (requerido)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

**Relación:**

- Relación 1:1 con Student (un estudiante tiene un solo registro de campos capturados)

#### 2.10.3. CRUD de Campos Capturados

**Validaciones:**

- `studentId`: requerido, debe existir en la tabla de estudiantes
- `processDate`: requerido, tipo Date válido
- `projectName`: requerido, no vacío
- `company`: requerido, no vacío

**Restricciones:**

- Solo UN registro por estudiante (relación 1:1)
- Solo se pueden capturar campos para estudiantes con `status = ACTIVO`
- NO se pueden capturar campos para estudiantes ya titulados (`isGraduated = true`)
- El estudiante debe existir antes de crear campos capturados

**Operaciones:**

- Crear: validar que el estudiante esté activo y no titulado, validar unicidad
- Obtener por studentId: obtener campos capturados de un estudiante
- Actualizar por studentId: actualizar campos, validar estado del estudiante
- Eliminar por studentId: eliminar campos capturados

**Reglas de Negocio:**

- Solo estudiantes ACTIVOS pueden tener campos capturados
- No se pueden capturar campos para estudiantes pausados o cancelados
- No se pueden capturar campos para estudiantes ya titulados
- No se pueden modificar campos capturados de estudiantes titulados

---

### 2.11. Gestión de Titulaciones

#### 2.11.1. Definición

Una titulación representa el registro completo del proceso de titulación de un estudiante, incluyendo el comité de titulación y la fecha.

#### 2.11.2. Modelo de Datos

**Campos:**

- `id`: Identificador único
- `studentId`: ID del estudiante (requerido, foreign key, único - relación 1:1)
- `graduationOptionId`: ID de la opción de titulación (opcional, foreign key)
- `graduationDate`: Fecha de titulación (requerido, tipo Date)
- `isGraduated`: Indica si está titulado (boolean, default: false)
- `president`: Presidente del comité (requerido)
- `secretary`: Secretario del comité (requerido)
- `vocal`: Vocal del comité (requerido)
- `substituteVocal`: Vocal suplente del comité (requerido)
- `notes`: Notas adicionales (opcional)
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de última actualización

**Relación:**

- Relación 1:1 con Student (un estudiante tiene una sola titulación)

#### 2.11.3. CRUD de Titulaciones

**Validaciones:**

- `studentId`: requerido, debe existir en la tabla de estudiantes
- `graduationOptionId`: opcional, si se proporciona debe existir en la tabla de opciones de titulación
- `graduationDate`: requerido, tipo Date válido
- `president`: requerido, no vacío
- `secretary`: requerido, no vacío
- `vocal`: requerido, no vacío
- `substituteVocal`: requerido, no vacío
- `notes`: opcional, puede ser null

**Restricciones:**

- Solo UN registro por estudiante (relación 1:1)
- Si `isGraduated = true`:
  - El estudiante debe tener `isEgressed = true` (solo egresados pueden estar titulados)
  - El estudiante debe tener `status = ACTIVO` (no pausado ni cancelado)
  - `graduationDate` debe ser <= fecha actual (no se puede titular en el futuro)
- El estudiante debe existir antes de crear la titulación

**Operaciones:**

- Crear: validar que el estudiante esté egresado y activo si se marca como titulado, validar fecha, validar unicidad
- Obtener por studentId: obtener titulación de un estudiante
- Actualizar por studentId: actualizar titulación, validar todas las restricciones
- Eliminar por studentId: eliminar titulación
- Marcar como titulado: endpoint específico para marcar `isGraduated = true`
- Desmarcar como titulado: endpoint específico para marcar `isGraduated = false`

**Reglas de Negocio:**

- Solo estudiantes EGRESADOS (`isEgressed = true`) pueden estar titulados
- Solo estudiantes ACTIVOS pueden estar titulados (no pausados ni cancelados)
- La fecha de titulación no puede ser futura
- Un estudiante solo puede tener una titulación
- El comité de titulación es obligatorio (president, secretary, vocal, substituteVocal)

#### 2.11.4. Marcar como Titulado / No Titulado

**Marcar como Titulado (`isGraduated = true`):**

- Permite marcar un estudiante como oficialmente titulado
- **Validaciones:**
  - Estudiante debe estar egresado (`isEgressed = true`)
  - Estudiante debe estar activo (`status = ACTIVO`)
  - `graduationDate` debe ser <= fecha actual
- **Restricción**: No se puede marcar como titulado un estudiante que no cumpla las condiciones

**Desmarcar como Titulado (`isGraduated = false`):**

- Permite desmarcar un estudiante como titulado
- No tiene restricciones adicionales

---

### 2.12. Consulta de Ingreso y Egreso

#### 2.12.1. Descripción

Este módulo permite consultar estadísticas de ingreso y egreso de estudiantes agrupadas por generación y carrera.

#### 2.12.2. Cálculo de Estadísticas

**Número de Ingreso (admissionNumber):**

- Se calcula como la suma de `maleCount + femaleCount` de todos los registros de nuevo ingreso (`NewAdmission`) que pertenecen a la combinación generación + carrera
- Si no hay registros de nuevo ingreso para una combinación, el ingreso es 0

**Número de Egreso (egressNumber):**

- Se calcula como el conteo de estudiantes (`Student`) que tienen:
  - `generationId` = generación consultada
  - `careerId` = carrera consultada
  - `isEgressed = true`

#### 2.12.3. Funcionalidades

**Listar Estadísticas:**

- Muestra estadísticas agrupadas por generación y carrera
- Permite filtrar por `generationId` y `careerId`
- Permite búsqueda en nombres de generación y carrera
- Implementa paginación
- Permite ordenamiento por múltiples campos

**Obtener Estadística Específica:**

- Permite obtener estadísticas para una combinación específica de generación y carrera
- Valida que la generación y carrera existan

**Restricciones:**

- Solo lectura (no tiene operaciones CRUD)
- Los datos se calculan dinámicamente desde las tablas de nuevo ingreso y estudiantes
- Si una combinación generación + carrera no tiene registros de nuevo ingreso ni estudiantes egresados, puede no aparecer en los resultados

**Operaciones:**

- Listar: paginado, filtros por generación y carrera, búsqueda, ordenamiento
- Obtener por generación y carrera: obtener estadística específica

---

## 3. Reglas de Negocio Generales

### 3.1. Unicidad de Campos

Los siguientes campos deben ser únicos en todo el sistema:

- Usuarios: `username`, `email`
- Estudiantes: `controlNumber`, `email`
- Carreras: `name`, `shortName`
- Generaciones: `name` (si se proporciona)
- Modalidades: `name`
- Opciones de Titulación: `name`
- Nuevo Ingreso: combinación `careerId + generationId`
- Campos Capturados: `studentId` (relación 1:1)
- Titulaciones: `studentId` (relación 1:1)

### 3.2. Integridad Referencial

- Las foreign keys deben referenciar registros existentes
- No se pueden eliminar registros si tienen relaciones activas (validar en backend)
- Las relaciones principales:
  - Carrera → Modalidad
  - Estudiante → Carrera, Generación
  - Registro de Nuevo Ingreso → Carrera, Generación
  - Campos Capturados → Estudiante (1:1)
  - Titulación → Estudiante (1:1), Opción de Titulación (opcional)

### 3.3. Estados Activo/Inactivo

- Muchas entidades tienen un campo `isActive` (boolean)
- Los registros inactivos pueden seguir existiendo en el sistema pero no deben usarse en operaciones nuevas
- Las entidades con `isActive`:
  - Usuarios
  - Carreras
  - Generaciones
  - Modalidades
  - Opciones de Titulación
  - Registros de nuevo ingreso

### 3.4. Fechas

- **Formatos**:
  - ISO8601 para fechas completas con hora (ej: `2024-01-15T10:30:00.000Z`)
  - YYYY-MM-DD para solo fechas (ej: `2024-01-15`)
- **Validaciones**:
  - `birthDate`: fecha válida, no futura
  - `startYear < endYear`: en generaciones
  - `graduationDate <= fecha actual`: si el estudiante está titulado
  - `processDate`: fecha válida

### 3.5. Paginación

- Todos los endpoints de listado implementan paginación
- Parámetros estándar:
  - `page`: número de página (1-indexed, default: 1)
  - `limit`: items por página (default: 10)
- Respuesta incluye información completa de paginación

### 3.6. Búsqueda y Filtrado

- Los endpoints de listado soportan búsqueda por texto (campo `search` o `q`)
- La búsqueda busca en múltiples campos relevantes según la entidad
- Los filtros son específicos por entidad

### 3.7. Ordenamiento

- Los endpoints de listado soportan ordenamiento
- Parámetros:
  - `sortBy`: campo por el cual ordenar
  - `sortOrder`: `asc` | `desc`
- Los campos válidos para ordenamiento varían por entidad

---

## 4. Permisos y Roles

### 4.1. Roles del Sistema

**ADMIN (Administrador):**

- Acceso completo al sistema
- Puede gestionar usuarios (crear, editar, eliminar, activar/desactivar)
- Puede gestionar todas las entidades maestras
- Puede gestionar estudiantes y titulaciones
- Puede cambiar contraseñas de cualquier usuario
- Puede ver listas de usuarios

**STAFF (Personal):**

- Acceso a funcionalidades operativas
- Puede gestionar entidades maestras (carreras, generaciones, modalidades, opciones de titulación, nuevo ingreso)
- Puede gestionar estudiantes y titulaciones
- Puede gestionar su propio perfil (limitado)
- NO puede gestionar usuarios
- NO puede ver listas de usuarios

### 4.2. Matriz de Permisos

| Funcionalidad                     | ADMIN | STAFF               |
| --------------------------------- | ----- | ------------------- |
| Login                             | ✅    | ✅                  |
| Ver propio perfil                 | ✅    | ✅                  |
| Actualizar propio perfil          | ✅    | ✅                  |
| Cambiar propia contraseña         | ✅    | ✅                  |
| Listar usuarios                   | ✅    | ❌                  |
| Crear usuarios                    | ✅    | ❌                  |
| Editar usuarios                   | ✅    | ❌ (excepto propio) |
| Eliminar usuarios                 | ✅    | ❌                  |
| Activar/Desactivar usuarios       | ✅    | ❌                  |
| Cambiar contraseña de otros       | ✅    | ❌                  |
| Gestión de modalidades            | ✅    | ✅                  |
| Gestión de carreras               | ✅    | ✅                  |
| Gestión de generaciones           | ✅    | ✅                  |
| Gestión de opciones de titulación | ✅    | ✅                  |
| Gestión de nuevo ingreso          | ✅    | ✅                  |
| Gestión de estudiantes            | ✅    | ✅                  |
| Gestión de campos capturados      | ✅    | ✅                  |
| Gestión de titulaciones           | ✅    | ✅                  |
| Consulta de ingreso/egreso        | ✅    | ✅                  |
| Dashboard                         | ✅    | ✅                  |

---

## 5. Validaciones Comunes

### 5.1. Validaciones de Campos

**Texto:**

- Campos requeridos no pueden estar vacíos
- Se eliminan espacios en blanco al inicio y final (trim)
- Emails se normalizan a lowercase

**Números:**

- Números enteros para cantidades (alumnos registrados, etc.)
- Números >= 0 donde aplique

**Fechas:**

- Formato válido de fecha
- Validaciones de rango según contexto

**Emails:**

- Formato válido de email
- Únicos en el sistema (donde aplique)

### 5.2. Validaciones de Relaciones

- Foreign keys deben existir antes de crear/actualizar
- No se pueden eliminar registros con relaciones activas

### 5.3. Validaciones de Estado

- Transiciones de estado deben seguir las reglas definidas
- Estados finales (como CANCELADO) no permiten cambios

---

## 6. Flujos de Usuario Principales

### 6.1. Flujo de Titulación de un Estudiante

1. **Crear Estudiante**

   - Administrador o Staff crea un estudiante con status ACTIVO
   - Se asigna a una carrera y generación

2. **Marcar como Egresado** (opcional, cuando corresponda)

   - Se marca al estudiante como egresado (`isEgressed = true`)

3. **Capturar Campos**

   - Se crean los campos capturados con información del proyecto
   - Estudiante debe estar ACTIVO y no titulado

4. **Crear Titulación**

   - Se crea el registro de titulación con información del comité
   - Estudiante debe estar ACTIVO y egresado
   - Se puede marcar como `isGraduated = false` inicialmente

5. **Marcar como Titulado**
   - Cuando el estudiante completa el proceso, se marca como titulado
   - `isGraduated = true`
   - La fecha de titulación debe ser <= fecha actual

### 6.2. Flujo de Cambio de Estado de Estudiante

1. **ACTIVO → PAUSADO**

   - Se puede pausar un estudiante activo
   - No requiere validaciones adicionales

2. **PAUSADO → ACTIVO**

   - Se puede reactivar un estudiante pausado
   - No requiere validaciones adicionales

3. **ACTIVO → CANCELADO**

   - Se puede cancelar un estudiante activo
   - **Restricción**: No se puede cancelar si está graduado
   - **Restricción**: No se puede cancelar si está egresado

4. **CANCELADO → cualquier estado**
   - NO permitido (estado final)

### 6.3. Flujo de Gestión de Usuario

**Administrador crea usuario:**

1. Admin crea usuario con username, email, password, rol
2. Sistema valida unicidad de username y email
3. Sistema crea usuario y asigna contraseña
4. Usuario puede iniciar sesión

**Usuario actualiza su perfil:**

1. Usuario inicia sesión
2. Usuario accede a su perfil
3. Usuario puede actualizar username, email, avatar
4. Sistema valida unicidad si cambian username/email
5. Usuario NO puede cambiar rol ni estado activo

**Usuario cambia su contraseña:**

1. Usuario proporciona contraseña actual
2. Usuario proporciona nueva contraseña
3. Sistema valida contraseña actual
4. Sistema valida que nueva contraseña sea diferente
5. Sistema actualiza contraseña

---

## 7. Casos de Uso Especiales

### 7.1. Estudiante en Proceso

Un estudiante está "en proceso" cuando:

- Tiene status ACTIVO
- NO está titulado
- Le faltan datos en `CapturedFields` O `Graduation` (no en ambas)

**Uso**: Para identificar estudiantes que están en proceso de completar su información de titulación.

### 7.2. Estudiante Programado

Un estudiante está "programado" cuando:

- Tiene status ACTIVO
- NO está titulado
- Tiene datos completos en AMBAS tablas: `CapturedFields` Y `Graduation`

**Uso**: Para identificar estudiantes que están listos para ser titulados.

### 7.3. Estudiante Graduado

Un estudiante está "graduado" cuando:

- Tiene status ACTIVO
- Tiene `Graduation` con `isGraduated = true`

**Uso**: Para identificar estudiantes que ya completaron el proceso de titulación.

### 7.4. Estadísticas de Ingreso y Egreso

- Se calculan dinámicamente desde las tablas de nuevo ingreso y estudiantes
- Permiten visualizar cuántos estudiantes ingresaron (registros de nuevo ingreso) vs cuántos egresaron por carrera y generación
- Son de solo lectura

---

## 8. Restricciones Técnicas

### 8.1. Autenticación

- Tokens JWT con expiración
- Refresh tokens con rotación
- Rate limiting en endpoints de autenticación

### 8.2. Validaciones

- Validaciones tanto en frontend como backend
- Mensajes de error claros y específicos
- Códigos de error estándar

### 8.3. Paginación

- Máximo de items por página configurable (default: 10)
- Página mínima: 1
- Información completa de paginación en respuestas

### 8.4. Búsqueda

- Búsqueda case-insensitive
- Búsqueda en múltiples campos relevantes
- Trim de espacios en búsquedas

### 8.5. Ordenamiento

- Campos válidos definidos por endpoint
- Orden por defecto definido por endpoint
- Ordenamiento case-insensitive para strings

---

## 9. Consideraciones de Implementación

### 9.1. Backend

- Implementar todas las validaciones descritas
- Implementar todas las restricciones de integridad referencial
- Implementar transacciones donde sea necesario
- Implementar índices en campos únicos y foreign keys
- Implementar soft deletes donde sea apropiado

### 9.2. Frontend

- Validaciones en formularios antes de enviar
- Manejo de errores claro para el usuario
- Confirmaciones para acciones destructivas
- Feedback visual para operaciones asíncronas

### 9.3. Base de Datos

- Índices en campos únicos
- Índices en foreign keys
- Constraints de unicidad
- Constraints de foreign keys
- Constraints de check donde sea apropiado

---

## 10. Glosario

- **Activo/Inactivo**: Estado que indica si un registro está disponible para uso (`isActive`)
- **Egresado**: Estudiante que completó su plan de estudios (`isEgressed = true`)
- **Graduado/Titulado**: Estudiante que completó el proceso de titulación (`isGraduated = true`)
- **En Proceso**: Estudiante activo con información incompleta de titulación
- **Programado**: Estudiante activo con información completa, listo para titularse
- **Comité de Titulación**: Grupo de personas (presidente, secretario, vocal, vocal suplente) que evalúan la titulación
- **Registro de Nuevo Ingreso**: Cantidad de alumnos (hombres y mujeres) registrados para una combinación carrera + generación
- **Modalidad**: Categoría que agrupa carreras (ej: Presencial, En línea)
- **Generación**: Periodo académico con fechas de inicio y fin
- **Opción de Titulación**: Forma en que un estudiante puede titularse (ej: Tesis, Examen General)

---

**Última actualización**: Basado en análisis del código fuente y mocks implementados
