'use strict';

/**
 * @file teacherScheduleSchema.js
 * @description Yup validation schemas for teacher-facing schedule forms.
 *              Covers sessions, availability slots, and workload snapshots.
 *              Mirrors teacherSchedule.model.js.
 */

import * as Yup from 'yup';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const SCHEDULE_STATUS = ['DRAFT', 'PUBLISHED', 'POSTPONED', 'CANCELLED'];
export const SESSION_TYPE    = ['LECTURE', 'TUTORIAL', 'LAB', 'SEMINAR', 'EXAM', 'OTHER'];
export const SEMESTER        = ['S1', 'S2', 'Annual'];
export const WEEKDAY         = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];
export const CONTRACT_TYPE   = ['full-time', 'part-time', 'contract', 'temporary'];

const OBJECT_ID_REGEX    = /^[a-f\d]{24}$/i;
const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{4}$/;

// ─── REUSABLE HELPERS ─────────────────────────────────────────────────────────

const objectId = (label = 'ID') =>
  Yup.string()
    .matches(OBJECT_ID_REGEX, `${label} must be a valid identifier`)
    .required(`${label} is required`);

const optionalObjectId = (label = 'ID') =>
  Yup.string()
    .matches(OBJECT_ID_REGEX, `${label} must be a valid identifier`)
    .nullable()
    .default(null);

const academicYearField = Yup.string()
  .matches(ACADEMIC_YEAR_REGEX, 'Academic year must be in YYYY-YYYY format (e.g. 2024-2025)')
  .test(
    'consecutive-years',
    'Academic year must span exactly one year (e.g. 2024-2025)',
    (value) => {
      if (!value) return true;
      const [start, end] = value.split('-').map(Number);
      return end === start + 1;
    }
  );

// ─── SUB-SCHEMAS ──────────────────────────────────────────────────────────────

/**
 * Teacher snapshot — matricule is kept nullable here because this snapshot
 * is also used in availability-only entries that may not have a full profile.
 * Controllers responsible for payroll exports should enforce matricule presence
 * at the service layer.
 */
const teacherSnapshotSchema = Yup.object({
  teacherId: objectId('Teacher'),
  firstName: Yup.string().trim().nullable().default(null),
  lastName:  Yup.string().trim().nullable().default(null),
  email:     Yup.string().email('Teacher email is not valid').nullable().default(null),
  matricule: Yup.string().trim().nullable().default(null),
});

const subjectSchema = Yup.object({
  subjectId:    objectId('Subject'),
  subject_name: Yup.string().trim().required('Subject name is required'),
  subject_code: Yup.string().trim().nullable().default(null),
  department:   optionalObjectId('Department'),
});

const classEntrySchema = Yup.object({
  classId:   objectId('Class'),
  className: Yup.string().trim().nullable().default(null),
});

const roomSchema = Yup.object({
  code:     Yup.string().trim().max(20).nullable().default(null),
  name:     Yup.string().trim().max(100).nullable().default(null),
  building: Yup.string().trim().max(100).nullable().default(null),
  capacity: Yup.number().integer().min(1).nullable().default(null),
});

const virtualMeetingSchema = Yup.object({
  platform:   Yup.string().trim().nullable().default(null),
  meetingUrl: Yup.string().url('Meeting URL must be a valid URL').nullable().default(null),
  meetingId:  Yup.string().trim().nullable().default(null),
  password:   Yup.string().trim().nullable().default(null),
});

const recurrenceSchema = Yup.object({
  isRecurring: Yup.boolean().default(false),
  frequency: Yup.string()
    .oneOf(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'NONE'])
    .default('NONE'),
  endDate: Yup.date()
    .nullable()
    .default(null)
    .when('isRecurring', {
      is:   true,
      then: (s) =>
        s
          .required('End date is required for recurring sessions')
          .test('is-future', 'Recurrence end date must be in the future', (value) =>
            !value || value > new Date()
          ),
    }),
  daysOfWeek: Yup.array()
    .of(Yup.string().oneOf(WEEKDAY))
    .default([])
    .when(['isRecurring', 'frequency'], {
      is:   (isRecurring, frequency) =>
        isRecurring && (frequency === 'WEEKLY' || frequency === 'BIWEEKLY'),
      then: (s) => s.min(1, 'At least one day must be selected for weekly recurring sessions'),
    }),
});

const contractSnapshotSchema = Yup.object({
  contractType:  Yup.string().oneOf(CONTRACT_TYPE, 'Invalid contract type').nullable().default(null),
  weeklyHours:   Yup.number().min(0, 'Weekly hours cannot be negative').nullable().default(null),
  semesterHours: Yup.number().min(0, 'Semester hours cannot be negative').nullable().default(null),
  hourlyRate:    Yup.number().min(0, 'Hourly rate cannot be negative').nullable().default(null),
  currency:      Yup.string().trim().max(3).default('XAF'),
});

// ─── AVAILABILITY SLOT SCHEMA ─────────────────────────────────────────────────

/**
 * A single weekly availability window.
 * Hours are integers (0–23 / 1–24) matching the model.
 * If half-hour slots are ever needed, replace with HH:mm string + regex.
 *
 * Symmetry rule: validFrom is required when validUntil is provided,
 * and validUntil must be after validFrom.
 */
export const availabilitySlotSchema = Yup.object({
  day: Yup.string()
    .oneOf(WEEKDAY, 'Day must be one of MO, TU, WE, TH, FR, SA, SU')
    .required('Day is required'),

  startHour: Yup.number()
    .integer('Start hour must be a whole number')
    .min(0, 'Start hour must be between 0 and 23')
    .max(23, 'Start hour must be between 0 and 23')
    .required('Start hour is required'),

  endHour: Yup.number()
    .integer('End hour must be a whole number')
    .min(1, 'End hour must be between 1 and 24')
    .max(24, 'End hour must be between 1 and 24')
    .required('End hour is required')
    .moreThan(Yup.ref('startHour'), 'End hour must be after start hour'),

  isAvailable: Yup.boolean().default(true),

  reason: Yup.string()
    .trim()
    .max(200, 'Reason must not exceed 200 characters')
    .nullable()
    .default(null),

  // validFrom becomes required when validUntil is provided
  validFrom: Yup.date()
    .nullable()
    .default(null)
    .when('validUntil', {
      is:   (v) => !!v,
      then: (s) => s.required('Valid from is required when valid until is set'),
    }),

  validUntil: Yup.date()
    .nullable()
    .default(null)
    .when('validFrom', {
      is:   (v) => !!v,
      then: (s) =>
        s.min(Yup.ref('validFrom'), 'Valid until must be after valid from'),
    }),
});

export const availabilitySlotsArraySchema = Yup.object({
  slots: Yup.array()
    .of(availabilitySlotSchema)
    .min(1, 'At least one availability slot is required')
    .required('Slots are required'),
});

// ─── MAIN SCHEDULE SCHEMA ─────────────────────────────────────────────────────

export const teacherScheduleSchema = Yup.object({
  schoolCampus: objectId('Campus'),
  teacher:      teacherSnapshotSchema.required('Teacher information is required'),

  studentScheduleRef: optionalObjectId('Student schedule reference'),

  academicYear: academicYearField.nullable().default(null),
  semester:     Yup.string().oneOf(SEMESTER).nullable().default(null),
  sessionType:  Yup.string().oneOf(SESSION_TYPE).nullable().default(null),
  subject:      subjectSchema.nullable().default(null),

  startTime: Yup.date()
    .typeError('Start time must be a valid date')
    .required('Start time is required')
    .test('is-future', 'Session start time must be in the future', (value) =>
      !value || value > new Date()
    ),

  endTime: Yup.date()
    .typeError('End time must be a valid date')
    .required('End time is required')
    .min(Yup.ref('startTime'), 'End time must be after start time'),

  classes: Yup.array().of(classEntrySchema).default([]),

  isVirtual: Yup.boolean().default(false),

  room: Yup.object().when('isVirtual', {
    is:   false,
    then: () =>
      roomSchema.shape({
        code: Yup.string().trim().max(20).required('Room code is required for in-person sessions'),
      }),
    otherwise: () => roomSchema.nullable().default(null),
  }),

  virtualMeeting: Yup.object().when('isVirtual', {
    is:   true,
    then: () =>
      virtualMeetingSchema.shape({
        meetingUrl: Yup.string()
          .url('Meeting URL must be a valid URL')
          .required('Meeting URL is required for virtual sessions'),
      }),
    otherwise: () => virtualMeetingSchema.nullable().default(null),
  }),

  recurrence: recurrenceSchema.default(() => ({})),
  contract:   contractSnapshotSchema.default(() => ({})),

  status: Yup.string().oneOf(SCHEDULE_STATUS).default('DRAFT'),
});

// ─── PARTIAL / ACTION SCHEMAS ─────────────────────────────────────────────────

export const updateTeacherScheduleStatusSchema = Yup.object({
  status: Yup.string().oneOf(SCHEDULE_STATUS).required('Status is required'),
  reason: Yup.string()
    .trim()
    .max(500)
    .when('status', {
      is:   'CANCELLED',
      then: (s) => s.required('A reason is required when cancelling a session'),
    }),
});

/**
 * Roll-call submission.
 * Note: present + absent + late should equal the total number of students
 * in the assigned classes. This cross-check is enforced at the controller
 * level since the total is not available in the client payload.
 */
export const rollCallSubmitSchema = Yup.object({
  present: Yup.number().integer().min(0, 'Present count cannot be negative').required('Present count is required'),
  absent:  Yup.number().integer().min(0, 'Absent count cannot be negative').required('Absent count is required'),
  late:    Yup.number().integer().min(0, 'Late count cannot be negative').default(0),
});

export const teacherPostponementRequestSchema = Yup.object({
  requestedDate: Yup.date()
    .typeError('Requested date must be a valid date')
    .required('Requested date is required')
    // Dynamic evaluation — not frozen at module load time
    .test('is-future', 'Requested date must be in the future', (value) =>
      !value || value > new Date()
    ),
  reason: Yup.string()
    .trim()
    .min(10, 'Please provide at least 10 characters for the reason')
    .max(500, 'Reason must not exceed 500 characters')
    .required('Reason is required'),
});

export default teacherScheduleSchema;