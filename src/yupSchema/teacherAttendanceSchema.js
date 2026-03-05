'use strict';

/**
 * @file teacherAttendanceSchema.js
 * @description Yup validation schemas for teacher attendance forms.
 *              Mirrors the constraints defined in teacherAttend.model.js.
 */

import * as Yup from 'yup';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const SEMESTER = ['S1', 'S2', 'Annual'];

const OBJECT_ID_REGEX    = /^[a-f\d]{24}$/i;
const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{4}$/;
const TIME_REGEX          = /^([01]\d|2[0-3]):([0-5]\d)$/;
const PAYMENT_REF_REGEX   = /^[A-Z0-9\-_]{3,50}$/;

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

// ─── SHARED TIME COMPARISON HELPER ────────────────────────────────────────────

/**
 * Returns a Yup string schema for HH:mm times that validates
 * the end time is strictly after the start time.
 * Both fields must be present for the comparison to trigger.
 */
const sessionEndTimeField = Yup.string()
  .matches(TIME_REGEX, 'End time must be in HH:mm format')
  .nullable()
  .default(null)
  .test(
    'end-after-start',
    'Session end time must be after start time',
    function (value) {
      const { sessionStartTime } = this.parent;
      if (!sessionStartTime || !value) return true;
      return value > sessionStartTime;
    }
  );

// ─── MAIN SCHEMA ──────────────────────────────────────────────────────────────

/**
 * Schema for recording a teacher's attendance for a given session.
 * Recorded by the Campus Manager (role: CAMPUS_MANAGER).
 *
 * isLate / arrivalTime cross-validation:
 *   When both arrivalTime and sessionStartTime are present, isLate must be
 *   true if arrivalTime > sessionStartTime, and false otherwise.
 *   This is advisory — the UI should auto-set isLate, but the schema
 *   enforces consistency so that contradictory data cannot be submitted.
 */
export const teacherAttendanceSchema = Yup.object({
  teacher:      objectId('Teacher'),
  schedule:     objectId('Schedule'),
  schoolCampus: objectId('Campus'),
  subject:      objectId('Subject'),
  class:        objectId('Class'),
  recordedBy:   objectId('Recorder'),

  status: Yup.boolean().required('Attendance status is required'),

  attendanceDate: Yup.date()
    .typeError('Attendance date must be a valid date')
    .required('Attendance date is required')
    .max(new Date(), 'Attendance date cannot be in the future'),

  sessionStartTime: Yup.string()
    .matches(TIME_REGEX, 'Start time must be in HH:mm format')
    .nullable()
    .default(null),

  sessionEndTime: sessionEndTimeField,

  academicYear: Yup.string()
    .matches(ACADEMIC_YEAR_REGEX, 'Academic year must be in YYYY-YYYY format (e.g. 2024-2025)')
    .required('Academic year is required'),

  semester: Yup.string()
    .oneOf(SEMESTER, 'Semester must be S1, S2, or Annual')
    .required('Semester is required'),

  arrivalTime: Yup.string()
    .matches(TIME_REGEX, 'Arrival time must be in HH:mm format')
    .nullable()
    .default(null),

  // isLate must be consistent with arrivalTime vs sessionStartTime
  isLate: Yup.boolean()
    .default(false)
    .test(
      'late-consistent-with-arrival',
      'isLate must match whether arrival time is after session start time',
      function (value) {
        const { arrivalTime, sessionStartTime } = this.parent;
        // Cannot be late and absent simultaneously
        if (value === true && this.parent.status === false) return false;
        // When both times are available, enforce consistency
        if (arrivalTime && sessionStartTime) {
          return (arrivalTime > sessionStartTime) === value;
        }
        return true;
      }
    ),

  remarks: Yup.string()
    .trim()
    .max(500, 'Remarks must not exceed 500 characters')
    .nullable()
    .default(null),

  hasReplacement: Yup.boolean().default(false),

  replacementTeacher: optionalObjectId('Replacement teacher')
    .when('hasReplacement', {
      is:   true,
      then: (s) =>
        s
          .matches(OBJECT_ID_REGEX, 'Replacement teacher must be a valid identifier')
          .required('Replacement teacher is required when a replacement is indicated'),
    }),

  replacementNotes: Yup.string()
    .trim()
    .max(300, 'Replacement notes must not exceed 300 characters')
    .nullable()
    .default(null),
});

// ─── BULK RECORDING SCHEMA ────────────────────────────────────────────────────

/**
 * Single entry in a bulk teacher-attendance batch.
 * Includes the full hasReplacement → replacementTeacher conditional
 * that was missing from the original version.
 */
const teacherAttendanceEntrySchema = Yup.object({
  teacherId:        objectId('Teacher'),
  scheduleId:       objectId('Schedule'),

  status:           Yup.boolean().required('Status is required'),

  isLate: Yup.boolean()
    .default(false)
    .test(
      'late-consistent-with-arrival',
      'isLate must match whether arrival time is after session start time',
      function (value) {
        const { arrivalTime, sessionStartTime } = this.parent;
        if (value === true && this.parent.status === false) return false;
        if (arrivalTime && sessionStartTime) {
          return (arrivalTime > sessionStartTime) === value;
        }
        return true;
      }
    ),

  arrivalTime: Yup.string()
    .matches(TIME_REGEX, 'Arrival time must be in HH:mm format')
    .nullable()
    .default(null),

  // hasReplacement → replacementTeacher required (matches main schema)
  hasReplacement: Yup.boolean().default(false),

  replacementTeacher: optionalObjectId('Replacement teacher')
    .when('hasReplacement', {
      is:   true,
      then: (s) =>
        s
          .matches(OBJECT_ID_REGEX, 'Replacement teacher must be a valid identifier')
          .required('Replacement teacher is required when a replacement is indicated'),
    }),

  replacementNotes: Yup.string().trim().max(300).nullable().default(null),
  remarks:          Yup.string().trim().max(500).nullable().default(null),
});

export const bulkTeacherAttendanceSchema = Yup.object({
  schoolCampus:     objectId('Campus'),
  subjectId:        objectId('Subject'),
  classId:          objectId('Class'),
  recordedBy:       objectId('Recorder'),

  attendanceDate: Yup.date()
    .typeError('Attendance date must be a valid date')
    .required('Attendance date is required')
    .max(new Date(), 'Attendance date cannot be in the future'),

  academicYear: Yup.string()
    .matches(ACADEMIC_YEAR_REGEX, 'Invalid academic year format')
    .required('Academic year is required'),

  semester: Yup.string()
    .oneOf(SEMESTER, 'Invalid semester')
    .required('Semester is required'),

  sessionStartTime: Yup.string()
    .matches(TIME_REGEX, 'Start time must be in HH:mm format')
    .nullable()
    .default(null),

  sessionEndTime: sessionEndTimeField,

  entries: Yup.array()
    .of(teacherAttendanceEntrySchema)
    .min(1, 'At least one teacher attendance entry is required')
    .required('Entries are required'),
});

// ─── JUSTIFICATION SCHEMA ─────────────────────────────────────────────────────

export const teacherJustificationSchema = Yup.object({
  justification: Yup.string()
    .trim()
    .min(10, 'Justification must be at least 10 characters')
    .max(500, 'Justification must not exceed 500 characters')
    .required('Justification text is required'),
  justificationDocument: Yup.string()
    .url('Document URL must be a valid URL')
    .nullable()
    .default(null),
  justifiedBy: objectId('Reviewer'),
});

// ─── PAYMENT SCHEMA ───────────────────────────────────────────────────────────

export const markSessionPaidSchema = Yup.object({
  paymentRef: Yup.string()
    .trim()
    .matches(PAYMENT_REF_REGEX, 'Payment reference must be 3–50 characters (A–Z, 0–9, -, _)')
    .required('Payment reference is required'),
});

// ─── STATUS TOGGLE SCHEMA ─────────────────────────────────────────────────────

export const toggleTeacherAttendanceStatusSchema = Yup.object({
  status:  Yup.boolean().required('New attendance status is required'),
  userId:  objectId('User'),
  remarks: Yup.string().trim().max(500).nullable().default(null),
});

export default teacherAttendanceSchema;