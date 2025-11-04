/**
 * Represents the data structure received directly from the Flask endpoint (snake_case).
 */
export interface AccessibilitySettingsApiData {
    background_color: string;
    foreground_color: string;
    icon_position: string;
    high_contrast: boolean;
    show_numbers: boolean;
    font_size: number;
}

/**
 * Represents the clean data structure ready for use in the Frontend (camelCase).
 */
export interface AccessibilitySettingsFrontend {
    backgroundColor: string;
    foregroundColor: string;
    iconPosition: string;
    highContrast: boolean;
    showNumbers: boolean;
    fontSize: number;
}