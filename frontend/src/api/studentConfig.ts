import axios from 'axios';

export type GameKey = 'toca-numero' | 'ordena-secuencia' | 'reparte-igual' | 'deja-igual';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function getAllConfig(studentId: number) {
  const url = `${BASE_URL}/api/students/${studentId}/config`;
  const res = await axios.get(url);
  return res.data;
}

export async function getConfig(studentId: number, slug: string) {
  const url = `${BASE_URL}/api/students/${studentId}/config/${slug}`;
  const res = await axios.get(url);
  return res.data;
}

export async function updateConfig(studentId: number, slug: string, payload: Partial<Record<string, any>>) {
  const url = `${BASE_URL}/api/students/${studentId}/config/${slug}`;
  const res = await axios.put(url, payload);
  return res.data;
}
