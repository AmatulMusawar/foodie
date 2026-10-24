import { CATEGORY_ORDER } from '../constants';
import { metaForMeal } from '../utils/recipes';

const BASE = 'https://www.themealdb.com/api/json/v1/1';
const detailCache = new Map();

async function getJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error('Request failed');
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export function sortCategories(categories) {
  return [...categories].sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a.strCategory);
    const bIndex = CATEGORY_ORDER.indexOf(b.strCategory);
    const aRank = aIndex === -1 ? CATEGORY_ORDER.length : aIndex;
    const bRank = bIndex === -1 ? CATEGORY_ORDER.length : bIndex;
    if (aRank !== bRank) return aRank - bRank;
    return a.strCategory.localeCompare(b.strCategory);
  });
}

export function normalizeSummary(meal, category) {
  return {
    id: String(meal.idMeal),
    name: meal.strMeal,
    image: meal.strMealThumb,
    category: category || meal.strCategory,
  };
}

export function normalizeMeal(meal) {
  const ingredients = [];

  for (let index = 1; index <= 20; index += 1) {
    const ingredient = meal[`strIngredient${index}`];
    const measure = meal[`strMeasure${index}`];
    if (ingredient && ingredient.trim()) {
      const line = `${measure ? measure.trim() : ''} ${ingredient.trim()}`
        .trim()
        .replace(/\s+/g, ' ');
      ingredients.push(line);
    }
  }

  return {
    id: String(meal.idMeal),
    name: meal.strMeal,
    category: meal.strCategory,
    area: meal.strArea || 'International',
    instructions: (meal.strInstructions || '').replace(/\r\n/g, '\n').trim(),
    image: meal.strMealThumb,
    ingredients,
    ...metaForMeal(meal.idMeal, meal.strMeal),
    isUserRecipe: false,
  };
}

export async function fetchCategories() {
  const data = await getJson(`${BASE}/categories.php`);
  return data.categories || [];
}

export async function fetchMealsByCategory(category) {
  const data = await getJson(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
  return (data.meals || []).map((meal) => normalizeSummary(meal, category));
}

export async function fetchMealDetail(id) {
  const key = String(id);
  if (detailCache.has(key)) return detailCache.get(key);

  const data = await getJson(`${BASE}/lookup.php?i=${encodeURIComponent(key)}`);
  const meal = data.meals?.[0];
  if (!meal) {
    throw new Error('Recipe not found');
  }

  const normalized = normalizeMeal(meal);
  detailCache.set(key, normalized);
  return normalized;
}
