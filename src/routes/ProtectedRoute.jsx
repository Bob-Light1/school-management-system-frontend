import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Box, Typography, Button } from '@mui/material';
import Loader from '../components/Loader';

/**
 * Protected route with authentication and role verification
 * @param {Array} allowedRoles - List of allowed roles (optional)
 * @param {string} redirectTo - Redirect path if not authenticated
 */
function ProtectedRoute({ allowedRoles = [], redirectTo = '/login' }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Display loading during verification
  if (loading) {
    return <Loader fullScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location }} // Allow to come back after login
      />
    );
  }

  // Check role if allowedRoles is specified
  if (allowedRoles.length > 0) {
    const userRole = user.role;

    if (!allowedRoles.includes(userRole)) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            gap: 2,
            p: 3,
          }}
        >
          <Typography variant="h4" color="error" fontWeight="bold">
            🚫 Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            You don't have permission to access this page.
          </Typography>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Required role(s): <strong>{allowedRoles.join(', ')}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your role: <strong>{userRole}</strong>
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => window.history.back()}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Box>
      );
    }
  }

  // Everything is OK - render nested routes
  return <Outlet />;
}

export default ProtectedRoute;