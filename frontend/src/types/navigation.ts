export type RootStackParamList = {
  Home: undefined; 
  GameMenu: undefined;

  UserList: undefined;

  Games: NavigatorScreenParams<GameStackParamList>; 

  Details: { itemId: number };

  Login: undefined;

  StudentLogin: undefined;

  StudentPassword: { userParam: StudentLogin };

  TeacherLogin: undefined;

  AdminCreate: undefined;
  TeacherCreate: undefined;
  StudentCreate: undefined;
  
  // Resto de rutas
};

import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameStackParamList } from '../navigation/GameNavigator';
import { StudentLogin } from './login';

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;