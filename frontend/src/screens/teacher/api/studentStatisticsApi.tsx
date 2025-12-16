import axios from "axios";
import { StudentStatisticsApiData, StudentStatisticsFrontend } from "../../../types/statistics";


import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';


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
            return {
                gameId: gameId,
                totalPlays: 0,
                successfulPlays: 0,
                failedPlays: 0,
                abandonPlays: 0,
                times: [],
                initialDate: initialDate ? initialDate.toISOString() : null,
                finalDate: finalDate ? finalDate.toISOString() : null,
<<<<<<< HEAD
            }
=======
            };
>>>>>>> Develop
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
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message; 

            throw new Error(message);
        }
        throw error;
    }
}

// Helper para arreglar tipos si TS se queja
const FS = FileSystem as any;
const { StorageAccessFramework } = FS;

export const exportStudentGameStatisticsCsv = async (
    studentId: number, 
    gameId: number
) => {
    try {
        const filename = `stats_student_${studentId}${gameId === ALL_GAMES_ID ? '_all_games' : `_game_${gameId}`}.csv`;
        
        // 1. Obtener los datos (CSV String)
        const response = await fetch(`${BASE_URL}/api/statistics/${studentId}${gameId === ALL_GAMES_ID ? '' : `/${gameId}`}/csv`, {
        });

        if (!response.ok) throw new Error("Error descargando datos");
        const csvData = await response.text();

        // ============================================================
        //  OPCIÓN A: ANDROID (Usar "Guardar como..." nativo)
        // ============================================================
        if (Platform.OS === 'android') {
            // 1. Pedir permiso al usuario para acceder a una carpeta
            const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

            if (permissions.granted) {
                // 2. Crear el archivo en la carpeta elegida por el usuario
                const uri = await StorageAccessFramework.createFileAsync(
                    permissions.directoryUri,
                    filename,
                    'text/csv' // Tipo MIME
                );

                // 3. Escribir los datos en ese archivo
                await FileSystem.writeAsStringAsync(uri, csvData, {
                    encoding: 'utf8' as any
                });
            } else {
                // El usuario canceló la selección de carpeta
                throw new Error("Permiso de carpeta no concedido.");
            }
        } 
        
        // ============================================================
        //  OPCIÓN B: iOS (El menú compartir tiene "Guardar en Archivos")
        // ============================================================
        else {
            // En iOS necesitamos guardar temporalmente primero
            const fileUri = `${FS.cacheDirectory}${filename}`;
            
            await FileSystem.writeAsStringAsync(fileUri, csvData, {
                encoding: 'utf8' as any
            });

            await Sharing.shareAsync(fileUri, {
                mimeType: 'text/csv',
                UTI: 'public.comma-separated-values-text',
                dialogTitle: 'Guardar CSV'
            });
        }

    } catch (e) {
        throw e;
    }
};