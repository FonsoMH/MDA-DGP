import React from 'react';
import { View, Text , StyleSheet } from 'react-native';
import BackButton from '../../components/common/BackButton/BackButton';
import { StudentStackParamList } from '../../navigation/StudentNavigator';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAccessibilitySettings } from '../../accessibilitySettings/hooks/useAccessibilitySettings';
import GameSelector from '../teacher/components/GameSelector';
import StatisticBar from './components/StatisticBar';
import { icons } from '../../types/studentStatsIcons';
import { useStudentStatistics } from './hooks/useStudentStatistics';

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
        statsBarsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '100%',
            alignItems: 'flex-end',
        },  
    });

    const [selectedGameId, setSelectedGameId] = React.useState<number>(-1);

    const { todayStats, allStats, isLoading, error } = useStudentStatistics(student.id, selectedGameId);

    const maxIconsToday = todayStats ? Math.max(todayStats.successfulPlays, todayStats.failedPlays, todayStats.abandonPlays, 20) : 1;
    const maxIconsAll = allStats ? Math.max(allStats.successfulPlays, allStats.failedPlays, allStats.abandonPlays, 20) : 1;

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
                        <View style={styles.statsBarsContainer}>
                            <StatisticBar
                                width={50}
                                height={250}
                                accessibilitySettings={accessibilitySettings}
                                icon={icons['Success']}
                                label="Aciertos"
                                value={todayStats ? todayStats.successfulPlays : 0}
                                maxValue={maxIconsToday}
                            />
                            <StatisticBar
                                width={50}
                                height={250}
                                accessibilitySettings={accessibilitySettings}
                                icon={icons['Fail']}
                                label="Errores"
                                value={todayStats ? todayStats.failedPlays : 0}
                                maxValue={maxIconsToday}
                            />
                            <StatisticBar
                                width={50}
                                height={250}
                                accessibilitySettings={accessibilitySettings}
                                icon={icons['Abandon']}
                                label="Omisiones"
                                value={todayStats ? todayStats.abandonPlays : 0}
                                maxValue={maxIconsToday}
                            />
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statTitle}>Estadísticas totales</Text><View style={styles.statsBarsContainer}>
                            <StatisticBar
                                width={50}
                                height={250}
                                accessibilitySettings={accessibilitySettings}
                                icon={icons['Success']}
                                label="Aciertos"
                                value={allStats ? allStats.successfulPlays : 0}
                                maxValue={maxIconsAll}
                            />
                            <StatisticBar
                                width={50}
                                height={250}
                                accessibilitySettings={accessibilitySettings}
                                icon={icons['Fail']}
                                label="Errores"
                                value={allStats ? allStats.failedPlays : 0}
                                maxValue={maxIconsAll}
                            />
                            <StatisticBar
                                width={50}
                                height={250}
                                accessibilitySettings={accessibilitySettings}
                                icon={icons['Abandon']}
                                label="Omisiones"
                                value={allStats ? allStats.abandonPlays : 0}
                                maxValue={maxIconsAll}
                            />
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
}

