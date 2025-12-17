import { createContext , ReactNode, useCallback, useState} from "react";
import Constants from 'expo-constants';
import { AuthResponse, LoginCredentials, StudentLogin } from "../../../types/login";
import { useAccessibilitySettings } from "../../../accessibilitySettings/hooks/useAccessibilitySettings";
import { performLogin } from "../api/loginApi";

interface UserContextType {
    user: StudentLogin | null,
    login: (user: LoginCredentials) => Promise<StudentLogin | null>,
    logout: () => void,
    userError: Error | null,
}

export const UserContext = createContext<UserContextType | null>(null);



interface UserProviderProps {
    children: ReactNode;
}

const BASE_URL = Constants.expoConfig?.extra?.REACT_APP_API_BASE_URL;

export function UserProvider({ children }: UserProviderProps) {

    const [user, setUser] = useState<StudentLogin | null>(null);
    const [userError, setUserError] = useState<Error | null>(null);

    const { getSettings } = useAccessibilitySettings(); 
    
    const login = useCallback(async (credentials: LoginCredentials): Promise<StudentLogin | null> => {
        try {
            const result: AuthResponse = await performLogin(credentials);
            const loggedInUser = result.user;
            setUserError(null);

            setUser(loggedInUser);

            if(loggedInUser.role === 'student' && getSettings){
                await getSettings(loggedInUser.id);
            }            

            return loggedInUser; 
            
        } catch (err) {
            setUser(null);
            setUserError(err);
            return null;
        }
    }, [getSettings]);

    
    const logout = useCallback(async () => {
        setUser(null);
        setUserError(null);
    }, []); 

    return (
        <UserContext.Provider value={{ user, login, logout, userError }}>
            {children}
        </UserContext.Provider>
    );
}