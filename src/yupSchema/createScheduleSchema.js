import * as Yup from 'yup';

/**
 * SCHEDULE VALIDATION SCHEMA
 * Validates schedule/timetable creation and editing
 */
export const createScheduleSchema = Yup.object().shape({
  schoolCampus: Yup.string()
    .required('Campus is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid campus ID'),

  class: Yup.string()
    .required('Class is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid class ID'),

  subject: Yup.string()
    .required('Subject is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid subject ID'),

  teacher: Yup.string()
    .required('Teacher is required')
    .matches(/^[0-9a-fA-F]{24}$/, 'Invalid teacher ID'),

  dayOfWeek: Yup.string()
    .required('Day of week is required')
    .oneOf(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),

  startTime: Yup.string()
    .required('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),

  endTime: Yup.string()
    .required('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)')
    .test('is-after', 'End time must be after start time', function(value) {
      const { startTime } = this.parent;
      if (!startTime || !value) return true;
      return value > startTime;
    }),

  room: Yup.string().max(50).nullable(),
  building: Yup.string().max(50).nullable(),

  academicYear: Yup.string()
    .required('Academic year is required')
    .matches(/^\d{4}-\d{4}$/, 'Format: YYYY-YYYY'),

  semester: Yup.string()
    .required('Semester is required')
    .oneOf(['S1', 'S2', 'Annual']),

  sessionType: Yup.string()
    .oneOf(['lecture', 'tutorial', 'lab', 'exam', 'seminar', 'workshop'])
    .default('lecture'),

  notes: Yup.string().max(500).nullable(),
  color: Yup.string().matches(/^#[0-9A-Fa-f]{6}$/).nullable(),
});