import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';

import BackButton from '../../components/common/BackButton/BackButton';
import StateCard from '../../components/users/StateCard';
import FilterButtons, { FilterOption } from '../../components/users/FilterButtons';
import UserCard from '../../components/users/UserCard';
// Importamos la interfaz correcta
import { UserApiData, PaginatedUsersResponse } from '../../types/users';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { useUsers } from './hook/useUserList';
import { useUser } from '../../hooks/useUser';

type UserListProps = NativeStackScreenProps<any, 'UserList'>;

export default function UserListScreen({ navigation }: UserListProps) { 
  const {user} = useUser();
  
  // 'users' ya viene tipado como PaginatedUsersResponse desde el hook
  const { users, isLoading, refetch } = useUsers();

  // MANTENEMOS EL TIPO: El estado sigue siendo un PaginatedUsersResponse
  const [filteredUsers, setFilteredUsers] = useState<PaginatedUsersResponse>({ 
      items: [], 
      total_count: 0, 
      total_pages: 0, 
      current_page: 0 
  });
  
  const [filter, setFilter] = useState<FilterOption>('todos');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserApiData | null>(null);

  const handleOpenEditModal = (user: UserApiData) => {
    setSelectedUserForEdit(user);
    setIsEditModalVisible(true);
  };

  const handleNavigation = (screen: keyof AdminStackParamList) => {
    navigation.navigate('Admin', { screen: screen });
  }

  const roleMap: Record<FilterOption, string | null> = {
    todos: null,
    administradores: 'admin',
    tutores: 'teacher',
    estudiantes: 'student',
  };

  useEffect(() => {
    if (!users) return;

    const originalItems = users.items || [];
    let newItems = [];

    if (filter === 'todos') {
      newItems = originalItems;
    } else {
      const role = roleMap[filter];
      newItems = originalItems.filter(u => u.role === role);
    }

    setFilteredUsers({
        ...users,
        items: newItems
    });

  }, [filter, users]);


  
  const countByRole = (role: 'admin' | 'teacher' | 'student') => {
      const items = users?.items || [];
      return items.filter(u => u.role === role).length;
  }

  return (
    <View style={styles.container} >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Gestión de Usuarios</Text>
        <BackButton width={130} height={50} />
      </View>

      <View style={styles.statsRow}>
        <StateCard title="Administradores" count={countByRole('admin')} emoji="👨‍💼" color="purple" />
        <StateCard title="Tutores" count={countByRole('teacher')} emoji="👨‍🏫" color="blue" />
        <StateCard title="Estudiantes" count={countByRole('student')} emoji="👨‍🎓" color="green" />
      </View>

      <FilterButtons onFilterChange={(f) => setFilter(f)} />

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
        
        filteredUsers.items.map((u, index) => {
          
          const userApiData: UserApiData = {
              id: u.userId, 
              name: u.name,
              email: u.email,
              role: u.role,
              studentsCount: u.studentsCount,
              assignedStudents: u.assignedStudents,
              assignedTeacherId: u.assignedTeacherId,
          };

          return (
              <UserCard
                  key={u.userId|| index}
                  user={userApiData}
                  onEdit={handleOpenEditModal}
                  onUserDeleted={() => refetch()}
                  navigation={navigation}
                  adminId={user?.id || 0}
              />
          );
        })
      )}
      
      {showMenu && (
          <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => { handleNavigation('AdminCreate'); }}>
              <Text style={styles.menuText}>Crear Administrador</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { handleNavigation('TeacherCreate'); }}>
              <Text style={styles.menuText}>Crear Tutor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { handleNavigation('StudentCreate'); }} testID='create-student-button'>
              <Text style={styles.menuText}>Crear Estudiante</Text>
          </TouchableOpacity>
      </View>
      )}

      <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowMenu(!showMenu)}
          testID='creation-menu-button'
      >
          <Text style={styles.fabText}>{showMenu ? '✕' : '+'}</Text>
      </TouchableOpacity>
    </View>
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

  fab: {
      position: 'absolute',
      width: 60,
      height: 60,
      alignItems: 'center',
      justifyContent: 'center',
      right: 30,
      bottom: 50,
      backgroundColor: '#007AFF',
      borderRadius: 30,
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 4 },
  },
  fabText: {
      fontSize: 30,
      color: 'white',
      lineHeight: 30,
  },

  menuContainer: {
      position: 'absolute',
      right: 30,
      bottom: 100,
      backgroundColor: 'white',
      borderRadius: 8,
      padding: 10,
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.2,
  },
  menuItem: {
      paddingVertical: 8,
      paddingHorizontal: 15,
  },
  menuText: {
      fontSize: 16,
      color: '#333',
  },
});