import * as React from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import PasswordInput from '../components/common/PasswordInput/PasswordInput';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const API_TIMEOUT = process.env.API_TIMEOUT;

type Props = NativeStackScreenProps<RootStackParamList, 'TeacherCreate'>;

type Student = { id: number; name: string; email: string };

export default function TeacherCreateScreen({ navigation }: Props) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const pageSize = 10;

  React.useEffect(() => {
    loadStudents(page);
  }, [page]);

  const loadStudents = async (p: number) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/students/no_teacher`, {
        params: { page: p, page_size: pageSize },
        timeout: +API_TIMEOUT
      });

      const data = res.data || [];
      const students = data.items || [];
      setStudents(students);
      if (data.total_pages) setTotalPages(data.total_pages);
    } catch (e) {
      console.error('Error cargando estudiantes', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onSubmit = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert('Todos los campos son obligatorios');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        assigned_students_ids: selectedIds,
      };
      await axios.post(`${BASE_URL}/api/teachers`, payload);
      alert('Tutor creado correctamente');
      navigation.goBack();
    } catch (e: any) {
      console.error(e?.response?.data || e.message);
      alert('Error creando tutor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Crear Nuevo Tutor</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Nombre Completo</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ej: Juan Pérez"
            style={styles.input}
          />

          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="ejemplo@correo.com"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <PasswordInput
            style={styles.input}
            onChangeText={setPassword}
            value={password}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Asignar Estudiantes</Text>
          <Text style={styles.help}>Selecciona los estudiantes que estarán a cargo del tutor</Text>

          {loading && <ActivityIndicator style={{ marginVertical: 10 }} />}

          {!loading &&
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

          {/* Paginación */}
          <View style={styles.paginationRow}>
            <Pressable
              disabled={page <= 1}
              style={[styles.pageBtn, page <= 1 && { opacity: 0.5 }]}
              onPress={() => setPage((p) => Math.max(1, p - 1))}
            >
              <Text style={styles.pageBtnText}>Anterior</Text>
            </Pressable>
            <Text style={styles.pageInfo}>
              Página {page} de {totalPages}
            </Text>
            <Pressable
              disabled={page >= totalPages}
              style={[styles.pageBtn, page >= totalPages && { opacity: 0.5 }]}
              onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
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
            style={[styles.btn, styles.btnPrimary, loading && { opacity: 0.7 }]}
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.btnText}>Crear Tutor</Text>
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
