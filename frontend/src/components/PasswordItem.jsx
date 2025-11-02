import * as React from 'react';
import { View, Text, StyleSheet , Image, Pressable} from 'react-native';

const styles = StyleSheet.create({
    card:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderWidth: 5,
        borderColor: '#ccc',
        borderRadius: 10,
        width: "14%",
        height: 125,
    },
    text:{
        fontSize: 16,
        color: '#333',
    },
    picture:{
        width: 75,
        height: 75,
    }
});

export default function PasswordItem({ icon, text , onPress}) {
    return (
        <Pressable style={styles.card} onPress={onPress}>
            <View style={{ alignItems: 'center' }}>
                <Image source={icon} alt={text} style={styles.picture} />
            </View>
            {
                text != "Unknown" && (<Text style={styles.text}>{text}</Text>)
            }
        </Pressable>
    );
}   