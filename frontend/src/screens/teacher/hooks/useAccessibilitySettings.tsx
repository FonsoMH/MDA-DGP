import { useState, useEffect } from 'react';
import { AccessibilitySettingsFrontend } from '../../../types/accessibility';
import { fetchAccessibilitySettings } from '../../../accessibilitySettings/api/accessibilitySettingsApi';

interface UseAccessibilitySettingsResult {
  settings: AccessibilitySettingsFrontend | undefined;
  defaultValue: AccessibilitySettingsFrontend | null;
  isLoading: boolean;
  error: any;
  setSettings: React.Dispatch<React.SetStateAction<AccessibilitySettingsFrontend | undefined>>;
  resetToDefaults: () => void;
}

export const useAccessibilitySettings = (studentId: number): UseAccessibilitySettingsResult => {
  const [settings, setSettings] = useState<AccessibilitySettingsFrontend | undefined>(undefined);
  const [defaultValue, setDefaultValue] = useState<AccessibilitySettingsFrontend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const fetched = await fetchAccessibilitySettings(studentId);
        setDefaultValue(fetched);
        setSettings(fetched);
      } catch (err) {
        console.error("Error al cargar configuración de accesibilidad:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [studentId]);

  const resetToDefaults = () => {
    if (!defaultValue) {
      console.log("Valores por defecto no cargados aún");
      return;
    }
    setSettings(defaultValue);
  };

  return { settings, defaultValue, isLoading, error, setSettings, resetToDefaults };
};