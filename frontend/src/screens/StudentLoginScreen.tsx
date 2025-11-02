import * as React from 'react'
import { View ,Text , Button , StyleSheet, Pressable} from 'react-native';
import { StudentLogin } from '../types/login';
import StudentLoginCard from '../components/StudentLoginCard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';


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

    const [users, setUsers] = React.useState<StudentLogin[]>([
        { name: 'Juan', id: 1 },
        { name: 'María', id: 2 },
        { name: 'Pedro', id: 3 },
        { name: 'Ana', id: 4 },
        { name: 'Luis', id: 5 },
        { name: 'Sofía', id: 6 },
        { name: 'Carlos', id: 7 },
        { name: 'Lucía', id: 8 },
        { name: 'Jorge', id: 9 },
    ]);

    const handleSubmit = () => {
        navigation.navigate('StudentPassword');
    }
    
    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}>¡Elige tu perfil!</Text>
            <View style={styles.cards}>

                {
                    users.map((user) => (
                        <StudentLoginCard key={user.id} id={user.id} user={user.name} onPress={handleSubmit} />
                    ))
                }
            </View>
        </View>
        
    )
};
