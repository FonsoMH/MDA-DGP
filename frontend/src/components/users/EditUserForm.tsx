import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  user_id?: number;
  name: string;
  email: string;
  role: UserRole;
  assignedStudents?: string[];
  studentsCount?: number;
}

interface EditUserFormProps {
  user: User;
  teachers: { user_id?: number; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}

export default function EditUserForm({ user, teachers, onClose, onSaved }: EditUserFormProps) {
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [assignedTeacherId, setAssignedTeacherId] = useState<number | null>(
    // assigned_teacher_id may come as assignedStudents in this frontend model; we'll leave null unless provided elsewhere
    (user as any).assigned_teacher_id ?? null
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user.name || '');
    setEmail(user.email || '');
    setPassword('');
    setAssignedTeacherId((user as any).assigned_teacher_id ?? null);
  }, [user]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Nombre y email son obligatorios');
      return;
    }

    setSaving(true);
    try {
      // If student, use students endpoint; otherwise try users endpoint
      const payload: any = { name, email };
      if (password) payload.password = password;
      if (assignedTeacherId !== null) payload.assigned_teacher_id = assignedTeacherId;

      let url = '';
      if (user.role === 'student') {
        url = `${BASE_URL}/api/students/${user.user_id}`;
      } else {
        url = `${BASE_URL}/users/${user.user_id}`;
      }

      const resp = await axios.put(url, payload);
      console.log('EditUserForm: save response', resp?.status, resp?.data);
      Alert.alert('Éxito', 'Usuario actualizado correctamente');
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('EditUserForm: save error', err);
      const message = err?.response?.data?.error || err?.response?.data?.message || 'Error al actualizar usuario';
      Alert.alert('Error', String(message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView>
            <Text style={styles.title}>Editar usuario</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />

          {user.role === 'student' && (
            <>
              <Text style={styles.label}>Tutor asignador (ID)</Text>
              <TextInput
                style={styles.input}
                value={assignedTeacherId !== null ? String(assignedTeacherId) : ''}
                onChangeText={(v) => setAssignedTeacherId(v === '' ? null : Number(v))}
                keyboardType="numeric"
              />

              <Text style={styles.helper}>O selecciona un tutor:</Text>
              {teachers.map((t) => (
                <TouchableOpacity key={String(t.user_id)} style={styles.teacherOption} onPress={() => setAssignedTeacherId(t.user_id ?? null)}>
                  <Text>{t.name} (id: {String(t.user_id)})</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSubmit} disabled={saving}>
              <Text style={styles.saveText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
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
});
