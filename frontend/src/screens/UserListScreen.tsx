import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import UserCard, { User, UserRole } from '../components/users/UserCard';
import Constants from 'expo-constants';

const BASE_URL = Constants.expoConfig?.extra?.REACT_APP_API_BASE_URL || 'http://localhost:5000';

type FilterType = 'Todos' | 'Administradores' | 'Tutores' | 'Estudiantes';

export default function UserListScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('Todos');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get<User[]>(`${BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    if (filter === 'Todos') return true;
    if (filter === 'Administradores') return user.role === 'Administrador';
    if (filter === 'Tutores') return user.role === 'Tutor';
    if (filter === 'Estudiantes') return user.role === 'Estudiante';
    return true;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gestión de Usuarios</Text>

      {/* Filters */}
      <View style={styles.filters}>
        {(['Todos', 'Administradores', 'Tutores', 'Estudiantes'] as FilterType[]).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.activeFilter]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* User List */}
      {loading ? (
        <Text style={styles.loading}>Cargando usuarios...</Text>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <UserCard user={item} />}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingTop: 50,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#101828',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  activeFilter: {
    backgroundColor: '#1E3A8A',
  },
  filterText: {
    color: '#333333',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  loading: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
});
