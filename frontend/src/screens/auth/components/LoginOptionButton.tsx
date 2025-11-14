import { View, Text, Pressable, StyleSheet } from 'react-native';

interface LoginOptionButtonProps {
    onPress: () => void;
    icon: string;
    label: string;
    testID?: string;
}


export default function LoginOptionButton({ onPress, icon, label, testID }: LoginOptionButtonProps) {
    const handleSubmit = () => {
        onPress();
    };

    return (
        <Pressable onPress={handleSubmit} testID={testID}>
            <View style={styles.optionContainer}>
                <Text style={{ fontSize: 144 }}>{icon}</Text>
                <Text style={{ fontSize: 24 }}>{label}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    optionContainer: {
        margin: 10, 
        borderWidth: 5,
        borderColor: '#ccc',
        borderRadius: 10,
        width: 350,
        height: 350,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
