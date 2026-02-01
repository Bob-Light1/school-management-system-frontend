/**
 * RESULT VALIDATION SCHEMA
 * Validates exam result creation and editing
 */
export const createResultSchema = Yup.object().shape({
  student: Yup.string()
    .required('Student is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid student ID'),

  exam: Yup.string()
    .required('Exam is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid exam ID'),

  subject: Yup.string()
    .required('Subject is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID'),

  class: Yup.string()
    .required('Class is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid class ID'),

  teacher: Yup.string()
    .required('Teacher is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid teacher ID'),

  schoolCampus: Yup.string()
    .required('Campus is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid campus ID'),

  score: Yup.number()
    .required('Score is required')
    .min(0, 'Score cannot be negative')
    .test('max-validation', 'Score exceeds maximum', function(value) {
      const { maxScore } = this.parent;
      return !maxScore || value <= maxScore;
    }),

  maxScore: Yup.number()
    .required('Maximum score is required')
    .min(1).max(100).default(20),

  teacherRemarks: Yup.string().max(1000).nullable(),
  classManagerRemarks: Yup.string().max(1000).nullable(),
  strengths: Yup.string().max(500).nullable(),
  improvements: Yup.string().max(500).nullable(),

  academicYear: Yup.string()
    .required('Academic year is required')
    .matches(/^\d{4}-\d{4}$/),

  semester: Yup.string()
    .required('Semester is required')
    .oneOf(['S1', 'S2', 'Annual']),

  examPeriod: Yup.string()
    .oneOf(['Midterm', 'Final', 'Quiz', 'Assignment', 'Project', 'Practical'])
    .default('Midterm'),

  examDate: Yup.date()
    .required('Exam date is required')
    .max(new Date(), 'Cannot be in the future'),

  weight: Yup.number().min(0).max(100).default(100),
  
  attendance: Yup.string()
    .oneOf(['present', 'absent', 'excused'])
    .default('present'),
});