import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { MY_FOOD_IMAGE } from '../constants';
import { colors, fonts } from '../theme';

function CategoryItem({ label, image, heart, ring, selected, onPress }) {
  const ringStyle =
    ring === 'green' ? styles.greenRing : selected ? styles.orangeRing : styles.idleRing;

  return (
    <TouchableOpacity accessibilityRole="button" activeOpacity={0.8} onPress={onPress} style={styles.item}>
      <View style={[styles.circle, ringStyle, heart && styles.heartCircle]}>
        {heart ? (
          <Ionicons name="heart" size={30} color={colors.green} />
        ) : (
          <Image source={{ uri: image }} style={styles.image} />
        )}
      </View>
      <Text numberOfLines={1} style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function CategoryBar({ categories, selected, onSelect, onMyFood, onFavorites }) {
  return (
    <ScrollView
      horizontal
      nestedScrollEnabled
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      <CategoryItem label="My Food" image={MY_FOOD_IMAGE} ring="green" onPress={onMyFood} />
      <CategoryItem label="My Favorites" heart ring="green" onPress={onFavorites} />
      {categories.map((category) => (
        <CategoryItem
          key={category.idCategory || category.strCategory}
          label={category.strCategory}
          image={category.strCategoryThumb}
          selected={selected === category.strCategory}
          onPress={() => onSelect(category.strCategory)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 8,
  },
  item: {
    width: 78,
    alignItems: 'center',
  },
  circle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  heartCircle: {
    backgroundColor: '#F3FFF7',
  },
  greenRing: {
    borderColor: colors.green,
  },
  orangeRing: {
    borderColor: colors.orange,
  },
  idleRing: {
    borderColor: '#E6E8EC',
  },
  label: {
    marginTop: 6,
    width: 76,
    textAlign: 'center',
    fontSize: 11,
    color: colors.muted,
    fontFamily: fonts.semibold,
  },
  labelSelected: {
    color: colors.orange,
    fontFamily: fonts.bold,
  },
});
