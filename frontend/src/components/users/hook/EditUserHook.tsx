import { useState } from 'react';
import { UserApiData, UpdateUserPayload } from '../../../types/users';
import { EditUserApi } from '../api/EditUserApi';

export const EditUserHook = () => {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const saveUser = async (user: UserApiData, data: UpdateUserPayload): Promise<boolean> => {
        setIsSaving(true);
        setError(null);

        try {
            await EditUserApi(user, data);
            setIsSaving(false);
            return true;
        } catch (err: any) {
            setIsSaving(false);

            setError(err);
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