import { useState } from 'react';
import { CreateStudentPayload } from '../../../types/users';
import { createStudentApi } from '../api/userApi';

/**
 * Hook para manejar la creación de un estudiante, el estado de carga y la navegación.
 * @param navigation Objeto de navegación para redirigir tras el éxito.
 */
export function useCreateStudent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const onSubmitFrom = async (payload: CreateStudentPayload): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);
    

    try {
      await createStudentApi(payload);
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