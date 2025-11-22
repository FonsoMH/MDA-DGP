

import { useState } from 'react';
import {Modal , Pressable, StyleSheet , View, Text} from 'react-native';

import ColorPicker, {Swatches , Preview , OpacitySlider , HueSlider , ColorFormatsObject} from 'reanimated-color-picker';

export default function ColorPickerComponent({onColorSelected, actualColor}: {onColorSelected: (color: string) => void; actualColor: string}) {

    const [temporaryColor, setTemporaryColor] = useState<string>(actualColor);
    const [isVisible, setIsVisible] = useState<boolean>(false);

    const handleColorChange = (color: ColorFormatsObject) => {
        setTemporaryColor(color.hex);
    }

    const handleConfirm = () => {
        onColorSelected(temporaryColor);
        setIsVisible(false);
    };

    
    
    return (
        <View>
            <Pressable onPress={() => setIsVisible(true)}>
                <View style={{ width: 40, height: 40, backgroundColor: actualColor, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', margin: 8 }} />
            </Pressable>
            <Modal 
                visible={isVisible}
                animationType="fade" 
                transparent={true}
                onRequestClose={() => setIsVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.pickerContainer}>
                        <ColorPicker
                            value={actualColor}
                            onChange={handleColorChange}
                            style={styles.colorPicker} 
                            >
                            <Preview style={styles.preview} />
                            <Swatches />
                            <HueSlider style={styles.slider} />
                            <OpacitySlider style={styles.slider} />
                        </ColorPicker>
                        
                        <View style={styles.btnContainer}>
                            <Pressable onPress={handleConfirm} style={styles.btn} >
                                <Text style={styles.btnText}>Confirmar</Text>
                            </Pressable>
                            <Pressable onPress={() => setIsVisible(false)} style={[styles.btn, styles.btnClose]} >
                                <Text style={styles.btnCloseText}>Cerrar</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
    },

    pickerContainer: {
        width: '90%', 
        maxWidth: 400,
        padding: 25,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10, 
        alignItems: 'center',
        gap: 15,
    },
    
    colorPicker: {
        width: '100%',
        alignItems: 'center',
    },

    preview: {
        width: '90%', 
        height: 60,
        borderRadius: 8, 
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0', 
    },
    slider: {
        width: '100%',
        height: 30, 
        marginVertical: 8,
    },
    
    btnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
        paddingHorizontal: 10,
    },

    btn: {
        flex: 1, 
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563eb', 
        marginHorizontal: 5,
    },

    btnText: {
        color: 'white',
        fontWeight: '600', 
        fontSize: 16,
    },
    
    btnClose: {
        backgroundColor: '#E0E0E0', 
    },

    btnCloseText: {
        color: '#333333', 
        fontWeight: '600',
        fontSize: 16,
    }
});