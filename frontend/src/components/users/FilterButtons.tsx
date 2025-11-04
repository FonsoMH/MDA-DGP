import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type FilterOption = "todos" | "administradores" | "tutores" | "estudiantes";

interface FilterButtonsProps {
  onFilterChange?: (filter: FilterOption) => void;
}

export default function FilterButtons({ onFilterChange }: FilterButtonsProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('todos');

  const handleFilterClick = (filter: FilterOption) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  const filters: { id: FilterOption; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'administradores', label: '👨‍💼 Administradores' },
    { id: 'tutores', label: '👨‍🏫 Tutores' },
    { id: 'estudiantes', label: '👨‍🎓 Estudiantes' },
  ];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          onPress={() => handleFilterClick(filter.id)}
          style={[
            styles.button,
            activeFilter === filter.id && styles.activeButton,
            filter.id === 'todos' && { minWidth: 56 },
            filter.id === 'administradores' && { minWidth: 145 },
            filter.id === 'tutores' && { minWidth: 89 },
            filter.id === 'estudiantes' && { minWidth: 116 },
          ]}
        >
          <Text style={styles.buttonText}>{filter.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F3F3F5',
    borderRadius: 14,
    padding: 3,
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignSelf: 'flex-start', 
    gap: 4, 
  },
  button: {
    height: 29,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: 'transparent',
    flexShrink: 1, 
  },
  activeButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 14,
    color: '#0A0A0A',
  },
});
