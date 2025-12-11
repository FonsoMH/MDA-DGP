import { useState } from 'react';
import { CreateTeacherPayload } from '../../../types/users';
import { createTeacherApi } from '../api/userApi';

/**
 * Hook para manejar la creación de un tutor, el estado de carga y la navegación.
 * @param navigation Objeto de navegación para redirigir tras el éxito.
 */
export function useCreateTeacher() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmitFrom = async (payload: CreateTeacherPayload): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);

    try {
      await createTeacherApi(payload);
      
      alert('Tutor creado correctamente');
      return true;

    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e.message || 'Error desconocido';
      setError(errorMessage);
      alert(`Error creando tutor: ${errorMessage}`);
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