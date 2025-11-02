// Catalog of pictograms to use in the UI.
// You can replace the `emoji` source with image assets from `assets/pictograms` using require.
// Example for assets:
//   image: require('../../assets/pictograms/apple.png') as const
// In React Native, dynamic require is not allowed. Keep this mapping static.

import { ImageSourcePropType } from 'react-native';

export type Pictogram = {
  key: string;           // unique key. If you use images, prefer an id/slug here
  label?: string;        // optional accessible label
  emoji?: string;        // emoji fallback for quick prototyping
  image?: ImageSourcePropType; // optional asset image
};

export const PICTOGRAMS: Pictogram[] = [
  { key: 'apple', label: 'Manzana', emoji: '🍎' },
  { key: 'sun', label: 'Sol', emoji: '☀️' },
  { key: 'car', label: 'Coche', emoji: '🚗' },
  { key: 'rainbow', label: 'Arcoíris', emoji: '🌈' },
  { key: 'cat', label: 'Gato', emoji: '🐱' },
  { key: 'dog', label: 'Perro', emoji: '🐶' },
  { key: 'ball', label: 'Pelota', emoji: '⚽' },
  { key: 'book', label: 'Libro', emoji: '📘' },
  { key: 'rocket', label: 'Cohete', emoji: '🚀' },
  { key: 'flower', label: 'Flor', emoji: '🌸' },
  { key: 'train', label: 'Tren', emoji: '🚆' },
  { key: 'puzzle', label: 'Puzzle', emoji: '🧩' },
];
