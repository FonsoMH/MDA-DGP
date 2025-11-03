import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 

import { RootStackParamList } from '../types/navigation'; 
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import StudentLoginScreen from '../screens/StudentLoginScreen';
import StudentPasswordScreen from '../screens/StudentPasswordScreen';
import TeacherLoginScreen from '../screens/TeacherLoginScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
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
        name="Login"
        component={LoginScreen}
        options={{
          title: 'Iniciar Sesión',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="StudentLogin"
        component={StudentLoginScreen} 
        options={{
          title: 'Iniciar Sesión Estudiante',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="StudentPassword"
        component={StudentPasswordScreen} 
        options={{
          title: 'Pantalla de Contraseña Estudiante',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="TeacherLogin"
        component={TeacherLoginScreen} 
        options={{
          title: 'Iniciar Sesión Profesor',
          headerShown: false
        }}
      />
    </Stack.Navigator>
  );
}