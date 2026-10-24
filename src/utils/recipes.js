import { DIFFICULTIES } from '../constants';

const NAMED_META = {
  'Beef and Mustard Pie': {
    time: 35,
    servings: 3,
    calories: 103,
    difficulty: 'Medium',
  },
};

function clamp(value, min, max, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function metaForMeal(id, name) {
  if (NAMED_META[name]) return NAMED_META[name];

  const seed = Number(String(id).replace(/\D/g, '')) || 1;
  const times = [20, 25, 30, 35, 40, 45, 50, 60, 75];
  const servings = [2, 2, 3, 4, 4, 6];
  const calories = [220, 280, 340, 410, 480, 560, 640];

  return {
    time: times[seed % times.length],
    servings: servings[seed % servings.length],
    calories: calories[seed % calories.length],
    difficulty: DIFFICULTIES[seed % DIFFICULTIES.length],
  };
}

export function parseIngredientLines(text) {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const lines = trimmed
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 1 && lines[0].includes(',')) {
    return lines[0]
      .split(',')
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return lines;
}

export function instructionSteps(instructions) {
  if (!instructions) return [];

  const normalized = instructions.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  let parts = normalized
    .split(/\n+/)
    .map((step) => step.trim())
    .filter(Boolean);

  if (parts.length === 1 && parts[0].includes('. ')) {
    const sentences = parts[0].split('. ');
    parts = sentences
      .map((sentence, index) => {
        const text = sentence.trim();
        if (!text) return '';
        const needsPeriod = index < sentences.length - 1 && !/[.!?]$/.test(text);
        return needsPeriod ? `${text}.` : text;
      })
      .filter(Boolean);
  }

  return parts.map((step) => step.replace(/^\d+[.)]\s*/, ''));
}

export function buildUserRecipe(input, existingId) {
  return {
    id: existingId || `user-${Date.now()}`,
    name: input.name.trim(),
    category: input.category,
    area: 'Homemade',
    instructions: input.steps.trim(),
    image: input.image,
    ingredients: parseIngredientLines(input.ingredients),
    time: clamp(parseInt(input.time, 10), 1, 300, 30),
    servings: clamp(parseInt(input.servings, 10), 1, 24, 2),
    calories: clamp(parseInt(input.calories, 10), 1, 5000, 250),
    difficulty: input.difficulty,
    isUserRecipe: true,
  };
}

export function padCount(value) {
  return String(value).padStart(2, '0');
}
