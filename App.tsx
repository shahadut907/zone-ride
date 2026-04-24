import React, { useRef, useEffect, useCallback } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/context/AppContext';
import { useApp } from './src/context/AppContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { RootStackParamList } from './src/types';
import SnackbarHost from './src/components/common/SnackbarHost';

// Separate component so it can consume AppContext via useApp
const AppContent: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Prevent Android hardware back button from firing GO_BACK on root screens
  useEffect(() => {
    const onBackPress = () => {
      if (navigationRef.current && !navigationRef.current.canGoBack()) {
        // We are at the root screen — consume the back press to avoid the error
        return true;
      }
      // Let React Navigation handle the back press normally
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.root}>
      <NavigationContainer ref={navigationRef}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <RootNavigator />
      </NavigationContainer>
      <SnackbarHost
        message={state.toastMessage}
        onDismiss={() => dispatch({ type: 'HIDE_TOAST' })}
      />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
