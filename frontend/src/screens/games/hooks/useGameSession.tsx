import { useCallback, useRef, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { DEFAULT_REPEATS } from '../utils/gameUtils';
import { useUser } from '../../../hooks/useUser';


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

  const submitSession = async (finalStats: SessionStats) => {
    if (!user?.id || !gameId) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/statistics/game_result/`, {
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

  const completeSession = useCallback(async (overrideStats?: SessionStats) => {
    if (submittedRef.current) return;
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

  return { currentRound, startRound, registerError, resolveRound, completeSession, resetSession, hasErrorThisRound: roundStateRef.current.hasError, stats, isSubmitting, submitError };
}
