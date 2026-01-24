import { ReactNode, useEffect, useState } from 'react';

/** Tipo para colores que pueden variar según el modo claro/oscuro */
export type ThemeColor = string | { light: string; dark: string };

export interface GroupedColumn {
  /** Clave única del grupo de columnas */
  key: string;
  /** Etiqueta del grupo (ej: "SISTEMAS", "INDUSTRIAL") */
  label: string;
  /** Color del grupo (se aplica al encabezado y a los índices de fila relacionados). Puede ser un string o un objeto con light/dark */
  color?: ThemeColor;
  /** Subcolumnas dentro del grupo */
  subColumns: {
    /** Clave única de la subcolumna */
    key: string;
    /** Etiqueta de la subcolumna (ej: "EGRESADOS", "TITULADOS", "PORCENTAJE") */
    label: string;
    /** Color específico para los valores de esta subcolumna (opcional). Puede ser un string o un objeto con light/dark */
    valueColor?: ThemeColor;
    /** Alineación del contenido */
    align?: 'left' | 'center' | 'right';
  }[];
}

export interface GroupedTableRow {
  /** Clave única de la fila */
  key: string;
  /** Etiqueta de la fila (ej: "AGOSTO 1997-JUNIO 2002") */
  label: string;
  /** Color del índice de la fila (debe coincidir con el color del grupo de columnas). Puede ser un string o un objeto con light/dark */
  labelColor?: ThemeColor;
  /** Datos de la fila: { [groupKey]: { [subColumnKey]: value } } */
  data: Record<string, Record<string, ReactNode>>;
}

export interface GroupedTableProps {
  /** Primera columna (índice de filas) */
  rowIndexColumn: {
    label: string;
    align?: 'left' | 'center' | 'right';
  };
  /** Grupos de columnas */
  columnGroups: GroupedColumn[];
  /** Datos de las filas */
  rows: GroupedTableRow[];
  /** Clase CSS adicional */
  className?: string;
}

/**
 * Hook para detectar si el tema actual es oscuro
 */
function useIsDarkMode(): boolean {
  // Inicializar con el valor correcto desde el inicio para evitar FOUC
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    // Priorizar la clase 'dark' del documento sobre la preferencia del sistema
    // Si el documento tiene la clase 'dark', está en modo oscuro
    // Si no tiene la clase, está en modo claro (independientemente de la preferencia del sistema)
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    // Función para detectar el modo oscuro
    const checkDarkMode = () => {
      // Priorizar la clase 'dark' del documento sobre la preferencia del sistema
      // Si el documento tiene la clase 'dark', está en modo oscuro
      // Si no tiene la clase, está en modo claro (independientemente de la preferencia del sistema)
      const hasDarkClass = document.documentElement.classList.contains('dark');
      setIsDark(hasDarkClass);
    };

    // Verificar inicialmente
    checkDarkMode();

    // Observar cambios en la clase del documento
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // No necesitamos observar cambios en la preferencia del sistema
    // porque el tema se controla mediante la clase 'dark' del documento

    return () => {
      observer.disconnect();
    };
  }, []);

  return isDark;
}

/**
 * Extrae el color correcto según el modo claro/oscuro
 * @param color - Color que puede ser string o objeto con light/dark
 * @param isDark - Si está en modo oscuro
 * @returns Color a usar
 */
function getThemeColor(
  color: ThemeColor | undefined,
  isDark: boolean
): string | undefined {
  if (!color) return undefined;

  if (typeof color === 'string') {
    return color;
  }

  // Si es un objeto, usar el color correspondiente al modo
  return isDark ? color.dark : color.light;
}

/**
 * Componente de tabla con columnas agrupadas y soporte para colores
 *
 * Este componente permite crear tablas con encabezados de dos niveles,
 * donde los grupos de columnas agrupan subcolumnas. Los colores de los
 * encabezados se reflejan en los índices de las filas.
 *
 * Los colores pueden ser strings simples o objetos con `{ light: string, dark: string }`
 * para tener colores diferentes en modo claro y oscuro.
 *
 * @example
 * ```tsx
 * <GroupedTable
 *   rowIndexColumn={{ label: 'POR COHORTE' }}
 *   columnGroups={[
 *     {
 *       key: 'sistemas',
 *       label: 'SISTEMAS',
 *       color: { light: '#0066CC', dark: '#5DA5FF' },
 *       subColumns: [
 *         { key: 'egresados', label: 'EGRESADOS', valueColor: { light: '#0066CC', dark: '#5DA5FF' } },
 *         { key: 'titulados', label: 'TITULADOS', valueColor: { light: '#CC0000', dark: '#FF4444' } },
 *         { key: 'porcentaje', label: 'PORCENTAJE' },
 *       ],
 *     },
 *   ]}
 *   rows={[
 *     {
 *       key: 'cohorte1',
 *       label: 'AGOSTO 1997-JUNIO 2002',
 *       labelColor: { light: '#0066CC', dark: '#5DA5FF' },
 *       data: {
 *         sistemas: {
 *           egresados: 50,
 *           titulados: 45,
 *           porcentaje: '90%',
 *         },
 *       },
 *     },
 *   ]}
 * />
 * ```
 */
export function GroupedTable({
  rowIndexColumn,
  columnGroups,
  rows,
  className = '',
}: GroupedTableProps) {
  // Detectar modo oscuro
  const isDark = useIsDarkMode();

  // Calcular el número total de columnas (1 para índice + todas las subcolumnas)
  const totalColumns =
    1 + columnGroups.reduce((sum, group) => sum + group.subColumns.length, 0);

  return (
    <div
      className={`table-scrollbar overflow-x-auto border bg-(--color-component-bg) border-(--color-gray-1) w-full ${className}`}
    >
      <table
        className="border-collapse"
        style={{
          tableLayout: 'auto',
          width: 'max-content',
          minWidth: '100%',
          display: 'table',
        }}
      >
        {/* Encabezado de dos niveles */}
        <thead>
          {/* Primer nivel: Grupos de columnas */}
          <tr className="bg-gray-2-light dark:bg-gray-3-dark">
            <th
              rowSpan={2}
              className="px-4 py-3 text-left text-sm font-medium whitespace-nowrap border-b border-gray-1-light dark:border-gray-5-dark"
              style={{
                color: 'var(--color-base-secondary-typo)',
                textAlign: rowIndexColumn.align || 'left',
              }}
            >
              {rowIndexColumn.label}
            </th>
            {columnGroups.map((group) => (
              <th
                key={group.key}
                colSpan={group.subColumns.length}
                className="px-4 py-3 text-center text-sm font-medium whitespace-nowrap border-b border-r border-gray-1-light dark:border-gray-5-dark"
                style={{
                  color:
                    getThemeColor(group.color, isDark) ||
                    'var(--color-base-secondary-typo)',
                }}
              >
                {group.label}
              </th>
            ))}
          </tr>
          {/* Segundo nivel: Subcolumnas */}
          <tr className="bg-gray-2-light dark:bg-gray-3-dark">
            {columnGroups.map((group) =>
              group.subColumns.map((subColumn, subIndex) => (
                <th
                  key={`${group.key}-${subColumn.key}`}
                  className={`px-4 py-3 text-center text-sm font-medium whitespace-nowrap border-b ${
                    subIndex < group.subColumns.length - 1
                      ? 'border-r border-gray-1-light dark:border-gray-5-dark'
                      : ''
                  }`}
                  style={{
                    color:
                      getThemeColor(
                        subColumn.valueColor || group.color,
                        isDark
                      ) || 'var(--color-base-secondary-typo)',
                    textAlign: subColumn.align || 'center',
                  }}
                >
                  {subColumn.label}
                </th>
              ))
            )}
          </tr>
        </thead>
        {/* Cuerpo de la tabla */}
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={totalColumns}
                className="px-4 py-8 text-center text-sm"
                style={{ color: 'var(--color-base-secondary-typo)' }}
              >
                No hay datos disponibles
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr
                key={row.key}
                className="border-b border-gray-1-light dark:border-gray-5-dark hover:bg-gray-3-light/50 dark:hover:bg-gray-6-dark/50"
              >
                {/* Índice de la fila */}
                <td
                  className="px-4 py-3 text-sm whitespace-nowrap border-r border-gray-1-light dark:border-gray-5-dark"
                  style={{
                    color:
                      getThemeColor(row.labelColor, isDark) ||
                      'var(--color-base-primary-typo)',
                    textAlign: rowIndexColumn.align || 'left',
                    fontWeight: '500',
                  }}
                >
                  {row.label}
                </td>
                {/* Datos de las columnas agrupadas */}
                {columnGroups.map((group) =>
                  group.subColumns.map((subColumn, subIndex) => {
                    const value = row.data[group.key]?.[subColumn.key];
                    const isLastInGroup =
                      subIndex === group.subColumns.length - 1;

                    return (
                      <td
                        key={`${group.key}-${subColumn.key}`}
                        className={`px-4 py-3 text-sm whitespace-nowrap border-b border-gray-1-light dark:border-gray-5-dark ${
                          !isLastInGroup
                            ? 'border-r border-gray-1-light dark:border-gray-5-dark'
                            : ''
                        }`}
                        style={
                          {
                            color:
                              getThemeColor(subColumn.valueColor, isDark) ||
                              (value !== null && value !== undefined
                                ? 'var(--color-base-primary-typo)'
                                : 'var(--color-base-secondary-typo)'),
                            textAlign: subColumn.align || 'right',
                          } as React.CSSProperties
                        }
                      >
                        {value !== null && value !== undefined ? value : '-'}
                      </td>
                    );
                  })
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
