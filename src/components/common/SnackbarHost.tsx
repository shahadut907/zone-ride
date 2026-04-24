import React, { useEffect, useRef } from 'react';
import { Animated, Text, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';

type SnackbarHostProps = {
  message: string | null;
  onDismiss: () => void;
};

const SnackbarHost: React.FC<SnackbarHostProps> = ({ message, onDismiss }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (message) {
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => onDismiss());
      }, 2800);

      return () => clearTimeout(timer);
    }
  }, [message, opacity, translateY, onDismiss]);

  if (!message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { bottom: insets.bottom + 80, opacity, transform: [{ translateY }] },
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.toastBackground }]} />
      )}
      <View style={styles.border} />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    zIndex: 1000,
    alignItems: 'center',
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    borderWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  text: {
    color: colors.toastText,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
});

export default SnackbarHost;
