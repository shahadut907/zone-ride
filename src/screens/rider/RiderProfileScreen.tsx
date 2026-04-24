import React, { useCallback, useMemo, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassBackground from '../../components/common/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../../context/AppContext';
import { RootStackParamList } from '../../types';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { LABELS } from '../../constants/labels';
import ScreenHeader from '../../components/common/ScreenHeader';
import AppButton from '../../components/common/AppButton';
import { fetchRiders } from '../../services/riderService';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AVATAR_IMG = require('../../../assets/nadim_avatar.jpg');

const DEMO_RIDER_ID = 'rider-1';

const RiderProfileScreen: React.FC = () => {
  const { state, dispatch } = useApp();
  const rootNavigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // Load riders data if not already present
  useEffect(() => {
    let mounted = true;
    const loadRiders = async () => {
      if (state.riders.length === 0) {
        const riders = await fetchRiders();
        if (mounted) {
          dispatch({ type: 'SET_RIDERS', payload: riders });
        }
      }
    };
    loadRiders();
    return () => { mounted = false; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rider = useMemo(
    () => state.riders.find((r) => r.id === DEMO_RIDER_ID),
    [state.riders]
  );

  const stats = useMemo(() => {
    const myRequests = state.requests.filter((r) => r.riderId === DEMO_RIDER_ID);
    const accepted = myRequests.filter(
      (r) => r.status !== 'POSTED' && r.status !== 'REJECTED'
    ).length;
    const completed = myRequests.filter((r) => r.status === 'COMPLETED').length;
    return { accepted, completed };
  }, [state.requests]);

  const handleToggleActive = useCallback(() => {
    dispatch({ type: 'TOGGLE_RIDER_ACTIVE', payload: DEMO_RIDER_ID });
    dispatch({
      type: 'SHOW_TOAST',
      payload: rider?.isActive
        ? 'You are now inactive'
        : 'You are now active',
    });
    setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2500);
  }, [dispatch, rider?.isActive]);

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
    rootNavigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
  }, [dispatch, rootNavigation]);

  // Build rating stars
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

  // If rider not found in state, show a default view
  const displayName = rider?.name ?? 'Demo Rider';
  const displayRating = rider?.rating ?? 4.5;
  const displayVehicle = rider?.vehicleType ?? 'Bike';
  const displayAreas = rider?.servedAreas ?? [];
  const isActive = rider?.isActive ?? false;

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <ScreenHeader title={LABELS.riderProfileTitle} />

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
              <Image source={AVATAR_IMG} style={styles.avatarImage} resizeMode="cover" />
            </View>
            <Text style={styles.profileName}>{displayName}</Text>
            <View style={styles.starsRow}>
              {renderStars(displayRating)}
              <Text style={styles.ratingText}>{displayRating.toFixed(1)}</Text>
            </View>
            <View style={styles.vehicleBadge}>
              <Ionicons
                name={
                  displayVehicle === 'Bike'
                    ? ('bicycle' as keyof typeof Ionicons.glyphMap)
                    : displayVehicle === 'Bicycle'
                      ? ('bicycle-outline' as keyof typeof Ionicons.glyphMap)
                      : ('walk-outline' as keyof typeof Ionicons.glyphMap)
                }
                size={16}
                color={colors.textSecondary}
              />
              <Text style={styles.vehicleText}>{displayVehicle}</Text>
            </View>
          </View>
        </View>

        {/* Availability Toggle */}
        <View style={[styles.card, shadows.sm]}>
          <GlassBackground intensity={40} />
          <View style={styles.cardBorder} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Ionicons
                name={
                  isActive
                    ? ('radio-button-on' as keyof typeof Ionicons.glyphMap)
                    : ('radio-button-off' as keyof typeof Ionicons.glyphMap)
                }
                size={20}
                color={isActive ? colors.success : colors.textMuted}
              />
              <View>
                <Text style={styles.toggleLabel}>{LABELS.availability}</Text>
                <Text
                  style={[
                    styles.toggleStatus,
                    { color: isActive ? colors.success : colors.textMuted },
                  ]}
                >
                  {isActive ? LABELS.active : LABELS.inactive}
                </Text>
              </View>
            </View>
            <Switch
              value={isActive}
              onValueChange={handleToggleActive}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={colors.white}
            />
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.card, shadows.sm]}>
          <GlassBackground intensity={40} />
          <View style={styles.cardBorder} />
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.accepted}</Text>
              <Text style={styles.statLabel}>Accepted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>{LABELS.statusCompleted}</Text>
            </View>
          </View>
        </View>

        {/* Served Areas */}
        {displayAreas.length > 0 && (
          <View style={[styles.card, shadows.sm]}>
            <GlassBackground intensity={40} />
            <View style={styles.cardBorder} />
            <View style={styles.areasContent}>
              <Text style={styles.sectionTitle}>{LABELS.servedAreas}</Text>
              <View style={styles.chipRow}>
                {displayAreas.map((area) => (
                  <View key={area} style={styles.chip}>
                    <Ionicons
                      name={'location-outline' as keyof typeof Ionicons.glyphMap}
                      size={12}
                      color={colors.primary}
                    />
                    <Text style={styles.chipText}>{area}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Log Out */}
        <View style={[styles.card, shadows.sm]}>
          <GlassBackground intensity={40} />
          <View style={styles.cardBorder} />
          <TouchableOpacity
            style={styles.logoutRow}
            onPress={openLogoutModal}
            activeOpacity={0.8}
          >
            <View style={styles.logoutIcon}>
              <Ionicons
                name={'log-out-outline' as keyof typeof Ionicons.glyphMap}
                size={18}
                color={colors.danger}
              />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.logoutLabel}>Log Out</Text>
              <Text style={styles.logoutSublabel}>Sign out of your account</Text>
            </View>
            <Ionicons
              name={'chevron-forward' as keyof typeof Ionicons.glyphMap}
              size={16}
              color={colors.textMuted}
            />
          </TouchableOpacity>
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
  profileHeader: {
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
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
  vehicleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.glassBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  vehicleText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
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
  statsContent: {
    flexDirection: 'row',
    padding: spacing.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statNumber: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: colors.divider,
    alignSelf: 'center',
  },
  areasContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sectionHeader,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  chipText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  logoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.danger,
  },
  logoutSublabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
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

export default RiderProfileScreen;
