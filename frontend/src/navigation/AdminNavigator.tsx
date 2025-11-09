import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentCreateScreen from '../students/StudentCreateScreen';
import UserList from '../userlist/UserList';
import TeacherCreateScreen from '../users/TeacherCreateScreen';




export type AdminStackParamList = {
    UserList: undefined;
    AdminCreate: undefined;
    TeacherCreate: undefined;
    StudentCreate: undefined;
};

const AdminStack = createNativeStackNavigator<AdminStackParamList>();


function AdminNavigator() {
  return (
    <AdminStack.Navigator
      screenOptions={{
            headerShown: false
        }}
    >
        <AdminStack.Screen name="UserList" component={UserList}/>

      <AdminStack.Screen name="TeacherCreate" component={TeacherCreateScreen}/>
      
      <AdminStack.Screen name="StudentCreate" component={StudentCreateScreen}/>

    </AdminStack.Navigator>
  );
}

export default AdminNavigator;