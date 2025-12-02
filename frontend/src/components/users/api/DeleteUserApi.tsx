import axios from 'axios';
import { UserApiData } from '../../../types/users';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const DeleteUserApi = async (adminId: number, user: UserApiData) => {
    if (!user.id) {
        throw new Error("User ID is required to delete user");
    }

    const url = `${BASE_URL}/api/users/${user.id}?admin_id=${adminId}`;

    try {
        const response = await axios.delete(url);
        return response.data;
    } catch (error) {
        const message = error?.response?.data?.error || error?.response?.data?.message || 'Error al eliminar usuario';
        throw new Error(String(message));
    }
}