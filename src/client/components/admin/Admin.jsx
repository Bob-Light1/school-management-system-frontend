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
import axios from 'axios';
import { API_BASE_URL } from '../../../config/env';
import { createAdminSchema } from '../../../yupSchema/createAdminSchema';

export default function Admin() {
  const [showPassword, setShowPassword] = useState(false);
  const [imageResetKey, setImageResetKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  });

  // useFormik hook for form management
  const formik = useFormik({
    initialValues: {
      admin_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
    validationSchema: createAdminSchema,
    onSubmit: async (values) => {

      setIsLoading(true);

      try {
        
        // Create FormData for multipart/form-data request
        const fd = new FormData();
        fd.append('admin_name', values.admin_name);
        fd.append('email', values.email);
        fd.append('password', values.password);

        // Send POST request to create admin
        const response = await axios.post(
          `${API_BASE_URL}/admin/create`,
          fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        console.log('Response:', response.data);

        // Show success notification
        setSnackbar({
          open: true,
          message: 'admin created successfully!',
          severity: 'success',
        });

        // Reset form only on success
        formik.resetForm();
        
      } catch (error) {
        console.error('Submission error:', error);

        // Extract error message from response
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'An error occurred while creating the admin';

        // Show error notification
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
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
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={0} // Remove default shadow
          sx={{
            width: '100%',
            borderRadius: 6,
            // Glassmorphism effect (frosted glass)
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            px: { xs: 2, sm: 3 },
            py: 3,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          }}
        >
          <CardContent>
            {/* Header with Institute Logo */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
              <Typography variant="h5" fontWeight="900" sx={{ color: '#003366' }}>
                Create admin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Setup a new admin and assign a manager
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                {/* admin name field */}
                <Grid size={12}>
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.admin_name &&
                      Boolean(formik.errors.admin_name)
                    }
                  >
                    <InputLabel>admin name</InputLabel>
                    <OutlinedInput
                      name="admin_name"
                      label="admin name"
                      value={formik.values.admin_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={isLoading}
                      startAdornment={
                        <InputAdornment position="start">🏫</InputAdornment>
                      }
                    />
                    {formik.touched.admin_name &&
                      formik.errors.admin_name && (
                        <FormHelperText>
                          {formik.errors.admin_name}
                        </FormHelperText>
                      )}
                  </FormControl>
                </Grid>

               

                {/* Email field */}
                <Grid size={{ xs: 12 }}>
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.email && Boolean(formik.errors.email)
                    }
                  >
                    <InputLabel>Admin email</InputLabel>
                    <OutlinedInput
                      type="email"
                      name="email"
                      label="Admin Email"
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

                {/* Password field */}
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

                {/* Confirm password field */}
                <Grid size={12}>
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.confirm_password &&
                      Boolean(formik.errors.confirm_password)
                    }
                  >
                    <InputLabel>Confirm password</InputLabel>
                    <OutlinedInput
                      type={showPassword ? 'text' : 'password'}
                      name="confirm_password"
                      label="Confirm Password"
                      value={formik.values.confirm_password}
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
                    {formik.touched.confirm_password &&
                      formik.errors.confirm_password && (
                        <FormHelperText>
                          {formik.errors.confirm_password}
                        </FormHelperText>
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
                      py: 1.5,
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      // Blue gradient matching the theme
                      background: 'linear-gradient(45deg, #0077be 30%, #00a8cc 90%)',
                      boxShadow: '0 4px 15px rgba(0, 119, 190, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #005f99 30%, #008eb0 90%)',
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
                        <span>Creating admin...</span>
                      </Box>
                    ) : (
                      'Create admin'
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Snackbar Notification for success/error messages */}
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
    </Box>
  );
}