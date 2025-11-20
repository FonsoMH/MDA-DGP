import { useState, useEffect } from 'react';
import { useGameConfig } from '../hooks/useGameConfig';
import { DEFAULT_REPEATS } from './gameUtils';
import { useUser } from '../../../hooks/useUser';

/**
 * @file Manages the core game loop and state for a game session.
 * This hook orchestrates fetching game configuration, tracking rounds, managing score,
 * and handling game progression (advancing rounds, ending the game).
 */

/**
 * A custom hook to manage the central logic and state of a game.
 *
 * @param {number} studentId - The ID of the student playing the game.
 * @param {number} gameId - The ID of the game being played.
 * @param {(maxRange: number, optionsCount: number) => void} onGameInit - A callback function
 * that sets up a new game round. The hook calls this with the correct parameters
 * when the game starts and before each subsequent round.
 *
 * @returns {object} An object containing the game's state and handler functions:
 * - `config`: The loaded game configuration object.
 * - `isLoading`: Boolean, true if the game configuration is being fetched.
 * - `games`: The current round number (starts at 1).
 * - `modalVisible`: Boolean, true if the end-of-game modal should be displayed.
 * - `isGameInitialized`: Boolean, true after the first round has been initialized.
 * - `advanceGame`: A function to proceed to the next round or end the game.
 * - `resetGame`: A function to restart the game from the beginning.
 * - `score`: The player's current score.
 * - `updateScore`: A function to add or subtract points from the score.
 */
export const useGameManager = (
    gameId: number, 
    onGameInit: (
        maxRange: number, 
        optionsCount: number, 
        numberOptions?: number,
        sum?: boolean)
        => void
    ) => {

    const {user} = useUser();

    const { data: config, isLoading } = useGameConfig(user?.id ?? 0, gameId);
    
    const [games, setGames] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [isGameInitialized, setIsGameInitialized] = useState(false);

    const [score, setScore] = useState(0);

    const maxRange: number = config?.ranges ?? 10;
    const optionsCount = (config?.numElements ?? 9) as number;
    const numContainers = (config?.numContainers ?? 2) as number;
    const haveToSum = (config?.sum ?? false) as boolean;

    /**
     * Effect to initialize the first game round.
     * This runs once the configuration is successfully loaded (`!isLoading && config`)
     * and the game has not already been initialized.
     */
    useEffect(() => {
        if (!isLoading && config && !isGameInitialized) {
            onGameInit(maxRange, optionsCount, numContainers, haveToSum);
            setIsGameInitialized(true); 
        }
    }, [isLoading, config, isGameInitialized, onGameInit, maxRange, optionsCount]);

    /**
     * Advances the game to the next round or, if the final round is complete,
     * shows the end-game modal.
     */
    const advanceGame = () => {
        if (games === DEFAULT_REPEATS) {
            setModalVisible(true);
        } else {
            setTimeout(() => {
                onGameInit(maxRange, optionsCount, numContainers, haveToSum);
                setGames(prevGames => prevGames + 1);
            }, 700);
        }
    };

    /**
     * Adds or subtracts points from the total score.
     * Ensures the score never drops below zero.
     * @param {number} points - The number of points to add (positive) or subtract (negative).
     */
    const updateScore = (points: number) => {
        setScore(prevScore => {
            const newScore = prevScore + points;
            // Prevent the score from going negative.
            return newScore < 0 ? 0 : newScore;
        });
    };

    /**
     * Resets the game to its initial state to start over.
     * Typically called from the end-game modal.
     */
    const resetGame = () => {
        setGames(1);
        setModalVisible(false);
        onGameInit(maxRange, optionsCount, numContainers, haveToSum);
        updateScore(0);
    };

    return {
        config,
        isLoading,
        games,
        modalVisible,
        isGameInitialized,
        advanceGame,
        resetGame,
        score,
        updateScore
    };
};