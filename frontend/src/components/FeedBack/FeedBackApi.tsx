import axios from "axios"
import { FeedbackData } from "../../types/feedback";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_TIMEOUT = process.env.API_TIMEOUT;

const LOCAL_GIF_PRUEBA = '../../../assets/positive_feedback.gif';

//TODO definir
const DEFAULT_INFO: FeedbackData = {
    url: LOCAL_GIF_PRUEBA,
    texto: "¡Bien Jugado!"
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