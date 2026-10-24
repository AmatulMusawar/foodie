import Ionicons from '@expo/vector-icons/Ionicons';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

import { RecipeProvider } from '../context/RecipeContext';
import { colors } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    PlayfairDisplay_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return <View style={styles.boot} />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.device}>
        <RecipeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="index" options={{ animation: 'fade' }} />
          </Stack>
        </RecipeProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.yellow,
  },
  root: {
    flex: 1,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    ...Platform.select({
      web: { minHeight: '100vh' },
    }),
  },
  device: {
    flex: 1,
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
});
