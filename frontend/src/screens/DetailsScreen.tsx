import * as React from 'react';
import { View, Text, Button } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type DetailsProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

export default function DetailsScreen({ route, navigation }: DetailsProps) {
  const { itemId } = route.params; 

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Estás en la pantalla de Detalles.</Text>
      <Text>ID recibido: {itemId}</Text>
      <Button
        title="Volver a Inicio"
        onPress={() => navigation.goBack()}
      />
      <Button
        title="Ir a Home (Reemplazando)"
        onPress={() => navigation.replace('Home')}
      />
    </View>
  );
}