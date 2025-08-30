import { Alert } from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

class ToastManager {
  private static instance: ToastManager;

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  show(options: ToastOptions): void {
    const { title, message, type = 'info', action } = options;
    
    // Get appropriate title based on type
    const defaultTitle = this.getDefaultTitle(type);
    const finalTitle = title || defaultTitle;

    if (action) {
      Alert.alert(
        finalTitle,
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: action.label, onPress: action.onPress }
        ]
      );
    } else {
      Alert.alert(finalTitle, message);
    }
  }

  success(message: string, title?: string): void {
    this.show({ message, title, type: 'success' });
  }

  error(message: string, title?: string): void {
    this.show({ message, title, type: 'error' });
  }

  warning(message: string, title?: string): void {
    this.show({ message, title, type: 'warning' });
  }

  info(message: string, title?: string): void {
    this.show({ message, title, type: 'info' });
  }

  private getDefaultTitle(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      default:
        return 'Notification';
    }
  }
}

// Export singleton instance
export const toast = ToastManager.getInstance();

// Export convenience functions
export const showToast = (options: ToastOptions) => toast.show(options);
export const showSuccess = (message: string, title?: string) => toast.success(message, title);
export const showError = (message: string, title?: string) => toast.error(message, title);
export const showWarning = (message: string, title?: string) => toast.warning(message, title);
export const showInfo = (message: string, title?: string) => toast.info(message, title);