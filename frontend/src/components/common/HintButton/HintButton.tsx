import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function HintButton({ onPress }: { onPress: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.hintButton}>
            <Image
                source={require('../../../../assets/icons/hint.png')}
                style={styles.hintIcon}
                accessibilityLabel="Botón de pista"
            />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    hintButton: {
        padding: 10,
        backgroundColor: '#EFEFEF',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hintIcon: {
        width: 30,
        height: 30,
    },
});