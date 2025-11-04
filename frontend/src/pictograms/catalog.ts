// Catalog of pictograms to use in the UI.
// You can replace the `emoji` source with image assets from `assets/pictograms` using require.
// Example for assets:
//   image: require('../../assets/pictograms/apple.png') as const
// In React Native, dynamic require is not allowed. Keep this mapping static.

import { ImageSourcePropType } from 'react-native';

export type Pictogram = {
  key: string;           // unique key. If you use images, prefer an id/slug here
  label?: string;        // optional accessible label
  emoji?: string;        // emoji fallback representation for development
  image?: ImageSourcePropType; // pictogram image asset
};

export const PICTOGRAMS: Pictogram[] = [
    { key: 'apple', label: 'Manzana', image: require('../../assets/Passwordicons/apple.png')},
    { key: 'book', label: 'Libro', image: require('../../assets/Passwordicons/book.png')},
    { key: 'car', label: 'Coche', image: require('../../assets/Passwordicons/car.png')},
    { key: 'dog', label: 'Perro', image: require('../../assets/Passwordicons/dog.png')},
    { key: 'house', label: 'Casa', image: require('../../assets/Passwordicons/house.png')},
    { key: 'music', label: 'Música', image: require('../../assets/Passwordicons/music.png')},
    { key: 'paint', label: 'Pintura', image: require('../../assets/Passwordicons/paint.png')},
    { key: 'ball', label: 'Pelota', image: require('../../assets/Passwordicons/ball.png')},
    { key: 'star', label: 'Estrella', image: require('../../assets/Passwordicons/star.png')},
    { key: 'tree', label: 'Árbol', image: require('../../assets/Passwordicons/tree.png')},
  ];