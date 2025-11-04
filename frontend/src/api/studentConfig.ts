import axios from 'axios';
import { API_BASE_URL } from '../config';

export type GameKey = 'toca-numero' | 'ordena-secuencia' | 'reparte-igual' | 'deja-igual';

export async function getAllConfig(studentId: number) {
  const url = `${API_BASE_URL}/api/students/${studentId}/config`;
  const res = await axios.get(url);
  return res.data;
}

export async function getConfig(studentId: number, slug: string) {
  const url = `${API_BASE_URL}/api/students/${studentId}/config/${slug}`;
  const res = await axios.get(url);
  return res.data;
}

export async function updateConfig(studentId: number, slug: string, payload: Partial<Record<string, any>>) {
  const url = `${API_BASE_URL}/api/students/${studentId}/config/${slug}`;
  const res = await axios.put(url, payload);
  return res.data;
}
