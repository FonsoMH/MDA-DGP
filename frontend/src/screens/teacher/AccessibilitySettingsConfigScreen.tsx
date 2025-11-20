import { useEffect, useState } from "react";
import ColorPickerComponent from "./components/ColorPickerComponent";
import { View, Image , Text , StyleSheet, TextInput, Switch, Pressable} from "react-native";
import CornerSelector, { CornerOption } from "./components/CornerSelector";
import NumberDisplay from "../../components/common/NumberDisplays/NumberDisplay";
import { AccessibilitySettingsApiData, AccessibilitySettingsFrontend } from "../../types/accessibility";
import { fetchAccessibilitySettings, updateAccessibilitySettings } from "../../accessibilitySettings/api/accessibilitySettingsApi";

export default function AccessibilitySettingsConfigScreen(id: number) {

    const [defaultValue, setDefaultValue] = useState<AccessibilitySettingsFrontend | null>(null);

    const [settings, setSettings] = useState<AccessibilitySettingsFrontend>();

    // Helpers para mantener la API de setters existente
    const setBackgroundColor = (color: string) => setSettings(s => ({ ...s, backgroundColor: color }));
    const setForegroundColor = (color: string) => setSettings(s => ({ ...s, foregroundColor: color }));
    const setNumberColor = (color: string) => setSettings(s => ({ ...s, numberColor: color }));
    const setBoxColor = (color: string) => setSettings(s => ({ ...s, boxColor: color }));
    const setIconPosition = (pos: CornerOption) => setSettings(s => ({ ...s, iconPosition: pos }));
    const setShowNumbersMode = (val: boolean) => setSettings(s => ({ ...s, showNumbersMode: val }));
    const setFontSize = (size: number) => setSettings(s => ({ ...s, fontSize: size }));

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const fetched = await fetchAccessibilitySettings(id);
                
                setDefaultValue(fetched);
                setSettings(fetched);
            } catch (error) {
                console.error("Error al cargar configuración de accesibilidad:", error);
            }
        };

        loadSettings();
    }, []);

    const submitChanges = async () => {
        
        if (!defaultValue) {
            console.log("Valores por defecto no cargados aún");
            return;
        }

        try {

            const payload: AccessibilitySettingsApiData = {
                background_color: settings?.backgroundColor,
                foreground_color: settings?.foregroundColor,
                number_color: settings?.numberColor,
                box_color: settings?.boxColor,
                icon_position: settings?.iconPosition,
                show_numbers_mode: settings?.showNumbersMode,
                font_size: settings?.fontSize,
            };

            await updateAccessibilitySettings(id, payload);
        } catch (error) {
            console.error("Error al actualizar la configuración de accesibilidad:", error);
        }

    }

    const resetToDefaults = () => {
        if (!defaultValue) {
            console.log("Valores por defecto no cargados aún");
            return;
        }
        setSettings(defaultValue);
    }

    const exampleStyle = StyleSheet.create({
        background: {
            backgroundColor: settings?.backgroundColor,
            padding: 20,
            alignItems: 'center',
            flexDirection: 'column',
            width: '100%',
            height: 400,
            margin: 20,
            gap: 30,
        },
        container:{
            backgroundColor: settings?.foregroundColor,
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            width: '90%',
            gap: 50,
        },
        box: {
            backgroundColor: settings?.boxColor,
            justifyContent: 'center',
            alignItems: 'center',
            width: 100,
            height: 100,
            borderRadius: 8,
            margin: 5,
        },
        numbers: {
            color: settings?.numberColor,
        },
        text: {
            fontSize: settings?.fontSize + 10,
        },
        subText: {
            fontSize: settings?.fontSize,
        },
        icon:{
            backgroundColor: 'white',
            boxShadow: [
                {
                offsetX: 0,
                offsetY: 8,
                blurRadius: 8,
                color: 'rgba(0,0,0,0.15)',
                }
            ],
            flexDirection: 'row', 
            alignItems: 'center', 
            alignSelf: settings?.iconPosition === "izquierda" ? 'flex-start' : 'flex-end', 
            borderRadius: 100, 
            paddingHorizontal: 10
        }
    }); 

    return (
        <View>
            <Text style={{fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20}}>
                Configuración de accesibilidad de {}
            </Text>
            <Text style={{fontSize: 16, textAlign: 'center', marginVertical: 10, marginHorizontal: 20}}>
                Ajusta las configuraciones de accesibilidad para mejorar la experiencia de los estudiantes durante los juegos.
            </Text>

            <View style={{flex: 1 , flexDirection: 'row', justifyContent: 'flex-start', width: '100%'}}>

                <View style={styles.optionsContainer}>

                    <View style={styles.optionPickContainer}>
                        <Text>
                            Color de fondo:
                        </Text>
                        <ColorPickerComponent 
                            onColorSelected={(color) => setBackgroundColor(color)} 
                            actualColor={settings?.backgroundColor}
                            />
                    </View>
                    <View style={styles.optionPickContainer}>
                        <Text>
                            Color de contenedores:
                        </Text>
                        <ColorPickerComponent 
                            onColorSelected={(color) => setForegroundColor(color)} 
                            actualColor={settings?.foregroundColor}
                            />
                    </View>
                    <View style={styles.optionPickContainer}>
                        <Text>
                            Color de cajas:
                        </Text>
                        <ColorPickerComponent 
                            onColorSelected={(color) => setBoxColor(color)} 
                            actualColor={settings?.boxColor}
                            />
                    </View>
                    <View style={styles.optionPickContainer}>
                        <Text>
                            Color de números:
                        </Text>
                        <ColorPickerComponent 
                            onColorSelected={(color) => setNumberColor(color)} 
                            actualColor={settings?.numberColor}
                            />
                    </View>
                    <View style={styles.optionPickContainer}>
                        <Text>
                            Modo mostrar números:
                        </Text>
                        <Switch 
                            style={styles.switch}
                            value={settings?.showNumbersMode}
                            onValueChange={(value) => setShowNumbersMode(value)}
                            />
                    </View>
                    <View style={styles.optionPickContainer}>
                        <Text>
                            Posición de iconos:
                        </Text>
                        <CornerSelector
                            onChange={(position) => setIconPosition(position)}
                            actualSelected={settings?.iconPosition}
                            />
                    </View>
                    <View style={styles.optionPickContainer}>
                        <Text>
                            Tamaño de fuente:
                        </Text>
                        <TextInput 
                            style={styles.textInput}
                            keyboardType="numeric"
                            value={settings?.fontSize.toString() ?? ""}
                            onChangeText={(text) => setFontSize(Number(text))}
                            />
                    </View>
                </View>
                <View style={{ flexDirection: 'column', flex: 1, justifyContent: 'flex-end', alignItems: 'center', width: '100%', margin: 50}}>

                    <View style={exampleStyle.background}>
                        <View style={exampleStyle.icon}>
                            <Text style={{fontSize: 18}}>Volver</Text>
                            
                            <Image 
                                source={require('../../../assets/icons/return.png')}
                                style={{width: 35, height: 35, margin: 10}}
                            />
                        </View>
                        
                        <Text style={exampleStyle.text}>Ejemplo de título</Text>
                        <Text style={exampleStyle.subText}>Ejemplo de texto</Text>
                        
                        <View style={exampleStyle.container}>
                            <NumberDisplay numberProp={8} size={80} numberColor={settings?.numberColor} style={{ backgroundColor: settings?.boxColor  }} />
                            <NumberDisplay numberProp={15} size={80} numberColor={settings?.numberColor} style={{ backgroundColor: settings?.boxColor }} />
                            <NumberDisplay numberProp={23} size={80} numberColor={settings?.numberColor} style={{ backgroundColor: settings?.boxColor }} />
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'center', gap: 20}}>
                        <Pressable style={styles.btn} onPress={resetToDefaults}>
                            <Text style={{color: 'white', fontWeight: 'bold'}}>
                                Restablecer valores predeterminados
                            </Text>
                        </Pressable>    
                        <Pressable style={styles.btn} onPress={submitChanges}>
                            <Text style={{color: 'white', fontWeight: 'bold'}}>
                                Confirmar cambios
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>          
        </View>
    );

}

const styles = StyleSheet.create({
    optionsContainer: {
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        margin: 20,
        width: '30%',
    },
    optionPickContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 5,
        margin: 8,
        width: 40,
        height: 40,
        textAlign: 'center',
    },
    switch: {
        margin: 8,
    },
    btn: {
        minWidth: 120,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563eb'
    },
});