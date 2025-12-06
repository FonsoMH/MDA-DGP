import { useState } from 'react';
import { createAdminApi } from '../api/userApi';

export type CreateAdminPayload = {
  name: string;
  email: string;
  password: string;
};

export function useCreateAdmin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmitForm = async (payload: CreateAdminPayload): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);
    try {
      await createAdminApi(payload);
      alert('Administrador creado correctamente');
      return true;
    } catch (e: any) {
      const errorMessage = e?.response?.data?.error || e?.message || 'Error desconocido';
      setError(errorMessage);
      alert(`Error creando administrador: ${errorMessage}`);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, error, onSubmitForm };
}