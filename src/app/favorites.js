import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { useRecipes } from '../context/RecipeContext';
import { cardShadow, colors, fonts } from '../theme';
import { useGoBack } from '../utils/navigation';

export default function FavoritesScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { favorites, ready } = useRecipes();

  return (
    <Screen>
      <StatusBar style="dark" />
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.actions}>
              <PrimaryButton label="Back to Home" variant="dark" onPress={goBack} />
            </View>
            <Text style={styles.title}>My Favorite Recipes</Text>
          </View>
        }
        ListEmptyComponent={
          ready ? (
            <Text style={styles.empty}>No favorite recipes yet. Open a recipe and tap the heart.</Text>
          ) : (
            <ActivityIndicator color={colors.orange} style={styles.loader} />
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => router.push(`/recipe/${encodeURIComponent(item.id)}`)}
          >
            <Image source={{ uri: item.image }} style={styles.thumb} />
            <View style={styles.copy}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: 28,
  },
  actions: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    fontFamily: fonts.extra,
    fontSize: 28,
    color: colors.ink,
    marginTop: 22,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
    gap: 12,
    ...cardShadow,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#EEEEEE',
  },
  copy: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#4B5563',
  },
  category: {
    marginTop: 4,
    color: colors.faint,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  empty: {
    textAlign: 'center',
    color: colors.faint,
    fontFamily: fonts.semibold,
    marginTop: 12,
    marginHorizontal: 28,
    lineHeight: 22,
  },
  loader: {
    marginTop: 24,
  },
});
