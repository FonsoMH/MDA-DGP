import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 

import { RootStackParamList } from '../types/navigation'; 
import HomeScreen from '../screens/HomeScreen';
import StudentCreateScreen from '../students/StudentCreateScreen';
import GameMenuScreen from '../games/gameMenuScreen';
import StudentGameConfigScreen from '../students/StudentGameConfigScreen';
import GameNavigator from './GameNavigator';
import UserList from '../userlist/UserList';
import LoginScreen from '../auth/screens/LoginScreen';
import StudentLoginScreen from '../auth/screens/StudentLoginScreen';
import StudentPasswordScreen from '../auth/screens/StudentPasswordScreen';
import TeacherLoginScreen from '../auth/screens/TeacherLoginScreen';
import TeacherCreateScreen from '../users/TeacherCreateScreen';


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

      <Stack.Screen 
        name="UserList" 
        component={UserList} 
        options={{ 
          title: 'Lista de Usuarios',
          headerShown: false
        }} 
      />

      <Stack.Screen
        name="TeacherCreate"
        component={TeacherCreateScreen}
        options={{
          title: 'Crear Tutor',
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