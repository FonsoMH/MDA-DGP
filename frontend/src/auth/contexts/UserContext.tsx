import { createContext , ReactNode, useCallback, useState} from "react";
import Constants from 'expo-constants';
import { AuthResponse, LoginCredentials, StudentLogin } from "../../types/login";
import { performLogin } from "../api/loginApi";
import { useAccessibilitySettings } from "../../accessibilitySettings/hooks/useAccessibilitySettings";

interface UserContextType {
    user: StudentLogin | null,
    login: (user: LoginCredentials) => Promise<StudentLogin | null>,
    logout: () => void,
}

export const UserContext = createContext<UserContextType | null>(null);



interface UserProviderProps {
    children: ReactNode;
}

const BASE_URL = Constants.expoConfig?.extra?.REACT_APP_API_BASE_URL;

export function UserProvider({ children }: UserProviderProps) {

    const [user, setUser] = useState<StudentLogin | null>(null);

    const { getSettings } = useAccessibilitySettings(); 
    
    const login = useCallback(async (credentials: LoginCredentials): Promise<StudentLogin | null> => {
        try {
            const result: AuthResponse = await performLogin(credentials);
            const loggedInUser = result.user;

            setUser(loggedInUser);

            if(loggedInUser.role === 'student' && getSettings){
                await getSettings(loggedInUser.id);
            }
            

            return loggedInUser; 
            
        } catch (err: any) {
            console.error("Login hook error:", err.message);
            setUser(null);
            return null;
        }
    }, [getSettings]);

    
    const logout = useCallback(async () => {
        setUser(null);
    }, []); 

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}