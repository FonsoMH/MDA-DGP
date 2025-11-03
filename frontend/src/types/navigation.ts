export type RootStackParamList = {
  Home: undefined; 
  GameMenu: undefined;

  TapNumberGame: undefined;

  SequenceGame: undefined;

  Games: NavigatorScreenParams<GameStackParamList>; 

};

import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameStackParamList } from '../navigation/GameNavigator';

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;