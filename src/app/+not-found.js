import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { colors, fonts } from '../theme';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.title}>Page not found</Text>
        <PrimaryButton label="Back to Home" variant="dark" onPress={() => router.replace('/home')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    padding: 16,
    gap: 16,
  },
  title: {
    textAlign: 'center',
    marginTop: 24,
    fontFamily: fonts.extra,
    fontSize: 24,
    color: colors.ink,
  },
});
