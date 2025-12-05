export interface StudentStatisticsApiData {
    game_id: number;
    total_plays: number;
    successful_plays: number;
    failed_plays: number;
    abandon_plays: number;
    times: {
        average_time: number;
        date: string;
    }[];
    initial_date: string | null;
    final_date: string | null;
}

export interface StudentStatisticsFrontend {
    gameId: number;
    totalPlays: number;
    successfulPlays: number;
    failedPlays: number;
    abandonPlays: number;
    times: {
        averageTime: number;
        dates: string;
    }[];
    initialDate: string | null;
    finalDate: string | null;
}