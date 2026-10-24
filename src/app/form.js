import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import PrimaryButton from '../components/PrimaryButton';
import Screen from '../components/Screen';
import { DIFFICULTIES, RECIPE_CATEGORIES } from '../constants';
import { useRecipes } from '../context/RecipeContext';
import { colors, fonts } from '../theme';
import { notify } from '../utils/dialog';
import { useGoBack } from '../utils/navigation';
import { buildUserRecipe } from '../utils/recipes';

function Field({ label, value, onChangeText, placeholder, multiline, keyboardType }) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#B0B7C0"
        multiline={multiline}
        keyboardType={keyboardType}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.input, multiline && styles.multiline, focused && styles.inputFocused]}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
  );
}

function ChoiceRow({ options, value, onChange }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choices}>
      {options.map((option) => {
        const active = option === value;
        return (
          <TouchableOpacity
            key={option}
            accessibilityRole="button"
            onPress={() => onChange(option)}
            style={[styles.choice, active && styles.choiceActive]}
          >
            <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default function RecipeFormScreen() {
  const router = useRouter();
  const goBack = useGoBack();
  const params = useLocalSearchParams();
  const recipeId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { userRecipes, ready, addRecipe, updateRecipe } = useRecipes();
  const existing = userRecipes.find((recipe) => recipe.id === recipeId);
  const hydrated = useRef(false);

  const [name, setName] = useState(existing?.name || '');
  const [image, setImage] = useState(existing?.image || '');
  const [ingredients, setIngredients] = useState(existing?.ingredients?.join('\n') || '');
  const [steps, setSteps] = useState(existing?.instructions || '');
  const [category, setCategory] = useState(existing?.category || 'Beef');
  const [difficulty, setDifficulty] = useState(existing?.difficulty || 'Medium');
  const [time, setTime] = useState(existing ? String(existing.time) : '35');
  const [servings, setServings] = useState(existing ? String(existing.servings) : '3');
  const [calories, setCalories] = useState(existing ? String(existing.calories) : '250');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existing || hydrated.current) return;
    hydrated.current = true;
    setName(existing.name);
    setImage(existing.image);
    setIngredients(existing.ingredients.join('\n'));
    setSteps(existing.instructions);
    setCategory(existing.category);
    setDifficulty(existing.difficulty);
    setTime(String(existing.time));
    setServings(String(existing.servings));
    setCalories(String(existing.calories));
  }, [existing]);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        notify('Permission required', 'Allow photo access to upload a picture of your dish.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: Platform.OS !== 'web',
      aspect: [4, 3],
      quality: 0.35,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    if (asset.base64) {
      const mime = asset.mimeType || 'image/jpeg';
      setImage(`data:${mime};base64,${asset.base64}`);
      return;
    }

    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      setImage(dataUrl);
    } catch {
      setImage(asset.uri);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      notify('Missing name', 'Give your recipe a name.');
      return;
    }
    if (!image) {
      notify('Missing photo', 'Upload a picture of your dish.');
      return;
    }
    if (!ingredients.trim()) {
      notify('Missing ingredients', 'Add at least one ingredient.');
      return;
    }
    if (!steps.trim()) {
      notify('Missing steps', 'Describe how to make the dish.');
      return;
    }

    const recipe = buildUserRecipe(
      { name, image, ingredients, steps, category, difficulty, time, servings, calories },
      existing?.id
    );

    setSaving(true);
    if (existing) await updateRecipe(recipe);
    else await addRecipe(recipe);
    setSaving(false);
    if (router.canGoBack()) router.back();
    else router.replace('/my-food');
  };

  if (recipeId && ready && !existing) {
    return (
      <Screen>
        <StatusBar style="dark" />
        <View style={styles.missing}>
          <PrimaryButton label="Back" variant="dark" onPress={goBack} />
          <Text style={styles.missingText}>This recipe could not be found.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <PrimaryButton label="Back" variant="dark" onPress={goBack} />
          <Text style={styles.title}>{existing ? 'Edit Recipe' : 'Add New Recipe'}</Text>

          <Field label="Recipe name" value={name} onChangeText={setName} placeholder="Pizza" />

          <Text style={styles.fieldLabel}>Photo</Text>
          <TouchableOpacity accessibilityRole="button" activeOpacity={0.85} onPress={pickImage} style={styles.photo}>
            {image ? (
              <Image source={{ uri: image }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoEmpty}>
                <Ionicons name="image-outline" size={32} color={colors.muted} />
                <Text style={styles.photoText}>Upload a photo of your dish</Text>
              </View>
            )}
          </TouchableOpacity>
          {image ? (
            <TouchableOpacity onPress={pickImage}>
              <Text style={styles.changePhoto}>Change photo</Text>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.fieldLabel}>Category</Text>
          <ChoiceRow options={RECIPE_CATEGORIES} value={category} onChange={setCategory} />

          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Field
                label="Minutes"
                value={time}
                onChangeText={(value) => setTime(value.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="35"
              />
            </View>
            <View style={styles.metric}>
              <Field
                label="Servings"
                value={servings}
                onChangeText={(value) => setServings(value.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="3"
              />
            </View>
            <View style={styles.metric}>
              <Field
                label="Calories"
                value={calories}
                onChangeText={(value) => setCalories(value.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="250"
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Difficulty</Text>
          <ChoiceRow options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />

          <Field
            label="Ingredients"
            value={ingredients}
            onChangeText={setIngredients}
            multiline
            placeholder={'1kg Beef\n2 tbs Plain Flour\n2 tbs Rapeseed Oil'}
          />
          <Field
            label="Steps"
            value={steps}
            onChangeText={setSteps}
            multiline
            placeholder="To make pizza, start by activating 2 1/4 teaspoons of active dry yeast..."
          />

          <PrimaryButton
            label="Save Recipe"
            onPress={save}
            loading={saving}
            style={styles.save}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  title: {
    marginTop: 18,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: fonts.extra,
    fontSize: 26,
    color: colors.ink,
  },
  field: {
    marginTop: 12,
  },
  fieldLabel: {
    marginTop: 14,
    marginBottom: 8,
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
  },
  multiline: {
    minHeight: 96,
  },
  inputFocused: {
    borderColor: colors.orange,
  },
  photo: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    minHeight: 180,
  },
  photoImage: {
    width: '100%',
    height: 200,
  },
  photoEmpty: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoText: {
    color: colors.muted,
    fontFamily: fonts.semibold,
  },
  changePhoto: {
    marginTop: 8,
    color: colors.orange,
    fontFamily: fonts.bold,
  },
  choices: {
    gap: 8,
    paddingBottom: 4,
  },
  choice: {
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.line,
  },
  choiceActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  choiceText: {
    color: colors.text,
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  choiceTextActive: {
    color: '#FFFFFF',
  },
  metrics: {
    flexDirection: 'row',
    gap: 8,
  },
  metric: {
    flex: 1,
  },
  save: {
    marginTop: 20,
  },
  missing: {
    padding: 16,
    gap: 16,
  },
  missingText: {
    textAlign: 'center',
    color: colors.muted,
    fontFamily: fonts.semibold,
  },
});
