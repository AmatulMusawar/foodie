import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { fetchCategories, fetchMealsByCategory, sortCategories } from '../api/meals';
import CategoryBar from '../components/CategoryBar';
import RecipeCard from '../components/RecipeCard';
import Screen from '../components/Screen';
import { useRecipes } from '../context/RecipeContext';
import { colors, fonts } from '../theme';

function HomeHeader({
  categories,
  selected,
  categoryError,
  error,
  loading,
  onSelect,
  onMyFood,
  onFavorites,
  onRetryCategories,
  onRetryMeals,
}) {
  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={22} color={colors.avatarIcon} />
        </View>
        <View style={styles.helloPill}>
          <Text style={styles.hello}>Hello, User!</Text>
        </View>
      </View>

      <Text style={styles.headline}>
        Make your own food,{'\n'}stay at <Text style={styles.homeWord}>home</Text>
      </Text>

      {categoryError ? (
        <TouchableOpacity onPress={onRetryCategories} style={styles.retry}>
          <Text style={styles.retryText}>{categoryError} Tap to retry.</Text>
        </TouchableOpacity>
      ) : (
        <CategoryBar
          categories={categories}
          selected={selected}
          onSelect={onSelect}
          onMyFood={onMyFood}
          onFavorites={onFavorites}
        />
      )}

      <View style={styles.sectionRow}>
        <Text style={styles.section}>Recipes</Text>
        {loading ? <ActivityIndicator color={colors.orange} /> : null}
      </View>
      {error ? (
        <TouchableOpacity onPress={onRetryMeals}>
          <Text style={styles.retryText}>{error} Tap to retry.</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { userRecipes } = useRecipes();
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState('Beef');
  const [apiMeals, setApiMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [categoryToken, setCategoryToken] = useState(0);
  const [mealToken, setMealToken] = useState(0);

  const pageWidth = Math.min(width, 440);
  const cardWidth = (pageWidth - 32 - 12) / 2;

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const nextCategories = sortCategories(await fetchCategories());
        if (cancelled) return;
        setCategories(nextCategories);
        setCategoryError('');
        setSelected((current) => {
          if (nextCategories.some((category) => category.strCategory === current)) return current;
          return (
            nextCategories.find((category) => category.strCategory === 'Beef')?.strCategory ||
            nextCategories[0]?.strCategory ||
            current
          );
        });
      } catch {
        if (!cancelled) setCategoryError('Could not load categories.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [categoryToken]);

  useEffect(() => {
    if (!selected) return undefined;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError('');
      setApiMeals([]);
      try {
        const meals = await fetchMealsByCategory(selected);
        if (!cancelled) setApiMeals(meals);
      } catch {
        if (!cancelled) {
          setApiMeals([]);
          setError('Could not load recipes.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selected, mealToken]);

  const recipes = useMemo(() => {
    const mine = userRecipes.filter((recipe) => recipe.category === selected);
    const mineIds = new Set(mine.map((recipe) => recipe.id));
    return [...mine, ...apiMeals.filter((meal) => !mineIds.has(meal.id))];
  }, [userRecipes, apiMeals, selected]);

  const openRecipe = (id) => {
    router.push(`/recipe/${encodeURIComponent(id)}`);
  };

  return (
    <Screen background={colors.card}>
      <StatusBar style="dark" />
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            tintColor={colors.orange}
            colors={[colors.orange]}
            onRefresh={() => {
              setRefreshing(true);
              setMealToken((token) => token + 1);
            }}
          />
        }
        ListHeaderComponent={
          <HomeHeader
            categories={categories}
            selected={selected}
            categoryError={categoryError}
            error={error}
            loading={loading}
            onSelect={setSelected}
            onMyFood={() => router.push('/my-food')}
            onFavorites={() => router.push('/favorites')}
            onRetryCategories={() => setCategoryToken((token) => token + 1)}
            onRetryMeals={() => setMealToken((token) => token + 1)}
          />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.orange} style={styles.loader} />
          ) : (
            <Text style={styles.empty}>No recipes in this category yet.</Text>
          )
        }
        renderItem={({ item }) => (
          <RecipeCard recipe={item} width={cardWidth} onPress={() => openRecipe(item.id)} />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 8,
  },
  topRow: {
    paddingHorizontal: 16,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.avatar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helloPill: {
    backgroundColor: colors.pill,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  hello: {
    color: colors.muted,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  headline: {
    marginTop: 18,
    marginHorizontal: 16,
    marginBottom: 18,
    color: colors.text,
    fontFamily: fonts.extra,
    fontSize: 30,
    lineHeight: 36,
  },
  homeWord: {
    color: colors.orange,
  },
  sectionRow: {
    marginTop: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: {
    fontFamily: fonts.extra,
    fontSize: 22,
    color: colors.ink,
  },
  column: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  list: {
    paddingBottom: 28,
  },
  loader: {
    marginTop: 24,
  },
  empty: {
    textAlign: 'center',
    color: colors.faint,
    fontFamily: fonts.semibold,
    marginTop: 12,
    marginHorizontal: 24,
  },
  retry: {
    marginHorizontal: 16,
  },
  retryText: {
    color: colors.orange,
    fontFamily: fonts.semibold,
    marginHorizontal: 16,
    marginBottom: 8,
  },
});
