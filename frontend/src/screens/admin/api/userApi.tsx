import axios from "axios";
import { UserFrontend, UserApiData, CreateTeacherPayload, Student, PaginatedResponse, Teacher, CreateStudentPayload, UserDeletionData, PaginatedUsersResponse, PaginatedUsersApiResponse } from "../../../types/users";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_TIMEOUT = process.env.API_TIMEOUT;

const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Obtiene todos los usuarios y los mapea al formato frontend.
 * @returns {Promise<PaginatedUsersResponse>} Lista de usuarios adaptados.
 */
export async function fetchUsers(page: number, offset: number, limit: number, name: string = ''): Promise<PaginatedUsersResponse> {
  const endpoint = `${BASE_URL}/api/users`;

  try {
    const response = await axios.get<PaginatedUsersApiResponse>(endpoint, {
      timeout: API_TIMEOUT,
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
      },
      params: {
        page: page,
        offset: offset,
        page_size: limit,
        t: Date.now(),
        name: name
      }
    });
    const apiData = response.data;

    const mappedUsers: UserFrontend[] = apiData.items.map((u) => ({
      userId: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      assignedStudents: u.assignedStudents ?? [],
      studentsCount: u.studentsCount ?? 0,
      assignedTeacherId: u.assignedTeacherId ?? null,
    }));

    console.log("asdfhjiosdfjkahsdfhjklasdfhjkl");
    
    console.log(mappedUsers);
    

    return {
      items: mappedUsers,
      total_count: apiData.total_count,
      total_pages: apiData.total_pages,
      current_page: apiData.current_page,
      page_size: apiData.page_size
    }
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return {
      items: [],
      total_count: 0,
      total_pages: 0,
      current_page: 0
    };
  }
}

export async function fetchuserDeletion(): Promise<UserDeletionData[]> {
  const endpoint = `${BASE_URL}/api/users_deletion`;

  try {
    const response = await axios.get(endpoint, {
      timeout: API_TIMEOUT,
    });
    const apiData = response.data;

    const mappedDeletions: UserDeletionData[] = apiData.map((d) => ({
      deletionId: d.deletion_id,
      adminName: d.admin_name,
      deletedUserEmail: d.deleted_user_email,
      deletedUserName: d.deleted_user_name,
      deletedAt: d.deleted_at,
    }));

    return mappedDeletions;
  } catch (error) {
    console.error("Error al obtener el historial de eliminaciones:", error);
    return [];
  }
}

export async function loadStudentsApi(page :number, pageSize : number, offset: number): Promise<PaginatedResponse<Student>> {
  const endpoint = `${BASE_URL}/api/students/no_teacher`;

  try {
    
    const response = await axios.get<PaginatedResponse<Student>>(endpoint, {
        params: { page: page, page_size: pageSize, offset: offset },
        timeout: +API_TIMEOUT
      });
    const apiData = response.data;

    return apiData;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return {
      current_page: 0,
      items: [],
      total_count: 0,
      total_pages: 0
    };
  }
}

export async function loadTeachersApi(page :number, pageSize : number, offset: number): Promise<PaginatedResponse<Teacher>> {
  const endpoint = `${BASE_URL}/api/teachers`;

  try {
    const response = await axios.get<PaginatedResponse<Teacher>>(endpoint, {
        params: { page: page, page_size: pageSize, offset: offset },
        timeout: +API_TIMEOUT
      });
    const apiData = response.data;

    return apiData;
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return {
      current_page: 0,
      items: [],
      total_count: 0,
      total_pages: 0
    };
  }
}

export async function createTeacherApi(payload: CreateTeacherPayload): Promise<void> {
  const endpoint = `${BASE_URL}/api/teachers`;

  try {
    const response = await axios.post<any>(endpoint, payload, {
      timeout: API_TIMEOUT,
    });


  } catch (error) {
    console.error("Error al obtener usuarios:", error);

  }
}

export async function createStudentApi(payload: CreateStudentPayload): Promise<void> {
  const endpoint = `${BASE_URL}/api/students`;

  try {
    const response = await axios.post<any>(endpoint, payload, {
      timeout: API_TIMEOUT,
    });


  } catch (error) {
    console.error("Error al obtener usuarios:", error);

  }
}

export async function createAdminApi(payload: { name: string; email: string; password: string }, token?: string): Promise<void> {
  const endpoint = `${BASE_URL}/api/admins`;

  try {
    await axios.post<any>(endpoint, payload, {
      timeout: API_TIMEOUT,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  } catch (error) {
    console.error('Error creando administrador:', error);
    throw error;
  }
}