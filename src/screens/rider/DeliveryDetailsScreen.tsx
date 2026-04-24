import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { glassValues } from '../../theme/glass';
import { StackScreenProps } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { RiderStackParamList, DeliveryStatus } from '../../types';
import { calculateFeeBreakdown } from '../../utils/areaPricing';
import { mockPatch } from '../../services/mockApi';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { LABELS } from '../../constants/labels';
import ScreenHeader from '../../components/common/ScreenHeader';
import StatusStepper from '../../components/tracking/StatusStepper';
import AppButton from '../../components/common/AppButton';
import LoadingOverlay from '../../components/common/LoadingOverlay';

type Props = StackScreenProps<RiderStackParamList, 'DeliveryDetails'>;

const DEMO_RIDER_ID = 'rider-1';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const DELIVERY_MAP = require('../../../assets/delivery_map.jpg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DELIVERY_MAP_2 = require('../../../assets/delivery_map_v2.png');

const DeliveryDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { requestId } = route.params;
  const { state, dispatch } = useApp();
  const [isActioning, setIsActioning] = useState(false);

  const request = useMemo(
    () => state.requests.find((r) => r.id === requestId),
    [state.requests, requestId]
  );

  const feeBreakdown = useMemo(() => {
    if (!request) return null;
    return calculateFeeBreakdown(request.deliveryFee, request.area);
  }, [request]);

  const idNum = parseInt(requestId.replace(/\D/g, '') || '0', 10);
  const mapSource = idNum % 2 === 0 ? DELIVERY_MAP_2 : DELIVERY_MAP;
  const mapPickupColor = idNum % 2 === 0 ? colors.success : colors.primary;
  const mapDropColor = idNum % 2 === 0 ? '#8B5CF6' : colors.danger;
  const mapDistance = ((idNum * 1.4) % 5 + 1).toFixed(1);
  const mapTime = Math.floor(((idNum * 3) % 20) + 10);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleStatusUpdate = useCallback(
    async (newStatus: DeliveryStatus, extras?: Record<string, string>) => {
      if (!request) return;
      setIsActioning(true);
      await mockPatch({ status: newStatus });
      dispatch({
        type: 'UPDATE_REQUEST',
        payload: {
          id: request.id,
          updates: { status: newStatus, ...extras },
        },
      });
      dispatch({ type: 'SHOW_TOAST', payload: `Status updated to ${newStatus}` });
      setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2500);
      setIsActioning(false);
    },
    [request, dispatch]
  );

  const handleAccept = useCallback(() => {
    handleStatusUpdate('ACCEPTED', { riderId: DEMO_RIDER_ID });
  }, [handleStatusUpdate]);

  const handleReject = useCallback(() => {
    handleStatusUpdate('REJECTED');
  }, [handleStatusUpdate]);

  const handleMarkPicked = useCallback(() => {
    handleStatusUpdate('PICKED');
  }, [handleStatusUpdate]);

  const handleMarkOnTheWay = useCallback(() => {
    handleStatusUpdate('ON_THE_WAY');
  }, [handleStatusUpdate]);

  const handleMarkDelivered = useCallback(() => {
    handleStatusUpdate('DELIVERED');
  }, [handleStatusUpdate]);

  const handleCall = useCallback(() => {
    if (request?.customerPhone) {
      Linking.openURL(`tel:${request.customerPhone}`);
    }
  }, [request]);

  if (!request) {
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.root}
      >
        <ScreenHeader title={LABELS.deliveryDetailsTitle} onBack={handleGoBack} />
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyText}>Request not found</Text>
        </View>
      </LinearGradient>
    );
  }

  const isTerminal =
    request.status === 'DELIVERED' ||
    request.status === 'COMPLETED' ||
    request.status === 'REJECTED';

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <ScreenHeader title={LABELS.deliveryDetailsTitle} onBack={handleGoBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Route Map */}
        <View style={[styles.card, shadows.sm]}>
          <View style={styles.mapContainer}>
            <Image
              source={mapSource}
              style={styles.mapImage}
              resizeMode="cover"
            />
            {/* Map overlay markers */}
            <View style={styles.mapOverlay}>
              <View style={[styles.mapMarkerPickup, { backgroundColor: mapPickupColor }]}>
                <Ionicons
                  name={'location' as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color="#fff"
                />
              </View>
              <View style={[styles.mapRouteLine, { backgroundColor: mapPickupColor }]} />
              <View style={[styles.mapMarkerDrop, { backgroundColor: mapDropColor }]}>
                <Ionicons
                  name={'flag' as keyof typeof Ionicons.glyphMap}
                  size={14}
                  color="#fff"
                />
              </View>
            </View>
            {/* Route info badge */}
            <View style={styles.mapBadge}>
              <Ionicons
                name={'navigate-outline' as keyof typeof Ionicons.glyphMap}
                size={14}
                color={colors.primary}
              />
              <Text style={styles.mapBadgeText}>~{mapDistance} km • {mapTime} min</Text>
            </View>
          </View>
        </View>

        {/* Status Stepper */}
        <View style={[styles.card, shadows.sm]}>
          <View style={styles.cardInner}>
            <StatusStepper status={request.status} />
          </View>
        </View>

        {/* Delivery Info */}
        <View style={[styles.card, shadows.sm]}>
          <View style={styles.cardInner}>
            <View style={styles.cardContent}>
              <Text style={styles.sectionTitle}>Delivery Information</Text>
              <InfoRow
                icon="cube-outline"
                label={LABELS.itemDescription}
                value={request.itemDescription}
              />
              <InfoRow
                icon="location-outline"
                label={LABELS.pickupLocation}
                value={request.pickupLocation}
              />
              <InfoRow
                icon="navigate-outline"
                label={LABELS.deliveryLocation}
                value={request.deliveryLocation}
              />
              <InfoRow
                icon="time-outline"
                label={LABELS.deliveryTime}
                value={request.deliveryTime}
              />
              <InfoRow
                icon="person-outline"
                label={LABELS.name}
                value={request.customerName}
              />
              <InfoRow
                icon="call-outline"
                label={LABELS.phone}
                value={request.customerPhone}
                onPress={handleCall}
              />
            </View>
          </View>
        </View>

        {/* Fee Breakdown */}
        {feeBreakdown && (
          <View style={[styles.card, shadows.sm]}>
            <View style={styles.cardInner}>
              <View style={styles.cardContent}>
                <Text style={styles.sectionTitle}>Fee Breakdown</Text>
                <FeeRow label={LABELS.baseFee} value={`${feeBreakdown.baseFee} BDT`} />
                <FeeRow
                  label={`${LABELS.platformCommission} (${feeBreakdown.commissionPercent}%)`}
                  value={`${feeBreakdown.commission} BDT`}
                />
                <FeeRow label={LABELS.deliveryCharge} value={`${feeBreakdown.deliveryCharge} BDT`} />
                <View style={styles.feeDivider} />
                <FeeRow label={LABELS.total} value={`${feeBreakdown.total} BDT`} isBold />
              </View>
            </View>
          </View>
        )}

        {/* Completion message */}
        {isTerminal && (
          <View style={[styles.card, shadows.sm]}>
            <View style={styles.cardInner}>
              <View style={styles.completionContent}>
                <Ionicons
                  name={
                    request.status === 'REJECTED'
                      ? ('close-circle' as keyof typeof Ionicons.glyphMap)
                      : ('checkmark-circle' as keyof typeof Ionicons.glyphMap)
                  }
                  size={40}
                  color={request.status === 'REJECTED' ? colors.danger : colors.success}
                />
                <Text style={styles.completionText}>
                  {request.status === 'REJECTED'
                    ? 'This request was rejected'
                    : request.status === 'COMPLETED'
                      ? 'Delivery completed successfully!'
                      : 'Delivery has been marked as delivered'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action buttons footer - positioned above the floating tab bar */}
      {!isTerminal && (
        <View style={[styles.footer, shadows.md]}>
          <View style={styles.footerContent}>
            {request.status === 'POSTED' && (
              <>
                <AppButton
                  label={LABELS.accept}
                  onPress={handleAccept}
                  variant="primary"
                  style={styles.actionBtn}
                  disabled={isActioning}
                />
                <AppButton
                  label={LABELS.reject}
                  onPress={handleReject}
                  variant="danger"
                  style={styles.actionBtn}
                  disabled={isActioning}
                />
              </>
            )}
            {request.status === 'ACCEPTED' && (
              <AppButton
                label={LABELS.markPicked}
                onPress={handleMarkPicked}
                variant="primary"
                fullWidth
                disabled={isActioning}
              />
            )}
            {request.status === 'PICKED' && (
              <AppButton
                label={LABELS.markOnTheWay}
                onPress={handleMarkOnTheWay}
                variant="primary"
                fullWidth
                disabled={isActioning}
              />
            )}
            {request.status === 'ON_THE_WAY' && (
              <AppButton
                label={LABELS.markDelivered}
                onPress={handleMarkDelivered}
                variant="primary"
                fullWidth
                disabled={isActioning}
              />
            )}
          </View>
        </View>
      )}

      <LoadingOverlay visible={isActioning} message={LABELS.loading} />
    </LinearGradient>
  );
};

// ─── Internal components ────────────────────────────────────────────────────

type InfoRowProps = {
  icon: string;
  label: string;
  value: string;
  onPress?: () => void;
};

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, onPress }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Ionicons
        name={icon as keyof typeof Ionicons.glyphMap}
        size={18}
        color={colors.primary}
      />
    </View>
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[styles.infoValue, onPress && styles.infoLink]}
        onPress={onPress}
      >
        {value}
      </Text>
    </View>
  </View>
);

type FeeRowProps = {
  label: string;
  value: string;
  isBold?: boolean;
};

const FeeRow: React.FC<FeeRowProps> = ({ label, value, isBold }) => (
  <View style={styles.feeRow}>
    <Text style={[styles.feeLabel, isBold && styles.feeBold]}>{label}</Text>
    <Text style={[styles.feeValue, isBold && styles.feeBold]}>{value}</Text>
  </View>
);

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
    paddingBottom: 200,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: glassValues.cardBg,
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
    borderTopColor: glassValues.edgeHighlight,
  },
  cardInner: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardContent: {
    padding: spacing.lg,
    gap: spacing.md,
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
  infoIcon: {
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
  },
  infoValue: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  infoLink: {
    color: colors.primary,
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
  feeBold: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  feeDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },
  // --- Map styles ---
  mapContainer: {
    height: 180,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    gap: spacing.sm,
  },
  mapMarkerPickup: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  mapMarkerDrop: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  mapRouteLine: {
    flex: 1,
    height: 2,
    opacity: 0.8,
    borderStyle: 'dashed',
  },
  mapBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  mapBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  completionContent: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  completionText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 96,
    left: 0,
    right: 0,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    backgroundColor: glassValues.tabBarBg,
    overflow: 'hidden',
    borderWidth: 0,
  },
  footerContent: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
  },
  emptyCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});

export default DeliveryDetailsScreen;
