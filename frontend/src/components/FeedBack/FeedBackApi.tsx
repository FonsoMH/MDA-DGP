import axios from "axios"

//TODO sacar de las variables de entorno
const API_URl = 'http://localhost:5000';

//TODO definir
const DEFAULT_INFO;

export interface FeedbackData {
    url: string;
    texto: string;
}

interface BackendResponse<T> {
    success: boolean,
    data?: T,
    message?: string
}

export const FeedBackApi = async () => {
    try {

        const response: BackendResponse<FeedbackData> = axios.get< BackendResponse<FeedbackData> >(`${API_URl}/feedback`);

        if (response.success){
            return 
        }

    } catch (error) {
        
    }
}

// return jsonify({
//     "background_url": "/static/default_bg.jpg",
//     "message": "No se encontró feedback para este resultado."
//     }) 