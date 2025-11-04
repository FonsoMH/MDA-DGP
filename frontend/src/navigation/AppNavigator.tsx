import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 

import { RootStackParamList } from '../types/navigation'; 
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import CreateStudent from '../screens/CreateStudent';
import TestUsers from '../screens/TestUsers';

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
    </Stack.Navigator>
  );
}