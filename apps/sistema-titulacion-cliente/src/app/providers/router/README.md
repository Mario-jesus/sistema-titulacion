# Estructura del Router

Esta carpeta contiene toda la lógica de routing de la aplicación. La estructura está organizada por responsabilidades para facilitar el mantenimiento y la escalabilidad.

## 📁 Estructura de Carpetas

```
router/
├── AppRouter.tsx          # Componente principal del router (punto de entrada)
├── lazyPages.ts           # Configuración de lazy loading para todas las páginas
├── guards/                # Componentes de protección de rutas
│   ├── index.ts
│   ├── ProtectedRoute.tsx # Requiere autenticación
│   ├── PublicRoute.tsx    # Solo accesible si NO estás autenticado
│   └── AdminRoute.tsx     # Requiere autenticación + rol admin
├── layouts/               # Componentes de diseño/layout
│   ├── index.ts
│   └── LayoutWithSidebar.tsx # Layout con sidebar y header
└── components/            # Componentes auxiliares del router
    ├── index.ts
    └── PageLoader.tsx     # Componente de carga para lazy loading
```

## 📂 Descripción de Carpetas

### `guards/` - Protección de Rutas

Contiene los componentes que protegen las rutas según diferentes criterios:

- **ProtectedRoute**: Verifica que el usuario esté autenticado. Si no lo está, redirige a `/login`.
- **PublicRoute**: Verifica que el usuario NO esté autenticado. Si lo está, redirige a `/dashboard` (o la ruta especificada).
- **AdminRoute**: Verifica que el usuario esté autenticado Y tenga rol de administrador. Si no cumple, redirige según corresponda.

**Cuándo usar cada uno:**

- `ProtectedRoute`: Para todas las páginas que requieren autenticación
- `PublicRoute`: Para páginas como login, registro, recuperación de contraseña
- `AdminRoute`: Para páginas exclusivas de administradores

### `layouts/` - Layouts

Contiene los componentes de diseño que envuelven las páginas:

- **LayoutWithSidebar**: Layout completo con sidebar de navegación y header. Usado para todas las páginas protegidas que requieren navegación.

**Cuándo agregar un nuevo layout:**

- Si necesitas un layout diferente (sin sidebar, con diferentes componentes, etc.)
- Crea el componente en esta carpeta y expórtalo desde `index.ts`

### `components/` - Componentes Auxiliares

Contiene componentes de utilidad específicos del router:

- **PageLoader**: Componente que se muestra mientras se cargan las páginas con lazy loading.

**Cuándo agregar componentes aquí:**

- Componentes relacionados específicamente con el routing
- Componentes de UI que solo se usan en el contexto del router

## 📄 Archivos Principales

### `AppRouter.tsx`

Componente principal que define todas las rutas de la aplicación. Mantén este archivo limpio y enfocado solo en la definición de rutas.

### `lazyPages.ts`

Centraliza todos los lazy loadings de las páginas. Cuando agregues una nueva página:

1. Agrega el lazy loading en este archivo:

```typescript
export const NuevaPage = lazy(() =>
  import('@pages/NuevaPage').then((module) => ({
    default: module.NuevaPage,
  }))
);
```

2. Impórtalo en `AppRouter.tsx`:

```typescript
import { LoginPage, ComingSoonPage, NuevaPage } from './lazyPages';
```

3. Úsalo en la ruta correspondiente con `<Suspense>`.

## 🎯 Convenciones

1. **Siempre usa lazy loading** para las páginas (excepto casos muy específicos)
2. **Envuelve las páginas lazy** con `<Suspense fallback={<PageLoader />}>`
3. **Usa los guards apropiados** según el tipo de ruta
4. **Mantén AppRouter.tsx simple** - solo definición de rutas
5. **Exporta desde index.ts** en cada carpeta para imports más limpios

## 📝 Ejemplo de Agregar una Nueva Ruta

```typescript
// 1. Agregar lazy loading en lazyPages.ts
export const StudentsPage = lazy(() =>
  import('@pages/StudentsPage').then((module) => ({
    default: module.StudentsPage,
  }))
);

// 2. Importar en AppRouter.tsx
import { StudentsPage } from './lazyPages';

// 3. Agregar la ruta
<Route
  path="/students"
  element={
    <ProtectedRoute>
      <LayoutWithSidebar>
        <Suspense fallback={<PageLoader />}>
          <StudentsPage />
        </Suspense>
      </LayoutWithSidebar>
    </ProtectedRoute>
  }
/>;
```
