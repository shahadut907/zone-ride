import { ViewStyle } from 'react-native';

/**
 * Shadow presets for iOS 26 Glassmorphism design.
 *
 * elevation is set to 0 on ALL presets because Android draws a
 * solid opaque rectangle behind elevated views — even when
 * backgroundColor is semi-transparent (rgba). This causes a
 * visible white box artefact on every glass card.
 *
 * Depth on Android comes entirely from the translucent glass
 * surface tint + subtle borders defined in glassValues.
 */

export const shadows: Record<string, ViewStyle> = {
  sm: {
    shadowColor: '#8E9BB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 0,
  },
  md: {
    shadowColor: '#8E9BB5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 0,
  },
  lg: {
    shadowColor: '#8E9BB5',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 0,
  },
  button: {
    shadowColor: '#2B5FE0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 0,
  },
  neumorphic: {
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 0,
  },
  tabBar: {
    shadowColor: '#8E9BB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 0,
  },
};
