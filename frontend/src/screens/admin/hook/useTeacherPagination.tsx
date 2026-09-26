import { useState, useEffect, useCallback } from 'react';
import { loadTeachersApi } from '../api/userApi';
import { Teacher } from '../../../types/users';

const PAGE_SIZE = 1;

export function useTeacherPagination() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    setCurrentPage(p);

    try {
      const offset = (p -1 ) * PAGE_SIZE;

      const response = await loadTeachersApi(p, PAGE_SIZE, offset);

      const TeachersData: Teacher[] = response.items.map((u: Teacher) => ({
        id: u.id,
        name: u.name,
        email: u.email,
      }));

      setTeachers(TeachersData);
      setTotalPages(response.total_pages || 1);
      
    } catch (e: any) {
      console.error('Error en hook:', e);
      setError('No se pudieron cargar los profesores.');
      setTeachers([]);
      
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers(1);
  }, [fetchTeachers]);

  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
        fetchTeachers(newPage);
    }
  };

  return { 
    teachers, 
    isLoading, 
    totalPages,
    currentPage,
    error,
    changePage,
    reload: () => fetchTeachers(currentPage)
  };
}