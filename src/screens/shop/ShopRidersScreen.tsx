import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Rider, SubscriptionState } from '../../types';
import { useApp } from '../../context/AppContext';
import { fetchRiders } from '../../services/riderService';
import ScreenHeader from '../../components/common/ScreenHeader';
import EmptyState from '../../components/common/EmptyState';
import LoadingOverlay from '../../components/common/LoadingOverlay';
import RiderCard from '../../components/cards/RiderCard';
import { colors, spacing } from '../../theme/tokens';
import { LABELS } from '../../constants/labels';

const ShopRidersScreen: React.FC = () => {
  const { state, dispatch } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  // Seed riders on mount if empty
  useEffect(() => {
    let mounted = true;
    const seed = async () => {
      if (state.riders.length === 0) {
        setIsLoading(true);
        const riders = await fetchRiders();
        if (mounted) {
          dispatch({ type: 'SET_RIDERS', payload: riders });
          setIsLoading(false);
        }
      }
    };
    seed();
    return () => {
      mounted = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const riders = useMemo(() => state.riders, [state.riders]);

  const showToast = useCallback(
    (msg: string) => {
      dispatch({ type: 'SHOW_TOAST', payload: msg });
      setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2500);
    },
    [dispatch]
  );

  const handleCall = useCallback(
    (rider: Rider) => {
      showToast(`Calling ${rider.name}...`);
    },
    [showToast]
  );

  const handleChat = useCallback(
    (rider: Rider) => {
      showToast(`Opening chat with ${rider.name}...`);
    },
    [showToast]
  );

  const handleSubscriptionChange = useCallback(
    (rider: Rider, next: SubscriptionState) => {
      dispatch({
        type: 'UPDATE_RIDER_SUBSCRIPTION',
        payload: { riderId: rider.id, state: next },
      });
      const label =
        next === 'subscribed'
          ? `Subscribed to ${rider.name}`
          : `Unsubscribed from ${rider.name}`;
      showToast(label);
    },
    [dispatch, showToast]
  );

  const handleRequestDelivery = useCallback(
    (_rider: Rider) => {
      showToast('Assign from Order Details instead');
    },
    [showToast]
  );

  const renderItem: ListRenderItem<Rider> = useCallback(
    ({ item }) => (
      <RiderCard
        rider={item}
        onCall={handleCall}
        onChat={handleChat}
        onSubscriptionChange={handleSubscriptionChange}
        onRequestDelivery={handleRequestDelivery}
      />
    ),
    [handleCall, handleChat, handleSubscriptionChange, handleRequestDelivery]
  );

  const keyExtractor = useCallback((item: Rider) => item.id, []);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScreenHeader title={LABELS.shopRidersTitle} />

      <FlatList
        data={riders}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No riders available"
            subtitle="Riders will appear here once registered"
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
  listContent: {
    paddingVertical: spacing.sm,
    paddingBottom: 100,
    flexGrow: 1,
  },
});

export default ShopRidersScreen;
