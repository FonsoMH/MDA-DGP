import * as React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; 

import { RootStackParamList } from '../types/navigation'; 
import HomeScreen from '../screens/HomeScreen';
import GameMenuScreen from '../games/gameMenuScreen';
import GameNavigator from './GameNavigator';
import UserList from '../userlist/UserList';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
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

      <Stack.Screen name="Games" component={GameNavigator} />

      <Stack.Screen 
        name="UserList" 
        component={UserList} 
        options={{ 
          title: 'Lista de Usuarios',
          headerShown: false
        }} 
      />

      
    </Stack.Navigator>
  );
}