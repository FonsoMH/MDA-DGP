import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { View ,Text , StyleSheet, Pressable , TextInput} from 'react-native';
import PasswordInput from '../../../components/common/PasswordInput/PasswordInput';
import BackButton from '../../../components/common/BackButton/BackButton';
import { useUser } from '../../../hooks/useUser';
import { useEffect, useState } from 'react';
import Alert from '../../../components/FeedBack/Alert';

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
    failedInput:{
        color: 'red',
        borderColor: 'red',
        borderWidth: 2
    },
    failedText:{
        color: 'red'
    }
});

type TeacherLoginProps = NativeStackScreenProps<any, 'TeacherLogin'>;

export default function TeacherLoginScreen({ navigation }: TeacherLoginProps){

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [failedPassword, setFailedPassword] = React.useState(false);
    const [error, setError] = React.useState(false);

    const [alert, setAlert] = useState({
        message: '',
        success: true,
        color: null,
        onHide: () => setIsAlertVisible(false)
    });

    useEffect(() => {
        if (failedPassword) {
            setAlert({
                ...alert,
                message: 'Credenciales incorrectas. Inténtalo de nuevo.',
                success: false,
                onHide: () => setIsAlertVisible(false)
            });
            setIsAlertVisible(true);
        }
    }, [failedPassword]);

    useEffect(() => {
        if (error) {
            setAlert({
                ...alert,
                message: 'Error al iniciar sesión. Por favor, inténtalo de nuevo más tarde.',
                success: false,
                onHide: () => { setIsAlertVisible(false); setError(false); }
            });
            setIsAlertVisible(true);
        }
    }, [error]);

    const [isAlertVisible, setIsAlertVisible] = useState(false);

    const handleEmailChange = (text: string) => {
        setEmail(text);
        setFailedPassword(false);
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        setFailedPassword(false);
    };

    const { login } = useUser();

    const handleLogIn = async () => {
        try {
            setFailedPassword(false);
            setError(false);
            const user = await login(
                {username: email, 
                    password: password}
            );

            if(!user){
                setFailedPassword(true);
            }

            if(user?.role == 'admin'){
                setAlert({
                    ...alert,
                    message: 'Inicio de sesión exitoso.',
                    success: true,
                    onHide: () => navigation.navigate('Admin', {
                        screen: 'UserList'
                    })
                });
                setIsAlertVisible(true);
            }else if(user?.role == 'teacher'){
                setAlert({
                    ...alert,
                    message: 'Inicio de sesión exitoso.',
                    success: true,
                    onHide: () => navigation.navigate('Teacher', {
                        screen: 'TeacherStudentList'
                    })
                });
                setIsAlertVisible(true);
            }
           
        } catch (error) {
            setError(true);
        }   
    }

 
    return (
        <View>

            <View style={styles.container}>
                
                <View style={styles.header}>
                    <Text style={{ fontWeight: 'bold', fontSize: 24 }}>Acceso Docente</Text>
                    <Text style={{ marginBottom: 20 , color: '#999'}}>Ingresa tus credenciales</Text>
                </View>

                <View style={{ width: '100%' , alignItems: 'center' }}>
                    <View style={styles.inputContainer}>
                        <View style={{ width: '100%'}} >
                            <Text style={failedPassword ? styles.failedText : null}>
                                Correo Electrónico
                            </Text>
                            <TextInput 
                                placeholder="" 
                                testID= "teacher-email-input" 
                                style={[styles.input, failedPassword ? styles.failedInput : null]} 
                                onChangeText={handleEmailChange} />
                        </View>
                        <View style={{ width: '100%'}} >
                            <Text style={failedPassword ? styles.failedText : null}>
                                Contraseña
                            </Text>
                            <PasswordInput
                                style={[styles.input, failedPassword ? styles.failedInput : null]}
                                onChangeText={handlePasswordChange}
                                value={password}
                                testID="teacher-password-input"
                                />
                        </View>
                    </View>
                    <Pressable style={styles.loginButton} onPress={handleLogIn} testID="login-submit-button">
                        <Text style={{ color: '#fff' }}>Iniciar Sesión</Text>
                    </Pressable>
                    <Pressable style={{marginBottom:20}} onPress={() => { /* Lógica para recuperar contraseña */ }}>
                        <Text>¿Olvidaste tu contraseña?</Text>
                    </Pressable>
                </View>

                <BackButton width={130} height={50} alignSelf='center' />
            </View>
            <Alert
                visible={isAlertVisible}
                message={alert.message}
                success={alert.success}
                duration={1000}
                color={alert.color}
                onHide={alert.onHide}
                />
        </View>
        
    )
}