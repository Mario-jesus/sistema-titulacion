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
import { UserRole } from '@entities/user';

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
    requiredRole: UserRole.ADMIN,
  },
  {
    id: 'respaldos',
    label: 'Respaldos',
    icon: <BackupsIcon size={20} />,
    path: '/backups',
    requiredRole: UserRole.ADMIN,
  },
];

/**
 * Filtra los items de navegación según el rol del usuario.
 * Solo muestra los items y subitems que el usuario tiene permiso para ver.
 * 
 * @param items - Lista de items de navegación
 * @param userRole - Rol del usuario actual
 * @returns Lista filtrada de items
 */
export function filterNavigationItemsByRole(
  items: SidebarItem[],
  userRole: UserRole | undefined
): SidebarItem[] {
  if (!userRole) {
    return [];
  }

  return items
    .filter((item) => {
      // Si el item requiere un rol específico, verificar que el usuario lo tenga
      if (item.requiredRole && item.requiredRole !== userRole) {
        return false;
      }
      return true;
    })
    .map((item) => {
      // Filtrar subitems si existen
      if (item.subItems && item.subItems.length > 0) {
        const filteredSubItems = item.subItems.filter((subItem) => {
          // Si el subitem requiere un rol específico, verificar que el usuario lo tenga
          if (subItem.requiredRole && subItem.requiredRole !== userRole) {
            return false;
          }
          return true;
        });

        // Retornar el item con los subitems filtrados
        return {
          ...item,
          subItems: filteredSubItems.length > 0 ? filteredSubItems : undefined,
        };
      }

      return item;
    })
    .filter((item) => {
      // Si el item tiene subitems y todos fueron filtrados, ocultarlo solo si no tiene path principal
      // Si tiene path principal, mantenerlo aunque no tenga subitems visibles
      if (item.subItems === undefined && item.path === undefined) {
        return false;
      }
      return true;
    });
}
