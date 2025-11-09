import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 

import { RootStackParamList } from '../types/navigation';
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
import LoginNavigator from './LoginNavigator';
import AdminNavigator from './AdminNavigator';


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