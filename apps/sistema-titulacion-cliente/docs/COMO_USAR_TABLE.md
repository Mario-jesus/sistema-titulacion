# 📊 Guía Completa: Uso del Componente Table

Esta guía explica cómo usar el componente `Table` junto con todos sus componentes relacionados para crear tablas interactivas con ordenamiento, acciones contextuales y visualización de detalles.

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Componentes Relacionados](#componentes-relacionados)
3. [Ejemplo Completo](#ejemplo-completo)
4. [Configuración de Columnas](#configuración-de-columnas)
5. [Ordenamiento de Datos](#ordenamiento-de-datos)
6. [Columna de Estado](#columna-de-estado)
7. [Acciones Contextuales (Menú Desplegable)](#acciones-contextuales-menú-desplegable)
8. [Modal de Detalles](#modal-de-detalles)
9. [Casos de Uso Avanzados](#casos-de-uso-avanzados)

---

## Introducción

El componente `Table` es un componente genérico y reutilizable que proporciona:

- ✅ Ordenamiento de columnas
- ✅ Estados visuales con colores personalizables
- ✅ Menú contextual con click derecho
- ✅ Visualización de detalles con click izquierdo
- ✅ Soporte para modo claro y oscuro
- ✅ Renderizado personalizado de celdas
- ✅ Valores anidados (notación de punto)

---

## Componentes Relacionados

### Imports Necesarios

```tsx
import { useState, useRef, useMemo } from 'react';
import { Table, TableColumn, TableStatus, useTableSort, useTableFilters, createStatusActions, DetailModal, FilterConfig, FilterDropdown, FilterPanel } from '@shared/ui';
import { PageHeader } from '@widgets/PageHeader';
```

### Componentes y Hooks

- **`Table`**: Componente principal de tabla
- **`useTableSort`**: Hook para manejar el ordenamiento
- **`useTableFilters`**: Hook para filtrar datos basándose en valores seleccionados
- **`createStatusActions`**: Función helper para crear acciones basadas en estados
- **`DetailModal`**: Modal para mostrar detalles de una fila
- **`FilterDropdown`**: Dropdown con panel de filtros (ideal para usar con `PageHeader`)
- **`FilterPanel`**: Panel de filtros con soporte para checkbox, toggle y select
- **`PageHeader`**: Header de página con búsqueda y filtros
- **`TableColumn`**: Tipo para definir columnas
- **`TableStatus`**: Tipo para estados de la tabla
- **`FilterConfig`**: Tipo para configurar filtros

---

## Ejemplo Completo

Este es un ejemplo completo que muestra todas las funcionalidades del componente Table:

```tsx
import { useState, useRef, useMemo } from 'react';
import { Table, TableColumn, TableStatus, useTableSort, useTableFilters, createStatusActions, DetailModal, FilterConfig, FilterDropdown } from '@shared/ui';
import { PageHeader } from '@widgets/PageHeader';

// 1. Definir la interfaz de tus datos
interface OpcionTitulacion {
  nombre: string;
  descripcion: string;
  estado: 'active' | 'paused' | 'cancelled';
}

export function MiComponente() {
  // 2. Estados para el modal de detalles
  const [selectedRow, setSelectedRow] = useState<OpcionTitulacion | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 2.1. Estados para filtros
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Record<string, string | string[] | boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // 3. Datos de la tabla
  const tableData: OpcionTitulacion[] = [
    {
      nombre: 'Residencia',
      descripcion: 'Proyecto de residencia',
      estado: 'paused',
    },
    {
      nombre: 'Modelo dual',
      descripcion: 'Proyecto de tesis',
      estado: 'cancelled',
    },
    {
      nombre: 'Tesis',
      descripcion: 'Proyecto de tesis',
      estado: 'active',
    },
  ];

  // 4. Aplicar búsqueda local (si trabajas con datos locales)
  // Nota: Si trabajas con backend, usa onSearch para ejecutar búsqueda solo al presionar Enter
  const searchedData = useMemo(() => {
    if (!searchTerm) return tableData;
    const searchLower = searchTerm.toLowerCase();
    return tableData.filter((row) => row.nombre.toLowerCase().includes(searchLower) || row.descripcion.toLowerCase().includes(searchLower));
  }, [tableData, searchTerm]);

  // 5. Aplicar filtros
  const filteredData = useTableFilters(searchedData, filters);

  // 6. Hook para manejar el ordenamiento
  const { sortedData, handleSort } = useTableSort<OpcionTitulacion>(filteredData);

  // 7. Configuración de columnas
  const columns: TableColumn<OpcionTitulacion>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      sortable: true,
    },
  ];

  // 8. Handlers para las acciones
  const handleView = (row: OpcionTitulacion) => {
    setSelectedRow(row);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (row: OpcionTitulacion) => {
    console.log('Editar:', row);
    // Tu lógica aquí
  };

  const handleDelete = (row: OpcionTitulacion) => {
    console.log('Borrar:', row);
    // Tu lógica aquí
  };

  const handlePause = (row: OpcionTitulacion) => {
    console.log('Pausar:', row);
    // Tu lógica aquí
  };

  const handleActivate = (row: OpcionTitulacion) => {
    console.log('Activar:', row);
    // Tu lógica aquí
  };

  const handleCancel = (row: OpcionTitulacion) => {
    console.log('Cancelar:', row);
    // Tu lógica aquí
  };

  // 9. Configuración de transiciones de estado
  // Define qué acciones están disponibles según el estado actual
  const handleRowActions = (row: OpcionTitulacion) => {
    const statusActions = createStatusActions(row, {
      currentStatus: row.estado,
      getStatus: (row) => row.estado,
      transitions: {
        active: {
          // Acciones adicionales primero (Editar, Borrar)
          additionalActions: [
            { label: 'Editar', onClick: () => handleEdit(row) },
            { label: 'Borrar', onClick: () => handleDelete(row), variant: 'danger' as const },
          ],
          // Desde "activo" se puede pausar o cancelar
          actions: [
            {
              label: 'Pausar',
              targetStatus: 'paused',
              onClick: () => handlePause(row),
            },
            {
              label: 'Cancelar',
              targetStatus: 'cancelled',
              onClick: () => handleCancel(row),
              variant: 'danger' as const,
            },
          ],
          showSeparator: true,
        },
        paused: {
          // Acciones adicionales primero (Editar, Borrar)
          additionalActions: [
            { label: 'Editar', onClick: () => handleEdit(row) },
            { label: 'Borrar', onClick: () => handleDelete(row), variant: 'danger' as const },
          ],
          // Desde "pausado" se puede activar o cancelar
          actions: [
            {
              label: 'Activar',
              targetStatus: 'active',
              onClick: () => handleActivate(row),
            },
            {
              label: 'Cancelar',
              targetStatus: 'cancelled',
              onClick: () => handleCancel(row),
              variant: 'danger' as const,
            },
          ],
          showSeparator: true,
        },
        cancelled: {
          // Acciones adicionales primero (Editar, Borrar)
          additionalActions: [
            { label: 'Editar', onClick: () => handleEdit(row) },
            { label: 'Borrar', onClick: () => handleDelete(row), variant: 'danger' as const },
          ],
          // Desde "cancelado" no se puede cambiar de estado
          actions: [],
        },
      },
    });

    // Agregar "Ver" al inicio del menú, seguido de un separador
    return [{ label: 'Ver', onClick: () => handleView(row) }, { separator: true, label: 'separator', onClick: () => {} }, ...statusActions];
  };

  // Handlers para filtros
  const handleFilterChange = (columnKey: string, value: string | string[] | boolean) => {
    setFilters((prev) => {
      const updated = { ...prev, [columnKey]: value };

      // Si es un array vacío, string vacío o false, eliminar el filtro
      if (Array.isArray(value) && value.length === 0) {
        delete updated[columnKey];
      } else if (value === '' || value === false) {
        delete updated[columnKey];
      }

      return updated;
    });
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.values(filters).some((value) => {
    if (typeof value === 'boolean') return value === true;
    if (typeof value === 'string') return value !== '';
    if (Array.isArray(value)) return value.length > 0;
    return false;
  });

  // Configuración de filtros (extrae valores de datos locales)
  const filterConfigs: FilterConfig<OpcionTitulacion>[] = [{ columnKey: 'estado', label: 'Estado' }];

  return (
    <div className="w-full">
      {/* 10. PageHeader con filtros */}
      <PageHeader
        title="Opciones de titulación"
        searchPlaceholder="Buscar..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        // onSearch es opcional para datos locales, requerido para backend
        // onSearch={(value) => { /* Ejecutar búsqueda al presionar Enter */ }}
        filters={{
          label: 'Filtros',
          onClick: () => setIsFiltersOpen(!isFiltersOpen),
          isActive: hasActiveFilters,
          buttonRef: filterButtonRef,
        }}
      />

      {/* 11. Dropdown de filtros */}
      <FilterDropdown<OpcionTitulacion> isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} triggerRef={filterButtonRef} data={tableData} filterConfigs={filterConfigs} selectedFilters={filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

      {/* 12. Componente Table */}
      <Table<OpcionTitulacion>
        columns={columns}
        data={sortedData} // Usar sortedData (filtrado y ordenado)
        statusColumn={{
          key: 'estado',
          getStatus: (row) => {
            const statusMap: Record<TableStatus, { status: TableStatus; label: string }> = {
              active: { status: 'active', label: 'Activo' },
              paused: { status: 'paused', label: 'Pausado' },
              cancelled: { status: 'cancelled', label: 'Cancelado' },
            };
            return statusMap[row.estado];
          },
        }}
        onSort={handleSort}
        rowActions={handleRowActions}
        onRowClick={(row) => {
          setSelectedRow(row);
          setIsDetailModalOpen(true);
        }}
      />

      {/* 13. Modal de detalles */}
      <DetailModal<OpcionTitulacion>
        title="Detalles de la opción de titulación"
        data={selectedRow}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRow(null);
        }}
        fields={[
          { key: 'nombre', label: 'Nombre' },
          {
            key: 'descripcion',
            label: 'Descripción',
            fullWidth: true,
          },
          {
            key: 'estado',
            label: 'Estado',
            render: (value) => {
              const statusMap: Record<string, { label: string; color: string }> = {
                active: { label: 'Activo', color: 'var(--color-green)' },
                paused: { label: 'Pausado', color: 'var(--color-yellow)' },
                cancelled: { label: 'Cancelado', color: 'var(--color-salmon)' },
              };
              const status = statusMap[value] || { label: value, color: 'var(--color-base-primary-typo)' };
              return <span style={{ color: status.color }}>{status.label}</span>;
            },
          },
        ]}
      />
    </div>
  );
}
```

---

## Configuración de Columnas

### Columnas Básicas

```tsx
const columns: TableColumn<MiTipo>[] = [
  {
    key: 'nombre', // Clave del campo en los datos
    label: 'Nombre', // Etiqueta a mostrar en el header
    sortable: true, // Si la columna es ordenable
  },
];
```

### Columnas con Renderizado Personalizado

```tsx
const columns: TableColumn<MiTipo>[] = [
  {
    key: 'fecha',
    label: 'Fecha',
    sortable: true,
    render: (value) => {
      // Renderizar el valor de forma personalizada
      return new Date(value).toLocaleDateString();
    },
  },
  {
    key: 'precio',
    label: 'Precio',
    sortable: true,
    align: 'right', // Alineación: 'left' | 'center' | 'right'
    render: (value) => {
      return `$${value.toFixed(2)}`;
    },
  },
];
```

### Columnas con Valores Anidados

```tsx
const columns: TableColumn<MiTipo>[] = [
  {
    key: 'usuario.nombre', // Notación de punto para valores anidados
    label: 'Nombre del Usuario',
    sortable: true,
  },
  {
    key: 'usuario.email',
    label: 'Email',
    sortable: true,
  },
];
```

---

## Ordenamiento de Datos

### Uso Básico del Hook `useTableSort`

```tsx
import { useTableSort } from '@shared/ui';

// En tu componente
const { sortedData, handleSort } = useTableSort<MiTipo>(tableData);

// Usar sortedData en la tabla
<Table
  columns={columns}
  data={sortedData} // ← Usar sortedData
  onSort={handleSort}
/>;
```

### Ordenamiento Inicial

```tsx
// Ordenar por defecto por una columna específica
const { sortedData, handleSort } = useTableSort<MiTipo>(
  tableData,
  'nombre', // Columna inicial
  'asc' // Dirección inicial
);
```

### Resetear Ordenamiento

```tsx
const { sortedData, handleSort, resetSort, sortColumn, sortDirection } = useTableSort<MiTipo>(tableData);

// Resetear el ordenamiento
<button onClick={resetSort}>Resetear orden</button>;

// Ver estado actual
console.log('Columna ordenada:', sortColumn);
console.log('Dirección:', sortDirection);
```

### Ordenamiento Manual (sin hook)

Si prefieres manejar el ordenamiento manualmente:

```tsx
import { sortTableData } from '@shared/ui';

const [sortColumn, setSortColumn] = useState<string | null>(null);
const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

const sortedData = useMemo(() => {
  return sortTableData(tableData, sortColumn, sortDirection);
}, [tableData, sortColumn, sortDirection]);

const handleSort = (columnKey: string, direction: 'asc' | 'desc' | null) => {
  setSortColumn(direction ? columnKey : null);
  setSortDirection(direction);
};
```

---

## Filtrado de Datos

Los filtros ahora soportan múltiples tipos: `checkbox` (múltiples valores), `toggle` (boolean), y `select` (valor único). Pueden trabajar con datos locales (extracción automática) o con opciones predefinidas del backend.

> **📚 Documentación completa**: Para más detalles sobre filtros, consulta [COMO_USAR_FILTROS.md](./COMO_USAR_FILTROS.md)

### Uso Básico con Datos Locales

El hook `useTableFilters` filtra los datos basándose en los valores seleccionados. Con datos locales, los valores únicos se extraen automáticamente:

```tsx
import { useTableFilters, FilterConfig, FilterDropdown } from '@shared/ui';
import { PageHeader } from '@widgets/PageHeader';
import { useRef, useState } from 'react';

const [filters, setFilters] = useState<Record<string, string | string[] | boolean>>({});
const [isFiltersOpen, setIsFiltersOpen] = useState(false);
const filterButtonRef = useRef<HTMLButtonElement>(null);

// Filtrar datos
const filteredData = useTableFilters(tableData, filters);

// Configuración de filtros (extrae valores de datos locales)
const filterConfigs: FilterConfig<MiTipo>[] = [
  { columnKey: 'estado', label: 'Estado' },
  { columnKey: 'categoria', label: 'Categoría' },
];

// Verificar si hay filtros activos
const hasActiveFilters = Object.values(filters).some((value) => {
  if (typeof value === 'boolean') return value === true;
  if (typeof value === 'string') return value !== '';
  if (Array.isArray(value)) return value.length > 0;
  return false;
});

const handleFilterChange = (columnKey: string, value: string | string[] | boolean) => {
  setFilters((prev) => {
    const updated = { ...prev, [columnKey]: value };

    // Si es un array vacío, string vacío o false, eliminar el filtro
    if (Array.isArray(value) && value.length === 0) {
      delete updated[columnKey];
    } else if (value === '' || value === false) {
      delete updated[columnKey];
    }

    return updated;
  });
};

const handleResetFilters = () => {
  setFilters({});
};

return (
  <>
    <PageHeader
      title="Opciones de titulación"
      filters={{
        label: 'Filtros',
        onClick: () => setIsFiltersOpen(!isFiltersOpen),
        isActive: hasActiveFilters,
        buttonRef: filterButtonRef,
      }}
    />

    <FilterDropdown<MiTipo> isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} triggerRef={filterButtonRef} data={tableData} filterConfigs={filterConfigs} selectedFilters={filters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />

    <Table columns={columns} data={filteredData} />
  </>
);
```

### Uso con Opciones Predefinidas (Backend)

Cuando trabajas con datos del backend, proporciona las opciones manualmente:

```tsx
const filterConfigs: FilterConfig[] = [
  {
    columnKey: 'careerId',
    label: 'Carrera',
    type: 'checkbox',
    options: careers.map((c) => ({ value: c.id, label: c.name })),
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
  {
    columnKey: 'activeOnly',
    label: 'Solo activos',
    type: 'toggle',
  },
];

<FilterDropdown
  isOpen={isFiltersOpen}
  onClose={() => setIsFiltersOpen(false)}
  triggerRef={filterButtonRef}
  filterConfigs={filterConfigs}
  selectedFilters={filters}
  onFilterChange={handleFilterChange}
  onReset={handleResetFilters}
  // No necesita 'data' cuando todas las opciones están predefinidas
/>;
```

### Tipos de Filtros

#### Checkbox (Múltiples Valores)

```tsx
{
  columnKey: 'status',
  label: 'Estado',
  type: 'checkbox', // Default, opcional
  options: [
    { value: 'ACTIVO', label: 'Activo' },
    { value: 'PAUSADO', label: 'Pausado' }
  ]
}
// selectedFilters['status'] será: ['ACTIVO', 'PAUSADO']
```

#### Toggle (Boolean)

```tsx
{
  columnKey: 'activeOnly',
  label: 'Solo activos',
  type: 'toggle'
}
// selectedFilters['activeOnly'] será: true o false
```

#### Select (Valor Único)

```tsx
{
  columnKey: 'careerId',
  label: 'Carrera',
  type: 'select',
  options: careers.map(c => ({ value: c.id, label: c.name }))
}
// selectedFilters['careerId'] será: 'career-123' o ''
```

### Filtros con Ordenamiento Combinado

```tsx
// 1. Filtrar primero
const filteredData = useTableFilters(tableData, filters);

// 2. Ordenar después
const { sortedData, handleSort } = useTableSort(filteredData);

<Table
  columns={columns}
  data={sortedData} // Datos filtrados Y ordenados
  onSort={handleSort}
/>;
```

### Filtros con Búsqueda

```tsx
// Para datos locales: búsqueda inmediata
const [searchTerm, setSearchTerm] = useState('');
const [filters, setFilters] = useState<Record<string, string | string[] | boolean>>({});

// 1. Búsqueda local (se aplica mientras escribe)
const searchedData = useMemo(() => {
  if (!searchTerm) return tableData;
  const searchLower = searchTerm.toLowerCase();
  return tableData.filter((row) => row.nombre.toLowerCase().includes(searchLower) || row.descripcion.toLowerCase().includes(searchLower));
}, [tableData, searchTerm]);

// 2. Filtros
const filteredData = useTableFilters(searchedData, filters);

// 3. Ordenamiento
const { sortedData, handleSort } = useTableSort(filteredData);

return (
  <>
    <PageHeader
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      // Para datos locales, onSearch puede ser opcional
      filters={{
        label: 'Filtros',
        onClick: () => setIsFiltersOpen(!isFiltersOpen),
        isActive: hasActiveFilters,
        buttonRef: filterButtonRef,
      }}
    />
    <Table data={sortedData} onSort={handleSort} />
  </>
);
```

**Para búsqueda con backend (solo al presionar Enter):**

```tsx
const [searchTerm, setSearchTerm] = useState(''); // Valor del input
const [searchQuery, setSearchQuery] = useState(''); // Valor que se envía al backend
const [filters, setFilters] = useState<Record<string, string | string[] | boolean>>({});

// 1. Hacer petición a la API solo cuando cambia searchQuery (después de presionar Enter)
useEffect(() => {
  fetchData({
    search: searchQuery,
    page: 1, // Resetear a primera página al buscar
    ...filtersToQueryParams(filters)
  });
}, [searchQuery, filters]);

// 2. Filtros locales (si aplica)
const filteredData = useTableFilters(dataFromAPI, filters);

return (
  <>
    <PageHeader
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onSearch={(value) => {
        // Solo se ejecuta al presionar Enter
        setSearchQuery(value);
      }}
      onSearchClear={() => {
        setSearchTerm('');
        setSearchQuery('');
      }}
      filters={{ ... }}
    />
    <Table data={filteredData} />
  </>
);
```

### Filtros con Valores Anidados

```tsx
const filterConfigs: FilterConfig<MiTipo>[] = [
  { columnKey: 'estado', label: 'Estado' },
  { columnKey: 'usuario.rol', label: 'Rol del Usuario' }, // Notación de punto
];
```

### Convertir Filtros a Query Parameters (Backend)

Cuando trabajas con el backend, necesitas convertir los filtros a query parameters:

```tsx
import { useMemo } from 'react';

const queryParams = useMemo(() => {
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

// Usar en la llamada API
const queryString = queryParams.toString();
// Resultado: "careerId=career-1&careerId=career-2&status=ACTIVO&activeOnly=true"
```

---

## Columna de Estado

### Estados con Colores por Defecto

El componente Table tiene colores por defecto para estos estados:

- `active` → Verde
- `paused` → Amarillo
- `cancelled` → Rojo/Salmón
- `inactive` → Gris

```tsx
<Table
  columns={columns}
  data={data}
  statusColumn={{
    key: 'estado',
    getStatus: (row) => {
      return {
        status: row.estado, // 'active', 'paused', 'cancelled', etc.
        label: row.estado === 'active' ? 'Activo' : 'Inactivo',
      };
    },
  }}
/>
```

### Estados Personalizados con Colores

```tsx
<Table
  columns={columns}
  data={data}
  statusColumn={{
    key: 'estado',
    getStatus: (row) => ({
      status: row.activo ? 'activo' : 'inactivo',
      label: row.activo ? 'Activo' : 'Inactivo',
    }),
    colors: {
      activo: {
        dot: 'bg-[var(--color-green)]',
        text: 'text-[var(--color-green)]',
      },
      inactivo: {
        dot: 'bg-[var(--color-gray-5)]',
        text: 'text-[var(--color-gray-5)]',
      },
    },
  }}
/>
```

### Colores Personalizados por Fila

```tsx
<Table
  columns={columns}
  data={data}
  statusColumn={{
    key: 'estado',
    getStatus: (row) => ({
      status: row.estado,
      label: row.estadoLabel,
      color: {
        dot: row.colorDot, // Clase CSS para el punto
        text: row.colorText, // Clase CSS para el texto
      },
    }),
  }}
/>
```

---

## Acciones Contextuales (Menú Desplegable)

### Comportamiento Responsivo

El comportamiento del menú contextual varía según el dispositivo:

- **Desktop (≥ 768px)**:

  - **Click izquierdo** en la fila → Abre el modal de detalles (`onRowClick`)
  - **Click derecho** en la fila → Muestra el menú desplegable con acciones (`rowActions`)

- **Móviles (< 768px)**:
  - **Click izquierdo** en la fila → Muestra el menú desplegable con acciones (incluyendo "Ver" para ver detalles)
  - El menú se ajusta automáticamente para permanecer visible en la pantalla

> **💡 Importante**: Siempre incluye la opción "Ver" al inicio del menú para que los usuarios móviles puedan acceder a los detalles.

### Configuración Básica

El menú contextual se muestra con **click derecho** en desktop o **click izquierdo** en móviles:

```tsx
// Handler para ver detalles (requerido para móviles)
const handleView = (row: MiTipo) => {
  setSelectedRow(row);
  setIsDetailModalOpen(true);
};

<Table
  columns={columns}
  data={data}
  rowActions={(row) => {
    return [
      { label: 'Ver', onClick: () => handleView(row) },
      { separator: true, label: 'separator', onClick: () => {} },
      { label: 'Editar', onClick: () => handleEdit(row) },
      { label: 'Borrar', onClick: () => handleDelete(row), variant: 'danger' },
    ];
  }}
/>;
```

### Usando `createStatusActions` para Transiciones de Estado

Esta función permite definir qué acciones están disponibles según el estado actual de la fila. **Importante**: Debes agregar la opción "Ver" al inicio del menú para que funcione correctamente en móviles:

```tsx
import { createStatusActions } from '@shared/ui';

// Handler para ver detalles (requerido para móviles)
const handleView = (row: MiTipo) => {
  setSelectedRow(row);
  setIsDetailModalOpen(true);
};

const handleRowActions = (row: MiTipo) => {
  // Obtener las acciones basadas en el estado
  const statusActions = createStatusActions(row, {
    currentStatus: row.estado,
    getStatus: (row) => row.estado,
    transitions: {
      // Estado: activo
      active: {
        // Acciones adicionales (siempre disponibles)
        additionalActions: [
          { label: 'Editar', onClick: () => handleEdit(row) },
          { label: 'Borrar', onClick: () => handleDelete(row), variant: 'danger' },
        ],
        // Acciones de transición de estado
        actions: [
          { label: 'Pausar', targetStatus: 'paused', onClick: () => handlePause(row) },
          { label: 'Cancelar', targetStatus: 'cancelled', onClick: () => handleCancel(row), variant: 'danger' },
        ],
        showSeparator: true, // Mostrar separador entre grupos
      },
      // Estado: pausado
      paused: {
        additionalActions: [{ label: 'Editar', onClick: () => handleEdit(row) }],
        actions: [{ label: 'Activar', targetStatus: 'active', onClick: () => handleActivate(row) }],
        showSeparator: true,
      },
      // Estado: cancelado (sin transiciones)
      cancelled: {
        additionalActions: [{ label: 'Editar', onClick: () => handleEdit(row) }],
        actions: [], // No hay transiciones desde cancelado
      },
    },
  });

  // Agregar "Ver" al inicio del menú, seguido de un separador
  return [{ label: 'Ver', onClick: () => handleView(row) }, { separator: true, label: 'separator', onClick: () => {} }, ...statusActions];
};
```

### Ejemplo: Estados Activo/Inactivo (Simple)

```tsx
// Handler para ver detalles (requerido para móviles)
const handleView = (row: MiTipo) => {
  setSelectedRow(row);
  setIsDetailModalOpen(true);
};

const handleRowActions = (row: MiTipo) => {
  const statusActions = createStatusActions(row, {
    currentStatus: row.activo ? 'activo' : 'inactivo',
    getStatus: (row) => row.activo ? 'activo' : 'inactivo',
    transitions: {
      activo: {
        additionalActions: [
          { label: 'Editar', onClick: () => handleEdit(row) },
        ],
        actions: [
          { label: 'Inactivar', targetStatus: 'inactivo', onClick: () => handleDeactivate(row) },
        ],
      },
      inactivo: {
        additionalActions: [
          { label: 'Editar', onClick: () => handleEdit(row) },
        ],
        actions: [
          { label: 'Activar', targetStatus: 'activo', onClick: () => handleActivate(row) },
        ],
      },
    },
  });

  // Agregar "Ver" al inicio del menú
  return [
    { label: 'Ver', onClick: () => handleView(row) },
    { separator: true, label: 'separator', onClick: () => {} },
    ...statusActions,
  ];
};

  // Agregar "Ver" al inicio del menú
  return [
    { label: 'Ver', onClick: () => handleView(row) },
    { separator: true, label: 'separator', onClick: () => {} },
    ...statusActions,
  ];
};
```

### Variantes de Acciones

- **`variant: 'danger'`**: Muestra la acción en rojo (para acciones destructivas como "Borrar")
- **`variant: undefined`**: Acción normal (por defecto)

---

## Modal de Detalles

### Uso Básico

El modal de detalles se muestra con **click izquierdo** en cualquier fila:

```tsx
import { DetailModal } from '@shared/ui';

const [selectedRow, setSelectedRow] = useState<MiTipo | null>(null);
const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

<Table
  columns={columns}
  data={data}
  onRowClick={(row) => {
    setSelectedRow(row);
    setIsDetailModalOpen(true);
  }}
/>

<DetailModal<MiTipo>
  title="Detalles"
  data={selectedRow}
  isOpen={isDetailModalOpen}
  onClose={() => {
    setIsDetailModalOpen(false);
    setSelectedRow(null);
  }}
  fields={[
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
  ]}
/>
```

### Campos con Renderizado Personalizado

```tsx
<DetailModal<MiTipo>
  title="Detalles del Usuario"
  data={selectedRow}
  isOpen={isDetailModalOpen}
  onClose={() => setIsDetailModalOpen(false)}
  fields={[
    { key: 'nombre', label: 'Nombre' },
    {
      key: 'fecha',
      label: 'Fecha de Creación',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value) => <span style={{ color: value === 'active' ? 'green' : 'red' }}>{value === 'active' ? 'Activo' : 'Inactivo'}</span>,
    },
  ]}
/>
```

### Campos con Valores Anidados

```tsx
<DetailModal<MiTipo>
  title="Detalles"
  data={selectedRow}
  isOpen={isDetailModalOpen}
  onClose={() => setIsDetailModalOpen(false)}
  fields={[
    { key: 'nombre', label: 'Nombre' },
    { key: 'usuario.email', label: 'Email' }, // Notación de punto
    { key: 'usuario.telefono', label: 'Teléfono' }, // Notación de punto
  ]}
/>
```

### Campos de Ancho Completo

```tsx
<DetailModal<MiTipo>
  title="Detalles"
  data={selectedRow}
  isOpen={isDetailModalOpen}
  onClose={() => setIsDetailModalOpen(false)}
  fields={[
    { key: 'nombre', label: 'Nombre' },
    {
      key: 'descripcion',
      label: 'Descripción',
      fullWidth: true, // Ocupa todo el ancho
    },
  ]}
/>
```

---

## Casos de Uso Avanzados

### Tabla con Paginación

```tsx
import { Pagination } from '@shared/ui';

const [page, setPage] = useState(1);
const itemsPerPage = 10;

// Ejemplo de respuesta del backend con nueva estructura de paginación
const pagination = {
  page: 1,
  totalPages: Math.ceil(sortedData.length / itemsPerPage),
  hasPrevPage: page > 1,
  hasNextPage: page < Math.ceil(sortedData.length / itemsPerPage),
  prevPage: page > 1 ? page - 1 : null,
  nextPage: page < Math.ceil(sortedData.length / itemsPerPage) ? page + 1 : null,
  total: sortedData.length,
  limit: itemsPerPage,
  pagingCounter: (page - 1) * itemsPerPage + 1,
};

const paginatedData = useMemo(() => {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return sortedData.slice(start, end);
}, [sortedData, page]);

return (
  <>
    <Table columns={columns} data={paginatedData} onSort={handleSort} />
    <Pagination page={pagination.page} totalPages={pagination.totalPages} hasPrevPage={pagination.hasPrevPage} hasNextPage={pagination.hasNextPage} prevPage={pagination.prevPage} nextPage={pagination.nextPage} onPageChange={setPage} />
  </>
);
```

### Tabla con Búsqueda

```tsx
import { Search } from '@shared/ui';

// Para datos locales: búsqueda inmediata
const [searchTerm, setSearchTerm] = useState('');

const filteredData = useMemo(() => {
  if (!searchTerm) return tableData;
  const searchLower = searchTerm.toLowerCase();
  return tableData.filter((row) => row.nombre.toLowerCase().includes(searchLower) || row.descripcion.toLowerCase().includes(searchLower));
}, [tableData, searchTerm]);

const { sortedData, handleSort } = useTableSort(filteredData);

return (
  <>
    <Search
      placeholder="Buscar..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onSearch={(value) => {
        // Opcional: para datos locales puede ser igual a onChange
        // o dejarse vacío si quieres búsqueda inmediata
      }}
    />
    <Table columns={columns} data={sortedData} onSort={handleSort} />
  </>
);
```

**Para búsqueda con backend (solo al presionar Enter):**

```tsx
const [searchTerm, setSearchTerm] = useState(''); // Valor del input
const [searchQuery, setSearchQuery] = useState(''); // Valor enviado al backend

useEffect(() => {
  // Hacer petición solo cuando cambia searchQuery (al presionar Enter)
  fetchData({ search: searchQuery });
}, [searchQuery]);

return (
  <>
    <Search
      placeholder="Buscar..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      onSearch={(value) => {
        // Solo se ejecuta al presionar Enter
        setSearchQuery(value);
      }}
      onClear={() => {
        setSearchTerm('');
        setSearchQuery('');
      }}
    />
    <Table columns={columns} data={dataFromAPI} />
  </>
);
```

### Tabla con Clases Personalizadas en Filas

```tsx
<Table
  columns={columns}
  data={data}
  rowClassName={(row, index) => {
    // Filas alternadas
    return index % 2 === 0 ? 'bg-gray-2-light' : '';

    // O basado en el estado
    // return row.estado === 'active' ? 'border-l-4 border-green' : '';
  }}
/>
```

### Tabla sin Acciones (Solo Visualización)

```tsx
<Table
  columns={columns}
  data={data}
  // Sin rowActions ni onRowClick
/>
```

### Tabla Solo con Click Izquierdo (Sin Menú Contextual)

```tsx
<Table
  columns={columns}
  data={data}
  onRowClick={(row) => {
    // Solo mostrar detalles
    setSelectedRow(row);
    setIsDetailModalOpen(true);
  }}
  // Sin rowActions
/>
```

---

## Resumen de Interacciones

### Desktop (≥ 768px)

| Acción              | Evento       | Comportamiento                          |
| ------------------- | ------------ | --------------------------------------- |
| **Click Izquierdo** | `onRowClick` | Muestra el modal de detalles            |
| **Click Derecho**   | `rowActions` | Muestra el menú contextual con acciones |
| **Click en Header** | `onSort`     | Ordena la columna (si `sortable: true`) |

### Móviles (< 768px)

| Acción              | Evento       | Comportamiento                                                            |
| ------------------- | ------------ | ------------------------------------------------------------------------- |
| **Click Izquierdo** | `rowActions` | Muestra el menú contextual con acciones (incluye "Ver" para ver detalles) |
| **Click en Header** | `onSort`     | Ordena la columna (si `sortable: true`)                                   |

> **📱 Nota**: En móviles, el click izquierdo muestra el menú desplegable en lugar del modal para mejorar la experiencia de usuario, ya que el click derecho no está disponible de forma estándar en dispositivos táctiles.

---

## Tips y Mejores Prácticas

1. **Siempre incluye "Ver" al inicio del menú**: Para que funcione correctamente en móviles, siempre agrega la opción "Ver" al inicio de `rowActions`, seguida de un separador.

2. **Siempre usa `sortedData` del hook**: No uses `tableData` directamente en la tabla si tienes ordenamiento activo.

3. **Tipa tus datos**: Define interfaces TypeScript para tus datos para mejor autocompletado y validación.

4. **Memoiza datos derivados**: Si filtras o transformas datos, usa `useMemo` para evitar recálculos innecesarios.

5. **Separa la lógica**: Mantén los handlers de acciones fuera del JSX para mejor legibilidad.

6. **Usa `createStatusActions`**: Para tablas con estados, esta función simplifica mucho la lógica de acciones. Recuerda agregar "Ver" al inicio del array resultante.

7. **Valores por defecto**: El modal de detalles muestra `—` cuando un valor es `null` o `undefined`.

8. **Prueba en móviles**: Siempre verifica que el menú contextual funcione correctamente en dispositivos móviles.

---

## Solución de Problemas

### El ordenamiento no funciona

- ✅ Asegúrate de usar `sortedData` en lugar de `tableData`
- ✅ Verifica que `onSort={handleSort}` esté configurado
- ✅ Confirma que la columna tenga `sortable: true`

### El menú contextual no aparece

- ✅ Verifica que `rowActions` esté configurado
- ✅ Confirma que `rowActions` retorne un array no vacío
- ✅ Usa click derecho, no click izquierdo

### El modal de detalles no se muestra

- ✅ Verifica que `onRowClick` esté configurado
- ✅ Confirma que `isDetailModalOpen` esté en `true`
- ✅ Asegúrate de que `data` no sea `null` en el `DetailModal`

### Los colores de estado no se muestran

- ✅ Verifica que `statusColumn` esté configurado
- ✅ Confirma que `getStatus` retorne un objeto con `status` y `label`
- ✅ Si usas estados personalizados, define los colores en `colors`

---

## Referencias

- **Componente Table**: `libs/frontend/shared/src/ui/Table/Table.tsx`
- **Hook useTableSort**: `libs/frontend/shared/src/ui/Table/useTableSort.ts`
- **Hook useTableFilters**: `libs/frontend/shared/src/ui/Table/useTableFilters.ts`
- **Función createStatusActions**: `libs/frontend/shared/src/ui/Table/statusTransitions.ts`
- **Componente DetailModal**: `libs/frontend/shared/src/ui/DetailModal/DetailModal.tsx`
- **Componente FilterPanel**: `libs/frontend/shared/src/ui/FilterPanel/FilterPanel.tsx`
- **Componente FilterDropdown**: `libs/frontend/shared/src/ui/FilterDropdown/FilterDropdown.tsx`
- **Guía Completa de Filtros**: [COMO_USAR_FILTROS.md](./COMO_USAR_FILTROS.md)

---

¿Tienes preguntas o necesitas ayuda? Revisa los ejemplos en el código o consulta la documentación de los componentes individuales.
