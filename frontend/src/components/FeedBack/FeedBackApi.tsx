import axios, { AxiosError } from "axios"
import { FeedbackData } from "../../types/feedback";

//TODO sacar de las variables de entorno
const API_URl = 'http://localhost:5000';

//TODO definir
const DEFAULT_INFO: FeedbackData = {
    url: "",
    texto: "Sigue asi makina"
}

export const FeedBackApi = async () => {
    try {

        const response = await axios.get< FeedbackData>(`${API_URl}/feedback`);

        return response.data;

        

    } catch (error) {

        const axiosError = error as AxiosError;

        console.error(`Error: ${axiosError.message}`);
        console.error(`Code: ${axiosError.code}`);
        
        return DEFAULT_INFO;
    }
}

// return jsonify({
//     "background_url": "/static/default_bg.jpg",
//     "message": "No se encontró feedback para este resultado."
//     }) 