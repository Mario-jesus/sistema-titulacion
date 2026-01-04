import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

/**
 * Obtiene la preferencia del sistema operativo
 * @returns 'light' o 'dark' según la preferencia del sistema
 */
function getSystemPreference(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Obtiene el tema inicial: primero del localStorage, si no existe usa la preferencia del sistema
 */
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  // Si no hay nada guardado, usar la preferencia del sistema
  return getSystemPreference();
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;

    // Aplicar o remover la clase 'dark'
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Guardar siempre en localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  /**
   * Alterna entre modo claro y oscuro
   */
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  /**
   * Establece el tema manualmente
   */
  const setThemeValue = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  /**
   * Verifica si el sistema operativo tiene configurado modo oscuro
   */
  const isSystemDark = getSystemPreference() === 'dark';

  return {
    theme,
    toggleTheme,
    setTheme: setThemeValue,
    isSystemDark,
  };
}
