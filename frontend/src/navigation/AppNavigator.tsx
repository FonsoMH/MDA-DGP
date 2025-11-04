import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 

import { RootStackParamList } from '../types/navigation'; 
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import CreateStudent from '../screens/CreateStudent';
import TestUsers from '../screens/TestUsers';
import TapNumberGame from '../games/TapNumberGame/TapNumberGame';
import UserListScreen from '../screens/UserListScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
    >
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
        name="CreateStudent" 
        component={CreateStudent} 
        options={{ 
            title: 'Crear Estudiante',
            headerShown: true
        }}
      />
      <Stack.Screen
        name="TestUsers"
        component={TestUsers}
        options={{
            title: 'Test Users',
            headerShown: true
        }}
      />
      <Stack.Screen 
        name="TapNumberGame" 
        component={TapNumberGame} 
        options={{ 
          title: 'Juego de Números',
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="UserList" 
        component={UserListScreen} 
        options={{ 
          title: 'Lista de Usuarios',
          headerShown: false
        }} 
      />
    </Stack.Navigator>
  );
}