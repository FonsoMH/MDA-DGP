import axios, { AxiosError } from "axios";
import { GameConfigFrontend, GameConfigApiData } from "../../types/games";
import Constants from 'expo-constants'; 

const BASE_URL = Constants.expoConfig?.extra?.REACT_APP_API_BASE_URL;

const DEFAULT_CONFIG = {
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
    console.log(`Fetching config from: ${endpoint}`);

    try {
        const response = await axios.get<GameConfigApiData>(endpoint);
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

        const axiosError = error as AxiosError;

        if (axiosError.response) {
            console.error(`API returned status ${axiosError.response.status}. Using default config.`);
        } else if (axiosError.request) {
            console.error("Error connecting to backend API: No response received.");
        } else {
            console.error("Error setting up request:", axiosError.message);
        }
        

        return DEFAULT_CONFIG;
    }
}
