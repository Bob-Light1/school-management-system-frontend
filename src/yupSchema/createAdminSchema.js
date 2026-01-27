import * as yup from 'yup';

export const createAdminSchema = yup.object({
  admin_name: yup
    .string()
    .trim()
    .min(4, 'Admin name must contain at least 4 characters.')
    .required('Admin name is required.'),

  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Please enter a valid email.')
    .required('Admin email is required.'),

  password: yup
    .string()
    .min(8, 'Password must contain at least 8 characters.')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one number, one uppercase and one lowercase letter.'
    )
    .required('Password is required.'),

  confirm_password: yup
    .string()
    .oneOf([yup.ref('password')], 'Confirm password must match password.')
    .required('Confirm password is required.'),
});
