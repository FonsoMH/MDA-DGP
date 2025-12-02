import { useEffect, useState } from "react";
import ColorPickerComponent from "./components/ColorPickerComponent";
import { View, Image , Text , StyleSheet, TextInput, Switch, Pressable} from "react-native";
import CornerSelector, { CornerOption } from "./components/CornerSelector";
import NumberDisplay from "../../components/common/NumberDisplays/NumberDisplay";
import { AccessibilitySettingsApiData, AccessibilitySettingsFrontend } from "../../types/accessibility";
import { fetchAccessibilitySettings, updateAccessibilitySettings } from "../../accessibilitySettings/api/accessibilitySettingsApi";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { TeacherStackParamList } from "../../navigation/TeacherNavigator";
import LoadingSpinner from "../../components/common/LoadingSpinner/LoadingSpinner";
import { useAccessibilitySettings } from "./hooks/useAccessibilitySettings";
import { useSubmitAccessibilityChanges } from "./hooks/useSubmitAccessibilityChanges";
import Alert from "../../components/FeedBack/Alert";

type Props = NativeStackScreenProps<TeacherStackParamList, 'AccessibilitySettingsConfig'>;


export default function AccessibilitySettingsConfigScreen({ route, navigation }: Props) {

    const { studentId } = route.params;
    
    const { 
        settings,
        isLoading, 
        error, 
        setSettings, 
        resetToDefaults 
    } = useAccessibilitySettings(studentId);
    
    const { 
        submitChanges, 
        isSubmitting , 
        submitError 
    } = useSubmitAccessibilityChanges({ studentId, settings });
    
    const [isAlertVisible, setIsAlertVisible] = useState(false);

    const setBackgroundColor = (color: string) => setSettings(s => ({ ...s, backgroundColor: color }));
    const setForegroundColor = (color: string) => setSettings(s => ({ ...s, foregroundColor: color }));
    const setContainerColor = (color: string) => setSettings(s => ({ ...s, containerColor: color }));
    const setNumberColor = (color: string) => setSettings(s => ({ ...s, numberColor: color }));
    const setBoxColor = (color: string) => setSettings(s => ({ ...s, boxColor: color }));
    const setIconPosition = (pos: CornerOption) => setSettings(s => ({ ...s, iconPosition: pos }));
    const setShowNumbersMode = (val: boolean) => setSettings(s => ({ ...s, showNumbersMode: val }));
    const setFontSize = (size: number) => setSettings(s => ({ ...s, fontSize: size }));

    const [alert, setAlert] = useState({
        message: 'Cambios guardados con éxito',
        success: true
    });
    

    useEffect(() => {
        if (submitError) {
            setAlert({
                message: "Error al guardar los cambios: " + (submitError instanceof Error ? submitError.message : String(submitError)),
                success: false
            });
            setIsAlertVisible(true);
        }
    }, [submitError]);

    useEffect(() => {
        
        if (error) {
            
            setAlert({
                message: "Error al cargar las configuraciones: " + (error instanceof Error ? error.message : String(error)),
                success: false
            });
            setIsAlertVisible(true);
            return null;
        }
    }, [error]);

    const handleSubmit = async () => {
        await submitChanges();
        setIsAlertVisible(true);
    }

    const handleResetToDefaults = () => {
        resetToDefaults();
    }

    if (isLoading) {
        return (
            <LoadingSpinner/>
        );
    }
    

    const exampleStyle = StyleSheet.create({
        background: {
            backgroundColor: settings.backgroundColor,
            padding: 20,
            alignItems: 'center',
            flexDirection: 'column',
            width: '100%',
            height: 400,
            margin: 20,
            gap: 30,
        },
        container:{
            backgroundColor: settings.containerColor,
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            width: '90%',
            gap: 50,
        },
        box: {
            backgroundColor: settings.boxColor,
            justifyContent: 'center',
            alignItems: 'center',
            width: 100,
            height: 100,
            borderRadius: 8,
            margin: 5,
        },
        numbers: {
            color: settings.numberColor,
        },
        text: {
            fontSize: settings.fontSize + 10,
            color: settings.foregroundColor,
        },
        subText: {
            fontSize: settings.fontSize,
            color: settings.foregroundColor,
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
            alignSelf: settings.iconPosition === "izquierda" ? 'flex-start' : 'flex-end', 
            borderRadius: 100, 
            paddingHorizontal: 10
        }
    }); 

    if (isLoading) {
        return (
            <LoadingSpinner />
        );
    }

    return (
        <View style={styles.screenContainer}>
            <Text style={{fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 20}}>
                Configuración de accesibilidad de {}
            </Text>
            <Text style={{fontSize: 16, textAlign: 'center', marginVertical: 10, marginHorizontal: 20}}>
                Ajusta las configuraciones de accesibilidad para mejorar la experiencia de los estudiantes durante los juegos.
            </Text>

            <View style={styles.generalContainer}>

                <View style={styles.optionsContainer}>

                    <View style={styles.optionPickContainer}>
                        <Text>
                            Color de fondo:
                        </Text>
                        <ColorPickerComponent 
                            onColorSelected={(color) => setBackgroundColor(color)} 
                            actualColor={settings.backgroundColor}
                            />
                    </View>
                    <View style={styles.optionPickContainer}>
                        <Text>
                            Color de contenedores:
                        </Text>
                        <ColorPickerComponent 
                            onColorSelected={(color) => setContainerColor(color)} 
                            actualColor={settings.containerColor}
                            />
                    </View>
                    <View style={styles.optionPickContainer}>
                        <Text>
                            Color de cajas:
                        </Text>
                        <ColorPickerComponent 
                            onColorSelected={(color) => setBoxColor(color)} 
                            actualColor={settings.boxColor}
                            />
                    </View> 
                    <View style={styles.optionPickContainer}>
                        <Text>
                            Color de texto:
                        </Text>
                        <ColorPickerComponent 
                            onColorSelected={(color) => setForegroundColor(color)} 
                            actualColor={settings.foregroundColor}
                            />
                    </View>
                    <View style={styles.optionPickContainer}>
                        <Text>
                            Color de números:
                        </Text>
                        <ColorPickerComponent 
                            onColorSelected={(color) => setNumberColor(color)} 
                            actualColor={settings.numberColor}
                            />
                    </View>
                    <View style={styles.optionPickContainer}>
                        <Text>
                            Modo mostrar números:
                        </Text>
                        <Switch 
                            style={styles.switch}
                            value={settings.showNumbersMode}
                            onValueChange={(value) => setShowNumbersMode(value)}
                            />
                    </View>
                    <View style={styles.optionPickContainer}>
                        <Text>
                            Posición de iconos:
                        </Text>
                        <CornerSelector
                            onChange={(position) => setIconPosition(position)}
                            actualSelected={settings.iconPosition}
                            />
                    </View>
                    <View style={styles.optionPickContainer}>
                        <Text>
                            Tamaño de fuente:
                        </Text>
                        <TextInput 
                            style={styles.textInput}
                            keyboardType="numeric"
                            value={settings.fontSize.toString() ?? ""}
                            onChangeText={(text) => {
                                const newSize = Number(text);
                                if (!isNaN(newSize) && newSize >= 1) {
                                    setFontSize(newSize);
                                } else if (text === "") {
                                    setFontSize(1);
                                }
                            }}
                            />
                    </View>
                </View>
                <View style={styles.previewContainer}>

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
                            <NumberDisplay numberProp={8} size={80} numberColor={settings.numberColor} style={{ backgroundColor: settings.boxColor  }} />
                            <NumberDisplay numberProp={15} size={80} numberColor={settings.numberColor} style={{ backgroundColor: settings.boxColor }} />
                            <NumberDisplay numberProp={23} size={80} numberColor={settings.numberColor} style={{ backgroundColor: settings.boxColor }} />
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'center', gap: 20}}>
                        <Pressable style={styles.btn} onPress={handleSubmit}>
                            <Text style={styles.btnTextPrimary}>
                                Confirmar cambios
                            </Text>
                        </Pressable>

                        <Pressable style={styles.btnSecondary} onPress={handleResetToDefaults}>
                            <Text style={styles.btnTextSecondary}>
                                Restablecer valores predeterminados
                            </Text>
                        </Pressable>    
                        
                        
                        <Pressable style={styles.btnTertiary} onPress={() => navigation.goBack()}>
                            <Text style={styles.btnTextTertiary}>
                                Cancelar
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>          
            <Alert 
                visible={isAlertVisible} 
                message={alert.message}
                success={alert.success}
                duration={2000}
                onHide={() => { setIsAlertVisible(false); navigation.goBack(); }}
            />
        </View>
    );

}

const styles = StyleSheet.create({

    screenContainer: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 30,
        paddingHorizontal: 20
    },

    generalContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },

    optionsContainer: {
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        width: '20%',
    },

    previewContainer: {
        flex: 1,
        flexDirection: 'column',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
    },

    optionPickContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%'
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

    btnSecondary: {
        backgroundColor: 'transparent', 
        borderColor: '#2563eb', 
        borderWidth: 2,
        minWidth: 120,
        paddingVertical: 10, 
        paddingHorizontal: 22,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },

    
    btnTertiary: {
        backgroundColor: 'transparent', 
        borderColor: '#26b7280',
        borderWidth: 2,
        minWidth: 120,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },

    
    btnTextPrimary: {
        color: 'white',
        fontWeight: 'bold'
    },
    btnTextSecondary: {
        color: '#2563eb', 
        fontWeight: 'bold'
    },
    btnTextTertiary: {
        color: '#6b7280', 
        fontWeight: 'bold'
    }
});