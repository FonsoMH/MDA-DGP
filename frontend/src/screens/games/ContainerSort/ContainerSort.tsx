import { useCallback, useEffect, useState } from "react";
import { useGameManager } from "../utils/gameManager";
import { generateEquitableFixedSizeArray, generateFixedRepeatedOptions , findExactPartition } from "../utils/gameUtils";
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

    const correctPartition = (part: number[][], container: Option[]) => {
        if(part.length === 0) return false;
        if(container.length === 0) return false;
        if(!part.find(p => p.length === container.length)) return false;

        for (let i = 0; i < part.length; i++) {
            if(part[i].length !== container.length) continue;
            if(sum(part[i]) !== sum(container.map(option => option.value))) continue;

            const allMatch = part[i].every(value => container.some(option => option.value === value));

            if(allMatch) {
                return true;
            }
        }
        return false;

    }

    
    const [activeHint, setActiveHint] = useState<boolean>(false);
    const [hintData, setHintData] = useState<{optionId: string, containerIndex: number} | null>(null);

    const calculateNextMove = useCallback(() => {

        if(targetSum !== null){
            
            if(containerValues === undefined) return null;

            const allOptionsValues = [...options.map(option => option.value),...containerValues.flat().map(option => option.value)];

            const partition : number[][] = findExactPartition(
                allOptionsValues,
                containers,
                targetSum
            );

            if(partition){
                //Si no hay contenedores a medias insertar la primera opcion
                if(containerValues.every(c => c.length === 0 || correctPartition(partition, c))){
                    return {optionId: options[0].id, containerIndex: containerValues.findIndex(c => c.length === 0)};
                }
                //Si no, buscar un movimiento que acerque a la solucion
                for(let i = 0; i < containers; i++){
                    
                    if(containerValues[i] === undefined) continue;
                    if(containerValues[i].length === 0) continue;                 
                    
                    const currentContainerValues = containerValues[i].map(option => option.value);

                    const correctPartition = partition.find(part =>{
                        const tempPart = [...part];
                        
                        return currentContainerValues.every(value => {
                            const index = tempPart.indexOf(value);
                            if(index !== -1){
                                tempPart.splice(index, 1);
                                return true;
                            }
                            return false;
                        });
                    });
                    
                    //Si no hay particion correcta, buscar un valor erroneo
                    if(correctPartition === undefined){
                        const wrongValue = containerValues[i].find((val,idx) =>{
                            const restOfContainer = [...currentContainerValues];
                            restOfContainer.splice(idx,1);

                            return partition.some(part => {
                                const tempPart = [...part];
                                return restOfContainer.every(value => {
                                    const index = tempPart.indexOf(value);
                                    if(index !== -1){
                                        tempPart.splice(index, 1);
                                        return true;
                                    }
                                    return false;
                                });
                            });
                        });
                        if(wrongValue){
                            return { optionId: wrongValue.id, containerIndex: i };
                        }
                    }else{
                        //Busca el siguiente valor necesario para completar la particion correcta

                        const remainingNeeded = [...correctPartition];

                        currentContainerValues.forEach(value => {
                            const index = remainingNeeded.indexOf(value);
                            if(index !== -1){
                                remainingNeeded.splice(index, 1);
                            }
                        });

                        const nextValue = remainingNeeded[0];

                        if(nextValue !== undefined){
                            const match = options.find(option => option.value === nextValue);
                            if(match){
                                return { optionId: match.id, containerIndex: i };
                            }
                        }
                    }
                }
            }

        }else{
            for(let i = 0; i < containers; i++){
                const currentValues = containerValues?.[i] || [];
                if(currentValues.length > 0){
                    const targetValue = currentValues[0].value;
                    const match = options.find(option => option.value === targetValue);
                    if(match){
                        return { optionId: match.id, containerIndex: i };
                    }
                }
            }
            const firstOption = options[0];
            const emptyContainerIndex = containerValues?.findIndex(c => c.length === 0);

            if(firstOption && emptyContainerIndex !== -1 && emptyContainerIndex !== undefined){
                return { optionId: firstOption.id, containerIndex: emptyContainerIndex };
            }
        }

        return null;

    }, [options, containerValues, targetSum, containers]);

    useEffect(() => {
        if(manager.isLoading) return;
        if(activeHint) return;
        if(options.length === 0) return;

        const timer = setTimeout(() => {
            const move = calculateNextMove();
            if(move){
                setActiveHint(true);
                setHintData(move);
            }
        }, 5000); 

        return () => clearTimeout(timer);
        
    },[options, containerValues ,activeHint, calculateNextMove, manager.isLoading]);

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
                        aria-label={`Container-Area-${index}`}
                        accessibilitySettings={accessibilitySettings}
                        isSum={targetSum != null}
                        hintActive={activeHint && hintData?.containerIndex === index}
                        hintOptionId={hintData?.optionId}
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