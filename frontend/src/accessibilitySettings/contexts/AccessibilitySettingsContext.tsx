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
    const [iconPosition, setIconPosition] = useState<AccessibilitySettingsFrontend['iconPosition']>('izquierda');
    const [highContrast, setHighContrast] = useState<AccessibilitySettingsFrontend['highContrast']>(false);
    const [showNumbers, setShowNumbers] = useState<AccessibilitySettingsFrontend['showNumbers']>(true);
    const [fontSize, setFontSize] = useState<AccessibilitySettingsFrontend['fontSize']>(16);

    async function getSettings(id: number): Promise<void> {
        const settings = await fetchAccessibilitySettings(id);
        setBackgroundColor(settings.backgroundColor);
        setForegroundColor(settings.foregroundColor);
        setIconPosition(settings.iconPosition);
        setHighContrast(settings.highContrast);
        setShowNumbers(settings.showNumbers);
        setFontSize(settings.fontSize);
    }

    return (
        <AccessibilitySettingsContext.Provider
            value={{
                backgroundColor,
                highContrast,
                foregroundColor,
                iconPosition,
                showNumbers,
                fontSize,
                getSettings,
            }}
        >
            {children}
        </AccessibilitySettingsContext.Provider>
    );
}