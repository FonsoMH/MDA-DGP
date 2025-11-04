import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. Importa las pantallas de tus juegos
import TapNumberGame from '../games/TapNumberGame/TapNumberGame';
import SequenceGame from '../games/SequenceGame/SequenceGame';
// import Game3 from '../games/Game3/Game3';
// import Game4 from '../games/Game4/Game4';


export type GameStackParamList = {
    TapNumberGame: undefined;
    SequenceGame: undefined;
    Game3: undefined;
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
        {/* <GameStack.Screen name="Game3" component={Game3} /> */}
        {/* <GameStack.Screen name="Game4" component={Game4} /> */}

    </GameStack.Navigator>
  );
}

export default GameNavigator;