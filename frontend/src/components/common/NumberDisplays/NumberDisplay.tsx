import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface ChildProps {
  numberProp: number;
  size?: number; 
  style?: StyleProp<ViewStyle>;
}

function NumberDisplay({ numberProp, size = 100, style }: ChildProps) {
    const dynamicFontSize = size * 0.3;

    return (
        <View style={[styles.container, { width: size, height: size }, style]}>        
        <Text style={[styles.numberText, { fontSize: dynamicFontSize }]}>
            {numberProp}
        </Text>
        </View>
    );
}

const styles = StyleSheet.create({ 
    container: {
        backgroundColor: '#FFFFFF', 
        
        borderWidth: 2.21, 
        borderColor: '#101828',
        borderRadius: 8, 
        padding: 16,
        margin: 5,

        justifyContent: 'center',
        alignItems: 'center',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    numberText: {
        fontWeight: 'bold',
        color: '#101828',
    }
}); 

export default NumberDisplay;