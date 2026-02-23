import * as Yup from 'yup';

/**
 * Yup validation schema for Teacher creation/update form
 * @param {boolean} isEdit - Whether we're editing an existing teacher
 */
export const createTeacherSchema = (isEdit = false) =>
  Yup.object().shape({
    firstName: Yup.string()
      .trim()
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must not exceed 50 characters')
      .required('First name is required'),

    lastName: Yup.string()
      .trim()
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must not exceed 50 characters')
      .required('Last name is required'),

    email: Yup.string()
      .trim()
      .lowercase()
      .email('Invalid email address')
      .required('Email is required'),

    username: Yup.string()
      .trim()
      .lowercase()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username must not exceed 30 characters')
      .matches(
        /^[a-z0-9_.-]+$/,
        'Username can only contain lowercase letters, numbers, dots, hyphens and underscores'
      )
      .required('Username is required'),

    password: isEdit
      ? Yup.string().notRequired()
      : Yup.string()
          .min(8, 'Password must be at least 8 characters')
          .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
          .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
          .matches(/[0-9]/, 'Password must contain at least one number')
          .matches(
            /[!@#$%^&*(),.?":{}|<>]/,
            'Password must contain at least one special character'
          )
          .required('Password is required'),

    phone: Yup.string()
      .trim()
      .matches(
        /^\+?[0-9\s()-]{6,20}$/,
        'Please enter a valid phone number'
      )
      .required('Phone number is required'),

    gender: Yup.string()
      .oneOf(['male', 'female', 'other'], 'Please select a valid gender')
      .required('Gender is required'),

    dateOfBirth: Yup.date()
      .nullable()
      .max(new Date(), 'Date of birth cannot be in the future')
      .typeError('Please enter a valid date'),

    qualification: Yup.string()
      .trim()
      .max(100, 'Qualification must not exceed 100 characters')
      .required('Qualification is required'),

    specialization: Yup.string()
      .trim()
      .max(100, 'Specialization must not exceed 100 characters')
      .notRequired(),

    experience: Yup.number()
      .min(0, 'Experience cannot be negative')
      .max(50, 'Experience cannot exceed 50 years')
      .typeError('Experience must be a number')
      .notRequired(),

    employmentType: Yup.string()
      .oneOf(
        ['full-time', 'part-time', 'contract', 'temporary'],
        'Please select a valid employment type'
      )
      .required('Employment type is required'),

    department: Yup.string()
      .required('Department is required'),

    matricule: Yup.string()
      .trim()
      .uppercase()
      .notRequired(),

    schoolCampus: Yup.string()
      .required('Campus is required'),

    profileImage: Yup.mixed().nullable().notRequired(),
  });