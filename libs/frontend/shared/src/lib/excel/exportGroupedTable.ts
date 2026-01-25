import * as XLSX from 'xlsx';
import type { GroupedColumn, GroupedTableRow } from '../../ui';

/**
 * Opciones para exportar una tabla agrupada a Excel
 */
export interface ExportGroupedTableOptions {
  /** Nombre del archivo (sin extensión) */
  filename?: string;
  /** Nombre de la hoja */
  sheetName?: string;
  /** Etiqueta de la columna de índice de filas */
  rowIndexLabel: string;
  /** Grupos de columnas */
  columnGroups: GroupedColumn[];
  /** Filas de datos */
  rows: GroupedTableRow[];
  /** Título opcional para el reporte */
  title?: string;
}

/**
 * Convierte un valor a string para Excel
 * @param value - Valor a convertir
 * @returns String representando el valor (cadena vacía si no hay dato)
 */
function valueToString(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if (obj.name !== undefined) {
      const nameStr = String(obj.name);
      // Convertir "—" y "-" a cadena vacía
      return nameStr === '—' || nameStr === '-' ? '' : nameStr;
    }
    if (obj.shortName !== undefined) {
      const shortNameStr = String(obj.shortName);
      // Convertir "—" y "-" a cadena vacía
      return shortNameStr === '—' || shortNameStr === '-' ? '' : shortNameStr;
    }
    return JSON.stringify(value);
  }
  const strValue = String(value);
  // Convertir "—" y "-" a cadena vacía para que las celdas queden vacías
  return strValue === '—' || strValue === '-' ? '' : strValue;
}

/**
 * Exporta una tabla agrupada a Excel manteniendo la estructura visual usando SheetJS
 *
 * @param options - Opciones de exportación
 * @returns Promise que se resuelve cuando se completa la descarga
 *
 * @example
 * ```typescript
 * await exportGroupedTable({
 *   filename: 'reporte-agrupado',
 *   sheetName: 'Reporte',
 *   rowIndexLabel: 'POR COHORTE',
 *   columnGroups: [
 *     {
 *       key: 'sistemas',
 *       label: 'SISTEMAS',
 *       subColumns: [
 *         { key: 'egresados', label: 'EGRESADOS' },
 *         { key: 'titulados', label: 'TITULADOS' },
 *       ],
 *     },
 *   ],
 *   rows: groupedRows,
 *   title: 'Reporte por Generaciones'
 * });
 * ```
 */
export async function exportGroupedTable({
  filename = 'tabla-agrupada',
  sheetName = 'Datos',
  rowIndexLabel,
  columnGroups,
  rows,
  title,
}: ExportGroupedTableOptions): Promise<void> {
  // Crear array de arrays para SheetJS
  const aoa: unknown[][] = [];

  // Calcular número total de columnas (1 para índice + todas las subcolumnas)
  const totalColumns =
    1 + columnGroups.reduce((sum, group) => sum + group.subColumns.length, 0);

  // Agregar título si se proporciona
  if (title) {
    aoa.push([title]);
  }

  // Primera fila de encabezados: Grupos de columnas
  const groupHeaderRow: unknown[] = [rowIndexLabel]; // Columna de índice
  columnGroups.forEach((group) => {
    // Agregar el label del grupo repetido para cada subcolumna
    group.subColumns.forEach(() => {
      groupHeaderRow.push(group.label);
    });
  });
  aoa.push(groupHeaderRow);

  // Segunda fila de encabezados: Subcolumnas
  const subColumnHeaderRow: unknown[] = [rowIndexLabel]; // Columna de índice (mergeada)
  columnGroups.forEach((group) => {
    group.subColumns.forEach((subColumn) => {
      subColumnHeaderRow.push(subColumn.label);
    });
  });
  aoa.push(subColumnHeaderRow);

  // Agregar datos
  rows.forEach((row) => {
    const dataRow: unknown[] = [row.label]; // Columna de índice
    columnGroups.forEach((group) => {
      group.subColumns.forEach((subColumn) => {
        const value = row.data[group.key]?.[subColumn.key];
        dataRow.push(valueToString(value));
      });
    });
    aoa.push(dataRow);
  });

  // Crear worksheet desde array de arrays
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Configurar merges para mantener la estructura visual
  const merges: XLSX.Range[] = [];

  // Merge del título si existe
  if (title) {
    merges.push({
      s: { c: 0, r: 0 },
      e: { c: totalColumns - 1, r: 0 },
    });
  }

  // Merge de la columna de índice en las dos filas de encabezados
  const titleOffset = title ? 1 : 0; // Offset si hay título
  merges.push({
    s: { c: 0, r: titleOffset },
    e: { c: 0, r: titleOffset + 1 },
  });

  // Merges para los grupos de columnas en la primera fila de encabezados
  let currentCol = 1; // Empezar después de la columna de índice
  columnGroups.forEach((group) => {
    const colspan = group.subColumns.length;
    if (colspan > 1) {
      merges.push({
        s: { c: currentCol, r: titleOffset },
        e: { c: currentCol + colspan - 1, r: titleOffset },
      });
    }
    currentCol += colspan;
  });

  worksheet['!merges'] = merges;

  // Ajustar ancho de columnas
  const colWidths: XLSX.ColInfo[] = [];

  // Columna de índice
  let maxIndexLength = rowIndexLabel.length;
  rows.forEach((row) => {
    if (row.label.length > maxIndexLength) {
      maxIndexLength = row.label.length;
    }
  });
  colWidths.push({ wch: Math.min(Math.max(maxIndexLength + 2, 15), 50) });

  // Columnas de datos
  columnGroups.forEach((group) => {
    group.subColumns.forEach((subColumn) => {
      let maxLength = subColumn.label.length;
      rows.forEach((row) => {
        const value = row.data[group.key]?.[subColumn.key];
        const valueStr = valueToString(value);
        if (valueStr.length > maxLength) {
          maxLength = valueStr.length;
        }
      });
      colWidths.push({ wch: Math.min(Math.max(maxLength + 2, 10), 30) });
    });
  });

  worksheet['!cols'] = colWidths;

  // Crear workbook y agregar worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Exportar archivo
  XLSX.writeFile(workbook, `${filename}.xlsx`, { compression: true });
}
