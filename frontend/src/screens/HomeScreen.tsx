import * as React from 'react';
import { View, Text, Button } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeProps) { 
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>¡Bienvenido!</Text>
      <Button
        title="Ver juegos disponibles"
        onPress={() => navigation.navigate('GameMenu')}
      />
      <Button
        title="Ir a Detalles del Producto (ID 42)"
        onPress={() => navigation.navigate('Details', { itemId: 42 })} 
      />
      <Button
        title="Intentar ir a Details sin parámetro"
      />
    </View>
  );
}