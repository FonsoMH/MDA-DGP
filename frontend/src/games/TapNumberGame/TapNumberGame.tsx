import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import NumberDisplay from '../../components/common/NumberDisplays/NumberDisplay';


type RangeOption = 10 | 20 | 100 | 1000;
type OptionsCount = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface GameProps {
  maxRange: RangeOption;
  optionsCount: OptionsCount;
  buttonSize?: number;
}

//TODO esto a lo mejor se puede mover a otro archivo

const getRandomNumber = (max: number): number => {
  return Math.floor(Math.random() * (max + 1));
};

const generateUniqueOptions = (target: number, max: RangeOption, count: OptionsCount): number[] => {
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

function TapNumberGame({maxRange, optionsCount, buttonSize}: GameProps) {

    const [targetNumber, setTargetNumber] = useState<number>(0);
    const [options, setOptions] = useState<number[]>([]);

    //TODO aqui faltaría mostrar el mensaje de exito
    //TODO calcular el score

   const initializeGame = useCallback(() => {

        const newTarget = getRandomNumber(maxRange);
        const newOptions = generateUniqueOptions(newTarget, maxRange, optionsCount);
        
        setTargetNumber(newTarget);
        setOptions(newOptions);
        
        console.log(`Juego iniciado. Target: ${newTarget}, Opciones: ${newOptions.join(', ')}`);
        

        return null;
        
    }, [maxRange, optionsCount]);

    const handleSelection = (selectedNumber: number) => {
        // TODO Lógica de acierto/error (Pendiente de implementar completamente)
        console.log("Selected:", selectedNumber);
        
        // Aquí se llamaría a initializeGame() si la respuesta fuera correcta
        // setScore(score + 1); 
        if(selectedNumber == targetNumber){
            initializeGame(); 
        }
    };

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    return (
        <View style={styles.screenContainer}> 
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
                            size={buttonSize}
                        />
                    </TouchableOpacity>
                ))}
            </View>
            <View>
                <Text>{targetNumber}</Text>
            </View>
        </View>

    );
}

const styles = StyleSheet.create({ 
    screenContainer: {
        flex: 1,
        backgroundColor: '#F7F8FA',
        alignItems: 'center',
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