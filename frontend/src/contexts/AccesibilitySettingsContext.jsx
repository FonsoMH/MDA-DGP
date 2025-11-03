import { createContext , useState} from "react";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

export const AccessibilitySettingsContext = createContext();

export function AccessibilitySettingsProvider({ children }) {
    const [fontSize, setFontSize] = useState(16);
    const [highContrast, setHighContrast] = useState(false);

    async function getSettings(id) {
    
    

    }


    return (
        <AccessibilitySettingsContext.Provider
            value={{
                fontSize,
                highContrast,
                getSettings,
            }}
        >
            {children}
        </AccessibilitySettingsContext.Provider>
    );
}