import axios from 'axios';
import type { Student } from '../types/users';

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

export async function getStudentsForTeacher(teacherId: number): Promise<Student[]> {
  const endpoint = `${BASE_URL}/api/teachers/${teacherId}/students`;
  
  
  try {
    const response = await axios.get<TeacherStudentsResponse>(endpoint, {
      timeout: API_TIMEOUT,
    });
    const payload = response.data;

    // Soporta ambos formatos: objeto con { students } o array directo
    const studentsArray: any[] = Array.isArray(payload)
      ? payload
      : (payload?.students ?? []);

    const normalized: Student[] = studentsArray
      .map((s: any) => ({
        id: s?.id ?? s?.user_id ?? s?.student_id,
        name: s?.name ?? '',
        email: s?.email ?? '',
      }))
      .filter((s) => typeof s.id === 'number');

    return normalized;
  } catch (e) {
    // En caso de error de red o de formato, devolvemos lista vacía para no romper la UI
    return [];
  }
}
