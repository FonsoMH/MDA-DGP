import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import {
    useSharedValue,
    useAnimatedRef,
} from 'react-native-reanimated';
import { useAccessibilitySettings } from '../../../accessibilitySettings/hooks/useAccessibilitySettings';
import GameBackButton from '../components/GameBackButton'; //al cambiar el boton habra porblemas con los test<----revisar
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import NumberDisplay from '../../../components/common/NumberDisplays/NumberDisplay';
import FeedbackScreen from '../../../components/FeedBack/Feedback';
import { useGameManager } from '../utils/gameManager';
import { useGameSession } from '../hooks/useGameSession';
import { generateRandomOptions } from '../utils/gameUtils';
import DraggableItem from './DraggableItem';
import { CORRECT_COLOR, ERROR_COLOR } from '../../../types/games';
import { useRoundMessage } from '../../../components/RoundMessage/useRoundMessage';
import RoundMessage from '../../../components/RoundMessage/RoundMessage';


type TargetElement = {
    value: number | null; // El número colocado o null si está vacío
    correctValue: number; // El número que DEBERÍA ir aquí
    isCorrect: boolean;
};

const GAME_ID = 2; 

//TODO calcular puntuacion

type Layout = { x: number; y: number; width: number; height: number; };

function SequenceGame() {
    
    const accessibilitySettings = useAccessibilitySettings();
    const roundMessage = useRoundMessage();
    

    const styles = StyleSheet.create({
        screenContainer: {
            flex: 1,
            backgroundColor: accessibilitySettings.backgroundColor,
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 30,
        },

        header: {
            width: '100%',
            paddingVertical: 5,
            alignItems: 'center',
            flexDirection: 'row',
            gap: 20,
            justifyContent: 'center',
        },
        title: {
            fontSize: accessibilitySettings.fontSize + 10,
            fontWeight: '900',
            color: accessibilitySettings.foregroundColor,
            marginBottom: 10,
            textAlign: 'center',
        },
        messageText: {
            fontSize: accessibilitySettings.fontSize,
            color: accessibilitySettings.foregroundColor,
            fontWeight: '500',
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

        optionWrapper: {
            margin: 5, 
            zIndex: 2,
        },

        disabled: {
            backgroundColor: 'grey',
            opacity: 0.3
        },

        iconContainer: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            height: 40,
        },
        bar: {
            width: 15,
            backgroundColor: accessibilitySettings.foregroundColor,
            marginHorizontal: 3,
            borderRadius: 4,
        },
        barSmall: {
            height: '40%',
        },
        barMedium: {
            height: '70%',
        },
        barLarge: {
            height: '100%',
        },

        emptyBox: { 
            width: 100,
            height: 100,
            margin: 5,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: '#000000',
            justifyContent: 'center',
            alignItems: 'center',
        }
    });

    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [options, setOptions] = useState<number[]>([]);


    const initializeGame = useCallback((minValue: number, maxValue: number, optionsCount: number) => {    
        const newOptions = generateRandomOptions(minValue,maxValue, optionsCount);
        setOptions(newOptions);
        setSelectedNumbers([]);
    }, []);

    const manager = useGameManager(GAME_ID, initializeGame);
    // Hook de sesión para registrar aciertos/fallos por ronda y abandono
    const session = useGameSession({ gameId: GAME_ID });

    const topZoneRef = useAnimatedRef<View>();
    const topZoneLayout = useSharedValue<Layout[] | null>(null);
    
    const bottomZoneRef = useAnimatedRef<View>();
    const bottomZoneLayout = useSharedValue<Layout[] | null>(null);
    
    const handlePlayAgain = () => {
        manager.resetGame();
        session.resetSession();
    };

    const handleSelection = async (numberSelected: number) => {
        // Iniciamos la ronda al primer intento de interacción (idempotente)
        session.startRound();
        let newSelectedNumbers;
        if (!selectedNumbers.includes(numberSelected)) {
            newSelectedNumbers = [...selectedNumbers, numberSelected];
        } else {
            newSelectedNumbers = selectedNumbers.filter(num => num !== numberSelected);
        }
        setSelectedNumbers(newSelectedNumbers);
        
        // Caso: secuencia completa y correcta => ronda exitosa (solo si no hubo errores previos)
        if (isGameFinished(newSelectedNumbers, options)) {
            await roundMessage.show(
                "¡Excelente! Has superado la ronda con éxito.", 
                1000,
                "success"
            );
            // Resolución de la ronda: se contabiliza éxito si no hubo intento completo incorrecto antes.
            session.resolveRound();
            manager.advanceGame();
            return
        }
        
        // Caso: secuencia completa pero incorrecta => marcamos error de la ronda (una sola vez)
        // Política: cualquier intento completo incorrecto convierte la ronda en fallo final cuando se resuelva.
        if(newSelectedNumbers.length == options.length){
            await roundMessage.show(
                "Intentalo de nuevo", 
                1000,
                "error"
            );
            // Registrar error de la ronda sólo el primer intento fallido completo
            if (!session.hasErrorThisRound) {
                session.registerError();
            }
            setSelectedNumbers([]);
            return;
        }
    };

    const getCorrectSequence = (allOptions: number[]): number[] => {
        if (!manager.config) return [];
        
        const compareFn = (a: number, b: number) => {
            return manager.config!.upward ? a - b : b - a;
        };

        return [...allOptions].sort(compareFn);
    };

    const correctSequence = getCorrectSequence(options);

    const isGameFinished = (selected: number[], allOptions: number[]): boolean => {
        if (selected.length !== allOptions.length || allOptions.length === 0) {
            return false;
        }

        const compareFn = (a: number, b: number) => {
            return manager.config?.upward ? a - b : b - a;
        };

        const correctOrder = [...allOptions].sort(compareFn);

        return JSON.stringify(selected) === JSON.stringify(correctOrder);
    };

    const targetElements: TargetElement[] = correctSequence.map((correctValue, index) => {
        
        const currentPlacedValue = selectedNumbers[index] !== undefined ? selectedNumbers[index] : null;

        return {
            value: currentPlacedValue,
            correctValue: correctValue,
            isCorrect: currentPlacedValue === correctValue,
        };
    });
    

    function isSelected(num: number) {
        return selectedNumbers.includes(num);
    };

    if (manager.isLoading) {
        return <LoadingSpinner />; 
    }

    const title = manager.config?.upward 
        ? "Ordena del pequeño al grande" 
        : "Ordena del grande al pequeño";

    const visualIcon = manager.config?.upward  ? (
        <View style={styles.iconContainer}>
            <View style={[styles.bar, styles.barSmall]} />
            <View style={[styles.bar, styles.barMedium]} />
            <View style={[styles.bar, styles.barLarge]} />
        </View>
    ) : (
        <View style={styles.iconContainer}>
            <View style={[styles.bar, styles.barLarge]} />
            <View style={[styles.bar, styles.barMedium]} />
            <View style={[styles.bar, styles.barSmall]} />
        </View>
    );

    return (
        <View style={styles.screenContainer}>
            <GameBackButton 
                width={215} 
                height={76} 
                alignSelf={accessibilitySettings.iconPosition === 'derecha' ? 'flex-end' : 'flex-start'}
                session={session}
            />
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {visualIcon}
            </View>
            <View
                style={[styles.gridContainer, { height: '40%' },{backgroundColor: accessibilitySettings.containerColor}]}
                ref={topZoneRef}
                onLayout={() => {
                    topZoneRef.current?.measureInWindow((x, y, width, height) => {
                        const layout: Layout = { x, y, width, height };
                        topZoneLayout.value = [layout]; 
                    });
                }}
            >
                    {options.map((num, index) => (
                        <DraggableItem
                            key={`option-${num}-${index}`}
                            testID={`sequence-item-${num}`}
                            onPress={() => handleSelection(num)} 
                            onDrop={() => handleSelection(num)}
                            dropZonesLayouts={bottomZoneLayout} 
                            style={styles.optionWrapper}
                            isDisabled={isSelected(num)} 
                            comeBack={true}
                        >
                            <NumberDisplay
                                numberProp={num} 
                                size={120}
                                numberColor={accessibilitySettings.numberColor}
                                style={[isSelected(num) ? styles.disabled : null, {backgroundColor: accessibilitySettings.boxColor}]} 
                            />
                        </DraggableItem>
                    ))}
            </View>
            <View
                style={[styles.gridContainer, { height: '35%' }, {backgroundColor: accessibilitySettings.containerColor}]}
                ref={bottomZoneRef}
                onLayout={() => {
                    bottomZoneRef.current?.measureInWindow((x, y, width, height) => {
                        const layout: Layout = { x, y, width, height };
                        bottomZoneLayout.value = [layout]; 
                    });
                }}
            >

                {targetElements.map((target, index) => {
                        const feedbackColor = target.isCorrect 
                                ? CORRECT_COLOR 
                                : ERROR_COLOR;
                                

                        if (target.value !== null) {
                            return (
                                <DraggableItem
                                    key={`selected-${target.value}-${index}`}
                                    testID={`sequence-item-${target.value}`}
                                    onPress={() => handleSelection(target.value)}
                                    onDrop={() => handleSelection(target.value)}
                                    dropZonesLayouts={topZoneLayout}
                                    style={styles.optionWrapper}
                                    isDisabled={false}
                                    comeBack={false}
                                >
                                    <NumberDisplay
                                        numberProp={target.value} 
                                        size={100}
                                        numberColor={accessibilitySettings.numberColor}
                                        style={{backgroundColor: feedbackColor}} 
                                    />
                                </DraggableItem>
                            );
                        } else {
                            return (
                                <View key={`placeholder-${index}`} style={styles.emptyBox}>
                                </View>
                            );
                        }
                })}
            </View>
            
            <RoundMessage 
                message={roundMessage.message} 
                isVisible={roundMessage.isVisible}
                type={roundMessage.type}
            />
            <FeedbackScreen visible={manager.modalVisible} onNotify={handlePlayAgain}></FeedbackScreen>
        </View>
    );
}


export default SequenceGame;