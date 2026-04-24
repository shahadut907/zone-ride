import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import SplashScreen from '../screens/shared/SplashScreen';
import RoleSelectionScreen from '../screens/shared/RoleSelectionScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import LoginScreen from '../screens/customer/LoginScreen';
import AreaSelectionScreen from '../screens/customer/AreaSelectionScreen';
import { CustomerNavigator } from './CustomerNavigator';
import { RiderNavigator } from './RiderNavigator';
import { ShopNavigator } from './ShopNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
        options={{ animation: 'none' }}
      />
      <Stack.Screen name="CustomerLogin" component={LoginScreen} />
      <Stack.Screen name="AreaSelection" component={AreaSelectionScreen} />
      <Stack.Screen
        name="CustomerTabs"
        component={CustomerNavigator}
        options={{ animation: 'none' }}
      />
      <Stack.Screen
        name="RiderTabs"
        component={RiderNavigator}
        options={{ animation: 'none' }}
      />
      <Stack.Screen
        name="ShopTabs"
        component={ShopNavigator}
        options={{ animation: 'none' }}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};
