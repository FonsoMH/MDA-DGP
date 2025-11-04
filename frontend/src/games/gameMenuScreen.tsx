import * as React from 'react';
import {
	SafeAreaView,
	View,
	Text,
	FlatList,
	Pressable,
	Image,
	StyleSheet,
	ImageSourcePropType,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'GameMenu'>;

type Game = {
	id: string; // slug
	title: string;
	image: ImageSourcePropType;
};

const GAMES: Game[] = [
	{
		id: 'toca-numero',
		title: 'Toca el número que suena',
		image: require('../../assets/GamesIcons/pictogramaJuego1.png'),
	},
	{
		id: 'ordena-secuencia',
		title: 'Ordena la secuencia',
		image: require('../../assets/GamesIcons/pictogramaJuego2.png'),
	},
	{
		id: 'reparte-igual',
		title: 'Reparte el mismo número',
		image: require('../../assets/GamesIcons/pictogramaJuego3.png'),
	},
	{
		id: 'deja-igual',
		title: 'Deja el mismo número',
		image: require('../../assets/GamesIcons/pictogramaJuego4.png'),
	},
];

export default function GameMenuScreen({ navigation }: Props) {
	const goBack = React.useCallback(() => {
		if (navigation.canGoBack()) navigation.goBack();
	}, [navigation]);

	const onSelect = React.useCallback(
		(gameId: string) => {
			// De momento navegamos a Details con un ID ficticio
			navigation.navigate('Details', { itemId: 1 });
			// En el futuro: navigation.navigate('Play', { gameId })
		},
		[navigation]
	);

	return (
		<SafeAreaView style={styles.safe}>
			<View style={styles.headerRow}>
				<Pressable
					onPress={goBack}
					style={styles.backButton}
					accessibilityRole="button"
					accessibilityLabel="Volver"
				>
					<Text style={styles.backText}>Volver</Text>
				</Pressable>
			</View>

			<FlatList
				data={GAMES}
				keyExtractor={(item) => item.id}
				numColumns={2}
				columnWrapperStyle={styles.columns}
				contentContainerStyle={styles.listContent}
				renderItem={({ item }) => (
					<Pressable
						onPress={() => onSelect(item.id)}
						style={({ pressed }) => [
							styles.card,
							pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
						]}
						accessibilityRole="button"
						accessibilityLabel={`Jugar a ${item.title}`}
					>
						<Image source={item.image} style={styles.cardImage} />
						<Text style={styles.cardTitle} numberOfLines={2}>
							{item.title}
						</Text>
					</Pressable>
				)}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safe: {
		flex: 1,
		backgroundColor: '#F5F7FB',
	},
	headerRow: {
		paddingHorizontal: 16,
		paddingTop: 8,
		paddingBottom: 4,
		flexDirection: 'row',
		justifyContent: 'flex-start',
	},
	backButton: {
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 12,
		// iOS shadow
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 8,
		shadowOffset: { width: 0, height: 4 },
		// Android shadow
		elevation: 2,
	},
	backText: {
		fontSize: 16,
		color: '#111',
		fontWeight: '600',
	},
	listContent: {
        //padding: 5,
        //alignContent: 'center',
        // justifyContent: 'center',
		paddingHorizontal: 16,
		paddingVertical: 125,
		gap: 75,
	},
	columns: {
		gap: 100,
		justifyContent: 'center', // centra las tarjetas en cada fila
	},
	card: {
		// En lugar de ocupar todo el espacio, fijamos un ancho para que sean más angostas
		width: '30%',
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		padding: 45,
		// iOS shadow
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 6 },
		// Android shadow
		elevation: 3,
	},
	cardImage: {
		width: '100%',
		height: 200, // altura fija para mantener consistencia
		borderRadius: 12,
		resizeMode: 'contain',
		backgroundColor: '#fff',
	},
	cardTitle: {
		marginTop: 6,
		fontSize: 14,
		fontWeight: '600',
		color: '#111',
		textAlign: 'center',
	},
});

// Nota: este archivo define la UI del menú de juegos. La navegación
// se habilita registrando la ruta 'GameMenu' en el Stack Navigator
// y añadiendo una opción en Home para abrirla.

