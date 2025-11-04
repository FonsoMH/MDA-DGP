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


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      </GestureHandlerRootView>
    </QueryClientProvider>

    
  );
}