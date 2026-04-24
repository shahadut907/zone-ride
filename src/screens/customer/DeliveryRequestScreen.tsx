import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassBackground from '../../components/common/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { CustomerStackParamList, DeliveryRequest } from '../../types';
import { useApp } from '../../context/AppContext';
import { mockPost } from '../../services/mockApi';
import AppTextInput from '../../components/common/AppTextInput';
import AppButton from '../../components/common/AppButton';
import ScreenHeader from '../../components/common/ScreenHeader';
import { calculateFeeBreakdown } from '../../utils/areaPricing';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { LABELS, DELIVERY_TIME_OPTIONS } from '../../constants/labels';

type Props = StackScreenProps<CustomerStackParamList, 'DeliveryRequest'>;

const DeliveryRequestScreen: React.FC<Props> = ({ navigation, route }) => {
  const { riderId, shopId } = route.params ?? {};
  const { state, dispatch } = useApp();

  const area = state.selectedArea ?? '';
  const session = state.customerSession;

  const [itemDescription, setItemDescription] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState(
    session?.defaultAddress ?? ''
  );
  const [deliveryTime, setDeliveryTime] = useState(DELIVERY_TIME_OPTIONS[0]);
  const [deliveryFee, setDeliveryFee] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const feeBreakdown = deliveryFee && !isNaN(Number(deliveryFee)) && Number(deliveryFee) > 0
    ? calculateFeeBreakdown(Number(deliveryFee), area)
    : null;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!itemDescription.trim()) next.itemDescription = 'Item description is required';
    if (!pickupLocation.trim()) next.pickupLocation = 'Pickup location is required';
    if (!deliveryLocation.trim()) next.deliveryLocation = 'Delivery location is required';
    if (!deliveryFee.trim() || isNaN(Number(deliveryFee)) || Number(deliveryFee) <= 0) {
      next.deliveryFee = 'Enter a valid delivery fee';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const newRequest: DeliveryRequest = {
        id: 'req_' + Date.now(),
        customerId: session?.id ?? 'cust_001',
        customerName: session?.name ?? 'Customer',
        customerPhone: session?.phone ?? '',
        riderId,
        shopId,
        itemDescription: itemDescription.trim(),
        pickupLocation: pickupLocation.trim(),
        deliveryLocation: deliveryLocation.trim(),
        deliveryTime,
        deliveryFee: Number(deliveryFee),
        area,
        status: 'POSTED',
        createdAt: new Date().toISOString(),
      };
      const result = await mockPost<DeliveryRequest>(newRequest);
      dispatch({ type: 'ADD_REQUEST', payload: result });
      dispatch({ type: 'SHOW_TOAST', payload: LABELS.requestPosted });
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  }, [
    itemDescription,
    pickupLocation,
    deliveryLocation,
    deliveryTime,
    deliveryFee,
    area,
    session,
    riderId,
    shopId,
    dispatch,
    navigation,
  ]);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScreenHeader
        title={LABELS.requestFormTitle}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {/* Prefill hint */}
        {(riderId ?? shopId) ? (
          <View style={[styles.hintCard, shadows.sm]}>
            <GlassBackground intensity={35} />
            <View style={styles.hintBorder} />
            <Ionicons
              name={'information-circle-outline' as keyof typeof Ionicons.glyphMap}
              size={16}
              color={colors.primary}
            />
            <Text style={styles.hintText}>
              {riderId
                ? 'Requesting delivery from a specific rider'
                : 'Requesting delivery from a specific shop'}
            </Text>
          </View>
        ) : null}

        {/* Form card */}
        <View style={[styles.formCard, shadows.md]}>
          <GlassBackground intensity={48} />
          <View style={styles.formBorder} />
          <View style={styles.formInner}>
            <AppTextInput
              label={LABELS.itemDescription}
              placeholder={LABELS.itemDescriptionPlaceholder}
              value={itemDescription}
              onChangeText={(t) => { setItemDescription(t); setErrors((e) => ({ ...e, itemDescription: '' })); }}
              error={errors.itemDescription}
              editable={!isLoading}
              multiline
              numberOfLines={3}
              style={styles.multilineInput}
            />
            <AppTextInput
              label={LABELS.pickupLocation}
              placeholder={LABELS.pickupPlaceholder}
              value={pickupLocation}
              onChangeText={(t) => { setPickupLocation(t); setErrors((e) => ({ ...e, pickupLocation: '' })); }}
              error={errors.pickupLocation}
              editable={!isLoading}
            />
            <AppTextInput
              label={LABELS.deliveryLocation}
              placeholder={LABELS.deliveryPlaceholder}
              value={deliveryLocation}
              onChangeText={(t) => { setDeliveryLocation(t); setErrors((e) => ({ ...e, deliveryLocation: '' })); }}
              error={errors.deliveryLocation}
              editable={!isLoading}
            />
            <AppTextInput
              label={LABELS.deliveryFee}
              placeholder={LABELS.feePlaceholder}
              value={deliveryFee}
              onChangeText={(t) => { setDeliveryFee(t); setErrors((e) => ({ ...e, deliveryFee: '' })); }}
              error={errors.deliveryFee}
              keyboardType="numeric"
              editable={!isLoading}
            />

            {/* Delivery time picker */}
            <Text style={styles.fieldLabel}>{LABELS.deliveryTime}</Text>
            <View style={styles.timeOptions}>
              {DELIVERY_TIME_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  onPress={() => setDeliveryTime(opt)}
                  style={[styles.timeOption, deliveryTime === opt && styles.timeOptionSelected]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      deliveryTime === opt && styles.timeOptionTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Fee breakdown card */}
        {feeBreakdown ? (
          <View style={[styles.breakdownCard, shadows.sm]}>
            <GlassBackground intensity={40} />
            <View style={styles.breakdownBorder} />
            <View style={styles.breakdownInner}>
              <Text style={styles.breakdownTitle}>Fee Breakdown</Text>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{LABELS.baseFee}</Text>
                <Text style={styles.breakdownValue}>{feeBreakdown.baseFee} BDT</Text>
              </View>
              {feeBreakdown.commission > 0 ? (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>
                    {LABELS.platformCommission} ({feeBreakdown.commissionPercent}%)
                  </Text>
                  <Text style={styles.breakdownValue}>{feeBreakdown.commission.toFixed(2)} BDT</Text>
                </View>
              ) : null}
              {feeBreakdown.deliveryCharge > 0 ? (
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>{LABELS.deliveryCharge}</Text>
                  <Text style={styles.breakdownValue}>{feeBreakdown.deliveryCharge} BDT</Text>
                </View>
              ) : null}
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownTotal}>{LABELS.total}</Text>
                <Text style={styles.breakdownTotalValue}>{feeBreakdown.total.toFixed(2)} BDT</Text>
              </View>
            </View>
          </View>
        ) : null}

        <AppButton
          label={LABELS.submit}
          onPress={handleSubmit}
          isLoading={isLoading}
          fullWidth
          style={styles.submitBtn}
        />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 160,
    gap: spacing.md,
  },
  hintCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  hintBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  hintText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  formCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  formBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  formInner: {
    padding: spacing.lg,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  timeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.glassBg,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  timeOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: 'transparent',
  },
  timeOptionText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  timeOptionTextSelected: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  breakdownCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  breakdownBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  breakdownInner: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  breakdownTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  breakdownValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },
  breakdownTotal: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  breakdownTotalValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});

export default DeliveryRequestScreen;
