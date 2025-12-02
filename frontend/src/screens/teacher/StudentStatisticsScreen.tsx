import * as React from 'react';
import { StyleSheet, Animated, TouchableOpacity, Pressable } from 'react-native';
import { View , Text } from 'react-native';
import { TeacherStackParamList } from '../../navigation/TeacherNavigator';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useStatistics } from './hooks/useStatistics';
import BackButton from '../../components/common/BackButton/BackButton';
import DateSelector from './components/DateSelector';
import GameSelector from './components/GameSelector';
import { PieChart, pieDataItem, RadarChart } from 'react-native-gifted-charts';
import Svg, { G } from 'react-native-svg';
import { useState } from 'react';
import StatsPieChart from './components/StatsPieChart';
import StatsLineChart from './components/StatsLineChart';

const ALL_GAMES_ID = -1;

type Props = NativeStackScreenProps<TeacherStackParamList, 'StudentStatistics'>;

export default function StudentStatisticsScreen({route}: Props) {
    
    const { studentId } = route.params;

    const [selectedGameId, setSelectedGameId] = React.useState<number>(1);
    const [initialDate, setInitialDate] = React.useState<Date | null>(null);
    const [finalDate, setFinalDate] = React.useState<Date | null>(null);

    const {
        data : statistics,
        isLoading,
        error
    } = useStatistics(studentId, selectedGameId, initialDate, finalDate);

    
    const [isOpen, setIsOpen] = React.useState(false);
    const slideAnim = React.useRef(new Animated.Value(-300)).current;

    const toggleFilters = () => {
        setIsOpen(!isOpen);
        Animated.timing(slideAnim, {
            toValue: isOpen ? -300 : 0,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const pieData = statistics ? [
        { label: 'Éxitos', value: statistics.successfulPlays, color: '#4CAF51' },
        { label: 'Fallos', value: statistics.totalPlays - statistics.successfulPlays, color: '#F44336' },
        { label: 'Abandonos', value: statistics.abandonPlays, color: '#FF9800' },
    ] : [
        { label: 'No hay datos', value: null, color: '#CCCCCC' },
    ];

    const timeData = statistics ? statistics.times.map((time, index) => ({
        value: time.averageTime,
        label: time.dates.split('-')[1] + '-' + time.dates.split('-')[2],
        date: time.dates,
    })) : [];

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold'}}>
                        Estadísticas del estudiante {studentId}
                    </Text>
                    <Text style={{ fontSize: 16, marginTop: 10}}>
                        Aquí se muestran las estadísticas según los filtros aplicados.
                    </Text>
                </View>
                <BackButton width={130} height={50} />
            </View>

            <View style={styles.generalContainer}>
                    <TouchableOpacity style={styles.filterButton} onPress={toggleFilters}>
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                            Filtros
                        </Text>
                    </TouchableOpacity>
                <View style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <StatsPieChart data={pieData} />

                    <StatsLineChart data={timeData} />
                </View>

                <Animated.View
                    style={[
                        styles.filterPanel,
                        { transform: [{ translateX: slideAnim }] }
                    ]}
                >
                    <Text style={styles.filterTitle}>Fecha</Text>
                    <DateSelector 
                        initialDate={initialDate} 
                        finalDate={finalDate}
                        onInitialDateChange={setInitialDate}
                        onFinalDateChange={setFinalDate}
                    />

                    <Text style={styles.filterTitle}>Juego</Text>
                    <GameSelector 
                        selectedGameId={selectedGameId}
                        onGameChange={setSelectedGameId}
                    />
                    <Pressable
                        onPress={toggleFilters}
                        style={styles.closeFilterButton}
                    >
                        <Text style={{ color: '#b83232', fontWeight: 'bold' }}>X</Text>
                    </Pressable>
                </Animated.View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 32,
        alignSelf: 'center',
        width: '100%',
        maxWidth: 1100,
        backgroundColor: '#fff',
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

    generalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#ebebeb',
        borderRadius: 10,
        overflow: 'hidden',
        marginBottom: 20,
    },

    /* BOTÓN DE FILTROS */
    filterButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeFilterButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: '#fff',
        padding: 5,
        width: 30,
        height: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',

    },

    /* PANEL LATERAL */
    filterPanel: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: 200,
        height: '100%',
        backgroundColor: '#c9c9c9ff',
        padding: 20,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },

    filterTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e1e1eff',
        marginTop: 10,
    }

});
