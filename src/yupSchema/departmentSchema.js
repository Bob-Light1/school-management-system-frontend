import * as Yup from 'yup';

/**
 * Yup validation schema for Department creation / update form.
 * @param {boolean} isEdit - Whether we are editing an existing department
 */
export const departmentSchema = (isEdit = false) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must not exceed 100 characters')
      .required('Department name is required'),

    code: Yup.string()
      .trim()
      .uppercase()
      .min(2, 'Code must be at least 2 characters')
      .max(10, 'Code must not exceed 10 characters')
      .matches(
        /^[A-Z0-9-]+$/,
        'Code can only contain uppercase letters, numbers and hyphens'
      )
      .required('Department code is required'),

    description: Yup.string()
      .trim()
      .max(500, 'Description must not exceed 500 characters')
      .notRequired(),

    headOfDepartment: Yup.string().nullable().notRequired(),

    status: Yup.string()
      .oneOf(['active', 'inactive', 'archived'], 'Invalid status')
      .notRequired(),
  });