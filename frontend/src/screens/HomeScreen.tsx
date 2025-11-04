import * as React from 'react';
import { View, Text, Button } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

console.log("API base url:", process.env.REACT_APP_API_BASE_URL);

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeProps) { 
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>¡Bienvenido!</Text>
      <Button
        title="Ir a Detalles del Producto (ID 42)"
        onPress={() => navigation.navigate('Details', { itemId: 42 })} 
      />
      <Button
        title="Ir a Juego 1"
        onPress={() => navigation.navigate('TapNumberGame')} 
      />
      <Button
        title="Intentar ir a Details sin parámetro"
      />
      <Button
        title="Crear Nuevo Estudiante"
        onPress={() => navigation.navigate('CreateStudent')} 
      />
      <Button
        title="Ver Usuarios de Prueba"
        onPress={() => navigation.navigate('TestUsers')} 
      />
    </View>
  );
}