// Design system for Vyoma — centralized so Phase 2 web/client apps can reuse tokens.
export const colors = {
  primary: '#1B4DFF',
  primaryLight: '#EEF2FF',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  surface: '#FFFFFF',
  background: '#F7F6F3',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textHint: '#9CA3AF',
  border: '#E5E7EB',
  accent: '#F59E0B'
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
  giant: 64
};

export const radii = {
  card: 16,
  button: 12,
  input: 10,
  chip: 20,
  circle: 999
};

export const shadows = {
  // Using a reusable object helps keep shadow/elevation consistent across Android/iOS.
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3
  }
};

export const typography = {
  displayXL: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 32
  },
  displayL: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 24
  },
  displayM: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 20
  },
  bodyL: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16
  },
  bodyM: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14
  },
  bodyS: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13
  },
  mono: {
    fontFamily: 'DMMono_400Regular',
    fontSize: 14
  }
};

export const theme = {
  colors,
  spacing,
  radii,
  shadows,
  typography
};

// Helper to create ripple/press styles that feel consistent across the app.
export const pressScale = {
  pressed: 0.97,
  duration: 80
};

// React Native Paper theme adapter so we can keep a single source of truth.
export const paperTheme = {
  dark: false,
  roundness: radii.card,
  colors: {
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    text: colors.textPrimary,
    placeholder: colors.textHint,
    disabled: colors.textHint,
    error: colors.danger,
    notification: colors.accent,
    backdrop: 'rgba(15,23,42,0.4)'
  }
};

