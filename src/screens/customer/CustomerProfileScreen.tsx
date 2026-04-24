import React, { useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Animated,
  Platform,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassBackground from '../../components/common/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { LABELS } from '../../constants/labels';
import { BlurView } from 'expo-blur';

type RootNavProp = StackNavigationProp<RootStackParamList>;

type ProfileRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  iconColor?: string;
  onEditPress?: () => void;
};

const ProfileRow: React.FC<ProfileRowProps> = ({
  icon,
  label,
  value,
  iconColor,
  onEditPress,
}) => (
  <View style={styles.profileRow}>
    <View style={[styles.rowIcon, { backgroundColor: `${iconColor ?? colors.primary}15` }]}>
      <Ionicons name={icon} size={18} color={iconColor ?? colors.primary} />
    </View>
    <View style={styles.rowText}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
    {onEditPress ? (
      <TouchableOpacity
        onPress={onEditPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Ionicons
          name={'create-outline' as keyof typeof Ionicons.glyphMap}
          size={18}
          color={colors.textMuted}
        />
      </TouchableOpacity>
    ) : null}
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

const CustomerProfileScreen: React.FC = () => {
  const { state, dispatch } = useApp();
  const rootNav = useNavigation<RootNavProp>();

  const session = state.customerSession;
  const area = state.selectedArea ?? '';

  // --- Address editing state ---
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState(session?.defaultAddress ?? '');

  const myRequests = state.requests.filter(
    (r) => r.customerId === (session?.id ?? 'cust_001')
  );
  const completedCount = myRequests.filter(
    (r) => r.status === 'COMPLETED'
  ).length;
  const activeCount = myRequests.filter(
    (r) => !['COMPLETED', 'REJECTED'].includes(r.status)
  ).length;

  const handleOpenAddressEdit = useCallback(() => {
    setAddressDraft(session?.defaultAddress ?? '');
    setIsEditingAddress(true);
  }, [session?.defaultAddress]);

  const handleCancelAddressEdit = useCallback(() => {
    setIsEditingAddress(false);
    setAddressDraft(session?.defaultAddress ?? '');
    Keyboard.dismiss();
  }, [session?.defaultAddress]);

  const handleSaveAddress = useCallback(() => {
    const trimmed = addressDraft.trim();
    if (trimmed.length === 0) return;
    dispatch({ type: 'UPDATE_DEFAULT_ADDRESS', payload: trimmed });
    dispatch({ type: 'SHOW_TOAST', payload: LABELS.addressSaved });
    setIsEditingAddress(false);
    Keyboard.dismiss();
  }, [addressDraft, dispatch]);

  const handleChangeArea = useCallback(() => {
    rootNav.navigate('AreaSelection');
  }, [rootNav]);

  const handleSwitchRole = useCallback(() => {
    dispatch({ type: 'CLEAR_CUSTOMER_SESSION' });
    dispatch({ type: 'CLEAR_ROLE' });
    rootNav.reset({
      index: 0,
      routes: [{ name: 'RoleSelection' }],
    });
  }, [dispatch, rootNav]);

  // --- Logout modal state ---
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
      Animated.timing(modalOverlayOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(modalScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }),
      Animated.timing(modalCardOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [modalOverlayOpacity, modalScale, modalCardOpacity]);

  const closeLogoutModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(modalOverlayOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(modalScale, {
        toValue: 0.85,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(modalCardOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => setShowLogoutModal(false));
  }, [modalOverlayOpacity, modalScale, modalCardOpacity]);

  const handleConfirmLogout = useCallback(() => {
    setShowLogoutModal(false);
    dispatch({ type: 'CLEAR_CUSTOMER_SESSION' });
    dispatch({ type: 'CLEAR_ROLE' });
    rootNav.reset({
      index: 0,
      routes: [{ name: 'Splash' }],
    });
  }, [dispatch, rootNav]);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScreenHeader title={LABELS.customerProfileTitle} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar block */}
        <View style={styles.avatarBlock}>
          <View style={[styles.avatarCircle, shadows.md]}>
            <Image
              source={require('../../../assets/customer-avatar.png')}
              style={styles.avatarImage}
            />
          </View>
          <Text style={styles.profileName}>{session?.name ?? 'Customer'}</Text>
          <View style={styles.areaChip}>
            <Ionicons
              name={'location' as keyof typeof Ionicons.glyphMap}
              size={13}
              color={colors.primary}
            />
            <Text style={styles.areaChipText}>{area}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={[styles.statsCard, shadows.sm]}>
          <GlassBackground intensity={42} />
          <View style={styles.statsBorder} />
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{myRequests.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>
                {completedCount}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.accent }]}>
                {activeCount}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
          </View>
        </View>

        {/* Info card */}
        <View style={[styles.card, shadows.sm]}>
          <GlassBackground intensity={42} />
          <View style={styles.cardBorder} />
          <View style={styles.cardInner}>
            <Text style={styles.sectionTitle}>Account Info</Text>
            <ProfileRow
              icon="person-outline"
              label={LABELS.name}
              value={session?.name ?? '-'}
            />
            <View style={styles.rowDivider} />
            <ProfileRow
              icon="call-outline"
              label={LABELS.phone}
              value={session?.phone ?? '-'}
              iconColor={colors.success}
            />
            <View style={styles.rowDivider} />
            <ProfileRow
              icon="home-outline"
              label={LABELS.defaultAddress}
              value={session?.defaultAddress ?? '-'}
              iconColor={colors.accent}
              onEditPress={handleOpenAddressEdit}
            />
          </View>
        </View>

        {/* Default Address Editor */}
        {isEditingAddress ? (
          <View style={[styles.addressEditorCard, shadows.md]}>
            <GlassBackground intensity={50} />
            <View style={styles.cardBorder} />
            <View style={styles.addressEditorInner}>
              <View style={styles.addressEditorHeader}>
                <View style={[styles.rowIcon, { backgroundColor: `${colors.accent}15` }]}>
                  <Ionicons
                    name={'home' as keyof typeof Ionicons.glyphMap}
                    size={18}
                    color={colors.accent}
                  />
                </View>
                <Text style={styles.addressEditorTitle}>{LABELS.editAddress}</Text>
              </View>

              <View style={styles.addressInputWrapper}>
                <TextInput
                  style={styles.addressInput}
                  value={addressDraft}
                  onChangeText={setAddressDraft}
                  placeholder={LABELS.addressPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={2}
                  autoFocus
                  selectionColor={colors.primary}
                />
              </View>

              <View style={styles.addressButtonRow}>
                <TouchableOpacity
                  style={styles.addressCancelBtn}
                  onPress={handleCancelAddressEdit}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={'close' as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color={colors.textMuted}
                  />
                  <Text style={styles.addressCancelText}>{LABELS.cancel}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.addressSaveBtn,
                    addressDraft.trim().length === 0 && styles.addressSaveBtnDisabled,
                  ]}
                  onPress={handleSaveAddress}
                  activeOpacity={0.8}
                  disabled={addressDraft.trim().length === 0}
                >
                  <Ionicons
                    name={'checkmark' as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.addressSaveText}>{LABELS.save}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : null}

        {/* Actions card */}
        <View style={[styles.card, shadows.sm]}>
          <GlassBackground intensity={42} />
          <View style={styles.cardBorder} />
          <View style={styles.cardInner}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <ActionRow
              icon="location-outline"
              label="Change Area"
              sublabel={area}
              onPress={handleChangeArea}
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

      {/* Premium Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeLogoutModal}
      >
        <View style={styles.modalRoot}>
          {/* Dark overlay (tappable to dismiss) */}
          <Animated.View style={[styles.modalOverlayBg, { opacity: modalOverlayOpacity }]}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={closeLogoutModal}
            />
          </Animated.View>

          {/* Floating card */}
          <Animated.View
            style={[
              styles.modalCard,
              shadows.lg,
              {
                opacity: modalCardOpacity,
                transform: [{ scale: modalScale }],
              },
            ]}
          >
            <GlassBackground
              intensity={85}
              fallbackColor="rgba(255, 255, 255, 0.97)"
            />
            <View style={styles.modalInner}>
              {/* Icon */}
              <View style={styles.modalIconCircle}>
                <Ionicons
                  name={'log-out-outline' as keyof typeof Ionicons.glyphMap}
                  size={28}
                  color={colors.danger}
                />
              </View>

              {/* Title */}
              <Text style={styles.modalTitle}>Log Out</Text>

              {/* Subtitle */}
              <Text style={styles.modalMessage}>
                Are you sure you want to log out?
              </Text>

              {/* Buttons */}
              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={closeLogoutModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalLogoutBtn}
                  onPress={handleConfirmLogout}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={'log-out-outline' as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color="#fff"
                  />
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
  container: {
    flex: 1,
  },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.md,
  },
  avatarBlock: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.sm,
    borderWidth: 2.5,
    borderColor: colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  profileName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
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
  statsCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  statsBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  statsRow: {
    flexDirection: 'row',
    padding: spacing.lg,
  },
  statItem: {
    flex: 1,
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
  statDivider: {
    width: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
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
    marginBottom: spacing.xs,
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
  // --- Address editor styles ---
  addressEditorCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: `${colors.accent}30`,
  },
  addressEditorInner: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  addressEditorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  addressEditorTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  addressInputWrapper: {
    borderRadius: borderRadius.lg,
    backgroundColor: Platform.OS === 'ios'
      ? 'rgba(255,255,255,0.08)'
      : 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: `${colors.accent}25`,
    overflow: 'hidden',
  },
  addressInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
    minHeight: 54,
    textAlignVertical: 'top',
  },
  addressButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  addressCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  addressCancelText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  addressSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  addressSaveBtnDisabled: {
    opacity: 0.45,
  },
  addressSaveText: {
    fontSize: fontSize.sm,
    color: '#fff',
    fontWeight: fontWeight.semibold,
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
    backgroundColor: Platform.OS === 'ios'
      ? 'transparent'
      : 'rgba(255, 255, 255, 0.97)',
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
    paddingHorizontal: spacing.xs,
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

export default CustomerProfileScreen;
