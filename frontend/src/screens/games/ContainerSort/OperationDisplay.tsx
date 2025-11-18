import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Option } from '../../../types/games';

interface OperationDisplayProps {
  numbers: Option[];
  operationType: 'suma' | 'resta';
  containerColor: string;
}

const OperacionDisplay: React.FC<OperationDisplayProps> = ({ numbers, operationType, containerColor }) => {

  const calculateResult = (): number => {
    if (numbers.length === 0) {
      return 0;
    }

    if (operationType === 'suma') {
      return numbers.reduce((accumulator, currentValue) => accumulator + currentValue.value, 0);
    } 
    
    if (operationType === 'resta') {
      const initialValue = numbers[0].value;
      const remainingNumbers = numbers.slice(1);

      return remainingNumbers.reduce((accumulator, currentValue) => accumulator - currentValue.value, initialValue);
    }

    return 0; 
  };

  const result = calculateResult();

  const operationName = operationType === 'suma' ? 'Suma' : 'Resta';

  return (
    <View style={[styles.container, {backgroundColor: containerColor}]} >
      <Text style={styles.text}>{operationName}: </Text>
      <Text style={styles.text}>{result}</Text>
    </View>
  );
};

const styles = StyleSheet.create({ 
  container: {
    width: '40%',
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    
    elevation: 4, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    fontSize: 18,
    fontWeight: '400', 
    color: '#fffff',
    marginRight: 4, 
  }
});

export default OperacionDisplay;