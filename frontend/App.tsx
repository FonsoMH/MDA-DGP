import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { UserProvider } from './src/contexts/UserContext';


export default function App() {
  return (

    <UserProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </UserProvider>
  );
}