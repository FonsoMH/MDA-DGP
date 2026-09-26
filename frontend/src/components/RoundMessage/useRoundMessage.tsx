import React, { useState, useEffect, useRef, useCallback } from "react";

// --- Hook Personalizado para la Lógica del Mensaje ---

/**
 * Hook para gestionar la visibilidad y el mensaje de una notificación temporal (entre rondas).
 * Devuelve una promesa que se resuelve cuando la notificación desaparece,
 * permitiendo un flujo de código "bloqueante" (await).
 * @returns {object} { message: string, isVisible: boolean, show: (msg: string, duration?: number) => Promise<void> }
 */
export function useRoundMessage() {
    const [message, setMessage] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const [type, setType] = useState<'success'|'error'|''>('');
    const timerRef = useRef(null);

    const show = useCallback((msg :string, duration = 1000, type: 'success'|'error'): Promise<void> => {
        return new Promise((resolve) => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            setMessage(msg);
            setIsVisible(true);
            setType(type);

            timerRef.current = setTimeout(() => {
                setIsVisible(false);
                setMessage('');
                setType('');
                resolve();
            }, duration);
        });
    }, []);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return { message, isVisible, type, show };
}