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

// Extended design system tokens (non-breaking additions)
export const designTokens = {
  colors: {
    core: {
      primary: '#2F6EF4',
      primaryDark: '#1D4EB2',
      primaryLight: '#E3F0FF',
      accent: '#FF9F1C',
      accentDark: '#D97100',
      success: '#1FA971',
      warning: '#D97917',
      error: '#D43D3D',
      info: '#3C83D6',
      neutral0: '#FFFFFF',
      neutral50: '#F7F9FB',
      neutral100: '#EDF1F5',
      neutral200: '#D9E0E7',
      neutral300: '#B6C2CE',
      neutral500: '#6A7785',
      neutral700: '#3A4652',
      neutral900: '#12181F',
      focus: '#6D45FF',
    },
    semantic: {
      grammar: '#2F6EF4',
      vocab: '#1FA971',
      listening: '#7B52F8',
      speaking: '#FF9F1C',
    },
    states: {
      positiveBg: '#E6F9F0',
      warningBg: '#FFF4E0',
      errorBg: '#FDECEC',
      infoBg: '#E8F3FD',
      focusRing: '#6D45FF',
      overlayScrim: 'rgba(18,24,31,0.5)',
    },
  },
  typography: {
    scale: {
      h1: { fontSize: 32, lineHeight: 40, fontWeight: '600' },
      h2: { fontSize: 24, lineHeight: 32, fontWeight: '600' },
      h3: { fontSize: 20, lineHeight: 28, fontWeight: '600' },
      title: { fontSize: 18, lineHeight: 26, fontWeight: '500' },
      body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
      bodySmall: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
      caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
      numeral: { fontSize: 20, lineHeight: 24, fontWeight: '500' },
    },
  },
  spacingScale: [4,8,12,16,20,24,32,40,56],
  radii: { xs:4, sm:6, md:8, lg:12, pill:999 },
  elevation: {
    0: { shadowColor: 'transparent', shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
    1: { shadowColor: '#12181F', shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
    2: { shadowColor: '#12181F', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
    3: { shadowColor: '#12181F', shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
  },
};

// Theme builder to support light / dark mode; maintains legacy shape
export type Mode = 'light' | 'dark';

export function buildTheme(mode: Mode = 'light') {
  const isDark = mode === 'dark';
  return {
    mode,
    colors: {
      ...colors,
      background: isDark ? designTokens.colors.core.neutral900 : colors.neutral.background,
      surface: isDark ? '#1B222A' : colors.neutral.white,
      textPrimary: isDark ? designTokens.colors.core.neutral100 : colors.neutral.text,
      textSecondary: isDark ? designTokens.colors.core.neutral300 : colors.neutral.darkGray,
      divider: isDark ? '#2A313A' : colors.neutral.lightGray,
      focus: designTokens.colors.core.focus,
      skill: designTokens.colors.semantic,
      state: designTokens.colors.states,
    },
    typography: { ...typography, roles: designTokens.typography.scale },
    spacing,
    radii: { ...borderRadius, ...designTokens.radii },
    elevation: designTokens.elevation,
    tokens: designTokens,
  };
}

// Export a default built theme instance (light) for immediate use
export const extendedTheme = buildTheme('light');