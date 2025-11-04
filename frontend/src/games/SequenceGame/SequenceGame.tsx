import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import {
    useSharedValue,
    useAnimatedRef,
} from 'react-native-reanimated';

import BackButton from '../../components/common/BackButton/BackButton';
import NumberDisplay from '../../components/common/NumberDisplays/NumberDisplay';
import FeedbackScreen from '../../components/FeedBack/Feedback';
import { generateRandomOptions } from '../utils/gameUtils';
import { useGameManager } from '../utils/gameManager';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import DraggableItem from './DraggableItem';
import { useAccessibilitySettings } from '../../accessibilitySettings/hooks/useAccessibilitySettings';


const GAME_ID = 2; 

//TODO calcular puntuacion

type Layout = { x: number; y: number; width: number; height: number; };

function SequenceGame() {
    
    const accessibilitySettings = useAccessibilitySettings();

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
            color: '#101828',
            marginBottom: 10,
            textAlign: 'center',
        },
        messageText: {
            fontSize: accessibilitySettings.fontSize,
            color: '#333',
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
            backgroundColor: '#101828',
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
    });

    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [options, setOptions] = useState<number[]>([]);


    const initializeGame = useCallback((maxRange: number, optionsCount: number) => {    
        const newOptions = generateRandomOptions(maxRange, optionsCount);
        setOptions(newOptions);
        setSelectedNumbers([]);
    }, []);

    const manager = useGameManager(GAME_ID, initializeGame);

    const topZoneRef = useAnimatedRef<View>();
    const topZoneLayout = useSharedValue<Layout | null>(null);
    
    const bottomZoneRef = useAnimatedRef<View>();
    const bottomZoneLayout = useSharedValue<Layout | null>(null);
    
    const handlePlayAgain = () => {
        manager.resetGame();
    };

    const handleSelection = (numberSelected: number) => {
        let newSelectedNumbers;
        if (!selectedNumbers.includes(numberSelected)) {
            newSelectedNumbers = [...selectedNumbers, numberSelected];
        } else {
            newSelectedNumbers = selectedNumbers.filter(num => num !== numberSelected);
        }
        setSelectedNumbers(newSelectedNumbers);
        
        if (isGameFinished(newSelectedNumbers, options)) {
            manager.advanceGame();
        }
    };

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
    

    function isSelected(num: number) {
        return selectedNumbers.includes(num);
    };

    if (manager.isLoading) {
        return <LoadingSpinner />; 
    }

    const title = manager.config?.upward 
        ? "Mueve del pequeño al grande" 
        : "Mueve del grande al pequeño";

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
            <BackButton width={215} height={76} alignSelf={accessibilitySettings.iconPosition === 'derecha' ? 'flex-end' : 'flex-start'} />
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {visualIcon}
            </View>
            <View
                style={[styles.gridContainer, { height: '40%' }]}
                ref={topZoneRef}
                onLayout={() => {
                    topZoneRef.current?.measureInWindow((x, y, width, height) => {
                        topZoneLayout.value = { x, y, width, height };
                    });
                }}
            >
                    {options.map((num, index) => (
                        <DraggableItem
                            key={`option-${num}-${index}`}
                            onPress={() => handleSelection(num)} 
                            onDrop={() => handleSelection(num)}
                            dropZoneLayout={bottomZoneLayout} 
                            style={styles.optionWrapper}
                            isDisabled={isSelected(num)} 
                        >
                            <NumberDisplay
                                numberProp={num} 
                                size={120}
                                style={isSelected(num) ? styles.disabled : null}
                            />
                        </DraggableItem>
                    ))}
            </View>
            <View
                style={[styles.gridContainer, { height: '35%' }]}
                ref={bottomZoneRef}
                onLayout={() => {
                    bottomZoneRef.current?.measureInWindow((x, y, width, height) => {
                        bottomZoneLayout.value = { x, y, width, height };
                    });
                }}
            >
                    {selectedNumbers.map((num, index) => (
                        <DraggableItem
                            key={`selected-${num}-${index}`}
                            onPress={() => handleSelection(num)}
                            onDrop={() => handleSelection(num)}
                            dropZoneLayout={topZoneLayout}
                            style={styles.optionWrapper}
                            isDisabled={false}
                        >
                            <>
                                <NumberDisplay
                                    numberProp={num} 
                                    size={100}
                                />
                            </>
                        </DraggableItem>
                    ))}
            </View>
       
            <FeedbackScreen visible={manager.modalVisible} onNotify={handlePlayAgain}></FeedbackScreen>
        </View>
    );
}


export default SequenceGame;