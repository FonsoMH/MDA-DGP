import { View , StyleSheet, Pressable , Image} from 'react-native';


type PasswordItemProps = {
    icon: any;
    text: string;
    onPress: () => void;
    height?: number; 
    width?: number; 
}

export default function PasswordItem({ icon, text , onPress, height = 130, width = 130}: PasswordItemProps) {

    const iconSize = height * 0.7;
    
    return (
        <Pressable 
            style={[
                styles.card, 
                { 
                    width: width, 
                    height: height
                }
            ]} 
            onPress={onPress}
        >
            <View style={styles.contentWrapper}>
                <Image 
                    source={icon} 
                    alt={text} 
                    style={{ width: iconSize, height: iconSize }}
                />
            </View>
           
        </Pressable>
    );
}   

const styles = StyleSheet.create({
    card:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 5,
        justifyContent: 'flex-start', 
        borderWidth: 1, 
        borderColor: '#ccc',
        borderRadius: 12, 
        backgroundColor: '#FFFFFF',

        
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    contentWrapper: {
        flex: 1, 
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    text:{
        fontSize: 14, 
        color: '#333',
        marginTop: 4, 
        textAlign: 'center',
        fontWeight: '500',
    },
});
