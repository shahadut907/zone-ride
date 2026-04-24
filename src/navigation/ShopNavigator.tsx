import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ShopTabParamList, ShopStackParamList, ShopMenuStackParamList } from '../types';
import ShopOrdersScreen from '../screens/shop/ShopOrdersScreen';
import OrderDetailsScreen from '../screens/shop/OrderDetailsScreen';
import ShopMenuScreen from '../screens/shop/ShopMenuScreen';
import AddMenuItemScreen from '../screens/shop/AddMenuItemScreen';
import ShopRidersScreen from '../screens/shop/ShopRidersScreen';
import ShopProfileScreen from '../screens/shop/ShopProfileScreen';
import { colors, borderRadius, fontSize, fontWeight } from '../theme/tokens';
import { glassValues } from '../theme/glass';

const isIOS = Platform.OS === 'ios';

// ─── Nested stack for Orders tab ────────────────────────────────────────────

const OrdersStack = createStackNavigator<ShopStackParamList>();
const OrdersStackNavigator: React.FC = () => (
  <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
    <OrdersStack.Screen name="ShopOrders" component={ShopOrdersScreen} />
    <OrdersStack.Screen name="OrderDetails" component={OrderDetailsScreen} />
  </OrdersStack.Navigator>
);

// ─── Nested stack for Menu tab ──────────────────────────────────────────────

const MenuStack = createStackNavigator<ShopMenuStackParamList>();
const MenuStackNavigator: React.FC = () => (
  <MenuStack.Navigator screenOptions={{ headerShown: false }}>
    <MenuStack.Screen name="ShopMenu" component={ShopMenuScreen} />
    <MenuStack.Screen name="AddMenuItem" component={AddMenuItemScreen} />
  </MenuStack.Navigator>
);

// ─── Tab navigator ──────────────────────────────────────────────────────────

const Tab = createBottomTabNavigator<ShopTabParamList>();

type IconPair = [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap];

const TAB_ICONS: Record<string, IconPair> = {
  Orders: ['receipt', 'receipt-outline'],
  Menu: ['restaurant', 'restaurant-outline'],
  Riders: ['people', 'people-outline'],
  Profile: ['storefront', 'storefront-outline'],
};

export const ShopNavigator: React.FC = () => {
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
        name="Orders"
        component={OrdersStackNavigator}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuStackNavigator}
        options={{ tabBarLabel: 'Menu' }}
      />
      <Tab.Screen
        name="Riders"
        component={ShopRidersScreen}
        options={{ tabBarLabel: 'Riders' }}
      />
      <Tab.Screen
        name="Profile"
        component={ShopProfileScreen}
        options={{ tabBarLabel: 'Shop' }}
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
