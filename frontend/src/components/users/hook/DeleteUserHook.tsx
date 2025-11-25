import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { DeleteUserApi } from '../api/DeleteUserApi';
import { UserApiData } from '../../../types/users';

const askConfirm = (): Promise<boolean> => {
    return new Promise((resolve) => {
        console.log("Pronosticando plataforma:", Platform.OS); // CHIVATO

        if (Platform.OS === 'web') {
            const confirmed = window.confirm('¿Seguro que desea eliminar este usuario?');
            resolve(confirmed);
        } else {
            Alert.alert(
                'Confirmar eliminación',
                '¿Seguro que desea eliminar este usuario?',
                [
                    {
                        text: 'Cancelar',
                        onPress: () => resolve(false),
                        style: 'cancel',
                    },
                    {
                        text: 'Eliminar',
                        onPress: () => resolve(true),
                        style: 'destructive',
                    },
                ],
                { cancelable: false }
            );
        }
    });
};

export const DeleteUserHook = () => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteUser = async (adminId:number, user: UserApiData): Promise<boolean> => {
        setError(null);

        const confirmed = await askConfirm();

        if (!confirmed) {
            return false;
        }

        setIsDeleting(true);

        try {
            await DeleteUserApi(adminId ,user);
            
            setIsDeleting(false);
            
            // En web, Alert.alert tampoco suele ir bien para mensajes de éxito,
            // pero al menos la acción ya se hizo.
            if (Platform.OS === 'web') {
                window.alert('Éxito: Usuario eliminado correctamente.');
            } else {
                Alert.alert('Éxito', 'Usuario eliminado correctamente.');
            }
            
            return true;
        } catch (err: any) {
            console.error("Error en API:", err); // CHIVATO
            setIsDeleting(false);
            setError(err.message || 'Error al eliminar usuario');

            if (Platform.OS === 'web') {
                window.alert(`Error: ${err.message || 'Error al eliminar usuario'}`);
            } else {
                Alert.alert('Error', err.message || 'Error al eliminar usuario');
            }
            
            return false;
        }

    };

    return { isDeleting, error, deleteUser };
};