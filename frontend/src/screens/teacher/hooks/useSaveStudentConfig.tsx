import * as React from 'react';
import { updateConfig } from '../../../api/studentConfig'; // Asegúrate de que la ruta sea correcta
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook personalizado para manejar el guardado de la configuración de un juego
 * específico para un estudiante.
 * @param studentId El ID del estudiante.
 * @param configs El objeto de configuración completo del estudiante.
 */
export function useSaveStudentConfig(studentId: number, configs: any) {
  const [saving, setSaving] = React.useState(false);

  const saveOne = React.useCallback(async (gameId: number) => {
    if (saving) return; 

    try {
      setSaving(true);

      const payload = configs[gameId]?.settings || {};
      
      await updateConfig(studentId, gameId, payload);
      
    } catch (error) {
      console.error(`Error al guardar la configuración del juego ${gameId}:`, error);
      
    } finally {
      setSaving(false);
    }
  }, [studentId, configs, saving]); 

  return { saveOne, saving };
}

export const useUpdateGameConfig = (studentId: number, gameId: number) => {
  
  // Obtenemos el cliente de cache
  const queryClient = useQueryClient();
  
  return useMutation({
    // La función que se ejecuta al mutar
    mutationFn: (payload: Partial<Record<string, any>>) => updateConfig(studentId, gameId, payload),
    
    onSuccess: (data, variables) => {
      
      // La clave de la query que quieres refrescar es: ['gameConfig', studentId, gameId]
      const queryKeyToInvalidate = ['gameConfig', studentId, gameId];
      
      // Invalida la query: la marca como 'stale'
      queryClient.invalidateQueries({ 
          queryKey: queryKeyToInvalidate
      });
      
      // Opcional, pero muy recomendado: Refresca inmediatamente la query
      // Esto fuerza un refetch en background al instante, actualizando la UI
      queryClient.refetchQueries({ 
          queryKey: queryKeyToInvalidate, 
          exact: true // asegura que solo se refresque esta clave exacta
      });
      
    },
    
  });
};