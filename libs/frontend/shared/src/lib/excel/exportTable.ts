import * as XLSX from 'xlsx';
import type { TableColumn } from '../../ui';

/**
 * Opciones para exportar una tabla a Excel
 */
export interface ExportTableOptions {
  /** Nombre del archivo (sin extensión) */
  filename?: string;
  /** Nombre de la hoja */
  sheetName?: string;
  /** Columnas de la tabla */
  columns: TableColumn[];
  /** Datos de la tabla */
  data: Record<string, unknown>[];
  /** Título opcional para el reporte */
  title?: string;
}

/**
 * Obtiene el valor de una celda desde un objeto anidado usando notación de punto
 * @param obj - Objeto del cual extraer el valor
 * @param path - Ruta en notación de punto (ej: "user.name")
 * @returns Valor encontrado o undefined
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let value: unknown = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
    if (value === undefined || value === null) {
      return undefined;
    }
  }
  return value;
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
    // Si es un objeto con propiedades name, shortName, etc., extraer el name
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
 * Exporta una tabla normal a Excel usando SheetJS
 *
 * @param options - Opciones de exportación
 * @returns Promise que se resuelve cuando se completa la descarga
 *
 * @example
 * ```typescript
 * await exportTable({
 *   filename: 'reporte-estudiantes',
 *   sheetName: 'Estudiantes',
 *   columns: [
 *     { key: 'name', label: 'Nombre' },
 *     { key: 'career.name', label: 'Carrera' },
 *   ],
 *   data: students,
 *   title: 'Reporte de Estudiantes'
 * });
 * ```
 */
export async function exportTable({
  filename = 'tabla',
  sheetName = 'Datos',
  columns,
  data,
  title,
}: ExportTableOptions): Promise<void> {
  // Crear array de arrays para SheetJS
  const aoa: unknown[][] = [];

  // Agregar título si se proporciona
  if (title) {
    aoa.push([title]);
  }

  // Agregar encabezados
  const headers = columns.map((column) => column.label);
  aoa.push(headers);

  // Agregar datos
  data.forEach((row) => {
    const rowData = columns.map((column) => {
      const value = getNestedValue(row, column.key);
      return valueToString(value);
    });
    aoa.push(rowData);
  });

  // Crear worksheet desde array de arrays
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);

  // Si hay título, mergear celdas del título
  if (title) {
    const titleRange = {
      s: { c: 0, r: 0 }, // start: columna 0, fila 0
      e: { c: columns.length - 1, r: 0 }, // end: última columna, fila 0
    };
    if (!worksheet['!merges']) {
      worksheet['!merges'] = [];
    }
    worksheet['!merges'].push(titleRange);
  }

  // Ajustar ancho de columnas
  const colWidths = columns.map((column) => {
    let maxLength = column.label.length;

    // Calcular el ancho máximo basado en los datos
    data.forEach((row) => {
      const value = getNestedValue(row, column.key);
      const valueStr = valueToString(value);
      if (valueStr.length > maxLength) {
        maxLength = valueStr.length;
      }
    });

    // Establecer ancho mínimo de 10 y máximo de 50
    return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
  });

  worksheet['!cols'] = colWidths;

  // Crear workbook y agregar worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Exportar archivo
  XLSX.writeFile(workbook, `${filename}.xlsx`, { compression: true });
}
