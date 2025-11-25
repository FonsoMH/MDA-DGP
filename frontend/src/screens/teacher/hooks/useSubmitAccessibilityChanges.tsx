import { useState } from 'react';
import { AccessibilitySettingsApiData, AccessibilitySettingsFrontend } from '../../../types/accessibility';
import { updateAccessibilitySettings } from '../../../accessibilitySettings/api/accessibilitySettingsApi';

interface UseSubmitChangesProps {
  studentId: number;
  settings: AccessibilitySettingsFrontend | undefined;
}

interface UseSubmitChangesResult {
  submitChanges: () => Promise<void>;
  isSubmitting: boolean;
  submitError: any;
}

export const useSubmitAccessibilityChanges = ({ studentId, settings }: UseSubmitChangesProps): UseSubmitChangesResult => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<any>(null);

  const submitChanges = async () => {
    if (!settings) return; 

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload: AccessibilitySettingsApiData = {
          background_color: settings.backgroundColor,
          foreground_color: settings.foregroundColor,
          container_color: settings.containerColor,
          number_color: settings.numberColor,
          box_color: settings.boxColor,
          icon_position: settings.iconPosition,
          show_numbers_mode: settings.showNumbersMode,
          font_size: settings.fontSize,
      };

      await updateAccessibilitySettings(studentId, payload);
      
      //TODO cambiar a una alerta mejor
      alert("La configuración de accesibilidad se guardó correctamente.");

    } catch (error) {
      setSubmitError(error);
        alert(`Error cambiando configuracion: ${error.message}`);

    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitChanges, isSubmitting, submitError };
};