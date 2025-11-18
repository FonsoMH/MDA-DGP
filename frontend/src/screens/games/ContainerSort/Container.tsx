import { useEffect, useState } from "react";
import {StyleSheet, TouchableOpacity, View } from "react-native";
import NumberDisplay from "../../../components/common/NumberDisplays/NumberDisplay";
import { Gesture } from "react-native-gesture-handler";
import { scheduleOnRN } from "react-native-worklets";
import { CORRECT_COLOR, EMPTY_COLOR, ERROR_COLOR, Option } from "../../../types/games";
import OperacionDisplay from "./OperationDisplay";


interface ContainerProps{
    currentSelectedNumber: Option | null;
    onDropSuccess: () => void;
    onItemReturned: (itemId: Option) => void;
    onUniformityChange: (color: string) => void;
    targetSum: number | null;
    resetSignal: boolean;
}


function Container({
    targetSum, 
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
        
        return allSame ? CORRECT_COLOR : ERROR_COLOR;
    };

    const checkSum = (numbers: Option[]): string => {
        
        if (numbers.length === 0) {
            return EMPTY_COLOR;
        }
        
        const totalSum = numbers.reduce((sum, current) => sum + current.value, 0);

        return totalSum === targetSum ? CORRECT_COLOR : ERROR_COLOR;
    };

    useEffect(() => {
        if (resetSignal) {
            setMyNumbers([]);
            setMyTotal(0);
        }
        
    }, [resetSignal]);

    useEffect(() => {
        
        if(targetSum){
            const color = checkSum(myNumbers);
            setBorderColor(color);
            onUniformityChange(color);
            return;
        }

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
        <View style={styles.area}>

        <TouchableOpacity 
        style={[styles.container, {borderColor: borderColor}]} 
        onPress={handleContainerClick}>
            {myNumbers.map((option, index) => (
                <TouchableOpacity onPress={() => handleNumberCLick(option)}>
                    <NumberDisplay
                        key={`opt-${option.id}-${index}`}
                        numberProp={option.value} 
                        size={80}
                    ></NumberDisplay>
                </TouchableOpacity>
            ))}
        </TouchableOpacity>

        {targetSum && (
            <OperacionDisplay 
                containerColor={borderColor}
                numbers={myNumbers} 
                operationType="suma"
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
    }
}); 

export default Container;