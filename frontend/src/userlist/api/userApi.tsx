import axios from "axios";
import { UserFrontend, UserApiData } from "../../types/users";

//const BASE_URL = Constants.expoConfig?.extra?.REACT_APP_API_BASE_URL || 'http://localhost:5000';
//const API_TIMEOUT = Constants.expoConfig?.extra?.API_TIMEOUT;

const BASE_URL = "http://localhost:5000";
const API_TIMEOUT = 3000;


/**
 * Obtiene todos los usuarios y los mapea al formato frontend.
 * @returns {Promise<UserFrontend[]>} Lista de usuarios adaptados.
 */
export async function fetchUsers(): Promise<UserFrontend[]> {
  const endpoint = `${BASE_URL}/users`;

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
