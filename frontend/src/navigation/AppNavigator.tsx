import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 

import { RootStackParamList } from '../types/navigation'; 
import HomeScreen from '../screens/HomeScreen';
import GameMenuScreen from '../games/gameMenuScreen';
import GameNavigator from './GameNavigator';
import LoginScreen from '../screens/LoginScreen';
import StudentLoginScreen from '../screens/StudentLoginScreen';
import StudentPasswordScreen from '../screens/StudentPasswordScreen';
import TeacherLoginScreen from '../screens/TeacherLoginScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
            headerShown: false
        }}
    >
      
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
      />

      <Stack.Screen 
        name="GameMenu" 
        component={GameMenuScreen}
      />

      <Stack.Screen 
        name="Games" 
        component={GameNavigator}
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