import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string()
    .email("Please enter a valide email."),

  password: yup.string()
    .min(8, "Password must contain at least 8 characters.")
    .required("Password is required.")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one number, one uppercase and lowercase letter.'
    ),
});