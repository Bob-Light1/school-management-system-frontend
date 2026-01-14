import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../src/routes/ProtectedRoute';
import CssBaseline from '@mui/material/CssBaseline';
import { GlobalStyles } from '@mui/material';
import { campusRoutes } from './routes/CampusRoutes';
import { partnerRoutes } from './routes/PartnerRoutes';
import { parentRoutes } from './routes/ParentRoutes';
import { studentRoutes } from './routes/StudentRoutes';
import { clientRoutes } from './routes/ClientRoutes';
import { teacherRoutes } from './routes/TeacherRoutes';
import { lazy } from 'react';


const Campus = lazy(() => import('../src/campus/Campus'));
const Teacher = lazy(() => import('../src/teacher/Teacher'));
const Student = lazy(() => import('../src/student/Student'));
const Parent = lazy(() => import('../src/parent/Parent'));
const Partner = lazy(() => import('../src/partner/Partner'));



function App() {
  return (
    <>
      <CssBaseline />
      <GlobalStyles styles={{
        'html, body': {
          margin: 0,
          padding: 0,
          scrollbarWidth: 'none',       /* Firefox */
          msOverflowStyle: 'none',     /* IE/Edge */
        },
        'body::-webkit-scrollbar': {
          display: 'none',             /* Chrome, Safari, Opera */
        },
        '#root': {
          margin: 0,
          padding: 0,
        }
      }} />

      <Routes>
        {/* CLient Routes - public */}
          {clientRoutes}

        {/* Campus Routes - protected */}
        <Route element={<ProtectedRoute allowedRoles={['CAMPUS_MANAGER', 'DIRECTOR']} />}>
          <Route path="campus" element={<Campus />}>
            {campusRoutes}
          </Route>
        </Route>

        {/* Teacher Routes - protected */}
        <Route element={<ProtectedRoute allowedRoles={['TEACHER']} />}>
          <Route path="teacher" element={<Teacher />}>
            {teacherRoutes}
          </Route>
        </Route>

        {/* Student Routes - protected */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="student" element={<Student />}>
            {studentRoutes}
          </Route>
        </Route>

        {/* Parent Routes - protected */}
        <Route element={<ProtectedRoute allowedRoles={['PARENT']} />}>
          <Route path="parent" element={<Parent />}>
            {parentRoutes}
          </Route>
        </Route>

        {/* Parent Routes - protected */}
        <Route element={<ProtectedRoute allowedRoles={['PARTNER']} />}>
          <Route path="partner" element={<Partner />}>
            {partnerRoutes}
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
