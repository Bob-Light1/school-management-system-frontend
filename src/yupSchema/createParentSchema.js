import * as Yup from 'yup';

/**
 * Yup validation schema for Parent creation / update form.
 *
 * @param {boolean} isEdit - true when editing an existing parent record
 */
export const createParentSchema = (isEdit = false) =>
  Yup.object().shape({
    // ── Personal information ──────────────────────────────────────────────────

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

    phone: Yup.string()
      .trim()
      .matches(
        /^\+?[0-9\s()-]{6,20}$/,
        'Please enter a valid phone number (6–20 digits)'
      )
      .required('Phone number is required'),

    password: isEdit
      ? Yup.string().notRequired()
      : Yup.string()
          .min(8, 'Password must be at least 8 characters')
          .max(128, 'Password must not exceed 128 characters')
          .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
          .matches(/[a-z]/, 'Must contain at least one lowercase letter')
          .matches(/[0-9]/, 'Must contain at least one number')
          .required('Password is required'),

    gender: Yup.string()
      .oneOf(['male', 'female'], 'Please select a valid gender')
      .required('Gender is required'),

    relationship: Yup.string()
      .oneOf(
        ['father', 'mother', 'guardian', 'other'],
        "Must be 'father', 'mother', 'guardian', or 'other'"
      )
      .required('Relationship is required'),

    // ── Optional fields ───────────────────────────────────────────────────────

    dateOfBirth: Yup.date()
      .nullable()
      .max(new Date(), 'Date of birth cannot be in the future')
      .typeError('Please enter a valid date'),

    nationalId: Yup.string()
      .trim()
      .max(50, 'National ID must not exceed 50 characters')
      .nullable()
      .notRequired(),

    occupation: Yup.string()
      .trim()
      .max(100, 'Occupation must not exceed 100 characters')
      .nullable()
      .notRequired(),

    preferredLanguage: Yup.string()
      .oneOf(['fr', 'en', 'es', 'ar'], 'Invalid language')
      .notRequired(),

    notes: Yup.string()
      .max(500, 'Notes must not exceed 500 characters')
      .nullable()
      .notRequired(),

    schoolCampus: Yup.string().required('Campus is required'),
  });

export default createParentSchema;
