import { JSX } from "react";
import { View, Text, StyleSheet, TextInput, Switch } from "react-native";



export const CONFIG_COMPONENTS_JSX: { 
    [key: string]: { label: string; render: (props: any) => JSX.Element };
} = {
  'min_value': {
    label: 'Valor Mínimo',
    render: ({ slug, info, handleChange }) => (
      <View style={styles.row}>
        <Text style={styles.label}>Mínimo</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          onChangeText={(text) => handleChange(slug, 'min_value', text)}
          value={String(info.settings.min_value ?? '')}
          accessibilityLabel="Valor Mínimo"
        />
      </View>
    ),
  },
  'max_value': {
    label: 'Valor Máximo',
    render: ({ slug, info, handleChange }) => (
      <View style={styles.row}>
        <Text style={styles.label}>Máximo</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          onChangeText={(text) => handleChange(slug, 'max_value', text)}
          value={String(info.settings.max_value ?? '')}
          accessibilityLabel="Valor Mínimo"
        />
      </View>
    ),
  },
  'num_elements': {
    label: 'Elementos',
    render: ({ slug, info, handleChange }) => (
      <View style={styles.row}>
        <Text style={styles.label}>Elementos</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          onChangeText={(text) => handleChange(slug, 'num_elements', text)}
          value={String(info.settings.num_elements ?? '')}
          accessibilityLabel="Valor Mínimo"
        />
      </View>
    ),
  },
  'num_containers': {
    label: 'Contenedores',
    render: ({ slug, info, handleChange }) => (
      <View style={styles.row}>
        <Text style={styles.label}>Contenedores</Text>
        <TextInput 
          style={styles.input}
          keyboardType="numeric"
          onChangeText={(text) => handleChange(slug, 'num_containers', text)}
          value={String(info.settings.num_containers ?? '')}
          accessibilityLabel="Valor Mínimo"
        />
      </View>
    ),
  },
  'upward': {
    label: 'Ascendente',
    render: ({ slug, info, handleToggle }) => (
      <View style={styles.row}>
        <Text style={styles.label}>Ascendente</Text>
        <Switch value={!!info.settings.upward} onValueChange={() => handleToggle(slug, 'upward')} />
      </View>
    ),
  },
  'sum': {
    label: 'Usa suma',
    render: ({ slug, info, handleToggle }) => (
      <View style={styles.row}>
        <Text style={styles.label}>Usa suma</Text>
        <Switch value={!!info.settings.sum} onValueChange={() => handleToggle(slug, 'sum')} />
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