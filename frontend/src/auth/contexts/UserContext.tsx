import { createContext , ReactNode, useCallback, useState} from "react";
import Constants from 'expo-constants';
import { AuthResponse, LoginCredentials, StudentLogin } from "../../types/login";
import { performLogin } from "../api/loginApi";

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

    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            const result: AuthResponse = await performLogin(credentials);
            setUser(result.user);
            
            return true; 
            
        } catch (err: any) {
            console.error("Login hook error:", err.message);
            setUser(null);
            return false;
        }
    }, []);

    // async function teacher_login(email, password) {
    //     try {
    //         const passwordHash = password;

    //         const res = await fetch(`${BASE_URL}/api/login/teacher`, {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({ email, password: passwordHash })
    //         });

    //         const data = await res.json().catch(() => ({}));
    //         setUser({ id: data.user.id, name: data.user.name, role: 'teacher' , email: email});

    //         return true;

    //         // if (res.ok && data.success) {
    //         //     setUser({ id: data.user.id, name: data.user.name, role: 'teacher' , email: email});
    //         //     return true;
    //         // } else {
    //         //     setUser(null);
    //         //     console.log('Login failed:', data.message || 'Unknown error');
    //         //     return false;
    //         // }
    //     } catch (error) {
    //         setUser(null);
    //         console.log('Network error during login:', error);
    //         return false;
    //     }
    // }

    

    async function logout() {
        
    }

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );

}