import { Pressable, Text, StyleSheet, View } from 'react-native';

interface StudentLoginCardProps {
    id: number;
    user: string;
    onPress: () => void;
}

/**
 * Función que genera un color HSL vibrante y único basado en el ID del estudiante.
 * Esto asegura que cada tarjeta tenga un color distintivo.
 */
function numberIdToVibrantColor(id: number): string {
    
    const hue = id * 137 % 360; 

    
    const saturation = 70 + (id * 53 % 20); 

    
    const lightness = 60 + (id * 97 % 10); 

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

const StudentLoginCard: React.FC<StudentLoginCardProps> = ({ id, user, onPress }) => {
    const handleSubmit = () => {
        onPress();
    };

    const vibrantColor = numberIdToVibrantColor(id);

    return (
        <Pressable 
            
            style={({ pressed }) => [
                styles.card, 
                { backgroundColor: vibrantColor },
                
                { opacity: pressed ? 0.8 : 1 } 
            ]} 
            onPress={handleSubmit}
        >
            <Text style={styles.userName}>{user}</Text>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    card: {
        width: 150, 
        height: 150, 
        borderRadius: 15, 
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        
        
        
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 }, 
        shadowOpacity: 0.25, 
        shadowRadius: 10, 
        
        
        elevation: 10, 
        

        
        borderWidth: 1, 
        borderColor: 'rgba(0, 0, 0, 0.1)', 
    },
    userName: {
        fontSize: 18,
        fontWeight: '900', 
        color: '#2C3E50', 
        textAlign: 'center',
    },
});

export default StudentLoginCard;
