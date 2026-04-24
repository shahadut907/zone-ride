import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Shop } from '../../types';
import StatusBadge from '../common/StatusBadge';
import AppButton from '../common/AppButton';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { glassValues } from '../../theme/glass';

type ShopCardProps = {
  shop: Shop;
  onCall: (shop: Shop) => void;
  onChat: (shop: Shop) => void;
  onViewMenu: (shop: Shop) => void;
};

const ShopCard: React.FC<ShopCardProps> = ({
  shop,
  onCall,
  onChat,
  onViewMenu,
}) => {
  const handleCall = useCallback(() => onCall(shop), [shop, onCall]);
  const handleChat = useCallback(() => onChat(shop), [shop, onChat]);
  const handleMenu = useCallback(() => onViewMenu(shop), [shop, onViewMenu]);

  const renderStars = () => {
    const stars: React.ReactNode[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={
            i <= Math.floor(shop.rating)
              ? ('star' as keyof typeof Ionicons.glyphMap)
              : i - shop.rating < 1
                ? ('star-half' as keyof typeof Ionicons.glyphMap)
                : ('star-outline' as keyof typeof Ionicons.glyphMap)
          }
          size={14}
          color={i <= shop.rating ? colors.starFilled : colors.starEmpty}
        />
      );
    }
    return stars;
  };

  return (
    <View style={[styles.wrapper, shadows.md]}>
      {/* Single glass surface */}
      {Platform.OS === 'ios' && (
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />
      )}
      <View style={[StyleSheet.absoluteFill, styles.glassTint]} />

      {/* Header: icon + info + status */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Ionicons
            name={'storefront-outline' as keyof typeof Ionicons.glyphMap}
            size={24}
            color={colors.accent}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{shop.name}</Text>
          <View style={styles.starsRow}>
            {renderStars()}
            <Text style={styles.ratingText}>{shop.rating.toFixed(1)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons
              name={'location-outline' as keyof typeof Ionicons.glyphMap}
              size={12}
              color={colors.textMuted}
            />
            <Text style={styles.metaText}>{shop.area}</Text>
            <View style={styles.metaDot} />
            <Ionicons
              name={'time-outline' as keyof typeof Ionicons.glyphMap}
              size={12}
              color={colors.textMuted}
            />
            <Text style={styles.metaText}>{shop.workingHours}</Text>
          </View>
        </View>
        <StatusBadge status={shop.isOpen ? 'open' : 'closed'} />
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

        {/* View Menu */}
        <View style={styles.actionItem}>
          <TouchableOpacity
            onPress={handleMenu}
            activeOpacity={0.85}
            style={[styles.actionCircle, shadows.neumorphic]}
          >
            <Ionicons
              name={'images-outline' as keyof typeof Ionicons.glyphMap}
              size={22}
              color={colors.neumorphicIcon}
            />
          </TouchableOpacity>
          <Text style={styles.actionLabel}>Menu</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: 'transparent',
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
    borderTopColor: glassValues.edgeHighlight,
    overflow: 'hidden',
  },
  glassTint: {
    backgroundColor: glassValues.cardBg,
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
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
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
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
  },
  actionLabel: {
    fontSize: fontSize.xs,
    color: colors.neumorphicIcon,
    fontWeight: fontWeight.medium,
  },
});

export default ShopCard;
