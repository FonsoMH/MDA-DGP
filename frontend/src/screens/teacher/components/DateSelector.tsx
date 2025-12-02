import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';


const getMarkedDates = (initialDate: Date | null, finalDate: Date | null) => {
    
    if (!initialDate && !finalDate) return {};

    const start = initialDate && finalDate ? (initialDate < finalDate ? initialDate : finalDate) : initialDate;
    const end = initialDate && finalDate ? (initialDate < finalDate ? finalDate : initialDate) : finalDate;

    if (!start) return {};

    const markedDates: { [key: string]: any } = {};
    let currentDay = new Date(start);
    
    while (currentDay <= (end || start)) {
        const dateString = currentDay.toISOString().split('T')[0];
        const isStart = end ? dateString === start.toISOString().split('T')[0] : true;
        const isEnd = end ? dateString === end.toISOString().split('T')[0] : true;

        markedDates[dateString] = {
            selected: true,
            color: '#00adf5',
            textColor: 'white',
            ...(isStart && { startingDay: true }),
            ...(isEnd && { endingDay: true }),
            ...((!isStart && !isEnd) && { period: true }),
        };


        if (!end) break;
        
        currentDay.setDate(currentDay.getDate() + 1);
    }

    return markedDates;
};



export default function DateSelector({ 
    initialDate, 
    finalDate, 
    onInitialDateChange, 
    onFinalDateChange 
}: {
    initialDate: Date | null; 
    finalDate: Date | null; 
    onInitialDateChange: (date: Date | null) => void; 
    onFinalDateChange: (date: Date | null) => void
}) {
    
    const [isVisible, setIsVisible] = React.useState<boolean>(false);
    const [selectingInitialDate, setSelectingInitialDate] = React.useState<boolean>(true);
    const [temporalInitialDate, setTemporalInitialDate] = React.useState<Date | null>(initialDate);

    const markedDates = React.useMemo(() => getMarkedDates(temporalInitialDate, finalDate), [temporalInitialDate, finalDate]);
    
    const currentCalendarDate = initialDate 
        ? initialDate.toISOString().split('T')[0] 
        : finalDate 
            ? finalDate.toISOString().split('T')[0] 
            : new Date().toISOString().split('T')[0];
            
    const handleDayPress = (day: DateData) => {
        const selectedDate = new Date(day.timestamp);
        
        if (selectingInitialDate) {
            setTemporalInitialDate(selectedDate);
            onInitialDateChange(null);
            onFinalDateChange(null);
            setSelectingInitialDate(false);
        } else {
            if (temporalInitialDate && selectedDate < temporalInitialDate) {
                
                setTemporalInitialDate(selectedDate);
                onFinalDateChange(null);
                setSelectingInitialDate(false); 
            } else {
                onInitialDateChange(temporalInitialDate);
                onFinalDateChange(selectedDate);
                setIsVisible(false);
                setSelectingInitialDate(true);
            }
        }
    };

    const handleClearDates = () => {
        onInitialDateChange(null);
        onFinalDateChange(null);
        setSelectingInitialDate(true);
        setTemporalInitialDate(null);
    };

    const renderDateRangeText = () => {
    if (!initialDate && !finalDate) {
        return 'Seleccionar...';
    }

    if (initialDate && !finalDate) {
        return `${initialDate.toLocaleDateString('es-ES')} - Seleccionando…`;
    }

    return `${initialDate?.toLocaleDateString('es-ES')} - ${finalDate?.toLocaleDateString('es-ES')}`;
};



    return (
        <View style={styles.container}>
            {/* ESTE PRESSABLE SIEMPRE DEBE ESTAR VISIBLE PARA ABRIR EL MODAL */}
            <Pressable 
                onPress={() => setIsVisible(true)}
                style={styles.pressable}
            >
                {/* Aquí se muestra el texto que puede estar fallando */}
                <Text style={styles.text}>{ initialDate ? initialDate.toLocaleDateString('es-ES') : 'Seleccionar...' }</Text>
                {initialDate && <Text style={styles.text}> - </Text>}
                <Text style={styles.text}>{ finalDate ? finalDate.toLocaleDateString('es-ES') : '' }</Text>
            </Pressable>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isVisible}
                onRequestClose={() => setIsVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        
                        <Text style={styles.modalTitle}>
                            {selectingInitialDate ? 'Selecciona la fecha inicial' : 'Selecciona la fecha final'}
                        </Text>
                        
                        <Calendar 
                            markingType='period'
                            current={currentCalendarDate}
                            markedDates={markedDates}
                            onDayPress={handleDayPress}
                            theme={{
                                todayTextColor: '#00adf5',
                                selectedDayBackgroundColor: '#00adf5',
                                arrowColor: '#00adf5',
                            }}
                        /> 
                        
                        <View style={styles.buttonContainer}>
                            <Pressable 
                                style={[styles.button, styles.buttonClear]} 
                                onPress={handleClearDates}
                            >
                                <Text style={styles.textStyle}>Limpiar</Text>
                            </Pressable>

                            <Pressable
                                style={[styles.button, styles.buttonClose]}
                                onPress={() => {
                                    setIsVisible(false);
                                    setSelectingInitialDate(true);
                                }}
                            >
                                <Text style={styles.textStyle}>Cerrar</Text>
                            </Pressable>
                        </View>
                        
                    </View>
                </View>
            </Modal>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    pressable: {
        padding: 2,
        backgroundColor: '#ffffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
        color: '#333',
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
    },
    buttonClose: {
        backgroundColor: '#2196F3',
    },
    buttonClear: {
        backgroundColor: '#f44336',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});