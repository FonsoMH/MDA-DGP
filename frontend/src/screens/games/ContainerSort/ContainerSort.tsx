import { useCallback, useEffect, useRef, useState } from "react";
import { useGameManager } from "../utils/gameManager";
import { generateEquitableFixedSizeArray, generateFixedRepeatedOptions } from "../utils/gameUtils";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAccessibilitySettings } from "../../../accessibilitySettings/hooks/useAccessibilitySettings";
import BackButton from "../../../components/common/BackButton/BackButton";
import NumberDisplay from "../../../components/common/NumberDisplays/NumberDisplay";
import Container from "./Container";
import { CORRECT_COLOR, EMPTY_COLOR, Option, SELECTED_COLOR } from "../../../types/games";
import FeedbackScreen from "../../../components/FeedBack/Feedback";
import { useAnimatedRef, useDerivedValue, useSharedValue } from "react-native-reanimated";
import DraggableItem from "../SequenceGame/DraggableItem";

const GAME_ID = 3; 

//TODO calcular puntuacion
type Layout = { x: number; y: number; width: number; height: number; };


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
        },

        optionWrapper: {
            margin: 5, 
            zIndex: 2,
        },

        

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
        setDropSelected(null);
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

    const topZoneRef = useAnimatedRef<View>();
    const topZoneLayout = useSharedValue<Layout[] | null>(null);

    const bottomZoneLayouts = useSharedValue<Layout[]>([]);

    //TODO revisar
    const handleContainerLayout = ((layout: Layout, index: number) => {
        'worklet';
        
        if ( index == containers -1 ){
            

            bottomZoneLayouts.set((currentLayouts) => {
                'worklet';
                const newLayouts = [...currentLayouts];

                for (let i = index; i>= 0; i--){

                    const newLayout: Layout = {
                        height: layout.height,
                        width: layout.width,
                        x: layout.x - ((containers - i - 1) * (layout.width + 30)),
                        y: layout.y
                    }

                    newLayouts[i] = newLayout;
                    

                }
                return newLayouts;
            });
        }
        
    });


    const [dropSelected, setDropSelected] =  useState<number | null>(null);

    const handleDropOnContainer = ((index: number) => {
        setDropSelected(index);
    });

    return (
        <View style={styles.screenContainer}>
            <View style={styles.headerContainer}>
            <BackButton width={215} 
            height={76}
            alignSelf={ accessibilitySettings.iconPosition === 'derecha' ? 'flex-end' : 'flex-start'}>

            </BackButton>
            <Text style={styles.titleText} >Reparte el mismo número en cada recipiente</Text>
            <Text style={styles.instructionText}>Arrastra los números a los recipientes para que todos tengan la misma cantidad</Text>    
            </View>
                

            <View
                style={[styles.gridContainer, { height: '35%' }]}
                ref={topZoneRef}
                onLayout={() => {
                    topZoneRef.current?.measureInWindow((x, y, width, height) => {
                        const layout: Layout = { x, y, width, height };
                        topZoneLayout.value = [layout]; 
                    });
                }}
            >
                    {options.map((option, index) => {

                        const displayColor = option.id === selectedNumber?.id
                        ? SELECTED_COLOR 
                        //TODO change to boxCOlor
                        : accessibilitySettings.backgroundColor;

                        return( 
                        <DraggableItem
                            onPress={() => handleNumberSelect(option)}
                            dropZonesLayouts={bottomZoneLayouts} 
                            isDisabled={false} 
                            onStart={() => handleNumberSelect(option)}
                            onDrop={(targetIndex) => handleDropOnContainer(targetIndex)}
                            key={`option-${option.id}-${index}`}
                            comeBack={false}
                            style={styles.optionWrapper}
                        >
                            <NumberDisplay
                                numberProp={option.value} 
                                size={100}
                                style={{backgroundColor: displayColor}} 
                            />
                        </DraggableItem>
                        )
                        })}
            </View>

            <View style={styles.resultsContainer}>
                {Array(containers).fill(null).map((_, index) => (
                    <Container targetSum={targetSum}
                    currentSelectedNumber={selectedNumber}
                    onDropSuccess={clearSelectedNumber}
                    onItemReturned={(option: Option) => handleItemReturnedFromContainer(option)}
                    onUniformityChange={(color: string) => handleContainerStatusUpdate(color, index)}
                    resetSignal={resetSignal}
                    topZoneLayout={topZoneLayout}

                    containerIndex={index}
                    onLayoutMeasured={handleContainerLayout}
                    receivedIndex={dropSelected}
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