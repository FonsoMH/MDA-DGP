import React , { useEffect , useRef } from 'react';
import { Animated , Text , StyleSheet , Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

interface AlertProps {
    visible: boolean;
    message: string;
    success: boolean;
    duration?: number;
    color?: string;
    onHide?: () => void;
}

export default function Alert({ visible, message, success, duration = 3000, color, onHide }: AlertProps) {
    const translateY = useRef(new Animated.Value(height)).current;

    useEffect(() => {

        if (visible) {
            Animated.spring(translateY, {
                toValue: height - 150,
                useNativeDriver: true,
                bounciness: 15,
            }).start();

            const timer = setTimeout(() => {
                hideAlert();
            }, duration);

            return () => clearTimeout(timer);
        }

    }, [visible]);

    const hideAlert = () => {
        Animated.timing(translateY, {
            toValue: height,
            duration: 300,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished && onHide) {
                onHide();
            }
        });
    };

    if (!visible) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                { backgroundColor: color ? color : success ? '#4CAF50' : '#ef2b2bff', transform: [{ translateY }] },
            ]}
        >
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,           // Margen inferior
    alignSelf: 'center',  // Centrado horizontal
    backgroundColor: '#333',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,     // Ovalado
    elevation: 5,         // Sombra Android
    shadowColor: '#000',  // Sombra iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  text: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  }
});