import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAccessibilitySettings } from '../../../accessibilitySettings/hooks/useAccessibilitySettings';
import BackButton from '../../../components/common/BackButton/BackButton';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import NumberDisplay from '../../../components/common/NumberDisplays/NumberDisplay';
import FeedbackScreen from '../../../components/FeedBack/Feedback';
import { playTTS } from '../../../components/ttsListener';
import { useGameManager } from '../utils/gameManager';
import { getRandomNumber, generateOptionsWithTarget } from '../utils/gameUtils';
import { CORRECT_COLOR, EMPTY_COLOR, ERROR_COLOR } from '../../../types/games';
import { useRoundMessage } from '../../../components/RoundMessage/useRoundMessage';
import RoundMessage from '../../../components/RoundMessage/RoundMessage';





//TODO calcular puntuacion
const GAME_ID = 1; 



function TapNumberGame() {

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
    
        ttsButtonContainer: {
            padding: 10,
            borderRadius: 15,
            backgroundColor: '#F3F4F6', 
            borderWidth: 1, 
            borderColor: '#D1D5DB', 
            alignItems: 'center', 
            justifyContent: 'center',
            minWidth: 120, 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
        },

        clickableImage: {
            width: 155,
            height: 155,
            resizeMode: 'contain',
        },
        
        ttsButtonText: {
            fontSize: accessibilitySettings.fontSize - 2,
            fontWeight: '600',
            color: '#1F2937',
        },
    
        header: {
            width: '100%',
            padding: 20,
            alignItems: 'center',
        },
        title: {
            fontSize: accessibilitySettings.fontSize + 10,
            fontWeight: '900',
            color: '#101828',
            marginBottom: 10,
        },
        messageText: {
            fontSize: accessibilitySettings.fontSize,
            color: '#333',
            fontWeight: '500',
        },
        optionsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            
            width: '90%',
            padding: 10,
            marginTop: 20,
        },
        optionWrapper: {
            margin: 5, 
        },
    });

    const [targetNumber, setTargetNumber] = useState<number>(0);
    const [options, setOptions] = useState<number[]>([]);

    const [selectedDisplay, setSelectedDisplay] = useState<number | null>(null);
    const [resultColor, setResultColor] = useState<string>();

    const initializeGame = useCallback((minValue: number, maxValue: number, optionsCount: number) => {    
        
        const newTarget = getRandomNumber(minValue, maxValue);
        const newOptions = generateOptionsWithTarget(newTarget, minValue, maxValue, optionsCount);
        
        setTargetNumber(newTarget);
        setOptions(newOptions);
        setSelectedDisplay(null);
        
        playTTS(newTarget.toString());
    }, []);

    const manager = useGameManager(GAME_ID, initializeGame);

    const handlePlayAgain = () => {
        manager.resetGame();
    };

    const handleSelection = async (selectedNumber: number) => {

        setSelectedDisplay(selectedNumber);

        if (selectedNumber === targetNumber) {
            setResultColor(CORRECT_COLOR);
            await roundMessage.show(
                "¡Excelente! Has superado la ronda con éxito.", 
                1000,
                "success"
            );
            manager.advanceGame();
            return;
        }


        await roundMessage.show("Intentalo de nuevo", 1000, "error");

        setResultColor(ERROR_COLOR);
    };

    if (manager.isLoading) {
        return <LoadingSpinner />; 
    }


    return (
        
        <View style={styles.screenContainer}>
            <BackButton width={215} height={76} alignSelf={accessibilitySettings.iconPosition === 'derecha' ? 'flex-end' : 'flex-start'}></BackButton>
            <TouchableOpacity 
                testID="tts-button" 
                onPress={() => playTTS(targetNumber.toString())}  
                style={styles.ttsButtonContainer} // Usamos un nuevo estilo para el contenedor
            >
                <Image
                    source={require('../../../../assets/icons/sound.png')}
                    style={styles.clickableImage}
                    accessibilityLabel="Escuchar el número objetivo de nuevo"
                />
                {/* Nuevo texto de instrucción */}
                <Text style={styles.ttsButtonText}>Escuchar de nuevo</Text> 
            </TouchableOpacity>

            {/* 🔹 Target number oculto para testing */}
            <Text testID="target-number" style={{ display: 'none'}}>
                {targetNumber}
            </Text>

            <View style={styles.header}>
                <Text style={styles.title}>Escucha atentamente y toca el número correcto</Text>
            </View>

            <View style={styles.optionsGrid}>
                {options.map((num, index) => {
                    const displayColor = num === selectedDisplay 
                        ? resultColor 
                        //TODO change to boxCOlor
                        : accessibilitySettings.backgroundColor;

                    return (
                        <TouchableOpacity 
                            key={index} 
                            testID={`option-${num}`}
                            onPress={() => handleSelection(num)}
                            style={styles.optionWrapper}
                        >
                            <NumberDisplay 
                                key={index}
                                numberProp={num} 
                                size={155}
                                style={{backgroundColor: displayColor}} 
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
            
            <RoundMessage 
                message={roundMessage.message} 
                isVisible={roundMessage.isVisible}
                type={roundMessage.type}
            />
            <FeedbackScreen testID="feedback-screen" visible={manager.modalVisible} onNotify={handlePlayAgain}></FeedbackScreen>
        </View>

    );
}

export default TapNumberGame;