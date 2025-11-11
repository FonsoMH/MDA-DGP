// Safe access to Expo public env var with fallback for web/typing
const base = (typeof process !== 'undefined' && (process as any).env?.EXPO_PUBLIC_API_URL) || 'http://localhost:5000';
export const API_BASE_URL = base;

