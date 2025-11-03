import axios from "axios"
import { FeedbackData } from "../../types/feedback";
import Constants from 'expo-constants'; 

const BASE_URL = Constants.expoConfig?.extra?.REACT_APP_API_BASE_URL;
const API_TIMEOUT = Constants.expoConfig?.extra?.API_TIMEOUT;

//TODO definir
const DEFAULT_INFO: FeedbackData = {
    url: '../../../assets/favicon.png',
    texto: "Sigue asi makina"
}

/**
 * Fetches feedback data from the API.
 * This asynchronous function performs a GET request to the `/feedback` endpoint.
 * It uses a defined timeout and provides robust error handling.
 * If the request is successful, it returns the `FeedbackData`.
 * If the request fails (e.g., timeout, network error), it returns the 
 * `DEFAULT_INFO` object as a fallback.
 *
 * @async
 * @function FeedBackApi
 * @returns {Promise<FeedbackData>} A promise that resolves to the FeedbackData object
 * from the API, or to `DEFAULT_INFO` if an error occurs.
 */
export const FeedBackApi = async (): Promise<FeedbackData> => {
    try {

        const response = await axios.get< FeedbackData>(`${BASE_URL}/feedback`, { 
            timeout: +API_TIMEOUT 
        });

        return response.data;

        

    } catch (error) {
        
        return DEFAULT_INFO;
    }
}