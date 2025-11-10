import axios from "axios";
import { UserFrontend, UserApiData } from "../../types/users";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_TIMEOUT = process.env.API_TIMEOUT;


/**
 * Obtiene todos los usuarios y los mapea al formato frontend.
 * @returns {Promise<UserFrontend[]>} Lista de usuarios adaptados.
 */
export async function fetchUsers(): Promise<UserFrontend[]> {
  const endpoint = `${BASE_URL}/api/users`;

  try {
    const response = await axios.get<UserApiData[]>(endpoint, {
      timeout: API_TIMEOUT,
    });
    const apiData = response.data;

    const mappedUsers: UserFrontend[] = apiData.map((u) => ({
      userId: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      assignedStudents: u.assignedStudents ?? [],
      studentsCount: u.studentsCount ?? 0,
    }));

    return mappedUsers;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return [];
  }
}
