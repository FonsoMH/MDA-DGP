import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { View ,Text , StyleSheet, Pressable , TextInput} from 'react-native';
import PasswordInput from '../../../components/common/PasswordInput/PasswordInput';
import BackButton from '../../../components/common/BackButton/BackButton';
import { useUser } from '../../../hooks/useUser';

const MAX_WIDTH = 450;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
       
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '90%',
        maxWidth: MAX_WIDTH,
        
        paddingVertical: 40,
        marginTop: '5%',
        marginBottom: '5%',
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },

    inputContainer: {
        width: '100%',
        marginBottom: 20,
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 15,
    },

    inputWrapper: {
        width: '100%',
    },

    input: {
        backgroundColor: '#f3f3f5',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginTop: 5,
        width: '100%',
        height: 45,
    },
    loginButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
        width: '90%',
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

    const { login } = useUser();

    const handleLogIn = async () => {
        try {
            const user = await login(
                {username: email, 
                    password: password}
            );

            if(user?.role == 'admin'){
                navigation.navigate('Admin', {
                    screen: 'UserList'
                });
            }else if(user?.role == 'teacher'){
                navigation.navigate('Teacher', {
                    screen: 'TeacherStudentList'
                });
            }


           
           
        } catch (error) {
            console.error('Error during login:', error);
        }   
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
                        <PasswordInput
                            style={styles.input}
                            onChangeText={handlePasswordChange}
                            value={password}
                        />
                    </View>
                </View>
                <Pressable style={styles.loginButton} onPress={handleLogIn}>
                    <Text style={{ color: '#fff' }}>Iniciar Sesión</Text>
                </Pressable>
                <Pressable style={{marginBottom:20}} onPress={() => { /* Lógica para recuperar contraseña */ }}>
                    <Text>¿Olvidaste tu contraseña?</Text>
                </Pressable>
            </View>

            <BackButton width={130} height={50} alignSelf='center' />
        </View>
        
    )
}