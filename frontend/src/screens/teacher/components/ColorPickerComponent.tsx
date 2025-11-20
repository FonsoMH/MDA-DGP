// https://alabsi91.github.io/reanimated-color-picker/docs/Usage

import { useState } from 'react';
import {Button , Modal , Pressable, StyleSheet , View} from 'react-native';

import ColorPicker, {Panel1, Swatches , Preview , OpacitySlider , HueSlider , ColorFormatsObject} from 'reanimated-color-picker';

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
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.pickerContainer}>
                        <ColorPicker
                            value={actualColor}
                            onChange={handleColorChange}
                            style={{justifyContent: 'center', alignItems: 'center'}}
                            >
                            <Preview style={styles.preview} />
                            <Swatches />
                            <HueSlider style={styles.slider} />
                            <OpacitySlider style={styles.slider} />
                        </ColorPicker>
                        <View style={{flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 20}}>
                            <Pressable onPress={handleConfirm} style={styles.btn} >
                                Confirmar
                            </Pressable>
                            <Pressable onPress={() => setIsVisible(false)} style={styles.btn} >
                                Cerrar
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    pickerContainer: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
        gap: 10,
    },
    preview: {
        width: 200,
        height: 100,
        marginBottom: 20,
    },
    slider: {
        width: '100%',
        height: 40,
        marginVertical: 10,
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