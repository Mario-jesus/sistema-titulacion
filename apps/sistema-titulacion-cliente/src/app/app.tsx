import { Provider } from 'react-redux';
import { store } from './providers/redux/store';
import { AppRouter } from './providers/router/AppRouter';
import { AuthProvider } from './providers/auth';

export function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </Provider>
  );
}

export default App;
