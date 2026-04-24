export const colors = {
  // Primary
  primary: '#2B5FE0',
  primaryDark: '#1E4BB8',
  primaryLight: 'rgba(43, 95, 224, 0.12)',
  secondary: '#22C55E',
  accent: '#F59E0B',
  danger: '#EF4444',

  // Glass surfaces
  glassBg: 'rgba(255, 255, 255, 0.7)',
  glassLight: 'rgba(255, 255, 255, 0.6)',
  glassBorder: 'rgba(255, 255, 255, 0.6)',
  glassDark: 'rgba(0, 0, 0, 0.04)',
  // Gradient backgrounds (5-stop purple-blue)
  gradientStart: '#C9D6FF',
  gradientMid: '#D5C3F5',
  gradientEnd: '#E2D8F8',
  gradientFinal: '#EEE9FD',
  gradientLast: '#F5F3FF',

  // Text - high contrast for readability on glass
  textPrimary: '#1A1A2E',
  textSecondary: '#4A5568',
  textMuted: '#8E8E93',

  // Surfaces
  background: '#F2F2F7',
  surface: 'rgba(255, 255, 255, 0.7)',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  info: '#3B82F6',
  badgeActive: '#22C55E',
  badgeInactive: '#8E8E93',
  badgeOpen: '#22C55E',
  badgeClosed: '#EF4444',

  // Common
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.3)',
  divider: 'rgba(0, 0, 0, 0.04)',
  border: 'rgba(0, 0, 0, 0.08)',

  // Chat
  chatOwnBubble: '#2B5FE0',
  chatOtherBubble: 'rgba(255, 255, 255, 0.7)',
  chatOwnText: '#FFFFFF',
  chatOtherText: '#1A1A2E',

  // Toast
  toastBackground: 'rgba(28, 28, 30, 0.85)',
  toastText: '#FFFFFF',

  // Rating
  starFilled: '#F59E0B',
  starEmpty: '#D1D5DB',

  // Neumorphic action buttons
  neumorphicBg: 'rgba(255, 255, 255, 0.6)',
  neumorphicIcon: '#5A6B7F',

  // Notification bell
  notifBellBg: '#2C3040',

  // Location badge
  locationBadgeBg: 'rgba(255, 255, 255, 0.5)',
  locationBadgeText: '#4A5568',

  // Segment toggle
  segmentBg: 'rgba(255, 255, 255, 0.5)',
  segmentActiveBg: '#FFFFFF',
  segmentActiveText: '#2B5FE0',
  segmentInactiveText: '#8E8E93',

  // Input
  inputBg: 'rgba(255, 255, 255, 0.6)',
  inputPlaceholder: '#A0AEC0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const borderRadius = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  full: 999,
};

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 24,
  sectionHeader: 18,
  title: 32,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};
