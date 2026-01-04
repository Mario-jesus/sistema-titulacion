import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { env } from '@shared/config';
import { logger } from '@shared/lib/logger';
import App from './app/app';
import './styles.css';

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
