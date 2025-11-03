import * as React from 'react'
import { View ,Text , Button , StyleSheet, Pressable} from 'react-native';
import { StudentLogin } from '../types/login';
import StudentLoginCard from '../components/StudentLoginCard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import Constants from 'expo-constants';
import { useCallback } from 'react';

// const BASE_URL = Constants.expoConfig?.extra?.apiUrl;
const BASE_URL = "http://localhost:5000";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cards: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        justifyContent: 'center',
        marginTop: 20,
    }
});

type StudentLoginProps = NativeStackScreenProps<any, 'StudentLogin'>;

export default function StudentLoginScreen({ navigation }: StudentLoginProps){

    const [users, setUsers] = React.useState<StudentLogin[]>([]);

    const fetchUsers = React.useCallback(async () => {
        
        try {
            const response = await fetch(`${BASE_URL}/api/students`);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    } , []);

    // const fetchUsers = async () => {
    //     try {
    //         const response = await fetch(`${BASE_URL}/api/students`);
    //         const data = await response.json();
    //         setUsers(data.students);
    //     } catch (error) {
    //         console.error('Error fetching users:', error);
    //     }
    // };

    React.useEffect(() => {
        fetchUsers();
    }, []);

    const handleSubmit = (userId: number, name: string) => {
        navigation.navigate('StudentPassword', { userId , name});
    }
    
    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>¡Elige tu perfil!</Text>
            <View style={styles.cards}>
                {
                    users.map((user) => (
                        <StudentLoginCard key={user.id} id={user.id} user={user.name} onPress={() => handleSubmit(user.id, user.name)} />
                    ))
                }
            </View>
        </View>
        
    )
};
