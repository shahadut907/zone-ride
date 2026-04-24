import React, { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  Animated,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassBackground from '../../components/common/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, ShopStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import { fetchShops } from '../../services/shopService';
import { getAreaPricing } from '../../utils/areaPricing';
import ScreenHeader from '../../components/common/ScreenHeader';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { LABELS } from '../../constants/labels';

const DEMO_SHOP_ID = 'shop-1';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SHOP_AVATAR = require('../../../assets/shop_avatar.jpg');

// Hardcoded demo shop data as fallback
const DEMO_SHOP_FALLBACK = {
  name: 'Dhaka Bites',
  rating: 4.6,
  area: 'Uttara Sector 7',
  workingHours: '9:00 AM - 10:00 PM',
  phone: '+8801811111111',
  isOpen: true,
};

type ProfileRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  iconColor?: string;
};

const ProfileRow: React.FC<ProfileRowProps> = ({
  icon,
  label,
  value,
  iconColor,
}) => (
  <View style={styles.profileRow}>
    <View style={[styles.rowIcon, { backgroundColor: `${iconColor ?? colors.primary}15` }]}>
      <Ionicons name={icon} size={18} color={iconColor ?? colors.primary} />
    </View>
    <View style={styles.rowText}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  </View>
);

type ActionRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel?: string;
  onPress: () => void;
  iconColor?: string;
  destructive?: boolean;
};

const ActionRow: React.FC<ActionRowProps> = ({
  icon,
  label,
  sublabel,
  onPress,
  iconColor,
  destructive,
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.actionRow}>
    <View
      style={[
        styles.rowIcon,
        {
          backgroundColor: destructive
            ? 'rgba(255, 69, 58, 0.12)'
            : `${iconColor ?? colors.primary}15`,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={18}
        color={destructive ? colors.danger : (iconColor ?? colors.primary)}
      />
    </View>
    <View style={styles.rowText}>
      <Text style={[styles.rowValue, destructive && styles.destructiveText]}>{label}</Text>
      {sublabel ? <Text style={styles.rowLabel}>{sublabel}</Text> : null}
    </View>
    <Ionicons
      name={'chevron-forward' as keyof typeof Ionicons.glyphMap}
      size={16}
      color={colors.textMuted}
    />
  </TouchableOpacity>
);

const ShopProfileScreen: React.FC = () => {
  const { state, dispatch } = useApp();
  const rootNav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const navigation = useNavigation<StackNavigationProp<ShopStackParamList>>();

  // Load shops data into state if not already loaded
  useEffect(() => {
    let mounted = true;
    const loadShops = async () => {
      if (state.shops.length === 0) {
        const shops = await fetchShops();
        if (mounted) {
          dispatch({ type: 'SET_SHOPS', payload: shops });
        }
      }
    };
    loadShops();
    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shop = useMemo(
    () => state.shops.find((s) => s.id === DEMO_SHOP_ID),
    [state.shops]
  );

  const stats = useMemo(() => {
    const shopOrders = state.orders.filter((o) => o.shopId === DEMO_SHOP_ID);
    const total = shopOrders.length;
    const accepted = shopOrders.filter(
      (o) => o.status === 'ACCEPTED' || o.status === 'ASSIGNED'
    ).length;
    const pending = shopOrders.filter((o) => o.status === 'PENDING').length;
    const completed = shopOrders.filter((o) => o.status === 'DELIVERED').length;
    const totalRevenue = shopOrders
      .filter((o) => o.status === 'DELIVERED')
      .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
    return { total, accepted, pending, completed, totalRevenue };
  }, [state.orders]);

  const areaPricing = useMemo(() => {
    const area = shop?.area ?? '';
    return getAreaPricing(area);
  }, [shop?.area]);

  const showToast = useCallback(
    (msg: string) => {
      dispatch({ type: 'SHOW_TOAST', payload: msg });
      setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2500);
    },
    [dispatch]
  );

  const handleToggleOpen = useCallback(() => {
    dispatch({ type: 'TOGGLE_SHOP_OPEN', payload: DEMO_SHOP_ID });
    const isCurrentlyOpen = shop?.isOpen ?? false;
    showToast(`Shop is now ${isCurrentlyOpen ? 'Closed' : 'Open'}`);
  }, [dispatch, shop?.isOpen, showToast]);

  const handleManageMenu = useCallback(() => {
    // Navigate to Menu tab
    // @ts-ignore — cross-tab navigation
    navigation.navigate('Menu', {
      screen: 'ShopMenu',
    });
  }, [navigation]);

  const handleCallShop = useCallback(() => {
    const phone = shop?.phone;
    if (phone) {
      Linking.openURL(`tel:${phone}`).catch(() => {
        showToast('Unable to make a call');
      });
    }
  }, [shop?.phone, showToast]);

  const handleShareShop = useCallback(() => {
    showToast('Share link copied to clipboard!');
  }, [showToast]);

  // --- Logout modal ---
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const modalOverlayOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.85)).current;
  const modalCardOpacity = useRef(new Animated.Value(0)).current;

  const openLogoutModal = useCallback(() => {
    setShowLogoutModal(true);
    modalOverlayOpacity.setValue(0);
    modalScale.setValue(0.85);
    modalCardOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(modalOverlayOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(modalScale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 10 }),
      Animated.timing(modalCardOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [modalOverlayOpacity, modalScale, modalCardOpacity]);

  const closeLogoutModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(modalOverlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(modalScale, { toValue: 0.85, duration: 180, useNativeDriver: true }),
      Animated.timing(modalCardOpacity, { toValue: 0, duration: 160, useNativeDriver: true }),
    ]).start(() => setShowLogoutModal(false));
  }, [modalOverlayOpacity, modalScale, modalCardOpacity]);

  const handleConfirmLogout = useCallback(() => {
    setShowLogoutModal(false);
    dispatch({ type: 'CLEAR_ROLE' });
    rootNav.reset({ index: 0, routes: [{ name: 'Splash' }] });
  }, [dispatch, rootNav]);

  const renderStars = useCallback((rating: number) => {
    const stars: React.ReactNode[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={
            i <= Math.floor(rating)
              ? ('star' as keyof typeof Ionicons.glyphMap)
              : i - rating < 1
                ? ('star-half' as keyof typeof Ionicons.glyphMap)
                : ('star-outline' as keyof typeof Ionicons.glyphMap)
          }
          size={20}
          color={i <= rating ? colors.starFilled : colors.starEmpty}
        />
      );
    }
    return stars;
  }, []);

  const displayName = shop?.name ?? DEMO_SHOP_FALLBACK.name;
  const displayRating = shop?.rating ?? DEMO_SHOP_FALLBACK.rating;
  const displayArea = shop?.area ?? DEMO_SHOP_FALLBACK.area;
  const displayHours = shop?.workingHours ?? DEMO_SHOP_FALLBACK.workingHours;
  const displayPhone = shop?.phone ?? DEMO_SHOP_FALLBACK.phone;
  const isOpen = shop?.isOpen ?? DEMO_SHOP_FALLBACK.isOpen;

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <ScreenHeader title={LABELS.shopProfileTitle} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & Name */}
        <View style={[styles.card, shadows.md]}>
          <GlassBackground intensity={40} />
          <View style={styles.cardBorder} />
          <View style={styles.profileHeader}>
            <View style={styles.avatarCircle}>
              <Image
                source={SHOP_AVATAR}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.profileName}>{displayName}</Text>
            <View style={styles.starsRow}>
              {renderStars(displayRating)}
              <Text style={styles.ratingText}>{displayRating.toFixed(1)}</Text>
            </View>
            {displayArea ? (
              <View style={styles.areaChip}>
                <Ionicons
                  name={'location' as keyof typeof Ionicons.glyphMap}
                  size={13}
                  color={colors.primary}
                />
                <Text style={styles.areaChipText}>{displayArea}</Text>
              </View>
            ) : null}
            {/* Quick action buttons */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                onPress={handleCallShop}
                activeOpacity={0.85}
                style={styles.quickActionBtn}
              >
                <Ionicons
                  name={'call-outline' as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={colors.success}
                />
                <Text style={[styles.quickActionText, { color: colors.success }]}>Call</Text>
              </TouchableOpacity>
              <View style={styles.quickActionDivider} />
              <TouchableOpacity
                onPress={handleShareShop}
                activeOpacity={0.85}
                style={styles.quickActionBtn}
              >
                <Ionicons
                  name={'share-outline' as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={colors.primary}
                />
                <Text style={[styles.quickActionText, { color: colors.primary }]}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Open/Closed Toggle */}
        <View style={[styles.card, shadows.sm]}>
          <GlassBackground intensity={40} />
          <View style={styles.cardBorder} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={[styles.statusDot, { backgroundColor: isOpen ? colors.success : colors.danger }]} />
              <View>
                <Text style={styles.toggleLabel}>Shop Status</Text>
                <Text
                  style={[
                    styles.toggleStatus,
                    { color: isOpen ? colors.success : colors.danger },
                  ]}
                >
                  {isOpen ? LABELS.openStatus : LABELS.closedStatus}
                </Text>
              </View>
            </View>
            <Switch
              value={isOpen}
              onValueChange={handleToggleOpen}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Stats Card */}
        <View style={[styles.card, shadows.sm]}>
          <GlassBackground intensity={42} />
          <View style={styles.cardBorder} />
          <View style={styles.cardInner}>
            <Text style={styles.sectionTitle}>Order Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total Orders</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: colors.accent }]}>{stats.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: colors.success }]}>{stats.accepted}</Text>
                <Text style={styles.statLabel}>Active</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Shop Info Card */}
        <View style={[styles.card, shadows.sm]}>
          <GlassBackground intensity={42} />
          <View style={styles.cardBorder} />
          <View style={styles.cardInner}>
            <Text style={styles.sectionTitle}>Shop Information</Text>
            <ProfileRow
              icon="time-outline"
              label={LABELS.workingHours}
              value={displayHours || 'Not set'}
            />
            <View style={styles.rowDivider} />
            <ProfileRow
              icon="call-outline"
              label={LABELS.phone}
              value={displayPhone || 'Not set'}
              iconColor={colors.success}
            />
            <View style={styles.rowDivider} />
            <ProfileRow
              icon="location-outline"
              label="Service Area"
              value={displayArea || 'Not set'}
              iconColor={colors.accent}
            />
            <View style={styles.rowDivider} />
            <ProfileRow
              icon="pricetag-outline"
              label="Platform Commission"
              value={`${areaPricing.commissionPercent}%`}
              iconColor={colors.info}
            />
            <View style={styles.rowDivider} />
            <ProfileRow
              icon="car-outline"
              label="Delivery Charge"
              value={`৳${areaPricing.fixedDeliveryCharge}`}
              iconColor={colors.primary}
            />
          </View>
        </View>

        {/* Revenue Card */}
        <View style={[styles.card, shadows.sm]}>
          <GlassBackground intensity={42} />
          <View style={styles.cardBorder} />
          <View style={styles.cardInner}>
            <Text style={styles.sectionTitle}>Revenue</Text>
            <View style={styles.revenueRow}>
              <View style={styles.revenueIconWrap}>
                <Ionicons
                  name={'wallet-outline' as keyof typeof Ionicons.glyphMap}
                  size={22}
                  color={colors.success}
                />
              </View>
              <View style={styles.revenueInfo}>
                <Text style={styles.revenueAmount}>৳{stats.totalRevenue.toFixed(0)}</Text>
                <Text style={styles.revenueLabel}>Total Earnings</Text>
              </View>
            </View>
            <View style={styles.revenueBreakdown}>
              <View style={styles.revenueBreakdownItem}>
                <Text style={styles.breakdownLabel}>Completed Orders</Text>
                <Text style={styles.breakdownValue}>{stats.completed}</Text>
              </View>
              <View style={styles.revenueBreakdownItem}>
                <Text style={styles.breakdownLabel}>Avg. per Order</Text>
                <Text style={styles.breakdownValue}>
                  ৳{stats.completed > 0 ? (stats.totalRevenue / stats.completed).toFixed(0) : '0'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions Card */}
        <View style={[styles.card, shadows.sm]}>
          <GlassBackground intensity={42} />
          <View style={styles.cardBorder} />
          <View style={styles.cardInner}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <ActionRow
              icon="images-outline"
              label="Manage Menu"
              sublabel="View and manage menu items"
              onPress={handleManageMenu}
            />
            <View style={styles.rowDivider} />
            <ActionRow
              icon="notifications-outline"
              label="Notifications"
              sublabel="View shop notifications"
              onPress={() => rootNav.navigate('Notifications')}
              iconColor={colors.info}
            />
            <View style={styles.rowDivider} />
            <ActionRow
              icon="settings-outline"
              label="Shop Settings"
              sublabel="Update hours, phone & details"
              onPress={() => showToast('Settings coming soon')}
              iconColor={colors.textSecondary}
            />
            <View style={styles.rowDivider} />
            <ActionRow
              icon="help-circle-outline"
              label="Help & Support"
              sublabel="Contact ZoneRide support"
              onPress={() => showToast('Support: help@zoneride.com')}
              iconColor={colors.success}
            />
            <View style={styles.rowDivider} />
            <ActionRow
              icon="log-out-outline"
              label="Log Out"
              sublabel="Sign out of your account"
              onPress={openLogoutModal}
              destructive
            />
          </View>
        </View>
      </ScrollView>

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeLogoutModal}
      >
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.modalOverlayBg, { opacity: modalOverlayOpacity }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeLogoutModal} />
          </Animated.View>
          <Animated.View
            style={[
              styles.modalCard,
              shadows.lg,
              { opacity: modalCardOpacity, transform: [{ scale: modalScale }] },
            ]}
          >
            <GlassBackground intensity={85} fallbackColor="rgba(255, 255, 255, 0.97)" />
            <View style={styles.modalInner}>
              <View style={styles.modalIconCircle}>
                <Ionicons name={'log-out-outline' as keyof typeof Ionicons.glyphMap} size={28} color={colors.danger} />
              </View>
              <Text style={styles.modalTitle}>Log Out</Text>
              <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={closeLogoutModal} activeOpacity={0.8}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalLogoutBtn} onPress={handleConfirmLogout} activeOpacity={0.8}>
                  <Ionicons name={'log-out-outline' as keyof typeof Ionicons.glyphMap} size={16} color="#fff" />
                  <Text style={styles.modalLogoutText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
    paddingBottom: 120,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
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
    marginBottom: spacing.xs,
  },
  profileHeader: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  profileName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
    marginLeft: spacing.xs,
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
  },
  areaChipText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xl,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  quickActionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  quickActionDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.divider,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  toggleLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  toggleStatus: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  revenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  revenueIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  revenueInfo: {
    flex: 1,
    gap: 2,
  },
  revenueAmount: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  revenueLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  revenueBreakdown: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  revenueBreakdownItem: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  breakdownLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  breakdownValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  rowValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  destructiveText: {
    color: colors.danger,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 52,
  },
  // --- Logout modal styles ---
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  modalOverlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(255, 255, 255, 0.97)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    elevation: 24,
  },
  modalInner: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  modalMessage: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  modalCancelText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  modalLogoutBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.danger,
    elevation: 4,
  },
  modalLogoutText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
});

export default ShopProfileScreen;
