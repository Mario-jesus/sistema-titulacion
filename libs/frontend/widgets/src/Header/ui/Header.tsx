import { useState, useRef, useEffect } from 'react';
import { ThemeToggle, DropdownMenu, DropdownMenuItem } from '@shared/ui';
import { HeaderProps } from '../model';
import { BackArrowIcon, ChevronDownIcon, MenuIcon } from './icons';

export function Header({
  title,
  showBackButton = false,
  onBack,
  user,
  onUserMenuClick,
  onProfileClick,
  onChangePasswordClick,
  onLogoutClick,
  className = '',
  onMenuClick,
}: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState<
    { x: number; y: number } | undefined
  >(undefined);

  const handleUserClick = () => {
    if (userButtonRef.current) {
      const rect = userButtonRef.current.getBoundingClientRect();
      // Posicionar el menú alineado a la derecha del botón
      // El menú tiene un ancho mínimo de 160px, así que lo posicionamos para que quede alineado a la derecha
      setMenuPosition({
        x: rect.right - 180, // Ancho aproximado del menú (180px para dar margen)
        y: rect.bottom + 8, // 8px de espacio debajo del botón
      });
      // Toggle del menú: si está abierto, se mantiene abierto; si está cerrado, se abre
      setIsUserMenuOpen((prev) => !prev);
    }
  };

  // Cerrar menú cuando se hace click fuera (pero no en el botón del usuario ni en el menú)
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOnButton = userButtonRef.current?.contains(target);
      const clickedOnMenu = menuRef.current?.contains(target);

      // Solo cerrar si el click está fuera del botón y del menú
      if (!clickedOnButton && !clickedOnMenu) {
        setIsUserMenuOpen(false);
      }
    };

    // Usar un pequeño delay para evitar que se cierre inmediatamente al hacer click en el botón
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Items del menú dropdown
  const menuItems: DropdownMenuItem[] = [
    {
      label: 'Perfil',
      onClick: () => {
        if (onProfileClick) {
          onProfileClick();
        } else if (onUserMenuClick) {
          onUserMenuClick();
        }
      },
    },
    {
      label: 'Cambiar contraseña',
      onClick: () => {
        if (onChangePasswordClick) {
          onChangePasswordClick();
        }
      },
    },
    { separator: true, label: '' },
    {
      label: 'Salir',
      onClick: () => {
        if (onLogoutClick) {
          onLogoutClick();
        }
      },
      variant: 'danger',
    },
  ];

  return (
    <header
      className={`flex items-center justify-between px-3 md:px-6 py-3 md:py-4 rounded-lg shadow-2xs dark:shadow-gray-3-dark relative z-10 max-h-17 bg-(--color-component-bg) ${className}`}
    >
      {/* Sección izquierda: Botón menú móvil y Título */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Botón hamburguesa para móviles */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden flex items-center justify-center p-2 rounded-lg cursor-pointer bg-transparent hover:bg-(--color-gray-2) text-(--color-base-secondary-typo)"
            aria-label="Abrir menú"
            type="button"
          >
            <MenuIcon size={24} />
          </button>
        )}

        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center p-2 rounded-lg cursor-pointer"
            style={{
              color: 'var(--color-base-secondary-typo)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-gray-2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Volver"
            type="button"
          >
            <BackArrowIcon size={20} />
          </button>
        )}

        {title && (
          <div className="hidden md:flex items-center gap-3">
            {showBackButton && !onBack && (
              <div
                className="flex items-center justify-center"
                style={{
                  color: 'var(--color-base-secondary-typo)',
                }}
              >
                <BackArrowIcon size={18} />
              </div>
            )}
            <h1
              className="text-xl font-semibold truncate"
              style={{
                color: 'var(--color-base-primary-typo)',
              }}
            >
              {title}
            </h1>
          </div>
        )}
      </div>

      {/* Sección central: Toggle de tema */}
      <div className="flex items-center justify-center px-2 md:px-4">
        <ThemeToggle />
      </div>

      {/* Sección derecha: Información del usuario */}
      {user && (
        <div className="flex items-center gap-3 relative">
          <button
            ref={userButtonRef}
            onClick={handleUserClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-2-light active:bg-gray-3-light dark:hover:bg-gray-3-dark dark:active:bg-gray-6-dark
              ${
                isUserMenuOpen
                  ? 'bg-gray-2-light dark:bg-gray-3-dark'
                  : 'bg-transparent'
              }
            `}
            style={{
              color: 'var(--color-base-primary-typo)',
            }}
            type="button"
            aria-label="Menú de usuario"
            aria-expanded={isUserMenuOpen}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover"
              />
            ) : (
              <div
                className="flex items-center justify-center rounded-xl overflow-hidden"
                style={{
                  backgroundColor: 'var(--color-primary-color)',
                  color: 'var(--color-white)',
                  width: '40px',
                  height: '40px',
                }}
              >
                <span className="text-sm font-semibold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="hidden md:block text-left">
              <div
                className="text-sm font-medium"
                style={{
                  color: 'var(--color-base-primary-typo)',
                }}
              >
                {user.name || 'Usuario'}
              </div>
              <div
                className="text-xs"
                style={{
                  color: 'var(--color-base-secondary-typo)',
                }}
              >
                {user.role}
              </div>
            </div>
            <div
              className="hidden md:block transition-transform duration-200 ease-in-out"
              style={{
                transform: isUserMenuOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
                transformStyle: 'preserve-3d',
                display: 'inline-block',
              }}
            >
              <ChevronDownIcon size={16} />
            </div>
          </button>

          {/* Menú dropdown */}
          <div ref={menuRef}>
            <DropdownMenu
              isOpen={isUserMenuOpen}
              onClose={() => setIsUserMenuOpen(false)}
              position={menuPosition}
              items={menuItems}
            />
          </div>
        </div>
      )}
    </header>
  );
}
