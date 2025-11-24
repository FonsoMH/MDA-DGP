import * as React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import BackButton from '../../components/common/BackButton/BackButton';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TeacherStackParamList } from '../../navigation/TeacherNavigator';
import { useTeacherStudents } from './hooks/useTeacherStudents';
import StudentRow from '../../components/users/StudentRow';
import { useUser } from '../../hooks/useUser';

export default function TeacherStudentListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const route = useRoute<RouteProp<TeacherStackParamList, 'TeacherStudentList'>>();
  const { user } = useUser();

  const teacherId = React.useMemo(() => {
    if (route?.params?.teacherId) return route.params.teacherId;
    if (user?.role === 'teacher') return user.id;
    return undefined;
  }, [route?.params?.teacherId, user]);

  const { students, loading, error, refetch } = useTeacherStudents(teacherId);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetch();
    });
    return unsubscribe;
  }, [navigation, refetch]);

  const onConfigure = (studentId: number) => {
    navigation.navigate('StudentGameConfig', { studentId });
  };

  // Placeholders sin funcionalidad todavía
  const onStats = (_id: number) => {
    navigation.navigate('StudentStatistics', { studentId: _id });
  };
  const onAccessibility = (studentId: number) => {
    navigation.navigate('AccessibilitySettingsConfig', { studentId });

  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.titleEmoji}>👩‍🎓</Text>
          <Text style={styles.title}>Mis estudiantes</Text>
        </View>
        <BackButton width={130} height={50} />
      </View>

      {loading && (
        <View style={styles.center}> 
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      {error && !loading && (
        <Text style={styles.error}>Error: {error}</Text>
      )}

      {!loading && students.length === 0 && (
        <Text style={styles.empty}>No hay estudiantes asignados.</Text>
      )}

      {!loading && students.length > 0 && (
        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.headerCell, { flex: 2 }]}>Nombre</Text>
            <Text style={[styles.headerCell, { flex: 2 }]}>Email</Text>
            <Text style={[styles.headerCell, { flex: 1, textAlign: 'center' }]}>Acciones</Text>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            {students.map((s) => (
              <StudentRow
                key={s.id}
                id={s.id}
                name={s.name}
                email={s.email}
                onConfigure={onConfigure}
                onAccessibility={onAccessibility}
                onStats={onStats}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 32,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 1100,
    backgroundColor: '#fff',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  titleEmoji: { fontSize: 20, marginRight: 10 },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
  },
  headerRow: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  error: { color: '#B91C1C', marginBottom: 12 },
  empty: { color: '#6B7280', marginTop: 12 },
});
