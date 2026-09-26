import axios from 'axios';

export type GameKey = 'toca-numero' | 'ordena-secuencia' | 'reparte-igual' | 'deja-igual';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export async function getAllConfig(studentId: number) {
  const url = `${BASE_URL}/api/students/${studentId}/config`;
  const res = await axios.get(url);
  return res.data;
}

export async function getConfig(studentId: number, gameId: number) {
  const url = `${BASE_URL}/api/students/${studentId}/config/${gameId}`;
  const res = await axios.get(url);
  return res.data;
}

export async function updateConfig(studentId: number, gameId: number, payload: Partial<Record<string, any>>) {
  const url = `${BASE_URL}/api/students/${studentId}/config/${gameId}`;
  const res = await axios.put(url, payload);
  return res.data;
}

export async function updateStudentPermission(studentId: number, canConfigure: boolean) {
  const url = `${BASE_URL}/api/students/${studentId}/config/permission`;
  const res = await axios.put(url, { student_can_configure: canConfigure });
  return res.data;
}

export async function getStudentPermission(studentId: number) {
  const url = `${BASE_URL}/api/students/${studentId}/config/permission`;
  const res = await axios.get(url);
  return res.data;
}
