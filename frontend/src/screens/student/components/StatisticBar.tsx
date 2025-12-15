import React from 'react';
import { View, Text , StyleSheet, Image } from 'react-native';
import { AccessibilitySettingsFrontend } from '../../../types/accessibility';

type Props = {
    width: number;
    height: number;
    accessibilitySettings: AccessibilitySettingsFrontend;
    icon: any;
    label: string;
    value: number;
};

export default function StatisticBar({width, height, accessibilitySettings, icon, label, value}: Props) {
    
    const iconSize = width / 2 - 3;

    const styles = StyleSheet.create({
        container : {
            flexDirection: 'row',
            flexWrap: 'wrap-reverse',
            alignContent: 'flex-start',
            justifyContent: 'center',
            padding: 2,
            backgroundColor: accessibilitySettings.boxColor,
            gap: 2
        },
        text: {
            fontSize: accessibilitySettings.fontSize,
            color: accessibilitySettings.foregroundColor,
            marginTop: 4,
            textAlign: 'center',
        },
});

    const iconsToRender = Math.min(
        20, 
        Math.ceil((value / 100) * 20)
    );

    return (
        <View style={{alignItems: 'center', margin: 8}}>
            <View style={[styles.container, {width, height}]}>
                {Array.from({ length: iconsToRender }).map((_, i) =>
                <View key={i} style={{width: iconSize, height: iconSize, justifyContent: 'center', alignItems: 'center'}}>
                    <Image 
                        source={icon} 
                        style={{width: '100%', height: '100%'}}
                    />
                </View>
                )}
            </View>
            <Text style={styles.text}>{label} {"\n"}({value})</Text>
        </View>
    );
}