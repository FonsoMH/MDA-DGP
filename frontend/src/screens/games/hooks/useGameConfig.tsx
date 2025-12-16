import { useQuery } from '@tanstack/react-query';
import { fetchGameConfiguration } from '../api/gameConfigApi';
import { getStudentPermission } from '../../../api/studentConfig';

/**
 * A custom React hook to fetch the configuration for a specific game and student.
 *
 * This hook wraps `useQuery` from @tanstack/react-query to handle:
 * - Fetching the data using the `fetchGameConfiguration` API call.
 * - Caching the data based on a unique `queryKey` (['gameConfig', studentId, gameId]).
 * - Automatically re-fetching or using cached data as needed.
 * - Preventing the query from running if either `studentId` or `gameId` is missing.
 *
 * @param {number} studentId - The unique identifier for the student.
 * @param {number} gameId - The unique identifier for the game.
 * @returns {import('@tanstack/react-query').UseQueryResult}
 * The result object from `useQuery`. This includes properties like:
 * - `data`: The fetched game configuration (if successful).
 * - `isLoading`: Boolean, true if the query is in progress.
 * - `isError`: Boolean, true if the query resulted in an error.
 * - `error`: The error object (if an error occurred).
 * - `isSuccess`: Boolean, true if the query was successful.
 */
export const useGameConfig = (studentId: number, gameId: number) => {
    
    return useQuery({
        
        queryKey: ['gameConfig', studentId, gameId],
        
        queryFn: () => fetchGameConfiguration(studentId, gameId),

        enabled: !!studentId && !!gameId,
    });
};

export const useStudentPermission = (studentId: number) => {
    
    return useQuery({
        
        queryKey: ['studentPermission', studentId],
        
        queryFn: () => getStudentPermission(studentId),

        enabled: !!studentId,
    });
};