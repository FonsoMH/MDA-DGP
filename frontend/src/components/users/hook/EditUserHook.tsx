import { useState } from 'react';
import { UserApiData, UpdateUserPayload } from '../../../types/users';
import { EditUserApi } from '../api/EditUserApi';

export const EditUserHook = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const saveUser = async (user: UserApiData, data: UpdateUserPayload): Promise<boolean> => {
        setIsSaving(true);
        setError(null);

        try {
            await EditUserApi(user, data);
            setIsSaving(false);
            alert(`${user.role} editado correctamente`);
            return true;
        } catch (err: any) {
            setIsSaving(false);
            const errorMessage = err?.response?.data?.message || err.message || 'Error desconocido';

            setError(err.message || 'Error al guardar usuario');
            alert(`Error editando: ${errorMessage}`);
            return false;
        }
    };

    return { 
        isSaving,
        error,
        saveUser,
        clearError: () => setError(null)    
    };
};