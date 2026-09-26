export type RootStackParamList = {
  
  Login: undefined;
  GameMenu: undefined;


  Games: NavigatorScreenParams<GameStackParamList>; 
  Auth: NavigatorScreenParams<LoginStackParamList>; 
  Admin: NavigatorScreenParams<AdminStackParamList>; 
  Teacher: NavigatorScreenParams<TeacherStackParamList>;
  Student: NavigatorScreenParams<StudentStackParamList>;
};

import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameStackParamList } from '../navigation/GameNavigator';
import { LoginStackParamList } from '../navigation/LoginNavigator';
import { AdminStackParamList } from '../navigation/AdminNavigator';
import { TeacherStackParamList } from '../navigation/TeacherNavigator';
import { StudentStackParamList } from '../navigation/StudentNavigator';

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;