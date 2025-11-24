import * as React from 'react';
import { updateConfig } from '../../../api/studentConfig'; // Asegúrate de que la ruta sea correcta

/**
 * Hook personalizado para manejar el guardado de la configuración de un juego
 * específico para un estudiante.
 * @param studentId El ID del estudiante.
 * @param configs El objeto de configuración completo del estudiante.
 */
export function useSaveStudentConfig(studentId: number, configs: any) {
  const [saving, setSaving] = React.useState(false);

  const saveOne = React.useCallback(async (slug: string) => {
    if (saving) return; 

    try {
      setSaving(true);

      const payload = configs[slug]?.settings || {};
      
      await updateConfig(studentId, slug, payload);
      
    } catch (error) {
      console.error(`Error al guardar la configuración del juego ${slug}:`, error);
      
    } finally {
      setSaving(false);
    }
  }, [studentId, configs, saving]); 

  return { saveOne, saving };
}