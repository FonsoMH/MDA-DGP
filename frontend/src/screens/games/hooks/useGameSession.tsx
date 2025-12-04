import { useCallback, useRef, useState } from 'react';
import { postGameResult } from '../api/gameResultsApi';
import { DEFAULT_REPEATS } from '../utils/gameUtils';
import { useUser } from '../../../hooks/useUser';


const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_TIMEOUT = process.env.API_TIMEOUT;

interface SessionStats {
  successfulPlays: number;
  failedPlays: number;
  abandoned: boolean;
  timeSeconds: number;
}

interface UseGameSessionOptions { gameId: number; }

interface UseGameSessionApi {
  currentRound: number;
  startRound: () => void;
  registerError: () => void;
  resolveRound: () => void;
  completeSession: (overrideStats?: SessionStats) => Promise<void>;
  abandonSession: () => Promise<void>; // marcar sesión como abandonada y enviar parcial
  resetSession: () => void;
  hasErrorThisRound: boolean;
  stats: SessionStats;
  isSubmitting: boolean;
  submitError: string | null;
}

interface RoundState { hasError: boolean; startedAt: number; resolved: boolean; }

export function useGameSession({ gameId }: UseGameSessionOptions): UseGameSessionApi {
  const { user } = useUser();

  const [currentRound, setCurrentRound] = useState(1);
  const [stats, setStats] = useState<SessionStats>({ successfulPlays: 0, failedPlays: 0, abandoned: false, timeSeconds: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sessionStartRef = useRef<number | null>(null);
  const roundStateRef = useRef<RoundState>({ hasError: false, startedAt: 0, resolved: false });
  const submittedRef = useRef(false);

  const ensureSessionStart = () => { if (sessionStartRef.current == null) sessionStartRef.current = Date.now(); };

  const startRound = useCallback(() => {
    ensureSessionStart();
    if (roundStateRef.current.startedAt && !roundStateRef.current.resolved) return;
    roundStateRef.current = { hasError: false, startedAt: Date.now(), resolved: false };
  }, []);

  const registerError = useCallback(() => { if (!roundStateRef.current.resolved) roundStateRef.current.hasError = true; }, []);

  const applyRoundResultSync = (): SessionStats => {
    const { hasError } = roundStateRef.current;
    const updated: SessionStats = {
      ...stats,
      successfulPlays: stats.successfulPlays + (hasError ? 0 : 1),
      failedPlays: stats.failedPlays + (hasError ? 1 : 0),
      abandoned: stats.abandoned,
      timeSeconds: stats.timeSeconds,
    };
    setStats(updated);
    return updated;
  };

  const computeElapsedSeconds = () => {
    if (sessionStartRef.current == null) return 0;
    return Math.max(0, Math.round((Date.now() - sessionStartRef.current) / 1000));
  };

  const submitSession = async (finalStats: SessionStats) => {//es llamda dentro de complte para hacer el post, tiene q ser async
    if (!user?.id || !gameId) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await postGameResult({
        student_id: user.id,
        game_id: gameId,
        successful_plays: finalStats.successfulPlays,
        failed_plays: finalStats.failedPlays,
        abandoned: finalStats.abandoned,
        time_seconds: finalStats.timeSeconds,
      });
    } catch (e: any) {
      setSubmitError(e?.message || 'Error enviando resultados');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeSession = useCallback(async (overrideStats?: SessionStats) => { //la hago async para q no se haga una condicion de carrera
    if (submittedRef.current) return;
    //console.log(stats);
    const base = overrideStats ?? stats;
    const finalStats: SessionStats = { ...base, timeSeconds: computeElapsedSeconds() };
    setStats(finalStats);
    submittedRef.current = true;
    await submitSession(finalStats);
  }, [stats, gameId, user?.id]);

  const resolveRound = useCallback(() => {
    if (roundStateRef.current.resolved) return;
    roundStateRef.current.resolved = true;
    const updatedStats = applyRoundResultSync();
    if (currentRound === DEFAULT_REPEATS) {
      void completeSession(updatedStats);
    } else {
      setCurrentRound(r => r + 1);
      roundStateRef.current = { hasError: false, startedAt: 0, resolved: false };
    }
  }, [currentRound, stats, completeSession]);

  const resetSession = useCallback(() => {
    sessionStartRef.current = null;
    submittedRef.current = false;
    setCurrentRound(1);
    setStats({ successfulPlays: 0, failedPlays: 0, abandoned: false, timeSeconds: 0 });
    roundStateRef.current = { hasError: false, startedAt: 0, resolved: false };
    setSubmitError(null);
  }, []);

  const abandonSession = useCallback(async () => {
    if (submittedRef.current) return;
    // Número de rondas realmente resueltas (éxitos + fallos contabilizados por resolveRound)
    const resolvedRounds = stats.successfulPlays + stats.failedPlays;
    // Si el usuario abandona sin haber cerrado ninguna ronda, NO enviamos resultados (ruido)
    if (resolvedRounds === 0) {
      submittedRef.current = true; // Marcamos para no intentar enviar luego
      // Opcional: reflejar estado de abandono en UI/local sin post
      setStats(s => ({ ...s, abandoned: true }));
      return;
    }
    // Caso normal: calcular override y enviar parcial.
    let override: SessionStats = { ...stats, abandoned: true };
    const inProgress = !!roundStateRef.current.startedAt && !roundStateRef.current.resolved;
    if (inProgress && roundStateRef.current.hasError) {
      // Si hay una ronda iniciada con error sin resolver no la contamos como fallo para evitar inflar métricas.
      // si queremos contarla descomentar abajo
      //override = { ...override, failedPlays: override.failedPlays + 1 };
    }
    await completeSession(override);
  }, [stats, completeSession]);

  return { currentRound, startRound, registerError, resolveRound, completeSession, abandonSession, resetSession, hasErrorThisRound: roundStateRef.current.hasError, stats, isSubmitting, submitError };
}
