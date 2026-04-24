import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryRequest } from '../../types';
import StatusBadge from '../common/StatusBadge';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { glassValues } from '../../theme/glass';
import { formatTimestamp } from '../../utils/statusHelpers';

type RequestCardProps = {
  request: DeliveryRequest;
  onPress: (request: DeliveryRequest) => void;
};

const RequestCard: React.FC<RequestCardProps> = ({ request, onPress }) => {
  const createdDate = new Date(request.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      onPress={() => onPress(request)}
      activeOpacity={0.85}
      style={[styles.wrapper, shadows.md]}
    >
      {/* Top row */}
      <View style={styles.topRow}>
          <View style={styles.iconCircle}>
            <Ionicons
              name={'cube-outline' as keyof typeof Ionicons.glyphMap}
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={styles.topText}>
            <Text style={styles.description} numberOfLines={1}>
              {request.itemDescription}
            </Text>
            <Text style={styles.timestamp}>
              {createdDate} · {formatTimestamp(request.createdAt)}
            </Text>
          </View>
          <StatusBadge status={request.status} />
        </View>

        {/* Route row */}
        <View style={styles.routeBlock}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.routeDotPickup]} />
            <Text style={styles.routeText} numberOfLines={1}>
              {request.pickupLocation}
            </Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, styles.routeDotDelivery]} />
            <Text style={styles.routeText} numberOfLines={1}>
              {request.deliveryLocation}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.feeRow}>
            <Ionicons
              name={'cash-outline' as keyof typeof Ionicons.glyphMap}
              size={13}
              color={colors.textMuted}
            />
            <Text style={styles.fee}>{request.deliveryFee} BDT</Text>
          </View>
          <View style={styles.areaRow}>
            <Ionicons
              name={'location-outline' as keyof typeof Ionicons.glyphMap}
              size={13}
              color={colors.textMuted}
            />
            <Text style={styles.area}>{request.area}</Text>
          </View>
          <Ionicons
            name={'chevron-forward' as keyof typeof Ionicons.glyphMap}
            size={16}
            color={colors.textMuted}
          />
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: borderRadius.xl,
    backgroundColor: glassValues.cardBg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
    borderTopColor: glassValues.edgeHighlight,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  topText: {
    flex: 1,
    gap: 3,
  },
  description: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  timestamp: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  routeBlock: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: 2,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeDotPickup: {
    backgroundColor: colors.primary,
  },
  routeDotDelivery: {
    backgroundColor: colors.success,
  },
  routeLine: {
    width: 1,
    height: 10,
    backgroundColor: colors.divider,
    marginLeft: spacing.xs - 1,
  },
  routeText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  feeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fee: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  areaRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  area: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});

export default RequestCard;
