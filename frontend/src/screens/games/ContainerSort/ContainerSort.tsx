import { useCallback, useEffect, useState } from "react";
import { useGameManager } from "../utils/gameManager";
import { generateEquitableFixedSizeArray, generateFixedRepeatedOptions } from "../utils/gameUtils";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAccessibilitySettings } from "../../../accessibilitySettings/hooks/useAccessibilitySettings";
import BackButton from "../../../components/common/BackButton/BackButton";
import NumberDisplay from "../../../components/common/NumberDisplays/NumberDisplay";
import Container from "./Container";
import { CORRECT_COLOR, EMPTY_COLOR, Option } from "../../../types/games";
import FeedbackScreen from "../../../components/FeedBack/Feedback";

const GAME_ID = 3; 

//TODO calcular puntuacion



function ContainerSort() {

    const accessibilitySettings = useAccessibilitySettings();
    

    const styles = StyleSheet.create({
        screenContainer: {
            flex: 1,
            backgroundColor: accessibilitySettings.backgroundColor,
            alignItems: 'center',
            paddingVertical: 30,
            paddingHorizontal: 20
        },

        headerContainer: {
            width: '100%',
            height: '20%'
        },

        titleText: {
            fontSize: accessibilitySettings.fontSize * 1.5, 
            color: accessibilitySettings.highContrast ? '#FFFF00' : accessibilitySettings.foregroundColor, 
            fontWeight: accessibilitySettings.highContrast ? '900' : 'bold',
            marginBottom: 5,
            textAlign: 'center',
            
        },

        instructionText: {
            fontSize: accessibilitySettings.fontSize,
            color: accessibilitySettings.foregroundColor,
            marginBottom: 20, 
            textAlign: 'center',
        },

        gridContainer: {
            width: '95%',
            padding: 10,
            marginTop: 10,
            alignItems: 'center',
            borderWidth: 2,           
            borderColor: '#000000',   
            borderRadius: 15,
            backgroundColor: '#FFFFFF',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
        },

        resultsContainer: {
            display: 'flex',
            flexDirection: 'row',
            flex: 1,
            width: '100%',
        }

        

    });

    const [selectedNumber, setSelectedNumber] = useState<Option | null>(null);

    const [containerStatuses, setContainerStatuses] = useState<string[]>();
    const [resetSignal, setResetSignal] = useState(false);
    
    const [options, setOptions] = useState<Option[]>([]);
    const [containers, setContainers] = useState<number>(0);
    const [targetSum, setTargetSum] = useState<number | null>(null);
    
    
    const initializeGame = useCallback((maxRange: number, optionsCount: number, 
        numContainers: number, sum: boolean) => {  
            
        if ( sum ){
            const result = generateEquitableFixedSizeArray(maxRange, optionsCount, numContainers);

            const newItemsWithOptions = result.puzzleArray.map((value, index) => ({
                id: `item-${index}-${Date.now()}`, 
                value: value,
            }));

            setOptions(newItemsWithOptions);

            setTargetSum(result.targetSum);

        }

        else {
            const newOptions = generateFixedRepeatedOptions(maxRange, optionsCount, numContainers);
            
            const newItemsWithOptions = newOptions.map((value, index) => ({
                id: `item-${index}-${Date.now()}`, 
                value: value,
            }));

            setOptions(newItemsWithOptions);
        }


        setContainers(numContainers);

        setSelectedNumber(null);
        setResetSignal(false);
        setContainerStatuses(Array(numContainers).fill(EMPTY_COLOR));

        
        
    }, []);

    const manager = useGameManager(GAME_ID, initializeGame);


    const clearSelectedNumber = () => {

        setOptions(prevItems =>
            prevItems.filter(item => item.id !== selectedNumber.id)
        );
        setSelectedNumber(null);
    };

    const handleNumberSelect = (numberValue: Option) => {
        setSelectedNumber(numberValue);
    };

    const handleItemReturnedFromContainer = (item: Option) => {      
        setOptions(prevItems => [...prevItems, item]);
    };

    const handleContainerStatusUpdate = (color: string, containerIndex: number) => {
    
        setContainerStatuses(prevStatuses => {
            const newStatuses = [...prevStatuses];
            newStatuses[containerIndex] = color;
            return newStatuses;
        });
    };

    useEffect(() => {
        if(!containerStatuses){
            return;
        }

        const allGreen = containerStatuses.every(status => status === CORRECT_COLOR);

        if (allGreen && options.length == 0) {
            setResetSignal(true);
            manager.advanceGame();
            
        }
    }, [containerStatuses]);

    const handlePlayAgain = () => {
        setResetSignal(true);
        manager.resetGame();
    };


    return (
        <View style={styles.screenContainer}>
            <View style={styles.headerContainer}>
            <BackButton width={215} 
            height={76}
            alignSelf={ accessibilitySettings.iconPosition === 'derecha' ? 'flex-end' : 'flex-start'}>

            </BackButton>
            <Text style={styles.titleText} >Reparte Equitativamente</Text>
            <Text style={styles.instructionText}>Arrastra los números a los recipientes para que todos tengan la misma cantidad</Text>    
            </View>
                

            <View
                style={[styles.gridContainer, { height: '35%' }]}
                // ref={topZoneRef}
                // onLayout={() => {
                //     topZoneRef.current?.measureInWindow((x, y, width, height) => {
                //         topZoneLayout.value = { x, y, width, height };
                //     });
                // }}
            >
                    {options.map((option) => (
                        // <DraggableItem
                        //     key={`option-${num}-${index}`}
                        //     onPress={() => handleSelection(num)} 
                        //     onDrop={() => handleSelection(num)}
                        //     dropZoneLayout={bottomZoneLayout} 
                        //     style={styles.optionWrapper}
                        //     isDisabled={isSelected(num)} 
                        // >
                        <TouchableOpacity
                            onPress={() => handleNumberSelect(option)}
                            key={`option-${option.id}`}
                        >
                            <NumberDisplay
                                numberProp={option.value} 
                                size={100}
                            />
                        </TouchableOpacity>
                        // </DraggableItem>
                    ))}
            </View>

            <View style={styles.resultsContainer}>
                {Array(containers).fill(null).map((_, index) => (
                    <Container targetSum={targetSum}
                    currentSelectedNumber={selectedNumber}
                    onDropSuccess={clearSelectedNumber}
                    onItemReturned={(option: Option) => handleItemReturnedFromContainer(option)}
                    onUniformityChange={(color: string) => handleContainerStatusUpdate(color, index)}
                    resetSignal={resetSignal}
                    />
                ))}
            </View>
            <FeedbackScreen 
            visible={manager.modalVisible} 
            onNotify={handlePlayAgain}/>
            
        </View>
    )
    
}


export default ContainerSort;