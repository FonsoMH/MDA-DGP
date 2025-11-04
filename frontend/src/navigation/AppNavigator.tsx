import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 

import { RootStackParamList } from '../types/navigation'; 
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import StudentCreateScreen from '../students/StudentCreateScreen';
import GameMenuScreen from '../games/gameMenuScreen';
import StudentGameConfigScreen from '../screens/StudentGameConfigScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
    >
      <Stack.Screen 
        name="GameMenu" 
        component={GameMenuScreen} 
        options={{ 
            title: 'Selecciona un Juego',
            headerShown: false
        }} 

      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
            title: 'Listado Principal',
            headerShown: false
        }} 

      />
      <Stack.Screen 
        name="Details" 
        component={DetailsScreen} 
        options={{ 
            title: 'Detalles del Ítem',
            headerShown: false
        }} 

      />
      <Stack.Screen
        name="StudentCreate"
        component={StudentCreateScreen}
        options={{
          title: 'Crear Estudiante',
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="StudentGameConfig" 
        component={StudentGameConfigScreen} 
        options={{ 
          title: 'Configurar juegos',
          headerShown: true 
        }} 
      />
      {/** Pantalla alternativa eliminado: GameSelected */}
    </Stack.Navigator>
  );
}