import axios from "axios";
import { GameConfigFrontend, GameConfigApiData } from "../../types/games";
import Constants from 'expo-constants'; 

const BASE_URL = Constants.expoConfig?.extra?.REACT_APP_API_BASE_URL;
const API_TIMEOUT = Constants.expoConfig?.extra?.API_TIMEOUT;

export const DEFAULT_CONFIG = {
    ranges: 10,
    numElements: 5,
    numContainers: 2,
    upward: true,
    sum: true,
};

/**
 * Retrieves the specific game configuration for a student.
 * @param {number} studentId - The student's ID.
 * @param {number} gameId - The game's ID.
 * @returns {Promise<object>} The mapped game configuration.
 */
export async function fetchGameConfiguration( studentId: number, gameId: number ): Promise<GameConfigFrontend>  {
    if (!studentId || !gameId) {
        console.error("fetchGameConfiguration: IDs faltantes.");
        return DEFAULT_CONFIG;
    }

    const endpoint = `${BASE_URL}/games/students/${studentId}/config/${gameId}`;

    try {

        const response = await axios.get<GameConfigApiData>(endpoint, { 
            timeout: +API_TIMEOUT 
        });
        const configData = response.data;
        
        const mappedConfig: GameConfigFrontend = {
            ranges: configData.ranges,
            numElements: configData.num_elements,
            numContainers: configData.num_containers,
            upward: configData.upward,
            sum: configData.sum,
        };
        
        return mappedConfig;

    } catch (error) {

        return DEFAULT_CONFIG;
    }
}
