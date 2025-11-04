import { Text, StyleSheet , Image, Pressable, ImageSourcePropType} from 'react-native';

interface LoginOptionButtonProps {
    icon: ImageSourcePropType;        
    label: string;       
    onPress: () => void; 
}

export default function TextImageButton({ icon, label , onPress}: LoginOptionButtonProps) {
    return (
        <Pressable style={styles.button} onPress={onPress}>
            <Text style={styles.text}>{label}</Text>
            <Image source={icon} alt={label} style={styles.buttonImage} />
        </Pressable>
    );
}

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
