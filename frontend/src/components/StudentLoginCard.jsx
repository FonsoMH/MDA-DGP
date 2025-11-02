import * as React from 'react'
import { View ,Text , Button , StyleSheet, Pressable} from 'react-native';

const styles = StyleSheet.create({
    cardContainer:{
        margin: 10, 
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        width: 150,
        height: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
});

function numberIdToVibrantColor(id) {
    
    const hue = id * 137 % 360;

    const saturation = 70 + (id * 53 % 20);

    const lightness = 50 + (id * 97 % 20);

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export default function StudentLoginCard({ id, user, onPress }){
    const handleSubmit = () => {
        onPress();
    };

    return (
        <Pressable style={[styles.cardContainer, { backgroundColor: numberIdToVibrantColor(id) }]} onPress={handleSubmit}>
            <Text>{user}</Text>
        </Pressable>
    );
}
