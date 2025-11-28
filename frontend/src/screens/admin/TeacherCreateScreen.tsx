import * as React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCreateTeacher } from './hook/useCreateTeacher';
import { useStudentPagination } from './hook/useStudentpagination';
import BasicCredentialsForm from './components/BasicCredentialsForm';
import { useForm } from 'react-hook-form';
import { CredentialsData, credentialsSchema } from '../../types/validationSchemas';
import { yupResolver } from '@hookform/resolvers/yup';
import { EditUserHook } from '../../components/users/hook/EditUserHook';


type Props = NativeStackScreenProps<any, 'TeacherCreate'>;


export default function TeacherCreateScreen({ navigation, route }: Props) {

  const teacherToEdit = route.params?.teacher; 
  
  const [selectedIds, setSelectedIds] = React.useState<number[]>(route.params?.teacher?.assignedStudents ?? []);

  const { 
      control,
      handleSubmit,
      formState: { errors, isSubmitting: isFormValidating }
  } = useForm({
      resolver: yupResolver(credentialsSchema),
      context: { isEdit: teacherToEdit != null },
      defaultValues: { 
          name: teacherToEdit?.name || '', 
          email: teacherToEdit?.email || '', 
          password: '', 
      },
      mode: 'onBlur',
  });

  const { 
      students,
      isLoading: studentsLoading,
      currentPage,
      totalPages, 
      changePage,
      error 
  } = useStudentPagination();


  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const { isSubmitting: isApiSubmitting, onSubmitFrom } = useCreateTeacher();
  const { isSaving , saveUser } = EditUserHook();

  const isTotalSubmitting = isFormValidating || isApiSubmitting; 

  const onSubmitRHF = (data: CredentialsData) => {
      const payload = {
          name: data.name,
          email: data.email,
          password: data.password ?? '',
          assigned_students_ids: selectedIds,
      };

      teacherToEdit ? saveUser(teacherToEdit, payload) : onSubmitFrom(payload); 
      navigation.goBack();
  };

  const buttonLabel: string = teacherToEdit ? 'Editar Tutor' : 'Crear Tutor'

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Crear Nuevo Tutor</Text>

        <BasicCredentialsForm
            control={control}
            userRole='teacher'
            
            nameError={errors.name?.message}
            emailError={errors.email?.message }
            passwordError={errors.password?.message}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asignar Estudiantes</Text>
          <Text style={styles.help}>Selecciona los estudiantes que estarán a cargo del tutor</Text>

          {studentsLoading && <ActivityIndicator style={{ marginVertical: 10 }} />}

          {!studentsLoading &&
            students.map((s) => {
              const active = selectedIds.includes(s.id); 
              return (
                <Pressable
                  key={s.id}
                  onPress={() => toggleSelect(s.id)}
                  style={[styles.studentItem, active && styles.studentItemActive]}
                >
                  <View style={[styles.checkbox, active && styles.checkboxActive]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{s.name}</Text>
                    <Text style={styles.studentEmail}>{s.email}</Text>
                  </View>
                </Pressable>
              );
            })}

          <View style={styles.paginationRow}>
            <Pressable
              disabled={currentPage <= 1 || studentsLoading}
              style={[styles.pageBtn, (currentPage <= 1 || studentsLoading) && { opacity: 0.5 }]}
              onPress={() => changePage(currentPage - 1)}
            >
              <Text style={styles.pageBtnText}>Anterior</Text>
            </Pressable>
            <Text style={styles.pageInfo}>
              Página {currentPage.toString()} de {totalPages.toString()} 
            </Text>
            <Pressable
              disabled={currentPage >= totalPages || studentsLoading}
              style={[styles.pageBtn, (currentPage >= totalPages || studentsLoading) && { opacity: 0.5 }]}
              onPress={() => changePage(currentPage + 1)}
            >
              <Text style={styles.pageBtnText}>Siguiente</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => navigation.goBack()}>
            <Text style={[styles.btnText, styles.btnTextSecondary]}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnPrimary, isTotalSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmit(onSubmitRHF)}
            disabled={isTotalSubmitting}
            testID='submit-create-teacher'
          >
          <Text style={styles.btnText}>{isApiSubmitting ? 'Guardando...' : buttonLabel}</Text>    
          
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
    backgroundColor: '#F5F7FB',
    alignContent: 'center',
  },
  content: {
    padding: 16,
    gap: 16,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#14213d' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: { fontWeight: '700', color: '#111' },
  label: { color: '#333', marginTop: 4 },
  help: { color: '#666', fontSize: 12 },
  input: {
    backgroundColor: '#F4F5F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111',
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    padding: 10,
  },
  studentItemActive: {
    borderColor: '#4f46e5',
    backgroundColor: '#EEF2FF',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#c7c9cf',
  },
  checkboxActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  studentName: { fontWeight: '700', color: '#111' },
  studentEmail: { color: '#666', fontSize: 12 },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  pageBtn: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pageBtnText: { color: '#111', fontWeight: '600' },
  pageInfo: { color: '#333' },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  btn: {
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnSecondary: { backgroundColor: '#E5E7EB' },
  btnText: { color: '#fff', fontWeight: '700' },
  btnTextSecondary: { color: '#111' },
});
