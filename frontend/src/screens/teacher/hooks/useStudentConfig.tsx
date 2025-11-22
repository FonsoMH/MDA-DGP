import * as React from 'react';
// Asegúrate de importar la función de la API
import { getAllConfig } from '../../../api/studentConfig'; 

/**
 * Hook para cargar las configuraciones de juegos de un estudiante.
 * * @param studentId El ID del estudiante.
 * @returns {object} Un objeto que contiene:
 * - configs: El objeto de configuración de los juegos.
 * - loading: Booleano que indica si la carga está en curso.
 */
export function useStudentConfigs(studentId : number) {
  const [configs, setConfigs] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!studentId) {
        setConfigs({});
        setLoading(false);
        return;
    }

    const fetchConfigs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getAllConfig(studentId);

        setConfigs(data.games || {});
        
      } catch (err) {
        
        setError(err);
        setConfigs({});
        
      } finally {
        
        setLoading(false);
        
      }
    };

    fetchConfigs();
    
  }, [studentId]);

  return { configs, loading, error, setConfigs };
}