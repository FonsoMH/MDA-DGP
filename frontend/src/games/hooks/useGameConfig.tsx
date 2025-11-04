import { useState, useEffect } from 'react';
import { fetchGameConfiguration } from '../api/gameConfigApi';
import { GameConfigFrontend } from '../../types/games';

/**
 * Custom Hook to load a game's configuration and manage the state.
 * @param {number} studentId - The student's ID.
 * @param {number} gameId - The game's ID.
 * @returns {{config: object | null, isLoading: boolean, error: string | null}}
 *
 */
export function useGameConfig( studentId: number, gameId: number ) {
    const [config, setConfig] = useState<GameConfigFrontend | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (!studentId || !gameId) return;

        const loadConfig = async () => {
            setIsLoading(true);
            
            const gameConfig = await fetchGameConfiguration(studentId, gameId);
            setConfig(gameConfig);
            
            setIsLoading(false);
            
        };

        loadConfig();

    }, [studentId, gameId]);

    return { config, isLoading };
}
