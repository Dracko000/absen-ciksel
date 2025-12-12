import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Public routes */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />

        {/* Role-based dashboards */}
        <Stack.Screen name="kepsek" options={{ headerShown: false }} />
        <Stack.Screen name="guru" options={{ headerShown: false }} />
        <Stack.Screen name="murid" options={{ headerShown: false }} />

        {/* Feature screens */}
        <Stack.Screen name="scan" options={{ headerShown: false, title: 'Scan QR' }} />
        <Stack.Screen name="export" options={{ headerShown: false, title: 'Export Data' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
