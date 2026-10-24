import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { useRecipes } from '../context/RecipeContext';
import { cardShadow, colors, fonts } from '../theme';
import { confirmAction } from '../utils/dialog';
import { useGoBack } from '../utils/navigation';

function MyRecipeCard({ recipe, onOpen, onEdit, onDelete }) {
  const ingredientPreview = recipe.ingredients.join(', ');

  return (
    <View style={styles.card}>
      <TouchableOpacity accessibilityRole="button" activeOpacity={0.85} onPress={onOpen}>
        <Image source={{ uri: recipe.image }} style={styles.image} />
        <Text style={styles.name}>{recipe.name}</Text>
      </TouchableOpacity>
      <Text numberOfLines={1} style={styles.preview}>
        {ingredientPreview}
      </Text>
      <Text numberOfLines={2} style={styles.preview}>
        {recipe.instructions}
      </Text>
      <View style={styles.row}>
        <PrimaryButton label="Edit" variant="mint" onPress={onEdit} style={styles.half} />
        <PrimaryButton label="Delete" variant="danger" onPress={onDelete} style={styles.half} />
      </View>
    </View>
  );
}

export default function MyFoodScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const { userRecipes, ready, deleteRecipe } = useRecipes();

  const confirmDelete = (recipe) => {
    confirmAction(
      'Delete recipe',
      `Remove "${recipe.name}" from My Food?`,
      'Delete',
      () => deleteRecipe(recipe.id)
    );
  };

  return (
    <Screen>
      <StatusBar style="dark" />
      <FlatList
        data={userRecipes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.actions}>
            <PrimaryButton label="Back to Home" variant="dark" onPress={goBack} />
            <PrimaryButton label="Add New Recipe" onPress={() => router.push('/form')} />
          </View>
        }
        ListEmptyComponent={
          ready ? (
            <Text style={styles.empty}>No recipes added yet.</Text>
          ) : (
            <ActivityIndicator color={colors.orange} style={styles.loader} />
          )
        }
        renderItem={({ item }) => (
          <MyRecipeCard
            recipe={item}
            onOpen={() => router.push(`/recipe/${encodeURIComponent(item.id)}`)}
            onEdit={() => router.push({ pathname: '/form', params: { id: item.id } })}
            onDelete={() => confirmDelete(item)}
          />
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
    gap: 12,
  },
  empty: {
    textAlign: 'center',
    color: colors.faint,
    fontFamily: fonts.semibold,
    fontSize: 15,
    marginTop: 28,
  },
  loader: {
    marginTop: 28,
  },
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    padding: 12,
    ...cardShadow,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    backgroundColor: '#EEEEEE',
  },
  name: {
    marginTop: 12,
    fontFamily: fonts.extra,
    fontSize: 20,
    color: colors.ink,
  },
  preview: {
    marginTop: 4,
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  half: {
    flex: 1,
  },
});
