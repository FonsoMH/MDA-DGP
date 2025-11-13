import { useEffect, useState } from "react";
import {StyleSheet, TouchableOpacity } from "react-native";
import NumberDisplay from "../../../components/common/NumberDisplays/NumberDisplay";
import { Gesture } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import { CORRECT_COLOT, EMPTY_COLOR, ERROR_COLOR, Option } from "../../../types/games";


interface ContainerProps{
    currentSelectedNumber: Option | null;
    onDropSuccess: () => void;
    onItemReturned: (itemId: Option) => void;
    onUniformityChange: (color: string) => void;
    sum: number | null;
    resetSignal: boolean;
}


function Container({
    sum, 
    currentSelectedNumber, 
    onDropSuccess, 
    onItemReturned,
    onUniformityChange,
    resetSignal
}: ContainerProps) {

    const [myNumbers, setMyNumbers] = useState<Option[]>([]);
    const [myTotal, setMyTotal] = useState(0);
    const [borderColor, setBorderColor] = useState(EMPTY_COLOR); 

    const checkUniformity = (numbers: Option[]): string => {
        if (numbers.length === 0) {
            return EMPTY_COLOR;
        }
        
        const firstValue = numbers[0].value;
        const allSame = numbers.every(item => item.value === firstValue);
        
        return allSame ? CORRECT_COLOT : ERROR_COLOR;
    };

    useEffect(() => {
        if (resetSignal) {
            setMyNumbers([]);
            setMyTotal(0);
        }
        
    }, [resetSignal]);

    useEffect(() => {
        const color = checkUniformity(myNumbers);
        setBorderColor(color);
        onUniformityChange(color);
    }, [myNumbers]);

    const handleContainerClick = () => {
        
        if (currentSelectedNumber === null) {
            return;
        }

        const newNumbers = [...myNumbers, currentSelectedNumber];
        setMyNumbers(newNumbers);
        
        setMyTotal(myTotal + currentSelectedNumber.value);

        onDropSuccess(); 
        

    };

    const handleNumberCLick = (itemToReturn: Option) => {

        setMyNumbers(prevItems =>
            prevItems.filter(item => item.id !== itemToReturn.id)
        );

        onItemReturned(itemToReturn);
        
    }

    const tapGesture = Gesture.Tap()
            .onEnd(() => {
                scheduleOnRN(handleContainerClick);
            });

    return (
        <TouchableOpacity 
        style={[styles.container, {borderColor: borderColor}]} 
        onPress={handleContainerClick}>
            {myNumbers.map((option, index) => (
                <TouchableOpacity onPress={() => handleNumberCLick(option)}>
                    <NumberDisplay
                        key={`option-${option.id}-${index}`}
                        numberProp={option.value} 
                        size={80}
                    ></NumberDisplay>
                </TouchableOpacity>
            ))}
        </TouchableOpacity>
    )
    
}

const styles = StyleSheet.create({ 
    container: {
        backgroundColor: '#FFFFFF', 
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        
        borderWidth: 2.21,
        borderRadius: 8, 
        padding: 16,
        margin: 15,

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

export default Container;