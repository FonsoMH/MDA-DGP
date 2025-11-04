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
        title="Ir a Pantalla de Login"
        onPress={() => navigation.navigate('Login')} 
      />
      <Button
        title="Crear Tutor"
        onPress={() => navigation.navigate('TeacherCreate')}
      />
    </View>
  );
}