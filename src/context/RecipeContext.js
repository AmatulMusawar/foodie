import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { notify } from '../utils/dialog';

const RECIPES_KEY = '@foodie/userRecipes';
const FAVORITES_KEY = '@foodie/favorites';

const RecipeContext = createContext(null);

function readList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function persist(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    notify(
      'Save failed',
      'There is not enough space to store this change. Try a smaller photo.'
    );
    return false;
  }
}

export function RecipeProvider({ children }) {
  const [userRecipes, setUserRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [storedRecipes, storedFavorites] = await Promise.all([
          AsyncStorage.getItem(RECIPES_KEY),
          AsyncStorage.getItem(FAVORITES_KEY),
        ]);
        if (cancelled) return;
        setUserRecipes(readList(storedRecipes));
        setFavorites(readList(storedFavorites));
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const addRecipe = useCallback(async (recipe) => {
    let next = [];
    setUserRecipes((current) => {
      next = [recipe, ...current];
      return next;
    });
    await persist(RECIPES_KEY, next);
  }, []);

  const updateRecipe = useCallback(async (recipe) => {
    let nextRecipes = [];
    let nextFavorites = [];

    setUserRecipes((current) => {
      nextRecipes = current.map((item) => (item.id === recipe.id ? recipe : item));
      return nextRecipes;
    });
    setFavorites((current) => {
      nextFavorites = current.map((item) => (item.id === recipe.id ? recipe : item));
      return nextFavorites;
    });

    await AsyncStorage.multiSet([
      [RECIPES_KEY, JSON.stringify(nextRecipes)],
      [FAVORITES_KEY, JSON.stringify(nextFavorites)],
    ]).catch(() => {
      notify('Save failed', 'The recipe could not be updated on this device.');
    });
  }, []);

  const deleteRecipe = useCallback(async (id) => {
    let nextRecipes = [];
    let nextFavorites = [];

    setUserRecipes((current) => {
      nextRecipes = current.filter((item) => item.id !== id);
      return nextRecipes;
    });
    setFavorites((current) => {
      nextFavorites = current.filter((item) => item.id !== id);
      return nextFavorites;
    });

    await AsyncStorage.multiSet([
      [RECIPES_KEY, JSON.stringify(nextRecipes)],
      [FAVORITES_KEY, JSON.stringify(nextFavorites)],
    ]).catch(() => {
      notify('Delete failed', 'The recipe could not be removed from this device.');
    });
  }, []);

  const toggleFavorite = useCallback(async (recipe) => {
    let next = [];
    setFavorites((current) => {
      const exists = current.some((item) => item.id === recipe.id);
      next = exists ? current.filter((item) => item.id !== recipe.id) : [recipe, ...current];
      return next;
    });
    await persist(FAVORITES_KEY, next);
  }, []);

  const isFavorite = useCallback(
    (id) => favorites.some((item) => item.id === id),
    [favorites]
  );

  const value = useMemo(
    () => ({
      ready,
      userRecipes,
      favorites,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      toggleFavorite,
      isFavorite,
    }),
    [
      ready,
      userRecipes,
      favorites,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      toggleFavorite,
      isFavorite,
    ]
  );

  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}

export function useRecipes() {
  const value = useContext(RecipeContext);
  if (!value) {
    throw new Error('useRecipes must be used within RecipeProvider');
  }
  return value;
}
