import React, { useEffect, useRef, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { useThemeStore } from './src/store/themeStore';
import {
  registerForPushNotifications,
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from './src/services/notifications';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isLoading, loadToken } = useAuthStore();
  const { theme, mode, loadTheme } = useThemeStore();
  const notificationListener = useRef<ReturnType<typeof addNotificationReceivedListener>>();
  const responseListener = useRef<ReturnType<typeof addNotificationResponseListener>>();

  useEffect(() => {
    loadToken();
    loadTheme();
    registerForPushNotifications();
    notificationListener.current = addNotificationReceivedListener(() => {});
    responseListener.current = addNotificationResponseListener(() => {});
    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.flex} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
