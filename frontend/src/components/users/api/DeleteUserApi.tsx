import axios from 'axios';
import { UserApiData } from '../../../types/users';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const DeleteUserApi = async (user: UserApiData) => {
    if (!user.id) {
        throw new Error("User ID is required to delete user");
    }

    let url = '';
    if (user.role === 'student') {
        url = `${BASE_URL}/api/students/${user.id}`;
    } else {
        url = `${BASE_URL}/users/${user.id}`;
    }

    try {
        const response = await axios.delete(url);
        return response.data;
    } catch (error) {
        const message = error?.response?.data?.error || error?.response?.data?.message || 'Error al eliminar usuario';
        throw new Error(String(message));
    }
}