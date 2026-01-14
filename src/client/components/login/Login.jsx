import * as React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CircularProgress from '@mui/material/CircularProgress';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import {
  Card,
  CardContent,
  Container,
  Typography,
  Grid,
  Button,
  FormHelperText,
  Snackbar,
  Alert,
} from '@mui/material';
import { useFormik } from 'formik';
import { loginSchema } from '../../../yupSchema/loginSchema';
import { useAuth } from '../../../hooks/useAuth';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  
  const navigate = useNavigate();
  const { login } = useAuth();

  // useFormik
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      setIsLoading(true);

      try {
        console.log('📤 Submit values:', values);

        // Send JSON data (NOT FormData)
        await login({
          email: values.email,
          password: values.password,
        });

        // Show success message
        setSnackbar({
          open: true,
          message: 'Login successful!',
          severity: 'success',
        });

        // Redirect to dashboard after 1 second
        setTimeout(() => {
          navigate('/campus');
        }, 1000);

      } catch (error) {
        console.error('❌ Submission error:', error);

        // Handle rate limiting (429)
        if (error.response?.status === 429) {
          const retryAfter = error.response.data.retryAfter || 900; // 15 min default
          const minutes = Math.ceil(retryAfter / 60);

          setSnackbar({
            open: true,
            message: `Too many login attempts. Please wait ${minutes} minute(s) before trying again.`,
            severity: 'error',
          });
        } else {
          // Extract error message
          const errorMessage =
            error.message ||
            error.response?.data?.message ||
            'Login failed. Please check your credentials.';

          setSnackbar({
            open: true,
            message: errorMessage,
            severity: 'error',
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Container
        maxWidth="sm"
        sx={{
          minHeight: '75vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 4,
        }}
      >
        <Card
          elevation={6}
          sx={{
            width: '100%',
            borderRadius: 4,
            px: { xs: 2, sm: 3 },
            py: 3,
          }}
        >
          <CardContent>
            {/* Header */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="bold">
                Sign In
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in with your email and password
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                {/* Email */}
                <Grid size={12}>
                  <FormControl
                    fullWidth
                    error={formik.touched.email && Boolean(formik.errors.email)}
                  >
                    <InputLabel>Email</InputLabel>
                    <OutlinedInput
                      type="email"
                      name="email"
                      label="Email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={isLoading}
                      startAdornment={
                        <InputAdornment position="start">📧</InputAdornment>
                      }
                    />
                    {formik.touched.email && formik.errors.email && (
                      <FormHelperText>{formik.errors.email}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Password */}
                <Grid size={12}>
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.password && Boolean(formik.errors.password)
                    }
                  >
                    <InputLabel>Password</InputLabel>
                    <OutlinedInput
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      label="Password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={isLoading}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            edge="end"
                            disabled={isLoading}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                    {formik.touched.password && formik.errors.password && (
                      <FormHelperText>{formik.errors.password}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Submit Button */}
                <Grid size={12}>
                  <Button
                    type="submit"
                    fullWidth
                    size="large"
                    variant="contained"
                    disabled={formik.isSubmitting || isLoading}
                    sx={{
                      mt: 2,
                      py: 1.3,
                      borderRadius: 2,
                      fontWeight: 'bold',
                      backgroundColor: '#4989c8',
                      '&:hover': {
                        backgroundColor: '#3a6fa8',
                      },
                      '&:disabled': {
                        backgroundColor: '#cccccc',
                      },
                    }}
                  >
                    {isLoading ? (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <CircularProgress size={20} color="inherit" />
                        <span>Signing in...</span>
                      </Box>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}