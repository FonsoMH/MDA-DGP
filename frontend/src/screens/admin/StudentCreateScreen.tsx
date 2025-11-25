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
import { AdminStackParamList } from '../../navigation/AdminNavigator';
import { useTeacherPagination } from './hook/useTeacherPagination';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { CredentialsData, credentialsSchema } from '../../types/validationSchemas';
import BasicCredentialsForm from './components/BasicCredentialsForm';
import { useCreateStudent } from './hook/useCreateStudent';
import { usePictogramPassword } from '../../utils/usePictogramPassword';
import PasswordItem from '../auth/components/PasswordItem';
import TextImageButton from '../auth/components/TextImageButton';

import trashCanIcon from '../../../assets/trash_can.png';
import { EditUserHook } from '../../components/users/hook/EditUserHook';


type Props = NativeStackScreenProps<AdminStackParamList, 'StudentCreate'>;

export default function StudentCreateScreen({ navigation, route }: Props) {

  const studentToEdit = route.params?.student; 

  const [selectedTutorId, setSelectedTutorId] = React.useState<number | null>(route.params?.student?.assignedTeacherId ?? null);

  const { 
      password: passwordIcons, 
      addPictogram: togglePasswordIcon,
      clearPassword,
      getPasswordSequence,
      isPasswordComplete,
      maxPasswordLength,
      availableIcons
  } = usePictogramPassword(); 

  const requiredPassword :boolean = (studentToEdit == null);

  const { 
        control,
        handleSubmit,
        formState: { errors, isSubmitting: isFormValidating }
    } = useForm({
        resolver: yupResolver(credentialsSchema),
        context: { isEdit: studentToEdit != null },
        defaultValues: { 
            name: studentToEdit?.name || '', 
            email: studentToEdit?.email || '', 
            password: '1234567', 
        },
        mode: 'onBlur',
    });


  const { 
        teachers,
        isLoading: teachersLoading,
    } = useTeacherPagination();

  const { isSubmitting: isApiSubmitting, onSubmitFrom } = useCreateStudent();

  const isTotalSubmitting = isFormValidating || isApiSubmitting; 

  const { isSaving , saveUser } = EditUserHook();
    
  const onSubmitRHF = (data: CredentialsData) => {
      const pictogramPassword = getPasswordSequence();

      const payload = {
          name: data.name,
          email: data.email,
          password: pictogramPassword, 
          assigned_teacher: selectedTutorId!,
      };

      studentToEdit ? saveUser(studentToEdit, payload) : onSubmitFrom(payload); 

      navigation.goBack();
  };

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title]}>{ requiredPassword ? 'Crear Estudiante' : 'Editar Estudiante'}</Text>
        <BasicCredentialsForm
            control={control}
            userRole='student'
            nameError={errors.name?.message}
            emailError={errors.email?.message}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contraseña con pictogramas y avatar</Text>
          <Text style={styles.help}>Elige **{maxPasswordLength}** pictogramas para la contraseña del estudiante</Text>

          <View style={styles.pictogramsRow}>
            {
              availableIcons.map((item, index) => (
                  <PasswordItem 
                      key={index} 
                      icon={item.icon} 
                      text={item.name} 
                      onPress={() => togglePasswordIcon(item)}
                      testID={`pictogram-${item.name}`}
                      height={50}
                      width={50}
                  />
              ))
            }
          </View>


          <Text style={[styles.help, { marginTop: 8 }]}>La contraseña final se muestra aquí:</Text>
          <View style={styles.passwordRow}>
            {
              passwordIcons.map((item, index) => (
              <PasswordItem 
                  key={index} 
                  icon={item.icon} 
                  text={item.name} 
                  onPress={() => {}}
                  height={50}
                  width={50}
              />
              ))
            }
          </View>
          <TextImageButton 
              icon={trashCanIcon} 
              onPress={clearPassword}
              label="Limpiar" 
          />
          {
            (!isPasswordComplete && requiredPassword) && (
                <Text style={[styles.help, { color: '#d9534f', fontWeight: 'bold' }]}>
                    ⚠️ Debes seleccionar {maxPasswordLength} pictogramas.
                </Text>
            )
          }
        </View>

        <View style={styles.section}>
          <View style={styles.tutorHeaderRow}>
            <Text style={styles.sectionTitle}>Asignar Tutor</Text>
          </View>
          <Text style={styles.help}>Selecciona el tutor que será asignado a este estudiante</Text>

          <View style={{ gap: 10, marginTop: 8 }}>
            {teachersLoading && <ActivityIndicator style={{ marginVertical: 10 }} />}
            
            {!teachersLoading && teachers.length === 0 && (
              <Text style={styles.help}>No hay tutores disponibles.</Text>
            )}
            {!teachersLoading && teachers.map((t) => {
              const active = selectedTutorId === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setSelectedTutorId(active ? null : t.id)}
                  style={[styles.tutorItem, active && styles.tutorItemActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Seleccionar tutor ${t.name}`}
                  testID={`tutor-card-${t.id}`}
                >
                  <View style={[styles.tutorCheck, active && styles.tutorCheckActive]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tutorName}>{t.name}</Text>
                    <Text style={styles.tutorEmail}>{t.email}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={[styles.btn, styles.btnSecondary]} onPress={() => navigation.goBack()}>
            <Text style={[styles.btnText, styles.btnTextSecondary]}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnPrimary, ((!isPasswordComplete && requiredPassword) || isTotalSubmitting) && { opacity: 0.7 }]}
            onPress={handleSubmit(onSubmitRHF)}
            disabled={(!isPasswordComplete && requiredPassword) || isTotalSubmitting}
            testID='submit-create-student'
          >
            <Text style={styles.btnText}>{ requiredPassword ? 'Crear Estudiante' : 'Editar Estudiante'}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FB' },
  content: {
    padding: 16,
    gap: 16,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20
  },
  title: {
    fontWeight: '700',
    color: '#14213d',
    fontSize: 22,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    gap: 8,
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
  pictogramsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  picButton: {
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    width: 52,
    height: 52,
  },
  picButtonActive: {
    borderColor: '#4f46e5',
    backgroundColor: '#EEF2FF',
  },
  picText: { fontSize: 22 },
  picImage: {
    resizeMode: 'contain',
    width: 32,
    height: 32,
  },
  passwordRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  previewSlot: {
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E8EB',
    width: 64,
    height: 64,
  },
  previewText: { fontSize: 20 },
  previewImage: {
    resizeMode: 'contain',
    width: 40,
    height: 40,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
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
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E8EB',
  },
  avatarText: { fontSize: 16, fontWeight: '700' },
  tutorHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tutorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tutorItemActive: { borderColor: '#4f46e5', backgroundColor: '#EEF2FF' },
  tutorCheck: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#c7c9cf',
    backgroundColor: 'transparent',
  },
  tutorCheckActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  tutorName: { fontWeight: '700', color: '#111' },
  tutorEmail: { color: '#666', fontSize: 12 },
});