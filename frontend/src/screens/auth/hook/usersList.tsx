import { useState, useEffect, useCallback } from 'react';
import { fetchStudents } from '../api/loginApi';
import { StudentLogin } from '../../../types/login';


interface UseStudentsDataResult {
    users: StudentLogin[];
    isLoading: boolean;
    refetch: () => void;
}

/**
 * Custom hook for fetching the list of student users from the backend.
 * Manages loading state and errors.
 * @returns An object with the list of users, loading status, error, and a refetch function.
 */
export const useStudentsData = (): UseStudentsDataResult => {
    const [users, setUsers] = useState<StudentLogin[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadStudents = useCallback(async () => {
        setIsLoading(true);
        
        const data = await fetchStudents();
        
        setUsers(data);
        
        setIsLoading(false);
        
    }, []);

    useEffect(() => {
        loadStudents();
    }, [loadStudents]);

    return { users, isLoading, refetch: loadStudents };
};
