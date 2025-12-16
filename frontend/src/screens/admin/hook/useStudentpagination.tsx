import { useState, useEffect, useCallback } from 'react';
import { loadStudentsApi } from '../api/userApi';
import { Student } from '../../../types/users';

const PAGE_SIZE = 5;

export function useStudentPagination() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<Error | null>(null);

  const fetchStudents = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    setCurrentPage(p);

    try {
      const offset = (p-1) * PAGE_SIZE;
      const response = await loadStudentsApi(p, PAGE_SIZE, offset);

      const studentsData: Student[] = response.items.map((u: Student) => ({
        id: u.id,
        name: u.name,
        email: u.email,
      }));

      setStudents(studentsData);
      setTotalPages(response.total_pages || 1);
      
    } catch (e: any) {
      setError(e);
      setStudents([]);
      
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(1);
  }, [fetchStudents]);

  const changePage = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
        fetchStudents(newPage);
    }
  };

  return { 
    students, 
    isLoading, 
    totalPages,
    currentPage,
    error,
    changePage,
    reload: () => fetchStudents(currentPage)
  };
}