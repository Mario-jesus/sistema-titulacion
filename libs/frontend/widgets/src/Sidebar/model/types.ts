import { ReactNode } from 'react';

export interface SidebarSubItem {
  id: string;
  label: string;
  path: string;
  badge?: number;
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
}

export interface SidebarProps {
  items: SidebarItem[];
  activeItemId?: string;
  onItemClick?: (item: SidebarItem) => void;
  onLogout?: () => void;
  logo?: ReactNode;
  className?: string;
  // Props para móviles
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}
