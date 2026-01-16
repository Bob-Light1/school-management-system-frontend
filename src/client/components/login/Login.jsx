import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import {
  Box, 
  IconButton, 
  InputLabel, 
  InputAdornment, 
  FormControl, 
  OutlinedInput, 
  CircularProgress, 
  Typography,
  Button, 
  FormHelperText, 
  Snackbar, 
  Alert, 
  Paper, 
  Stack, 
  Divider
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import { loginSchema } from '../../../yupSchema/loginSchema';
import { useAuth } from '../../../hooks/useAuth';
import '../../styles/animatedBackground.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await login({ email: values.email, password: values.password });
        setSnackbar({ open: true, message: 'welcome ! Connected successfully.', severity: 'success' });
        setTimeout(() => navigate('/campus'), 1200);
      } catch (error) {
        const errorMessage = error.message || 'Failed to connect. Verify your credentials.';
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 2, 
        position: 'relative',
        overflow: 'hidden'
      }}
      className="animated-background"
    >

      {/* Bubbles */}
      <Box className="bubbles">
        <span className="bubble b1" />
        <span className="bubble b2" />
        <span className="bubble b3" />
        <span className="bubble b4" />
      </Box>

      <Paper elevation={20} sx={{ 
        display: 'flex', 
        width: '100%', 
        maxWidth: 1000, 
        borderRadius: 6, 
        overflow: 'hidden',
        minHeight: 600,
        zIndex: 2,
        position: 'relative',
        backdropFilter: 'blur(10px)', // Glass effect on the form
       backgroundColor: 'rgba(255,255,255,0.9)'
      }}>
        
        {/* Left part : hide on mobile devices */}
        <Box sx={{ 
          flex: 1, 
          display: { xs: 'none', md: 'flex' }, 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(45deg, #4989c8 30%, #3a6fa8 90%)',
          color: 'white',
          p: 6,
          textAlign: 'center'
        }}>
         <Typography variant="h3" fontWeight="800" gutterBottom>
            wewigo
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300, mb: 4 }}>
            The excellent platform for managing your campuses.
        </Typography>
        <Box component="img" 
            src="vite.svg" // Optional: add an illustration
            sx={{ width: '80%', maxWidth: 300, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }} 
        />
        </Box>

        {/* Right Side: Form */}
        <Box sx={{ flex: 1, p: { xs: 4, sm: 8 }, bgcolor: 'white' }}>
            <Stack spacing={1} sx={{ mb: 5 }}>
                <Typography variant="h4" fontWeight="800" color="text.primary">
                    Login
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Happy to see you again!
                </Typography>
            </Stack>

          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={3}>
              <FormControl fullWidth error={formik.touched.email && Boolean(formik.errors.email)}>
                <InputLabel>Email</InputLabel>
                <OutlinedInput
                  name="email"
                  label="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  startAdornment={
                    <InputAdornment position="start">
                      <MailOutlineIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  }
                  sx={{ borderRadius: 3 }}
                />
                {formik.touched.email && <FormHelperText>{formik.errors.email}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth error={formik.touched.password && Boolean(formik.errors.password)}>
                <InputLabel>password</InputLabel>
                <OutlinedInput
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  label="Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  sx={{ borderRadius: 3 }}
                  startAdornment={
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: 'action.active' }} />
                    </InputAdornment>
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {formik.touched.password && <FormHelperText>{formik.errors.password}</FormHelperText>}
              </FormControl>

              <Button
                type="submit"
                fullWidth
                size="large"
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.8,
                  borderRadius: 3,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  textTransform: 'none',
                  boxShadow: '0 8px 16px rgba(73, 137, 200, 0.24)',
                  backgroundColor: '#4989c8',
                  '&:hover': { backgroundColor: '#3a6fa8', boxShadow: '0 12px 20px rgba(73, 137, 200, 0.35)' },
                }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : "Connect To Dashboard"}
              </Button>
            </Stack>
          </form>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
             <Typography variant="body2" color="text.secondary">
               Need Help ? <a href="#" style={{ color: '#4989c8', fontWeight: 600, textDecoration: 'none' }}>Contact Support</a>
             </Typography>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}