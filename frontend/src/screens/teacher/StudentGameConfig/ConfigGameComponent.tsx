import { JSX } from "react";
import { View, Text, StyleSheet, TextInput, Switch } from "react-native";



export const CONFIG_COMPONENTS_JSX: { 
    [key: string]: { label: string; render: (props: any) => JSX.Element };
} = {
  'min_value': {
    label: 'Valor Mínimo',
    render: ({ gameId, info, handleChange }) => (
      <View style={styles.row}>
        <Text style={styles.label}>Mínimo</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          onChangeText={(text) => handleChange(gameId, 'min_value', text)}
          value={String(info.settings.min_value ?? '')}
          accessibilityLabel="Valor Mínimo"
          testID="min_value-input"
        />
      </View>
    ),
  },
  'max_value': {
    label: 'Valor Máximo',
    render: ({ gameId, info, handleChange }) => (
      <View style={styles.row}>
        <Text style={styles.label}>Máximo</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          onChangeText={(text) => handleChange(gameId, 'max_value', text)}
          value={String(info.settings.max_value ?? '')}
          accessibilityLabel="Valor Máximo"
          testID="max_value-input"
        />
      </View>
    ),
  },
  'num_elements': {
    label: 'Elementos',
    render: ({ gameId, info, handleChange }) => (
      <View style={styles.row}>
        <Text style={styles.label}>Elementos</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          onChangeText={(text) => handleChange(gameId, 'num_elements', text)}
          value={String(info.settings.num_elements ?? '')}
          accessibilityLabel="Elementos"
          testID="num_elements-input"
        />
      </View>
    ),
  },
  'num_containers': {
    label: 'Contenedores',
    render: ({ gameId, info, handleChange }) => (
      <View style={styles.row}>
        <Text style={styles.label}>Contenedores</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          onChangeText={(text) => handleChange(gameId, 'num_containers', text)}
          value={String(info.settings.num_containers ?? '')}
          accessibilityLabel="Contenedores"
          testID="num_containers-input"
        />
      </View>
    ),
  },
  'upward': {
    label: 'Ascendente',
    render: ({ gameId, info, handleToggle }) => (
      <View style={styles.row}>
        <Text style={styles.label}>Ascendente</Text>
        <Switch value={!!info.settings.upward} onValueChange={() => handleToggle(gameId, 'upward')} testID="upward-switch" />
      </View>
    ),
  },
  'sum': {
    label: 'Usa suma',
    render: ({ gameId, info, handleToggle }) => (
      <View style={styles.row}>
        <Text style={styles.label}>Usa suma</Text>
        <Switch value={!!info.settings.sum} onValueChange={() => handleToggle(gameId, 'sum')} testID="sum-switch" />
      </View>
    ),
  },
};


const styles = StyleSheet.create({


  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: '#333' },
  
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    width: 80,
    textAlign: 'center',
  }
});