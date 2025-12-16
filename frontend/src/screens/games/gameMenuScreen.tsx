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
import { useAccessibilitySettings } from '../../accessibilitySettings/hooks/useAccessibilitySettings';
import BackButton from '../../components/common/BackButton/BackButton';
import { GameStackParamList } from '../../navigation/GameNavigator';
import { RootStackParamList } from '../../types/navigation';
import { UserContext } from '../auth/contexts/UserContext';
import { getAllConfig } from '../../api/studentConfig';
import { useUser } from '../../hooks/useUser';

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
        image: require('../../../assets/icons/games_icons/icon_game1.png'),
    },
    {
        id: 'SequenceGame',
        title: 'Ordena la secuencia',
        image: require('../../../assets/icons/games_icons/icon_game2.png'),
    },
    {
        id: 'ContainerSort',
        title: 'Reparte el mismo número',
        image: require('../../../assets/icons/games_icons/icon_game3.png'),
    },
    {
        id: 'LeaveSame',
        title: 'Deja el mismo número',
        image: require('../../../assets/icons/games_icons/icon_game4.png'),
    },
];

export default function GameMenuScreen({ navigation }: Props) {
    
    const accessibilitySettings = useAccessibilitySettings();   
    const userContext = React.useContext(UserContext);
    const [canConfigure, setCanConfigure] = React.useState(false);

    React.useEffect(() => {
        const fetchPermission = async () => {
            if (userContext?.user?.role === 'student' && userContext?.user?.id) {
                try {
                    const data = await getAllConfig(userContext.user.id);
                    setCanConfigure(data.student_can_configure || false);
                } catch (err) {
                    console.error('Error fetching student permission:', err);
                }
            }
        };
        fetchPermission();
    }, [userContext?.user]);

    const handleConfigPress = () => {
        if (userContext?.user?.id) {
            navigation.navigate('Teacher', {
                screen: 'StudentGameConfig',
                params: { studentId: userContext.user.id, isStudentView: true }
            });
        }
    };
    const student = useUser().user;

    
    const styles = StyleSheet.create({
        safe: {
            flex: 1,
            backgroundColor: accessibilitySettings.backgroundColor,
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 30,
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
            // backgroundColor: '#FFFFFF',
            backgroundColor: accessibilitySettings.containerColor,
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
            fontSize: accessibilitySettings.fontSize,
            fontWeight: '600',
            color: '#111',
            textAlign: 'center',
        },
        configButton: {
            backgroundColor: '#2563eb',
            paddingVertical: 12,
            paddingHorizontal: 24,
            borderRadius: 999,
            marginTop: 16,
            alignItems: 'center',
        },
        configButtonText: {
            color: '#fff',
            fontSize: accessibilitySettings.fontSize,
            fontWeight: '700',
        },
    });

    return (
        <View style={styles.safe}>     
            <View style={{flexDirection: accessibilitySettings.iconPosition === 'derecha' ? 'row-reverse' : 'row', alignItems: 'center', width: '100%' }}>
                        
                <BackButton
                    width={215}
                    height={76}
                    testID="back-button"
                />
              
                {canConfigure && (
                    <Pressable
                        style={styles.configButton}
                        onPress={handleConfigPress}
                        testID="configure-games-button"
                    >
                        <Text style={styles.configButtonText}>Configurar mis juegos</Text>
                    </Pressable>
                )}
              
                <Pressable
                    onPress={() => navigation.navigate('Student', { screen: 'StudentStatistics', params: { student: student } })}
                    accessibilityRole="button"
                    accessibilityLabel="Ver estadísticas del estudiante"
                >
                    <Image
                        source={require('../../../assets/icons/stats.png')}
                        style={{ width: 76, height: 76 }}
                    />
                </Pressable>
            </View>
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
