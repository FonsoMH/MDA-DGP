import axios from "axios";
import { StudentLogin, LoginCredentials, AuthResponse, Classes, ClassesLogin } from "../../../types/login";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_TIMEOUT = process.env.API_TIMEOUT;

/**
 * Obtiene la lista de todos los usuarios con rol de estudiante del backend.
 * @returns Una promesa que resuelve con la lista de objetos StudentLogin.
 * @throws Un error si la variable BASE_URL no está definida o si la respuesta HTTP no es exitosa.
 */
export async function fetchStudentsByClass(idClass:number): Promise<StudentLogin[]> {
    if (!BASE_URL) {
        throw new Error("Configuration Error: BASE_URL is not defined in environment.");
    }

    const endpoint = `${BASE_URL}/api/classes/${idClass}/students`; 
    
    
    try {
        const response = await axios.get<ClassesLogin>(endpoint, { 
            timeout: API_TIMEOUT 
        });

        const data: ClassesLogin = response.data;

        return data.students;

    } catch (error) {
        return [];
    }
}

export async function fetchClasses(): Promise<Classes[]> {
    if (!BASE_URL) {
        throw new Error("Configuration Error: BASE_URL is not defined in environment.");
    }

    const endpoint = `${BASE_URL}/api/classes`; 
    
    
    try {
        const response = await axios.get<Classes[]>(endpoint, { 
            timeout: API_TIMEOUT 
        });

        
        const data: Classes[] = response.data;
        return data;

    } catch (error) {
        return [];
    }
}


export async function performLogin(credentials: LoginCredentials): Promise<AuthResponse> {
    if (!BASE_URL) {
        throw new Error("Configuration Error: BASE_URL is not defined in environment.");
    }

    const endpoint = `${BASE_URL}/api/login`; 
    
    try {
        
        const response = await axios.post<AuthResponse>(
            endpoint, 
            credentials,
            { 
                timeout: API_TIMEOUT 
            }
        );
        
        return response.data;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const message = error.response?.data?.message || 'Authentication failed.'; 

            throw new Error(`Login Error ${status || 'Network'}: ${message}`);
        }
        throw error;
    }
}

