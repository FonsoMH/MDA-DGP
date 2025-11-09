import { View ,Text, StyleSheet, ScrollView } from 'react-native';
import PasswordItem from '../components/PasswordItem'; 
import trashCanIcon from '../../../../assets/trash_can.png';
import TextImageButton from '../components/TextImageButton';
import paperPlaneIcon from '../../../../assets/paper_plane.png';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BackButton from '../../../components/common/BackButton/BackButton';

import { LoginStackParamList } from '../../../navigation/LoginNavigator';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../../../types/navigation';
import { useUser } from '../../../hooks/useUser';
import { usePictogramPassword } from '../../../utils/usePictogramPassword';


interface StudentParam {
    name: string;
    email: string;
}

type StudentPasswordProps = NativeStackScreenProps<LoginStackParamList, 'StudentPassword'>;

export default function StudentPasswordScreen({ route, navigation }: StudentPasswordProps){

    const rootNavigation = useNavigation<RootStackNavigationProp>(); 
    const userParam: StudentParam = route.params.userParam; 
    const { login } = useUser();
    
    const { 
        password, 
        addPictogram, 
        clearPassword, 
        getPasswordSequence, 
        isPasswordComplete,
        availableIcons,
        maxPasswordLength,
    } = usePictogramPassword();


    const handleLogIn = async (): Promise<void> => {

        if (!isPasswordComplete) {
            return;
        }

        try {
            const passwordSequence = getPasswordSequence();
            
            const loggedInUser = await login(
                {username: userParam.email, 
                    password: passwordSequence}
            );

            if(loggedInUser){
                rootNavigation.navigate('GameMenu');
            }
            
        } catch (error) {
            // TODO handle error (mostrar un mensaje al usuario)
            console.error("Login failed:", error);
        }
    };

    return (
        <View style={styles.safe}>
            <BackButton width={215} height={76} />
            <View style={styles.header}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>¡Selecciona tu contraseña {userParam.name}!</Text>
                <Text style={{ fontSize: 16, color: '#666' }}>Elige {maxPasswordLength} pictogramas en orden</Text>
            </View>

            <View style={styles.passwordBox}>
                <Text style={styles.passwordHeader}>
                    Tu Contraseña:
                </Text>
                <View style={styles.passwordMainRow}>
                    <View style={styles.passwordDisplay}>
                        {
                            password.map((item, index) => (
                                <PasswordItem 
                                    key={index} 
                                    icon={item.icon} 
                                    text={item.name} 
                                    onPress={() => {}}
                                    height={100}
                                    width={100}
                                />
                            ))
                        }
                    </View>
                    <View style={styles.passwordOptions}>
                        <TextImageButton 
                        //TODO disable
                            icon={paperPlaneIcon} 
                            onPress={handleLogIn} 
                            label="Entrar" 
                        />
                        <TextImageButton 
                            icon={trashCanIcon} 
                            onPress={clearPassword}
                            label="Limpiar" 
                        />
                    </View>
                </View>

            </View>
            
            <ScrollView style={styles.optionsArea} contentContainerStyle={styles.passwordElementsContent}>
                <View style={styles.passwordElements}>
                    {
                        availableIcons.map((item, index) => {
                            return <PasswordItem 
                            key={index} 
                            icon={item.icon} 
                            text={item.name} 
                            onPress={() => addPictogram(item)}
                            height={130}
                            width={175}
                            />
                        })
                    }
                </View>
            </ScrollView>

        </View>
    )
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

    header:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
    },

    passwordBox:{
        flexDirection: 'column',
        alignItems: 'flex-start', 
        justifyContent: 'center',
        gap: 10, 
        backgroundColor: '#FFF',
        borderRadius: 15, 
        padding: 15,
        width: '75%',
        marginBottom: 20, 
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 5.46,
        elevation: 8,
    },

    passwordHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },

    passwordMainRow: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    passwordDisplay:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        flex: 1, 
        marginRight: 15,
    },
    
    passwordOptions:{
        flexDirection: 'column', 
        gap: 8, 
        alignItems: 'flex-end',
        justifyContent: 'center',
    },

    enterButton: {
        backgroundColor: '#4A90E2', 
        width: 100, 
        height: 40,
        borderRadius: 8,
    },

    disabledButton: {
        backgroundColor: '#ccc', 
        width: 100,
        height: 40,
        borderRadius: 8,
    },

    clearButton: {
        backgroundColor: '#F3F4F6', 
        width: 100,
        height: 40,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
    },
    
    optionsArea: {
        width: '100%',
        flex: 1, 
        paddingHorizontal: 15,
    },

    passwordElementsContent: {
        paddingVertical: 10,
        paddingBottom: 20,
    },

    passwordElements:{
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center', 
        gap: 15, 
        rowGap: 20, 
        padding: 5,
    },
});