import { ReactNode, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sidebar, createDefaultNavigationItems } from "@widgets/Sidebar";
import type { SidebarItem } from "@widgets/Sidebar";
import { Header } from "@widgets/Header";
import { useAuth } from "@features/auth";
import type { UserRole } from "@entities/user";

interface LayoutWithSidebarProps {
  children: ReactNode;
}

// Mapeo de roles para mostrar en el header
const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Admin',
  STAFF: 'Staff',
};

export function LayoutWithSidebar({ children }: LayoutWithSidebarProps) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationItems = useMemo(() => createDefaultNavigationItems(), []);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.path) {
      navigate(item.path);
    }
  };

  // Determinar el item activo basado en la ruta actual
  const activeItemId = useMemo(() => {
    const currentPath = location.pathname;

    // Primero buscar en subitems
    for (const item of navigationItems) {
      if (item.subItems) {
        const activeSubItem = item.subItems.find(subItem => subItem.path === currentPath);
        if (activeSubItem) {
          return activeSubItem.id;
        }
      }
    }

    // Si no está en subitems, buscar en items principales
    const activeItem = navigationItems.find(item => item.path === currentPath);
    return activeItem?.id || 'panel';
  }, [location.pathname, navigationItems]);

  // Obtener el título de la página basado en la ruta actual
  const pageTitle = useMemo(() => {
    const currentPath = location.pathname;

    // Primero buscar en subitems
    for (const item of navigationItems) {
      if (item.subItems) {
        const activeSubItem = item.subItems.find(subItem => subItem.path === currentPath);
        if (activeSubItem) {
          return `${item.label} - ${activeSubItem.label}`;
        }
      }
    }

    // Si no está en subitems, buscar en items principales
    const activeItem = navigationItems.find(item => item.path === currentPath);
    return activeItem?.label || 'Panel';
  }, [location.pathname, navigationItems]);

  // Preparar información del usuario para el Header
  const userInfo = useMemo(() => {
    if (!user) return undefined;

    return {
      name: user.username,
      role: roleLabels[user.role] || user.role,
      avatar: user.avatar || undefined,
      email: user.email,
    };
  }, [user]);

  return (
    <div 
      className="h-screen overflow-hidden w-full lg:flex" 
      style={{ backgroundColor: 'var(--color-document-bg)' }}
    >
      {/* Sidebar: position fixed en móviles (fuera del flujo), static en desktop (en el flujo flex) */}
      <Sidebar
        items={navigationItems}
        activeItemId={activeItemId}
        onItemClick={handleItemClick}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={handleMobileMenuClose}
      />

      {/* Contenedor principal: ocupa todo el ancho en móviles, flex-1 en desktop */}
      <div className="w-full lg:flex-1 lg:w-auto flex flex-col overflow-hidden min-w-0 lg:z-0">
        <div className="flex-1 overflow-y-auto relative w-full" style={{ backgroundColor: 'var(--color-document-bg)' }}>
          <div className="px-4 lg:px-6 sticky top-0 z-10 lg:z-auto">
            <Header
              title={pageTitle}
              user={userInfo}
              onUserMenuClick={() => {
                // Aquí puedes implementar el menú del usuario si es necesario
                console.log('User menu clicked');
              }}
              onMenuClick={handleMobileMenuToggle}
            />
          </div>
          <main className="px-4 lg:px-6 pb-4 w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
