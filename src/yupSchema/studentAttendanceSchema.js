'use strict';

/**
 * @file studentAttendanceSchema.js
 * @description Yup validation schemas for student attendance forms.
 *              Mirrors the constraints defined in studentAttend.model.js.
 */

import * as Yup from 'yup';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const SEMESTER = ['S1', 'S2', 'Annual'];

const OBJECT_ID_REGEX    = /^[a-f\d]{24}$/i;
const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{4}$/;
const TIME_REGEX          = /^([01]\d|2[0-3]):([0-5]\d)$/;

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

// ─── MAIN SCHEMA ──────────────────────────────────────────────────────────────

/**
 * Schema for recording a single student attendance entry.
 *
 * Business rule: a student cannot be marked as late (isLate: true) while
 * simultaneously being absent (status: false). A late student is present.
 */
export const studentAttendanceSchema = Yup.object({
  student:      objectId('Student'),
  schedule:     objectId('Schedule'),
  class:        objectId('Class'),
  schoolCampus: objectId('Campus'),
  subject:      objectId('Subject'),
  recordedBy:   objectId('Recorder'),

  // true = present, false = absent
  status: Yup.boolean().required('Attendance status is required'),

  attendanceDate: Yup.date()
    .typeError('Attendance date must be a valid date')
    .required('Attendance date is required')
    .max(new Date(), 'Attendance date cannot be in the future'),

  sessionStartTime: Yup.string()
    .matches(TIME_REGEX, 'Start time must be in HH:mm format')
    .nullable()
    .default(null),

  // End time must be after start time when both are provided
  sessionEndTime: Yup.string()
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
    ),

  academicYear: Yup.string()
    .matches(ACADEMIC_YEAR_REGEX, 'Academic year must be in YYYY-YYYY format (e.g. 2024-2025)')
    .required('Academic year is required'),

  semester: Yup.string()
    .oneOf(SEMESTER, 'Semester must be S1, S2, or Annual')
    .required('Semester is required'),

  // isLate can only be true when the student is present (status: true)
  isLate: Yup.boolean()
    .default(false)
    .test(
      'late-requires-present',
      'A student cannot be late and absent at the same time',
      function (value) {
        if (value === true && this.parent.status === false) return false;
        return true;
      }
    ),

  remarks: Yup.string()
    .trim()
    .max(500, 'Remarks must not exceed 500 characters')
    .nullable()
    .default(null),
});

// ─── BULK / ROLL-CALL SCHEMA ──────────────────────────────────────────────────

/**
 * Single entry within a bulk roll-call submission.
 * Carries the same isLate / status cross-validation as the individual schema.
 */
const rollCallEntrySchema = Yup.object({
  studentId: objectId('Student'),

  status: Yup.boolean().required('Attendance status is required'),

  isLate: Yup.boolean()
    .default(false)
    .test(
      'late-requires-present',
      'A student cannot be late and absent at the same time',
      function (value) {
        if (value === true && this.parent.status === false) return false;
        return true;
      }
    ),

  remarks: Yup.string().trim().max(500).nullable().default(null),
});

/**
 * Bulk roll-call schema — one API call per session.
 *
 * academicYear and semester are kept here intentionally: they are
 * denormalised for performance and audit purposes, consistent with the model.
 * The controller must verify they match the referenced schedule document.
 */
export const bulkStudentAttendanceSchema = Yup.object({
  scheduleId:    objectId('Schedule'),
  classId:       objectId('Class'),
  schoolCampus:  objectId('Campus'),
  subjectId:     objectId('Subject'),
  recordedBy:    objectId('Recorder'),

  attendanceDate: Yup.date()
    .typeError('Attendance date must be a valid date')
    .required('Attendance date is required')
    .max(new Date(), 'Attendance date cannot be in the future'),

  academicYear: Yup.string()
    .matches(ACADEMIC_YEAR_REGEX, 'Academic year must be in YYYY-YYYY format')
    .required('Academic year is required'),

  semester: Yup.string()
    .oneOf(SEMESTER, 'Invalid semester')
    .required('Semester is required'),

  sessionStartTime: Yup.string()
    .matches(TIME_REGEX, 'Start time must be in HH:mm format')
    .nullable()
    .default(null),

  sessionEndTime: Yup.string()
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
    ),

  entries: Yup.array()
    .of(rollCallEntrySchema)
    .min(1, 'At least one attendance entry is required')
    .required('Attendance entries are required'),
});

// ─── JUSTIFICATION SCHEMA ─────────────────────────────────────────────────────

export const studentJustificationSchema = Yup.object({
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

// ─── STATUS TOGGLE SCHEMA ─────────────────────────────────────────────────────

export const toggleAttendanceStatusSchema = Yup.object({
  status:  Yup.boolean().required('New attendance status is required'),
  userId:  objectId('User'),
  remarks: Yup.string().trim().max(500).nullable().default(null),
});

export default studentAttendanceSchema;