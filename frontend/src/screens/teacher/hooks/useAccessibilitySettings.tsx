import { useState, useEffect } from 'react';
import { AccessibilitySettingsFrontend } from '../../../types/accessibility';
import { fetchAccessibilitySettings, fetchDefaultAccessibilitySettings } from '../../../accessibilitySettings/api/accessibilitySettingsApi';

interface UseAccessibilitySettingsResult {
  settings: AccessibilitySettingsFrontend | undefined;
  defaultValue: AccessibilitySettingsFrontend | null;
  isLoading: boolean;
  error: Error | null;
  setSettings: React.Dispatch<React.SetStateAction<AccessibilitySettingsFrontend | undefined>>;
  resetToDefaults: () => void;
}

export const useAccessibilitySettings = (studentId: number): UseAccessibilitySettingsResult => {
  const [settings, setSettings] = useState<AccessibilitySettingsFrontend | undefined>(undefined);
  const [defaultValue, setDefaultValue] = useState<AccessibilitySettingsFrontend | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setError(null);
        setIsLoading(true);
        const fetched = await fetchAccessibilitySettings(studentId);
        const defaultSettings = await fetchDefaultAccessibilitySettings();
        setDefaultValue(defaultSettings);
        setSettings(fetched);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, [studentId]);

  const resetToDefaults = () => {
    if (!defaultValue) {
      setError(new Error("Valores por defecto no cargados aún"));
      return;
    }
    setSettings(defaultValue);
  };

  return { settings, defaultValue, isLoading, error, setSettings, resetToDefaults };
};