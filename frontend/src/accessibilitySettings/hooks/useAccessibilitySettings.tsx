import { useContext } from "react";
import { AccessibilitySettingsContext } from "../contexts/AccessibilitySettingsContext";

export function useAccessibilitySettings() {
    const context = useContext(AccessibilitySettingsContext);
    if (!context) {
        throw new Error("useAccessibilitySettings must be used within an AccessibilitySettingsProvider");
    }
    return context;
}