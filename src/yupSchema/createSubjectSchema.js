import * as yup from 'yup';

export const createSubjectSchema = yup.object({
  schoolCampus: yup
    .string()
    .required('Campus is required'),

  subject_name: yup
    .string()
    .min(3, 'Subject name must be at least 3 characters')
    .max(100, 'Subject name is too long')
    .required('Subject name is required'),

  subject_code: yup
    .string()
    .matches(/^[A-Z0-9_-]+$/, 'Invalid subject code format')
    .min(3, 'Subject code must be at least 3 characters')
    .max(20, 'Subject code is too long')
    .required('Subject code is required'),

  description: yup
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .nullable(),

  coefficient: yup
    .number()
    .min(0, 'Coefficient must be positive')
    .required('Coefficient is required'),

  color: yup
    .string()
    .matches(/^#([0-9A-F]{3}){1,2}$/i, 'Invalid color format')
    .nullable(),
});
