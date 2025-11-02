export type RootStackParamList = {
  Home: undefined; 

  Details: { itemId: number };

  TapNumberGame: undefined;

  SequenceGame: undefined;

  
  // Resto de rutas
};

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;