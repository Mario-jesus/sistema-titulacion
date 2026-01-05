import { useState, useEffect } from 'react';
import { SidebarProps, SidebarItem, SidebarSubItem } from '../model';
import { CollapseIcon, LogoutIcon, ChevronRightIcon } from './icons';

export function Sidebar({
  items,
  activeItemId,
  onItemClick,
  onLogout,
  logo,
  className = '',
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Expandir automáticamente el item padre si un subitem está activo (cerrando otros)
  useEffect(() => {
    if (activeItemId) {
      const parentItem = items.find((item) =>
        item.subItems?.some((subItem) => subItem.id === activeItemId)
      );
      if (parentItem) {
        // Solo mantener este item expandido, cerrar todos los demás
        setExpandedItems(new Set([parentItem.id]));
      }
    }
  }, [activeItemId, items]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set<string>();
      // Si el item ya estaba expandido, colapsarlo (dejar el set vacío)
      // Si no estaba expandido, expandirlo (cerrar otros y abrir este)
      if (!prev.has(itemId)) {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleItemClick = (item: SidebarItem) => {
    if (item.subItems && item.subItems.length > 0) {
      // Si tiene subitems, expandir este item (colapsando otros) y navegar al primer subitem
      toggleExpand(item.id);
      const firstSubItem = item.subItems[0];
      if (firstSubItem && onItemClick) {
        onItemClick({
          ...item,
          id: firstSubItem.id,
          path: firstSubItem.path,
        });
      }
      return;
    }
    // Si no tiene subitems, colapsar todos los items expandidos
    setExpandedItems(new Set());
    if (onItemClick) {
      onItemClick(item);
    }
    if (item.onClick) {
      item.onClick();
    }
  };

  const handleSubItemClick = (subItem: SidebarSubItem) => {
    if (onItemClick) {
      // Crear un item temporal para el subitem
      const parentItem = items.find((item) =>
        item.subItems?.some((si) => si.id === subItem.id)
      );
      if (parentItem) {
        onItemClick({
          ...parentItem,
          id: subItem.id,
          path: subItem.path,
        });
      }
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <aside
      className={`flex flex-col h-screen ${
        isCollapsed ? 'w-20' : 'w-64'
      } relative transition-[width] duration-300 ease-in-out ${className}`}
      style={{
        backgroundColor: 'var(--color-component-bg)'
      }}
    >
      {/* Header con Logo y Botón de Colapsar */}
      <div
        className="flex items-center justify-between p-4 relative"
      >
        {!isCollapsed && (
          <div className="flex items-center gap-2 flex-1">
            {logo || (
              <div className="flex items-center gap-2">
                <img
                  src="/images/TECNMRIOS.png"
                  alt="ITSR Logo"
                  className="h-8 w-auto"
                />
                <span
                  className="font-bold text-3xl pl-1 text-black dark:text-white"
                  style={{ fontFamily: 'Inria_Serif' }}
                >
                  ITSR
                </span>
              </div>
            )}
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="flex items-center justify-center w-full cursor-pointer hover:opacity-80 transition-opacity"
            aria-label="Expandir sidebar"
            type="button"
          >
            {logo || (
              <img
                src="/images/TECNMRIOS.png"
                alt="ITSR Logo"
                className="h-8 w-auto"
              />
            )}
          </button>
        )}
        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="group absolute flex items-center justify-center bg-[#E6E5F9] dark:bg-gray-2-dark border-3 border-gray-2-light dark:border-gray-1-dark w-8 h-8 rounded-full -right-4 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
            style={{
              color: 'var(--color-primary-color)',
            }}
            aria-label="Colapsar sidebar"
            type="button"
          >
            <CollapseIcon size={16} className="scale-120 group-hover:scale-150 group-active:scale-100 group-active:duration-100 transition-all duration-100 ease-in-out" />
          </button>
        )}
      </div>

      {/* Lista de Items de Navegación */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = activeItemId === item.id;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItems.has(item.id);
            const isSubItemActive = hasSubItems && item.subItems?.some((si) => activeItemId === si.id);
            const isParentActive = isActive || isSubItemActive;

            return (
              <li key={item.id}>
                <div>
                  <button
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 relative overflow-hidden cursor-pointer active:opacity-80 ${
                      isCollapsed ? 'justify-center' : ''
                    } ${
                      isParentActive
                        ? 'bg-[rgba(123,87,224,0.15)] text-base-primary-typo-light dark:bg-gray-3-dark dark:text-base-primary-typo-dark'
                        : 'bg-transparent text-base-secondary-typo-light dark:text-base-secondary-typo-dark hover:bg-gray-3-light dark:hover:bg-gray-3-dark hover:text-base-primary-typo-light dark:hover:text-base-primary-typo-dark'
                    }`}
                    type="button"
                  >
                    {/* Indicador de activación izquierdo para elemento activo */}
                    {isParentActive && (
                      <div
                        className="absolute -left-2.5 top-1/2 bottom-0 w-10 h-10 skew-x-20 rotate-45 rounded-lg -translate-x-1/2 -translate-y-1/2"
                        style={{
                          backgroundColor: 'var(--color-primary-color)',
                        }}
                      />
                    )}
                    <span
                      className={`shrink-0 ${isCollapsed ? '' : 'pl-3'}`}
                      style={{
                        color: 'inherit',
                      }}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">
                          {item.label}
                        </span>
                        {hasSubItems && (
                          <span
                            className="shrink-0"
                            style={{
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            }}
                          >
                            <ChevronRightIcon size={16} />
                          </span>
                        )}
                        {!hasSubItems && item.badge !== undefined && item.badge > 0 && (
                          <span
                            className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs text-white"
                            style={{
                              backgroundColor: 'var(--color-salmon)',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                  {/* Subitems */}
                  {!isCollapsed && hasSubItems && (
                    <ul
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      {item.subItems?.map((subItem) => {
                        const isSubActive = activeItemId === subItem.id;
                        return (
                          <li key={subItem.id}>
                            <button
                              onClick={() => handleSubItemClick(subItem)}
                              className={`w-full flex items-center gap-3 px-10 py-2 relative active:opacity-80 ${
                                isSubActive
                                  ? 'bg-[rgba(123,87,224,0.15)] text-base-primary-typo-light dark:bg-gray-3-dark dark:text-base-primary-typo-dark'
                                  : 'bg-transparent text-base-secondary-typo-light dark:text-base-secondary-typo-dark hover:bg-gray-3-light dark:hover:bg-gray-3-dark hover:text-base-primary-typo-light dark:hover:text-base-primary-typo-dark'
                              }`}
                              type="button"
                            >
                              <span className="flex-1 text-left text-sm">
                                {subItem.label}
                              </span>
                              {subItem.badge !== undefined && subItem.badge > 0 && (
                                <span
                                  className="flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs text-white"
                                  style={{
                                    backgroundColor: 'var(--color-salmon)',
                                  }}
                                >
                                  {subItem.badge}
                                </span>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sección de Salir */}
      <div
        style={{
          borderColor: 'var(--color-gray-1)',
        }}
      >
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-6 py-2.5 cursor-pointer active:opacity-80 ${
            isCollapsed ? 'justify-center' : ''
          }`}
          style={{
            color: 'var(--color-base-secondary-typo)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-gray-3)';
            e.currentTarget.style.color = 'var(--color-base-primary-typo)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-base-secondary-typo)';
          }}
          type="button"
        >
          <span
            className="shrink-0"
            style={{
              color: 'inherit',
            }}
          >
            <LogoutIcon size={20} />
          </span>
          {!isCollapsed && (
            <span className="flex-1 text-left">Salir</span>
          )}
        </button>
      </div>
    </aside>
  );
}
