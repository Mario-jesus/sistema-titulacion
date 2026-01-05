import {
  PanelIcon,
  OptionsIcon,
  GenerationIcon,
  EntryExitIcon,
  StudentsIcon,
  CareersIcon,
  ReportsIcon,
  AccessIcon,
  BackupsIcon,
} from '../ui';
import { SidebarItem } from '../model';

export const createDefaultNavigationItems = (): SidebarItem[] => [
  {
    id: 'panel',
    label: 'Panel',
    icon: <PanelIcon size={20} />,
    path: '/dashboard',
  },
  {
    id: 'opciones-titulacion',
    label: 'Opciones de titulación',
    icon: <OptionsIcon size={20} />,
    path: '/graduation-options',
  },
  {
    id: 'generacion',
    label: 'Generación',
    icon: <GenerationIcon size={20} />,
    path: '/generation',
  },
  {
    id: 'ingreso-egreso',
    label: 'Ingreso y egreso',
    icon: <EntryExitIcon size={20} />,
    path: '/admissions-graduates',
  },
  {
    id: 'alumnos',
    label: 'Alumnos',
    icon: <StudentsIcon size={20} />,
    path: '/students',
    subItems: [
      {
        id: 'alumnos-en-proceso',
        label: 'En proceso',
        path: '/students/in-progress',
      },
      {
        id: 'alumnos-titulados',
        label: 'Titulados',
        path: '/students/graduated',
      },
    ],
  },
  {
    id: 'carreras',
    label: 'Carreras',
    icon: <CareersIcon size={20} />,
    path: '/careers',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: <ReportsIcon size={20} />,
    path: '/reports',
  },
  {
    id: 'accesos',
    label: 'Accesos',
    icon: <AccessIcon size={20} />,
    path: '/accesses',
  },
  {
    id: 'respaldos',
    label: 'Respaldos',
    icon: <BackupsIcon size={20} />,
    path: '/backups',
  },
];
