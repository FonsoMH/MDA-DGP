import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';

import NumberDisplay from '../../components/common/NumberDisplays/NumberDisplay';
import BackButton from '../../components/common/BackButton/BackButton';
import FeedbackScreen from '../../components/FeedBack/Feedback';
import { playTTS } from '../../components/ttsListener';
import { generateOptionsWithTarget, getRandomNumber } from '../utils/gameUtils';
import { useGameManager } from '../utils/gameManager';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import { useUser } from '../../hooks/useUser';
import { useAccessibilitySettings } from '../../hooks/useAccesibilitySettings';


//TODO calcular puntuacion
const GAME_ID = 1; 



function TapNumberGame() {

    const [targetNumber, setTargetNumber] = useState<number>(0);
    const [options, setOptions] = useState<number[]>([]);
    const { user } = useUser();
    const [accesibilitySettings] = useAccessibilitySettings();

    const initializeGame = useCallback((maxRange: number, optionsCount: number) => {    
        const newTarget = getRandomNumber(maxRange);
        const newOptions = generateOptionsWithTarget(newTarget, maxRange, optionsCount);
        
        setTargetNumber(newTarget);
        setOptions(newOptions);
        
        playTTS(newTarget.toString());
    }, []);

    const manager = useGameManager(user.id, GAME_ID, initializeGame);

    const handlePlayAgain = () => {
        manager.resetGame();
    };

    const handleSelection = (selectedNumber: number) => {
        if (selectedNumber === targetNumber) {
            manager.advanceGame(); 
        }
    };

    if (manager.isLoading) {
        return <LoadingSpinner />; 
    }


    return (
        
        <View style={styles.screenContainer}>
            <BackButton width={215} height={76}></BackButton>
            <TouchableOpacity onPress={() => playTTS(targetNumber.toString())}  style={styles.imageWrapper}>
                <Image
                source={require('../../../assets/icons/listen.png')}
                style={styles.clickableImage}
                accessibilityLabel="Botón de imagen"
                />
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={styles.title}>Escucha atentamente y toca el número correcto</Text>
            </View>

            <View style={styles.optionsGrid}>
                {options.map((num, index) => (
                    <TouchableOpacity 
                        key={index} 
                        onPress={() => handleSelection(num)}
                        style={styles.optionWrapper}
                    >
                        <NumberDisplay key={index}
                            numberProp={num} 
                            size={155}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            <FeedbackScreen visible={manager.modalVisible} onNotify={handlePlayAgain}></FeedbackScreen>
        </View>

    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#F7F8FA',
        alignItems: 'center',
        padding: 20,
        margin: 20
    },

    imageWrapper: {
        padding: 10,
        borderRadius: 10,
    },

    clickableImage: {
        width: 155,
        height: 155,
        resizeMode: 'contain',
    },

    header: {
        width: '100%',
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        color: '#101828',
        marginBottom: 10,
    },
    messageText: {
        fontSize: 18,
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

export default TapNumberGame;