import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassBackground from '../../components/common/GlassBackground';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { ShopStackParamList, ShopOrder, RootStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import { fetchOrders } from '../../services/orderService';
import { fetchRiders } from '../../services/riderService';
import { fetchShops } from '../../services/shopService';
import ScreenHeader from '../../components/common/ScreenHeader';
import TogglePill from '../../components/common/TogglePill';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../theme/tokens';
import { shadows } from '../../theme/shadows';
import { LABELS } from '../../constants/labels';
import { formatTimestamp } from '../../utils/statusHelpers';

type Props = StackScreenProps<ShopStackParamList, 'ShopOrders'>;

const DEMO_SHOP_ID = 'shop-1';

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Active', value: 'active' },
];

const ShopOrdersScreen: React.FC<Props> = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const rootNav = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Seed all shop-flow data on mount
  useEffect(() => {
    let mounted = true;
    const seedData = async () => {
      setIsLoading(true);
      const [orders, riders, shops] = await Promise.all([
        state.orders.length === 0 ? fetchOrders() : Promise.resolve(null),
        state.riders.length === 0 ? fetchRiders() : Promise.resolve(null),
        state.shops.length === 0 ? fetchShops() : Promise.resolve(null),
      ]);
      if (mounted) {
        if (orders) dispatch({ type: 'SET_ORDERS', payload: orders });
        if (riders) dispatch({ type: 'SET_RIDERS', payload: riders });
        if (shops) dispatch({ type: 'SET_SHOPS', payload: shops });
        setIsLoading(false);
      }
    };
    seedData();
    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shopOrders = useMemo(() => {
    const filtered = state.orders.filter((o) => o.shopId === DEMO_SHOP_ID);
    if (filter === 'pending') {
      return filtered.filter((o) => o.status === 'PENDING');
    }
    if (filter === 'active') {
      return filtered.filter((o) => o.status === 'ACCEPTED' || o.status === 'ASSIGNED');
    }
    return filtered;
  }, [state.orders, filter]);

  const unreadCount = useMemo(
    () => state.notifications.filter((n) => !n.isRead && (n.role === 'shop' || n.role === 'all')).length,
    [state.notifications]
  );

  const handleFilterChange = useCallback((value: string) => {
    setFilter(value);
  }, []);

  const handleOrderPress = useCallback(
    (orderId: string) => {
      navigation.navigate('OrderDetails', { orderId });
    },
    [navigation]
  );

  const handleNotifications = useCallback(() => {
    rootNav.navigate('Notifications');
  }, [rootNav]);

  const emptyMessage = useMemo(() => {
    if (filter === 'pending') return 'No pending orders';
    if (filter === 'active') return 'No active orders';
    return LABELS.noOrders;
  }, [filter]);

  const renderOrderCard: ListRenderItem<ShopOrder> = useCallback(
    ({ item }) => (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleOrderPress(item.id)}
        style={[styles.orderCard, shadows.md]}
      >
        <GlassBackground intensity={42} />
        <View style={styles.orderCardBorder} />
        <View style={styles.orderCardContent}>
          <View style={styles.orderTopRow}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderCustomerName} numberOfLines={1}>
                {item.customerName}
              </Text>
              <Text style={styles.orderItemDetails} numberOfLines={1}>
                {item.itemDetails}
              </Text>
            </View>
            <StatusBadge status={item.status} />
          </View>
          <View style={styles.orderBottomRow}>
            <View style={styles.orderMetaRow}>
              <Ionicons
                name={'location-outline' as keyof typeof Ionicons.glyphMap}
                size={13}
                color={colors.textMuted}
              />
              <Text style={styles.orderMetaText} numberOfLines={1}>
                {item.area}
              </Text>
            </View>
            <View style={styles.orderMetaRow}>
              <Ionicons
                name={'time-outline' as keyof typeof Ionicons.glyphMap}
                size={13}
                color={colors.textMuted}
              />
              <Text style={styles.orderMetaText}>
                {formatTimestamp(item.createdAt)}
              </Text>
            </View>
            <Ionicons
              name={'chevron-forward' as keyof typeof Ionicons.glyphMap}
              size={18}
              color={colors.textMuted}
            />
          </View>
        </View>
      </TouchableOpacity>
    ),
    [handleOrderPress]
  );

  const keyExtractor = useCallback((item: ShopOrder) => item.id, []);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScreenHeader
        title={LABELS.shopOrdersTitle}
        rightIcon="notifications-outline"
        onRightPress={handleNotifications}
        rightBadge={unreadCount}
      />

      <View style={styles.filterContainer}>
        <TogglePill
          options={FILTER_OPTIONS}
          selected={filter}
          onSelect={handleFilterChange}
        />
      </View>

      <FlatList
        data={shopOrders}
        renderItem={renderOrderCard}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title={emptyMessage}
            subtitle="Orders will appear here"
          />
        }
      />

      <LoadingOverlay visible={isLoading} message={LABELS.loading} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 100,
    gap: spacing.md,
    flexGrow: 1,
  },
  orderCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  orderCardBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: borderRadius.xl,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  orderCardContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  orderInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  orderCustomerName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  orderItemDetails: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  orderBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  orderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  orderMetaText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});

export default ShopOrdersScreen;
