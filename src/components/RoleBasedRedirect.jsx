import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

function RoleBasedRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
     <Loader />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user.role) {
    case 'DIRECTOR':
      return <Navigate to="/admin" replace />;
    case 'MANAGER_CAMPUS':
      return <Navigate to="/campus" replace />;
    case 'TEACHER':
      return <Navigate to="/teacher" replace />;
    case 'STUDENT':
      return <Navigate to="/student" replace />;
    case 'PARENT':
      return <Navigate to="/parent" replace />;
    case 'PARTNER':
      return <Navigate to="/partner" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}

export default RoleBasedRedirect;