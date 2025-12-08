import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentStatisticsScreen from '../screens/student/StudentStatisticsScreen';
import { StudentLogin } from '../types/login';

// Stack de navegación para el área del alumno
export type StudentStackParamList = {

    // Estadísticas del estudiante
    StudentStatistics: { student: StudentLogin };

    
};

const StudentStack = createNativeStackNavigator<StudentStackParamList>();

function StudentNavigator() {
        return (
            <StudentStack.Navigator
                    id={undefined}
                screenOptions={{
                    headerShown: false,
                }}
            >
            
            <StudentStack.Screen 
                name="StudentStatistics"
                component={StudentStatisticsScreen}
            />
        </StudentStack.Navigator>
    );
}

export default StudentNavigator;
