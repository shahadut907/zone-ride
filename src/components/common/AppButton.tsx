import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors, fontSize, fontWeight, borderRadius } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  style,
}) => {
  const isDisabled = disabled || isLoading;

  const variantStyles = {
    primary: {
      container: [styles.base, styles.primary, shadows.button] as ViewStyle[],
      text: styles.primaryText,
      loader: colors.white,
    },
    secondary: {
      container: [styles.base, styles.secondary] as ViewStyle[],
      text: styles.secondaryText,
      loader: colors.primary,
    },
    ghost: {
      container: [styles.base, styles.ghost] as ViewStyle[],
      text: styles.ghostText,
      loader: colors.primary,
    },
    danger: {
      container: [styles.base, styles.danger] as ViewStyle[],
      text: styles.dangerText,
      loader: colors.white,
    },
  };

  const v = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        ...v.container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={v.loader} />
      ) : (
        <Text style={v.text}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderWidth: 0,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  secondary: {
    backgroundColor: colors.primaryLight,
  },
  secondaryText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  ghost: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  ghostText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  dangerText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.45,
  },
});

export default AppButton;
