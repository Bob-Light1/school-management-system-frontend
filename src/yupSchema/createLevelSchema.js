import * as yup from 'yup';

/**
 * Validation schema for creating / updating a Level
 * Must stay consistent with backend level.model.js
 */
export const createLevelSchema = yup.object({
  // Human readable name (A1, B2, L1, M2...)
  name: yup
    .string()
    .trim()
    .uppercase()
    .min(2, 'Level name must contain at least 2 characters.')
    .max(10, 'Level name must not exceed 10 characters.')
    .required('Level name is required.'),

  // Unique technical code (API / DB usage)
  code: yup
    .string()
    .trim()
    .uppercase()
    .min(2, 'Level code must contain at least 2 characters.')
    .max(10, 'Level code must not exceed 10 characters.')
    .matches(
      /^[A-Z0-9_-]+$/,
      'Level code must contain only uppercase letters, numbers, "_" or "-"'
    )
    .required('Level code is required.'),

  // Level type
  type: yup
    .string()
    .oneOf(
      ['LANGUAGE', 'ACADEMIC', 'PROFESSIONAL'],
      'Invalid level type.'
    )
    .required('Level type is required.'),

  // Order for sorting levels
  order: yup
    .number()
    .typeError('Order must be a number.')
    .integer('Order must be an integer.')
    .min(1, 'Order must be at least 1.')
    .required('Order is required.'),

  // Optional description
  description: yup
    .string()
    .trim()
    .max(255, 'Description must not exceed 255 characters.')
    .nullable(),

  // Status (mainly used for edit forms)
  status: yup
    .string()
    .oneOf(['active', 'archived'])
    .default('active'),
});
