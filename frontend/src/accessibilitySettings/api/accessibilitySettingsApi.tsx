import axios from "axios";
import { AccessibilitySettingsApiData, AccessibilitySettingsFrontend } from "../../types/accessibility";

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_TIMEOUT = process.env.API_TIMEOUT;

export async function fetchAccessibilitySettings( studentId: number): Promise<AccessibilitySettingsFrontend> {
    
    
    try {
        if (!studentId) {
            throw new Error("Missing student ID");
        }
    
        const endpoint = `${BASE_URL}/api/accessibility/${studentId}`;

        const response = await axios.get<AccessibilitySettingsApiData>(endpoint, { 
            timeout: +API_TIMEOUT 
        });
        const configData = response.data;

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
        
        return mappedConfig;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message; 

            throw new Error(message);
        }
        throw error;
    }
}


export async function updateAccessibilitySettings(studentId: number, payload: AccessibilitySettingsApiData) {

    try {
        const url = `${BASE_URL}/api/accessibility/${studentId}`;
        const res = await axios.put(url, payload);
        return res.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message; 

            throw new Error(message);
        }
        throw error;
    }
}

export async function fetchDefaultAccessibilitySettings(): Promise<AccessibilitySettingsFrontend> {
    
    const endpoint = `${BASE_URL}/api/accessibility/defaults`;

    try {

        const response = await axios.get<AccessibilitySettingsApiData>(endpoint, { 
            timeout: +API_TIMEOUT 
        });
        const configData = response.data;

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
<<<<<<< HEAD

=======
        
>>>>>>> Develop
        return mappedConfig;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.message; 

            throw new Error(message);
        }
        throw error;
    }
}