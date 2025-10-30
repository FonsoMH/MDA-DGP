import { View, Text, Button, ImageBackground, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { FeedBackHook } from "./FeedBackHook";
import { useNavigation } from "@react-navigation/native";
import React from "react";


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
                                style={[styles.button, styles.homeButton]}
                                accessibilityRole="button"
                                accessibilityLabel="Volver al inicio"
                                activeOpacity={0.7}
                                onPress={() => navigation.goBack()}
                            >
                                <Image
                                    source={require("../../../assets/casa.png")} // ruta de tu imagen
                                    style={styles.buttonIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.buttonText}> Inicio</Text>
                                
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.playAgainButton]}
                                accessibilityRole="button"
                                accessibilityLabel="Volver a jugar"
                                activeOpacity={0.7}
                                onPress={handlePress}
                            >
                                <Image
                                    source={require("../../../assets/de_nuevo.png")} // ruta de tu imagen
                                    style={styles.buttonIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.buttonText}> Volver a Jugar</Text>
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
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        backgroundColor: "rgba(0,0,0,0.5)", // fondo semitransparente
    },
    card: {
        backgroundColor: "white",
        borderRadius: 20,
        padding: 30,
        width: "85%", // más grande que antes
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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
        marginTop: 20,
    },

    button: {
        flex: 1,
        alignItems: "center", // centra contenido horizontalmente
        justifyContent: "center",
        paddingVertical: 18,
        marginHorizontal: 8,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },

    buttonIcon: {
        width: 200,
        height: 200,
    },
    homeButton: {
        backgroundColor: "#1E3A8A", // azul oscuro para contraste
    },

    playAgainButton: {
        backgroundColor: "#059669", // verde brillante
    },

    buttonText: {
        color: "white",
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
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