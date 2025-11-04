export type RootStackParamList = {
  Home: undefined; 

  Details: { itemId: number };

  TapNumberGame: undefined;

  TeacherCreate: undefined;

  
  // Resto de rutas
};

// 2. Definir el tipo para el objeto 'navigation'
// Esto crea el tipo que se usará para navegar DESDE cualquier pantalla.
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;