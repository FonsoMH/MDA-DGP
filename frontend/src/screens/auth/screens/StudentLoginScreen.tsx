import { View, Text, StyleSheet, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import StudentLoginCard from '../components/StudentLoginCard';
import BackButton from '../../../components/common/BackButton/BackButton';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { StudentLogin } from '../../../types/login';
import { useStudentsData } from '../hook/usersList';


type StudentLoginProps = NativeStackScreenProps<any, 'StudentLogin'>;

export default function StudentLoginScreen({ navigation }: StudentLoginProps){

    const { users, isLoading, refetch } = useStudentsData();

    const handleSubmit = (user: StudentLogin) => {
        navigation.navigate('StudentPassword', { userParam: user });
    }
    
    if (isLoading) {
        return (
            <LoadingSpinner></LoadingSpinner>
        );
    }
    
    return (
        <View style={styles.safe}>
            <BackButton width={215} height={76} />
            <Text style={styles.title}>¡Elige tu perfil!</Text>
            
            <View style={styles.cardsContainer}>
                {
                    users.items.map((user) => (
                        <StudentLoginCard 
                            key={user.id} 
                            id={user.id} 
                            user={user.name} 
                            onPress={() => handleSubmit(user)}
                            
                        />
                    ))
                }
            </View>
            
            {users.items.length === 0 && (
                <View style={{ marginTop: 50 }}>
                    <Text style={styles.messageText}>No hay perfiles de estudiantes disponibles.</Text>
                    <Button title="Recargar" onPress={refetch} color="#4A90E2" />
                </View>
            )}
        </View>
        
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F7F8FA',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
		margin:20
    },
    title: {
        fontSize: 28, 
        fontWeight: '900', 
        color: '#1A202C', 
        marginTop: 20, 
        marginBottom: 30, 
        textAlign: 'center',
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 15,
        justifyContent: 'center',
        padding: 10, 
    },
    messageText: {
        fontSize: 18,
        color: '#D32F2F', 
        fontWeight: 'bold',
        textAlign: 'center',
        padding: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F8FA',
    }
});