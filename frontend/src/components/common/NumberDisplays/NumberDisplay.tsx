import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface ChildProps {
  numberProp: number;
  size?: number; 
  numberColor?: string;
  style?: StyleProp<ViewStyle>;
}

function NumberDisplay({ numberProp, size = 100, numberColor, style}: ChildProps) {
    const dynamicFontSize = size * 0.3;

    return (
        <View style={[styles.container, { width: size, height: size }, style]}>        
        <Text style={[styles.numberText, { fontSize: dynamicFontSize, color: numberColor }]}>
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

        boxShadow: [
            {
            offsetX: 0,
            offsetY: 8,
            blurRadius: 8,
            color: 'rgba(0,0,0,0.15)',
            }
        ],
        elevation: 5,
    },
    numberText: {
        fontWeight: 'bold',
    }
}); 

export default NumberDisplay;