import axios from "axios";
import { AccessibilitySettingsApiData, AccessibilitySettingsFrontend } from "../../types/accessibility";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_TIMEOUT = process.env.API_TIMEOUT;

export const DEFAULT_CONFIG= {
    backgroundColor: "#F7F8FA",
    foregroundColor: "#000000",
    containerColor: "#FFFFFF",
    numberColor: "#000000",
    boxColor: "#FFFFFF",
    iconPosition: "izquierda",
    showNumbersMode: true,
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

        console.log(configData);
        

        const mappedConfig: AccessibilitySettingsFrontend = {
            backgroundColor: configData.background_color,
            foregroundColor: configData.foreground_color,
            containerColor: configData.container_color,
            numberColor: configData.number_color,
            boxColor: configData.box_color,
            iconPosition: configData.icon_position,
            showNumbersMode: configData.show_numbers_mode,
            fontSize: configData.font_size,
        };

        console.log(mappedConfig);
        
        
        
        return mappedConfig;

    } catch (error) {

        return DEFAULT_CONFIG;
    }
}


export async function updateAccessibilitySettings(studentId: number, payload: AccessibilitySettingsApiData) {

  const url = `${BASE_URL}/api/accessibility/${studentId}`;
  const res = await axios.put(url, payload);
  return res.data;
}