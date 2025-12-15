import axios from 'axios';
import type { PaginatedResponse, PaginatedUsersResponse, Student, UserFrontend } from '../types/users';
import { PaginatedStudentsResponse } from '../types/login';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_TIMEOUT = process.env.API_TIMEOUT;

// Respuesta esperada del backend:
// {
//   teacher: { id, name, email },
//   students: [ { id, name, email }, ... ]
// }
type TeacherStudentsResponse = {
  teacher?: { id: number; name: string; email: string };
  students?: Array<{ id?: number; user_id?: number; student_id?: number; name?: string; email?: string }>;
} | any[]; // defensivo por si el backend devuelve array directo

export async function getStudentsForTeacher(teacherId: number, page: number, offset: number, limit: number): Promise<PaginatedResponse<Student>> {
  const endpoint = `${BASE_URL}/api/teachers/${teacherId}/students`;
  
  
  try {
    const response = await axios.get<PaginatedResponse<Student>>(endpoint, {
      timeout: API_TIMEOUT,
      params: {
        page: page,
        offset: offset,
        page_size: limit,

      }
    });

    const apiData = response.data;

    return apiData;
  } catch (e) {
    return {
      items: [],
      total_count: 0,
      total_pages: 0,
      current_page: 0
    };
  }
}
