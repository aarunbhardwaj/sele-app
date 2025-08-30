// Custom Error Classes
export class AppwriteError extends Error {
  constructor(
    message: string,
    public code?: string,
    public type?: string,
    public response?: any
  ) {
    super(message);
    this.name = 'AppwriteError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public errors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Insufficient permissions') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

// Error Handler Utility
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCallbacks: ((error: Error) => void)[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Register error callback
  onError(callback: (error: Error) => void): () => void {
    this.errorCallbacks.push(callback);
    // Return unsubscribe function
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  // Handle error
  handleError(error: any, context?: string): void {
    const processedError = this.processError(error, context);
    console.error(`[${context || 'App'}] Error:`, processedError);
    
    // Notify all registered callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(processedError);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  private processError(error: any, context?: string): Error {
    if (error instanceof Error) {
      return error;
    }

    // Handle Appwrite specific errors
    if (error?.code || error?.type) {
      return new AppwriteError(
        error.message || 'An error occurred',
        error.code,
        error.type,
        error
      );
    }

    // Handle network errors
    if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      return new NetworkError('Network connection failed');
    }

    // Handle validation errors
    if (error?.validation || error?.errors) {
      return new ValidationError(
        error.message || 'Validation failed',
        error.field,
        error.errors
      );
    }

    // Generic error
    return new Error(error?.message || 'An unexpected error occurred');
  }

  // Get user-friendly error message
  static getUserFriendlyMessage(error: Error): string {
    if (error instanceof NetworkError) {
      return 'Please check your internet connection and try again.';
    }

    if (error instanceof AuthenticationError) {
      return 'Please log in to continue.';
    }

    if (error instanceof AuthorizationError) {
      return 'You do not have permission to perform this action.';
    }

    if (error instanceof ValidationError) {
      return error.message;
    }

    if (error instanceof AppwriteError) {
      // Map common Appwrite errors to user-friendly messages
      switch (error.code) {
        case 'user_invalid_credentials':
          return 'Invalid email or password. Please try again.';
        case 'user_email_already_exists':
          return 'An account with this email already exists.';
        case 'user_password_mismatch':
          return 'Passwords do not match.';
        case 'document_not_found':
          return 'The requested item was not found.';
        case 'document_invalid_structure':
          return 'Invalid data format. Please check your input.';
        case 'collection_not_found':
          return 'Service temporarily unavailable. Please try again later.';
        default:
          return error.message || 'Something went wrong. Please try again.';
      }
    }

    return error.message || 'An unexpected error occurred. Please try again.';
  }
}

// Async error wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    ErrorHandler.getInstance().handleError(error, context);
    return fallback;
  }
}

// Sync error wrapper
export function withSyncErrorHandling<T>(
  operation: () => T,
  context?: string,
  fallback?: T
): T | undefined {
  try {
    return operation();
  } catch (error) {
    ErrorHandler.getInstance().handleError(error, context);
    return fallback;
  }
}

// Error reporting utility
export function reportError(error: Error, additionalData?: Record<string, any>): void {
  // In a real app, this would send to crash reporting service
  console.error('Error reported:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...additionalData
  });
}