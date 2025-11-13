import { useCallback, useState } from "react";
import { useGameManager } from "../utils/gameManager";
import { generarArrayRepartibleTamanoFijo, generateFixedRepeatedOptions } from "../utils/gameUtils";
import { View, Text, StyleSheet } from "react-native";
import { useAccessibilitySettings } from "../../../accessibilitySettings/hooks/useAccessibilitySettings";
import BackButton from "../../../components/common/BackButton/BackButton";

const GAME_ID = 3; 

//TODO calcular puntuacion



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
    });

    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    
    const [options, setOptions] = useState<number[]>([]);
    
    const initializeGame = useCallback((maxRange: number, optionsCount: number, 
        numContainers: number, sum: boolean) => {    

        const newOptions = sum ? generarArrayRepartibleTamanoFijo(maxRange, optionsCount, numContainers) :
        
        generateFixedRepeatedOptions(maxRange, optionsCount, numContainers);


        // const newOptions = generarArrayRepartibleTamanoFijo(maxRange, optionsCount, numContainers);

        setOptions(newOptions);
        setSelectedNumbers([]);

        console.log(newOptions);
        
    }, []);

    const manager = useGameManager(GAME_ID, initializeGame);

    return (
        <View style={styles.screenContainer}>
            <BackButton width={215} 
            height={76}
            alignSelf={accessibilitySettings.iconPosition === 'derecha' ? 'flex-end' : 'flex-start'}>

            </BackButton>
            <Text>Alfon guapo</Text>
        </View>
    )
    
}


export default ContainerSort;