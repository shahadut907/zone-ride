import React from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { shadows } from '../../theme/shadows';
import { glassValues } from '../../theme/glass';

type GlassCardProps = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated';
  /** BlurView intensity on iOS. Defaults to 40. */
  blurIntensity?: number;
};

const isIOS = Platform.OS === 'ios';

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  variant = 'default',
  blurIntensity = 40,
}) => {
  const shadow = variant === 'elevated' ? shadows.lg : shadows.md;

  if (isIOS) {
    return (
      <View style={[styles.iosWrapper, shadow, style]}>
        <BlurView
          intensity={blurIntensity}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, styles.iosTint]} />
        <View style={styles.iosContent}>{children}</View>
      </View>
    );
  }

  // Android: ONE single View, no nesting, no elevation (avoids white rect).
  return (
    <View
      style={[
        {
          backgroundColor: glassValues.cardBg,
          borderRadius: 24,
          elevation: 0,
          borderWidth: 0.5,
          borderColor: glassValues.softBorder,
          borderTopColor: glassValues.edgeHighlight,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  iosWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
    borderTopColor: glassValues.edgeHighlight,
    backgroundColor: 'transparent',
  },
  iosTint: {
    backgroundColor: glassValues.cardBg,
  },
  iosContent: {
    padding: 16,
  },
});

export default GlassCard;
