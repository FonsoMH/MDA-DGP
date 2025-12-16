import { View ,Text, StyleSheet} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import LoginOptionButton from '../components/LoginOptionButton';

type LoginProps = NativeStackScreenProps<any, 'Login'>;

export default function LoginScreen({ navigation }: LoginProps){

    const handleStudentLogin = () => {
        navigation.navigate('Auth', {
            screen: 'ClassesScreen'
        });
    }

    const handleTeacherLogin = () => {
        navigation.navigate('Auth', {
            screen: 'TeacherLogin'
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>🎓 Tiki Matemáticas</Text>
                <Text style={styles.subtitle}>Aprende matemáticas de forma divertida</Text>
            </View>
            <View style={styles.optionsContainer}>

                <LoginOptionButton icon="👦" label="Soy Estudiante" testID='student-login-button' onPress={handleStudentLogin} />

                <LoginOptionButton icon="👩‍🏫" label="Soy Profesor" testID='teacher-login-button' onPress={handleTeacherLogin} />

            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleContainer: {
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
    },
    optionsContainer:{
        padding: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 10,
    }
});