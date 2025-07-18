/**
 * Theme utility file to provide consistent access to colors and styling
 * throughout the application.
 */

// Main application color palette
export const colors = {
  // Dark slate/charcoal primary colors
  primary: {
    light: '#4b5563',  // dark gray-600
    main: '#1f2937',   // dark gray-800
    dark: '#111827',   // dark gray-900
    veryLightBlue: '#E6F7FF', // Very light blue for headers and menus
  },
  
  // Purple secondary colors
  secondary: {
    light: '#d8b4fe',  // secondary-300
    main: '#a855f7',   // secondary-500
    dark: '#7e22ce',   // secondary-700
  },
  
  // Amber accent colors
  accent: {
    light: '#fcd34d',  // accent-300
    main: '#f59e0b',   // accent-500
    dark: '#b45309',   // accent-700
  },
  
  // Neutral colors for backgrounds, text, etc.
  neutral: {
    white: '#ffffff',
    background: '#f8fafc',
    lightGray: '#f1f5f9',
    gray: '#94a3b8',
    darkGray: '#475569',
    text: '#1e293b',
    black: '#0f172a',
  },
  
  // Semantic colors
  status: {
    success: '#10b981',  // emerald-500
    warning: '#f59e0b',  // amber-500
    error: '#ef4444',    // red-500
    info: '#3b82f6',     // blue-500
  }
};

// Common spacing values for margins, padding, etc.
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Typography settings
export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    heading: 32,
  },
  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// Border radius values
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

// Shadows for elevation
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
};

// Default theme object that combines all theme properties
export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
};

export default theme;