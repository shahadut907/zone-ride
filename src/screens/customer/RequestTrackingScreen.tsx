import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassBackground from '../../components/common/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { CustomerRequestsStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import { mockPost } from '../../services/mockApi';
import ScreenHeader from '../../components/common/ScreenHeader';
import StatusBadge from '../../components/common/StatusBadge';
import StatusStepper from '../../components/tracking/StatusStepper';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import AppButton from '../../components/common/AppButton';
import { calculateFeeBreakdown } from '../../utils/areaPricing';
import { getNextDeliveryStatus, isDeliveryTerminal, formatTimestamp } from '../../utils/statusHelpers';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { LABELS } from '../../constants/labels';

type Props = StackScreenProps<CustomerRequestsStackParamList, 'RequestTracking'>;

const RequestTrackingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { requestId } = route.params;
  const { state, dispatch } = useApp();

  const [isLoading, setIsLoading] = useState(false);

  const request = state.requests.find((r) => r.id === requestId);

  useEffect(() => {
    if (!request && navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [request, navigation]);

  if (!request) return null;

  const feeBreakdown = calculateFeeBreakdown(request.deliveryFee, request.area);
  const nextStatus = getNextDeliveryStatus(request.status);
  const isTerminal = isDeliveryTerminal(request.status);

  const createdDate = new Date(request.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  // Demo: simulate rider advancing status (for demo purposes only)
  const handleSimulateAdvance = useCallback(async () => {
    if (!nextStatus || isTerminal) return;
    setIsLoading(true);
    await mockPost({ action: 'advance_status' });
    dispatch({
      type: 'UPDATE_REQUEST',
      payload: { id: requestId, updates: { status: nextStatus } },
    });
    dispatch({
      type: 'SHOW_TOAST',
      payload: 'Status updated to ' + nextStatus.replace('_', ' '),
    });
    setIsLoading(false);
  }, [nextStatus, isTerminal, requestId, dispatch]);

  const InfoRow: React.FC<{ icon: keyof typeof Ionicons.glyphMap; label: string; value: string }> = ({
    icon,
    label,
    value,
  }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrapper}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScreenHeader
        title={LABELS.trackingTitle}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Status card */}
        <View style={[styles.card, shadows.md]}>
          <GlassBackground intensity={48} />
          <View style={styles.cardBorder} />
          <View style={styles.statusHeader}>
            <View style={styles.statusHeaderLeft}>
              <Text style={styles.requestId}>#{request.id.toUpperCase()}</Text>
              <Text style={styles.requestDate}>
                {createdDate} · {formatTimestamp(request.createdAt)}
              </Text>
            </View>
            <StatusBadge status={request.status} />
          </View>
          <View style={styles.cardDivider} />
          <StatusStepper status={request.status} />
        </View>

        {/* Route card */}
        <View style={[styles.card, shadows.sm]}>
          <GlassBackground intensity={42} />
          <View style={styles.cardBorder} />
          <View style={styles.cardInner}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <InfoRow
              icon={'cube-outline' as keyof typeof Ionicons.glyphMap}
              label="Item"
              value={request.itemDescription}
            />
            <InfoRow
              icon={'location-outline' as keyof typeof Ionicons.glyphMap}
              label="Pickup"
              value={request.pickupLocation}
            />
            <InfoRow
              icon={'flag-outline' as keyof typeof Ionicons.glyphMap}
              label="Delivery"
              value={request.deliveryLocation}
            />
            <InfoRow
              icon={'time-outline' as keyof typeof Ionicons.glyphMap}
              label="Time"
              value={request.deliveryTime}
            />
            {request.riderId ? (
              <InfoRow
                icon={'bicycle-outline' as keyof typeof Ionicons.glyphMap}
                label="Rider"
                value={
                  state.riders.find((r) => r.id === request.riderId)?.name ??
                  request.riderId
                }
              />
            ) : null}
          </View>
        </View>

        {/* Fee breakdown card */}
        <View style={[styles.card, shadows.sm]}>
          <GlassBackground intensity={42} />
          <View style={styles.cardBorder} />
          <View style={styles.cardInner}>
            <Text style={styles.sectionTitle}>Fee Breakdown</Text>
            <View style={styles.feeRow}>
              <Text style={styles.feeLabel}>{LABELS.baseFee}</Text>
              <Text style={styles.feeValue}>{feeBreakdown.baseFee} BDT</Text>
            </View>
            {feeBreakdown.commission > 0 ? (
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>
                  {LABELS.platformCommission} ({feeBreakdown.commissionPercent}%)
                </Text>
                <Text style={styles.feeValue}>{feeBreakdown.commission.toFixed(2)} BDT</Text>
              </View>
            ) : null}
            {feeBreakdown.deliveryCharge > 0 ? (
              <View style={styles.feeRow}>
                <Text style={styles.feeLabel}>{LABELS.deliveryCharge}</Text>
                <Text style={styles.feeValue}>{feeBreakdown.deliveryCharge} BDT</Text>
              </View>
            ) : null}
            <View style={styles.cardDivider} />
            <View style={styles.feeRow}>
              <Text style={styles.feeTotalLabel}>{LABELS.total}</Text>
              <Text style={styles.feeTotalValue}>{feeBreakdown.total.toFixed(2)} BDT</Text>
            </View>
          </View>
        </View>

        {/* Demo advance button */}
        {!isTerminal && nextStatus ? (
          <View style={[styles.demoCard, shadows.sm]}>
            <GlassBackground intensity={35} />
            <View style={styles.demoBorder} />
            <View style={styles.demoInner}>
              <View style={styles.demoInfo}>
                <Ionicons
                  name={'flask-outline' as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={colors.accent}
                />
                <Text style={styles.demoLabel}>Demo: Simulate next status</Text>
              </View>
              <AppButton
                label={'Advance to ' + nextStatus.replace('_', ' ')}
                onPress={handleSimulateAdvance}
                isLoading={isLoading}
                variant="secondary"
                style={styles.demoBtn}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>

      <LoadingOverlay visible={isLoading} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  cardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  cardInner: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.lg,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  statusHeaderLeft: {
    gap: 3,
  },
  requestId: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  requestDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: fontSize.sectionHeader,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  infoIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  infoValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  feeValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  feeTotalLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  feeTotalValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  demoCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  demoBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  demoInner: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  demoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  demoLabel: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: fontWeight.medium,
  },
  demoBtn: {
    alignSelf: 'stretch',
  },
});

export default RequestTrackingScreen;
