import axios from 'axios';
import { API_BASE_URL } from '../config';
import type { Student } from '../types/users';

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
  const url = `${API_BASE_URL}/api/teachers/${teacherId}/students`;
  try {
    const res = await axios.get<TeacherStudentsResponse>(url);
    const payload = res.data;

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
