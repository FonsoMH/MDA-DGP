import { useState } from 'react';
import { CreateStudentPayload } from '../../../types/users';
import { createStudentApi } from '../api/userApi';

/**
 * Hook para manejar la creación de un estudiante, el estado de carga y la navegación.
 * @param navigation Objeto de navegación para redirigir tras el éxito.
 */
export function useCreateStudent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmitFrom = async (payload: CreateStudentPayload): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);
    
    console.log("hola?");
    

    try {
      await createStudentApi(payload);
      
      alert('Estudiante creado correctamente');
      return true;

    } catch (e: any) {
      const errorMessage = e?.response?.data?.message || e.message || 'Error desconocido';
      setError(errorMessage);
      alert(`Error creando estudiante: ${errorMessage}`);
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