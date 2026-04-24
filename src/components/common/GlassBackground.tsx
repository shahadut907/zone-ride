import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { glassValues } from '../../theme/glass';

type GlassBackgroundProps = {
  /** BlurView intensity (iOS only). Defaults to 40. */
  intensity?: number;
  /** Fallback Android background color. Defaults to cardBg. */
  fallbackColor?: string;
};

const GlassBackground: React.FC<GlassBackgroundProps> = ({
  intensity = 40,
  fallbackColor = glassValues.cardBg,
}) => {
  if (Platform.OS === 'ios') {
    return <BlurView intensity={intensity} tint="light" style={StyleSheet.absoluteFill} pointerEvents="none" />;
  }
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: fallbackColor, borderRadius: 0 },
      ]}
    />
  );
};

export default GlassBackground;
