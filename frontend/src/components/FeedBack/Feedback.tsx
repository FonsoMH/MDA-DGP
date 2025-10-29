import { View, Text, Button, ImageBackground, StyleSheet } from "react-native";
import { FeedBackHook } from "./FeedBackHook";

export default function FeedbackScreen() {

    const {feedback, loading} = FeedBackHook();

    if (loading){
        <View>
            <Text>Cargando feedback</Text>
        </View>
    }
    

    if (!feedback) {
        return <div>Cargando feedback...</div>;
    }

    return (
        <ImageBackground
            source={{ uri: feedback.url }}
            style={styles.fullScreen}
            resizeMode="cover" 
        >
            <View style={styles.contentContainer}>
                

                <View style={styles.card}>
                    

                    <Text style={styles.messageText}>
                        {feedback.texto || "¡Bien Jugado!"} 
                    </Text>
                    
                    <View style={styles.buttonWrapper}>
                        {/* TODO hacer jugar de nuevo */}
                        {/* <Button
                            onPress={handlePlayAgain}
                            title="Jugar de nuevo"
                            color="#2563EB" 
                        /> */}
                    </View>
                </View>
            </View>
        </ImageBackground>
    );

}

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1, 
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    card: {
        
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 16, 
        padding: 24, 
        marginHorizontal: 20, 
        alignItems: 'center',
        
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8, 
    },
    messageText: {
        
        fontSize: 24, 
        fontWeight: '700', 
        marginBottom: 20,
        color: '#1F2937', 
    },
    buttonWrapper: {
        
        marginTop: 16, 
        
    }
});