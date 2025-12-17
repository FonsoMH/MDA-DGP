import { useQuery } from '@tanstack/react-query';
import { fetchStudentStatistics } from '../api/studentStatisticsApi';


export const useStatistics = (studentId: number, gameId: number, initialDate: Date | null, finalDate: Date | null) => {
    
    return useQuery({
        
        queryKey: ['statistics', studentId, gameId, initialDate, finalDate],
        
        queryFn: () => fetchStudentStatistics(studentId, gameId, initialDate, finalDate),

        enabled: !!studentId && gameId !== undefined,
    
        staleTime: 10 * 60 * 1000, // 10 minutes

        retry: false,
    });
}

