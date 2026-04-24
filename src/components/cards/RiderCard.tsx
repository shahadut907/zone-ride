import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Rider, SubscriptionState } from '../../types';
import StatusBadge from '../common/StatusBadge';
import AppButton from '../common/AppButton';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { glassValues } from '../../theme/glass';

type RiderCardProps = {
  rider: Rider;
  onCall: (rider: Rider) => void;
  onChat: (rider: Rider) => void;
  onSubscriptionChange: (rider: Rider, state: SubscriptionState) => void;
  onRequestDelivery: (rider: Rider) => void;
};

const SUBSCRIPTION_ACTIONS: Record<SubscriptionState, { label: string; next: SubscriptionState }> = {
  unsubscribed: { label: 'Subscribe', next: 'subscribed' },
  subscribed: { label: 'Unsubscribe', next: 'unsubscribed' },
  blocked: { label: 'Unblock', next: 'unsubscribed' },
};

const RiderCard: React.FC<RiderCardProps> = ({
  rider,
  onCall,
  onChat,
  onSubscriptionChange,
  onRequestDelivery,
}) => {
  const handleCall = useCallback(() => onCall(rider), [rider, onCall]);
  const handleChat = useCallback(() => onChat(rider), [rider, onChat]);
  const handleSubscription = useCallback(() => {
    const action = SUBSCRIPTION_ACTIONS[rider.subscriptionState];
    onSubscriptionChange(rider, action.next);
  }, [rider, onSubscriptionChange]);
  const handleRequest = useCallback(() => onRequestDelivery(rider), [rider, onRequestDelivery]);

  const subAction = SUBSCRIPTION_ACTIONS[rider.subscriptionState];

  const renderStars = () => {
    const stars: React.ReactNode[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={
            i <= Math.floor(rider.rating)
              ? ('star' as keyof typeof Ionicons.glyphMap)
              : i - rider.rating < 1
                ? ('star-half' as keyof typeof Ionicons.glyphMap)
                : ('star-outline' as keyof typeof Ionicons.glyphMap)
          }
          size={14}
          color={i <= rider.rating ? colors.starFilled : colors.starEmpty}
        />
      );
    }
    return stars;
  };

  return (
    <View style={[styles.wrapper, shadows.md]}>
      {/* Header: avatar + info + status */}
      <View style={styles.header}>
          <View style={styles.avatarCircle}>
            <Ionicons
              name={'person-outline' as keyof typeof Ionicons.glyphMap}
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{rider.name}</Text>
            <View style={styles.starsRow}>
              {renderStars()}
              <Text style={styles.ratingText}>{rider.rating.toFixed(1)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons
                name={'bicycle-outline' as keyof typeof Ionicons.glyphMap}
                size={12}
                color={colors.textMuted}
              />
              <Text style={styles.metaText}>{rider.vehicleType}</Text>
              <View style={styles.metaDot} />
              <Ionicons
                name={'location-outline' as keyof typeof Ionicons.glyphMap}
                size={12}
                color={colors.textMuted}
              />
              <Text style={styles.metaText}>{rider.servedAreas.join(', ')}</Text>
            </View>
          </View>
          <StatusBadge status={rider.isActive ? 'active' : 'inactive'} />
        </View>

        {/* Action buttons row */}
        <View style={styles.actionsRow}>
          {/* Call */}
          <View style={styles.actionItem}>
            <TouchableOpacity
              onPress={handleCall}
              activeOpacity={0.85}
              style={[styles.actionCircle, shadows.neumorphic]}
            >
              <Ionicons
                name={'call-outline' as keyof typeof Ionicons.glyphMap}
                size={22}
                color={colors.neumorphicIcon}
              />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Call</Text>
          </View>

          {/* Chat */}
          <View style={styles.actionItem}>
            <TouchableOpacity
              onPress={handleChat}
              activeOpacity={0.85}
              style={[styles.actionCircle, shadows.neumorphic]}
            >
              <Ionicons
                name={'chatbubble-outline' as keyof typeof Ionicons.glyphMap}
                size={22}
                color={colors.neumorphicIcon}
              />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>Chat</Text>
          </View>

          {/* Subscribe/Unsubscribe */}
          <View style={styles.actionItem}>
            <TouchableOpacity
              onPress={handleSubscription}
              activeOpacity={0.85}
              style={[
                styles.actionCircle,
                shadows.neumorphic,
                rider.subscriptionState === 'subscribed' && styles.actionCircleActive,
              ]}
            >
              <Ionicons
                name={
                  rider.subscriptionState === 'subscribed'
                    ? ('heart' as keyof typeof Ionicons.glyphMap)
                    : ('heart-outline' as keyof typeof Ionicons.glyphMap)
                }
                size={22}
                color={
                  rider.subscriptionState === 'subscribed'
                    ? colors.primary
                    : colors.neumorphicIcon
                }
              />
            </TouchableOpacity>
            <Text style={styles.actionLabel}>{subAction.label}</Text>
          </View>
        </View>

        {/* Request button */}
        <View style={styles.requestRow}>
          <AppButton
            label="Request Delivery"
            onPress={handleRequest}
            variant="primary"
            fullWidth
          />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: glassValues.cardBg,
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
    borderTopColor: glassValues.edgeHighlight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    gap: spacing.md,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.xxxl,
  },
  actionItem: {
    alignItems: 'center',
    gap: 6,
  },
  actionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: glassValues.neumorphicBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  actionCircleActive: {
    backgroundColor: colors.primaryLight,
  },
  actionLabel: {
    fontSize: fontSize.xs,
    color: colors.neumorphicIcon,
    fontWeight: fontWeight.medium,
  },
  requestRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
});

export default RiderCard;
