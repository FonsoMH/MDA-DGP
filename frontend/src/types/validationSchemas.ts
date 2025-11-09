import * as yup from 'yup';

export interface CredentialsData {
  name: string;
  email: string;
  password: string | undefined;
}

export const credentialsSchema = yup.object().shape({
    
    name: yup.string()
        .required('El nombre es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres'),

    email: yup.string()
        .email('El correo debe ser válido')
        .required('El correo es obligatorio'),

    password: yup.string().optional()
        .required('La contraseña es obligatoria')
        .min(6, 'Debe tener al menos 6 caracteres'),
});