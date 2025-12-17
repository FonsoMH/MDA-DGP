import { useState } from 'react';
import { CreateTeacherPayload } from '../../../types/users';
import { createTeacherApi } from '../api/userApi';

/**
 * Hook para manejar la creación de un tutor, el estado de carga y la navegación.
 * @param navigation Objeto de navegación para redirigir tras el éxito.
 */
export function useCreateTeacher() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const onSubmitFrom = async (payload: CreateTeacherPayload): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);

    try {
      await createTeacherApi(payload);
      
      return true;

    } catch (e: any) {
      setError(e);
      return false;

    } finally {
      setIsSubmitting(false);
    }
  };

  return { 
    isSubmitting, 
    error,
    onSubmitFrom
  };
}