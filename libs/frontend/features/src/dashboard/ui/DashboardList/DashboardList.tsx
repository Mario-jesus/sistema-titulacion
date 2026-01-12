import { useEffect, useState } from 'react';
import { Card, Table, useToast } from '@shared/ui';
import type { TableColumn } from '@shared/ui';
import {
  TotalStudentsIcon,
  InProgressIcon,
  ScheduledIcon,
  GraduatedIcon,
  EgressedIcon,
  TotalAdmissionsIcon,
  TotalEgressesIcon,
  GraduationRateIcon,
} from './icons';
import type { ReactNode } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useDashboard } from '../../lib/useDashboard';
import type {
  IngressEgressByGeneration,
  StatusDistribution,
  StudentsByCareer,
  RecentStudent,
  DashboardResponse,
} from '../../model/types';

export function DashboardList() {
  const { showToast } = useToast();
  const { getDashboard } = useDashboard();
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      const result = await getDashboard();

      if (!isMounted) return;

      if (result.success) {
        setData(result.data);
      } else {
        showToast({
          type: 'error',
          title: 'Error al cargar dashboard',
          message:
            result.error || 'No se pudieron cargar los datos del dashboard',
        });
        setData(null);
      }

      setIsLoading(false);
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [getDashboard, showToast]);

  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-(--color-gray-1) border-t-(--color-primary-color) rounded-full animate-spin" />
      </div>
    );
  }

  // Si no hay datos, mostrar mensaje
  if (!data) {
    return (
      <div className="flex items-center justify-center py-12">
        <p style={{ color: 'var(--color-base-secondary-typo)' }}>
          No hay datos disponibles
        </p>
      </div>
    );
  }

  const {
    stats,
    ingressEgressByGeneration,
    statusDistribution,
    studentsByCareer,
    recentStudents,
  } = data;

  // Agregar colores a statusDistribution para el gráfico de pastel
  const statusDistributionWithColors: Array<
    StatusDistribution & { color: string }
  > = statusDistribution
    .map((item: StatusDistribution) => {
      let color = '#6b7280'; // color por defecto
      if (item.name === 'Ingreso') color = '#3b82f6';
      else if (item.name === 'Egreso') color = '#10b981';
      else if (item.name === 'Titulados') color = '#f59e0b';
      return { ...item, color };
    })
    .filter((item: StatusDistribution & { color: string }) => item.value > 0);

  return (
    <div className="flex flex-col gap-6 w-full mt-6">
      {/* Tarjetas de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Estudiantes"
          value={stats.totalStudents.toLocaleString()}
          subtitle={`${stats.activeStudents} activos`}
          icon={<TotalStudentsIcon size={24} />}
          iconBgColor="#8b5cf6"
        />
        <StatCard
          title="En Proceso"
          value={stats.inProgress.toLocaleString()}
          subtitle="Requieren atención"
          icon={<InProgressIcon size={24} />}
          iconBgColor="#f59e0b"
        />
        <StatCard
          title="Programados"
          value={stats.scheduled.toLocaleString()}
          subtitle="Listos para titular"
          icon={<ScheduledIcon size={24} />}
          iconBgColor="#3b82f6"
        />
        <StatCard
          title="Titulados"
          value={stats.graduatedStudents.toLocaleString()}
          subtitle={`${stats.graduationRate.toFixed(1)}% tasa`}
          icon={<GraduatedIcon size={24} />}
          iconBgColor="#10b981"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Egresados"
          value={stats.egressedStudents.toLocaleString()}
          subtitle="Estudiantes egresados"
          icon={<EgressedIcon size={24} />}
          iconBgColor="#06b6d4"
        />
        <StatCard
          title="Total Ingresos"
          value={stats.totalAdmissions.toLocaleString()}
          subtitle="Cupos asignados"
          icon={<TotalAdmissionsIcon size={24} />}
          iconBgColor="#6366f1"
        />
        <StatCard
          title="Tasa de Egresos"
          value={`${stats.egressRate.toFixed(1)}%`}
          subtitle="Egresados / Ingresos"
          icon={<TotalEgressesIcon size={24} />}
          iconBgColor="#ec4899"
        />
        <StatCard
          title="Tasa de Titulación"
          value={`${stats.graduationRate.toFixed(1)}%`}
          subtitle="Titulados / Egresados"
          icon={<GraduationRateIcon size={24} />}
          iconBgColor="#14b8a6"
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex flex-col gap-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              Ingreso vs Egreso por Generación
            </h2>
            <IngressEgressChart data={ingressEgressByGeneration} />
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              Distribución: Ingreso, Egreso y Titulación
            </h2>
            <StatusDistributionChart data={statusDistributionWithColors} />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex flex-col gap-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              Estudiantes por Carrera (Top 6)
            </h2>
            <StudentsByCareerChart data={studentsByCareer} />
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: 'var(--color-base-primary-typo)' }}
            >
              Últimos Estudiantes Agregados
            </h2>
            <RecentStudentsTable data={recentStudents} />
          </div>
        </Card>
      </div>
    </div>
  );
}

// Componente de Tarjeta de Estadística
interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: ReactNode;
  iconBgColor: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor,
}: StatCardProps) {
  return (
    <Card variant="flat">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--color-base-secondary-typo)' }}
          >
            {title}
          </span>
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: iconBgColor,
              color: '#ffffff',
            }}
          >
            {icon}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span
            className="text-3xl font-bold"
            style={{ color: 'var(--color-base-primary-typo)' }}
          >
            {value}
          </span>
          <span
            className="text-sm"
            style={{ color: 'var(--color-base-secondary-typo)' }}
          >
            {subtitle}
          </span>
        </div>
      </div>
    </Card>
  );
}

// Componente de Gráfica de Ingreso vs Egreso
interface IngressEgressChartProps {
  data: IngressEgressByGeneration[];
}

function IngressEgressChart({ data }: IngressEgressChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: 'var(--color-component-bg)',
            border: '1px solid var(--color-gray-2)',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p
            style={{
              color: 'var(--color-base-primary-typo)',
              marginBottom: '8px',
              fontWeight: 600,
            }}
          >
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              style={{
                color: 'var(--color-base-primary-typo)',
                margin: '4px 0',
              }}
            >
              <span style={{ color: entry.color }}>●</span> {entry.name}:{' '}
              <strong>{entry.value.toLocaleString()}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          opacity={0.1}
          stroke="var(--color-gray-2)"
        />
        <XAxis
          dataKey="generation"
          tick={{ fill: 'var(--color-base-secondary-typo)', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
          stroke="none"
        />
        <YAxis
          tick={{ fill: 'var(--color-base-secondary-typo)', fontSize: 12 }}
          stroke="none"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{
            color: 'var(--color-base-primary-typo)',
          }}
          iconType="square"
        />
        <Bar
          dataKey="admissions"
          fill="#3b82f6"
          name="Ingresos"
          radius={[8, 8, 0, 0]}
        />
        <Bar
          dataKey="egresses"
          fill="#10b981"
          name="Egresos"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Componente de Gráfica de Distribución por Estado
interface StatusDistributionData {
  name: string;
  value: number;
  color: string;
}

interface StatusDistributionChartProps {
  data: StatusDistributionData[];
}

function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div
          style={{
            backgroundColor: 'var(--color-component-bg)',
            border: '1px solid var(--color-gray-2)',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p
            style={{
              color: 'var(--color-base-primary-typo)',
              marginBottom: '8px',
              fontWeight: 600,
            }}
          >
            {data.name}
          </p>
          <p
            style={{
              color: 'var(--color-base-primary-typo)',
              margin: '4px 0',
            }}
          >
            <span style={{ color: data.payload.fill }}>●</span> Cantidad:{' '}
            <strong>{data.value.toLocaleString()}</strong>
          </p>
          {data.payload.percent !== undefined && (
            <p
              style={{
                color: 'var(--color-base-primary-typo)',
                margin: '4px 0',
              }}
            >
              Porcentaje:{' '}
              <strong>{((data.payload.percent || 0) * 100).toFixed(1)}%</strong>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={
              data as unknown as Array<{
                name: string;
                value: number;
                [key: string]: unknown;
              }>
            }
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              percent ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-4 justify-center">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: item.color }}
              />
              <span
                className="text-sm"
                style={{ color: 'var(--color-base-secondary-typo)' }}
              >
                {item.name}: {item.value.toLocaleString()} (
                {percentage.toFixed(1)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Componente de Gráfica de Estudiantes por Carrera
interface StudentsByCareerChartProps {
  data: StudentsByCareer[];
}

function StudentsByCareerChart({ data }: StudentsByCareerChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: 'var(--color-component-bg)',
            border: '1px solid var(--color-gray-2)',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <p
            style={{
              color: 'var(--color-base-primary-typo)',
              marginBottom: '8px',
              fontWeight: 600,
            }}
          >
            {data.career}
          </p>
          <p
            style={{
              color: 'var(--color-base-primary-typo)',
              margin: '4px 0',
            }}
          >
            <span style={{ color: payload[0].color }}>●</span> Estudiantes:{' '}
            <strong>{payload[0].value.toLocaleString()}</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          opacity={0.1}
          stroke="var(--color-gray-2)"
        />
        <XAxis
          type="number"
          tick={{ fill: 'var(--color-base-secondary-typo)', fontSize: 12 }}
          stroke="none"
        />
        <YAxis
          type="category"
          dataKey="career"
          tick={{ fill: 'var(--color-base-secondary-typo)', fontSize: 12 }}
          width={90}
          stroke="none"
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="students"
          fill="#3b82f6"
          name="Estudiantes"
          radius={[0, 8, 8, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Componente de Tabla de Estudiantes Recientes
interface RecentStudentsTableProps {
  data: RecentStudent[];
}

function RecentStudentsTable({ data }: RecentStudentsTableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns: TableColumn<RecentStudent>[] = [
    {
      key: 'fullName',
      label: 'Estudiante',
    },
    {
      key: 'career',
      label: 'Carrera',
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      render: (value: string) => formatDate(value),
    },
  ];

  return <Table columns={columns} data={data} />;
}
