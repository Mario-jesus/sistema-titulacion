import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { env } from '@shared/config';
import { logger } from '@shared/lib/logger';
import App from './app/app';
import './styles.css';

// Inicializar tema antes de renderizar para evitar FOUC (Flash of Unstyled Content)
function initializeTheme() {
  const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Si hay tema guardado, usarlo; si no, usar la preferencia del sistema
  const theme = stored || (prefersDark ? 'dark' : 'light');

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Inicializar tema inmediatamente
initializeTheme();

async function enableMocking() {
  if (env.enableMockApi && env.appEnv === 'development') {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    logger.info('MSW habilitado - API Mock activo');
  }
}

enableMocking().then(() => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
