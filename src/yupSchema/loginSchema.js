import * as yup from 'yup';

/**
 * Universal login schema
 * Accepts either email or username as identifier
 */
export const loginSchema = yup.object({
  identifier: yup
    .string()
    .trim()
    .required('Email or username is required')
    .test(
      'valid-identifier',
      'Please enter a valid email or username',
      (value) => {
        if (!value) return false;
        
        // Check if it's an email (contains @)
        if (value.includes('@')) {
          // Validate as email
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          return emailRegex.test(value);
        } else {
          // Validate as username
          // Username: 3-30 chars, alphanumeric + dots, hyphens, underscores
          const usernameRegex = /^[a-z0-9_.-]{3,30}$/;
          return usernameRegex.test(value.toLowerCase());
        }
      }
    ),

    password: yup.string()
    .min(8, "Password must contain at least 8 characters.")
    .required("Password is required.")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one number, one uppercase and lowercase letter.'
    ),
});

/**
 * Separate schemas if you need them for specific forms
 */

// Email-only login
export const emailLoginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Please enter a valid email address')
    .required('Email is required'),

    password: yup.string()
    .min(8, "Password must contain at least 8 characters.")
    .required("Password is required.")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one number, one uppercase and lowercase letter.'
    ),
});

// Username-only login
export const usernameLoginSchema = yup.object({
  username: yup
    .string()
    .trim()
    .lowercase()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .matches(
      /^[a-z0-9_.-]+$/,
      'Username can only contain lowercase letters, numbers, dots, hyphens and underscores'
    )
    .required('Username is required'),

    password: yup.string()
    .min(8, "Password must contain at least 8 characters.")
    .required("Password is required.")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one number, one uppercase and lowercase letter.'
    ),
});