import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';

import BackButton from '../../components/common/BackButton/BackButton';
import StateCard from '../../components/users/StateCard';
import FilterButtons, { FilterOption } from '../../components/users/FilterButtons';
import UserCard from '../../components/users/UserCard';
import { UserFrontend, UserApiData } from '../../types/users';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { useUsers } from './hook/useUserList';
import { set } from 'react-hook-form';
import { useUser } from '../../hooks/useUser';
import Alert from '../../components/FeedBack/Alert';

type UserListProps = NativeStackScreenProps<any, 'UserList'>;

export default function UserListScreen({ navigation }: UserListProps) { 
  const {user} = useUser();
  const { users, isLoading, refetch, error } = useUsers();
  const [filteredUsers, setFilteredUsers] = useState<UserFrontend[]>([]);
  const [filter, setFilter] = useState<FilterOption>('todos');

  const [showMenu, setShowMenu] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserApiData | null>(null);


  const [alert, setAlert] = useState({
      message: '',
      success: true
  });
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  
  useEffect(() => {
      if (error) {
        setAlert({
          message: error.message ? error.message : String(error),
          success: false
        });
        setIsAlertVisible(true);
      }
    }, [error]);

  const handleOpenEditModal = (user: UserApiData) => {
    setSelectedUserForEdit(user);
    setIsEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setSelectedUserForEdit(null);
    setIsEditModalVisible(false);
  };

  const handleSavedUser = () => {
    setIsEditModalVisible(false);
    setSelectedUserForEdit(null);
    // refresh user list
    refetch();
  };

  const handleNavigation = (screen: keyof AdminStackParamList) => {
    navigation.navigate('Admin', {
        screen: screen,
    });
  }

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
    <View style={styles.container} >
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
        filteredUsers.map((u, index) => {
          
          // if (index === 0) console.log("🔍 DATOS CRUDOS DEL PRIMER USUARIO:", JSON.stringify(u, null, 2));

          const userApiData: UserApiData = {
              id: u.userId || (u as any).id || (u as any).user_id,
              name: u.name,
              email: u.email,
              role: u.role,
              studentsCount: u.studentsCount,
              assignedStudents: u.assignedStudents,
              assignedTeacherId: u.assignedTeacherId,
          };

          return (
              <UserCard
                  key={u.userId || index}
                  user={userApiData}
                  onEdit={handleOpenEditModal}
                  onUserDeleted={() => {
                    refetch();
                  }}
                  navigation={navigation}
                  adminId={user.id}
              />
          );
        })
      )}
      

      {showMenu && (
          <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => { handleNavigation('AdminCreate'); }}>
              <Text style={styles.menuText}>Crear Administrador</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { handleNavigation('TeacherCreate');
                                                                     refetch();
           }}>
              <Text style={styles.menuText}>Crear Tutor</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => { handleNavigation('StudentCreate'); 
                                                                      refetch();
          }} testID='create-student-button'>
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

      {/* {selectedUserForEdit && (
          <EditUserForm
              user={selectedUserForEdit}
              visible={isEditModalVisible}
              teachers={[]}
              onClose={handleCloseEditModal}
              onSaved={handleSavedUser}
          />
      )} */}

      <Alert visible={isAlertVisible}
              message={alert.message}
              success={alert.success}
              duration={3000}
              onHide={() => setIsAlertVisible(false)}
      />
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