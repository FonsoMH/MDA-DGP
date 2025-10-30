import { View, Text, Button, ImageBackground, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import { FeedBackHook } from "./FeedBackHook";
import { useNavigation } from "@react-navigation/native";

interface FeedBackProps {
    onNotify: (data: string) => void;
    visible: boolean
}

export default function FeedbackScreen({ onNotify, visible}: FeedBackProps) {

    const {feedback, loading} = FeedBackHook();

    const navigation = useNavigation();

    const canGoBack = navigation.canGoBack(); 

    const handlePress = () => {
        const dataParaElPadre = '¡Hola Papá, todo bien!';
        
        if (onNotify) { 
            onNotify(dataParaElPadre);
        }
    };

    if (!canGoBack) {
        return null; 
    }

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
        >
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Cargando...</Text>
                </View>

            ) : (
                <ImageBackground
                    source={{ uri: feedback?.url }}
                    style={styles.fullScreen}
                    resizeMode="cover" 
                >
                    <View style={styles.contentContainer}>
                        
                        <View style={styles.card}>
                            
                            <Text style={styles.messageText}>
                                {feedback?.texto || "¡Bien Jugado!"} 
                            </Text>

                            <View style={styles.buttonWrapper}>
                                <TouchableOpacity
                                    style={[styles.button, styles.playAgainButton]}
                                    onPress={() => navigation.goBack()}
                                >
                                    <Text style={styles.buttonText}>Inicio</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.button, styles.homeButton]}
                                    onPress={handlePress}
                                >
                                    <Text style={styles.buttonText}>Volver a Jugar</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                    
                </ImageBackground> 
            )}

        </Modal>    
      
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
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 16,  
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: "center",
        marginHorizontal: 6,
    },
    playAgainButton: {
        backgroundColor: "#2563EB",
    },
    homeButton: {
        backgroundColor: "#2563EB",
    },
    buttonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
    },

    buttonText_playAgain: {
        color: "white",
        fontWeight: "600",
        fontSize: 12,
        textAlign: 'center',
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});