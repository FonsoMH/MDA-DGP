import * as React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export type StudentRowProps = {
  id: number;
  name: string;
  email: string;
  onConfigure: (id: number) => void;
  onAccessibility?: (id: number) => void; // futuro
  onStats?: (id: number) => void; // futuro
};

export default function StudentRow({ id, name, email, onConfigure, onAccessibility, onStats }: StudentRowProps) {
  return (
    <View style={styles.row} data-testid={`student-row-${id}`} >
      <View style={[styles.cell, { flex: 2 }]}>
        <Text style={styles.name}>{name}</Text>
      </View>
      <View style={[styles.cell, { flex: 2 }]}>
        <Text style={styles.email}>{email}</Text>
      </View>
      <View style={[styles.actionsWrapper]}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.configBtn]}
          onPress={() => onConfigure(id)}
          accessibilityRole="button"
          accessibilityLabel={`Configurar juegos de ${name}`}
          testID={'configure-student-button'}
        >
          <Text style={styles.actionIcon}>⚙️</Text>
          <Text style={styles.actionTextConfig}>Configurar Juegos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.accessBtn]}
          onPress={() => onAccessibility?.(id)}
          accessibilityRole="button"
          accessibilityLabel={`Accesibilidad de ${name}`}
        >
          <Text style={styles.actionIcon}>👁️</Text>
          <Text style={styles.actionTextAccess}>Accesibilidad</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.statsBtn]}
          onPress={() => onStats?.(id)}
          accessibilityRole="button"
          accessibilityLabel={`Estadísticas de ${name}`}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionTextStats}>Estadísticas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    minHeight: 53,
  },
  cell: { paddingHorizontal: 4 },
  name: { fontSize: 14, color: '#0A0A0A' },
  email: { fontSize: 14, color: '#717182' },
  actionsWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginLeft: 8,
    minHeight: 32,
  },
  configBtn: {
    backgroundColor: '#dbeafe', // azul muy claro
    borderWidth: 1,
    borderColor: '#93c5fd',
  },
  accessBtn: {
    backgroundColor: '#d1fae5', // verde claro
    borderWidth: 1,
    borderColor: '#6ee7b7',
  },
  statsBtn: {
    backgroundColor: '#ffedd5', // naranja claro
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  actionIcon: { fontSize: 14, marginRight: 4 },
  actionTextConfig: { fontSize: 12, fontWeight: '600', color: '#1e3a8a' },
  actionTextAccess: { fontSize: 12, fontWeight: '600', color: '#065f46' },
  actionTextStats: { fontSize: 12, fontWeight: '600', color: '#9a3412' },
});
