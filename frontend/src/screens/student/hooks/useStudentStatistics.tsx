import { StudentStatisticsFrontend } from '../../../types/statistics';
import { fetchStudentStatistics } from '../../teacher/api/studentStatisticsApi';
import React from 'react';

interface StudentStatistics {
    todayStats: StudentStatisticsFrontend | null;
    allStats: StudentStatisticsFrontend | null;
    error: Error | null;
    isLoading: boolean;
};

export const useStudentStatistics = (studentId: number, gameId: number): StudentStatistics => {

    const [todayStats, setTodayStats] = React.useState<StudentStatisticsFrontend | null>(null);
    const [allStats, setAllStats] = React.useState<StudentStatisticsFrontend | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<Error | null>(null);

    const load = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);

        console.log('Loading statistics for studentId:', studentId, 'gameId:', gameId);

        try {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

            const fetchedAllStats = await fetchStudentStatistics(
                studentId,
                gameId,
                null,
                null
            );
            
            const fetchedTodayStats = await fetchStudentStatistics(
                studentId,
                gameId,
                today,
                today
            );

            console.log('Fetched today stats:', fetchedTodayStats);

            setTodayStats(fetchedTodayStats);
            setAllStats(fetchedAllStats);
        } catch (err) {
            console.error('Error fetching student statistics:', err);
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    }, [studentId, gameId]);

    React.useEffect(() => {
        load();
    }, [load]);

    return {
        todayStats: todayStats,
        allStats: allStats,
        error,
        isLoading,
    };
    
};