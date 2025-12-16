import { useState } from 'react';
import { createAdminApi } from '../api/userApi';
import { useUser } from '../../../hooks/useUser';

export type CreateAdminPayload = {
  name: string;
  email: string;
  password: string;
};

export function useCreateAdmin() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useUser();

  const onSubmitForm = async (payload: CreateAdminPayload): Promise<boolean> => {
    setError(null);
    setIsSubmitting(true);
    try {
  // En el futuro, si backend emite JWT, incluimos el token sin romper el cliente actual
  const token = (user as any)?.token as string | undefined;
  await createAdminApi(payload, token);
      return true;
    } catch (e: any) {
      setError(e);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, error, onSubmitForm };
}