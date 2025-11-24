import axios from "axios";
import { StudentStatisticsApiData, StudentStatisticsFrontend } from "../../../types/statistics";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_TIMEOUT = process.env.API_TIMEOUT;


export async function fetchStudentStatistics(studentId: number, gameId: number, initialDate: Date | null, finalDate: Date | null): Promise<StudentStatisticsFrontend> {
    if (!studentId) {
        console.error("fetchAllStudentStatistics: studentId faltante.");
        return null;
    }

    console.log("Fetching statistics for studentId:", studentId, "gameId:", gameId, "initialDate:", initialDate, "finalDate:", finalDate);

    const endpoint = `${BASE_URL}/api/statistics/${studentId}/${gameId}/`;
    let urlWithParams = endpoint;

    const params = new URLSearchParams();
    if (initialDate) {
        params.append('initial_date', initialDate.toISOString());
    }
    if (finalDate) {
        params.append('final_date', finalDate.toISOString());
    }
    console.log("Initial date:", initialDate, "Final date:", finalDate);
    if (Array.from(params).length > 0) {
        urlWithParams += `?${params.toString()}`;
    }

    try {
        const response = await axios.get<StudentStatisticsApiData>(urlWithParams, {
            timeout: +API_TIMEOUT
        });
        console.log("API response data:", response.data);

        if (!response.data || Object.keys(response.data).length === 0) {
            console.warn("No se recibieron datos de estadísticas del estudiante.");
            return null;
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

        console.log("Fetched and mapped statistics:", mappedStats);
        return mappedStats;
    } catch (error) {
        console.error("Error fetching all student statistics:", error);
        return null;
    }
}