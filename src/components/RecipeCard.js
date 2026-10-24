import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { colors, fonts } from '../theme';

export default function RecipeCard({ recipe, width, onPress }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={recipe.name}
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, { width }]}
    >
      <Image source={{ uri: recipe.image }} style={styles.image} />
      <Text numberOfLines={2} style={styles.name}>
        {recipe.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 4,
  },
  image: {
    width: '100%',
    height: 158,
    borderRadius: 16,
    backgroundColor: '#EEEEEE',
  },
  name: {
    marginTop: 8,
    minHeight: 36,
    fontSize: 13,
    lineHeight: 18,
    color: colors.faint,
    fontFamily: fonts.semibold,
  },
});
