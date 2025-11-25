import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, Image } from 'react-native';
import { EditUserHook } from './hook/EditUserHook';
import { UserApiData, UpdateUserPayload } from '../../types/users';
import { useUsers } from '../../screens/admin/hook/useUserList';

import { usePictogramPassword } from '../../utils/usePictogramPassword';
import PasswordItem from '../../screens/auth/components/PasswordItem';
import trashCanIcon from '../../../assets/trash_can.png';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

interface EditUserFormProps {
  user: UserApiData,
  teachers: { user_id?: number; name: string }[],
  onClose: () => void,
  onSaved: () => void,
  visible: boolean,
}

export default function EditUserForm({ user, teachers, onClose, onSaved, visible }: EditUserFormProps) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [assignedTeacherId, setAssignedTeacherId] = useState<number | null>(
    // assigned_teacher_id may come as assignedStudents in this frontend model; we'll leave null unless provided elsewhere
    (user as any).assignedTeacherId ?? null
  );

  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const { isSaving, error, saveUser, clearError } = EditUserHook();
  const { users } = useUsers();

  const availableStudentsList = users.filter(u => u.role === 'student');
  const availableTeachersList = users.filter(u => u.role === 'teacher');

  const {
    password: pictogramList,
    addPictogram,
    clearPassword,
    getPasswordSequence,
    availableIcons,
    maxPasswordLength
  } = usePictogramPassword();

  /*
  useEffect(() => {
    if (user.role === 'student') {
      const sequence = getPasswordSequence();
      setPassword(sequence);
    }
  }, [pictogramList, user.role]);
  */

  useEffect(() => {
    setName(user.name || '');
    setEmail(user.email || '');
    setPassword('');
    setAssignedTeacherId((user as any).assignedTeacherId ?? null);

    clearPassword();

    if (user.role === 'teacher' && user.assignedStudents && availableStudentsList.length > 0) {
      const assignedNamesLower = user.assignedStudents.map(name => String(name).toLowerCase().trim());

      const currentIds = availableStudentsList
        .filter(s => {
            const studentName = (s.name || '').toLowerCase().trim();
            return assignedNamesLower.includes(studentName);
        })
        .map(s => s.userId || (s as any).id || (s as any).user_id);

      setSelectedStudentIds(currentIds);
    } else {
      setSelectedStudentIds([]);
    }
  }, [user, users]);

  const toggleStudent = (studentId: number) => {
    if (selectedStudentIds.includes(studentId)) {
      setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
    } else {
      setSelectedStudentIds(prev => [...prev, studentId]);
    }
  };

  const selectTeacher = (teacherId: number) => {
    if (assignedTeacherId === teacherId) {
      setAssignedTeacherId(null);
    } else {
      setAssignedTeacherId(teacherId);
    }
  };

  const handleSubmit = async () => {
    clearError();

    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Nombre y email son obligatorios');
      return;
    }

    if (user.role === 'student' && password && pictogramList.length < maxPasswordLength) {
      Alert.alert('Error', `La contraseña pictográfica debe tener ${maxPasswordLength} pictogramas.`);
      return;
    }

    const dataToUpdate: UpdateUserPayload = {
      name,
      email,
      assigned_teacher_id: assignedTeacherId,
    };
    
    // --- LÓGICA DE CONTRASEÑA ---
    if (user.role === 'student') {
        // Para Estudiantes: Solo actualizamos si ha tocado los pictogramas
        if (pictogramList.length > 0) {
            // Validación de longitud
            if (pictogramList.length < maxPasswordLength) {
                Alert.alert('Error', `La contraseña pictográfica debe tener ${maxPasswordLength} pictogramas.`);
                return;
            }
            // Obtenemos la secuencia ("API 1,API 2...") y la asignamos
            dataToUpdate.password = getPasswordSequence();
        }
        // Si pictogramList.length === 0, NO enviamos el campo password, 
        // así el backend mantiene la antigua.
    } else {
        // Para Admins/Teachers: Usamos el campo de texto normal
        if (password) {
            dataToUpdate.password = password;
        }
    }

    if (user.role === 'teacher') {
      (dataToUpdate as any).assigned_students_ids = selectedStudentIds;
    }

    const success = await saveUser(user, dataToUpdate);
    if (success) {
      Alert.alert('Éxito', 'Usuario actualizado correctamente');
      onSaved();
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView>
            <Text style={styles.title}>Editar usuario</Text>

            <Text style={styles.label}>Nombre</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

            {/*<Text style={styles.label}>Contraseña</Text>
            <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
            */}
            
            {user.role === 'student' ? (
              // === PICTOGRAM UI FOR STUDENTS ===
              <View style={{marginTop: 10}}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.pictogramContainer}>
                <Text style={styles.helperText}>
                  Selecciona {maxPasswordLength} pictogramas para cambiar la contraseña:
                </Text>
                
                {/* Current Selection Display */}
                <View style={styles.passwordDisplayBox}>
                  <View style={styles.passwordIconsRow}>
                  {pictogramList.length === 0 ? (
                    <Text style={{color: '#ccc', fontStyle: 'italic'}}>Nueva contraseña...</Text>
                  ) : (
                    pictogramList.map((item, index) => (
                    <PasswordItem 
                      key={index} 
                      icon={item.icon} 
                      text={""}
                      onPress={() => {}}
                      height={50} 
                      width={50}
                    />
                    ))
                  )}
                  </View>
                  {/* Clear Button */}
                  <TouchableOpacity style={styles.clearIconBtn} onPress={clearPassword}>
                  <Image source={trashCanIcon} style={{width: 20, height: 20}} resizeMode="contain"/>
                  </TouchableOpacity>
                </View>

                {/* Selection Grid */}
                <View style={styles.pictogramGrid}>
                  {availableIcons.map((item, index) => (
                  <View key={index} style={{margin: 4}}>
                    <PasswordItem 
                    icon={item.icon} 
                    text={item.name} 
                    onPress={() => addPictogram(item)}
                    height={60} 
                    width={80}
                    />
                  </View>
                  ))}
                </View>
                </View>
              </View>
            ) : (
              // === TEXT UI FOR ADMINS/TEACHERS ===
              <View>
                <Text style={styles.label}>Contraseña</Text>
                <TextInput 
                style={styles.input} 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
                placeholder="Dejar en blanco para mantener la actual" 
                />
              </View>
            )}

          {/* For students */}
          {user.role === 'student' && (
            <View style={{ marginTop: 12 }}>
                <Text style={[styles.label, { marginBottom: 8 }]}>Asignar Tutor (Solo uno)</Text>
                <View style={styles.studentListContainer}>
                  {availableTeachersList.length === 0 ? (
                    <Text style={styles.emptyText}>No hay tutores disponibles</Text>
                  ) : (
                    availableTeachersList.map((teacher) => {
                      // Normalizamos el ID por seguridad
                      const tId = teacher.userId || (teacher as any).id || (teacher as any).user_id;
                      const isSelected = assignedTeacherId === tId;
                              
                      return (
                        <TouchableOpacity 
                          key={tId} 
                          style={styles.studentItem} 
                          onPress={() => selectTeacher(tId)}
                        >
                          {/* Radio Button Visual (Redondo) */}
                          <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                            {isSelected && <View style={styles.radioInner} />}
                          </View>
                                        
                          <Text style={styles.studentName}>{teacher.name}</Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
            </View>
          )}

          {/* For teachers */}
          {user.role === 'teacher' && (
            <View style={{ marginTop: 12 }}>
              <Text style={[styles.label, { marginBottom: 8 }]}>Asignar estudiantes</Text>

              <View style={styles.studentListContainer}>
                {availableStudentsList.length === 0 ? (
                  <Text style={{ color: '#999', fontStyle: 'italic', padding: 8 }}>
                    No hay estudiantes disponibles
                  </Text>
                ) : (
                  availableStudentsList.map((student => (
                    <TouchableOpacity
                      key={student.userId || (student as any).id || (student as any).user_id}
                      style={styles.studentItem}
                      onPress={() => toggleStudent(student.userId || (student as any).id || (student as any).user_id)}
                    >
                      {/* Casilla de verificación visual (Checkbox) */}
                      <View style={[
                        styles.checkbox,
                        selectedStudentIds.includes(student.userId || (student as any).id || (student as any).user_id) && styles.checkboxSelected
                      ]}>
                        {selectedStudentIds.includes(student.userId || (student as any).id || (student as any).user_id) &&
                          <Text style={styles.checkmark}>✓</Text>
                        }
                      </View>

                      <Text style={styles.studentName}>{student.name}</Text>
                    </TouchableOpacity>
                  )))
                )}
              </View>
            </View>
          )}

          {error &&
            <Text style={styles.errorText}>{error}</Text>
          }

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={isSaving}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={isSaving}>
              <Text style={styles.saveText}>{isSaving ? 'Guardando...' : 'Guardar'}</Text>
            </TouchableOpacity>
          </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 700,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    elevation: 5,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 14, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  helper: { marginTop: 8, fontSize: 12, color: '#6B7280' },
  teacherOption: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  cancelButton: { padding: 8, marginRight: 8 },
  cancelText: { color: '#374151' },
  saveButton: { backgroundColor: '#0B84FF', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  saveText: { color: '#fff' },
  errorText: { color: '#DC2626', marginTop: 8, textAlign: 'center' },
  studentListContainer: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 6,
    maxHeight: 200,
    backgroundColor: '#FAFAFA',
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  studentName: {
    fontSize: 14,
    color: '#333',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#0B84FF',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxSelected: {
    backgroundColor: '#0B84FF',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0B84FF',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  radioOuterSelected: {
    borderColor: '#0B84FF',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0B84FF',
  },
  emptyText: { color: '#999', fontStyle: 'italic', padding: 8 },
  pictogramContainer: {
    marginTop: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F9FAFB'
  },
  helperText: { fontSize: 12, color: '#666', marginBottom: 5 },
  passwordDisplayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 5,
    marginBottom: 10,
    height: 60,
  },
  passwordIconsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  clearIconBtn: {
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  pictogramGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
