import { BrowserRouter as Router } from 'react-router-dom';
import { AppStateProvider } from './lib/AppStateContext';
import { ErrorProvider, ToastContainer } from './lib/ErrorContext';
import { AuthProvider } from './lib/AuthContext';
import { LanguageProvider } from './lib/LanguageContext';
import { ThemeProvider } from './lib/ThemeContext';
import AuthenticationFlow from './components/AuthenticationFlow';
import ServiceWorkerToast from './components/ServiceWorkerToast';
import './lib/i18n/i18n';

function App(): JSX.Element {
  console.log('App component rendering');

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background-light text-zinc-900 transition-colors duration-300 dark:bg-background-dark dark:text-zinc-100">
        <ErrorProvider>
          <AppStateProvider>
            <LanguageProvider>
              <AuthProvider>
                <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <AuthenticationFlow />
                  <ToastContainer />
                  <ServiceWorkerToast />
                </Router>
              </AuthProvider>
            </LanguageProvider>
          </AppStateProvider>
        </ErrorProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
