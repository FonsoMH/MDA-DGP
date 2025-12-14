import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserList from '../screens/admin/UserList';
import StudentCreateScreen from '../screens/admin/StudentCreateScreen';
import TeacherCreateScreen from '../screens/admin/TeacherCreateScreen';
import AdminEditScreen from '../screens/admin/AdminEditScreen';
import { UserApiData } from '../types/users';




export type AdminStackParamList = {
    UserList: undefined;
    AdminEdit: undefined | {admin : UserApiData};
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

      <AdminStack.Screen name="TeacherCreate" component={TeacherCreateScreen}/>
      
      <AdminStack.Screen name="StudentCreate" component={StudentCreateScreen}/>

      <AdminStack.Screen name="AdminEdit" component={AdminEditScreen}/>

    </AdminStack.Navigator>
  );
}

export default AdminNavigator;