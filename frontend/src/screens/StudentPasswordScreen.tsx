import * as React from 'react'
import { View ,Text , Button , StyleSheet, Pressable , Image} from 'react-native';
import PasswordItem from '../components/PasswordItem';
import type { RootStackParamList } from '../types/navigation';
import { useUser } from '../hooks/useUser';

import iconList from '../types/passwordIconList';
import {iconsMap} from '../types/passwordIconList';
import trashCanIcon from '../../assets/trash_can.png';
import TextImageButton from '../components/TextImageButton';
import paperPlaneIcon from '../../assets/paper_plane.png';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const styles = StyleSheet.create({

    header:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
    },

    passwordElements:{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: "5%",
        justifyContent: 'space-evenly',
        rowGap: 30,
        borderRadius: 10,
        margin: 20,
    },

    passwordBox:{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 30,
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 20,
        margin: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,

    },

    passwordOptions:{
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        justifyContent: 'center',
    },

    password:{
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: "5%",
        justifyContent: 'space-evenly',
    },

});

type StudentPasswordProps = NativeStackScreenProps<RootStackParamList, 'StudentPassword'>;

export default function StudentPasswordScreen({ route, navigation }: StudentPasswordProps){

    const { userId , email , name } = route.params;

    const { user , student_login } = useUser();

    const [password, setPassword] = React.useState<{ name: string, icon: any }[]>([
        { name: iconList.unknown.name, icon: iconList.unknown.icon },
        { name: iconList.unknown.name, icon: iconList.unknown.icon },
        { name: iconList.unknown.name, icon: iconList.unknown.icon },
        { name: iconList.unknown.name, icon: iconList.unknown.icon },
    ]);

    const onPressPasswordItem = (item : { name: string, icon: any }) => {
        const newPassword = [...password];
        for(let i = 0; i < newPassword.length; i++){
            if(newPassword[i].name === iconList.unknown.name){
                newPassword[i] = item;
                break;
            }
        }
        setPassword(newPassword);
    }

    const removePassword = () => {
        const newPassword = [
            { name: iconList.unknown.name, icon: iconList.unknown.icon },
            { name: iconList.unknown.name, icon: iconList.unknown.icon },
            { name: iconList.unknown.name, icon: iconList.unknown.icon },
            { name: iconList.unknown.name, icon: iconList.unknown.icon },
        ]
        setPassword(newPassword);
    }

    const handleLogIn = async () => {
        try{
            
            const success = await student_login(userId, password);
            if (success) {
                console.log('Login successful');
                navigation.navigate('GameMenu');
            } else {
                console.log('Login failed');
            }
        }
        catch(error){
            console.log('Login failed:', error);
        }

    }

    return (
        <View style={{ marginLeft: '10%', marginRight: '10%' }}>
            <View style={styles.header}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>¡Selecciona tu contraseña {name}!</Text>
                <Text style={{ fontSize: 16, color: '#666' }}>Elige 4 pictogramas en orden</Text>
            </View>
            <View style={styles.passwordBox}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                    Tu Contraseña:
                </Text>

                <View style={styles.password}>
                    {
                        password.map((item, index) => (
                            <PasswordItem key={index} icon={item.icon} text={item.name} onPress={() => {}}/>
                        ))
                    }

                </View>

                <View style={styles.passwordOptions}>
                    <TextImageButton icon={trashCanIcon} onPress={removePassword} text="Eliminar" />
                    <TextImageButton icon={paperPlaneIcon} onPress={handleLogIn} text="Enviar" />
                </View>

            </View>
            <View style={styles.passwordElements}>
                {
                    iconsMap.map((item, index) => {
                        return <PasswordItem key={index} icon={item.icon} text={item.name} onPress={() => onPressPasswordItem(item)} />
                    })
                }
            </View>

        </View>
    )

}