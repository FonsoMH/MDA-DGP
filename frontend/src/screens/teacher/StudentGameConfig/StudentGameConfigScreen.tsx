import * as React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, useWindowDimensions, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TeacherStackParamList } from '../../../navigation/TeacherNavigator';
import BackButton from '../../../components/common/BackButton/BackButton';
import { CONFIG_COMPONENTS_JSX } from './ConfigGameComponent';
import { useSaveStudentConfig } from '../hooks/useSaveStudentConfig';
import { useStudentConfigs } from '../hooks/useStudentConfig';
<<<<<<< HEAD
import { useEffect , useState} from 'react';
import Alert from '../../../components/FeedBack/Alert';
=======
import { updateStudentPermission } from '../../../api/studentConfig';
import { number } from 'yup';
>>>>>>> Develop

// Add route type in navigation types: StudentGameConfig: { studentId: number, isStudentView?: boolean }
type Props = NativeStackScreenProps<TeacherStackParamList, 'StudentGameConfig'>;

const CONFIG_MAP = {
  '1': ['min_value', 'max_value', 'num_elements'],
  '2': ['min_value', 'max_value', 'num_elements', 'upward'], 
  '4': ['min_value', 'max_value', 'num_elements', 'num_containers', 'sum'],
  '3': ['min_value', 'max_value', 'num_elements', 'num_containers', 'sum'],
};

export default function StudentGameConfigScreen({ route }: Props) {
  const { studentId, isStudentView = false } = route.params;

  // Responsive: medidas
  const { width } = useWindowDimensions();
  const GAP = 12;

  const titleSize = width >= 1024 ? 24 : width >= 768 ? 22 : 20;

  const { configs, loading, error, setConfigs, studentCanConfigure, setStudentCanConfigure } = useStudentConfigs(studentId);
  const [updatingPermission, setUpdatingPermission] = React.useState(false);

<<<<<<< HEAD
  const { saveOne, saving , errorSaving } = useSaveStudentConfig(studentId, configs);

  const [isAlertVisible, setIsAlertVisible] = React.useState(false);

  const [alert, setAlert] = useState({
      message: 'Cambios guardados con éxito',
      success: true
  });
  
  useEffect(() => {
    if (error) {
        setAlert({
            message: error.message ? error.message : String(error),
            success: false
        });
        setIsAlertVisible(true);
    }
  }, [error]);

  useEffect(() => {
    if (errorSaving) {
        setAlert({
            message: errorSaving.message ? errorSaving.message : String(errorSaving),
            success: false
        });
        setIsAlertVisible(true);
    }
  }, [errorSaving]);

  const handleChange = React.useCallback((slug: string, key: string, value: string) => {
=======
  const handleChange = React.useCallback((gameId: number, key: string, value: string) => {
>>>>>>> Develop
    
    const rawValue = value.trim() === '' ? '0' : value;

    const numericValue = Math.max(0, Number(rawValue)); 

    setConfigs((prev: any) => ({ 
        ...prev, 
        [gameId]: { 
            ...prev[gameId], 
            settings: { 
                ...prev[gameId].settings, 
                [key]: numericValue 
            } 
        } 
    }));
  }, []);

  const handleToggle = (gameId: number, key: string) => {
    setConfigs((prev: any) => {
      const cur = Boolean(prev[gameId]?.settings?.[key]);
      return { ...prev, [gameId]: { ...prev[gameId], settings: { ...prev[gameId].settings, [key]: !cur } } };
    });
  };

<<<<<<< HEAD
=======
  const { saveOne, saving } = useSaveStudentConfig(studentId, configs);

  const handlePermissionToggle = async (value: boolean) => {
    try {
      setUpdatingPermission(true);
      await updateStudentPermission(studentId, value);
      setStudentCanConfigure(value);
    } catch (err) {
      console.error('Error updating permission:', err);
    } finally {
      setUpdatingPermission(false);
    }
  };

>>>>>>> Develop
  if (loading) {
    return (
      <View style={styles.center}> 
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Cargando configuración…</Text>
      </View>
    );
  }

  const entries = Object.entries(configs) as [string, any][];

  return (
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={0}
    >
    <ScrollView
      contentContainerStyle={styles.content}
      style={{ flex: 1 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <Text style={[styles.title, { fontSize: titleSize }]}>Configuración de juegos</Text>
        <BackButton width={130} height={50} />
      </View>

      {!isStudentView && (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionLabel}>Permitir que el estudiante configure sus juegos</Text>
          <Switch
            value={studentCanConfigure}
            onValueChange={handlePermissionToggle}
            disabled={updatingPermission}
            testID="student-permission-toggle"
          />
        </View>
      )}

      <View style={[styles.gridContainer, { gap: GAP }]}>
        {entries.map(([gameId, info]) => {
          
          const requiredKeys = CONFIG_MAP[gameId as keyof typeof CONFIG_MAP] || []; 
          
          
          const renderProps = { gameId: Number(gameId), info, handleChange, handleToggle};

          return (
            <View key={gameId} style={styles.card}   testID={`game-card-${gameId}`}>
              <Text style={styles.cardTitle}>{info.name || gameId}</Text>
              {requiredKeys.map((key) => {
                const componentEntry = CONFIG_COMPONENTS_JSX[key];
                if (!componentEntry) return null; 

                const renderFunction = componentEntry.render;

                return (
                  <React.Fragment key={key}>
                    {renderFunction(renderProps)}
                  </React.Fragment>
                );
              })}

              <View style={[styles.actions, { marginTop: 'auto' }]}>
<<<<<<< HEAD
                <Pressable style={[styles.btn, styles.btnPrimary]} onPress={async () => { await saveOne(slug); setIsAlertVisible(true); }} disabled={saving}
                  accessibilityRole="button" accessibilityLabel={`Guardar configuración de ${info.name || slug}`}
=======
                <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => saveOne(Number(gameId))} disabled={saving}
                  accessibilityRole="button" accessibilityLabel={`Guardar configuración de ${info.name }`}
                  testID={`save-config-${gameId}`}
>>>>>>> Develop
                >
                  <Text style={styles.btnText}>{saving ? 'Guardando…' : 'Guardar'}</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>
      <Alert
        visible={isAlertVisible}
        message={alert.message}
        success={alert.success}
        duration={1000} 
        onHide={() => setIsAlertVisible(false)}
      />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    alignSelf: 'center',
    width: '100%',
    paddingVertical: 30,
    paddingHorizontal: 20
  },

  gridContainer: {
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    width: '100%',
    justifyContent: 'space-between',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '700', color: '#111', marginBottom: 8 },
  card: { 
    width: '48.5%',
    marginBottom: 12,
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 10, 
    gap: 8, 
    borderWidth: 1, 
    borderColor: '#E6E8EB' 
  },
  cardTitle: { fontWeight: '700', color: '#14213d', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { color: '#333' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 999 },
  btnPrimary: { backgroundColor: '#2563eb' },
  btnText: { color: '#fff', fontWeight: '700' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBtn: { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontWeight: '700' },
  stepValue: { minWidth: 28, textAlign: 'center', fontWeight: '700' },
  permissionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E6E8EB',
    marginBottom: 12,
  },
  permissionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#14213d',
    flex: 1,
    marginRight: 12,
  },
});
