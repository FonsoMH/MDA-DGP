import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TapNumberGame from '../screens/games/TapNumberGame/TapNumberGame';
import SequenceGame from '../screens/games/SequenceGame/SequenceGame';
import ContainerSort from '../screens/games/ContainerSort/ContainerSort';
import LeaveSame from '../screens/games/LeaveSame/LeaveSame';

export type GameStackParamList = {
    TapNumberGame: undefined;
    SequenceGame: undefined;
    ContainerSort: undefined;
    LeaveSame: undefined;
};

const GameStack = createNativeStackNavigator<GameStackParamList>();


function GameNavigator() {
  return (
    <GameStack.Navigator
      screenOptions={{
            headerShown: false
        }}
    >
        <GameStack.Screen name="TapNumberGame" component={TapNumberGame} />
        <GameStack.Screen name="SequenceGame" component={SequenceGame} />
        <GameStack.Screen name="ContainerSort" component={ContainerSort} />
        <GameStack.Screen name="LeaveSame" component={LeaveSame} />

    </GameStack.Navigator>
  );
}

export default GameNavigator;