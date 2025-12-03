import { useCallback, useEffect, useState } from "react";
import { useGameManager } from "../utils/gameManager";
import { generateEquitableFixedSizeArray, generateFixedRepeatedOptions } from "../utils/gameUtils";
import { View, Text, StyleSheet } from "react-native";
import { useAccessibilitySettings } from "../../../accessibilitySettings/hooks/useAccessibilitySettings";
import BackButton from "../../../components/common/BackButton/BackButton";
import NumberDisplay from "../../../components/common/NumberDisplays/NumberDisplay";
import Container from "./Container";
import { CORRECT_COLOR, EMPTY_COLOR, Option, SELECTED_COLOR } from "../../../types/games";
import FeedbackScreen from "../../../components/FeedBack/Feedback";
import { useAnimatedRef, useSharedValue } from "react-native-reanimated";
import DraggableItem from "../SequenceGame/DraggableItem";
import RoundMessage from "../../../components/RoundMessage/RoundMessage";
import { useRoundMessage } from "../../../components/RoundMessage/useRoundMessage";

const GAME_ID = 3; 

//TODO calcular puntuacion
type Layout = { x: number; y: number; width: number; height: number; };


function ContainerSort() {

    const accessibilitySettings = useAccessibilitySettings();
    const roundMessage = useRoundMessage();
       

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
            color: accessibilitySettings.foregroundColor,
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
    const [containerValues, setContainerValues] = useState<Option[][]>();
    
    const [options, setOptions] = useState<Option[]>([]);
    const [containers, setContainers] = useState<number>(0);
    const [targetSum, setTargetSum] = useState<number | null>(null);
    
    
    const initializeGame = useCallback((minValue: number, maxValue: number, optionsCount: number, 
        numContainers: number, sum: boolean) => {  
            
        if ( sum ){
            const result = generateEquitableFixedSizeArray(minValue, maxValue, optionsCount, numContainers);

            const newItemsWithOptions = result.puzzleArray.map((value, index) => ({
                id: `item-${index}-${Date.now()}`, 
                value: value,
            }));

            setOptions(newItemsWithOptions);

            setTargetSum(result.targetSum);

            console.log(Array(numContainers).fill([]).map(() => []));
            

        }

        else {
            const newOptions = generateFixedRepeatedOptions(minValue, maxValue, optionsCount, numContainers);
            
            const newItemsWithOptions = newOptions.map((value, index) => ({
                id: `item-${index}-${Date.now()}`, 
                value: value,
            }));

            setOptions(newItemsWithOptions);
        }


        setContainers(numContainers);

        setSelectedNumber(null);
        setContainerStatuses(Array(numContainers).fill(EMPTY_COLOR));

        setContainerValues(Array(numContainers).fill(null).map(() => []));



        
        
    }, []);

    const manager = useGameManager(GAME_ID, initializeGame);

    const handleDropOnContainer = useCallback((targetContainerIndex: number) => {
        if (!selectedNumber) return;

        const droppedItem = selectedNumber;

        setOptions(prevItems =>
            prevItems.filter(item => item.id !== droppedItem.id)
        );

        setContainerValues(prevContainers => {
            const newContainers = [...prevContainers];
            const currentContainer = [...(newContainers[targetContainerIndex] || [])];
            
            newContainers[targetContainerIndex] = [...currentContainer, droppedItem];
            return newContainers;
        });
        
        setSelectedNumber(null);
    }, [selectedNumber]);

    const handleItemReturnedFromContainer = useCallback((item: Option, containerIndex: number) => {      
        
        setOptions(prevItems => [...prevItems, item]);

        setContainerValues(prevContainers => {
            const newContainers = [...prevContainers];
            newContainers[containerIndex] = newContainers[containerIndex].filter(
                val => val.id !== item.id
            );
            return newContainers;
        });

    }, []);

    const handleContainerClick = useCallback((containerIndex: number) => {
        if (selectedNumber) {
            handleDropOnContainer(containerIndex);
        }
    }, [selectedNumber, handleDropOnContainer]);

    const handleNumberSelect = (numberValue: Option) => {
        setSelectedNumber(numberValue);
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

            const handleRoundComplete = async () => {
                
                await roundMessage.show(
                    "¡Excelente! Has superado la ronda con éxito.", 
                    1000,
                    "success"
                );
                
                manager.advanceGame();
                return;
            };

            handleRoundComplete();
            
        }



    }, [containerStatuses]);

    const handlePlayAgain = () => {
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
                style={[styles.gridContainer, { height: '35%' }, {backgroundColor: accessibilitySettings.containerColor}]}
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
                        : accessibilitySettings.boxColor;

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
                                numberColor={accessibilitySettings.numberColor}
                                style={{backgroundColor: displayColor}} 
                            />
                        </DraggableItem>
                        )
                        })}
            </View>

            <View style={styles.resultsContainer}>
                {Array(containers).fill(null).map((_, index) => (
                    <Container targetSum={targetSum}
                    key={index}
                    onContainerClick={() => handleContainerClick(index)}
                    items={containerValues[index] || []}
                    onItemReturned={(option: Option) => handleItemReturnedFromContainer(option, index)}
                    onUniformityChange={(color: string) => handleContainerStatusUpdate(color, index)}
                    topZoneLayout={topZoneLayout}
                    containerIndex={index}
                    onLayoutMeasured={handleContainerLayout}
                    aria-label={`Container-Area-${index}`}
                    accessibilitySettings={accessibilitySettings}
                    />
                ))}
            </View>
            <RoundMessage 
                message={roundMessage.message} 
                isVisible={roundMessage.isVisible}
                type={roundMessage.type}
            />
            <FeedbackScreen 
            visible={manager.modalVisible} 
            onNotify={handlePlayAgain}/>
            
        </View>
    )
    
}


export default ContainerSort;