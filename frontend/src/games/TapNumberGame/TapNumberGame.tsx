import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal } from 'react-native';

import Sound from 'react-native-sound';

import NumberDisplay from '../../components/common/NumberDisplays/NumberDisplay';
import BackButton from '../../components/common/BackButton/BackButton';
import { useGameConfig } from '../hooks/useGameConfig';
import FeedbackScreen from '../../components/FeedBack/Feedback';


const getRandomNumber = (max: number): number => {
    return Math.floor(Math.random() * (max + 1));
};

//TODO esto a lo mejor se puede mover a otro archivo
const generateUniqueOptions = (target: number, max: number, count: number): number[] => {
  const uniqueOptions = new Set<number>();
  uniqueOptions.add(target);

  while (uniqueOptions.size < count) {
    let randomOption = getRandomNumber(max);
    
    if (randomOption === target) {
      randomOption = (randomOption + 1) % (max + 1); 
    }
    
    uniqueOptions.add(randomOption);
  }

  return Array.from(uniqueOptions).sort(() => Math.random() - 0.5);
};

export const playNumberSound = (numero: number) => {
  const soundName = `n_${numero}`; 

  const audioLocation = Sound.MAIN_BUNDLE; 

  const soundObject = new Sound(soundName, audioLocation, (error) => {
    if (error) {
      console.log('Error al cargar el archivo de sonido: ', error);
      return;
    }
    
    soundObject.play((success) => {
      if (!success) {
        console.log(`Fallo en la reproducción del audio de ${numero}`);
      }
      soundObject.release();
    });
  });
};

//TODO esto deberia depender de login pero no esta hecho aun
const STUDENT_ID = 3; 
const GAME_ID = 1; 

const REPEATS = 5;


function TapNumberGame() {

    const { config, isLoading } = useGameConfig(STUDENT_ID, GAME_ID);

    const [targetNumber, setTargetNumber] = useState<number>(0);
    const [options, setOptions] = useState<number[]>([]);
    const [isGameInitialized, setIsGameInitialized] = useState<boolean>(false); 

    const [games, setGames] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);
    
    const handlePlayAgain = () => {
        setGames(1);
        setModalVisible(false);
        initializeGame();
    };

    //TODO calcular el score

    const maxRange: number = config?.ranges ?? 10;
    const optionsCount = (config?.numElements ?? 9) as number;

   const initializeGame = useCallback(() => {    
        const newTarget = getRandomNumber(maxRange);
        const newOptions = generateUniqueOptions(newTarget, maxRange, optionsCount);
        
        setTargetNumber(newTarget);
        setOptions(newOptions);
        
        playNumberSound(newTarget);
        return null;
        
    }, [maxRange, optionsCount]);

    const handleSelection = (selectedNumber: number) => {
        // TODO Lógica de acierto/error (Pendiente de implementar completamente)
        
        // setScore(score + 1); 
        if(selectedNumber == targetNumber){
            if (games == REPEATS) {
                setModalVisible(true);
                console.log("¡Máximo de juegos alcanzado!");
            }
            else{
                initializeGame(); 
                setGames(prevGames => prevGames + 1 );
                console.log("aumentamos");
                
            }
        }
    };

    useEffect(() => {
        if (!isLoading && config && !isGameInitialized) {
            initializeGame();
            setIsGameInitialized(true); 
        }
    }, [isLoading, config, initializeGame, isGameInitialized]);


    return (
        
        <View style={styles.screenContainer}>
            <BackButton width={215} height={76}></BackButton>
            <TouchableOpacity onPress={() => playNumberSound(targetNumber)}  style={styles.imageWrapper}>
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

            <FeedbackScreen visible={modalVisible} onNotify={handlePlayAgain}></FeedbackScreen>
        </View>

    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#F7F8FA',
        alignItems: 'center',
        padding: 20,
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