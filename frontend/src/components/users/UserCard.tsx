import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import axios from 'axios';

export type UserRole = "admin" | "teacher" | "student";

export interface User {
  user_id?: number;
  name: string;
  email: string;
  role: UserRole;
  studentsCount?: number;
  assignedStudents?: string[];
}

const BASE_URL = 'http://localhost:5000';

interface UserCardProps {
  user: User;
  onUserDeleted?: () => void;
}

const roleColors = {
  admin: { bg: '#F3E8FF', text: '#6E11B0' },
  teacher: { bg: '#DBEAFE', text: '#193CB8' },
  student: { bg: '#DCFCE7', text: '#016630' },
};

export default function UserCard({ user, onUserDeleted }: UserCardProps) {
  const [expanded, setExpanded] = useState(false);

  const roleColor = roleColors[user.role];
  const showStudentCount = user.role === 'teacher' && user.studentsCount !== undefined;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleDelete = () => {

    const askConfirm = (): Promise<boolean> => {
      if (typeof window !== 'undefined' && typeof window.confirm === 'function') {
        // Web fallback
        return Promise.resolve(window.confirm('¿Seguro que desea eliminar este usuario?'));
      }

      return new Promise((resolve) => {
        Alert.alert(
          'Confirmar eliminación',
          '¿Seguro que desea eliminar este usuario?',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
            { text: 'Sí, seguro', style: 'destructive', onPress: () => resolve(true) },
          ],
        );
      });
    };

    (async () => {
      try {
        console.log('UserCard: delete clicked for user', user.user_id);
        const confirmed = await askConfirm();
        if (!confirmed) {
          console.log('UserCard: delete cancelled');
          return;
        }

        if (!user.user_id) {
          console.error('UserCard: missing user_id, cannot delete');
          Alert.alert('Error', 'ID de usuario no disponible.');
          return;
        }

        const resp = await axios.delete(`${BASE_URL}/users/${user.user_id}`);
        console.log('UserCard: delete response', resp?.status, resp?.data);
        Alert.alert('Éxito', 'El usuario ha sido eliminado correctamente');
        if (onUserDeleted) onUserDeleted();
      } catch (error: any) {
        console.error('UserCard: delete error', error);
        // If backend returned a helpful message, show it
        const serverMessage = error?.response?.data?.error || error?.response?.data?.message;
        if (serverMessage) {
          Alert.alert('Error', String(serverMessage));
        } else {
          Alert.alert('Error', 'No se pudo eliminar el usuario.');
        }
      }
    })();
  };

  return (
    <View>
      {/* Main Card */}
      <View style={styles.card}>
        {/* Name */}
        <View style={[styles.cell, { flex: 2, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.name}>{user.name}</Text>
        </View>

        {/* Email */}
        <View style={[styles.cell, { flex: 2, justifyContent: 'center', alignItems: 'center' }]}>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Role */}
        <View style={[styles.cell, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={[styles.roleBadge, { backgroundColor: roleColor.bg }]}>
            <Text style={[styles.roleText, { color: roleColor.text }]}>{user.role}</Text>
          </View>
        </View>

        {/* Assigned Students */}
        <View style={[styles.cell, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
          {showStudentCount ? (
            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity style={styles.studentsButton} onPress={toggleExpand}>
                <Text style={styles.studentsText}>
                  {user.studentsCount} student{user.studentsCount !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {/* Dropdown */}
              {expanded && (
                <View style={[styles.expandedDropdown, { alignItems: 'center' }]}>
                  {user.assignedStudents?.map((student, index) => (
                    <Text key={index} style={styles.assignedStudent}>
                      • {student}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.noStudents}>-</Text>
          )}
        </View>

        {/* Buttons */}
        <View style={[styles.cell, { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    minHeight: 53,
  },
  cell: {
    paddingHorizontal: 4,
  },
  name: { fontSize: 14, color: '#0A0A0A' },
  email: { fontSize: 14, color: '#717182' },
  roleBadge: { paddingVertical: 3, paddingHorizontal: 6, borderRadius: 8, alignItems: 'center' },
  roleText: { fontSize: 12 },
  studentsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  studentsText: { fontSize: 12, color: '#0A0A0A' },
  chevron: { fontSize: 12, marginLeft: 4 },
  noStudents: { fontSize: 14, color: '#717182' },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginRight: 6,
  },
  editText: { fontSize: 14, color: '#0A0A0A' },
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
  },
  deleteText: { fontSize: 14, color: '#F87171' },

  expandedDropdown: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#F7F8FA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'flex-start',
  },
  assignedStudent: { fontSize: 12, color: '#0A0A0A', marginBottom: 2 },
});
