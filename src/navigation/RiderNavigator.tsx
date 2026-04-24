import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { RiderTabParamList, RiderStackParamList } from '../types';
import RiderRequestsScreen from '../screens/rider/RiderRequestsScreen';
import DeliveryDetailsScreen from '../screens/rider/DeliveryDetailsScreen';
import EarningsScreen from '../screens/rider/EarningsScreen';
import RiderProfileScreen from '../screens/rider/RiderProfileScreen';
import { colors, borderRadius, fontSize, fontWeight } from '../theme/tokens';
import { glassValues } from '../theme/glass';

const isIOS = Platform.OS === 'ios';

// ─── Nested stack for Requests tab ──────────────────────────────────────────

const RequestsStack = createStackNavigator<RiderStackParamList>();
const RequestsStackNavigator: React.FC = () => (
  <RequestsStack.Navigator screenOptions={{ headerShown: false }}>
    <RequestsStack.Screen name="RiderRequests" component={RiderRequestsScreen} />
    <RequestsStack.Screen name="DeliveryDetails" component={DeliveryDetailsScreen} />
  </RequestsStack.Navigator>
);

// ─── Tab navigator ──────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<RiderTabParamList>();

type IconPair = [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap];

const TAB_ICONS: Record<string, IconPair> = {
  Requests: ['list-circle', 'list-circle-outline'],
  Earnings: ['bicycle', 'bicycle-outline'],
  Profile: ['person-circle', 'person-circle-outline'],
};

export const RiderNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: fontWeight.medium,
        },
        tabBarStyle: {
          position: 'absolute' as const,
          bottom: 16,
          left: 20,
          right: 20,
          height: 76,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          borderWidth: 0,
          borderRadius: borderRadius.xl,
          elevation: 0,
          overflow: 'hidden' as const,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground}>
            {isIOS ? (
              <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.tabBarAndroidBg]} />
            )}
          </View>
        ),
        tabBarIcon: ({ focused, color, size }) => {
          const pair = TAB_ICONS[route.name];
          const iconName = pair
            ? (focused ? pair[0] : pair[1])
            : (focused ? 'ellipse' as keyof typeof Ionicons.glyphMap : 'ellipse-outline' as keyof typeof Ionicons.glyphMap);
          return (
            <View style={styles.iconContainer}>
              {focused && <View style={styles.activeIndicator} />}
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Requests"
        component={RequestsStackNavigator}
        options={{ tabBarLabel: 'Requests' }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{ tabBarLabel: 'Earnings' }}
      />
      <Tab.Screen
        name="Profile"
        component={RiderProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarBackground: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowColor: '#8E9BB5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  tabBarAndroidBg: {
    backgroundColor: glassValues.tabBarBg,
  },
  iconContainer: {
    alignItems: 'center',
  },
  activeIndicator: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginBottom: 4,
  },
});
