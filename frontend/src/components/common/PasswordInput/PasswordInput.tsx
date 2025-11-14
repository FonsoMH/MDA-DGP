import React, { useState } from 'react';
import { 
    View, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    TextInputProps 
} from 'react-native';

import { Ionicons } from '@expo/vector-icons'; 


interface PasswordInputProps extends TextInputProps {
    wrapperStyle?: object;
}

export default function PasswordInput({ wrapperStyle, style, ...rest }: PasswordInputProps) {
    
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    const togglePasswordVisibility = () => {
        setIsPasswordVisible(prev => !prev);
    };

    return (
        <View style={[styles.passwordContainer, wrapperStyle]}>
            <TextInput 
                secureTextEntry={!isPasswordVisible}
                style={[styles.input, style]}
                {...rest}
            />
            <TouchableOpacity 
                onPress={togglePasswordVisibility}
                style={styles.toggleButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
            >
                <Ionicons 
                    name={isPasswordVisible ? 'eye-off' : 'eye'} 
                    size={24}
                    color="#999"
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    passwordContainer: {
        position: 'relative', 
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    input: {
        paddingRight: 50, 
        width: '100%',
    },
    toggleButton: {
        position: 'absolute',
        right: 0,
        height: '100%',
        paddingRight: 15,
        justifyContent: 'center',
    },
});