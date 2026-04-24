import { Platform, StyleSheet } from 'react-native';

const isIOS = Platform.OS === 'ios';

export const glassValues = {
  /** Single glass surface — semi-transparent frosted white */
  cardBg: isIOS
    ? 'rgba(255, 255, 255, 0.18)'
    : 'rgba(255, 255, 255, 0.42)',

  /** Tab bar — slightly more opaque for readability */
  tabBarBg: isIOS
    ? 'rgba(255, 255, 255, 0.22)'
    : 'rgba(255, 255, 255, 0.72)',

  /** Header — similar to tab bar */
  headerBg: isIOS
    ? 'rgba(255, 255, 255, 0.22)'
    : 'rgba(255, 255, 255, 0.72)',

  /** Badge border */
  badgeBorder: 'rgba(255, 255, 255, 0.25)',

  /** Segmented control track */
  segmentBg: isIOS
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(255, 255, 255, 0.35)',

  /** Active segment pill */
  segmentActiveBg: isIOS
    ? 'rgba(255, 255, 255, 0.55)'
    : 'rgba(255, 255, 255, 0.85)',

  /** Input fields */
  inputBg: isIOS
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(255, 255, 255, 0.45)',

  /** Neumorphic action buttons */
  neumorphicBg: isIOS
    ? 'rgba(255, 255, 255, 0.20)'
    : 'rgba(255, 255, 255, 0.50)',

  /** Subtle top-edge highlight color */
  edgeHighlight: 'rgba(255, 255, 255, 0.45)',

  /** Very soft border for depth separation */
  softBorder: 'rgba(255, 255, 255, 0.18)',
} as const;

export const glassStyles = StyleSheet.create({
  card: {
    backgroundColor: glassValues.cardBg,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
    borderTopWidth: 0.5,
    borderTopColor: glassValues.edgeHighlight,
  },
  cardInner: {
    padding: 16,
  },
  surface: {
    backgroundColor: glassValues.cardBg,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
    borderTopWidth: 0.5,
    borderTopColor: glassValues.edgeHighlight,
  },
  tabBar: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    height: 76,
    backgroundColor: glassValues.tabBarBg,
    borderTopWidth: 0,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
    elevation: 0,
    shadowColor: '#8E9BB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  header: {
    backgroundColor: glassValues.headerBg,
    borderBottomWidth: 0,
  },
  modal: {
    backgroundColor: glassValues.cardBg,
    borderRadius: 28,
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
    borderTopWidth: 0.5,
    borderTopColor: glassValues.edgeHighlight,
  },
  badge: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  segment: {
    backgroundColor: glassValues.segmentBg,
    borderRadius: 28,
    height: 52,
    padding: 4,
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
  },
  segmentActive: {
    backgroundColor: glassValues.segmentActiveBg,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  neumorphicButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: glassValues.neumorphicBg,
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#B0BEC5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  input: {
    backgroundColor: glassValues.inputBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
  },
});
