import React, { useEffect } from "react";
import { View, TouchableOpacity, Image, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { playTTS } from "../../ttsListener";

interface AudioInstructionProps {
    text: string;
    containerStyle?: ViewStyle;
    textStyle?: TextStyle;
    iconSize?: number;
    onFinish?: () => void;
}

const AudioInstruction: React.FC<AudioInstructionProps> = ({
    text,
    containerStyle,
    textStyle,
    iconSize,
    onFinish,
}) => {

    useEffect(() => {
        const timer = setTimeout(() => {
            playTTS(text, onFinish);
        }, 500); // Delay to ensure component is fully mounted

        return () => clearTimeout(timer);
    }, [text]);

    const handlePress = () => {
        playTTS(text);
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <Text style={[styles.text, textStyle]}>{text}</Text>
            <TouchableOpacity onPress={handlePress} style={styles.iconButton} accessibilityLabel="Volver a escuchar instrucciones">
                <Image
                    source={require('../../../../assets/icons/sound.png')}
                    style={{ width: iconSize, height: iconSize}}
                    resizeMode="contain"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        flexWrap: 'wrap'
    },
    text: {
        flexShrink: 1,
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 50,
        elevation: 2
    },
});

export default AudioInstruction;