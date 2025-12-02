import * as yup from 'yup';

export interface CredentialsData {
  name: string;
  email: string;
  password?: string | undefined;
}

export const credentialsSchema = yup.object().shape({
    
    name: yup.string()
        .required('El nombre es obligatorio')
        .min(3, 'El nombre debe tener al menos 3 caracteres'),

    email: yup.string()
        .email('El correo debe ser válido')
        .required('El correo es obligatorio'),

    password: yup.string().optional()

    
    .when('$isEdit', { // '$isEdit' es el nombre de la variable que pasaremos
        is: false,
        then: (schema) => schema.required('La contraseña es obligatoria para crear un nuevo usuario.'),
        otherwise: (schema) => schema.notRequired(), // Opcional en edición
        }),
});