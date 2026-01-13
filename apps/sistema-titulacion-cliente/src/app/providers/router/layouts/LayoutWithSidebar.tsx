import { ReactNode, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sidebar,
  createDefaultNavigationItems,
  filterNavigationItemsByRole,
} from '@widgets/Sidebar';
import type { SidebarItem } from '@widgets/Sidebar';
import { Header } from '@widgets/Header';
import { useAuth } from '@features/auth';
import { ProfileModal, ChangePasswordModal } from '@features/users';
import type { UserRole } from '@entities/user';

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

  // Filtrar los items de navegación según el rol del usuario
  const navigationItems = useMemo(() => {
    const allItems = createDefaultNavigationItems();
    return filterNavigationItemsByRole(allItems, user?.role);
  }, [user?.role]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);

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
        const activeSubItem = item.subItems.find(
          (subItem) => subItem.path === currentPath
        );
        if (activeSubItem) {
          return activeSubItem.id;
        }
      }
    }

    // Si no está en subitems, buscar en items principales
    const activeItem = navigationItems.find(
      (item) => item.path === currentPath
    );
    return activeItem?.id || 'panel';
  }, [location.pathname, navigationItems]);

  // Obtener el título de la página basado en la ruta actual
  const pageTitle = useMemo(() => {
    const currentPath = location.pathname;

    // Primero buscar en subitems
    for (const item of navigationItems) {
      if (item.subItems) {
        const activeSubItem = item.subItems.find(
          (subItem) => subItem.path === currentPath
        );
        if (activeSubItem) {
          // Mostrar solo el label del subitem
          return activeSubItem.label;
        }
        // Si la ruta coincide con el item padre pero tiene subitems, mostrar el label del item padre
        if (item.path === currentPath) {
          return item.label;
        }
      }
    }

    // Si no está en subitems, buscar en items principales
    const activeItem = navigationItems.find(
      (item) => item.path === currentPath
    );
    return activeItem?.label || 'Panel';
  }, [location.pathname, navigationItems]);

  // Preparar información del usuario para el Header
  const userInfo = useMemo(() => {
    if (!user) return undefined;

    return {
      name: user.username || user.email || 'Usuario',
      role: roleLabels[user.role] || user.role,
      avatar: user.avatar || undefined,
      email: user.email,
    };
  }, [user]);

  return (
    <div
      className="min-h-screen w-full lg:flex lg:h-screen lg:overflow-hidden"
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
      <div className="w-full lg:flex-1 lg:w-auto flex flex-col lg:overflow-hidden min-w-0 lg:z-0">
        <div
          className="flex-1 lg:overflow-y-auto lg:flex-1 relative w-full"
          style={{ backgroundColor: 'var(--color-document-bg)' }}
        >
          <div className="px-4 lg:px-6 sticky top-0 z-10 bg-(--color-document-bg)">
            <Header
              title={pageTitle}
              user={userInfo}
              onProfileClick={() => {
                setIsProfileModalOpen(true);
              }}
              onChangePasswordClick={() => {
                setIsChangePasswordModalOpen(true);
              }}
              onLogoutClick={handleLogout}
              onMenuClick={handleMobileMenuToggle}
            />
          </div>
          <main className="px-4 lg:px-6 pb-4 w-full relative z-0">
            {children}
          </main>
        </div>
      </div>

      {/* Modal de perfil */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
      />

      {/* Modal de cambio de contraseña */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
}
