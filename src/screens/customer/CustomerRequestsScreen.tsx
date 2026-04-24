import React, { useEffect, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackScreenProps } from '@react-navigation/stack';
import { DeliveryRequest, CustomerRequestsStackParamList } from '../../types';
import { useApp } from '../../context/AppContext';
import ScreenHeader from '../../components/common/ScreenHeader';
import RequestCard from '../../components/cards/RequestCard';
import EmptyState from '../../components/common/EmptyState';
import { colors, spacing } from '../../theme/tokens';
import { LABELS } from '../../constants/labels';
import requestsData from '../../data/requests.json';

type Props = StackScreenProps<CustomerRequestsStackParamList, 'RequestsList'>;

const CustomerRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const { state, dispatch } = useApp();
  const session = state.customerSession;

  useEffect(() => {
    if (state.requests.length === 0) {
      dispatch({
        type: 'SET_REQUESTS',
        payload: requestsData as DeliveryRequest[],
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const myRequests = state.requests.filter(
    (r) => r.customerId === (session?.id ?? 'cust_001')
  );

  const handlePress = useCallback(
    (request: DeliveryRequest) => {
      navigation.navigate('RequestTracking', { requestId: request.id });
    },
    [navigation]
  );

  const renderItem: ListRenderItem<DeliveryRequest> = useCallback(
    ({ item }) => <RequestCard request={item} onPress={handlePress} />,
    [handlePress]
  );

  const keyExtractor = useCallback((item: DeliveryRequest) => item.id, []);

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientMid, colors.gradientEnd, colors.gradientFinal, colors.gradientLast]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScreenHeader title="My Requests" />
      <FlatList
        data={myRequests}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title={LABELS.noHistory}
            subtitle="Your delivery requests will appear here"
          />
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: 100,
    flexGrow: 1,
  },
});

export default CustomerRequestsScreen;
