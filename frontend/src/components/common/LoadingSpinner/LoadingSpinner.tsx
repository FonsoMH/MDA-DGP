import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingSpinner = () => {
    return (
        <View style={styles.container}>
            <ActivityIndicator 
                size="large" 
                color="#101828" 
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F7F8FA', 
    },
});

export default LoadingSpinner;