import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import {
  CustomerTabParamList,
  CustomerStackParamList,
  CustomerRequestsStackParamList,
  CustomerChatsStackParamList,
} from '../types';
import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';
import DeliveryRequestScreen from '../screens/customer/DeliveryRequestScreen';
import RequestTrackingScreen from '../screens/customer/RequestTrackingScreen';
import CustomerRequestsScreen from '../screens/customer/CustomerRequestsScreen';
import ChatsListScreen from '../screens/customer/ChatsListScreen';
import ChatDetailScreen from '../screens/customer/ChatDetailScreen';
import ShopMenuViewScreen from '../screens/customer/ShopMenuViewScreen';
import CustomerProfileScreen from '../screens/customer/CustomerProfileScreen';
import { colors, borderRadius, fontSize, fontWeight } from '../theme/tokens';
import { glassValues } from '../theme/glass';

const isIOS = Platform.OS === 'ios';

// ─── Nested stacks ───────────────────────────────────────────────────────────

const HomeStack = createStackNavigator<CustomerStackParamList>();
const HomeStackNavigator: React.FC = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="CustomerHome" component={CustomerHomeScreen} />
    <HomeStack.Screen name="DeliveryRequest" component={DeliveryRequestScreen} />
    <HomeStack.Screen name="ShopMenuView" component={ShopMenuViewScreen} />
  </HomeStack.Navigator>
);

const RequestsStack = createStackNavigator<CustomerRequestsStackParamList>();
const RequestsStackNavigator: React.FC = () => (
  <RequestsStack.Navigator screenOptions={{ headerShown: false }}>
    <RequestsStack.Screen name="RequestsList" component={CustomerRequestsScreen} />
    <RequestsStack.Screen name="RequestTracking" component={RequestTrackingScreen} />
  </RequestsStack.Navigator>
);

const ChatsStack = createStackNavigator<CustomerChatsStackParamList>();
const ChatsStackNavigator: React.FC = () => (
  <ChatsStack.Navigator screenOptions={{ headerShown: false }}>
    <ChatsStack.Screen name="ChatsList" component={ChatsListScreen} />
    <ChatsStack.Screen name="ChatDetail" component={ChatDetailScreen} />
  </ChatsStack.Navigator>
);

// ─── Tab navigator ───────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<CustomerTabParamList>();

type IconPair = [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap];

const TAB_ICONS: Record<string, IconPair> = {
  Home: ['home', 'home-outline'],
  Requests: ['list-circle', 'list-circle-outline'],
  Chats: ['chatbubbles', 'chatbubbles-outline'],
  Profile: ['person-circle', 'person-circle-outline'],
};

export const CustomerNavigator: React.FC = () => {
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
        name="Home"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Requests"
        component={RequestsStackNavigator}
        options={{ tabBarLabel: 'Requests' }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsStackNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'ChatsList';
          return {
            tabBarLabel: 'Chats',
            tabBarStyle: routeName === 'ChatDetail'
              ? { display: 'none' as const }
              : {
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
          };
        }}
      />
      <Tab.Screen
        name="Profile"
        component={CustomerProfileScreen}
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
