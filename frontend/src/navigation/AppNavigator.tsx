import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 

import { RootStackParamList } from '../types/navigation';
import GameNavigator from './GameNavigator';
import LoginNavigator from './LoginNavigator';
import AdminNavigator from './AdminNavigator';
import GameMenuScreen from '../screens/games/gameMenuScreen';
import LoginScreen from '../screens/auth/screens/LoginScreen';
import StudentGameConfigScreen from '../screens/teacher/StudentGameConfigScreen';
import TeacherStudentListScreen from '../screens/teacher/TeacherStudentListScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      id={undefined}
      initialRouteName="Login"
      screenOptions={{
            headerShown: false
        }}
    >

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
        name="Auth" 
        component={LoginNavigator}
      />

      <Stack.Screen 
        name="Admin" 
        component={AdminNavigator}
      />

      <Stack.Screen 
        name="TeacherStudentList" 
        component={TeacherStudentListScreen} 
        options={{ 
          title: 'Estudiantes',
          headerShown: false 
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