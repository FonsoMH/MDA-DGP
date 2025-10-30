import * as React from 'react';
import { View, Text, Button } from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import FeedbackScreen from '../components/FeedBack/Feedback';
import { useState } from 'react';

type DetailsProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

export default function DetailsScreen({ route, navigation }: DetailsProps) {
  const { itemId } = route.params; 

  const [modalVisible, setModalVisible] = useState(false);

  const handleChildNotification = (dataFromChild: string) => {
    console.log('El hijo me avisó:', dataFromChild);
  };

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

      <Button
        title='Feedback'
        onPress={() => setModalVisible(true)}
      />

      <FeedbackScreen visible={modalVisible} onNotify={handleChildNotification}></FeedbackScreen>
    </View>
  );
}