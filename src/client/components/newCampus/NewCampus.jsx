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
import { createCampusSchema } from '../../../yupSchema/createCampusSchema';
import UploadCampusImage from '../../utility-components/uploadImage/UploadCampusImage';
import axios from 'axios';

export default function CampusForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [imageResetKey, setImageResetKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  });

  // useFormik
  const formik = useFormik({
    initialValues: {
      campus_name: '',
      manager_name: '',
      email: '',
      password: '',
      confirm_password: '',
      image: null,
    },
    validationSchema: createCampusSchema,
    onSubmit: async (values) => {
      // Validation: Check if image is selected
      if (!values.image) {
        setSnackbar({
          open: true,
          message: 'Please select a campus image',
          severity: 'warning',
        });
        return;
      }

      setIsLoading(true);

      try {
        console.log('Submit values:', values);

        // Create FormData
        const fd = new FormData();
        fd.append('campus_name', values.campus_name);
        fd.append('manager_name', values.manager_name);
        fd.append('email', values.email);
        fd.append('password', values.password);
        fd.append('image', values.image, values.image.name);

        // Send request
        const response = await axios.post(
          'http://localhost:5000/api/campus/create',
          fd,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        console.log('Response:', response.data);

        // Show success message
        setSnackbar({
          open: true,
          message: 'Campus created successfully!',
          severity: 'success',
        });

        // Reset form only on success
        formik.resetForm();
        setImageResetKey((prev) => prev + 1);
      } catch (error) {
        console.error('Submission error:', error);

        // Extract error message
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'An error occurred while creating the campus';

        // Show error message
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

  const handleImageChange = (file) => {
    formik.setFieldValue('image', file);
  };

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
                Create Campus
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Setup a new campus and assign a manager
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                {/* Campus name */}
                <Grid size={12}>
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.campus_name &&
                      Boolean(formik.errors.campus_name)
                    }
                  >
                    <InputLabel>Campus name</InputLabel>
                    <OutlinedInput
                      name="campus_name"
                      label="Campus name"
                      value={formik.values.campus_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={isLoading}
                      startAdornment={
                        <InputAdornment position="start">🏫</InputAdornment>
                      }
                    />
                    {formik.touched.campus_name &&
                      formik.errors.campus_name && (
                        <FormHelperText>
                          {formik.errors.campus_name}
                        </FormHelperText>
                      )}
                  </FormControl>
                </Grid>

                {/* Manager name */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.manager_name &&
                      Boolean(formik.errors.manager_name)
                    }
                  >
                    <InputLabel>Manager name</InputLabel>
                    <OutlinedInput
                      name="manager_name"
                      label="Manager name"
                      value={formik.values.manager_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={isLoading}
                      startAdornment={
                        <InputAdornment position="start">👤</InputAdornment>
                      }
                    />
                    {formik.touched.manager_name &&
                      formik.errors.manager_name && (
                        <FormHelperText>
                          {formik.errors.manager_name}
                        </FormHelperText>
                      )}
                  </FormControl>
                </Grid>

                {/* Manager email */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl
                    fullWidth
                    error={
                      formik.touched.email && Boolean(formik.errors.email)
                    }
                  >
                    <InputLabel>Manager email</InputLabel>
                    <OutlinedInput
                      type="email"
                      name="email"
                      label="Manager email"
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

                {/* Confirm password */}
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

                {/* Campus Image */}
                <UploadCampusImage
                  key={imageResetKey}
                  onImageChange={handleImageChange}
                  disabled={isLoading}
                />

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
                        <span>Creating campus...</span>
                      </Box>
                    ) : (
                      'Create campus'
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