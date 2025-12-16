import * as React from 'react';
import { updateConfig } from '../../../api/studentConfig'; // Asegúrate de que la ruta sea correcta
import { useMutation, useQueryClient } from '@tanstack/react-query';


export function useSaveStudentConfig(studentId: number, configs: any) {
<<<<<<< HEAD
  const [saving, setSaving] = React.useState(false);
  const [errorSaving, setErrorSaving] = React.useState<Error | null>(null);
  
  const saveOne = React.useCallback(async (slug: string) => {
    if (saving) return; 

    try {
      setSaving(true);
      setErrorSaving(null);

      const payload = configs[slug]?.settings || {};
=======
  
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ gameId, payload }: { gameId: number , payload: any }) => 
        updateConfig(studentId, Number(gameId), payload),

    onSuccess: (data, variables) => {
      const queryKeyToInvalidate = ['gameConfig', studentId, Number(variables.gameId)];
>>>>>>> Develop
      
      queryClient.invalidateQueries({ 
          queryKey: queryKeyToInvalidate,
          refetchType: 'active'
      });
      
<<<<<<< HEAD
    } catch (error) {
      setErrorSaving(error);
    } finally {
      setSaving(false);
=======
    },
    
    onError: (error) => {
        console.error("Fallo la mutación del juego:", error);
>>>>>>> Develop
    }
  });

<<<<<<< HEAD
  return { saveOne, saving , errorSaving };
=======
  const saveOne = React.useCallback(async (gameId: number ) => {
    
    const payload = configs[gameId]?.settings || {};

    mutation.mutate({ gameId, payload });

  }, [studentId, configs, mutation.mutate]); 
  
  return { 
    saveOne, 
    saving: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError
  };
>>>>>>> Develop
}