import React from 'react';
import { Text, View, StyleSheet } from "react-native";
import { CORRECT_COLOR, ERROR_COLOR } from '../../types/games';


interface RoundProps {
    message: string,
    isVisible: boolean,
    type: 'success' | 'error' | ''
}

/**
 * Componente de notificación tipo Snackbar, centrado y bloqueante, para mensajes de ronda.
 * Debe colocarse al final del componente principal (e.g., ContainerSort)
 * para asegurar que se superponga a todo.
 */
function RoundMessage({ message, isVisible, type }: RoundProps) {
    
    const backgroundColor = type === 'success' 
        ? CORRECT_COLOR
        : ERROR_COLOR

    if (!isVisible) {
        return null;
    }

    return (
        <View style={styles.overlay} aria-label="round-message">
            <View style={[styles.snackbar, { backgroundColor }]}>                
                <Text style={styles.messageText}>{message}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute', 
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000, 
        backgroundColor: 'rgba(0, 0, 0, 0.6)', 
        justifyContent: 'center',
        alignItems: 'center',
    },
    snackbar: {
        paddingHorizontal: 30, 
        paddingVertical: 20,
        borderRadius: 12,
        maxWidth: '85%',
        minWidth: '60%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 8,
    },
    messageText: {
        color: '#333333',
        fontSize: 22,
        textAlign: 'center',
        fontWeight: '900',
    },
});

export default RoundMessage ;
