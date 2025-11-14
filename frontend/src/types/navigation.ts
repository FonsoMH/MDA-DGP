export type RootStackParamList = {
  
  Login: undefined;
  GameMenu: undefined;


  Games: NavigatorScreenParams<GameStackParamList>; 
  Auth: NavigatorScreenParams<LoginStackParamList>; 
  Admin: NavigatorScreenParams<AdminStackParamList>; 
  
  // Nueva ruta para configuración de juegos por estudiante
  StudentGameConfig: { studentId: number };
};

import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameStackParamList } from '../navigation/GameNavigator';
import { LoginStackParamList } from '../navigation/LoginNavigator';
import { AdminStackParamList } from '../navigation/AdminNavigator';

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;