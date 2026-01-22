import * as Yup from 'yup';

export const createClassSchema = Yup.object().shape({
  // schoolCampus: the ID is required
  schoolCampus: Yup.string()
    .required('The campus is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid campus ID'),

  // level: the ID is required
  level: Yup.string()
    .required('The school level is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid level ID'),

  // className: Name of the class
  className: Yup.string()
    .trim()
    .min(2, 'The class name must contain at least 2 characters')
    .max(50, 'The name is too long (max 50)')
    .required('The class name is required'),

  // classManager: Optional (ID of the teacher)
  classManager: Yup.string()
    .nullable()
    .matches(/^[0-9a-fA-F]{24}$/, {
      message: 'Invalid manager ID',
      excludeEmptyString: true,
    }),

  // maxStudents: Positive integer
  maxStudents: Yup.number()
    .typeError('The number of students must be a number')
    .integer('The number must be an integer')
    .min(1, 'The minimum capacity is 1 student')
    .max(100, 'The maximum capacity seems too high (max 100)')
    .default(30),

  // status: Enumeration validation (useful for modification)
  status: Yup.string()
    .oneOf(['active', 'inactive', 'archived'], 'Invalid status')
    .default('active'),
});