import { createContext , useState} from "react";
import Constants from 'expo-constants';

console.log(Constants.expoConfig?.extra);
console.log(Constants.manifest?.extra); // Para Expo Go en versiones antiguas


export const UserContext = createContext();


const BASE_URL = Constants.expoConfig?.extra?.REACT_APP_API_BASE_URL;


export function UserProvider({ children }) {
    const [user, setUser] = useState(null);

    async function login(email, password) {

        console.log(BASE_URL)
        try {
            const res = await fetch(`${BASE_URL}/api/login/teacher`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok && data.success) {
                setUser({ email, role: 'teacher' });
                return { success: true, message: data.message || 'Login successful' };
            } else {
                setUser(null);
                console.log('Login failed:', data.message || 'Unknown error');
                return { success: false, message: data.message || 'Invalid email or password' };
            }
        } catch (error) {
            setUser(null);
            return { success: false, message: error.message || 'Network error' };
        }
    }

    async function logout() {
        
    }

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );

}