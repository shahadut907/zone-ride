import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { glassValues } from '../../theme/glass';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import { mockPost } from '../../services/mockApi';
import AppTextInput from '../../components/common/AppTextInput';
import AppButton from '../../components/common/AppButton';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { LABELS } from '../../constants/labels';

type Props = StackScreenProps<RootStackParamList, 'CustomerLogin'>;
type LoginStep = 'phone' | 'otp';

const DEMO_OTP = '1234';

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { dispatch } = useApp();

  const [step, setStep] = useState<LoginStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const otpOpacity = useRef(new Animated.Value(0)).current;
  const otpTranslateY = useRef(new Animated.Value(16)).current;

  const animateOtpIn = () => {
    Animated.parallel([
      Animated.timing(otpOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(otpTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }),
    ]).start();
  };

  const handleSendOtp = async () => {
    const trimmed = phone.trim();
    if (trimmed.length < 11) {
      setPhoneError('Enter a valid 11-digit phone number');
      return;
    }
    setPhoneError('');
    setIsLoading(true);
    await mockPost({ phone: trimmed });
    setIsLoading(false);
    setStep('otp');
    animateOtpIn();
    dispatch({ type: 'SHOW_TOAST', payload: 'OTP sent to ' + trimmed });
  };

  const handleVerifyOtp = async () => {
    if (otp.trim() !== DEMO_OTP) {
      setOtpError('Incorrect OTP. Use 1234 for demo.');
      return;
    }
    setOtpError('');
    setIsLoading(true);
    await mockPost({ otp: otp.trim() });
    dispatch({
      type: 'SET_CUSTOMER_SESSION',
      payload: {
        id: 'cust_001',
        name: 'Tanvir Hasan',
        phone: phone.trim(),
        defaultAddress: 'Flat 3B, Green Valley Apartment, Uttara Sector 7',
      },
    });
    setIsLoading(false);
    navigation.replace('AreaSelection');
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await mockPost({ provider: 'google' });
    dispatch({
      type: 'SET_CUSTOMER_SESSION',
      payload: {
        id: 'cust_001',
        name: 'Tanvir Hasan',
        phone: '+8801912345678',
        defaultAddress: 'Flat 3B, Green Valley Apartment, Uttara Sector 7',
      },
    });
    setIsLoading(false);
    navigation.replace('AreaSelection');
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('phone');
      setOtp('');
      setOtpError('');
      otpOpacity.setValue(0);
      otpTranslateY.setValue(16);
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('RoleSelection');
    }
  };

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={'chevron-back' as keyof typeof Ionicons.glyphMap}
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.headerBlock}>
          <View style={styles.logoCard}>
            <Ionicons
              name={'bicycle' as keyof typeof Ionicons.glyphMap}
              size={32}
              color={colors.primary}
            />
          </View>
          <Text style={styles.title}>{LABELS.loginTitle}</Text>
          <Text style={styles.subtitle}>{LABELS.loginSubtitle}</Text>
        </View>

        {/* Form card */}
        <View style={[styles.formCard, shadows.lg]}>
          <View style={styles.formInner}>

            {/* Phone step */}
            <AppTextInput
              label={LABELS.phoneLabel}
              placeholder={LABELS.phonePlaceholder}
              value={phone}
              onChangeText={(t: string) => { setPhone(t); setPhoneError(''); }}
              keyboardType="phone-pad"
              error={phoneError}
              editable={!isLoading}
              maxLength={14}
            />

            {step === 'phone' && (
              <AppButton
                label={LABELS.sendOtp}
                onPress={handleSendOtp}
                isLoading={isLoading}
                fullWidth
              />
            )}

            {/* OTP step */}
            {step === 'otp' && (
              <Animated.View
                style={{ opacity: otpOpacity, transform: [{ translateY: otpTranslateY }] }}
              >
                <View style={styles.hintRow}>
                  <Ionicons
                    name={'information-circle-outline' as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color={colors.textMuted}
                  />
                  <Text style={styles.hintText}>Demo OTP: 1234</Text>
                </View>
                <AppTextInput
                  label={LABELS.otpLabel}
                  placeholder={LABELS.otpPlaceholder}
                  value={otp}
                  onChangeText={(t: string) => { setOtp(t); setOtpError(''); }}
                  keyboardType="number-pad"
                  maxLength={4}
                  error={otpError}
                  editable={!isLoading}
                />
                <AppButton
                  label={LABELS.verifyOtp}
                  onPress={handleVerifyOtp}
                  isLoading={isLoading}
                  fullWidth
                />
              </Animated.View>
            )}

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{LABELS.orDivider}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google sign-in */}
            <AppButton
              label={LABELS.googleSignIn}
              onPress={handleGoogleSignIn}
              variant="ghost"
              fullWidth
              isLoading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.xxxxl,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoCard: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: glassValues.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 0,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  formCard: {
    borderRadius: borderRadius.xl,
    backgroundColor: glassValues.cardBg,
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
    borderTopColor: glassValues.edgeHighlight,
  },
  formInner: {
    padding: spacing.xl,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  hintText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
});

export default LoginScreen;
