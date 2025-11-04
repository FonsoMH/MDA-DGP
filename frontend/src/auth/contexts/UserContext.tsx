import { createContext , ReactNode, useCallback, useState} from "react";
import Constants from 'expo-constants';
import { AuthResponse, LoginCredentials, StudentLogin } from "../../types/login";
import { performLogin } from "../api/loginApi";
import { useAccessibilitySettings } from "../../accessibilitySettings/hooks/useAccessibilitySettings";

interface UserContextType {
    user: StudentLogin | null,
    login: (user: LoginCredentials) => Promise<boolean>,
    logout:  (() => {}),
}

export const UserContext = createContext<UserContextType | null>(null);



interface UserProviderProps {
    children: ReactNode;
}

const BASE_URL = Constants.expoConfig?.extra?.REACT_APP_API_BASE_URL;

export function UserProvider({ children }: UserProviderProps) {

    const [user, setUser] = useState<StudentLogin | null>(null);

    const { getSettings } = useAccessibilitySettings();
    
    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            const result: AuthResponse = await performLogin(credentials);
            setUser(result.user);

            console.log(result.user);

            if(result.user.role == 'student' && getSettings){
                await getSettings(result.user.id);
                console.log(`Cargando ajustes de accesibilidad para el estudiante ID: ${result.user.id}`);
            }
            
            
            return true; 
            
        } catch (err: any) {
            console.error("Login hook error:", err.message);
            setUser(null);
            return false;
        }
    }, []);

    
    //TODO logout
    async function logout() {
        
    }

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );

}