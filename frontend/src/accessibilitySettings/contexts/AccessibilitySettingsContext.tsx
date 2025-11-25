import { createContext , ReactNode, useState} from "react";
import { fetchAccessibilitySettings } from "../api/accessibilitySettingsApi";
import { AccessibilitySettingsFrontend } from "../../types/accessibility";


interface AccessibilitySettingsProviderProps {
    children: ReactNode;
}
interface AccessibilitySettingsContextType extends AccessibilitySettingsFrontend {
    getSettings: (id: number) => Promise<void>;     
}

export const AccessibilitySettingsContext = createContext<AccessibilitySettingsContextType | null>(null);

export function AccessibilitySettingsProvider({ children }: AccessibilitySettingsProviderProps) {
    const [backgroundColor, setBackgroundColor] = useState<AccessibilitySettingsFrontend['backgroundColor']>('#F7F8FA');
    const [foregroundColor, setForegroundColor] = useState<AccessibilitySettingsFrontend['foregroundColor']>('#000000');
    const [containerColor, setContainerColor] = useState<AccessibilitySettingsFrontend['containerColor']>('#FFFFFF');
    const [numberColor, setNumberColor] = useState<AccessibilitySettingsFrontend['numberColor']>('#000000');
    const [boxColor, setBoxColor] = useState<AccessibilitySettingsFrontend['boxColor']>('#FFFFFF');
    const [iconPosition, setIconPosition] = useState<AccessibilitySettingsFrontend['iconPosition']>('izquierda');
    const [showNumbersMode, setShowNumbersMode] = useState<AccessibilitySettingsFrontend['showNumbersMode']>(true);
    const [fontSize, setFontSize] = useState<AccessibilitySettingsFrontend['fontSize']>(16);

    async function getSettings(id: number): Promise<void> {
        const settings = await fetchAccessibilitySettings(id);
        setBackgroundColor(settings.backgroundColor);
        setForegroundColor(settings.foregroundColor);
        setContainerColor(settings.containerColor);
        setIconPosition(settings.iconPosition);
        setShowNumbersMode(settings.showNumbersMode);
        setFontSize(settings.fontSize);
        setBoxColor(settings.boxColor);
        setNumberColor(settings.numberColor)
    }

    return (
        <AccessibilitySettingsContext.Provider
            value={{
                backgroundColor,
                foregroundColor,
                containerColor,
                numberColor,
                boxColor,
                showNumbersMode,
                iconPosition,
                fontSize,
                getSettings,
            }}
        >
            {children}
        </AccessibilitySettingsContext.Provider>
    );
}