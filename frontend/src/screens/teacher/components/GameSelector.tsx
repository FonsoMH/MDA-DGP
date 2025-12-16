import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';

const ALL_GAMES_ID = -1;

export default function GameSelector({ 
    selectedGameId, 
    onGameChange,
    style
}: { 
    selectedGameId: number; 
    onGameChange: (gameId: number) => void,
    style?: object
}) {

    return (
        <View style={[styles.container, style]}>
            <View style={[styles.pickerContainer, selectedGameId === 1 && styles.selected]}>
                <Pressable onPress={() => onGameChange(1)} style={styles.pressable}>
                    <Image source={require('../../../../assets/icons/games_icons/icon_game1.png')} style={styles.icon} />
                </Pressable>
            </View>
            <View style={[styles.pickerContainer, selectedGameId === 2 && styles.selected]}>
                <Pressable onPress={() => onGameChange(2)} style={styles.pressable}>
                    <Image source={require('../../../../assets/icons/games_icons/icon_game2.png')} style={styles.icon} />
                </Pressable>
            </View>
            <View style={[styles.pickerContainer, selectedGameId === 3 && styles.selected]}>
                <Pressable onPress={() => onGameChange(3)} style={styles.pressable}>
                    <Image source={require('../../../../assets/icons/games_icons/icon_game3.png')} style={styles.icon} />
                </Pressable>
            </View>
            <View style={[styles.pickerContainer, selectedGameId === 4 && styles.selected]}>
                <Pressable onPress={() => onGameChange(4)} style={styles.pressable}>
                    <Image source={require('../../../../assets/icons/games_icons/icon_game4.png')} style={styles.icon} />
                </Pressable>
            </View>
            <View style={[styles.pickerContainer, selectedGameId === ALL_GAMES_ID && styles.selected]}>
                <Pressable onPress={() => onGameChange(ALL_GAMES_ID)} style={styles.pressable}>
                    <Text style={styles.text}>Todos</Text>    
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 5,
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        width: 75,
        height: 75,
    },
    pressable: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    selected: {
        outlineColor: '#1E90FF',
        outlineWidth: 5,
    },
    icon: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    text: {
        fontSize: 16,
        color: '#333',
    },
});