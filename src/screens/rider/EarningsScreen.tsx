import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { DeliveryRequest } from '../../types';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';

import { glassValues } from '../../theme/glass';
import { LABELS } from '../../constants/labels';
import { formatTimestamp } from '../../utils/statusHelpers';
import ScreenHeader from '../../components/common/ScreenHeader';
import EmptyState from '../../components/common/EmptyState';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const LOGO_BKASH = require('../../../assets/bkash_logo.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LOGO_NAGAD = require('../../../assets/nagad_logo.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const LOGO_UPAY = require('../../../assets/upay_logo.png');

const DEMO_RIDER_ID = 'rider-1';

const EarningsScreen: React.FC = () => {
  const { state } = useApp();

  const completedRequests = useMemo(
    () =>
      state.requests.filter(
        (r) =>
          r.riderId === DEMO_RIDER_ID &&
          (r.status === 'COMPLETED' || r.status === 'DELIVERED')
      ),
    [state.requests]
  );

  const totalEarnings = useMemo(
    () => completedRequests.reduce((sum, r) => sum + r.deliveryFee, 0),
    [completedRequests]
  );

  // --- Withdraw Modal ---
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'bank' | 'mobile' | null>(null);
  const [mobileProvider, setMobileProvider] = useState<'bkash' | 'nagad' | 'upay' | null>(null);
  const [withdrawPhone, setWithdrawPhone] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const slideAnim = useRef(new Animated.Value(400)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const statusScaleAnim = useRef(new Animated.Value(0.5)).current;
  const statusOpacityAnim = useRef(new Animated.Value(0)).current;

  const openWithdrawModal = useCallback(() => {
    setShowWithdraw(true);
    setSelectedMethod(null);
    setMobileProvider(null);
    setWithdrawPhone('');
    setBankName('');
    setBankAccount('');
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
    ]).start();
  }, [overlayOpacity, slideAnim]);

  const closeWithdrawModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }),
    ]).start(() => setShowWithdraw(false));
  }, [overlayOpacity, slideAnim]);

  const isValidToWithdraw = useMemo(() => {
    if (!selectedMethod) return false;
    if (selectedMethod === 'mobile') {
      return mobileProvider !== null && withdrawPhone.trim().length >= 11;
    }
    if (selectedMethod === 'bank') {
      return bankName.trim().length >= 3 && bankAccount.trim().length >= 8;
    }
    return false;
  }, [selectedMethod, mobileProvider, withdrawPhone, bankName, bankAccount]);

  // Animate the status overlay in
  const showStatusOverlay = useCallback(() => {
    statusScaleAnim.setValue(0.5);
    statusOpacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(statusScaleAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(statusOpacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [statusScaleAnim, statusOpacityAnim]);

  // Animate the status overlay out
  const hideStatusOverlay = useCallback(() => {
    Animated.parallel([
      Animated.timing(statusScaleAnim, { toValue: 0.8, duration: 200, useNativeDriver: true }),
      Animated.timing(statusOpacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => setWithdrawStatus('idle'));
  }, [statusScaleAnim, statusOpacityAnim]);

  const handleWithdrawConfirm = useCallback(() => {
    if (!isValidToWithdraw) return;
    closeWithdrawModal();
    // Show processing overlay after modal closes
    setTimeout(() => {
      setWithdrawStatus('processing');
      showStatusOverlay();
      // Simulate processing delay, then show success
      setTimeout(() => {
        setWithdrawStatus('success');
        showStatusOverlay();
        // Auto-dismiss after 1.5s
        setTimeout(() => {
          hideStatusOverlay();
        }, 1500);
      }, 1800);
    }, 350);
  }, [closeWithdrawModal, isValidToWithdraw, showStatusOverlay, hideStatusOverlay]);

  const renderItem = useCallback(
    ({ item }: { item: DeliveryRequest }) => (
      <View style={styles.row}>
        <View style={styles.rowContent}>
          <View style={styles.rowLeft}>
            <View style={styles.rowIconCircle}>
              <Ionicons
                name={'cube-outline' as keyof typeof Ionicons.glyphMap}
                size={16}
                color={colors.primary}
              />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle} numberOfLines={1}>
                {item.itemDescription}
              </Text>
              <Text style={styles.rowSub}>
                {item.area} · {formatTimestamp(item.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.rowRight}>
            <Text style={styles.rowFee}>{item.deliveryFee} BDT</Text>
          </View>
        </View>
      </View>
    ),
    []
  );

  const keyExtractor = useCallback((item: DeliveryRequest) => item.id, []);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <ScreenHeader title={LABELS.earningsTitle} />

      {/* Summary card - single glass surface, no elevation to avoid Android white rect */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View style={styles.summaryIconCircle}>
            <Ionicons
              name={'wallet-outline' as keyof typeof Ionicons.glyphMap}
              size={28}
              color={colors.primary}
            />
          </View>
          <View style={styles.summaryTextCol}>
            <Text style={styles.summaryLabel}>{LABELS.totalEarnings}</Text>
            <Text style={styles.summaryAmount}>{totalEarnings} BDT</Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />
        
        <View style={styles.summaryBottomRow}>
          <Text style={styles.summaryCount}>
            {completedRequests.length} {completedRequests.length === 1 ? 'delivery' : 'deliveries'} completed
          </Text>
          <TouchableOpacity
            style={styles.withdrawBtn}
            onPress={openWithdrawModal}
            activeOpacity={0.8}
            disabled={totalEarnings === 0}
          >
            <Text style={[styles.withdrawBtnText, totalEarnings === 0 && styles.withdrawBtnTextDisabled]}>
              Withdraw
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent deliveries */}
      <Text style={styles.listHeader}>{LABELS.recentDeliveries}</Text>

      <FlatList
        data={completedRequests}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          completedRequests.length === 0 && styles.emptyList,
        ]}
        ListEmptyComponent={
          <EmptyState
            icon="bicycle-outline"
            title="No completed deliveries"
            subtitle="Complete deliveries to see your earnings here"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Withdraw Modal Bottom Sheet */}
      <Modal
        visible={showWithdraw}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={closeWithdrawModal}
      >
        <View style={styles.modalRoot}>
          <Animated.View style={[styles.modalOverlayBg, { opacity: overlayOpacity }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeWithdrawModal} />
          </Animated.View>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardContainer}
            pointerEvents="box-none"
          >
            <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Withdraw Funds</Text>
              <Text style={styles.sheetSub}>Available Balance: {totalEarnings} BDT</Text>

              <View style={styles.methodsContainer}>
                {/* Bank Transfer Option */}
                <TouchableOpacity
                  style={[styles.methodOption, selectedMethod === 'bank' && styles.methodSelected]}
                  onPress={() => setSelectedMethod('bank')}
                  activeOpacity={0.7}
                >
                  <View style={styles.methodHeader}>
                    <View style={[styles.methodIcon, selectedMethod === 'bank' && styles.methodIconSelected]}>
                      <Ionicons name="business-outline" size={20} color={selectedMethod === 'bank' ? '#fff' : colors.primary} />
                    </View>
                    <View style={styles.methodTexts}>
                      <Text style={[styles.methodTitle, selectedMethod === 'bank' && styles.methodTextSelected]}>Bank Transfer</Text>
                      <Text style={[styles.methodDesc, selectedMethod === 'bank' && styles.methodTextSelected]}>2-3 business days</Text>
                    </View>
                    {selectedMethod === 'bank' && (
                      <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    )}
                  </View>

                  {/* Bank Form Details */}
                  {selectedMethod === 'bank' && (
                    <View style={styles.mobileForm}>
                      <Text style={styles.mobileFormLabel}>Bank Name</Text>
                      <TextInput
                        style={[styles.phoneInput, { marginBottom: spacing.md }]}
                        placeholder="Enter bank name"
                        placeholderTextColor={colors.textMuted}
                        value={bankName}
                        onChangeText={setBankName}
                      />
                      <Text style={styles.mobileFormLabel}>Account Number</Text>
                      <TextInput
                        style={styles.phoneInput}
                        placeholder="Enter account number"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="number-pad"
                        value={bankAccount}
                        onChangeText={setBankAccount}
                      />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Mobile Money Option */}
                <TouchableOpacity
                  style={[styles.methodOption, selectedMethod === 'mobile' && styles.methodSelected, selectedMethod === 'mobile' && styles.methodOptionExpanded]}
                  onPress={() => setSelectedMethod('mobile')}
                  activeOpacity={0.7}
                >
                  <View style={styles.methodHeader}>
                    <View style={[styles.methodIcon, selectedMethod === 'mobile' && styles.methodIconSelected]}>
                      <Ionicons name="phone-portrait-outline" size={20} color={selectedMethod === 'mobile' ? '#fff' : colors.primary} />
                    </View>
                    <View style={styles.methodTexts}>
                      <Text style={[styles.methodTitle, selectedMethod === 'mobile' && styles.methodTextSelected]}>Mobile Banking</Text>
                      <Text style={[styles.methodDesc, selectedMethod === 'mobile' && styles.methodTextSelected]}>Instant (bKash/Nagad/Upay)</Text>
                    </View>
                    {selectedMethod === 'mobile' && (
                      <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    )}
                  </View>

                  {/* Mobile Form Details */}
                  {selectedMethod === 'mobile' && (
                    <View style={styles.mobileForm}>
                      <Text style={styles.mobileFormLabel}>Select Provider</Text>
                      <View style={styles.providerRow}>
                        <TouchableOpacity
                          style={[styles.providerBox, mobileProvider === 'bkash' && styles.providerActiveBorder]}
                          onPress={() => setMobileProvider('bkash')}
                          activeOpacity={0.7}
                        >
                          <Image 
                            source={LOGO_BKASH}
                            style={styles.providerLogoImage}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.providerBox, mobileProvider === 'nagad' && styles.providerActiveBorder]}
                          onPress={() => setMobileProvider('nagad')}
                          activeOpacity={0.7}
                        >
                          <Image 
                            source={LOGO_NAGAD}
                            style={styles.providerLogoImage}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.providerBox, mobileProvider === 'upay' && styles.providerActiveBorder]}
                          onPress={() => setMobileProvider('upay')}
                          activeOpacity={0.7}
                        >
                          <Image 
                            source={LOGO_UPAY}
                            style={styles.providerLogoImage}
                            resizeMode="contain"
                          />
                        </TouchableOpacity>
                      </View>
                      
                      <Text style={styles.mobileFormLabel}>Mobile Number</Text>
                      <TextInput
                        style={styles.phoneInput}
                        placeholder="Enter your mobile number"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="phone-pad"
                        value={withdrawPhone}
                        onChangeText={setWithdrawPhone}
                        maxLength={11}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.confirmBtn, !isValidToWithdraw && styles.confirmBtnDisabled]}
                onPress={handleWithdrawConfirm}
                disabled={!isValidToWithdraw}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Professional Processing / Success Overlay */}
      {withdrawStatus !== 'idle' && (
        <View style={statusStyles.overlayRoot}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 40 : 15}
            tint="dark"
            style={StyleSheet.absoluteFill}
            experimentalBlurMethod="dimezisBlurView"
          />
          {/* Extra dim layer for Android */}
          {Platform.OS === 'android' && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />
          )}
          <Animated.View
            style={[
              statusStyles.card,
              {
                transform: [{ scale: statusScaleAnim }],
                opacity: statusOpacityAnim,
              },
            ]}
          >
            {withdrawStatus === 'processing' ? (
              <>
                <View style={statusStyles.spinnerWrap}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
                <Text style={statusStyles.title}>Processing...</Text>
                <Text style={statusStyles.subtitle}>Please wait while we process your withdrawal</Text>
              </>
            ) : (
              <>
                <View style={statusStyles.successCircle}>
                  <Ionicons name="checkmark" size={36} color="#fff" />
                </View>
                <Text style={statusStyles.title}>Withdrawal Successful!</Text>
                <Text style={statusStyles.subtitle}>Your request has been submitted. Funds will arrive shortly.</Text>
              </>
            )}
          </Animated.View>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  summaryCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: glassValues.cardBg,
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
    borderTopColor: glassValues.edgeHighlight,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryTextCol: {
    flex: 1,
  },
  summaryIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  summaryAmount: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  summaryBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  withdrawBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  withdrawBtnText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  withdrawBtnTextDisabled: {
    opacity: 0.6,
  },
  listHeader: {
    fontSize: fontSize.sectionHeader,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
  row: {
    borderRadius: borderRadius.lg,
    backgroundColor: glassValues.cardBg,
    marginBottom: spacing.sm,
    borderWidth: 0.5,
    borderColor: glassValues.softBorder,
    borderTopColor: glassValues.edgeHighlight,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  rowSub: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowFee: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  // --- Bottom Sheet Styles ---
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    justifyContent: 'flex-end',
  },
  modalOverlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : spacing.xxl,
    paddingTop: spacing.md,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sheetSub: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  methodsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  methodOption: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  methodOptionExpanded: {
    borderColor: colors.primary,
  },
  methodSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodIconSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  methodTexts: {
    flex: 1,
  },
  methodTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  methodDesc: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  methodTextSelected: {
    color: '#fff',
  },
  mobileForm: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  mobileFormLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  providerRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  providerBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  providerActiveBorder: {
    borderColor: '#10B981', // green success check border
  },
  providerLogoImage: {
    width: '100%',
    height: '100%',
  },
  phoneInput: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: fontWeight.medium,
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  confirmBtnDisabled: {
    backgroundColor: colors.border,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
});

const statusStyles = StyleSheet.create({
  overlayRoot: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    width: 280,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.92)' : '#ffffff',
    borderRadius: borderRadius.xxl,
    paddingVertical: 36,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  spinnerWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.sm,
  },
});

export default EarningsScreen;
