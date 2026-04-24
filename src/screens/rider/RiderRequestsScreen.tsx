import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useApp } from '../../context/AppContext';
import { DeliveryRequest, RiderStackParamList, RootStackParamList } from '../../types';
import { fetchRequests } from '../../services/requestService';
import { colors, spacing } from '../../theme/tokens';
import { LABELS } from '../../constants/labels';
import ScreenHeader from '../../components/common/ScreenHeader';
import TogglePill from '../../components/common/TogglePill';
import EmptyState from '../../components/common/EmptyState';
import RequestCard from '../../components/cards/RequestCard';

type Props = StackScreenProps<RiderStackParamList, 'RiderRequests'>;

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

const DEMO_RIDER_ID = 'rider-1';

const RiderRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const rootNavigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      if (state.requests.length === 0) {
        setIsLoading(true);
        const data = await fetchRequests();
        dispatch({ type: 'SET_REQUESTS', payload: data });
      }
      setIsLoading(false);
    };
    loadRequests();
  }, [dispatch, state.requests.length]);

  const filteredRequests = useMemo(() => {
    let list = state.requests;

    // Filter by selected area
    if (state.selectedArea) {
      list = list.filter((r) => r.area === state.selectedArea);
    }

    // Filter only POSTED requests or those assigned to this rider
    list = list.filter(
      (r) => r.status === 'POSTED' || r.riderId === DEMO_RIDER_ID
    );

    if (filter === 'active') {
      list = list.filter(
        (r) => r.status !== 'COMPLETED' && r.status !== 'REJECTED'
      );
    } else if (filter === 'completed') {
      list = list.filter((r) => r.status === 'COMPLETED');
    }

    return list;
  }, [state.requests, state.selectedArea, filter]);

  const handlePressRequest = useCallback(
    (request: DeliveryRequest) => {
      navigation.navigate('DeliveryDetails', { requestId: request.id });
    },
    [navigation]
  );

  const handleNotifications = useCallback(() => {
    rootNavigation.navigate('Notifications');
  }, [rootNavigation]);

  const unreadCount = useMemo(
    () => state.notifications.filter((n) => !n.isRead).length,
    [state.notifications]
  );

  const renderItem = useCallback(
    ({ item }: { item: DeliveryRequest }) => (
      <RequestCard request={item} onPress={handlePressRequest} />
    ),
    [handlePressRequest]
  );

  const keyExtractor = useCallback((item: DeliveryRequest) => item.id, []);

  const emptyMessage = useMemo(() => {
    if (filter === 'completed') return 'No completed deliveries yet';
    if (filter === 'active') return 'No active requests';
    return LABELS.noRequests;
  }, [filter]);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <ScreenHeader
        title={LABELS.riderRequestsTitle}
        rightIcon="notifications-outline"
        onRightPress={handleNotifications}
        rightBadge={unreadCount}
      />

      <View style={styles.filterRow}>
        <TogglePill
          options={FILTER_OPTIONS}
          selected={filter}
          onSelect={setFilter}
        />
      </View>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={[
            styles.listContent,
            filteredRequests.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={
            <EmptyState
              icon="file-tray-outline"
              title={emptyMessage}
              subtitle="Pull down to refresh"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
  },
});

export default RiderRequestsScreen;
