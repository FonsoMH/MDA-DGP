import * as React from 'react';
import { getStudentsForTeacher } from '../../../api/teachers';
import type { Student } from '../../../types/users';

export function useTeacherStudents(teacherId?: number) {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStudentsForTeacher(teacherId);
      setStudents(data);
    } catch (e: any) {
      setError(e?.message || 'Error cargando estudiantes');
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  React.useEffect(() => {
    load();
  }, [load]);

  return { students, loading, error, refetch: load };
}
