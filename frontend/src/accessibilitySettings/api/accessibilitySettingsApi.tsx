import axios from "axios";
import { AccessibilitySettingsApiData, AccessibilitySettingsFrontend } from "../../types/accessibility";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_TIMEOUT = process.env.API_TIMEOUT;

export const DEFAULT_CONFIG = {
    backgroundColor: "#F7F8FA",
    foregroundColor: "#000000",
    iconPosition: "izquierda",
    highContrast: false,
    showNumbers: true,
    fontSize: 16,
};


export async function fetchAccessibilitySettings( studentId: number): Promise<AccessibilitySettingsFrontend> {
    
    if (!studentId) {
        console.error("fetchAccessibilitySettings: IDs faltantes.");
        return DEFAULT_CONFIG;
    }

    const endpoint = `${BASE_URL}/api/accessibility/${studentId}`;

    try {

        const response = await axios.get<AccessibilitySettingsApiData>(endpoint, { 
            timeout: +API_TIMEOUT 
        });
        const configData = response.data;

        const mappedConfig: AccessibilitySettingsFrontend = {
            backgroundColor: configData.background_color,
            foregroundColor: configData.foreground_color,
            iconPosition: configData.icon_position,
            highContrast: configData.high_contrast,
            showNumbers: configData.show_numbers,
            fontSize: configData.font_size,
        };
        
        
        return mappedConfig;

    } catch (error) {

        return DEFAULT_CONFIG;
    }
}
