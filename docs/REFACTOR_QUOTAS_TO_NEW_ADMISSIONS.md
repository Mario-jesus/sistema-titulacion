# Refactorización: Quotas → New Admissions

> **Objetivo:** Renombrar completamente el módulo de "Cupos" (Quotas) a "Nuevo Ingreso" (New Admissions) en todo el frontend, mocks y documentación. El módulo NO representa cupos disponibles, sino el **registro de alumnos de nuevo ingreso** que ingresaron en una generación y carrera específica.

---

## Tabla de Contenidos

1. [Glosario de renombramiento](#1-glosario-de-renombramiento)
2. [Paquetes de trabajo independientes](#2-paquetes-de-trabajo-independientes)
3. [WP-1: Entidad (entities)](#wp-1-entidad-entities)
4. [WP-2: Feature completa (features)](#wp-2-feature-completa-features)
5. [WP-3: Página (pages)](#wp-3-página-pages)
6. [WP-4: Shared — Endpoints](#wp-4-shared--endpoints)
7. [WP-5: Widgets — Sidebar](#wp-5-widgets--sidebar)
8. [WP-6: App — Router, Store, Lazy Pages](#wp-6-app--router-store-lazy-pages)
9. [WP-7: Mocks — Data y Handlers](#wp-7-mocks--data-y-handlers)
10. [WP-8: Mocks — Módulos consumidores (dashboard, reports, ingress-egress)](#wp-8-mocks--módulos-consumidores)
11. [WP-9: Dashboard feature — String UI](#wp-9-dashboard-feature--string-ui)
12. [WP-10: READMEs y Documentación](#wp-10-readmes-y-documentación)
13. [Orden de ejecución y dependencias](#orden-de-ejecución-y-dependencias)
14. [Checklist de verificación post-refactor](#checklist-de-verificación-post-refactor)

---

## 1. Glosario de renombramiento

### 1.1 Nombres de código (TypeScript/React)

| Antes                            | Después                                 | Contexto                                               |
| -------------------------------- | --------------------------------------- | ------------------------------------------------------ |
| `Quota`                          | `NewAdmission`                          | Interface/tipo de entidad                              |
| `quotas`                         | `newAdmissions`                         | Variable de lista, nombre de slice Redux, key de store |
| `quota`                          | `newAdmission`                          | Variable singular                                      |
| `QuotasList`                     | `NewAdmissionsList`                     | Componente React                                       |
| `QuotaForm`                      | `NewAdmissionForm`                      | Componente React                                       |
| `QuotaFormProps`                 | `NewAdmissionFormProps`                 | Tipo de props                                          |
| `QuotasPage`                     | `NewAdmissionsPage`                     | Componente de página                                   |
| `quotasService`                  | `newAdmissionsService`                  | Objeto de servicio API                                 |
| `quotasSlice`                    | `newAdmissionsSlice`                    | Nombre del slice Redux                                 |
| `quotasReducer`                  | `newAdmissionsReducer`                  | Reducer Redux                                          |
| `QuotasState`                    | `NewAdmissionsState`                    | Tipo de estado Redux                                   |
| `useQuotas`                      | `useNewAdmissions`                      | Hook personalizado                                     |
| `listQuotasThunk`                | `listNewAdmissionsThunk`                | Thunk Redux                                            |
| `getQuotaByIdThunk`              | `getNewAdmissionByIdThunk`              | Thunk Redux                                            |
| `createQuotaThunk`               | `createNewAdmissionThunk`               | Thunk Redux                                            |
| `updateQuotaThunk`               | `updateNewAdmissionThunk`               | Thunk Redux                                            |
| `patchQuotaThunk`                | `patchNewAdmissionThunk`                | Thunk Redux                                            |
| `deleteQuotaThunk`               | `deleteNewAdmissionThunk`               | Thunk Redux                                            |
| `activateQuotaThunk`             | `activateNewAdmissionThunk`             | Thunk Redux                                            |
| `deactivateQuotaThunk`           | `deactivateNewAdmissionThunk`           | Thunk Redux                                            |
| `ListQuotasParams`               | `ListNewAdmissionsParams`               | Tipo                                                   |
| `ListQuotasResponse`             | `ListNewAdmissionsResponse`             | Tipo                                                   |
| `CreateQuotaRequest`             | `CreateNewAdmissionRequest`             | Tipo                                                   |
| `UpdateQuotaRequest`             | `UpdateNewAdmissionRequest`             | Tipo                                                   |
| `QuotaError`                     | `NewAdmissionError`                     | Tipo                                                   |
| `clearCurrentQuota`              | `clearCurrentNewAdmission`              | Action Redux                                           |
| `currentQuota`                   | `currentNewAdmission`                   | Estado Redux                                           |
| `selectedQuota`                  | `selectedNewAdmission`                  | Estado local de componente                             |
| `mockQuotas`                     | `mockNewAdmissions`                     | Datos mock                                             |
| `findQuotaById`                  | `findNewAdmissionById`                  | Función helper mock                                    |
| `findQuotaByCareerAndGeneration` | `findNewAdmissionByCareerAndGeneration` | Función helper mock                                    |
| `generateQuotaId`                | `generateNewAdmissionId`                | Función helper mock                                    |
| `quotasHandlers`                 | `newAdmissionsHandlers`                 | Handlers MSW                                           |

### 1.2 Atributos del modelo

| Antes                      | Después       | Razón                                                 |
| -------------------------- | ------------- | ----------------------------------------------------- |
| `newAdmissionQuotasMale`   | `maleCount`   | Ya no son "cupos", son conteo real de alumnos hombres |
| `newAdmissionQuotasFemale` | `femaleCount` | Ya no son "cupos", son conteo real de alumnas mujeres |

### 1.3 Rutas de carpetas y archivos

| Antes                                                            | Después                                                                                |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `libs/frontend/entities/src/quota/`                              | `libs/frontend/entities/src/new-admission/`                                            |
| `libs/frontend/features/src/quotas/`                             | `libs/frontend/features/src/new-admissions/`                                           |
| `libs/frontend/features/src/quotas/api/quotasService.ts`         | `libs/frontend/features/src/new-admissions/api/newAdmissionsService.ts`                |
| `libs/frontend/features/src/quotas/model/quotasSlice.ts`         | `libs/frontend/features/src/new-admissions/model/newAdmissionsSlice.ts`                |
| `libs/frontend/features/src/quotas/model/quotasThunks.ts`        | `libs/frontend/features/src/new-admissions/model/newAdmissionsThunks.ts`               |
| `libs/frontend/features/src/quotas/lib/useQuotas.ts`             | `libs/frontend/features/src/new-admissions/lib/useNewAdmissions.ts`                    |
| `libs/frontend/features/src/quotas/ui/QuotasList/`               | `libs/frontend/features/src/new-admissions/ui/NewAdmissionsList/`                      |
| `libs/frontend/features/src/quotas/ui/QuotaForm/`                | `libs/frontend/features/src/new-admissions/ui/NewAdmissionForm/`                       |
| `libs/frontend/features/src/quotas/ui/QuotasList/QuotasList.tsx` | `libs/frontend/features/src/new-admissions/ui/NewAdmissionsList/NewAdmissionsList.tsx` |
| `libs/frontend/features/src/quotas/ui/QuotaForm/QuotaForm.tsx`   | `libs/frontend/features/src/new-admissions/ui/NewAdmissionForm/NewAdmissionForm.tsx`   |
| `libs/frontend/pages/src/QuotasPage/`                            | `libs/frontend/pages/src/NewAdmissionsPage/`                                           |
| `libs/frontend/pages/src/QuotasPage/QuotasPage.tsx`              | `libs/frontend/pages/src/NewAdmissionsPage/NewAdmissionsPage.tsx`                      |
| `apps/.../mocks/data/quotas.ts`                                  | `apps/.../mocks/data/new-admissions.ts`                                                |
| `apps/.../mocks/handlers/quotas.handlers.ts`                     | `apps/.../mocks/handlers/new-admissions.handlers.ts`                                   |

### 1.4 Rutas URL de la aplicación

| Antes                      | Después                            |
| -------------------------- | ---------------------------------- |
| `/ingress-egresses/quotas` | `/ingress-egresses/new-admissions` |

### 1.5 Endpoints de API (rutas HTTP)

| Antes                             | Después                          |
| --------------------------------- | -------------------------------- |
| `QUOTAS` (key en `API_ENDPOINTS`) | `NEW_ADMISSIONS`                 |
| `/quotas`                         | `/new-admissions`                |
| `/quotas/:id`                     | `/new-admissions/:id`            |
| `/quotas/:id/activate`            | `/new-admissions/:id/activate`   |
| `/quotas/:id/deactivate`          | `/new-admissions/:id/deactivate` |

### 1.6 Import paths (aliases)

| Antes                 | Después                       |
| --------------------- | ----------------------------- |
| `@entities/quota`     | `@entities/new-admission`     |
| `@features/quotas`    | `@features/new-admissions`    |
| `@features/quotas/ui` | `@features/new-admissions/ui` |
| `@pages/QuotasPage`   | `@pages/NewAdmissionsPage`    |

### 1.7 Strings de UI (español)

| Antes                                                | Después                                                    |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `"Cupos"`                                            | `"Nuevo Ingreso"`                                          |
| `"Cupo"`                                             | `"Registro de Ingreso"`                                    |
| `"Cupos Hombres"`                                    | `"Hombres"`                                                |
| `"Cupos Mujeres"`                                    | `"Mujeres"`                                                |
| `"Cupos para Hombres"`                               | `"Alumnos Hombres"`                                        |
| `"Cupos para Mujeres"`                               | `"Alumnas Mujeres"`                                        |
| `"Total Cupos"`                                      | `"Total Alumnos"`                                          |
| `"Total de Cupos"`                                   | `"Total de Alumnos"`                                       |
| `"Cupo activo"`                                      | `"Registro activo"`                                        |
| `"Crear Cupo"`                                       | `"Registrar Nuevo Ingreso"`                                |
| `"Editar Cupo"`                                      | `"Editar Registro de Ingreso"`                             |
| `"Detalles del Cupo"`                                | `"Detalles del Registro de Ingreso"`                       |
| `"Buscar cupo..."`                                   | `"Buscar registro..."`                                     |
| `"Cupo creado"`                                      | `"Registro creado"`                                        |
| `"Cupo actualizado"`                                 | `"Registro actualizado"`                                   |
| `"Cupo eliminado"`                                   | `"Registro eliminado"`                                     |
| `"Cupo activado"`                                    | `"Registro activado"`                                      |
| `"Cupo desactivado"`                                 | `"Registro desactivado"`                                   |
| `"El cupo se ha creado exitosamente"`                | `"El registro se ha creado exitosamente"`                  |
| `"El cupo se ha actualizado exitosamente"`           | `"El registro se ha actualizado exitosamente"`             |
| `"El cupo se ha eliminado exitosamente"`             | `"El registro se ha eliminado exitosamente"`               |
| `"El cupo se ha activado exitosamente"`              | `"El registro se ha activado exitosamente"`                |
| `"El cupo se ha desactivado exitosamente"`           | `"El registro se ha desactivado exitosamente"`             |
| `"Error al cargar cupos"`                            | `"Error al cargar registros de ingreso"`                   |
| `"No se pudieron cargar los cupos"`                  | `"No se pudieron cargar los registros de ingreso"`         |
| `"Error al crear cupo"`                              | `"Error al crear registro"`                                |
| `"No se pudo crear el cupo"`                         | `"No se pudo crear el registro"`                           |
| `"Error al actualizar cupo"`                         | `"Error al actualizar registro"`                           |
| `"No se pudo actualizar el cupo"`                    | `"No se pudo actualizar el registro"`                      |
| `"Error al eliminar cupo"`                           | `"Error al eliminar registro"`                             |
| `"No se pudo eliminar el cupo"`                      | `"No se pudo eliminar el registro"`                        |
| `"Error al activar cupo"`                            | `"Error al activar registro"`                              |
| `"Error al desactivar cupo"`                         | `"Error al desactivar registro"`                           |
| `"No se pudo cambiar el estado del cupo"`            | `"No se pudo cambiar el estado del registro"`              |
| `"Error al exportar cupos"`                          | `"Error al exportar registros"`                            |
| `"No se pudo exportar los cupos"`                    | `"No se pudo exportar los registros"`                      |
| `"Los cupos se han exportado a Excel correctamente"` | `"Los registros se han exportado a Excel correctamente"`   |
| `"Cupos asignados"` (dashboard)                      | `"Alumnos registrados"`                                    |
| `"Cupos por Sexo *"`                                 | `"Alumnos por Sexo *"`                                     |
| `"Descripción opcional del cupo"`                    | `"Descripción opcional del registro"`                      |
| `"¿Estás seguro de eliminar el cupo de..."`          | `"¿Estás seguro de eliminar el registro de ingreso de..."` |
| `sheetName: 'Cupos'`                                 | `sheetName: 'Nuevo Ingreso'`                               |
| `title: 'Cupos'`                                     | `title: 'Nuevo Ingreso'`                                   |
| `cupos-${dateStr}` (nombre archivo Excel)            | `nuevo-ingreso-${dateStr}`                                 |

### 1.8 Strings en logs (logger)

| Antes                                          | Después                                                       |
| ---------------------------------------------- | ------------------------------------------------------------- |
| `"Obteniendo lista de cupos..."`               | `"Obteniendo lista de registros de ingreso..."`               |
| `"Lista de cupos obtenida exitosamente"`       | `"Lista de registros de ingreso obtenida exitosamente"`       |
| `"Error al obtener lista de cupos:"`           | `"Error al obtener lista de registros de ingreso:"`           |
| `"Obteniendo cupo..."`                         | `"Obteniendo registro de ingreso..."`                         |
| `"Cupo obtenido exitosamente"`                 | `"Registro de ingreso obtenido exitosamente"`                 |
| `"Error al obtener cupo:"`                     | `"Error al obtener registro de ingreso:"`                     |
| `"Creando cupo..."`                            | `"Creando registro de ingreso..."`                            |
| `"Cupo creado exitosamente"`                   | `"Registro de ingreso creado exitosamente"`                   |
| `"Error al crear cupo:"`                       | `"Error al crear registro de ingreso:"`                       |
| `"Actualizando cupo..."`                       | `"Actualizando registro de ingreso..."`                       |
| `"Cupo actualizado exitosamente"`              | `"Registro de ingreso actualizado exitosamente"`              |
| `"Error al actualizar cupo:"`                  | `"Error al actualizar registro de ingreso:"`                  |
| `"Actualizando parcialmente cupo..."`          | `"Actualizando parcialmente registro de ingreso..."`          |
| `"Cupo actualizado parcialmente exitosamente"` | `"Registro de ingreso actualizado parcialmente exitosamente"` |
| `"Error al actualizar parcialmente cupo:"`     | `"Error al actualizar parcialmente registro de ingreso:"`     |
| `"Eliminando cupo..."`                         | `"Eliminando registro de ingreso..."`                         |
| `"Cupo eliminado exitosamente"`                | `"Registro de ingreso eliminado exitosamente"`                |
| `"Error al eliminar cupo:"`                    | `"Error al eliminar registro de ingreso:"`                    |
| `"Activando cupo..."`                          | `"Activando registro de ingreso..."`                          |
| `"Cupo activado exitosamente"`                 | `"Registro de ingreso activado exitosamente"`                 |
| `"Error al activar cupo:"`                     | `"Error al activar registro de ingreso:"`                     |
| `"Desactivando cupo..."`                       | `"Desactivando registro de ingreso..."`                       |
| `"Cupo desactivado exitosamente"`              | `"Registro de ingreso desactivado exitosamente"`              |
| `"Error al desactivar cupo:"`                  | `"Error al desactivar registro de ingreso:"`                  |

### 1.9 Strings en mensajes de error de thunks

| Antes                                           | Después                                                 |
| ----------------------------------------------- | ------------------------------------------------------- |
| `"Error desconocido al obtener lista de cupos"` | `"Error desconocido al obtener registros de ingreso"`   |
| `"Error desconocido al obtener cupo"`           | `"Error desconocido al obtener registro de ingreso"`    |
| `"Error desconocido al crear cupo"`             | `"Error desconocido al crear registro de ingreso"`      |
| `"Error desconocido al actualizar cupo"`        | `"Error desconocido al actualizar registro de ingreso"` |
| `"Error desconocido al eliminar cupo"`          | `"Error desconocido al eliminar registro de ingreso"`   |
| `"Error desconocido al activar cupo"`           | `"Error desconocido al activar registro de ingreso"`    |
| `"Error desconocido al desactivar cupo"`        | `"Error desconocido al desactivar registro de ingreso"` |

### 1.10 Action type strings (Redux)

| Antes                 | Después                      |
| --------------------- | ---------------------------- |
| `'quotas/list'`       | `'newAdmissions/list'`       |
| `'quotas/getById'`    | `'newAdmissions/getById'`    |
| `'quotas/create'`     | `'newAdmissions/create'`     |
| `'quotas/update'`     | `'newAdmissions/update'`     |
| `'quotas/patch'`      | `'newAdmissions/patch'`      |
| `'quotas/delete'`     | `'newAdmissions/delete'`     |
| `'quotas/activate'`   | `'newAdmissions/activate'`   |
| `'quotas/deactivate'` | `'newAdmissions/deactivate'` |

### 1.11 Códigos de error en mocks

| Antes                                                | Después                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------- |
| `'QUOTA_NOT_FOUND'`                                  | `'NEW_ADMISSION_NOT_FOUND'`                                         |
| `'Cupo no encontrado'`                               | `'Registro de ingreso no encontrado'`                               |
| `'Ya existe un cupo para esta carrera y generación'` | `'Ya existe un registro de ingreso para esta carrera y generación'` |

### 1.12 Descripciones de datos mock

| Antes                                                      | Después                                                                             |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `'Cupos para nuevo ingreso de ISC - Generación 2020-2024'` | `'Registro de nuevo ingreso de ISC - Generación 2020-2024'`                         |
| (patrón para todas las descripciones de mockNewAdmissions) | (mismo patrón: reemplazar "Cupos para nuevo ingreso" → "Registro de nuevo ingreso") |

---

## 2. Paquetes de trabajo independientes

El refactor se divide en **10 paquetes de trabajo (WP)** que se agrupan en **3 fases** según dependencias.

### Fase 1 — Sin dependencias entre sí (ejecutar en paralelo)

| WP    | Descripción                  | Archivos    |
| ----- | ---------------------------- | ----------- |
| WP-1  | Entidad `new-admission`      | 4 archivos  |
| WP-4  | Shared endpoints             | 1 archivo   |
| WP-5  | Sidebar navigation           | 1 archivo   |
| WP-7  | Mock data + handlers propios | 4 archivos  |
| WP-9  | Dashboard feature string     | 1 archivo   |
| WP-10 | READMEs y documentación      | ~8 archivos |

### Fase 2 — Depende de WP-1 y WP-4

| WP   | Descripción                                                      | Archivos     |
| ---- | ---------------------------------------------------------------- | ------------ |
| WP-2 | Feature completa `new-admissions`                                | ~14 archivos |
| WP-8 | Mocks consumidores (dashboard, reports, ingress-egress handlers) | 3 archivos   |

### Fase 3 — Depende de WP-2 y WP-3

| WP   | Descripción                   | Archivos   |
| ---- | ----------------------------- | ---------- |
| WP-3 | Página `NewAdmissionsPage`    | 3 archivos |
| WP-6 | App router, store, lazy pages | 3 archivos |

> **Nota para subagentes:** Los WP de la Fase 1 pueden ejecutarse en paralelo. Fase 2 espera a Fase 1. Fase 3 espera a Fase 2.

---

## WP-1: Entidad (entities)

**Objetivo:** Renombrar la carpeta `quota/` a `new-admission/` y el tipo `Quota` a `NewAdmission`.

### Archivos a modificar

#### 1.1 Crear `libs/frontend/entities/src/new-admission/model/types.ts`

Contenido nuevo (reemplaza `quota/model/types.ts`):

```typescript
export interface NewAdmission {
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

#### 1.2 Crear `libs/frontend/entities/src/new-admission/model/index.ts`

```typescript
export * from './types';
```

#### 1.3 Crear `libs/frontend/entities/src/new-admission/index.ts`

```typescript
export * from './model';
```

#### 1.4 Actualizar `libs/frontend/entities/src/index.ts`

Cambiar:

```typescript
export * from './quota';
```

Por:

```typescript
export * from './new-admission';
```

#### 1.5 Eliminar carpeta antigua

Eliminar `libs/frontend/entities/src/quota/` completa (3 archivos).

---

## WP-2: Feature completa (features)

**Objetivo:** Renombrar la carpeta `quotas/` a `new-admissions/` y todo su contenido interno.

**Depende de:** WP-1 (nueva entidad), WP-4 (nuevos endpoints).

### Archivos a crear (nuevos, reemplazando los antiguos)

#### 2.1 `libs/frontend/features/src/new-admissions/model/types.ts`

Reemplazos sobre el contenido de `quotas/model/types.ts`:

| Buscar                                         | Reemplazar                                                    |
| ---------------------------------------------- | ------------------------------------------------------------- |
| `import type { Quota } from '@entities/quota'` | `import type { NewAdmission } from '@entities/new-admission'` |
| `ListQuotasParams`                             | `ListNewAdmissionsParams`                                     |
| `ListQuotasResponse`                           | `ListNewAdmissionsResponse`                                   |
| `ListResponse<Quota>`                          | `ListResponse<NewAdmission>`                                  |
| `CreateQuotaRequest`                           | `CreateNewAdmissionRequest`                                   |
| `UpdateQuotaRequest`                           | `UpdateNewAdmissionRequest`                                   |
| `QuotaError`                                   | `NewAdmissionError`                                           |
| `newAdmissionQuotasMale`                       | `maleCount`                                                   |
| `newAdmissionQuotasFemale`                     | `femaleCount`                                                 |

#### 2.2 `libs/frontend/features/src/new-admissions/model/newAdmissionsThunks.ts`

Reemplazos sobre el contenido de `quotas/model/quotasThunks.ts`:

| Buscar                                                 | Reemplazar                                                           |
| ------------------------------------------------------ | -------------------------------------------------------------------- |
| `import type { Quota } from '@entities/quota'`         | `import type { NewAdmission } from '@entities/new-admission'`        |
| `import { quotasService } from '../api/quotasService'` | `import { newAdmissionsService } from '../api/newAdmissionsService'` |
| Todos los imports de `./types` con prefijo `Quota`     | Prefijo `NewAdmission`                                               |
| `listQuotasThunk`                                      | `listNewAdmissionsThunk`                                             |
| `getQuotaByIdThunk`                                    | `getNewAdmissionByIdThunk`                                           |
| `createQuotaThunk`                                     | `createNewAdmissionThunk`                                            |
| `updateQuotaThunk`                                     | `updateNewAdmissionThunk`                                            |
| `patchQuotaThunk`                                      | `patchNewAdmissionThunk`                                             |
| `deleteQuotaThunk`                                     | `deleteNewAdmissionThunk`                                            |
| `activateQuotaThunk`                                   | `activateNewAdmissionThunk`                                          |
| `deactivateQuotaThunk`                                 | `deactivateNewAdmissionThunk`                                        |
| `'quotas/list'`                                        | `'newAdmissions/list'`                                               |
| `'quotas/getById'`                                     | `'newAdmissions/getById'`                                            |
| `'quotas/create'`                                      | `'newAdmissions/create'`                                             |
| `'quotas/update'`                                      | `'newAdmissions/update'`                                             |
| `'quotas/patch'`                                       | `'newAdmissions/patch'`                                              |
| `'quotas/delete'`                                      | `'newAdmissions/delete'`                                             |
| `'quotas/activate'`                                    | `'newAdmissions/activate'`                                           |
| `'quotas/deactivate'`                                  | `'newAdmissions/deactivate'`                                         |
| `quotasService.`                                       | `newAdmissionsService.`                                              |
| `const quota = await`                                  | `const newAdmission = await`                                         |
| `return quota`                                         | `return newAdmission`                                                |
| Todos los strings de error: ver sección 1.9            | Nuevos strings                                                       |
| Todos los comentarios con "cupos"                      | Cambiar a "registros de ingreso"                                     |
| Genéricos con `Quota` (ej: `<Quota, string, ...>`)     | `<NewAdmission, string, ...>`                                        |

#### 2.3 `libs/frontend/features/src/new-admissions/model/newAdmissionsSlice.ts`

Reemplazos sobre el contenido de `quotas/model/quotasSlice.ts`:

| Buscar                                           | Reemplazar                                                    |
| ------------------------------------------------ | ------------------------------------------------------------- |
| `import type { Quota } from '@entities/quota'`   | `import type { NewAdmission } from '@entities/new-admission'` |
| Todos los imports de thunks: ver tabla 2.2       | Nuevos nombres                                                |
| `QuotasState`                                    | `NewAdmissionsState`                                          |
| `quotas: Quota[]`                                | `newAdmissions: NewAdmission[]`                               |
| `currentQuota: Quota \| null`                    | `currentNewAdmission: NewAdmission \| null`                   |
| `const initialState: QuotasState` → `quotas: []` | `newAdmissions: []`                                           |
| `currentQuota: null`                             | `currentNewAdmission: null`                                   |
| `const quotasSlice = createSlice`                | `const newAdmissionsSlice = createSlice`                      |
| `name: 'quotas'`                                 | `name: 'newAdmissions'`                                       |
| `clearCurrentQuota`                              | `clearCurrentNewAdmission`                                    |
| `state.currentQuota`                             | `state.currentNewAdmission`                                   |
| `state.quotas`                                   | `state.newAdmissions`                                         |
| `(quota) => quota.id`                            | `(entry) => entry.id`                                         |
| `state.quotas[index]`                            | `state.newAdmissions[index]`                                  |
| `state.quotas.unshift`                           | `state.newAdmissions.unshift`                                 |
| `state.quotas = state.quotas.filter`             | `state.newAdmissions = state.newAdmissions.filter`            |
| `quotasReducer`                                  | `newAdmissionsReducer`                                        |
| `quotasSlice.actions`                            | `newAdmissionsSlice.actions`                                  |
| `quotasSlice.reducer`                            | `newAdmissionsSlice.reducer`                                  |
| Todos los comentarios con "cupos/cupo"           | "registros de ingreso"                                        |
| Todos los strings de error: ver sección 1.7      | Nuevos strings                                                |

#### 2.4 `libs/frontend/features/src/new-admissions/model/index.ts`

```typescript
export * from './types';
export { newAdmissionsReducer } from './newAdmissionsSlice';
export { listNewAdmissionsThunk, getNewAdmissionByIdThunk, createNewAdmissionThunk, updateNewAdmissionThunk, patchNewAdmissionThunk, deleteNewAdmissionThunk, activateNewAdmissionThunk, deactivateNewAdmissionThunk } from './newAdmissionsThunks';
```

#### 2.5 `libs/frontend/features/src/new-admissions/api/newAdmissionsService.ts`

Reemplazos sobre el contenido de `quotas/api/quotasService.ts`:

| Buscar                                                                    | Reemplazar                                                         |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `import type { Quota } from '@entities/quota'`                            | `import type { NewAdmission } from '@entities/new-admission'`      |
| Todos los imports de types: `ListQuotas*`, `CreateQuota*`, `UpdateQuota*` | `ListNewAdmissions*`, `CreateNewAdmission*`, `UpdateNewAdmission*` |
| `export const quotasService`                                              | `export const newAdmissionsService`                                |
| `Promise<ListQuotasResponse>`                                             | `Promise<ListNewAdmissionsResponse>`                               |
| `ListQuotasParams`                                                        | `ListNewAdmissionsParams`                                          |
| `Promise<Quota>`                                                          | `Promise<NewAdmission>`                                            |
| `CreateQuotaRequest`                                                      | `CreateNewAdmissionRequest`                                        |
| `UpdateQuotaRequest`                                                      | `UpdateNewAdmissionRequest`                                        |
| `Partial<UpdateQuotaRequest>`                                             | `Partial<UpdateNewAdmissionRequest>`                               |
| `apiClient.get<Quota>`                                                    | `apiClient.get<NewAdmission>`                                      |
| `apiClient.post<Quota>`                                                   | `apiClient.post<NewAdmission>`                                     |
| `apiClient.put<Quota>`                                                    | `apiClient.put<NewAdmission>`                                      |
| `apiClient.patch<Quota>`                                                  | `apiClient.patch<NewAdmission>`                                    |
| `API_ENDPOINTS.QUOTAS.`                                                   | `API_ENDPOINTS.NEW_ADMISSIONS.`                                    |
| Todos los strings de logger: ver sección 1.8                              | Nuevos strings                                                     |

#### 2.6 `libs/frontend/features/src/new-admissions/api/generationsHelper.ts`

Copiar sin cambios de `quotas/api/generationsHelper.ts` (no tiene referencias a quota).

#### 2.7 `libs/frontend/features/src/new-admissions/api/careersHelper.ts`

Copiar sin cambios de `quotas/api/careersHelper.ts` (no tiene referencias a quota).

#### 2.8 `libs/frontend/features/src/new-admissions/api/index.ts`

```typescript
export * from './newAdmissionsService';
```

#### 2.9 `libs/frontend/features/src/new-admissions/lib/useNewAdmissions.ts`

Reemplazos sobre el contenido de `quotas/lib/useQuotas.ts`:

| Buscar                                                                    | Reemplazar                                                    |
| ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `import type { Quota } from '@entities/quota'`                            | `import type { NewAdmission } from '@entities/new-admission'` |
| Todos los imports de types: `ListQuotas*`, `CreateQuota*`, `UpdateQuota*` | Nuevos nombres                                                |
| Todos los imports de thunks: ver tabla 2.2                                | Nuevos nombres                                                |
| `clearCurrentQuota`                                                       | `clearCurrentNewAdmission`                                    |
| `QuotasState`                                                             | `NewAdmissionsState`                                          |
| `quotas: QuotasState` (en AppState)                                       | `newAdmissions: NewAdmissionsState`                           |
| `export function useQuotas()`                                             | `export function useNewAdmissions()`                          |
| `state.quotas.quotas`                                                     | `state.newAdmissions.newAdmissions`                           |
| `state.quotas.pagination`                                                 | `state.newAdmissions.pagination`                              |
| `state.quotas.currentQuota`                                               | `state.newAdmissions.currentNewAdmission`                     |
| `state.quotas.isLoadingList` (y demás)                                    | `state.newAdmissions.isLoadingList` (y demás)                 |
| `const listQuotas`                                                        | `const listNewAdmissions`                                     |
| `const getQuotaById`                                                      | `const getNewAdmissionById`                                   |
| `const createQuota`                                                       | `const createNewAdmission`                                    |
| `const updateQuota`                                                       | `const updateNewAdmission`                                    |
| `const patchQuota`                                                        | `const patchNewAdmission`                                     |
| `const deleteQuota`                                                       | `const deleteNewAdmission`                                    |
| `const activateQuota`                                                     | `const activateNewAdmission`                                  |
| `const deactivateQuota`                                                   | `const deactivateNewAdmission`                                |
| `Result<Quota>`                                                           | `Result<NewAdmission>`                                        |
| `Result<ListQuotasResponse>`                                              | `Result<ListNewAdmissionsResponse>`                           |
| `quotas,` (en return)                                                     | `newAdmissions,`                                              |
| `currentQuota,` (en return)                                               | `currentNewAdmission,`                                        |
| Todos los strings de error: ver sección 1.7                               | Nuevos strings                                                |
| `clearCurrentQuota()` → `clearCurrent`                                    | `clearCurrentNewAdmission()`                                  |

#### 2.10 `libs/frontend/features/src/new-admissions/lib/index.ts`

```typescript
export * from './useNewAdmissions';
```

#### 2.11 `libs/frontend/features/src/new-admissions/ui/NewAdmissionForm/NewAdmissionForm.tsx`

Reemplazos sobre el contenido de `QuotaForm.tsx`:

| Buscar                                                       | Reemplazar                                                                 |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `import type { CreateQuotaRequest, UpdateQuotaRequest }`     | `import type { CreateNewAdmissionRequest, UpdateNewAdmissionRequest }`     |
| `import type { Quota } from '@entities/quota'`               | `import type { NewAdmission } from '@entities/new-admission'`              |
| `QuotaFormProps`                                             | `NewAdmissionFormProps`                                                    |
| `onSubmit: (data: CreateQuotaRequest \| UpdateQuotaRequest)` | `onSubmit: (data: CreateNewAdmissionRequest \| UpdateNewAdmissionRequest)` |
| `initialData?: Quota \| null`                                | `initialData?: NewAdmission \| null`                                       |
| `export function QuotaForm`                                  | `export function NewAdmissionForm`                                         |
| `}: QuotaFormProps`                                          | `}: NewAdmissionFormProps`                                                 |
| `newAdmissionQuotasMale`                                     | `maleCount`                                                                |
| `newAdmissionQuotasFemale`                                   | `femaleCount`                                                              |
| `setNewAdmissionQuotasMale`                                  | `setMaleCount`                                                             |
| `setNewAdmissionQuotasFemale`                                | `setFemaleCount`                                                           |
| Todos los strings de UI: ver sección 1.7                     | Nuevos strings                                                             |
| `errors.newAdmissionQuotasMale`                              | `errors.maleCount`                                                         |
| `errors.newAdmissionQuotasFemale`                            | `errors.femaleCount`                                                       |
| `newErrors.newAdmissionQuotasMale`                           | `newErrors.maleCount`                                                      |
| `newErrors.newAdmissionQuotasFemale`                         | `newErrors.femaleCount`                                                    |

#### 2.12 `libs/frontend/features/src/new-admissions/ui/NewAdmissionForm/index.ts`

```typescript
export { NewAdmissionForm } from './NewAdmissionForm';
export type { NewAdmissionFormProps } from './NewAdmissionForm';
```

#### 2.13 `libs/frontend/features/src/new-admissions/ui/NewAdmissionsList/NewAdmissionsList.tsx`

Reemplazos sobre el contenido de `QuotasList.tsx`:

| Buscar                                                              | Reemplazar                                                                       |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `import { useQuotas }`                                              | `import { useNewAdmissions }`                                                    |
| `import { quotasService }`                                          | `import { newAdmissionsService }`                                                |
| `import { QuotaForm }`                                              | `import { NewAdmissionForm }`                                                    |
| `import type { Quota } from '@entities/quota'`                      | `import type { NewAdmission } from '@entities/new-admission'`                    |
| `export function QuotasList()`                                      | `export function NewAdmissionsList()`                                            |
| `useQuotas()` → destructuring: `quotas, listQuotas, createQuota...` | `useNewAdmissions()` → `newAdmissions, listNewAdmissions, createNewAdmission...` |
| `selectedQuota` / `setSelectedQuota`                                | `selectedNewAdmission` / `setSelectedNewAdmission`                               |
| `loadQuotas`                                                        | `loadNewAdmissions`                                                              |
| `(quota: Quota)`                                                    | `(entry: NewAdmission)`                                                          |
| `quota.id`                                                          | `entry.id`                                                                       |
| `quota.isActive`                                                    | `entry.isActive`                                                                 |
| `quota.careerId`                                                    | `entry.careerId`                                                                 |
| `quota.generationId`                                                | `entry.generationId`                                                             |
| `quota.newAdmissionQuotasMale`                                      | `entry.maleCount`                                                                |
| `quota.newAdmissionQuotasFemale`                                    | `entry.femaleCount`                                                              |
| `newAdmissionQuotasMale` (key de columna)                           | `maleCount`                                                                      |
| `newAdmissionQuotasFemale` (key de columna)                         | `femaleCount`                                                                    |
| `TableColumn<Quota>[]`                                              | `TableColumn<NewAdmission>[]`                                                    |
| `DetailField<Quota>[]`                                              | `DetailField<NewAdmission>[]`                                                    |
| `quotasService.list`                                                | `newAdmissionsService.list`                                                      |
| `<QuotaForm`                                                        | `<NewAdmissionForm`                                                              |
| `data={quotas}`                                                     | `data={newAdmissions}`                                                           |
| `quotas.length === 0`                                               | `newAdmissions.length === 0`                                                     |
| Todos los strings de UI: ver sección 1.7                            | Nuevos strings                                                                   |
| Todos los labels de columnas/campos                                 | Ver sección 1.7                                                                  |

#### 2.14 `libs/frontend/features/src/new-admissions/ui/NewAdmissionsList/index.ts`

```typescript
export { NewAdmissionsList } from './NewAdmissionsList';
```

#### 2.15 `libs/frontend/features/src/new-admissions/ui/index.ts`

```typescript
export { NewAdmissionsList } from './NewAdmissionsList';
export { NewAdmissionForm } from './NewAdmissionForm';
export type { NewAdmissionFormProps } from './NewAdmissionForm';
```

#### 2.16 `libs/frontend/features/src/new-admissions/index.ts`

```typescript
export * from './api';
export * from './model';
export * from './lib';
export * from './ui';
```

#### 2.17 Actualizar `libs/frontend/features/src/index.ts`

Cambiar:

```typescript
// Quotas feature
export * from './quotas';
```

Por:

```typescript
// New Admissions feature
export * from './new-admissions';
```

#### 2.18 Eliminar carpeta antigua

Eliminar `libs/frontend/features/src/quotas/` completa.

---

## WP-3: Página (pages)

**Objetivo:** Renombrar `QuotasPage` a `NewAdmissionsPage`.

**Depende de:** WP-2 (feature renombrada).

### Archivos a modificar

#### 3.1 Crear `libs/frontend/pages/src/NewAdmissionsPage/NewAdmissionsPage.tsx`

```typescript
import { NewAdmissionsList } from '@features/new-admissions/ui';

export function NewAdmissionsPage() {
  return <NewAdmissionsList />;
}
```

#### 3.2 Crear `libs/frontend/pages/src/NewAdmissionsPage/index.ts`

```typescript
export { NewAdmissionsPage } from './NewAdmissionsPage';
```

#### 3.3 Actualizar `libs/frontend/pages/src/index.ts`

Cambiar:

```typescript
export * from './QuotasPage';
```

Por:

```typescript
export * from './NewAdmissionsPage';
```

#### 3.4 Eliminar carpeta antigua

Eliminar `libs/frontend/pages/src/QuotasPage/` completa.

---

## WP-4: Shared — Endpoints

**Objetivo:** Renombrar la key `QUOTAS` a `NEW_ADMISSIONS` y las rutas `/quotas` a `/new-admissions`.

### Archivo: `libs/frontend/shared/src/api/endpoints.ts`

Cambiar:

```typescript
  // Cupos
  QUOTAS: {
    LIST: '/quotas',
    DETAIL: (id: string) => `/quotas/${id}`,
    CREATE: '/quotas',
    UPDATE: (id: string) => `/quotas/${id}`,
    PATCH: (id: string) => `/quotas/${id}`,
    DELETE: (id: string) => `/quotas/${id}`,
    ACTIVATE: (id: string) => `/quotas/${id}/activate`,
    DEACTIVATE: (id: string) => `/quotas/${id}/deactivate`,
  },
```

Por:

```typescript
  // Nuevo Ingreso
  NEW_ADMISSIONS: {
    LIST: '/new-admissions',
    DETAIL: (id: string) => `/new-admissions/${id}`,
    CREATE: '/new-admissions',
    UPDATE: (id: string) => `/new-admissions/${id}`,
    PATCH: (id: string) => `/new-admissions/${id}`,
    DELETE: (id: string) => `/new-admissions/${id}`,
    ACTIVATE: (id: string) => `/new-admissions/${id}/activate`,
    DEACTIVATE: (id: string) => `/new-admissions/${id}/deactivate`,
  },
```

---

## WP-5: Widgets — Sidebar

**Objetivo:** Renombrar el item de navegación de "Cupos" a "Nuevo Ingreso".

### Archivo: `libs/frontend/widgets/src/Sidebar/lib/navigationItems.tsx`

Cambiar:

```typescript
{ id: 'cupos', label: 'Cupos', path: '/ingress-egresses/quotas' },
```

Por:

```typescript
{ id: 'nuevo-ingreso', label: 'Nuevo Ingreso', path: '/ingress-egresses/new-admissions' },
```

---

## WP-6: App — Router, Store, Lazy Pages

**Objetivo:** Actualizar router, Redux store y lazy imports.

**Depende de:** WP-2 (feature), WP-3 (página).

### 6.1 `apps/sistema-titulacion-cliente/src/app/providers/router/lazyPages.ts`

Cambiar:

```typescript
export const QuotasPage = lazy(() =>
  import('@pages/QuotasPage').then((module) => ({
    default: module.QuotasPage,
  }))
);
```

Por:

```typescript
export const NewAdmissionsPage = lazy(() =>
  import('@pages/NewAdmissionsPage').then((module) => ({
    default: module.NewAdmissionsPage,
  }))
);
```

### 6.2 `apps/sistema-titulacion-cliente/src/app/providers/router/AppRouter.tsx`

Cambiar:

- Import: `QuotasPage` → `NewAdmissionsPage`
- Ruta: `path="/ingress-egresses/quotas"` → `path="/ingress-egresses/new-admissions"`
- Componente: `<QuotasPage />` → `<NewAdmissionsPage />`

### 6.3 `apps/sistema-titulacion-cliente/src/app/providers/redux/store.ts`

Cambiar:

```typescript
import { quotasReducer } from '@features/quotas';
// ...
quotas: quotasReducer,
```

Por:

```typescript
import { newAdmissionsReducer } from '@features/new-admissions';
// ...
newAdmissions: newAdmissionsReducer,
```

---

## WP-7: Mocks — Data y Handlers

**Objetivo:** Renombrar data mock y handlers propios del módulo de quotas.

### 7.1 Crear `apps/sistema-titulacion-cliente/src/mocks/data/new-admissions.ts`

Reemplazos sobre `quotas.ts`:

| Buscar                                         | Reemplazar                                                    |
| ---------------------------------------------- | ------------------------------------------------------------- |
| `import type { Quota } from '@entities/quota'` | `import type { NewAdmission } from '@entities/new-admission'` |
| `export const mockQuotas: Quota[]`             | `export const mockNewAdmissions: NewAdmission[]`              |
| `newAdmissionQuotasMale`                       | `maleCount`                                                   |
| `newAdmissionQuotasFemale`                     | `femaleCount`                                                 |
| `'Cupos para nuevo ingreso de ...'`            | `'Registro de nuevo ingreso de ...'`                          |
| `findQuotaById` → `(quota)`                    | `findNewAdmissionById` → `(entry)`                            |
| `findQuotaByCareerAndGeneration` → `(quota)`   | `findNewAdmissionByCareerAndGeneration` → `(entry)`           |
| `generateQuotaId` → `mockQuotas`               | `generateNewAdmissionId` → `mockNewAdmissions`                |
| `Quota \| undefined`                           | `NewAdmission \| undefined`                                   |
| Todos los comentarios con "cupo"               | "registro de ingreso"                                         |

### 7.2 Crear `apps/sistema-titulacion-cliente/src/mocks/handlers/new-admissions.handlers.ts`

Reemplazos sobre `quotas.handlers.ts`:

| Buscar                                                                                  | Reemplazar                                                                                                          |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `import type { Quota } from '@entities/quota'`                                          | `import type { NewAdmission } from '@entities/new-admission'`                                                       |
| `import { mockQuotas, findQuotaById, findQuotaByCareerAndGeneration, generateQuotaId }` | `import { mockNewAdmissions, findNewAdmissionById, findNewAdmissionByCareerAndGeneration, generateNewAdmissionId }` |
| `from '../data'` o `from '../data/quotas'`                                              | `from '../data'` (apuntará al nuevo export)                                                                         |
| `CreateQuotaRequest`                                                                    | `CreateNewAdmissionRequest`                                                                                         |
| `UpdateQuotaRequest`                                                                    | `UpdateNewAdmissionRequest`                                                                                         |
| `newAdmissionQuotasMale`                                                                | `maleCount`                                                                                                         |
| `newAdmissionQuotasFemale`                                                              | `femaleCount`                                                                                                       |
| `export const quotasHandlers`                                                           | `export const newAdmissionsHandlers`                                                                                |
| `buildApiUrl('/quotas')`                                                                | `buildApiUrl('/new-admissions')`                                                                                    |
| `buildApiUrl('/quotas/:id')`                                                            | `buildApiUrl('/new-admissions/:id')`                                                                                |
| `buildApiUrl('/quotas/:id/activate')`                                                   | `buildApiUrl('/new-admissions/:id/activate')`                                                                       |
| `buildApiUrl('/quotas/:id/deactivate')`                                                 | `buildApiUrl('/new-admissions/:id/deactivate')`                                                                     |
| `mockQuotas`                                                                            | `mockNewAdmissions`                                                                                                 |
| `findQuotaById`                                                                         | `findNewAdmissionById`                                                                                              |
| `findQuotaByCareerAndGeneration`                                                        | `findNewAdmissionByCareerAndGeneration`                                                                             |
| `generateQuotaId`                                                                       | `generateNewAdmissionId`                                                                                            |
| `(quota: Quota)`                                                                        | `(entry: NewAdmission)`                                                                                             |
| `const quota = `                                                                        | `const entry = `                                                                                                    |
| `quota.careerId`                                                                        | `entry.careerId`                                                                                                    |
| `quota.generationId`                                                                    | `entry.generationId`                                                                                                |
| `quota.isActive`                                                                        | `entry.isActive`                                                                                                    |
| `quota.maleCount`                                                                       | `entry.maleCount`                                                                                                   |
| `quota.femaleCount`                                                                     | `entry.femaleCount`                                                                                                 |
| `quota.description`                                                                     | `entry.description`                                                                                                 |
| `quota.updatedAt`                                                                       | `entry.updatedAt`                                                                                                   |
| `quota.createdAt`                                                                       | `entry.createdAt`                                                                                                   |
| `const newQuota: Quota`                                                                 | `const newEntry: NewAdmission`                                                                                      |
| `newQuota.`                                                                             | `newEntry.`                                                                                                         |
| `mockNewAdmissions.push(newEntry)`                                                      | (ajustar)                                                                                                           |
| `'QUOTA_NOT_FOUND'`                                                                     | `'NEW_ADMISSION_NOT_FOUND'`                                                                                         |
| `'Cupo no encontrado'`                                                                  | `'Registro de ingreso no encontrado'`                                                                               |
| `'Ya existe un cupo para esta carrera y generación'`                                    | `'Ya existe un registro de ingreso para esta carrera y generación'`                                                 |
| Todos los comentarios con "cupo"/"quota"                                                | "registro de ingreso"/"new admission"                                                                               |

### 7.3 Actualizar `apps/sistema-titulacion-cliente/src/mocks/data/index.ts`

Cambiar:

```typescript
export { mockQuotas, findQuotaById, findQuotaByCareerAndGeneration, generateQuotaId } from './quotas';
```

Por:

```typescript
export { mockNewAdmissions, findNewAdmissionById, findNewAdmissionByCareerAndGeneration, generateNewAdmissionId } from './new-admissions';
```

### 7.4 Actualizar `apps/sistema-titulacion-cliente/src/mocks/handlers/index.ts`

Cambiar:

```typescript
import { quotasHandlers } from './quotas.handlers';
// ...
...quotasHandlers,
```

Por:

```typescript
import { newAdmissionsHandlers } from './new-admissions.handlers';
// ...
...newAdmissionsHandlers,
```

### 7.5 Eliminar archivos antiguos

- `apps/sistema-titulacion-cliente/src/mocks/data/quotas.ts`
- `apps/sistema-titulacion-cliente/src/mocks/handlers/quotas.handlers.ts`

---

## WP-8: Mocks — Módulos consumidores

**Objetivo:** Actualizar los handlers de dashboard, reports e ingress-egress que importan datos de quotas.

**Depende de:** WP-7 (nuevos nombres de mocks).

### 8.1 `apps/sistema-titulacion-cliente/src/mocks/handlers/dashboard.handlers.ts`

| Buscar                                        | Reemplazar                                                   |
| --------------------------------------------- | ------------------------------------------------------------ |
| `import { mockQuotas } from '../data/quotas'` | `import { mockNewAdmissions } from '../data/new-admissions'` |
| `mockQuotas` (todas las ocurrencias)          | `mockNewAdmissions`                                          |
| `quota.newAdmissionQuotasMale`                | `entry.maleCount`                                            |
| `quota.newAdmissionQuotasFemale`              | `entry.femaleCount`                                          |
| `(quota)` como parámetro de callback          | `(entry)`                                                    |
| `quota.generationId`                          | `entry.generationId`                                         |
| `quota.isActive`                              | `entry.isActive`                                             |

### 8.2 `apps/sistema-titulacion-cliente/src/mocks/handlers/ingress-egress.handlers.ts`

| Buscar                                        | Reemplazar                                                   |
| --------------------------------------------- | ------------------------------------------------------------ |
| `import { mockQuotas } from '../data/quotas'` | `import { mockNewAdmissions } from '../data/new-admissions'` |
| `mockQuotas` (todas las ocurrencias)          | `mockNewAdmissions`                                          |
| `quota.newAdmissionQuotasMale`                | `entry.maleCount`                                            |
| `quota.newAdmissionQuotasFemale`              | `entry.femaleCount`                                          |
| `(quota)` como parámetro de callback          | `(entry)`                                                    |
| `quota.generationId`                          | `entry.generationId`                                         |
| `quota.careerId`                              | `entry.careerId`                                             |
| `quota.isActive`                              | `entry.isActive`                                             |

### 8.3 `apps/sistema-titulacion-cliente/src/mocks/handlers/reports.handlers.ts`

| Buscar                                        | Reemplazar                                                   |
| --------------------------------------------- | ------------------------------------------------------------ |
| `import { mockQuotas } from '../data/quotas'` | `import { mockNewAdmissions } from '../data/new-admissions'` |
| `mockQuotas` (todas las ocurrencias)          | `mockNewAdmissions`                                          |
| `quota.newAdmissionQuotasMale`                | `entry.maleCount`                                            |
| `quota.newAdmissionQuotasFemale`              | `entry.femaleCount`                                          |
| `(quota)` como parámetro de callback          | `(entry)`                                                    |
| `quota.isActive`                              | `entry.isActive`                                             |
| `quota.generationId`                          | `entry.generationId`                                         |
| `quota.careerId`                              | `entry.careerId`                                             |

---

## WP-9: Dashboard feature — String UI

**Objetivo:** Cambiar el string "Cupos asignados" en el dashboard.

### Archivo: `libs/frontend/features/src/dashboard/ui/DashboardList/DashboardList.tsx`

Cambiar:

```typescript
subtitle = 'Cupos asignados';
```

Por:

```typescript
subtitle = 'Alumnos registrados';
```

---

## WP-10: READMEs y Documentación

**Objetivo:** Actualizar todas las referencias a quota/cupo en la documentación.

### Archivos a modificar

Buscar y reemplazar en cada archivo las referencias según el glosario de renombramiento (sección 1).

| Archivo                                               | Tipo de cambios                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `libs/frontend/entities/README.md`                    | `quota/` → `new-admission/`, `Quota` → `NewAdmission`, `newAdmissionQuotasMale` → `maleCount`, `newAdmissionQuotasFemale` → `femaleCount`, "cupo" → "registro de ingreso"                                                                                                                                                                                  |
| `libs/frontend/features/README.md`                    | `quotas/` → `new-admissions/`, `QuotaForm` → `NewAdmissionForm`, `QuotasList` → `NewAdmissionsList`, `quotasService` → `newAdmissionsService`, `useQuotas` → `useNewAdmissions`, etc.                                                                                                                                                                      |
| `libs/frontend/pages/README.md`                       | `QuotasPage` → `NewAdmissionsPage`, `/ingress-egresses/quotas` → `/ingress-egresses/new-admissions`                                                                                                                                                                                                                                                        |
| `libs/frontend/shared/README.md`                      | `QUOTAS` → `NEW_ADMISSIONS`, "cupos" → "nuevo ingreso"                                                                                                                                                                                                                                                                                                     |
| `apps/sistema-titulacion-cliente/README.md`           | Todas las referencias a rutas, slices, handlers                                                                                                                                                                                                                                                                                                            |
| `apps/sistema-titulacion-cliente/src/mocks/README.md` | `quotas.handlers.ts` → `new-admissions.handlers.ts`, `quotas.ts` → `new-admissions.ts`, `quotasData` → `newAdmissionsData`, `Quota` → `NewAdmission`                                                                                                                                                                                                       |
| `docs/BACKEND_API_SPEC.md`                            | Sección 8: "Cupos (Quotas)" → "Nuevo Ingreso (New Admissions)", `/quotas` → `/new-admissions`, `Quota` → `NewAdmission`, `newAdmissionQuotasMale` → `maleCount`, `newAdmissionQuotasFemale` → `femaleCount`, `QUOTA_NOT_FOUND` → `NEW_ADMISSION_NOT_FOUND`. También actualizar secciones 12 (Ingreso/Egreso), 13 (Dashboard), 14 (Reportes) y 16 (Modelos) |
| `docs/REGLAS_DE_NEGOCIO.md`                           | "Cupos (Quotas)" → "Nuevo Ingreso (New Admissions)", mismos cambios de atributos y rutas                                                                                                                                                                                                                                                                   |

---

## Orden de ejecución y dependencias

```
Fase 1 (paralelo):
  ├── WP-1  (entities)
  ├── WP-4  (shared endpoints)
  ├── WP-5  (sidebar)
  ├── WP-7  (mocks data + handlers propios)
  ├── WP-9  (dashboard string)
  └── WP-10 (READMEs)

Fase 2 (paralelo, después de Fase 1):
  ├── WP-2  (feature completa)  ← depende de WP-1, WP-4
  └── WP-8  (mocks consumidores) ← depende de WP-7

Fase 3 (paralelo, después de Fase 2):
  ├── WP-3  (página)  ← depende de WP-2
  └── WP-6  (app router/store/lazy) ← depende de WP-2, WP-3
```

### Asignación sugerida a subagentes

| Subagente       | WPs asignados          | Descripción                                                       |
| --------------- | ---------------------- | ----------------------------------------------------------------- |
| **Subagente A** | WP-1, WP-4, WP-5, WP-9 | Entidad + Shared + Widgets + Dashboard string (archivos pequeños) |
| **Subagente B** | WP-7, WP-8             | Mocks completos (data + handlers propios + consumidores)          |
| **Subagente C** | WP-2                   | Feature completa (la más grande, ~14 archivos)                    |
| **Subagente D** | WP-3, WP-6             | Página + App (router, store, lazy)                                |

> **Orden:** A y B primero (en paralelo). Luego C (necesita WP-1 y WP-4 de A). Luego D (necesita WP-2 de C). WP-10 se puede hacer en cualquier momento.

### Alternativa con 2 subagentes

| Subagente       | WPs asignados                                          |
| --------------- | ------------------------------------------------------ |
| **Subagente 1** | WP-1, WP-4, WP-5, WP-9, WP-2, WP-3, WP-6 (toda la app) |
| **Subagente 2** | WP-7, WP-8, WP-10 (todos los mocks + docs)             |

---

## Checklist de verificación post-refactor

### Búsqueda de residuos

Ejecutar estas búsquedas en el repositorio. **NINGUNA debe devolver resultados** en archivos `.ts`, `.tsx` dentro de `libs/frontend/` y `apps/sistema-titulacion-cliente/src/`:

```bash
# Verificar que no queden referencias antiguas
rg -i "quota" libs/frontend/ apps/sistema-titulacion-cliente/src/ --type ts --type tsx
rg "Cupo[s]?" libs/frontend/ apps/sistema-titulacion-cliente/src/ --type ts --type tsx
rg "newAdmissionQuotas" libs/frontend/ apps/sistema-titulacion-cliente/src/ --type ts --type tsx
rg "QUOTA" libs/frontend/ apps/sistema-titulacion-cliente/src/ --type ts --type tsx
```

### Compilación

```bash
npx nx run-many --target=build --projects=sistema-titulacion-cliente
```

### Lint

```bash
npx nx run-many --target=lint --projects=sistema-titulacion-cliente
```

### Verificación visual

1. Navegar a `/ingress-egresses/new-admissions` → debe mostrar la lista.
2. Crear un nuevo registro → modal dice "Registrar Nuevo Ingreso".
3. Editar un registro → modal dice "Editar Registro de Ingreso".
4. Sidebar → subitem dice "Nuevo Ingreso".
5. Dashboard → card dice "Alumnos registrados" en vez de "Cupos asignados".
6. Exportar a Excel → archivo se llama `nuevo-ingreso-YYYY-MM-DD.xlsx`.

### Archivos eliminados (confirmar)

- [ ] `libs/frontend/entities/src/quota/` — eliminado
- [ ] `libs/frontend/features/src/quotas/` — eliminado
- [ ] `libs/frontend/pages/src/QuotasPage/` — eliminado
- [ ] `apps/.../mocks/data/quotas.ts` — eliminado
- [ ] `apps/.../mocks/handlers/quotas.handlers.ts` — eliminado
