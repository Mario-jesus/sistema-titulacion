import { ReactNode, useMemo } from "react";
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
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-document-bg)' }}>
      <Sidebar
        items={navigationItems}
        activeItemId={activeItemId}
        onItemClick={handleItemClick}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--color-document-bg)' }}>
          <div className="px-6">
            <Header
              title={pageTitle}
              user={userInfo}
              onUserMenuClick={() => {
                // Aquí puedes implementar el menú del usuario si es necesario
                console.log('User menu clicked');
              }}
            />
          </div>
          <main>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
