import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StudentLogin } from '../types/login';
import StudentLoginScreen from '../screens/auth/screens/StudentLoginScreen';
import StudentPasswordScreen from '../screens/auth/screens/StudentPasswordScreen';
import TeacherLoginScreen from '../screens/auth/screens/TeacherLoginScreen';

export type LoginStackParamList = {
    StudentLogin: undefined;

    StudentPassword: { userParam: StudentLogin };

    TeacherLogin: undefined;
};

const LoginStack = createNativeStackNavigator<LoginStackParamList>();


function LoginNavigator() {
  return (
    <LoginStack.Navigator
      screenOptions={{
            headerShown: false
        }}
    >
        <LoginStack.Screen name="StudentLogin" component={StudentLoginScreen} />
        <LoginStack.Screen name="StudentPassword" component={StudentPasswordScreen} />
        <LoginStack.Screen name="TeacherLogin" component={TeacherLoginScreen} />

    </LoginStack.Navigator>
  );
}

export default LoginNavigator;