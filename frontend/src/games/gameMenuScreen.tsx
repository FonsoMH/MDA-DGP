import * as React from 'react';
import {
    View,
    Text,
    Pressable,
    Image,
    StyleSheet,
    ImageSourcePropType,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation'; 
import { GameStackParamList } from '../navigation/GameNavigator';
import BackButton from '../components/common/BackButton/BackButton'; // Lo usas, así que está bien

type Props = NativeStackScreenProps<RootStackParamList, 'GameMenu'>;

type Game = {
    id: keyof GameStackParamList;
    title: string;
    image: ImageSourcePropType;
};

const GAMES: Game[] = [
    {
        id: 'TapNumberGame',
        title: 'Toca el número que suena',
        image: require('../../assets/icons/games_icons/icon_game1.png'),
    },
    {
        id: 'SequenceGame',
        title: 'Ordena la secuencia',
        image: require('../../assets/icons/games_icons/icon_game2.png'),
    },
    {
        id: 'Game3',
        title: 'Reparte el mismo número',
        image: require('../../assets/icons/games_icons/icon_game3.png'),
    },
    {
        id: 'Game4',
        title: 'Deja el mismo númeroooooo',
        image: require('../../assets/icons/games_icons/icon_game4.png'),
    },
];

export default function GameMenuScreen({ navigation }: Props) {

    return (
        <View style={styles.safe}>
			<BackButton width={215} height={76} />
                <View style={styles.gridContainer}>
                    {GAMES.map((item) => (
                        <Pressable
                            key={item.id}
                            onPress={() => navigation.navigate('Games', { screen: item.id })}
                            style={styles.card}
                            accessibilityRole="button"
                            accessibilityLabel={`Jugar a ${item.title}`}
                        >
                            <Image source={item.image} style={styles.cardImage} />
                            <Text style={styles.cardTitle} numberOfLines={2}>
                                {item.title}
                            </Text>
                        </Pressable>
                    ))}
                </View>
  
        </View>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#F7F8FA',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
		margin:20
    },
    
    gridContainer: {
        width: '95%',
        height: '70%',
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
		padding: 10,
        marginTop: 10,
    },
    
    card: {
        width: '48%', 
		height: '50%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
        marginBottom: 20,
    },
    cardImage: {
        width: '80%',
        flex: 1,
        resizeMode: 'contain',
    },
    cardTitle: {
        marginTop: 12,
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
        textAlign: 'center',
    },
});