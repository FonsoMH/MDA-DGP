import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';

import BackButton from '../components/common/BackButton/BackButton';
import StateCard from '../components/users/StateCard';
import FilterButtons, { FilterOption } from '../components/users/FilterButtons';
import UserCard, { User } from '../components/users/UserCard';


//const BASE_URL = Constants.expoConfig?.extra?.REACT_APP_API_BASE_URL;
//const API_TIMEOUT = Constants.expoConfig?.extra?.API_TIMEOUT;

const BASE_URL = 'http://localhost:5000';
const API_TIMEOUT = 3000;

export default function UserListScreen() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterOption>('todos');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get<User[]>(`${BASE_URL}/users`, {
        timeout: API_TIMEOUT,
      });
      setAllUsers(response.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const roleMap: Record<FilterOption, string | null> = {
    todos: null,
    administradores: 'admin',
    tutores: 'teacher',
    estudiantes: 'student',
  };

  useEffect(() => {
    if (filter === 'todos') {
      setFilteredUsers(allUsers);
    } else {
      const role = roleMap[filter];
      setFilteredUsers(allUsers.filter(u => u.role === role));
    }
  }, [filter, allUsers]);


  useEffect(() => {
    fetchUsers();
  }, []);

  const countByRole = (role: 'admin' | 'teacher' | 'student') =>
    allUsers.filter(u => u.role === role).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <BackButton width={100} height={40} />
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

      {loading ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: 20 }} />
      ) : (
        filteredUsers.map(u => <UserCard key={u.user_id} user={u} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FA', padding: 16 },
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
