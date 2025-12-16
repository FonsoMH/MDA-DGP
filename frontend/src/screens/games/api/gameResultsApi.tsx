import axios from 'axios';

export interface GameResultPayload {
	student_id: number;
	game_id: number;
	successful_plays: number;
	failed_plays: number;
	abandoned: boolean;
	time_seconds: number;
}

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL as string | undefined;
const TIMEOUT = parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '5000', 10);

export async function postGameResult(payload: GameResultPayload): Promise<void> {
	if (!BASE_URL) {
		throw new Error('EXPO_PUBLIC_API_BASE_URL no está definida en .env');
	}
	await axios.post(`${BASE_URL}/api/statistics/game_result/`, payload, {
		timeout: TIMEOUT,
	});
}

