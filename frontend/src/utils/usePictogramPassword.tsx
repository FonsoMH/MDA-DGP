import { useState, useMemo } from 'react';
import { unknowICon, iconsMap, Icon } from '../types/passwordIconList';


const MAX_PASSWORD_LENGTH = 4;

export interface PictogramPasswordHook {
    password: Icon[];
    addPictogram: (item: Icon) => void;
    clearPassword: () => void;
    getPasswordSequence: () => string;
    isPasswordComplete: boolean;
    availableIcons: Icon[];
    maxPasswordLength: number;
}

export const usePictogramPassword = (): PictogramPasswordHook => {
    
    const [password, setPassword] = useState<Icon[]>(
        Array(MAX_PASSWORD_LENGTH).fill(unknowICon)
    );

    const addPictogram = (item: Icon): void => {
        setPassword((prev) => {
            const newPassword = [...prev];
            const firstEmptyIndex = newPassword.findIndex(
                (p) => p.name === unknowICon.name
            );

            if (firstEmptyIndex !== -1) {
                newPassword[firstEmptyIndex] = item;
            }
            return newPassword;
        });
    };

    const clearPassword = (): void => {
        setPassword(Array(MAX_PASSWORD_LENGTH).fill(unknowICon));
    };

    const getPasswordSequence = (): string => {
        
        return password.map(item => item.code).join(''); 
    };

    const isPasswordComplete = useMemo(() => {
        return password.every(item => item.name !== unknowICon.name);
    }, [password]);


    const availableIcons: Icon[] = iconsMap;
    
    return {
        password,
        addPictogram,
        clearPassword,
        getPasswordSequence,
        isPasswordComplete,
        availableIcons,
        maxPasswordLength: MAX_PASSWORD_LENGTH,
    };
};