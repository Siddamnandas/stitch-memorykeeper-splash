import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
  type FC
} from 'react';

import { ToastNotification, ToastManager, AppError, ErrorHandler } from './errorService';

interface ErrorContextType {
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
  handleError: (error: any, defaultMessage?: string) => void;
  handleSupabaseError: (error: any) => void;
}

const ErrorContext = createContext<ErrorContextType | null>(null);

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: FC<ErrorProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Add debug log to see if provider is working
  console.log('ErrorProvider initialized', { toasts });

  useEffect(() => {
    const unsubscribe = ToastManager.subscribe((updatedToasts) => {
      setToasts(updatedToasts);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const addToast = (toast: Omit<ToastNotification, 'id'>) => {
    ToastManager.addToast(toast);
  };

  const removeToast = (id: string) => {
    ToastManager.removeToast(id);
  };

  const handleError = (error: any, defaultMessage?: string) => {
    const appError: AppError = ErrorHandler.handleGenericError(error);
    const friendlyMessage = ErrorHandler.getFriendlyMessage(appError);
    
    addToast({
      type: 'error',
      title: 'Error',
      message: defaultMessage || appError.message || friendlyMessage,
      duration: 7000
    });
    
    // Log error to console for debugging
    console.error('Application Error:', appError);
  };

  const handleSupabaseError = (error: any) => {
    if (!error) return;
    
    const appError: AppError = ErrorHandler.handleSupabaseError(error);
    const friendlyMessage = ErrorHandler.getFriendlyMessage(appError);
    
    addToast({
      type: 'error',
      title: 'Database Error',
      message: appError.message || friendlyMessage,
      duration: 7000
    });
    
    // Log error to console for debugging
    console.error('Supabase Error:', appError);
  };

  const value = {
    toasts,
    addToast,
    removeToast,
    handleError,
    handleSupabaseError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === null) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  // Add debug log to see if hook is working
  console.log('useError called', context.toasts);
  return context;
};

// Toast Container Component
export const ToastContainer: FC = () => {
  const { toasts, removeToast } = useError();
  
  // Add debug log to see if toast container is working
  console.log('ToastContainer rendering', { toasts });
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            max-w-md w-full rounded-2xl p-4 shadow-lg backdrop-blur-xl border transition-all duration-300
            ${toast.type === 'success' ? 'bg-green-100 border-green-200 text-green-800' : ''}
            ${toast.type === 'error' ? 'bg-red-100 border-red-200 text-red-800' : ''}
            ${toast.type === 'warning' ? 'bg-yellow-100 border-yellow-200 text-yellow-800' : ''}
            ${toast.type === 'info' ? 'bg-blue-100 border-blue-200 text-blue-800' : ''}
          `}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-sm">{toast.title}</h3>
              <p className="text-sm mt-1">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-gray-500 hover:text-gray-700"
              aria-label="Close notification"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
            <div 
              className={`
                h-1 rounded-full
                ${toast.type === 'success' ? 'bg-green-500' : ''}
                ${toast.type === 'error' ? 'bg-red-500' : ''}
                ${toast.type === 'warning' ? 'bg-yellow-500' : ''}
                ${toast.type === 'info' ? 'bg-blue-500' : ''}
              `}
              style={{ 
                width: '100%', 
                animation: `toast-timer ${toast.duration || 5000}ms linear forwards` 
              }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};
