# 🔍 Guía Completa: Uso de Filtros (FilterPanel y FilterDropdown)

Esta guía explica cómo usar los componentes `FilterPanel` y `FilterDropdown` para crear sistemas de filtrado flexibles, tanto con datos locales como con opciones del backend.

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Componentes Disponibles](#componentes-disponibles)
3. [Tipos de Filtros](#tipos-de-filtros)
4. [Uso con Datos Locales](#uso-con-datos-locales)
5. [Uso con Backend](#uso-con-backend)
6. [Integración con PageHeader](#integración-con-pageheader)
7. [Ejemplos Prácticos](#ejemplos-prácticos)
8. [Casos de Uso Avanzados](#casos-de-uso-avanzados)

---

## Introducción

Los componentes de filtros permiten crear interfaces de filtrado flexibles que pueden trabajar con:

- ✅ **Datos locales**: Extrae automáticamente valores únicos de los datos
- ✅ **Backend**: Usa opciones predefinidas desde el servidor
- ✅ **Múltiples tipos**: Checkbox (múltiples valores), Toggle (boolean), Select (valor único)
- ✅ **Integración fácil**: Compatible con `PageHeader` y sistemas de búsqueda

---

## Componentes Disponibles

### FilterPanel

Panel de filtros que se puede usar directamente o dentro de un dropdown.

### FilterDropdown

Dropdown posicionable que contiene un `FilterPanel`, ideal para integrar con `PageHeader`.

### Imports Necesarios

```tsx
import { useState, useRef } from 'react';
import { FilterPanel, FilterDropdown, FilterConfig, FilterType, FilterOption } from '@shared/ui';
```

---

## Tipos de Filtros

### 1. Checkbox (Múltiples Valores)

Permite seleccionar múltiples opciones. El valor resultante es un `array` de strings.

**Uso ideal para:**

- Estados múltiples (ej: ACTIVO, PAUSADO, CANCELADO)
- Categorías múltiples
- Relaciones múltiples (ej: múltiples carreras)

**Tipo de dato:** `string[]`

```tsx
{
  columnKey: 'status',
  label: 'Estado',
  type: 'checkbox', // Opcional, es el default
  options: [
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'PAUSADO', label: 'Pausado' },
    { value: 'CANCELADO', label: 'Cancelado' }
  ]
}
```

### 2. Toggle (Boolean)

Permite activar/desactivar un filtro booleano. El valor resultante es un `boolean`.

**Uso ideal para:**

- Filtros simples de activo/inactivo
- `activeOnly`, `isGraduated`, etc.

**Tipo de dato:** `boolean`

```tsx
{
  columnKey: 'activeOnly',
  label: 'Solo activos',
  type: 'toggle'
}
```

### 3. Select (Valor Único)

Permite seleccionar una única opción. El valor resultante es un `string`.

**Uso ideal para:**

- Filtros donde solo se necesita un valor
- Relaciones simples (ej: una carrera, una generación)

**Tipo de dato:** `string` (vacío `''` significa "Todos")

```tsx
{
  columnKey: 'careerId',
  label: 'Carrera',
  type: 'select',
  options: careers.map(c => ({ value: c.id, label: c.name }))
}
```

---

## Uso con Datos Locales

Cuando trabajas con datos en memoria, `FilterPanel` puede extraer automáticamente los valores únicos.

### Ejemplo Básico

```tsx
import { useState } from 'react';
import { FilterPanel, FilterConfig } from '@shared/ui';

interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  estado: 'activo' | 'inactivo';
}

function ProductosPage() {
  const [filters, setFilters] = useState<Record<string, string[]>>({});
  const [tableData] = useState<Producto[]>([
    { id: '1', nombre: 'Producto A', categoria: 'Electrónica', estado: 'activo' },
    { id: '2', nombre: 'Producto B', categoria: 'Ropa', estado: 'inactivo' },
    // ... más datos
  ]);

  const filterConfigs: FilterConfig<Producto>[] = [
    { columnKey: 'categoria', label: 'Categoría' },
    { columnKey: 'estado', label: 'Estado' },
  ];

  const handleFilterChange = (columnKey: string, values: string | string[] | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [columnKey]: values,
    }));
  };

  const handleReset = () => {
    setFilters({});
  };

  return <FilterPanel data={tableData} filterConfigs={filterConfigs} selectedFilters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />;
}
```

**Nota:** Los filtros se extraen automáticamente de los datos. No necesitas proporcionar `options`.

---

## Uso con Backend

Cuando trabajas con datos del backend (paginados, filtrados, etc.), debes proporcionar las opciones manualmente.

### Ejemplo con Estudiantes

```tsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { FilterDropdown, FilterConfig } from '@shared/ui';
import { PageHeader } from '@widgets/PageHeader';
import { Career, Generation, StudentStatus } from '@entities';

function StudentsPage() {
  const [filters, setFilters] = useState<Record<string, string | string[] | boolean>>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Cargar opciones desde el backend
  const [careers, setCareers] = useState<Career[]>([]);
  const [generations, setGenerations] = useState<Generation[]>([]);

  useEffect(() => {
    // Cargar carreras y generaciones para los filtros
    loadCareers().then(setCareers);
    loadGenerations().then(setGenerations);
  }, []);

  const filterConfigs: FilterConfig[] = [
    {
      columnKey: 'careerId',
      label: 'Carrera',
      type: 'checkbox',
      options: careers.map((c) => ({ value: c.id, label: c.name })),
    },
    {
      columnKey: 'generationId',
      label: 'Generación',
      type: 'checkbox',
      options: generations.map((g) => ({
        value: g.id,
        label: g.name || `${g.startYear.getFullYear()}-${g.endYear.getFullYear()}`,
      })),
    },
    {
      columnKey: 'status',
      label: 'Estado',
      type: 'checkbox',
      options: [
        { value: StudentStatus.ACTIVO, label: 'Activo' },
        { value: StudentStatus.PAUSADO, label: 'Pausado' },
        { value: StudentStatus.CANCELADO, label: 'Cancelado' },
      ],
    },
    {
      columnKey: 'activeOnly',
      label: 'Solo activos',
      type: 'toggle',
    },
  ];

  const handleFilterChange = (columnKey: string, value: string | string[] | boolean) => {
    setFilters((prev) => {
      const updated = { ...prev, [columnKey]: value };

      // Si es un array vacío o string vacío, eliminar el filtro
      if (Array.isArray(value) && value.length === 0) {
        delete updated[columnKey];
      } else if (value === '' || value === false) {
        delete updated[columnKey];
      }

      return updated;
    });
  };

  const handleReset = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some((value) => {
    if (typeof value === 'boolean') return value === true;
    if (typeof value === 'string') return value !== '';
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  // Convertir filtros a query parameters para el backend
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        if (value) params.set(key, 'true');
      } else if (typeof value === 'string' && value !== '') {
        params.set(key, value);
      } else if (Array.isArray(value) && value.length > 0) {
        value.forEach((v) => params.append(key, v));
      }
    });

    return params;
  }, [filters]);

  return (
    <>
      <PageHeader
        title="Estudiantes"
        searchPlaceholder="Buscar estudiante..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={{
          label: 'Filtros',
          onClick: () => setIsFiltersOpen(!isFiltersOpen),
          isActive: hasActiveFilters,
          buttonRef: filterButtonRef,
        }}
      />

      <FilterDropdown isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} triggerRef={filterButtonRef} filterConfigs={filterConfigs} selectedFilters={filters} onFilterChange={handleFilterChange} onReset={handleReset} />

      {/* Tu tabla aquí */}
    </>
  );
}
```

---

## Integración con PageHeader

`FilterDropdown` está diseñado para trabajar perfectamente con `PageHeader`.

### Ejemplo Completo

```tsx
import { useState, useRef } from 'react';
import { PageHeader } from '@widgets/PageHeader';
import { FilterDropdown, FilterConfig } from '@shared/ui';

function MyPage() {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [filters, setFilters] = useState<Record<string, string | string[] | boolean>>({});

  const filterConfigs: FilterConfig[] = [
    // ... tus configuraciones
  ];

  const hasActiveFilters = Object.values(filters).some((value) => {
    if (typeof value === 'boolean') return value === true;
    if (typeof value === 'string') return value !== '';
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  return (
    <>
      <PageHeader
        title="Mi Página"
        searchPlaceholder="Buscar..."
        filters={{
          label: 'Filtros',
          onClick: () => setIsFiltersOpen(!isFiltersOpen),
          isActive: hasActiveFilters,
          buttonRef: filterButtonRef,
        }}
      />

      <FilterDropdown
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        triggerRef={filterButtonRef}
        filterConfigs={filterConfigs}
        selectedFilters={filters}
        onFilterChange={(key, value) => {
          setFilters((prev) => ({ ...prev, [key]: value }));
        }}
        onReset={() => setFilters({})}
      />
    </>
  );
}
```

---

## Ejemplos Prácticos

### Ejemplo 1: Filtros para Opciones de Titulación

```tsx
const filterConfigs: FilterConfig[] = [
  {
    columnKey: 'isActive',
    label: 'Solo activas',
    type: 'toggle',
  },
];

// selectedFilters será:
// { isActive: true } o { isActive: false }
```

### Ejemplo 2: Filtros para Estudiantes con Backend

```tsx
const filterConfigs: FilterConfig[] = [
  {
    columnKey: 'careerId',
    label: 'Carrera',
    type: 'checkbox',
    options: careers.map((c) => ({ value: c.id, label: c.name })),
  },
  {
    columnKey: 'generationId',
    label: 'Generación',
    type: 'checkbox',
    options: generations.map((g) => ({
      value: g.id,
      label: g.name || `Generación ${g.startYear.getFullYear()}`,
    })),
  },
  {
    columnKey: 'status',
    label: 'Estado',
    type: 'checkbox',
    options: [
      { value: 'ACTIVO', label: 'Activo' },
      { value: 'PAUSADO', label: 'Pausado' },
      { value: 'CANCELADO', label: 'Cancelado' },
    ],
  },
];

// selectedFilters será:
// {
//   careerId: ['career-1', 'career-2'],
//   generationId: ['gen-1'],
//   status: ['ACTIVO', 'PAUSADO']
// }
```

### Ejemplo 3: Filtros para Nuevo Ingreso (New Admissions)

```tsx
const filterConfigs: FilterConfig[] = [
  {
    columnKey: 'careerId',
    label: 'Carrera',
    type: 'select', // Solo una carrera a la vez
    options: careers.map((c) => ({ value: c.id, label: c.name })),
  },
  {
    columnKey: 'generationId',
    label: 'Generación',
    type: 'select',
    options: generations.map((g) => ({
      value: g.id,
      label: g.name || `Generación ${g.startYear.getFullYear()}`,
    })),
  },
  {
    columnKey: 'activeOnly',
    label: 'Solo activas',
    type: 'toggle',
  },
];
```

---

## Casos de Uso Avanzados

### 1. Convertir Filtros a Query Parameters

Cuando trabajas con el backend, necesitas convertir los filtros a query parameters:

```tsx
function useFiltersToQueryParams(filters: Record<string, string | string[] | boolean>) {
  return useMemo(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (typeof value === 'boolean') {
        // Para toggles, solo agregar si es true
        if (value) {
          params.set(key, 'true');
        }
      } else if (typeof value === 'string') {
        // Para selects, solo agregar si no está vacío
        if (value !== '') {
          params.set(key, value);
        }
      } else if (Array.isArray(value)) {
        // Para checkboxes, agregar cada valor
        if (value.length > 0) {
          value.forEach((v) => params.append(key, v));
        }
      }
    });

    return params;
  }, [filters]);
}

// Uso:
const queryParams = useFiltersToQueryParams(filters);
const queryString = queryParams.toString();
// Resultado: "careerId=career-1&careerId=career-2&status=ACTIVO&activeOnly=true"
```

### 2. Inicializar Filtros desde URL

Si quieres inicializar filtros desde la URL (ej: compartir URLs con filtros aplicados):

```tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

function useFiltersFromURL() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<Record<string, string | string[] | boolean>>({});

  useEffect(() => {
    const newFilters: Record<string, string | string[] | boolean> = {};

    searchParams.forEach((value, key) => {
      if (key === 'activeOnly') {
        newFilters[key] = value === 'true';
      } else {
        // Para arrays, puede venir múltiples veces
        const existing = newFilters[key];
        if (existing) {
          if (Array.isArray(existing)) {
            existing.push(value);
          } else {
            newFilters[key] = [existing as string, value];
          }
        } else {
          newFilters[key] = value;
        }
      }
    });

    setFilters(newFilters);
  }, [searchParams]);

  return [filters, setFilters] as const;
}
```

### 3. Filtros Condicionales

Mostrar diferentes opciones según otros filtros seleccionados:

```tsx
const [filters, setFilters] = useState({});
const [careers, setCareers] = useState<Career[]>([]);
const [modalities, setModalities] = useState<Modality[]>([]);

// Filtrar modalidades según la carrera seleccionada
const availableModalities = useMemo(() => {
  const selectedCareerId = filters.careerId as string | undefined;
  if (!selectedCareerId) return modalities;

  const selectedCareer = careers.find((c) => c.id === selectedCareerId);
  if (!selectedCareer) return modalities;

  return modalities.filter((m) => m.id === selectedCareer.modalityId);
}, [filters.careerId, careers, modalities]);

const filterConfigs: FilterConfig[] = [
  {
    columnKey: 'careerId',
    label: 'Carrera',
    type: 'select',
    options: careers.map((c) => ({ value: c.id, label: c.name })),
  },
  {
    columnKey: 'modalityId',
    label: 'Modalidad',
    type: 'select',
    options: availableModalities.map((m) => ({
      value: m.id,
      label: m.name || 'Sin nombre',
    })),
  },
];
```

### 4. Filtros con Búsqueda Interna

Para listas largas de opciones, puedes agregar búsqueda interna:

```tsx
import { useState, useMemo } from 'react';

function FilterPanelWithSearch({ filterConfigs, ...props }) {
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  const filteredConfigs = useMemo(() => {
    return filterConfigs.map((config) => {
      const searchTerm = searchTerms[config.columnKey]?.toLowerCase() || '';

      if (!searchTerm || !config.options) return config;

      return {
        ...config,
        options: config.options.filter((opt) => opt.label.toLowerCase().includes(searchTerm) || opt.value.toLowerCase().includes(searchTerm)),
      };
    });
  }, [filterConfigs, searchTerms]);

  // Implementar input de búsqueda en cada sección del FilterPanel
  // (Requiere modificar FilterPanel o crear un wrapper)
}
```

---

## API Reference

### FilterConfig

```typescript
interface FilterConfig<T = any> {
  /** Clave del filtro (usado como query parameter con backend) */
  columnKey: string;

  /** Etiqueta mostrada al usuario */
  label: string;

  /** Tipo de filtro: 'checkbox' | 'toggle' | 'select' */
  type?: FilterType;

  /** Opciones predefinidas (requerido para backend) */
  options?: FilterOption[];

  /** Si debe extraer opciones de datos locales (default: true si no hay options) */
  extractFromData?: boolean;
}
```

### FilterOption

```typescript
interface FilterOption {
  /** Valor del filtro */
  value: string;

  /** Etiqueta mostrada al usuario */
  label: string;
}
```

### FilterPanelProps

```typescript
interface FilterPanelProps<T = any> {
  /** Datos locales (opcional si todas las opciones están predefinidas) */
  data?: T[];

  /** Configuración de filtros */
  filterConfigs: FilterConfig<T>[];

  /** Valores seleccionados */
  selectedFilters: Record<string, string | string[] | boolean>;

  /** Callback cuando cambia un filtro */
  onFilterChange: (columnKey: string, value: string | string[] | boolean) => void;

  /** Callback para limpiar todos los filtros */
  onReset?: () => void;
}
```

### FilterDropdownProps

```typescript
interface FilterDropdownProps<T = any> extends FilterPanelProps<T> {
  /** Si el dropdown está abierto */
  isOpen: boolean;

  /** Callback cuando se cierra */
  onClose: () => void;

  /** Referencia al botón que activa el dropdown */
  triggerRef?: React.RefObject<HTMLElement | null>;

  /** Clase CSS adicional */
  className?: string;
}
```

---

## Mejores Prácticas

### ✅ DO

- Usa `options` predefinidas cuando trabajes con backend
- Limpia los filtros vacíos antes de enviarlos al backend
- Usa `toggle` para filtros booleanos simples
- Usa `select` cuando solo se necesita un valor
- Usa `checkbox` para múltiples valores del mismo tipo

### ❌ DON'T

- No mezcles extracción automática con opciones predefinidas para el mismo filtro
- No olvides manejar arrays vacíos al convertir a query parameters
- No uses `checkbox` para filtros booleanos (usa `toggle`)
- No uses `data` cuando todas las opciones están predefinidas (es innecesario)

---

## Preguntas Frecuentes

### ¿Cómo sé si debo usar datos locales o opciones predefinidas?

- **Usa datos locales**: Cuando trabajas con datos completos en memoria (sin paginación del servidor)
- **Usa opciones predefinidas**: Cuando trabajas con datos paginados o necesitas opciones que no están en los datos actuales

### ¿Puedo combinar ambos métodos?

Sí, puedes tener algunos filtros con opciones predefinidas y otros que extraen de datos locales. Solo asegúrate de que cada `FilterConfig` tenga `options` definidas o `extractFromData: true`.

### ¿Cómo manejo filtros que dependen de otros filtros?

Usa `useMemo` para calcular las opciones disponibles basándote en otros filtros seleccionados. Ver el ejemplo de "Filtros Condicionales" arriba.

### ¿Los filtros persisten al recargar la página?

No por defecto. Si necesitas persistencia, usa `localStorage` o inicializa desde la URL usando `useSearchParams`.

---

## Recursos Adicionales

- [Guía de Table](./COMO_USAR_TABLE.md) - Para usar filtros junto con tablas
- [Guía de MSW](./COMO_USAR_MSW.md) - Para simular respuestas del backend
