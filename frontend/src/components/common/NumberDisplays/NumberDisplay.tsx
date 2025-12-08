import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import BounceDisplay from './BounceDisplay';

interface ChildProps {
  numberProp: number;
  size?: number; 
  numberColor?: string;
  style?: StyleProp<ViewStyle>;
  activeHint?: boolean;
  onEndHint?: () => void;
}

function NumberDisplay({ numberProp, size = 100, numberColor, style, activeHint, onEndHint }: ChildProps) {
    const dynamicFontSize = size * 0.3;

    return (
        <BounceDisplay isBouncing={activeHint} onAnimationEnd={onEndHint}>
            <View style={[styles.container, { width: size, height: size }, style]}>        
                <Text style={[styles.numberText, { fontSize: dynamicFontSize, color: numberColor }]}>
                    {numberProp}
                </Text>
            </View>
        </BounceDisplay>
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