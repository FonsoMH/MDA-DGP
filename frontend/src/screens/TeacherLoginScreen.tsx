import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { View ,Text , Button , StyleSheet, Pressable , Image , TextInput} from 'react-native';
import { useUser } from '../hooks/useUser';


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 10,
        marginLeft: '30%',
        marginRight: '30%',
        marginTop: '10%',
        marginBottom: '10%',
        backgroundColor: '#fff',
    },
    header:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },

    inputContainer: {
        width: '80%',
        marginBottom: 20,
        alignItems: 'center',
        gap: 10,
    },

    input: {
        backgroundColor: '#f3f3f5',
        borderRadius: 10,
        padding: 20,
        marginVertical: 5,
        width: '100%',
        height: 50,
    },
    loginButton: {
        backgroundColor: '#000',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
        width: '80%',
    },
    
});

type TeacherLoginProps = NativeStackScreenProps<any, 'TeacherLogin'>;

export default function TeacherLoginScreen({ navigation }: TeacherLoginProps){

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleEmailChange = (text: string) => {
        setEmail(text);
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
    };

    const { user , login } = useUser();

    const handleLogIn = () => {
        // login(email, password);
        login(email, password);
    }

 
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={{ fontWeight: 'bold', fontSize: 24 }}>Acceso Docente</Text>
                <Text style={{ marginBottom: 20 , color: '#999'}}>Ingresa tus credenciales</Text>
            </View>

            <View style={{ width: '100%' , alignItems: 'center' }}>
                <View style={styles.inputContainer}>
                    <View style={{ width: '100%'}} >
                        <Text>Correo Electrónico</Text>
                        <TextInput placeholder="" style={styles.input} onChangeText={handleEmailChange} />
                    </View>
                    <View style={{ width: '100%'}} >
                        <Text>Contraseña</Text>
                        <TextInput placeholder="" secureTextEntry style={styles.input} onChangeText={handlePasswordChange} />
                    </View>
                </View>
                <Pressable style={styles.loginButton} onPress={handleLogIn}>
                    <Text style={{ color: '#fff' }}>Iniciar Sesión</Text>
                </Pressable>
                <Pressable onPress={() => { /* Lógica para recuperar contraseña */ }}>
                    <Text>¿Olvidaste tu contraseña?</Text>
                </Pressable>
            </View>

        </View>
        
    )
}