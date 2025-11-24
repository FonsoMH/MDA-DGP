// import { useState, useEffect } from 'react';
// import { GameStatisticsFrontend, StudentStatisticsFrontend } from '../../../types/statistics';
// import { fetchAllStudentStatistics, fetchStudentStatistics } from '../api/studentStatisticsApi';

// interface UseStatisticsResult {
//     statistics: StudentStatisticsFrontend | undefined;
//     isLoading: boolean;
//     error: any;
// }

// export const useStatistics = (studentId: number, gameId: number, initialDate: Date | null, finalDate: Date | null): UseStatisticsResult => {
//     const [statistics, setStatistics] = useState<StudentStatisticsFrontend | undefined>(undefined);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<any>(null);

//     useEffect(() => {
//         const loadStatistics = async () => {
//             setIsLoading(true);
//             setError(null);
//             try {
                
//                 if (gameId === -1) {
//                     const allStats = await fetchAllStudentStatistics(studentId);
//                     setStatistics(allStats);
//                 } else if (statistics && statistics[gameId]) {
//                     return;
//                 }else {
//                     const gameStats = await fetchStudentStatistics(studentId, gameId, initialDate, finalDate);
//                     setStatistics((prevStats) => ({
//                         ...prevStats,
//                         [gameId]: gameStats,
//                     }));
//                 }
                    
//             }catch (err) {
//                 console.error("Error loading statistics:", err);
//                 setError(err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         loadStatistics();
//     }, [studentId]);

//     return { statistics, isLoading, error };
// };

import { useQuery } from '@tanstack/react-query';
import { fetchStudentStatistics } from '../api/studentStatisticsApi';


export const useStatistics = (studentId: number, gameId: number, initialDate: Date | null, finalDate: Date | null) => {
    
    return useQuery({
        
        queryKey: ['statistics', studentId, gameId, initialDate, finalDate],
        
        queryFn: () => fetchStudentStatistics(studentId, gameId, initialDate, finalDate),

        enabled: !!studentId && gameId !== undefined,
    
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

