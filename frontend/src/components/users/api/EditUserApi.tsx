import axios from "axios";
import { UserApiData, UpdateUserPayload } from "../../../types/users";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const EditUserApi = async (user: UserApiData, data: UpdateUserPayload)  => {
    const userId = user.id;
    
    if (!userId) {
        throw new Error("User ID is required to edit user");
    }

    const payload: UpdateUserPayload = { name: data.name, email: data.email };
    if (data.password) payload.password = data.password;
    if (data.assigned_teacher_id !== undefined) payload.assigned_teacher_id = data.assigned_teacher_id;
    if (data.assigned_students_ids !== undefined) payload.assigned_students_ids = data.assigned_students_ids;
    

    let url = '';
    switch (user.role) {
        case 'student':
            url = `${BASE_URL}/api/students/${userId}`;
            break;
        case 'teacher':
            // Esta es la ruta que gestiona teachers.py
            url = `${BASE_URL}/api/teachers/${userId}`; 
            break;
        case 'admin':
            url = `${BASE_URL}/api/admins/${userId}`;
            break;
        default:
            break;
    }

    try {
        const response = await axios.put(url, payload);
        return response.data;
    } catch (error) {
        const message = error?.response?.data?.error || error?.response?.data?.message || 'Error al actualizar usuario';
        throw new Error(String(message));
    }
}