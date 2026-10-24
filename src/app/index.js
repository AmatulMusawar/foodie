import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '../theme';

export default function SplashScreen() {
  const router = useRouter();
  const left = useRef(false);

  const leave = () => {
    if (left.current) return;
    left.current = true;
    router.replace('/home');
  };

  useEffect(() => {
    const timer = setTimeout(leave, 2400);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <Pressable accessibilityRole="button" accessibilityLabel="Open Foodie" onPress={leave} style={styles.fill}>
        <View style={styles.spacer} />
        <View style={styles.hero}>
          <View style={styles.ringOuter} />
          <View style={styles.ringInner} />
          <Image source={require('../../assets/splash-pizza.jpg')} style={styles.pizza} />
        </View>
        <Text style={styles.title}>Foodie</Text>
        <Text style={styles.subtitle}>your food recipe app</Text>
        <View style={styles.spacerLarge} />
        <Text style={styles.hint}>Tap to continue</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.yellow,
  },
  fill: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  spacer: {
    flex: 1,
  },
  spacerLarge: {
    flex: 1.25,
  },
  hero: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  ringInner: {
    position: 'absolute',
    width: 206,
    height: 206,
    borderRadius: 103,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  pizza: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E8A800',
  },
  title: {
    marginTop: 28,
    color: '#FFFFFF',
    fontFamily: fonts.extra,
    fontSize: 48,
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.94)',
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  hint: {
    marginBottom: 12,
    color: 'rgba(255,255,255,0.82)',
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
});
