import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { Snackbar } from '@/components/dayforge/Snackbar';
import Colors from '@/constants/Colors';
import { AppStateProvider, useAppState } from '@/store/appState';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <AppStateProvider>
      <RootNavigator />
    </AppStateProvider>
  );
}

function RootNavigator() {
  const { isHydrated, setSuccessMessage, state, successMessage } = useAppState();
  const palette = state.preferences.darkMode ? Colors.dark : Colors.light;

  if (!isHydrated) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f081b' }}>
            <ActivityIndicator size="large" color="#a44cff" />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={state.preferences.darkMode ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="add-task" options={{ presentation: 'modal', title: 'Add Task', headerShown: false }} />
            <Stack.Screen name="add-habit" options={{ presentation: 'modal', title: 'Add Habit', headerShown: false }} />
            <Stack.Screen name="edit-weekly-focus" options={{ presentation: 'modal', title: 'Edit Weekly Focus', headerShown: false }} />
            <Stack.Screen name="reflections" options={{ presentation: 'modal', title: 'Past Reflections', headerShown: false }} />
            <Stack.Screen name="reflection/[id]" options={{ presentation: 'modal', title: 'Reflection Detail', headerShown: false }} />
          </Stack>
          <Snackbar
            message={successMessage}
            visible={Boolean(successMessage)}
            onDismiss={() => setSuccessMessage(null)}
            palette={palette}
          />
          <StatusBar style={state.preferences.darkMode ? 'light' : 'dark'} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
