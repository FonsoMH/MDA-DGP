import React from 'react';
import { View, Text , StyleSheet } from 'react-native';
import BackButton from '../../components/common/BackButton/BackButton';
import { StudentStackParamList } from '../../navigation/StudentNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAccessibilitySettings } from '../../accessibilitySettings/hooks/useAccessibilitySettings';
import GameSelector from '../teacher/components/GameSelector';

type Props = NativeStackScreenProps<StudentStackParamList, 'StudentStatistics'>;

export default function StudentStatisticsScreen({route}: Props) {

    const {student} = route.params;
    const accessibilitySettings = useAccessibilitySettings();


    const styles = StyleSheet.create({

        container: {
            flex: 1,
            paddingHorizontal: 32,
            paddingTop: 32,
            alignSelf: 'center',
            width: '100%',
            maxWidth: 1100,
            backgroundColor: accessibilitySettings.backgroundColor,
        },

        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
        },

        titleContainer: {
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            maxWidth: '70%',
        },
        title: {
            fontSize: accessibilitySettings.fontSize + 10,
            fontWeight: 'bold',
            color: accessibilitySettings.foregroundColor,
        },
        subtitle: {
            fontSize: accessibilitySettings.fontSize,
            color: accessibilitySettings.foregroundColor,
            marginTop: 4,
        },
        generalContainer: {
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'center',
            width: '100%',
            padding: 20,
        },
        statsContainers: {
            marginTop: 20,
            width: '100%',
            flexDirection: 'row',
            justifyContent: 'space-around',
        },
        statCard: {
            backgroundColor: accessibilitySettings.containerColor,
            borderRadius: 10,
            padding: 20,
            alignItems: 'center',
            width: '40%',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 5 },
            elevation: 5,
        },
        statTitle: {
            fontSize: accessibilitySettings.fontSize,
            color: accessibilitySettings.foregroundColor,
            marginBottom: 10,
        },
    });

    const [selectedGameId, setSelectedGameId] = React.useState<number>(-1);




    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>
                        ¡Hola, {student.name}!
                    </Text>
                    <Text style={styles.subtitle}>
                        Estas son tus estadísticas
                    </Text>
                </View>
                <BackButton width={130} height={50} />
            </View>
            <View style={styles.generalContainer}>
                <GameSelector
                    selectedGameId={selectedGameId}
                    onGameChange={setSelectedGameId}
                    style={{ flexDirection: 'row', width: '100%'  }}
                />
                <View style={styles.statsContainers}>
                    <View style={styles.statCard}>
                        <Text style={styles.statTitle}>Extadísticas de hoy</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statTitle}>Estadísticas totales</Text>
                    </View>
                </View>

            </View>
        </View>
    );
}

