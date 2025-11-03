import { createContext , useState} from "react";
import Constants from 'expo-constants';

export const UserContext = createContext();

const BASE_URL = "http://localhost:5000";


export function UserProvider({ children }) {

    const [user, setUser] = useState(null);

    async function teacher_login(email, password) {
        try {
            const passwordHash = password;

            const res = await fetch(`${BASE_URL}/api/login/teacher`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: passwordHash })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok && data.success) {
                setUser({ id: data.user.id, name: data.user.name, role: 'teacher' , email: email});
                return true;
            } else {
                setUser(null);
                console.log('Login failed:', data.message || 'Unknown error');
                return false;
            }
        } catch (error) {
            setUser(null);
            console.log('Network error during login:', error);
            return false;
        }
    }

    async function student_login(id, password) {
        try {

            const passwordHash = Array.from(password).map(item => item.slug).join(',');

            console.log('Hashed password:', passwordHash);
            console.log('User ID:', id);

            const res = await fetch(`${BASE_URL}/api/login/student`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id,  password: passwordHash })
            });

            const data = await res.json().catch(() => ({}));

            if (res.ok && data.success) {
                setUser({ id: data.user.id, name: data.user.name, role: 'student' , email: data.user.email /*configuracion accesibilidad*/});
                return true;
            } else {
                setUser(null);
                console.log('Login failed:', data.message || 'Unknown error');
                return false;
            }
        } catch (error) {
            setUser(null);
            console.log('Network error during login:', error);
            return false;
        }
    }

    async function logout() {
        
    }

    return (
        <UserContext.Provider value={{ user, teacher_login, student_login, logout }}>
            {children}
        </UserContext.Provider>
    );

}