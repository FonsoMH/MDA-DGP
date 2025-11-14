import React from 'react';
import { Controller, Control } from 'react-hook-form'; 
import { TextInput, Text, View, StyleSheet } from 'react-native';
import PasswordInput from '../../../components/common/PasswordInput/PasswordInput';



interface BasicCredentialsFormProps {
    control: Control<any>; 
    nameError?: string; 
    emailError?: string; 
    passwordError?: string;
    userRole: 'admin' | 'teacher' | 'student'; 
}

export default function BasicCredentialsForm({
  control,
  nameError, 
  emailError,
  passwordError, 
  userRole
}: BasicCredentialsFormProps) {
    
  const showPasswordField = userRole !== 'student';
  const placeholderColor = '#A0A0A0';

  return (
    <View style={localStyles.section}>
      
      <Text style={localStyles.label}>Nombre Completo</Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="Ej: Juan Pérez"
            placeholderTextColor={placeholderColor}
            style={[localStyles.input, nameError && localStyles.inputError]}
          />
        )}
      />
      {nameError && <Text style={localStyles.errorText}>{nameError}</Text>}

      <Text style={localStyles.label}>Correo Electrónico</Text>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholder="ejemplo@correo.com"
            placeholderTextColor={placeholderColor}
            style={[localStyles.input, emailError && localStyles.inputError]}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        )}
      />
      {emailError && <Text style={localStyles.errorText}>{emailError}</Text>}

      {showPasswordField && (
        <>
          <Text style={localStyles.label}>Contraseña</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <PasswordInput
                value={value || ''}
                onBlur={onBlur}
                onChangeText={onChange}
                placeholderTextColor={placeholderColor}
                style={[localStyles.input, passwordError && localStyles.inputError]}
              />
            )}
          />
          {passwordError && <Text style={localStyles.errorText}>{passwordError}</Text>}
        </>
      )}
      
    </View>
  );
}

const localStyles = StyleSheet.create({
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
    label: { color: '#333', marginTop: 4 },
    input: {
        backgroundColor: '#F4F5F7',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#111',
        
    },

    errorText: {
        color: '#d9534f',
        fontSize: 12,
        marginTop: 2,
    },
    inputError: {
        borderColor: '#d9534f',
        borderWidth: 1,
    }
});