// Error types
export type AppErrorType = 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'SERVER_ERROR'
  | 'NOT_FOUND'
  | 'UNKNOWN_ERROR';

// Error interface
export interface AppError {
  type: AppErrorType;
  message: string;
  originalError?: any;
  timestamp: Date;
}

// Error handler class
export class ErrorHandler {
  static handleSupabaseError(error: any): AppError {
    if (!error) {
      return {
        type: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        timestamp: new Date()
      };
    }

    // Handle specific Supabase errors
    if (error.code === 'PGRST116') {
      return {
        type: 'NOT_FOUND',
        message: 'Resource not found',
        originalError: error,
        timestamp: new Date()
      };
    }

    if (error.code === '23505') {
      return {
        type: 'VALIDATION_ERROR',
        message: 'Data validation failed',
        originalError: error,
        timestamp: new Date()
      };
    }

    // Handle network errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      return {
        type: 'NETWORK_ERROR',
        message: 'Network connection failed. Please check your internet connection.',
        originalError: error,
        timestamp: new Date()
      };
    }

    // Handle auth errors
    if (error.message?.includes('Invalid login credentials') || error.message?.includes('Email not confirmed')) {
      return {
        type: 'AUTH_ERROR',
        message: 'Authentication failed. Please check your credentials.',
        originalError: error,
        timestamp: new Date()
      };
    }

    // Default server error
    return {
      type: 'SERVER_ERROR',
      message: error.message || 'Server error occurred',
      originalError: error,
      timestamp: new Date()
    };
  }

  static handleGenericError(error: any): AppError {
    if (!error) {
      return {
        type: 'UNKNOWN_ERROR',
        message: 'An unknown error occurred',
        timestamp: new Date()
      };
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return {
        type: 'NETWORK_ERROR',
        message: 'Network connection failed. Please check your internet connection.',
        originalError: error,
        timestamp: new Date()
      };
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      return {
        type: 'VALIDATION_ERROR',
        message: error.message || 'Data validation failed',
        originalError: error,
        timestamp: new Date()
      };
    }

    // Default unknown error
    return {
      type: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      originalError: error,
      timestamp: new Date()
    };
  }

  static getFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case 'NETWORK_ERROR':
        return 'Please check your internet connection and try again.';
      case 'AUTH_ERROR':
        return 'Please check your credentials and try again.';
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'NOT_FOUND':
        return 'The requested resource was not found.';
      case 'SERVER_ERROR':
        return 'Our servers are experiencing issues. Please try again later.';
      case 'UNKNOWN_ERROR':
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}

// Toast notification interface
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Toast manager
export class ToastManager {
  private static toasts: ToastNotification[] = [];
  private static listeners: ((toasts: ToastNotification[]) => void)[] = [];

  static subscribe(listener: (toasts: ToastNotification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static addToast(toast: Omit<ToastNotification, 'id'>) {
    const newToast: ToastNotification = {
      ...toast,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    this.toasts = [...this.toasts, newToast];
    this.notifyListeners();
    
    // Auto remove toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        this.removeToast(newToast.id);
      }, toast.duration || 5000);
    }
  }

  static removeToast(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notifyListeners();
  }

  static getToasts() {
    return this.toasts;
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener(this.toasts));
  }
}