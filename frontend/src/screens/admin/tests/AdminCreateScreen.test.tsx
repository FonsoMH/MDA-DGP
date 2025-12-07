import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import AdminCreateScreen from '../AdminCreateScreen';

// (global as any).__DEV__ = false;

jest.mock('../src/screens/admin/hook/useCreateAdmin', () => ({
  useCreateAdmin: () => ({
    isSubmitting: false,
    onSubmitForm: jest.fn(async () => true),
  }),
}));

describe('AdminCreateScreen', () => {
  const navigation = { goBack: jest.fn() } as any;
  const route = { params: {} } as any;

  it('muestra errores de validación cuando se envía vacío', async () => {
  const { getAllByText } = render(<AdminCreateScreen navigation={navigation} route={route} />);

    // En RN Web puede haber múltiples nodos con el mismo texto
    const submitBtn = getAllByText('Crear Administrador')[0];
    fireEvent.press(submitBtn);

    await waitFor(() => {
      // Usar queries y lanzar si no existen
      const { queryAllByText } = require('@testing-library/react-native');
      const hasName = queryAllByText('El nombre es obligatorio').length > 0;
      const hasEmail = queryAllByText('El correo es obligatorio').length > 0;
      const hasPwd = queryAllByText('La contraseña es obligatoria para crear un nuevo usuario.').length > 0;
      if (!hasName || !hasEmail || !hasPwd) throw new Error('Mensajes de validación no encontrados');
    });
  });

  it('valida longitud mínima de contraseña', async () => {
  const { getByText, getAllByPlaceholderText, getAllByText } = render(<AdminCreateScreen navigation={navigation} route={route} />);

    fireEvent.changeText(getAllByPlaceholderText('Ej: Juan Pérez')[0], 'Admin');
    fireEvent.changeText(getAllByPlaceholderText('ejemplo@correo.com')[0], 'admin@test.com');
    fireEvent.changeText(getAllByPlaceholderText('Contraseña')[0], '123');

    const submitBtn2 = getAllByText('Crear Administrador')[0];
    fireEvent.press(submitBtn2);

    await waitFor(() => {
      getByText('La contraseña debe tener al menos 6 caracteres');
    });
  });

  it('envía y navega hacia atrás en éxito', async () => {
  const { getAllByPlaceholderText, getAllByText } = render(<AdminCreateScreen navigation={navigation} route={route} />);

    fireEvent.changeText(getAllByPlaceholderText('Ej: Juan Pérez')[0], 'Admin');
    fireEvent.changeText(getAllByPlaceholderText('ejemplo@correo.com')[0], 'admin@test.com');
    fireEvent.changeText(getAllByPlaceholderText('Contraseña')[0], 'Secret123');

    const submitBtn3 = getAllByText('Crear Administrador')[0];
    fireEvent.press(submitBtn3);

    await waitFor(() => {
      const calls = (navigation.goBack as any).mock?.calls?.length || 0;
      if (calls === 0) throw new Error('goBack was not called');
    });
  });
});