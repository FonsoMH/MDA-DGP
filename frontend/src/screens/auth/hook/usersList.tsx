import { useState, useEffect, useCallback } from 'react';
import { fetchClasses, fetchStudentsByClass } from '../api/loginApi';
import { Classes, StudentLogin } from '../../../types/login';


interface UseStudentsDataResult {
    users: PaginatedStudentsResponse;
    isLoading: boolean;
    refetch: () => void;
}

interface UseClassesDataResult {
    classes: Classes[];
    isLoading: boolean;
    refetch: () => void;
}

/**
 * Custom hook for fetching the list of student users from the backend.
 * Manages loading state and errors.
 * @returns An object with the list of users, loading status, error, and a refetch function.
 */
export const useStudentsData = (idClass: number): UseStudentsDataResult => {
    const [users, setUsers] = useState<StudentLogin[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadStudents = useCallback(async () => {
        setIsLoading(true);
        
        const data = await fetchStudentsByClass(idClass);
        
        setUsers(data);
        
        setIsLoading(false);
        
    }, []);

    useEffect(() => {
        loadStudents();
    }, [loadStudents]);

    return { users, isLoading, refetch: loadStudents };
};

export const useClassesData = (): UseClassesDataResult => {
    const [classes, setClasses] = useState<Classes[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadStudents = useCallback(async () => {
        setIsLoading(true);
        
        const data = await fetchClasses();
        
        setClasses(data);
        
        setIsLoading(false);
        
    }, []);

    useEffect(() => {
        loadStudents();
    }, [loadStudents]);

    return { classes, isLoading, refetch: loadStudents };
};
