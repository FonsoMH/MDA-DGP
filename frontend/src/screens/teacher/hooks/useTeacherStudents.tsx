import * as React from 'react';
import { getStudentsForTeacher } from '../../../api/teachers';
import type { Student } from '../../../types/users';
import { useState } from 'react';

const PAGE_SIZE = 1;

export function useTeacherStudents(teacherId?: number) {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
<<<<<<< HEAD
  const [error, setError] = React.useState<Error | null>(null);
=======
  const [error, setError] = React.useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
>>>>>>> Develop

  const load = React.useCallback(async (p: number) => {
    if (!teacherId) return;
    setLoading(true);
    setError(null);
    setCurrentPage(p);
    try {
<<<<<<< HEAD
      const data = await getStudentsForTeacher(teacherId);
      setStudents(data);
    } catch (e) {
      setError(e as Error);
=======
      const offset = (p -1 ) * PAGE_SIZE;

      const data = await getStudentsForTeacher(teacherId, p, offset, PAGE_SIZE);

      setStudents(data.items);
      setTotalPages(data.total_pages || 1);

    } catch (e: any) {
      setError(e?.message || 'Error cargando estudiantes');
>>>>>>> Develop
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
        load(newPage);
    }
  };

  React.useEffect(() => {
    load(1);
  }, [load]);


  return { 
    students, 
    loading, 
    totalPages,
    currentPage,
    error,
    changePage,
    reload: () => load(currentPage)
  };
}
