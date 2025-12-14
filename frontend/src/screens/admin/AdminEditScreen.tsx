import * as React from 'react';
import { ScrollView, View, Text, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { CredentialsData, credentialsSchema } from '../../types/validationSchemas';

import { EditUserHook } from '../../components/users/hook/EditUserHook';
import BasicCredentialsForm from './components/BasicCredentialsForm';
import { AdminStackParamList } from '../../navigation/AdminNavigator';

type Props = NativeStackScreenProps<AdminStackParamList, 'AdminEdit'>;

export default function AdminEditScreen({ route, navigation }: Props) {
    const adminToEdit = route.params.admin;

    const { control, handleSubmit, formState: { errors, isSubmitting: isFormSubmitting } } = useForm({
        resolver: yupResolver(credentialsSchema),
        context: { isEdit: true },
        defaultValues: {
            name: adminToEdit?.name || '',
            email: adminToEdit?.email || '',
            password: '',
        },
        mode: 'onBlur',
    });

    const { isSaving, error, saveUser } = EditUserHook();

    const isTotalSubmitting = isFormSubmitting || isSaving;

    const onSubmitRHF = async (data: CredentialsData) => {
        const payload = {
            name: data.name,
            email: data.email,
            password: data.password ?? '',
        };

        const success = await saveUser(adminToEdit, payload);

        if (success) {
            navigation.goBack();
        }
    };

    return (
        <View style={styles.safe}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Editar Administrador</Text>

                <BasicCredentialsForm
                    control={control}
                    userRole='admin'
                    nameError={errors.name?.message}
                    emailError={errors.email?.message}
                    passwordError={errors.password?.message}
                />

                <View style={styles.actionsRow}>
                    <Pressable
                        style={[styles.btn, styles.btnSecondary]}
                        onPress={() => navigation.goBack()}
                        disabled={isTotalSubmitting}
                    >
                        <Text style={[styles.btnText, styles.btnTextSecondary]}>Cancelar</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.btn, styles.btnPrimary, isTotalSubmitting && { opacity: 0.7 }]}
                        onPress={handleSubmit(onSubmitRHF)}
                        disabled={isTotalSubmitting}
                    >
                        <Text style={[styles.btnText, styles.btnTextPrimary]}>
                            {isTotalSubmitting ? 'Editando...' : 'Editar Administrador'}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    content: {
        padding: 16,
        gap: 16,
        maxWidth: 800,
        width: '100%',
        alignSelf: 'center'
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#14213d',
        marginBottom: 10
    },
    actionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
        marginTop: 20
    },
    btn: {
        minWidth: 120,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnPrimary: {
        backgroundColor: '#2563eb',
    },
    btnSecondary: {
        backgroundColor: '#e5e7eb',
    },
    btnText: {
        color: '#ffffff',
        fontWeight: '700'
    },
    btnTextSecondary: {
        color: '#111',
    },
    btnTextPrimary: {
        color: '#fff',
    },
});