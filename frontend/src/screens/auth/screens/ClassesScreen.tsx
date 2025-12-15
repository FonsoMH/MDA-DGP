import { View, Text, StyleSheet, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import StudentLoginCard from '../components/StudentLoginCard';
import BackButton from '../../../components/common/BackButton/BackButton';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { Classes, StudentLogin } from '../../../types/login';
import { useClassesData, useStudentsData } from '../hook/usersList';


type StudentLoginProps = NativeStackScreenProps<any, 'StudentLogin'>;

export default function ClassesScreen({ navigation }: StudentLoginProps){

    const { classes, isLoading, refetch } = useClassesData();

    const handleSubmit = (clas: Classes) => {
        navigation.navigate('StudentLoginScreen', { clasParam: clas });
    }
    
    if (isLoading) {
        return (
            <LoadingSpinner></LoadingSpinner>
        );
    }
    
    return (
        <View style={styles.safe}>
            <BackButton width={215} height={76} />
            <Text style={styles.title}>¡Elige la clase!</Text>
            
            <View style={styles.cardsContainer}>
                {
                    classes.map((clas) => (
                        <StudentLoginCard 
                            key={clas.id} 
                            id={clas.id} 
                            user={clas.name} 
                            onPress={() => handleSubmit(clas)} 
                        />
                    ))
                }
            </View>
            
            {classes.length === 0 && (
                <View style={{ marginTop: 50 }}>
                    <Text style={styles.messageText}>No hay clases disponibles.</Text>
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