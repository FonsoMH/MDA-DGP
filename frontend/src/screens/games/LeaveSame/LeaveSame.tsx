import { useCallback, useEffect, useState } from "react";
import { useGameManager } from "../utils/gameManager";
import { generateEquitableAdjustmentPuzzle } from "../utils/gameUtils";
import { View, Text, StyleSheet } from "react-native";
import { useAccessibilitySettings } from "../../../accessibilitySettings/hooks/useAccessibilitySettings";
import BackButton from "../../../components/common/BackButton/BackButton";
import NumberDisplay from "../../../components/common/NumberDisplays/NumberDisplay";
import { CORRECT_COLOR, EMPTY_COLOR, Option, SELECTED_COLOR } from "../../../types/games";
import FeedbackScreen from "../../../components/FeedBack/Feedback";
import { useAnimatedRef, useSharedValue } from "react-native-reanimated";
import DraggableItem from "../SequenceGame/DraggableItem";
import RoundMessage from "../../../components/RoundMessage/RoundMessage";
import { useRoundMessage } from "../../../components/RoundMessage/useRoundMessage";
import Container from "../ContainerSort/Container";

const GAME_ID = 4; 

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
    const [isSum, setIsSum] = useState<boolean>();
    
    const [options, setOptions] = useState<Option[]>([]);
    const [containers, setContainers] = useState<number>(0);
    const [targetSum, setTargetSum] = useState<number | null>(null);
    const [solutionContainers, setSolutionContainers] = useState<number[][] | null>(null);
    
    
    const initializeGame = useCallback((minValue: number, maxValue: number, optionsCount: number, 
        numContainers: number, sum: boolean) => {  
        
        setIsSum(sum);

        let result: { initialContainers: number[][]; solutionContainers?: number[][]; target: number };

        if (window.Cypress && window.Cypress.env('E2E_DATA') === 'FIXED_CONTAINERS') {
            
            result = {
                initialContainers: [
                    [4, 8, 3],
                    [10, 2, 9],
                    [7, 5, 1]
                ],
                target: 12

            };
        } else {
            result = generateEquitableAdjustmentPuzzle(
                minValue, maxValue, optionsCount, numContainers, sum);
        }
            

        let optionsFlatList: { id: string, value: number }[] = [];
        const initialContainersWithIds: { id: string, value: number }[][] = 
            result.initialContainers.map((containerArray) => {
                
                const containerWithIds = containerArray.map((value, indexInContainer) => {
                    const newId = `option-${value}-${Date.now()}-${Math.random()}`;
                    
                    const itemObject = {
                        id: newId, 
                        value: value,
                    };
                    
                    optionsFlatList.push(itemObject); 

                    return itemObject;
                });

                return containerWithIds;
            });

        setContainerValues(initialContainersWithIds);

        setTargetSum(result.target);

        setSolutionContainers(result.solutionContainers || null);

        setContainers(numContainers);

        setSelectedNumber(null);
        setContainerStatuses(Array(numContainers).fill(EMPTY_COLOR));

        setOptions([]);

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

        if (allGreen) {

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


    const sum = (numbers: number[]) => {
        
        let result: number;

        if (targetSum != null) {
            // Lógica de suma original
            result = numbers.reduce((sum, current) => sum + current, 0);

        } else {
            // Lógica de resta acumulativa:
            // Toma el primer valor y le resta el resto de los valores.
            
            if (numbers.length === 1) {
                result = numbers[0];
            } else {
                // Inicializa con el primer valor y resta los subsiguientes
                const firstValue = numbers[0];
                result = numbers.slice(1).reduce((diff, current) => diff - current, firstValue);
                result = Math.abs(result);
            }

        }
        return result;
    };

    const [activeHint, setActiveHint] = useState<boolean>(false);
    const [hintData, setHintData] = useState<{optionId: string, containerIndex: number} | null>(null);

    const calculateNextMove = useCallback(() => {
        if (!solutionContainers || !containerValues) {
            return null;
        }

        for(let i = 0; i < containerValues.length; i++){    

            if(sum(containerValues[i].map(item => item.value)) === targetSum){
                continue;
            }

            const requiredValues = [...solutionContainers[i]];

            const currentItems = containerValues[i];

            const tempCheckList =  [...requiredValues];

            for(let j = 0; j < currentItems.length; j++){
                const item = currentItems[j];
                const valueIndex = tempCheckList.indexOf(item.value);
                if(valueIndex > -1){
                    tempCheckList.splice(valueIndex, 1);
                }else{
                    if(item.value != 0){
                        return { optionId: item.id, containerIndex: i };
                    }
                }
            }

            const currentValuesMap = currentItems.map(item => item.value);

            for(let j = 0; j < requiredValues.length; j++){
                const neededValue = requiredValues[j];

                const foundIndex = currentValuesMap.indexOf(neededValue);

                if(foundIndex > -1){
                    currentValuesMap.splice(foundIndex, 1);
                }else{
                    const missingOption = options.find(option => option.value === neededValue);
                    if(missingOption){
                        return { optionId: missingOption.id, containerIndex: i };
                    }
                }
            }
        }

        return null;
        
    }, [options, containerValues, targetSum, solutionContainers, containers]);

    useEffect(() => {
        if(manager.isLoading) return;
        if(activeHint) return;

        const timer = setTimeout(() => {
            const move = calculateNextMove();
            console.log(move + " <- next move in LeaveSame");
            if(move){
                setActiveHint(true);
                setHintData(move);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [options, containerValues, targetSum, containers, manager.isLoading, activeHint, calculateNextMove]);

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
            <Text style={styles.titleText} >Deja igual</Text>
            <Text style={styles.instructionText}>Saca los que sobran para que todos tengan la misma cantidad</Text>    
            </View>
                

            <View
                style={[styles.gridContainer, { height: '25%' }, {backgroundColor: accessibilitySettings.containerColor}]}
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
                            testID={"option-item"}
                        >
                            <NumberDisplay
                                numberProp={option.value} 
                                size={100}
                                numberColor={accessibilitySettings.numberColor}
                                style={{backgroundColor: displayColor}} 
                                activeHint={activeHint && hintData?.optionId === option.id}
                                onEndHint={() => setActiveHint(false)}
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
                    accessibilitySettings={accessibilitySettings}
                    isSum={isSum}
                    hintActive={activeHint && hintData?.containerIndex === index}
                    hintOptionId={hintData?.optionId || null}
                    onEndHint={() => setActiveHint(false)}
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