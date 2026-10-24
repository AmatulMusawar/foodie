import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { fetchMealDetail } from '../../api/meals';
import PrimaryButton from '../../components/PrimaryButton';
import Screen from '../../components/Screen';
import { useRecipes } from '../../context/RecipeContext';
import { colors, fonts } from '../../theme';
import { useGoBack } from '../../utils/navigation';
import { instructionSteps, padCount } from '../../utils/recipes';

function StatCard({ icon, color, label }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function RecipeDetailScreen() {
  const params = useLocalSearchParams();
  const recipeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const goBack = useGoBack();
  const { userRecipes, favorites, isFavorite, toggleFavorite } = useRecipes();
  const userRecipe = userRecipes.find((recipe) => recipe.id === recipeId);
  const savedRecipe = favorites.find((recipe) => recipe.id === recipeId);
  const savedRef = useRef(savedRecipe);
  savedRef.current = savedRecipe;

  const [recipe, setRecipe] = useState(userRecipe || savedRecipe || null);
  const [loading, setLoading] = useState(!userRecipe);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userRecipe) {
      setRecipe(userRecipe);
      setLoading(false);
      setError('');
      return undefined;
    }

    let cancelled = false;
    setRecipe(savedRef.current || null);
    setLoading(!savedRef.current);
    setError('');

    fetchMealDetail(recipeId)
      .then((meal) => {
        if (!cancelled) setRecipe(meal);
      })
      .catch(() => {
        if (cancelled) return;
        if (savedRef.current) setRecipe(savedRef.current);
        else setError('Could not load this recipe.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [recipeId, userRecipe]);

  useEffect(() => {
    if (!recipe && savedRecipe) setRecipe(savedRecipe);
  }, [recipe, savedRecipe]);

  const favorite = isFavorite(recipeId);
  const steps = instructionSteps(recipe?.instructions);

  return (
    <Screen background={colors.card}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {!recipe && (loading || error) ? (
          <View style={styles.fallback}>
            <PrimaryButton label="Back" variant="dark" onPress={goBack} />
            {loading ? <ActivityIndicator color={colors.orange} style={styles.loader} /> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        ) : null}

        {recipe ? (
          <View>
            <View style={styles.heroWrap}>
              <Image source={{ uri: recipe.image }} style={styles.hero} />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Back"
                onPress={goBack}
                style={styles.backPill}
              >
                <Ionicons name="arrow-back" size={16} color={colors.ink} />
                <Text style={styles.backText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={favorite ? 'Remove from favorites' : 'Add to favorites'}
                onPress={() => toggleFavorite(recipe)}
                style={styles.heartButton}
              >
                <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={colors.heart} />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>{recipe.name}</Text>
            <Text style={styles.subtitle}>
              {recipe.category} | {recipe.area}
            </Text>

            <View style={styles.stats}>
              <StatCard icon="time-outline" color={colors.muted} label={`${recipe.time} Mins`} />
              <StatCard icon="people" color={colors.purple} label={`${padCount(recipe.servings)} Servings`} />
              <StatCard icon="flame" color={colors.flame} label={`${recipe.calories} Cal`} />
              <StatCard icon="bar-chart" color={colors.blue} label={recipe.difficulty} />
            </View>

            <Text style={styles.section}>Ingredients</Text>
            {recipe.ingredients.map((item, index) => (
              <View key={`${item}-${index}`} style={styles.ingredient}>
                <View style={styles.dot} />
                <Text style={styles.ingredientText}>{item}</Text>
              </View>
            ))}

            <Text style={styles.section}>Instructions</Text>
            {steps.map((step, index) => (
              <View key={`${index}-${step.slice(0, 24)}`} style={styles.step}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 36,
  },
  fallback: {
    padding: 16,
  },
  loader: {
    marginTop: 28,
  },
  error: {
    marginTop: 16,
    textAlign: 'center',
    color: colors.muted,
    fontFamily: fonts.semibold,
  },
  heroWrap: {
    marginTop: 8,
    marginHorizontal: 16,
  },
  hero: {
    width: '100%',
    height: 240,
    borderRadius: 22,
    backgroundColor: '#EEEEEE',
  },
  backPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  heartButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 20,
    marginHorizontal: 20,
    textAlign: 'center',
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.ink,
  },
  subtitle: {
    marginTop: 6,
    textAlign: 'center',
    color: colors.faint,
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    marginHorizontal: 16,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.stat,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 6,
    minHeight: 78,
  },
  statLabel: {
    textAlign: 'center',
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 11,
  },
  section: {
    marginTop: 22,
    marginBottom: 12,
    marginHorizontal: 16,
    fontFamily: fonts.extra,
    fontSize: 22,
    color: colors.ink,
  },
  ingredient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cream,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.dot,
  },
  ingredientText: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  step: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  stepBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  stepText: {
    flex: 1,
    color: colors.text,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
});
