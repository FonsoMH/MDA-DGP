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
    { key: 'apple', label: 'Manzana', image: require('../../assets/Passwordicons/manzana.png')},
    { key: 'dice', label: 'Dado', image: require('../../assets/Passwordicons/dado.png')},
    { key: 'lion', label: 'Leon', image: require('../../assets/Passwordicons/león.png')},
    { key: 'rocket', label: 'Cohete', image: require('../../assets/Passwordicons/cohete.png')},
    { key: 'flower', label: 'Flor', image: require('../../assets/Passwordicons/flor.png')},
    { key: 'train', label: 'Tren', image: require('../../assets/Passwordicons/tren.png')},
    { key: 'monopatin', label: 'Monopatín', image: require('../../assets/Passwordicons/monopatín.png')},
    { key: 'bear', label: 'OsoDePeluche', image: require('../../assets/Passwordicons/oso.png')},
    { key: 'roller-skate', label: 'Patines', image: require('../../assets/Passwordicons/patines.png')},
    { key: 'ball', label: 'Pelota', image: require('../../assets/Passwordicons/pelota.png')},
    { key: 'gift', label: 'Regalo', image: require('../../assets/Passwordicons/regalo.png')},
    { key: 'star', label: 'Estrella', image: require('../../assets/Passwordicons/estrella.png')},
];
