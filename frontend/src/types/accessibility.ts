/**
 * Represents the data structure received directly from the Flask endpoint (snake_case).
 */
export interface AccessibilitySettingsApiData {
    background_color: string;
    foreground_color: string;
    container_color: string;
    number_color: string;
    box_color: string;
    icon_position: string;
    show_numbers_mode: boolean;
    font_size: number;
}

/**
 * Represents the clean data structure ready for use in the Frontend (camelCase).
 */
export interface AccessibilitySettingsFrontend {
    backgroundColor: string;
    foregroundColor: string;
    containerColor: string;
    numberColor: string;
    boxColor: string;
    iconPosition: string;
    showNumbersMode: boolean;
    fontSize: number;
}