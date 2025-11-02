import axios, { AxiosError } from "axios"
import { FeedbackData } from "../../types/feedback";
import Constants from 'expo-constants'; 

const BASE_URL = Constants.expoConfig?.extra?.REACT_APP_API_BASE_URL;

//TODO definir
const DEFAULT_INFO: FeedbackData = {
    url: '../../../assets/favicon.png',
    texto: "Sigue asi makina"
}

export const FeedBackApi = async () => {
    try {

        const response = await axios.get< FeedbackData>(`${BASE_URL}/feedback`);

        return response.data;

        

    } catch (error) {

        const axiosError = error as AxiosError;

        console.error(`Error: ${axiosError.message}`);
        console.error(`Code: ${axiosError.code}`);
        
        return DEFAULT_INFO;
    }
}