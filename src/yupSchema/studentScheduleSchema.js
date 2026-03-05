'use strict';

/**
 * @file studentScheduleSchema.js
 * @description Yup validation schemas for student schedule forms.
 *
 * IMPORTANT — Shape contract:
 *   This schema validates the RAW Formik values (flat fields like subjectId,
 *   teacherId, classIds, meetingUrl, roomCode…).
 *   The ScheduleForm onSubmit sends these flat IDs directly to the backend.
 *   The controller (createSession / updateSession) resolves them into denormalised
 *   nested objects via resolveSessionParticipants() — the frontend never builds
 *   nested { subject: {}, teacher: {} } objects.
 *
 *   Do NOT use nested sub-schemas here (subjectSchema, teacherSchema, classEntrySchema)
 *   because Formik stores flat IDs, not nested objects.
 */

import * as Yup from 'yup';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const SCHEDULE_STATUS = ['DRAFT', 'PUBLISHED', 'POSTPONED', 'CANCELLED'];
// Must mirror SESSION_TYPE enum in schedule.base.js exactly
export const SESSION_TYPE    = ['LECTURE', 'TUTORIAL', 'PRACTICAL', 'EXAM', 'WORKSHOP'];
export const SEMESTER        = ['S1', 'S2', 'Annual'];

const OBJECT_ID_REGEX     = /^[a-f\d]{24}$/i;
const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{4}$/;

// ─── REUSABLE HELPERS ─────────────────────────────────────────────────────────

/**
 * Required MongoDB ObjectId field.
 */
const objectId = (label = 'ID') =>
  Yup.string()
    .matches(OBJECT_ID_REGEX, `${label} must be a valid identifier`)
    .required(`${label} is required`);

/**
 * Academic year — format YYYY-YYYY with consecutive years.
 */
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
  )
  .required('Academic year is required');

// ─── MAIN SCHEMA (matches flat Formik values) ─────────────────────────────────

/**
 * Primary schema used by <ScheduleForm />.
 * All fields mirror formik.values exactly — no nested objects.
 */
export const studentScheduleSchema = Yup.object({

  // Campus isolation — injected from AuthContext, always present
  schoolCampus: objectId('Campus'),

  academicYear: academicYearField,

  semester: Yup.string()
    .oneOf(SEMESTER, 'Semester must be S1, S2, or Annual')
    .required('Semester is required'),

  sessionType: Yup.string()
    .oneOf(SESSION_TYPE, 'Invalid session type')
    .required('Session type is required'),

  // Flat IDs — assembled into nested objects in onSubmit
  subjectId: objectId('Subject'),
  teacherId: objectId('Teacher'),

  // Array of ObjectId strings (classIds chip selector)
  classIds: Yup.array()
    .of(
      Yup.string()
        .matches(OBJECT_ID_REGEX, 'Each class must be a valid identifier')
        .required()
    )
    .min(1, 'At least one class must be assigned to the session')
    .required('Classes are required'),

  // Session start — must be in the future on creation
  startTime: Yup.string()
    .required('Start time is required')
    .test('is-valid-date', 'Start time must be a valid date', (v) => !isNaN(Date.parse(v)))
    .test('is-future', 'Session start time must be in the future', (v) =>
      !v || new Date(v) > new Date()
    ),

  // Session end — must be after start
  endTime: Yup.string()
    .required('End time is required')
    .test('is-valid-date', 'End time must be a valid date', (v) => !isNaN(Date.parse(v)))
    .test('after-start', 'End time must be after start time', function (v) {
      const { startTime } = this.parent;
      if (!v || !startTime) return true;
      return new Date(v) > new Date(startTime);
    }),

  isVirtual: Yup.boolean().default(false),

  // Physical room — required only for in-person sessions
  roomCode: Yup.string()
    .trim()
    .max(20, 'Room code must not exceed 20 characters')
    .when('isVirtual', {
      is:   false,
      then: (s) => s.required('Room code is required for in-person sessions'),
      otherwise: (s) => s.nullable().default(''),
    }),

  roomBuilding: Yup.string().trim().max(100).nullable().default(''),

  // Virtual meeting — required only for online sessions
  meetingUrl: Yup.string()
    .trim()
    .when('isVirtual', {
      is:   true,
      then: (s) =>
        s
          .url('Meeting URL must be a valid URL')
          .required('Meeting URL is required for virtual sessions'),
      otherwise: (s) => s.nullable().default(''),
    }),

  platform: Yup.string().trim().nullable().default(''),

  // Optional content fields
  topic:       Yup.string().trim().max(200, 'Topic must not exceed 200 characters').nullable().default(''),
  description: Yup.string().trim().max(1000, 'Description must not exceed 1000 characters').nullable().default(''),

  status: Yup.string()
    .oneOf(SCHEDULE_STATUS, 'Invalid schedule status')
    .default('DRAFT'),
});

// ─── PARTIAL / SPECIFIC SCHEMAS ───────────────────────────────────────────────

export const updateScheduleStatusSchema = Yup.object({
  status: Yup.string().oneOf(SCHEDULE_STATUS).required('Status is required'),
  reason: Yup.string()
    .trim()
    .max(500, 'Reason must not exceed 500 characters')
    .when('status', {
      is:   'CANCELLED',
      then: (s) => s.required('A reason is required when cancelling a session'),
    }),
});

/**
 * Postponement request — requestedDate uses a dynamic .test() so that
 * "now" is always evaluated at validation time, not at module load time.
 */
export const postponementRequestSchema = Yup.object({
  requestedDate: Yup.date()
    .typeError('Requested date must be a valid date')
    .required('Requested date is required')
    .test('is-future', 'Requested date must be in the future', (value) =>
      !value || value > new Date()
    ),
  reason: Yup.string()
    .trim()
    .min(10, 'Please provide at least 10 characters for the reason')
    .max(500, 'Reason must not exceed 500 characters')
    .required('Reason is required'),
});

export default studentScheduleSchema;