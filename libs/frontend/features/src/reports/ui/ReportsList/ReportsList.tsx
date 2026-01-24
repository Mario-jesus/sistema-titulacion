import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Input,
  Button,
  Modal,
  useToast,
  Table,
  GroupedTable,
} from '@shared/ui';
import type { TableColumn } from '@shared/ui';
import type { GroupedColumn, GroupedTableRow } from '@shared/ui';
import { useReports } from '../../lib/useReports';
import { useCareers } from '@features/careers';
import type {
  ReportType,
  ReportByGenerationsGroupedResponse,
  ReportByGenerationsTableResponse,
  ReportByCareersTableResponse,
  ReportOverallSummaryResponse,
} from '../../model/types';

/**
 * Componente de Lista de Reportes
 *
 * Este componente será el encargado de mostrar y gestionar todos los reportes del sistema.
 */

// Clave para localStorage
const REPORT_CONFIG_STORAGE_KEY = 'reports_config';

// Interfaz para la configuración guardada
interface SavedReportConfig {
  dateRangeType: 'specific' | 'general';
  startYear: string;
  endYear: string;
  careersType: 'specific' | 'general';
  selectedCareers: string[];
  graduationRateDenominator: 'ingreso' | 'egreso';
  includeOtherValue: boolean;
  reportType: ReportType;
}

// Valores por defecto
const defaultConfig: SavedReportConfig = {
  dateRangeType: 'general',
  startYear: '',
  endYear: '',
  careersType: 'general',
  selectedCareers: [],
  graduationRateDenominator: 'egreso',
  includeOtherValue: false,
  reportType: 'por-generaciones',
};

// Función para cargar configuración desde localStorage
const loadConfigFromStorage = (): SavedReportConfig => {
  try {
    const savedConfig = localStorage.getItem(REPORT_CONFIG_STORAGE_KEY);
    if (savedConfig) {
      const config: SavedReportConfig = JSON.parse(savedConfig);
      // Validar que todos los campos requeridos estén presentes
      return {
        dateRangeType: config.dateRangeType || defaultConfig.dateRangeType,
        startYear: config.startYear ?? defaultConfig.startYear,
        endYear: config.endYear ?? defaultConfig.endYear,
        careersType: config.careersType || defaultConfig.careersType,
        selectedCareers: Array.isArray(config.selectedCareers)
          ? config.selectedCareers
          : defaultConfig.selectedCareers,
        graduationRateDenominator:
          config.graduationRateDenominator ||
          defaultConfig.graduationRateDenominator,
        includeOtherValue:
          typeof config.includeOtherValue === 'boolean'
            ? config.includeOtherValue
            : defaultConfig.includeOtherValue,
        reportType: config.reportType || defaultConfig.reportType,
      };
    }
  } catch (error) {
    console.warn('Error al cargar configuración guardada:', error);
  }
  return defaultConfig;
};

export function ReportsList() {
  // Hooks de Redux
  const { currentReport, isLoading, error, generateReport, clearReportError } =
    useReports();
  const { careers, listCareers } = useCareers();
  const { showToast } = useToast();

  // Cargar configuración inicial desde localStorage
  const initialConfig = useMemo(() => loadConfigFromStorage(), []);

  // Estado para controlar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para rango de fechas - inicializar desde localStorage
  const [dateRangeType, setDateRangeType] = useState<'specific' | 'general'>(
    initialConfig.dateRangeType
  );
  const [startYear, setStartYear] = useState<string>(initialConfig.startYear);
  const [endYear, setEndYear] = useState<string>(initialConfig.endYear);

  // Estados para carreras - inicializar desde localStorage
  const [careersType, setCareersType] = useState<'specific' | 'general'>(
    initialConfig.careersType
  );
  const [selectedCareers, setSelectedCareers] = useState<string[]>(
    initialConfig.selectedCareers
  );

  // Estados para columnas de valores - inicializar desde localStorage
  // Selecciona con qué calcular el porcentaje de titulados
  const [graduationRateDenominator, setGraduationRateDenominator] = useState<
    'ingreso' | 'egreso'
  >(initialConfig.graduationRateDenominator);
  // Incluir el valor no seleccionado solo para mostrar información (no para calcular porcentajes)
  const [includeOtherValue, setIncludeOtherValue] = useState<boolean>(
    initialConfig.includeOtherValue
  );

  // Estados para tipo de reporte - inicializar desde localStorage
  const [reportType, setReportType] = useState<ReportType>(
    initialConfig.reportType
  );

  // Bandera para evitar guardar en el primer render
  const [isInitialized, setIsInitialized] = useState(false);

  // Marcar como inicializado después del primer render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Guardar configuración en localStorage cada vez que cambie (solo después de la inicialización)
  useEffect(() => {
    if (!isInitialized) return;

    const config: SavedReportConfig = {
      dateRangeType,
      startYear,
      endYear,
      careersType,
      selectedCareers,
      graduationRateDenominator,
      includeOtherValue,
      reportType,
    };
    try {
      localStorage.setItem(REPORT_CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
      console.warn('Error al guardar configuración:', error);
    }
  }, [
    isInitialized,
    dateRangeType,
    startYear,
    endYear,
    careersType,
    selectedCareers,
    graduationRateDenominator,
    includeOtherValue,
    reportType,
  ]);

  // Cargar carreras al montar el componente
  useEffect(() => {
    const loadCareers = async () => {
      const result = await listCareers({ limit: 1000, activeOnly: true });
      if (!result.success) {
        showToast({
          type: 'error',
          title: 'Error al cargar carreras',
          message: result.error || 'No se pudieron cargar las carreras',
        });
      }
    };
    loadCareers();
  }, [listCareers, showToast]);

  // Limpiar error cuando se cierra el modal
  useEffect(() => {
    if (!isModalOpen && error) {
      clearReportError();
    }
  }, [isModalOpen, error, clearReportError]);

  // Manejar selección de carreras
  const handleCareerToggle = (careerId: string) => {
    setSelectedCareers((prev) => {
      if (prev.includes(careerId)) {
        return prev.filter((id) => id !== careerId);
      }
      return [...prev, careerId];
    });
  };

  const currentYear = new Date().getFullYear();
  const minYear = 1990;
  const maxYear = currentYear + 10;

  // Colores para modo claro y oscuro
  // Colores balanceados: claros pero visibles en modo claro
  const blueColor = { light: '#0066CC', dark: '#5DA5FF' }; // Azul balanceado en modo claro
  const redColor = { light: '#CC0000', dark: '#FF4444' }; // Rojo balanceado en modo claro
  const greenColor = { light: '#008844', dark: '#44CC88' }; // Verde balanceado en modo claro para OtherValue
  const orangeColor = { light: '#FF6600', dark: '#FFAA44' }; // Naranja balanceado en modo claro para Porcentajes

  // Función helper para transformar reporte agrupado a formato GroupedTable
  const transformGroupedReport = useCallback(
    (report: ReportByGenerationsGroupedResponse) => {
      const { careers, generations, data, metadata } = report;
      const { graduationRateDenominator, includeOtherValue } = metadata;

      // Determinar el orden de las columnas según includeOtherValue
      // Si includeOtherValue está activo: OtherValue -> graduationRateDenominator -> Titulados -> Porcentajes
      // Si no está activo: graduationRateDenominator -> Titulados -> Porcentajes
      const getSubColumnsForCareer = (): GroupedColumn['subColumns'] => {
        const subColumns: GroupedColumn['subColumns'] = [];

        // Si includeOtherValue está activo, agregar OtherValue primero (con color diferente)
        if (includeOtherValue) {
          if (graduationRateDenominator === 'egreso') {
            subColumns.push({
              key: 'ingresos',
              label: 'INGRESOS',
              valueColor: greenColor,
              align: 'right',
            });
          } else {
            subColumns.push({
              key: 'egresados',
              label: 'EGRESADOS',
              valueColor: greenColor,
              align: 'right',
            });
          }
        }

        // Agregar el graduationRateDenominator (siempre se agrega)
        if (graduationRateDenominator === 'ingreso') {
          subColumns.push({
            key: 'ingresos',
            label: 'INGRESOS',
            valueColor: blueColor,
            align: 'right',
          });
        } else {
          subColumns.push({
            key: 'egresados',
            label: 'EGRESADOS',
            valueColor: blueColor,
            align: 'right',
          });
        }

        // Agregar Titulados
        subColumns.push({
          key: 'titulados',
          label: 'TITULADOS',
          valueColor: redColor,
          align: 'right',
        });

        // Agregar Porcentajes al final (con color diferente)
        subColumns.push({
          key: 'porcentaje',
          label: 'PORCENTAJE',
          valueColor: orangeColor,
          align: 'right',
        });

        return subColumns;
      };

      // Crear grupos de columnas (uno por carrera + totales)
      // Los nombres de las carreras usan el color por defecto de los encabezados
      const columnGroups: GroupedColumn[] = careers.map((career) => ({
        key: career.id,
        label: career.shortName.toUpperCase(),
        // Sin color específico para usar el color por defecto de los encabezados
        subColumns: getSubColumnsForCareer(),
      }));

      // Agregar columna de totales (sin porcentaje)
      const getSubColumnsForTotals = (): GroupedColumn['subColumns'] => {
        const subColumns: GroupedColumn['subColumns'] = [];

        // Si includeOtherValue está activo, agregar OtherValue primero (con color diferente)
        if (includeOtherValue) {
          if (graduationRateDenominator === 'egreso') {
            subColumns.push({
              key: 'ingresos',
              label: 'INGRESOS',
              valueColor: greenColor,
              align: 'right',
            });
          } else {
            subColumns.push({
              key: 'egresados',
              label: 'EGRESADOS',
              valueColor: greenColor,
              align: 'right',
            });
          }
        }

        // Agregar el graduationRateDenominator
        if (graduationRateDenominator === 'ingreso') {
          subColumns.push({
            key: 'ingresos',
            label: 'INGRESOS',
            valueColor: blueColor,
            align: 'right',
          });
        } else {
          subColumns.push({
            key: 'egresados',
            label: 'EGRESADOS',
            valueColor: blueColor,
            align: 'right',
          });
        }

        // Agregar Titulados
        subColumns.push({
          key: 'titulados',
          label: 'TITULADOS',
          valueColor: redColor,
          align: 'right',
        });

        return subColumns;
      };

      columnGroups.push({
        key: 'totales',
        label: 'TOTALES',
        // Sin color específico para usar el color por defecto de los encabezados
        subColumns: getSubColumnsForTotals(),
      });

      // Crear filas (una por generación)
      const rows: GroupedTableRow[] = generations.map((generation) => {
        const generationData = data[generation.id];
        const rowData: Record<string, Record<string, string | number>> = {};

        // Datos por carrera
        careers.forEach((career) => {
          const metrics = generationData[career.id] as any;
          if (metrics) {
            const careerRowData: Record<string, string | number> = {};

            // Si includeOtherValue está activo, agregar OtherValue primero
            if (includeOtherValue) {
              if (graduationRateDenominator === 'egreso') {
                // OtherValue es ingreso
                careerRowData.ingresos = metrics.ingreso || 0;
              } else {
                // OtherValue es egreso
                careerRowData.egresados = metrics.egreso || 0;
              }
            }

            // Agregar el graduationRateDenominator (siempre se agrega)
            if (graduationRateDenominator === 'ingreso') {
              careerRowData.ingresos = metrics.ingreso || 0;
            } else {
              careerRowData.egresados = metrics.egreso || 0;
            }

            // Agregar Titulados
            careerRowData.titulados = metrics.titulados || 0;

            // Agregar Porcentajes (usar el que viene del backend o calcular si no viene)
            let porcentajeValue = '0.00';
            if (metrics.porcentaje != null) {
              porcentajeValue = metrics.porcentaje.toFixed(2);
            } else {
              // Calcular porcentaje si no viene del backend
              const denominator =
                graduationRateDenominator === 'ingreso'
                  ? metrics.ingreso || 0
                  : metrics.egreso || 0;
              if (denominator > 0 && metrics.titulados) {
                porcentajeValue = (
                  (metrics.titulados / denominator) *
                  100
                ).toFixed(2);
              }
            }
            careerRowData.porcentaje = `${porcentajeValue}%`;

            rowData[career.id] = careerRowData;
          }
        });

        // Totales de la generación
        const totals = generationData.totales;
        const totalsRowData: Record<string, string | number> = {};

        // Si includeOtherValue está activo, agregar OtherValue primero
        if (includeOtherValue) {
          if (graduationRateDenominator === 'egreso') {
            totalsRowData.ingresos = totals.ingreso || 0;
          } else {
            totalsRowData.egresados = totals.egreso || 0;
          }
        }

        // Agregar el graduationRateDenominator
        if (graduationRateDenominator === 'ingreso') {
          totalsRowData.ingresos = totals.ingreso || 0;
        } else {
          totalsRowData.egresados = totals.egreso || 0;
        }

        // Agregar Titulados
        totalsRowData.titulados = totals.titulados || 0;

        rowData.totales = totalsRowData;

        return {
          key: generation.id,
          label: generation.name.toUpperCase(),
          data: rowData,
        };
      });

      return { columnGroups, rows };
    },
    []
  );

  // Función helper para transformar reporte de generaciones (tabla plana) a formato Table
  const transformGenerationsTableReport = useCallback(
    (report: ReportByGenerationsTableResponse) => {
      const columns: TableColumn[] = [
        { key: 'generation.name', label: 'Generación', align: 'left' },
      ];

      if (report.metadata.includeOtherValue) {
        if (report.metadata.graduationRateDenominator === 'egreso') {
          columns.push({ key: 'ingreso', label: 'Ingreso', align: 'right' });
        } else {
          columns.push({ key: 'egreso', label: 'Egreso', align: 'right' });
        }
      }

      if (report.metadata.graduationRateDenominator === 'ingreso') {
        columns.push({ key: 'ingreso', label: 'Ingreso', align: 'right' });
      } else {
        columns.push({ key: 'egreso', label: 'Egreso', align: 'right' });
      }

      columns.push(
        { key: 'titulados', label: 'Titulados', align: 'right' },
        { key: 'porcentaje', label: '%', align: 'right' }
      );

      const tableData = report.data.map((row) => {
        const porcentaje =
          row.porcentaje != null ? row.porcentaje.toFixed(2) : '0.00';
        const rowData: any = {
          generation: row.generation,
          titulados: row.titulados,
          porcentaje: `${porcentaje}%`,
        };

        // Agregar valores según el denominador y includeOtherValue
        if (report.metadata.graduationRateDenominator === 'ingreso') {
          rowData.ingreso = row.ingreso;
          if (report.metadata.includeOtherValue) {
            rowData.egreso = row.egreso;
          }
        } else {
          rowData.egreso = row.egreso;
          if (report.metadata.includeOtherValue) {
            rowData.ingreso = row.ingreso;
          }
        }

        return rowData;
      });

      // Agregar fila de totales
      const grandTotalPorcentaje =
        report.grandTotal.porcentaje != null
          ? report.grandTotal.porcentaje.toFixed(2)
          : '0.00';
      const totalRowData: any = {
        generation: { id: 'total', name: 'TOTAL', startYear: '', endYear: '' },
        titulados: report.grandTotal.titulados,
        porcentaje: `${grandTotalPorcentaje}%`,
      };

      // Agregar valores según el denominador y includeOtherValue
      if (report.metadata.graduationRateDenominator === 'ingreso') {
        totalRowData.ingreso = report.grandTotal.ingreso;
        if (report.metadata.includeOtherValue) {
          totalRowData.egreso = report.grandTotal.egreso;
        }
      } else {
        totalRowData.egreso = report.grandTotal.egreso;
        if (report.metadata.includeOtherValue) {
          totalRowData.ingreso = report.grandTotal.ingreso;
        }
      }

      tableData.push(totalRowData);

      return { columns, data: tableData };
    },
    []
  );

  // Función helper para transformar reporte de carreras (tabla plana) a formato Table
  const transformCareersTableReport = useCallback(
    (report: ReportByCareersTableResponse) => {
      const columns: TableColumn[] = [
        { key: 'career.name', label: 'Carrera', align: 'left' },
      ];

      // Agregar columnas por generación (solo titulados)
      report.generations.forEach((generation) => {
        columns.push({
          key: `valuesByGeneration.${generation.id}`,
          label: generation.name,
          align: 'right',
        });
      });

      // Agregar columnas de totales según el denominador y includeOtherValue
      const { graduationRateDenominator, includeOtherValue } = report.metadata;

      // Si includeOtherValue está activo, agregar OtherValue primero
      if (includeOtherValue) {
        if (graduationRateDenominator === 'egreso') {
          columns.push({
            key: 'ingreso',
            label: 'TOTAL INGRESOS',
            align: 'right',
          });
        } else {
          columns.push({
            key: 'egreso',
            label: 'TOTAL EGRESADOS',
            align: 'right',
          });
        }
      }

      // Agregar el graduationRateDenominator
      if (graduationRateDenominator === 'ingreso') {
        columns.push({
          key: 'ingreso',
          label: 'TOTAL INGRESOS',
          align: 'right',
        });
      } else {
        columns.push({
          key: 'egreso',
          label: 'TOTAL EGRESADOS',
          align: 'right',
        });
      }

      // Agregar Titulados y Porcentaje
      columns.push(
        { key: 'titulados', label: 'TOTAL TITULADOS', align: 'right' },
        { key: 'porcentaje', label: '%', align: 'right' }
      );

      const tableData = report.data.map((row) => {
        const porcentaje =
          row.porcentaje != null ? row.porcentaje.toFixed(2) : '0.00';
        const rowData: any = {
          career: row.career,
          titulados: row.titulados,
          porcentaje: `${porcentaje}%`,
          valuesByGeneration: row.valuesByGeneration,
        };

        // Agregar valores según el denominador y includeOtherValue
        if (graduationRateDenominator === 'ingreso') {
          rowData.ingreso = row.ingreso;
          if (includeOtherValue) {
            rowData.egreso = row.egreso;
          }
        } else {
          rowData.egreso = row.egreso;
          if (includeOtherValue) {
            rowData.ingreso = row.ingreso;
          }
        }

        return rowData;
      });

      // Agregar fila de totales
      const grandTotalPorcentaje =
        report.grandTotal.porcentaje != null
          ? report.grandTotal.porcentaje.toFixed(2)
          : '0.00';
      const totalRow: any = {
        career: { id: 'total', name: 'TOTAL', shortName: 'TOTAL' },
        titulados: report.grandTotal.titulados,
        porcentaje: `${grandTotalPorcentaje}%`,
        valuesByGeneration: {},
      };

      // Agregar valores según el denominador y includeOtherValue
      if (graduationRateDenominator === 'ingreso') {
        totalRow.ingreso = report.grandTotal.ingreso;
        if (includeOtherValue) {
          totalRow.egreso = report.grandTotal.egreso;
        }
      } else {
        totalRow.egreso = report.grandTotal.egreso;
        if (includeOtherValue) {
          totalRow.ingreso = report.grandTotal.ingreso;
        }
      }

      // Calcular totales por generación
      report.generations.forEach((generation) => {
        totalRow.valuesByGeneration[generation.id] = report.data.reduce(
          (sum, row) => sum + (row.valuesByGeneration[generation.id] || 0),
          0
        );
      });

      tableData.push(totalRow);

      return { columns, data: tableData };
    },
    []
  );

  // Función helper para transformar reporte de resumen a formato Table
  const transformSummaryReport = useCallback(
    (report: ReportOverallSummaryResponse) => {
      const { graduationRateDenominator, includeOtherValue } = report.metadata;
      const columns: TableColumn[] = [
        { key: 'label', label: '', align: 'left' },
      ];

      // Si includeOtherValue está activo, agregar OtherValue primero
      if (includeOtherValue) {
        if (graduationRateDenominator === 'egreso') {
          columns.push({
            key: 'ingreso',
            label: 'TOTAL INGRESOS',
            align: 'right',
          });
        } else {
          columns.push({
            key: 'egreso',
            label: 'TOTAL EGRESADOS',
            align: 'right',
          });
        }
      }

      // Agregar el graduationRateDenominator
      if (graduationRateDenominator === 'ingreso') {
        columns.push({
          key: 'ingreso',
          label: 'TOTAL INGRESOS',
          align: 'right',
        });
      } else {
        columns.push({
          key: 'egreso',
          label: 'TOTAL EGRESADOS',
          align: 'right',
        });
      }

      // Agregar Titulados y Porcentaje
      columns.push(
        { key: 'titulados', label: 'TOTAL TITULADOS', align: 'right' },
        { key: 'porcentaje', label: '%', align: 'right' }
      );

      const porcentaje =
        report.data.porcentaje != null
          ? report.data.porcentaje.toFixed(2)
          : '0.00';

      const rowData: any = {
        label: 'TOTAL',
        titulados: report.data.titulados,
        porcentaje: `${porcentaje}%`,
      };

      // Agregar valores según el denominador y includeOtherValue
      if (graduationRateDenominator === 'ingreso') {
        rowData.ingreso = report.data.ingreso;
        if (includeOtherValue) {
          rowData.egreso = report.data.egreso;
        }
      } else {
        rowData.egreso = report.data.egreso;
        if (includeOtherValue) {
          rowData.ingreso = report.data.ingreso;
        }
      }

      const tableData = [rowData];

      return { columns, data: tableData };
    },
    []
  );

  // Renderizar tabla según el tipo de reporte
  const renderReportTable = useMemo(() => {
    if (!currentReport) return null;

    switch (currentReport.tableType) {
      case 'grouped': {
        const grouped = transformGroupedReport(
          currentReport as ReportByGenerationsGroupedResponse
        );
        return (
          <GroupedTable
            rowIndexColumn={{ label: 'POR COHORTE', align: 'left' }}
            columnGroups={grouped.columnGroups}
            rows={grouped.rows}
          />
        );
      }

      case 'table': {
        if (currentReport.type === 'por-generaciones') {
          const table = transformGenerationsTableReport(
            currentReport as ReportByGenerationsTableResponse
          );
          return <Table columns={table.columns} data={table.data} />;
        } else {
          const table = transformCareersTableReport(
            currentReport as ReportByCareersTableResponse
          );
          return <Table columns={table.columns} data={table.data} />;
        }
      }

      case 'summary': {
        const table = transformSummaryReport(
          currentReport as ReportOverallSummaryResponse
        );
        return <Table columns={table.columns} data={table.data} />;
      }

      default:
        return null;
    }
  }, [
    currentReport,
    transformGroupedReport,
    transformGenerationsTableReport,
    transformCareersTableReport,
    transformSummaryReport,
  ]);

  // Función para limpiar todos los filtros y el localStorage
  const handleClearFilters = () => {
    // Restaurar valores por defecto
    setDateRangeType(defaultConfig.dateRangeType);
    setStartYear(defaultConfig.startYear);
    setEndYear(defaultConfig.endYear);
    setCareersType(defaultConfig.careersType);
    setSelectedCareers(defaultConfig.selectedCareers);
    setGraduationRateDenominator(defaultConfig.graduationRateDenominator);
    setIncludeOtherValue(defaultConfig.includeOtherValue);
    setReportType(defaultConfig.reportType);

    // Limpiar localStorage
    try {
      localStorage.removeItem(REPORT_CONFIG_STORAGE_KEY);
    } catch (error) {
      console.warn('Error al limpiar configuración:', error);
    }
  };

  // Función para generar reporte
  const handleGenerateReport = useCallback(async () => {
    const request = {
      dateRange: {
        type: dateRangeType,
        ...(dateRangeType === 'specific' && startYear && endYear
          ? {
              startYear: parseInt(startYear, 10),
              endYear: parseInt(endYear, 10),
            }
          : {}),
      },
      careers: {
        type: careersType,
        ...(careersType === 'specific' && selectedCareers.length > 0
          ? { selected: selectedCareers }
          : {}),
      },
      graduationRateDenominator,
      includeOtherValue,
      reportType,
    };

    const result = await generateReport(request);

    if (result.success) {
      showToast({
        type: 'success',
        title: 'Reporte generado',
        message: 'El reporte se ha generado exitosamente',
      });
      setIsModalOpen(false);
    } else {
      showToast({
        type: 'error',
        title: 'Error al generar reporte',
        message: result.error || 'No se pudo generar el reporte',
      });
    }
  }, [
    dateRangeType,
    startYear,
    endYear,
    careersType,
    selectedCareers,
    graduationRateDenominator,
    includeOtherValue,
    reportType,
    generateReport,
    showToast,
  ]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header simplificado */}
      <div className="rounded-lg mt-6 p-6 bg-(--color-component-bg)">
        <div className="flex items-center justify-between">
          <h2
            className="text-xl font-semibold"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            Reportes
          </h2>
          <Button
            variant="outline"
            size="small"
            onClick={() => setIsModalOpen(true)}
          >
            Configurar Reporte
          </Button>
        </div>
      </div>

      {/* Modal con todos los controladores */}
      <Modal
        title="Configurar Reporte"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="xl"
      >
        <div className="flex flex-col gap-6">
          {/* Sección 1: Rango de Fechas (Generaciones) */}
          <div className="flex flex-col gap-3">
            <h3
              className="text-base font-medium"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              Rango de Fechas (Generaciones)
            </h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dateRangeType"
                  checked={dateRangeType === 'general'}
                  onChange={() => {
                    setDateRangeType('general');
                    setStartYear('');
                    setEndYear('');
                  }}
                  className="w-4 h-4"
                  style={{
                    accentColor: 'var(--color-primary-color)',
                  }}
                />
                <span style={{ color: 'var(--color-base-primary-typo)' }}>
                  General (Todas las generaciones)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dateRangeType"
                  checked={dateRangeType === 'specific'}
                  onChange={() => setDateRangeType('specific')}
                  className="w-4 h-4"
                  style={{
                    accentColor: 'var(--color-primary-color)',
                  }}
                />
                <span style={{ color: 'var(--color-base-primary-typo)' }}>
                  Rango específico
                </span>
              </label>
            </div>
            {dateRangeType === 'specific' && (
              <div className="flex items-center gap-4">
                <Input
                  label="Año de inicio"
                  type="number"
                  variant="year"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  min={minYear}
                  max={maxYear}
                  placeholder="2020"
                  className="max-w-[150px]"
                />
                <Input
                  label="Año de fin"
                  type="number"
                  variant="year"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  min={minYear}
                  max={maxYear}
                  placeholder="2024"
                  className="max-w-[150px]"
                />
              </div>
            )}
          </div>

          {/* Separador */}
          <div className="h-px w-full bg-gray-3-light dark:bg-gray-6-dark" />

          {/* Sección 2: Carreras */}
          <div className="flex flex-col gap-3">
            <h3
              className="text-base font-medium"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              Carreras
            </h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="careersType"
                  checked={careersType === 'general'}
                  onChange={() => {
                    setCareersType('general');
                    setSelectedCareers([]);
                  }}
                  className="w-4 h-4"
                  style={{
                    accentColor: 'var(--color-primary-color)',
                  }}
                />
                <span style={{ color: 'var(--color-base-primary-typo)' }}>
                  General (Todas las carreras)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="careersType"
                  checked={careersType === 'specific'}
                  onChange={() => setCareersType('specific')}
                  className="w-4 h-4"
                  style={{
                    accentColor: 'var(--color-primary-color)',
                  }}
                />
                <span style={{ color: 'var(--color-base-primary-typo)' }}>
                  Carreras específicas
                </span>
              </label>
            </div>
            {careersType === 'specific' && (
              <div className="flex flex-wrap gap-3 p-4 rounded-lg border border-gray-2">
                {careers.length === 0 ? (
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-base-secondary-typo)' }}
                  >
                    Cargando carreras...
                  </span>
                ) : (
                  careers.map((career) => (
                    <label
                      key={career.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCareers.includes(career.id)}
                        onChange={() => handleCareerToggle(career.id)}
                        className="w-4 h-4"
                        style={{
                          accentColor: 'var(--color-primary-color)',
                        }}
                      />
                      <span style={{ color: 'var(--color-base-primary-typo)' }}>
                        {career.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Separador */}
          <div className="h-px w-full bg-gray-3-light dark:bg-gray-6-dark" />

          {/* Sección 3: Columnas de Valores Numéricos */}
          <div className="flex flex-col gap-3">
            <h3
              className="text-base font-medium"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              Columnas de Valores
            </h3>
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: 'var(--color-base-primary-typo)' }}
              >
                Calcular porcentaje de titulados como:
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="graduationRateDenominator"
                    checked={graduationRateDenominator === 'ingreso'}
                    onChange={() => {
                      setGraduationRateDenominator('ingreso');
                      setIncludeOtherValue(false);
                    }}
                    className="w-4 h-4"
                    style={{
                      accentColor: 'var(--color-primary-color)',
                    }}
                  />
                  <span style={{ color: 'var(--color-base-primary-typo)' }}>
                    Titulados / Ingresos
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="graduationRateDenominator"
                    checked={graduationRateDenominator === 'egreso'}
                    onChange={() => {
                      setGraduationRateDenominator('egreso');
                      setIncludeOtherValue(false);
                    }}
                    className="w-4 h-4"
                    style={{
                      accentColor: 'var(--color-primary-color)',
                    }}
                  />
                  <span style={{ color: 'var(--color-base-primary-typo)' }}>
                    Titulados / Egresos
                  </span>
                </label>
              </div>

              {/* Opción para incluir el valor no seleccionado (solo informativo) */}
              <div className="mt-2 p-3 rounded-lg bg-gray-3-light dark:bg-gray-3-dark">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeOtherValue}
                    onChange={(e) => setIncludeOtherValue(e.target.checked)}
                    className="w-4 h-4"
                    style={{
                      accentColor: 'var(--color-primary-color)',
                    }}
                  />
                  <div className="flex flex-col">
                    <span style={{ color: 'var(--color-base-primary-typo)' }}>
                      Incluir{' '}
                      {graduationRateDenominator === 'ingreso'
                        ? 'Egresos'
                        : 'Ingresos'}{' '}
                      en la tabla
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: 'var(--color-base-secondary-typo)' }}
                    >
                      Solo para mostrar información, no se usa para calcular
                      porcentajes
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="h-px w-full bg-gray-3-light dark:bg-gray-6-dark" />

          {/* Sección 4: Tipo de Reporte */}
          <div className="flex flex-col gap-3">
            <h3
              className="text-base font-medium"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              Tipo de Reporte
            </h3>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  checked={reportType === 'por-carreras'}
                  onChange={() => setReportType('por-carreras')}
                  className="w-4 h-4"
                  style={{
                    accentColor: 'var(--color-primary-color)',
                  }}
                />
                <div className="flex flex-col">
                  <span style={{ color: 'var(--color-base-primary-typo)' }}>
                    Por Carreras
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-base-secondary-typo)' }}
                  >
                    Las carreras aparecen en filas, las generaciones en columnas
                  </span>
                </div>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reportType"
                  checked={reportType === 'por-generaciones'}
                  onChange={() => setReportType('por-generaciones')}
                  className="w-4 h-4"
                  style={{
                    accentColor: 'var(--color-primary-color)',
                  }}
                />
                <div className="flex flex-col">
                  <span style={{ color: 'var(--color-base-primary-typo)' }}>
                    Por Generaciones
                  </span>
                  <span
                    className="text-sm"
                    style={{ color: 'var(--color-base-secondary-typo)' }}
                  >
                    Las generaciones aparecen en filas, las carreras en columnas
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={handleClearFilters}>
              Limpiar
            </Button>
            <Button
              variant="primary"
              onClick={handleGenerateReport}
              disabled={isLoading}
            >
              {isLoading ? 'Generando...' : 'Generar Reporte'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Contenedor para Table y Paginación */}
      <div className="flex flex-col gap-6 rounded-lg p-6 bg-(--color-component-bg)">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <span style={{ color: 'var(--color-base-primary-typo)' }}>
              Generando reporte...
            </span>
          </div>
        ) : currentReport ? (
          <div className="flex flex-col gap-4">{renderReportTable}</div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <span style={{ color: 'var(--color-base-secondary-typo)' }}>
              No hay reporte generado. Configura y genera un reporte para ver
              los datos.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
