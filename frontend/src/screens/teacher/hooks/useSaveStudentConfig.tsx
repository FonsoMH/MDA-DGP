import * as React from 'react';
import { updateConfig } from '../../../api/studentConfig'; // Asegúrate de que la ruta sea correcta
import { useMutation, useQueryClient } from '@tanstack/react-query';


export function useSaveStudentConfig(studentId: number, configs: any) {
  
  const [savingError, setErrorSaving] = React.useState<Error | null>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ gameId, payload }: { gameId: number , payload: any }) => 
        updateConfig(studentId, Number(gameId), payload),

    onSuccess: (data, variables) => {
      const queryKeyToInvalidate = ['gameConfig', studentId, Number(variables.gameId)];
      
      queryClient.invalidateQueries({ 
          queryKey: queryKeyToInvalidate,
          refetchType: 'active'
      });
      
    },
    
    onError: (error) => {
      if (error instanceof Error) {
        setErrorSaving(error);
      } else {
        setErrorSaving(new Error('An unknown error occurred'));
      }
    }
  });

  const saveOne = React.useCallback(async (gameId: number ) => {
    
    const payload = configs[gameId]?.settings || {};

    mutation.mutate({ gameId, payload });

  }, [studentId, configs, mutation.mutate]); 
  
  return { 
    saveOne, 
    saving: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError, 
    errorSaving: savingError
  };
}