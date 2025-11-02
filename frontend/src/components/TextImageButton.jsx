import * as React from 'react';
import { View, Text, StyleSheet , Image, Pressable} from 'react-native';

const styles = StyleSheet.create({
    
    button:{
        display: 'flex',
        flexDirection: 'row',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#DDD',
        width: 150,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonImage:{
        width: 30,
        height: 30,
    },
    text:{
        fontSize: 16,
        fontWeight: 'bold',
        marginRight: 10,
    }
});

export default function TextImageButton({ icon, text , onPress}) {
    return (
        <Pressable style={styles.button} onPress={onPress}>
            <Text style={styles.text}>{text}</Text>
            <Image source={icon} alt={text} style={styles.buttonImage} />
        </Pressable>
    );
}