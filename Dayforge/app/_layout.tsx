import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { Snackbar } from '@/components/dayforge/Snackbar';
import { Fonts } from '@/constants/Typography';
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
    Inter: require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
    Manrope: require('../assets/fonts/Manrope-VariableFont_wght.ttf'),
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      const textStyle = { fontFamily: Fonts.body };
      const inputStyle = { fontFamily: Fonts.body };
      const textComponent = Text as typeof Text & { defaultProps?: { style?: unknown } };
      const inputComponent = TextInput as typeof TextInput & { defaultProps?: { style?: unknown } };
      textComponent.defaultProps = textComponent.defaultProps ?? {};
      textComponent.defaultProps.style = textStyle;
      inputComponent.defaultProps = inputComponent.defaultProps ?? {};
      inputComponent.defaultProps.style = inputStyle;
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
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.dark.background }}>
            <ActivityIndicator size="large" color={Colors.dark.accent} />
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
            <Stack.Screen name="add-task" options={{ presentation: 'modal', title: 'Add Task', headerShown: false, animation: 'slide_from_bottom' }} />
            <Stack.Screen name="add-habit" options={{ presentation: 'modal', title: 'Add Habit', headerShown: false, animation: 'slide_from_bottom' }} />
            <Stack.Screen name="edit-weekly-focus" options={{ presentation: 'modal', title: 'Edit Weekly Focus', headerShown: false, animation: 'slide_from_bottom' }} />
            <Stack.Screen name="day-summary" options={{ presentation: 'modal', title: 'Day Summary', headerShown: false, animation: 'slide_from_bottom' }} />
            <Stack.Screen name="schedule-picker" options={{ presentation: 'modal', title: 'Schedule', headerShown: false, animation: 'slide_from_bottom' }} />
            <Stack.Screen name="schedule-day" options={{ presentation: 'modal', title: 'Schedule Day', headerShown: false, animation: 'slide_from_bottom' }} />
            <Stack.Screen name="weekly-plan" options={{ presentation: 'modal', title: 'Weekly Plan', headerShown: false, animation: 'slide_from_bottom' }} />
            <Stack.Screen name="reflections" options={{ presentation: 'modal', title: 'Past Reflections', headerShown: false, animation: 'slide_from_bottom' }} />
            <Stack.Screen name="reflection/[id]" options={{ presentation: 'modal', title: 'Reflection Detail', headerShown: false, animation: 'slide_from_bottom' }} />
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
