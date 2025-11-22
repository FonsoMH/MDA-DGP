import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TeacherStudentListScreen from '../screens/teacher/TeacherStudentListScreen';
import StudentGameConfigScreen from '../screens/teacher/StudentGameConfig/StudentGameConfigScreen';

// Stack de navegación para el área de Tutor/Profesor
export type TeacherStackParamList = {
	// Listado de estudiantes para tutores (teacherId opcional, se toma del usuario logeado por defecto)
	TeacherStudentList: { teacherId?: number } | undefined;
	// Configuración de juegos por estudiante
	StudentGameConfig: { studentId: number };
};

const TeacherStack = createNativeStackNavigator<TeacherStackParamList>();

function TeacherNavigator() {
		return (
			<TeacherStack.Navigator
					id={undefined}
				screenOptions={{
					headerShown: false,
				}}
			>
			<TeacherStack.Screen
				name="TeacherStudentList"
				component={TeacherStudentListScreen}
			/>

			<TeacherStack.Screen
				name="StudentGameConfig"
				component={StudentGameConfigScreen}
			/>
		</TeacherStack.Navigator>
	);
}

export default TeacherNavigator;

