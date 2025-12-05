import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TapNumberGame from '../screens/games/TapNumberGame/TapNumberGame';
import SequenceGame from '../screens/games/SequenceGame/SequenceGame';
import ContainerSort from '../screens/games/ContainerSort/ContainerSort';
// import Game3 from '../games/Game3/Game3';
// import Game4 from '../games/Game4/Game4';


export type GameStackParamList = {
    TapNumberGame: undefined;
    SequenceGame: undefined;
    ContainerSort: undefined;
    Game4: undefined;
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
        {/* <GameStack.Screen name="Game4" component={Game4} /> */}

    </GameStack.Navigator>
  );
}

export default GameNavigator;