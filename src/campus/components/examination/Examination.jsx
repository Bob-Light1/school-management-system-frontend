/**
 * @file Examination.jsx
 * @description Examination module entry point — renders the correct view based on user role.
 *
 * Role mapping:
 *  CAMPUS_MANAGER / ADMIN / DIRECTOR → ExaminationManager
 *  TEACHER                           → ExamTeacher
 *  STUDENT                           → ExamStudent
 */

import { useContext } from 'react';
import { Box, Alert } from '@mui/material';
import { AuthContext } from '../../../context/AuthContext';

import ExaminationManager from './ExaminationManager';
import ExamTeacher from '../../../teacher/components/examination/ExamTeacher';
import ExamStudent from '../../../student/components/examination/ExamStudent';

const ROLE_COMPONENTS = {
  CAMPUS_MANAGER: ExaminationManager,
  ADMIN:          ExaminationManager,
  DIRECTOR:       ExaminationManager,
  TEACHER:        ExamTeacher,
  STUDENT:        ExamStudent,
};

const Examination = () => {
  const { getUserRole } = useContext(AuthContext);
  const role = getUserRole();
  const Component = ROLE_COMPONENTS[role];

  if (!Component) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Access denied. Your role ({role || 'unknown'}) does not have access to examination.
        </Alert>
      </Box>
    );
  }

  return <Component />;
};

export default Examination;
