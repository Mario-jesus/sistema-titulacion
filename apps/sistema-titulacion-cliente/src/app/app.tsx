import { Provider } from 'react-redux';
import { store } from './providers/redux/store';
import { AppRouter } from './providers/router/AppRouter';
import { AuthProvider } from './providers/auth';
import { ToastProvider } from '@shared/ui';

export function App() {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ToastProvider>
    </Provider>
  );
}

export default App;
