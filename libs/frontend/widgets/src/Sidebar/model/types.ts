import { ReactNode } from 'react';
import type { UserRole } from '@entities/user';

export interface SidebarSubItem {
  id: string;
  label: string;
  path: string;
  badge?: number;
  requiredRole?: UserRole;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: ReactNode;
  path?: string;
  onClick?: () => void;
  badge?: number;
  active?: boolean;
  subItems?: SidebarSubItem[];
  requiredRole?: UserRole;
}

export interface SidebarProps {
  items: SidebarItem[];
  activeItemId?: string;
  onItemClick?: (item: SidebarItem) => void;
  onLogout?: () => void;
  logo?: ReactNode;
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}
