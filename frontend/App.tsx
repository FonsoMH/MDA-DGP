import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
        },
    },
});
import LoginScreen from './src/auth/screens/LoginScreen';
import { UserProvider } from './src/auth/contexts/UserContext';
import { AccessibilitySettingsProvider } from './src/contexts/AccesibilitySettingsContext';


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <UserProvider>
          <AccessibilitySettingsProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </AccessibilitySettingsProvider>
        </UserProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  
  );
}