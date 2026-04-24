import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassBackground from '../../components/common/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { ShopStackParamList, Rider, OrderStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import AppButton from '../../components/common/AppButton';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { LABELS } from '../../constants/labels';
import { formatTimestamp } from '../../utils/statusHelpers';

type Props = StackScreenProps<ShopStackParamList, 'OrderDetails'>;

const MOCK_DELAY = 1200;
const NEARBY_THRESHOLD_KM = 3;

const getMockDistance = (rider: Rider, orderArea: string): number => {
  if (rider.distanceKm !== undefined) return rider.distanceKm;
  // Seed from rider id for consistent values across re-renders
  const seed = rider.id.split('-').pop();
  const hash = parseInt(seed ?? '0', 10);
  const servesArea = rider.servedAreas.includes(orderArea);
  if (servesArea) {
    // Nearby: 0.3 - 2.5 km
    return parseFloat((0.3 + (hash * 0.37) % 2.2).toFixed(1));
  }
  // Far: 3.0 - 12.0 km
  return parseFloat((3.0 + (hash * 1.13) % 9.0).toFixed(1));
};

type RiderWithDistance = Rider & { distance: number };

const OrderDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { orderId } = route.params;
  const { state, dispatch } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRiderPicker, setShowRiderPicker] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState<'all' | 'nearby'>('all');

  const order = useMemo(
    () => state.orders.find((o) => o.id === orderId),
    [state.orders, orderId]
  );

  const assignedRider = useMemo(
    () => (order?.riderId ? state.riders.find((r) => r.id === order.riderId) : undefined),
    [state.riders, order?.riderId]
  );

  const ridersWithDistance: RiderWithDistance[] = useMemo(() => {
    if (!order) return [];
    return state.riders
      .filter((r) => r.isActive)
      .map((r) => ({
        ...r,
        distance: getMockDistance(r, order.area),
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [state.riders, order]);

  const filteredRiders = useMemo(() => {
    if (distanceFilter === 'nearby') {
      return ridersWithDistance.filter((r) => r.distance <= NEARBY_THRESHOLD_KM);
    }
    return ridersWithDistance;
  }, [ridersWithDistance, distanceFilter]);

  const nearbyCount = useMemo(
    () => ridersWithDistance.filter((r) => r.distance <= NEARBY_THRESHOLD_KM).length,
    [ridersWithDistance]
  );

  const showToast = useCallback(
    (msg: string) => {
      dispatch({ type: 'SHOW_TOAST', payload: msg });
      setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2500);
    },
    [dispatch]
  );

  const handleUpdateStatus = useCallback(
    async (newStatus: OrderStatus, updates: Partial<typeof order> = {}) => {
      if (!order) return;
      setIsProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
      dispatch({
        type: 'UPDATE_ORDER',
        payload: { id: order.id, updates: { status: newStatus, ...updates } },
      });
      setIsProcessing(false);
      const msgs: Record<OrderStatus, string> = {
        ACCEPTED: 'Order accepted',
        REJECTED: 'Order rejected',
        ASSIGNED: 'Rider assigned successfully',
        PENDING: '',
        DELIVERED: 'Order delivered',
      };
      showToast(msgs[newStatus] || 'Order updated');
    },
    [order, dispatch, showToast]
  );

  const handleAccept = useCallback(() => {
    handleUpdateStatus('ACCEPTED');
  }, [handleUpdateStatus]);

  const handleReject = useCallback(() => {
    handleUpdateStatus('REJECTED');
  }, [handleUpdateStatus]);

  const handleAssignRider = useCallback(
    (rider: Rider) => {
      handleUpdateStatus('ASSIGNED', { riderId: rider.id });
      setShowRiderPicker(false);
    },
    [handleUpdateStatus]
  );

  const handleTogglePicker = useCallback(() => {
    setShowRiderPicker((prev) => !prev);
  }, []);

  const getDistanceColor = (distance: number): string => {
    if (distance <= 1.5) return colors.success;
    if (distance <= NEARBY_THRESHOLD_KM) return colors.accent;
    return colors.textMuted;
  };

  const getDistanceLabel = (distance: number): string => {
    if (distance < 1) return `${(distance * 1000).toFixed(0)}m away`;
    return `${distance.toFixed(1)} km away`;
  };

  const renderRiderPickerItem: ListRenderItem<RiderWithDistance> = useCallback(
    ({ item }) => {
      const distColor = getDistanceColor(item.distance);
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleAssignRider(item)}
          style={[styles.riderPickerItem, shadows.sm]}
        >
          <GlassBackground intensity={35} />
          <View style={styles.riderPickerBorder} />
          <View style={styles.riderPickerContent}>
            <View style={styles.riderPickerAvatar}>
              <Ionicons
                name={'person-outline' as keyof typeof Ionicons.glyphMap}
                size={20}
                color={colors.primary}
              />
            </View>
            <View style={styles.riderPickerInfo}>
              <Text style={styles.riderPickerName}>{item.name}</Text>
              <View style={styles.riderPickerMeta}>
                <Ionicons
                  name={'star' as keyof typeof Ionicons.glyphMap}
                  size={12}
                  color={colors.starFilled}
                />
                <Text style={styles.riderPickerRating}>{item.rating.toFixed(1)}</Text>
                <View style={styles.metaDot} />
                <Text style={styles.riderPickerVehicle}>{item.vehicleType}</Text>
              </View>
            </View>
            <View style={styles.distanceBadge}>
              <Ionicons
                name={'navigate-outline' as keyof typeof Ionicons.glyphMap}
                size={11}
                color={distColor}
              />
              <Text style={[styles.distanceText, { color: distColor }]}>
                {getDistanceLabel(item.distance)}
              </Text>
            </View>
            <Ionicons
              name={'add-circle-outline' as keyof typeof Ionicons.glyphMap}
              size={24}
              color={colors.primary}
            />
          </View>
        </TouchableOpacity>
      );
    },
    [handleAssignRider]
  );

  const riderPickerKeyExtractor = useCallback((item: Rider) => item.id, []);

  if (!order) {
    return (
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <ScreenHeader
          title={LABELS.orderDetailsTitle}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.notFound}>
          <Ionicons
            name={'alert-circle-outline' as keyof typeof Ionicons.glyphMap}
            size={48}
            color={colors.textMuted}
          />
          <Text style={styles.notFoundText}>Order not found</Text>
        </View>
      </LinearGradient>
    );
  }

  const renderRiderPicker = () => (
    <View style={styles.riderPickerContainer}>
      {/* Filter bar */}
      <View style={styles.filterBar}>
        <Text style={styles.pickerTitle}>
          {showRiderPicker && order.status === 'ASSIGNED' ? 'Select a New Rider' : 'Select a Rider'}
        </Text>
        <View style={styles.filterChips}>
          <TouchableOpacity
            onPress={() => setDistanceFilter('all')}
            activeOpacity={0.85}
            style={[
              styles.filterChip,
              distanceFilter === 'all' && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                distanceFilter === 'all' && styles.filterChipTextActive,
              ]}
            >
              All ({ridersWithDistance.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setDistanceFilter('nearby')}
            activeOpacity={0.85}
            style={[
              styles.filterChip,
              distanceFilter === 'nearby' && styles.filterChipActive,
            ]}
          >
            <Ionicons
              name={'location-outline' as keyof typeof Ionicons.glyphMap}
              size={12}
              color={distanceFilter === 'nearby' ? colors.white : colors.success}
            />
            <Text
              style={[
                styles.filterChipText,
                distanceFilter === 'nearby' && styles.filterChipTextActive,
              ]}
            >
              Nearby ({nearbyCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={filteredRiders}
        renderItem={renderRiderPickerItem}
        keyExtractor={riderPickerKeyExtractor}
        scrollEnabled={false}
        contentContainerStyle={styles.pickerList}
        ListEmptyComponent={
          <Text style={styles.noRidersText}>
            {distanceFilter === 'nearby'
              ? `No riders within ${NEARBY_THRESHOLD_KM} km`
              : 'No active riders available'}
          </Text>
        }
      />
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
        title={LABELS.orderDetailsTitle}
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Info Card */}
        <View style={[styles.card, shadows.md]}>
          <GlassBackground intensity={42} />
          <View style={styles.cardBorder} />
          <View style={styles.cardInner}>
            <Text style={styles.sectionTitle}>Customer Info</Text>
            <View style={styles.infoRow}>
              <Ionicons
                name={'person-outline' as keyof typeof Ionicons.glyphMap}
                size={16}
                color={colors.primary}
              />
              <Text style={styles.infoText}>{order.customerName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name={'call-outline' as keyof typeof Ionicons.glyphMap}
                size={16}
                color={colors.success}
              />
              <Text style={styles.infoText}>{order.customerPhone}</Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Order Details</Text>
            <View style={styles.infoRow}>
              <Ionicons
                name={'cart-outline' as keyof typeof Ionicons.glyphMap}
                size={16}
                color={colors.accent}
              />
              <Text style={styles.infoText}>{order.itemDetails}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name={'location-outline' as keyof typeof Ionicons.glyphMap}
                size={16}
                color={colors.primary}
              />
              <Text style={styles.infoText}>{order.area}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name={'time-outline' as keyof typeof Ionicons.glyphMap}
                size={16}
                color={colors.textMuted}
              />
              <Text style={styles.infoText}>{formatTimestamp(order.createdAt)}</Text>
            </View>
            {order.totalAmount !== undefined && (
              <View style={styles.infoRow}>
                <Ionicons
                  name={'cash-outline' as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={colors.success}
                />
                <Text style={[styles.infoText, { fontWeight: fontWeight.semibold, color: colors.textPrimary }]}>
                  ৳{order.totalAmount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Status Section */}
        <View style={[styles.card, shadows.sm]}>
          <GlassBackground intensity={42} />
          <View style={styles.cardBorder} />
          <View style={styles.cardInner}>
            <View style={styles.statusRow}>
              <Text style={styles.sectionTitle}>Status</Text>
              <StatusBadge status={order.status} />
            </View>

            {/* PENDING: Accept + Reject buttons */}
            {order.status === 'PENDING' && (
              <View style={styles.actionButtonsRow}>
                <AppButton
                  label={LABELS.accept}
                  onPress={handleAccept}
                  variant="primary"
                  style={styles.actionButtonHalf}
                  disabled={isProcessing}
                />
                <AppButton
                  label={LABELS.reject}
                  onPress={handleReject}
                  variant="danger"
                  style={styles.actionButtonHalf}
                  disabled={isProcessing}
                />
              </View>
            )}

            {/* ACCEPTED: Assign Rider button + picker */}
            {order.status === 'ACCEPTED' && (
              <View style={styles.assignSection}>
                <AppButton
                  label={LABELS.assignRider}
                  onPress={handleTogglePicker}
                  variant="primary"
                  fullWidth
                  disabled={isProcessing}
                />
                {showRiderPicker && renderRiderPicker()}
              </View>
            )}

            {/* ASSIGNED: Show assigned rider + Re-assign button */}
            {order.status === 'ASSIGNED' && (
              <View style={styles.assignSection}>
                {assignedRider && (
                  <View style={[styles.assignedRiderCard, shadows.sm]}>
                    <GlassBackground intensity={30} />
                    <View style={styles.assignedRiderBorder} />
                    <View style={styles.assignedRiderContent}>
                      <View style={styles.riderPickerAvatar}>
                        <Ionicons
                          name={'person-outline' as keyof typeof Ionicons.glyphMap}
                          size={20}
                          color={colors.primary}
                        />
                      </View>
                      <View style={styles.riderPickerInfo}>
                        <Text style={styles.riderPickerName}>{assignedRider.name}</Text>
                        <Text style={styles.assignedLabel}>Assigned Rider</Text>
                      </View>
                      <View style={styles.distanceBadge}>
                        <Ionicons
                          name={'navigate-outline' as keyof typeof Ionicons.glyphMap}
                          size={11}
                          color={getDistanceColor(getMockDistance(assignedRider, order.area))}
                        />
                        <Text
                          style={[
                            styles.distanceText,
                            { color: getDistanceColor(getMockDistance(assignedRider, order.area)) },
                          ]}
                        >
                          {getDistanceLabel(getMockDistance(assignedRider, order.area))}
                        </Text>
                      </View>
                      <Ionicons
                        name={'checkmark-circle' as keyof typeof Ionicons.glyphMap}
                        size={24}
                        color={colors.success}
                      />
                    </View>
                  </View>
                )}
                <AppButton
                  label="Re-assign Rider"
                  onPress={handleTogglePicker}
                  variant="ghost"
                  fullWidth
                  disabled={isProcessing}
                />
                {showRiderPicker && renderRiderPicker()}
              </View>
            )}

            {/* DELIVERED: Success message */}
            {order.status === 'DELIVERED' && (
              <View style={[styles.terminalCard, shadows.sm]}>
                <GlassBackground intensity={30} />
                <View style={styles.terminalBorder} />
                <View style={styles.terminalContent}>
                  <Ionicons
                    name={'checkmark-circle' as keyof typeof Ionicons.glyphMap}
                    size={32}
                    color={colors.success}
                  />
                  <Text style={styles.terminalText}>This order has been delivered successfully</Text>
                </View>
              </View>
            )}

            {/* REJECTED: Terminal message */}
            {order.status === 'REJECTED' && (
              <View style={[styles.terminalCard, shadows.sm]}>
                <GlassBackground intensity={30} />
                <View style={styles.terminalBorder} />
                <View style={styles.terminalContent}>
                  <Ionicons
                    name={'close-circle' as keyof typeof Ionicons.glyphMap}
                    size={32}
                    color={colors.danger}
                  />
                  <Text style={styles.terminalText}>This order has been rejected</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <LoadingOverlay visible={isProcessing} message="Processing..." />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
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
  sectionTitle: {
    fontSize: fontSize.sectionHeader,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButtonHalf: {
    flex: 1,
  },
  assignSection: {
    gap: spacing.md,
  },
  riderPickerContainer: {
    gap: spacing.sm,
  },
  filterBar: {
    gap: spacing.sm,
  },
  pickerTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  filterChips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.white,
  },
  pickerList: {
    gap: spacing.sm,
  },
  riderPickerItem: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  riderPickerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  riderPickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  riderPickerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  riderPickerInfo: {
    flex: 1,
    gap: 2,
  },
  riderPickerName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  riderPickerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  riderPickerRating: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  riderPickerVehicle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  distanceText: {
    fontSize: 10,
    fontWeight: fontWeight.semibold,
  },
  assignedRiderCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  assignedRiderBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  assignedRiderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  assignedLabel: {
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: fontWeight.medium,
  },
  terminalCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  terminalBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.lg,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  terminalContent: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  terminalText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  noRidersText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  notFoundText: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
});

export default OrderDetailsScreen;
