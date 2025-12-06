import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserList from '../screens/admin/UserList';
import StudentCreateScreen from '../screens/admin/StudentCreateScreen';
import TeacherCreateScreen from '../screens/admin/TeacherCreateScreen';
import AdminCreateScreen from '../screens/admin/AdminCreateScreen';
import { UserApiData } from '../types/users';




export type AdminStackParamList = {
    UserList: undefined;
    AdminCreate: undefined;
    TeacherCreate: undefined | {teacher : UserApiData};
    StudentCreate: undefined | {student : UserApiData};
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

      <AdminStack.Screen name="AdminCreate" component={AdminCreateScreen}/>

      <AdminStack.Screen name="TeacherCreate" component={TeacherCreateScreen}/>
      
      <AdminStack.Screen name="StudentCreate" component={StudentCreateScreen}/>

    </AdminStack.Navigator>
  );
}

export default AdminNavigator;