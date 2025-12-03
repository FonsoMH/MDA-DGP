import axios from "axios";
import { StudentStatisticsApiData, StudentStatisticsFrontend } from "../../../types/statistics";

import { Directory , File , Paths } from 'expo-file-system';
import { Platform, Alert } from 'react-native';


const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_TIMEOUT = process.env.API_TIMEOUT;

const ALL_GAMES_ID = -1;


export async function fetchStudentStatistics(studentId: number, gameId: number, initialDate: Date | null, finalDate: Date | null): Promise<StudentStatisticsFrontend> {

    try {
        if (!studentId) {
            throw new Error("ID de estudiante es requerido para obtener estadísticas.");
        }

        const endpoint = `${BASE_URL}/api/statistics/${studentId}${gameId === ALL_GAMES_ID ? '' : `/${gameId}`}`;
        let urlWithParams = endpoint;

        const params = new URLSearchParams();

        if (initialDate) {
            params.append('initial_date', initialDate.toISOString());
        }
        if (finalDate) {
            params.append('final_date', finalDate.toISOString());
        }

        if (Array.from(params).length > 0) {
            urlWithParams += `?${params.toString()}`;
        }

        const response = await axios.get<StudentStatisticsApiData>(urlWithParams, {
            timeout: +API_TIMEOUT
        });
        

        if (!response.data || Object.keys(response.data).length === 0) {
            throw new Error("No se encontraron datos de estadísticas para los parámetros dados.");
        }

        const statsData = response.data;
        const mappedStats: StudentStatisticsFrontend = {
            gameId: statsData.game_id,
            totalPlays: statsData.total_plays,
            successfulPlays: statsData.successful_plays,
            failedPlays: statsData.failed_plays,
            abandonPlays: statsData.abandon_plays,
            times: statsData.times.map((time) => ({
                averageTime: time.average_time,
                dates: time.date,
            })),
            initialDate: statsData.initial_date,
            finalDate: statsData.final_date,
        };

        return mappedStats;
    } catch (error) {
        throw new Error(error);
    }
}

// export const exportStudentGameStatisticsCsv = async (
//     studentId: number, 
//     gameId: number, 
// ) => {
//     const url = `${BASE_URL}/api/statistics/${studentId}/${gameId}/csv`;
//     const filename = `student_${studentId}_game_${gameId}_stats.csv`;


//     try {

//         const response = await axios.get(url, {});
// 	console.log("llega");

//         const destination = new File(Paths.cache,`resultados-${studentId}-${gameId}.pdf`);
// 	console.log("llega2");

//         destination.write(await response.data);
// 	console.log("llega3");

//     } catch (error) {
//         console.log("Error al exportar CSV:", error);
//         Alert.alert('Error Inesperado', 'No se pudo completar la exportación.');
//     }
// };
