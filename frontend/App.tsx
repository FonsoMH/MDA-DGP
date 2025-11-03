import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { UserProvider } from './src/contexts/UserContext';


export default function App() {
  return (

//https://www.youtube.com/watch?v=Ky43ve3b9Ss

    <UserProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}