import { useEffect, useState } from "react";
import {StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import NumberDisplay from "../../../components/common/NumberDisplays/NumberDisplay";
import { CORRECT_COLOR, EMPTY_COLOR, ERROR_COLOR, Option } from "../../../types/games";
import OperacionDisplay from "./OperationDisplay";
import DraggableItem from "../SequenceGame/DraggableItem";
import { SharedValue, useAnimatedRef } from "react-native-reanimated";
import { useAccessibilitySettings } from "../../teacher/hooks/useAccessibilitySettings";
import { AccessibilitySettingsFrontend } from "../../../types/accessibility";

type Layout = { x: number; y: number; width: number; height: number; };


interface ContainerProps{
    items: Option[];
    onContainerClick: () => void;
    onItemReturned: (itemId: Option) => void;
    onUniformityChange: (color: string) => void;
    targetSum: number | null;
    topZoneLayout: SharedValue<Layout[] | null>;

    containerIndex: number;
    onLayoutMeasured?: (layout: Layout, index: number) => void;
    accessibilitySettings: AccessibilitySettingsFrontend;
    isSum: boolean
    
}


function Container({
    targetSum,
    items,
    onContainerClick,
    onItemReturned,
    onUniformityChange,
    topZoneLayout,
    containerIndex,
    onLayoutMeasured,
    accessibilitySettings,
    isSum
}: ContainerProps) {

    const [borderColor, setBorderColor] = useState(EMPTY_COLOR); 

    const checkUniformity = (numbers: Option[]): string => {
        if (numbers.length === 0) {
            return EMPTY_COLOR;
        }
        
        const firstValue = numbers[0].value;
        const allSame = numbers.every(item => item.value === firstValue);
        
        return allSame ? CORRECT_COLOR : ERROR_COLOR;
    };

    const checkSum = (numbers: Option[]): string => {
        if (numbers.length === 0) {
            return EMPTY_COLOR;
        }
        
        let result: number;

        if (isSum) {
            // Lógica de suma original
            result = numbers.reduce((sum, current) => sum + current.value, 0);

        } else {
            // Lógica de resta acumulativa:
            // Toma el primer valor y le resta el resto de los valores.
            
            if (numbers.length === 1) {
                result = numbers[0].value;
            } else {
                // Inicializa con el primer valor y resta los subsiguientes
                const firstValue = numbers[0].value;
                result = numbers.slice(1).reduce((diff, current) => diff - current.value, firstValue);
                result = Math.abs(result);
            }

        }

        // Comprobación final
        // Usamos Math.abs(result) si la resta puede dar negativo, pero el target siempre es positivo.
        return result === targetSum ? CORRECT_COLOR : ERROR_COLOR;
    };

    useEffect(() => {
        
        if(targetSum){
            const color = checkSum(items);
            setBorderColor(color);
            onUniformityChange(color);
            return;
        }

        const color = checkUniformity(items);
        setBorderColor(color);
        onUniformityChange(color);
    }, [items]);

    const handleContainerClick = () => {

        onContainerClick(); 
        

    };

    const handleNumberCLick = (itemToReturn: Option) => {

        onItemReturned(itemToReturn);
        
    }

    const containerRef = useAnimatedRef<View>();

    return (
        <View style={styles.area}
        ref={containerRef}
        onLayout={() => {
            containerRef.current?.measureInWindow((x, y, width, height) => {
                const layout: Layout = { x, y, width, height };
                
                onLayoutMeasured(layout, containerIndex);
            });
        }}
        aria-label={`Container-Area-${containerIndex}`}
        >

        <TouchableOpacity 
        style={[styles.container, {borderColor: borderColor ,backgroundColor: accessibilitySettings.containerColor}]} 
        onPress={handleContainerClick}>
            {items.map((option, index) => (
                <DraggableItem
                onPress={() => handleNumberCLick(option)}
                onDrop={() => handleNumberCLick(option)}
                dropZonesLayouts={topZoneLayout} 
                isDisabled={false} 
                key={`opt-${option.id}-${index}`}
                comeBack={false}
                style={styles.optionWrapper}
                testID={`opt-${option.value}`}
                 >
                    <NumberDisplay
                        numberProp={option.value} 
                        size={80}
                        numberColor={accessibilitySettings.numberColor}
                        style={{backgroundColor: accessibilitySettings.boxColor}}
                    ></NumberDisplay>
                </DraggableItem>
            ))}
        </TouchableOpacity>

        {targetSum && (
            <OperacionDisplay 
                containerColor={borderColor}
                numbers={items} 
                operationType={isSum ? "suma" : "resta"}
            />
        )}

        </View>

    )
    
}

const styles = StyleSheet.create({ 

    area: {
        flex:1,
        alignItems: 'center',
        margin: 15,
    },

    container: {
        backgroundColor: '#FFFFFF', 
        flex: 1,
        width: '90%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        
        borderWidth: 2.21,
        borderRadius: 8, 
        

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
    },

    optionWrapper: {
        margin: 5, 
        zIndex: 2,
    },
}); 

export default Container;