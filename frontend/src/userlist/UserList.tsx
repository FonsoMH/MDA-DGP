import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';

import BackButton from '../components/common/BackButton/BackButton';
import StateCard from '../components/users/StateCard';
import FilterButtons, { FilterOption } from '../components/users/FilterButtons';
import UserCard, { User } from '../components/users/UserCard';

import { useUsers } from './hook/useUserList';  
import { UserFrontend } from '../types/users';

export default function UserListScreen() {
  const { users, isLoading } = useUsers();
  const [filteredUsers, setFilteredUsers] = useState<UserFrontend[]>([]);
  const [filter, setFilter] = useState<FilterOption>('todos');

  const roleMap: Record<FilterOption, string | null> = {
    todos: null,
    administradores: 'admin',
    tutores: 'teacher',
    estudiantes: 'student',
  };

  useEffect(() => {
    if (filter === 'todos') {
      setFilteredUsers(users);
    } else {
      const role = roleMap[filter];
      setFilteredUsers(users.filter(u => u.role === role));
    }
  }, [filter, users]);

  const countByRole = (role: 'admin' | 'teacher' | 'student') =>
    users.filter(u => u.role === role).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <BackButton width={130} height={50} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StateCard title="Administradores" count={countByRole('admin')} emoji="👨‍💼" color="purple" />
        <StateCard title="Tutores" count={countByRole('teacher')} emoji="👨‍🏫" color="blue" />
        <StateCard title="Estudiantes" count={countByRole('student')} emoji="👨‍🎓" color="green" />
      </View>

      {/* Filters */}
      <FilterButtons onFilterChange={(f) => setFilter(f)} />

      {/* UserList */}
      <View style={styles.listHeader}>
        <Text style={[styles.listHeaderText, { flex: 2 }]}>Nombre completo</Text>
        <Text style={[styles.listHeaderText, { flex: 2 }]}>Email</Text>
        <Text style={[styles.listHeaderText, { flex: 1 }]}>Rol</Text>
        <Text style={[styles.listHeaderText, { flex: 1 }]}>Estudiantes asignados</Text>
        <Text style={[styles.listHeaderText, { flex: 1 }]}></Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: 20 }} />
      ) : (
        filteredUsers.map(u => (
          <UserCard
            key={u.userId}
            user={{
              user_id: u.userId,
              name: u.name,
              email: u.email,
              role: u.role,
              studentsCount: u.studentsCount ?? 0,
              assignedStudents: u.assignedStudents ?? [],
            } as User}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA', padding: 30 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#101828' },
  statsRow: { flexDirection: 'row', marginBottom: 16, flexWrap: 'wrap' },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  listHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
});
