import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import '@testing-library/jest-native/extend-expect';
import AdminCreateScreen from '../src/screens/admin/AdminCreateScreen';

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
  const { getByText, getByTestId } = render(<AdminCreateScreen navigation={navigation} route={route} />);

    fireEvent.press(getByTestId('submit-create-admin'));

    await waitFor(() => {
      getByText('El nombre es obligatorio');
      getByText('El correo es obligatorio');
      getByText('La contraseña es obligatoria para crear un nuevo usuario.');
    });
  });

  it('valida longitud mínima de contraseña', async () => {
  const { getByText, getByPlaceholderText, getByTestId } = render(<AdminCreateScreen navigation={navigation} route={route} />);

    fireEvent.changeText(getByPlaceholderText('Nombre'), 'Admin');
    fireEvent.changeText(getByPlaceholderText('Email'), 'admin@test.com');
    fireEvent.changeText(getByPlaceholderText('Contraseña'), '123');

    fireEvent.press(getByTestId('submit-create-admin'));

    await waitFor(() => {
      getByText('La contraseña debe tener al menos 6 caracteres');
    });
  });

  it('envía y navega hacia atrás en éxito', async () => {
  const { getByPlaceholderText, getByTestId } = render(<AdminCreateScreen navigation={navigation} route={route} />);

    fireEvent.changeText(getByPlaceholderText('Nombre'), 'Admin');
    fireEvent.changeText(getByPlaceholderText('Email'), 'admin@test.com');
    fireEvent.changeText(getByPlaceholderText('Contraseña'), 'Secret123');

    fireEvent.press(getByTestId('submit-create-admin'));

    await waitFor(() => {
      const calls = (navigation.goBack as any).mock?.calls?.length || 0;
      if (calls === 0) throw new Error('goBack was not called');
    });
  });
});