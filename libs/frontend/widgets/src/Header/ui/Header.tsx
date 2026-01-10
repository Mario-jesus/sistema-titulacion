import { ThemeToggle } from '@shared/ui';
import { HeaderProps } from '../model';
import { BackArrowIcon, ChevronDownIcon, MenuIcon } from './icons';

export function Header({
  title,
  showBackButton = false,
  onBack,
  user,
  onUserMenuClick,
  className = '',
  onMenuClick,
}: HeaderProps) {
  const handleUserClick = () => {
    if (onUserMenuClick) {
      onUserMenuClick();
    }
  };

  return (
    <header
      className={`flex items-center justify-between px-3 md:px-6 py-3 md:py-4 rounded-lg relative z-10 max-h-17 bg-(--color-component-bg) ${className}`}
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
        <div className="flex items-center gap-3">
          <button
            onClick={handleUserClick}
            className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer bg-transparent hover:bg-gray-2-light active:bg-gray-3-light dark:hover:bg-gray-3-dark dark:active:bg-gray-6-dark"
            style={{
              color: 'var(--color-base-primary-typo)',
            }}
            type="button"
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
            <ChevronDownIcon size={16} className="hidden md:block" />
          </button>
        </div>
      )}
    </header>
  );
}
