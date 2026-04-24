import React, { useEffect, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ListRenderItem,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Rider, Shop, ChatThread, CustomerStackParamList, RootStackParamList, SubscriptionState } from '../../types';
import { useApp } from '../../context/AppContext';
import { fetchRidersByArea } from '../../services/riderService';
import { fetchShopsByArea } from '../../services/shopService';
import RiderCard from '../../components/cards/RiderCard';
import ShopCard from '../../components/cards/ShopCard';
import TogglePill from '../../components/common/TogglePill';
import EmptyState from '../../components/common/EmptyState';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { LABELS } from '../../constants/labels';

type HomeNavProp = StackNavigationProp<CustomerStackParamList, 'CustomerHome'>;
type RootNavProp = StackNavigationProp<RootStackParamList>;

type Tab = 'riders' | 'shops';

const CustomerHomeScreen: React.FC = () => {
  const homeNav = useNavigation<HomeNavProp>();
  const rootNav = useNavigation<RootNavProp>();
  const { state, dispatch } = useApp();

  const [tab, setTab] = useState<Tab>('riders');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const area = state.selectedArea ?? '';
  const unreadCount = state.notifications.filter((n) => !n.isRead).length;

  const loadData = useCallback(async (silent = false) => {
    if (!area) return;
    if (!silent) setIsLoading(true);
    try {
      const [riders, shops] = await Promise.all([
        fetchRidersByArea(area),
        fetchShopsByArea(area),
      ]);
      dispatch({ type: 'SET_RIDERS', payload: riders });
      dispatch({ type: 'SET_SHOPS', payload: shops });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [area, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData(true);
  }, [loadData]);

  const handleCall = useCallback((entity: Rider | Shop) => {
    dispatch({ type: 'SHOW_TOAST', payload: 'Calling ' + entity.name });
  }, [dispatch]);

  const handleChat = useCallback((entity: Rider | Shop) => {
    // Find existing thread or create a new one
    const participantRole: 'rider' | 'shop' = 'vehicleType' in entity ? 'rider' : 'shop';
    let thread = state.chats.find(
      (t) => t.participantName === entity.name && t.participantRole === participantRole
    );

    if (!thread) {
      thread = {
        id: 'chat_' + Date.now(),
        participantName: entity.name,
        participantRole,
        area: participantRole === 'rider' ? (entity as Rider).servedAreas[0] ?? '' : (entity as Shop).area,
        messages: [],
        lastMessage: '',
        lastTimestamp: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_CHAT_THREAD', payload: thread });
    }

    // Navigate to Chats tab → ChatDetail
    // @ts-ignore — cross-tab navigation
    homeNav.navigate('Chats', {
      screen: 'ChatDetail',
      params: { threadId: thread.id, participantName: entity.name },
    });
  }, [state.chats, dispatch, homeNav]);

  const handleSubscriptionChange = useCallback(
    (rider: Rider, next: SubscriptionState) => {
      dispatch({
        type: 'UPDATE_RIDER_SUBSCRIPTION',
        payload: { riderId: rider.id, state: next },
      });
      const label = next === 'subscribed' ? 'Subscribed to ' : 'Unsubscribed from ';
      dispatch({ type: 'SHOW_TOAST', payload: label + rider.name });
    },
    [dispatch]
  );

  const handleRequestDeliveryFromRider = useCallback(
    (rider: Rider) => {
      homeNav.navigate('DeliveryRequest', { riderId: rider.id });
    },
    [homeNav]
  );

  const handleViewMenu = useCallback(
    (shop: Shop) => {
      homeNav.navigate('ShopMenuView', { shopId: shop.id, shopName: shop.name });
    },
    [homeNav]
  );

  const handleNotifications = useCallback(() => {
    rootNav.navigate('Notifications');
  }, [rootNav]);

  const renderRider: ListRenderItem<Rider> = useCallback(
    ({ item }) => (
      <RiderCard
        rider={item}
        onCall={handleCall}
        onChat={handleChat}
        onSubscriptionChange={handleSubscriptionChange}
        onRequestDelivery={handleRequestDeliveryFromRider}
      />
    ),
    [handleCall, handleChat, handleSubscriptionChange, handleRequestDeliveryFromRider]
  );

  const renderShop: ListRenderItem<Shop> = useCallback(
    ({ item }) => (
      <ShopCard
        shop={item}
        onCall={handleCall}
        onChat={handleChat}
        onViewMenu={handleViewMenu}
      />
    ),
    [handleCall, handleChat, handleViewMenu]
  );

  const riderKeyExtractor = useCallback((item: Rider) => item.id, []);
  const shopKeyExtractor = useCallback((item: Shop) => item.id, []);

  const TAB_OPTIONS = [
    { label: LABELS.deliveryMan, value: 'riders' },
    { label: LABELS.shops, value: 'shops' },
  ];

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.customerName} numberOfLines={1}>
              {state.customerSession?.name ?? 'Customer'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.areaChip}>
              <Ionicons
                name={'location' as keyof typeof Ionicons.glyphMap}
                size={14}
                color={colors.locationBadgeText}
              />
              <Text style={styles.areaChipText} numberOfLines={1}>
                {area}
              </Text>
            </View>
            <TouchableOpacity style={styles.notifBtn} onPress={handleNotifications}>
              <Ionicons
                name={'notifications-outline' as keyof typeof Ionicons.glyphMap}
                size={20}
                color={colors.white}
              />
              {unreadCount > 0 ? (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          </View>
        </View>

        {/* Toggle */}
        <View style={styles.toggleRow}>
          <TogglePill
            options={TAB_OPTIONS}
            selected={tab}
            onSelect={(v) => setTab(v as Tab)}
          />
        </View>
      </View>

      {/* List */}
      {tab === 'riders' ? (
        <FlatList
          data={state.riders}
          renderItem={renderRider}
          keyExtractor={riderKeyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            isLoading ? null : (
              <EmptyState
                icon="bicycle-outline"
                title={LABELS.noRidersInArea}
                subtitle={'No riders are currently serving ' + area}
              />
            )
          }
        />
      ) : (
        <FlatList
          data={state.shops}
          renderItem={renderShop}
          keyExtractor={shopKeyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            isLoading ? null : (
              <EmptyState
                icon="storefront-outline"
                title={LABELS.noShopsInArea}
                subtitle={'No shops found in ' + area}
              />
            )
          }
        />
      )}

      <LoadingOverlay visible={isLoading} message={LABELS.loading} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  customerName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.extraBold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.locationBadgeBg,
    borderRadius: borderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: 140,
    borderWidth: 0,
  },
  areaChipText: {
    fontSize: fontSize.sm,
    color: colors.locationBadgeText,
    fontWeight: fontWeight.medium,
    flexShrink: 1,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.notifBellBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadgeText: {
    fontSize: 9,
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  toggleRow: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 100,
    flexGrow: 1,
  },
});

export default CustomerHomeScreen;
