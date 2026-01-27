import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
  Grid,
  Button,
  Snackbar,
  Alert,
  IconButton,
  InputLabel,
  InputAdornment,
  FormControl,
  OutlinedInput,
  FormHelperText,
  CircularProgress,
  Divider,
  Paper,
  Fade,
  Zoom,
  Stepper,
  Step,
  StepLabel,
  alpha,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Business,
  Person,
  Email,
  Phone,
  Lock,
  LocationOn,
  PhotoCamera,
  CheckCircle,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { createCampusSchema } from '../../../yupSchema/createCampusSchema';
import UploadCampusImage from '../../utility-components/uploadImage/UploadCampusImage';
import axios from 'axios';
import { API_BASE_URL } from '../../../config/env';

export default function NewCampus() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [showPassword, setShowPassword] = useState(false);
  const [imageResetKey, setImageResetKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const steps = ['Campus Information', 'Manager Details', 'Location & Image'];

  // Formik setup
  const formik = useFormik({
    initialValues: {
      campus_name: '',
      campus_number: '',
      manager_name: '',
      manager_phone: '',
      email: '',
      password: '',
      confirm_password: '',
      campus_image: null,
      location: {
        address: '',
        city: '',
        country: 'Cameroun',
        coordinates: {
          lat: null,
          lng: null,
        },
      },
    },
    validationSchema: createCampusSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      if (!values.campus_image) {
        setSnackbar({
          open: true,
          message: 'Please select a campus image',
          severity: 'warning',
        });
        return;
      }

      setIsLoading(true);

      try {
        const formData = new FormData();
        formData.append('campus_name', values.campus_name);
        formData.append('manager_name', values.manager_name);
        formData.append('email', values.email);
        formData.append('password', values.password);
        formData.append('phone', values.manager_phone);
        
        if (values.campus_number) {
          formData.append('campus_number', values.campus_number);
        }

        if (values.campus_image instanceof File) {
          formData.append('image', values.campus_image, values.campus_image.name);
        }

        // Location data
        if (values.location.address) {
          formData.append('location[address]', values.location.address);
        }
        if (values.location.city) {
          formData.append('location[city]', values.location.city);
        }
        formData.append('location[country]', values.location.country);

    // Get token
    const token = localStorage.getItem('token');

    // Axios call
    const response = await axios.post(
      `${API_BASE_URL}/campus/create`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      }
    );

        setSnackbar({
          open: true,
          message: '✨ Campus created successfully! Welcome to excellence.',
          severity: 'success',
        });

        // Reset form
        formik.resetForm();
        setImageResetKey((prev) => prev + 1);
        setActiveStep(0);
      } catch (error) {
        console.error('Submission error:', error);

        const errorMessage =
          error.response?.data?.message ||
          'An error occurred while creating the campus';

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
    formik.setFieldValue('campus_image', file);
  };

  const handleNext = () => {
    // Validate current step before moving forward
    const stepFields = [
      ['campus_name', 'campus_number'],
      ['manager_name', 'manager_phone', 'email', 'password', 'confirm_password'],
      ['campus_image'],
    ];

    const fieldsToValidate = stepFields[activeStep];
    const hasErrors = fieldsToValidate.some(
      (field) => formik.touched[field] && formik.errors[field]
    );

    if (hasErrors) {
      // Touch all fields in current step to show errors
      fieldsToValidate.forEach((field) => formik.setFieldTouched(field, true));
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Step content renderer
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Grid container spacing={3}>
              <Grid size = {{xs: 12}}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    background: 'linear-gradient(45deg, #0077be 30%, #00a8cc 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2,
                  }}
                >
                  Campus Information
                </Typography>
              </Grid>

              <Grid size = {{xs: 12}}>
                <FormControl
                  fullWidth
                  error={formik.touched.campus_name && Boolean(formik.errors.campus_name)}
                >
                  <InputLabel htmlFor="campus_name">Campus Name *</InputLabel>
                  <OutlinedInput
                    id='campus_name'
                    name="campus_name"
                    label="Campus Name *"
                    value={formik.values.campus_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading}
                    startAdornment={
                      <InputAdornment position="start">
                        <Business sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderWidth: 2,
                      },
                    }}
                  />
                  {formik.touched.campus_name && formik.errors.campus_name && (
                    <FormHelperText>{formik.errors.campus_name}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid size = {{xs: 12}}>
                <FormControl
                  fullWidth
                  error={formik.touched.campus_number && Boolean(formik.errors.campus_number)}
                >
                  <InputLabel htmlFor="campus_number">Campus Number (Optional)</InputLabel>
                  <OutlinedInput
                    id='campus_number'
                    name="campus_number"
                    label="Campus Code (Optional)"
                    value={formik.values.campus_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading}
                    startAdornment={
                      <InputAdornment position="start">
                        <Business sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    }
                    sx={{ borderRadius: 2 }}
                  />
                  {formik.touched.campus_number && formik.errors.campus_number && (
                    <FormHelperText>{formik.errors.campus_number}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Fade>
        );

      case 1:
        return (
          <Fade in timeout={500}>
            <Grid container spacing={3}>
              <Grid size = {{xs: 12}}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    background: 'linear-gradient(45deg, #0077be 30%, #00a8cc 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2,
                  }}
                >
                  Manager Details
                </Typography>
              </Grid>

              <Grid size = {{xs: 12}}>
                <FormControl
                  fullWidth
                  error={formik.touched.manager_name && Boolean(formik.errors.manager_name)}
                >
                  <InputLabel htmlFor="manager_name">Manager Full Name *</InputLabel>
                  <OutlinedInput
                    id='manager_name'
                    name="manager_name"
                    label="Manager Full Name *"
                    value={formik.values.manager_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading}
                    startAdornment={
                      <InputAdornment position="start">
                        <Person sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    }
                    sx={{ borderRadius: 2 }}
                  />
                  {formik.touched.manager_name && formik.errors.manager_name && (
                    <FormHelperText>{formik.errors.manager_name}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid size = {{xs: 12, sm: 6}}>
                <FormControl
                  fullWidth
                  error={formik.touched.email && Boolean(formik.errors.email)}
                >
                  <InputLabel htmlFor="email">Email Address *</InputLabel>
                  <OutlinedInput
                    type="email"
                    id='email'
                    name="email"
                    label="Email Address *"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading}
                    startAdornment={
                      <InputAdornment position="start">
                        <Email sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    }
                    sx={{ borderRadius: 2 }}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <FormHelperText>{formik.errors.email}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid size = {{xs: 12, sm: 6}}>
                <FormControl
                  fullWidth
                  error={formik.touched.manager_phone && Boolean(formik.errors.manager_phone)}
                >
                  <InputLabel htmlFor="manager_phone">Phone Number *</InputLabel>
                  <OutlinedInput
                    id='manager_phone'
                    name="manager_phone"
                    label="Phone Number *"
                    value={formik.values.manager_phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading}
                    startAdornment={
                      <InputAdornment position="start">
                        <Phone sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    }
                    sx={{ borderRadius: 2 }}
                  />
                  {formik.touched.manager_phone && formik.errors.manager_phone && (
                    <FormHelperText>{formik.errors.manager_phone}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid size = {{xs: 12}}>
                <FormControl
                  fullWidth
                  error={formik.touched.password && Boolean(formik.errors.password)}
                >
                  <InputLabel htmlFor="password">Password *</InputLabel>
                  <OutlinedInput
                    type={showPassword ? 'text' : 'password'}
                    id='password'
                    name="password"
                    label="Password *"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading}
                    startAdornment={
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    sx={{ borderRadius: 2 }}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <FormHelperText>{formik.errors.password}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid size = {{xs: 12}}>
                <FormControl
                  fullWidth
                  error={
                    formik.touched.confirm_password && Boolean(formik.errors.confirm_password)
                  }
                >
                  <InputLabel htmlFor="confirm_password">Confirm Password *</InputLabel>
                  <OutlinedInput
                    type={showPassword ? 'text' : 'password'}
                    id='confirm_password'
                    name="confirm_password"
                    label="Confirm Password *"
                    value={formik.values.confirm_password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading}
                    startAdornment={
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    }
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={isLoading}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    sx={{ borderRadius: 2 }}
                  />
                  {formik.touched.confirm_password && formik.errors.confirm_password && (
                    <FormHelperText>{formik.errors.confirm_password}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Fade>
        );

      case 2:
        return (
          <Fade in timeout={500}>
            <Grid container spacing={3}>
              <Grid size = {{xs: 12}}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{
                    background: 'linear-gradient(45deg, #0077be 30%, #00a8cc 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 2,
                  }}
                >
                  Location & Campus Image
                </Typography>
              </Grid>

              <Grid size = {{xs: 12, sm: 6}}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="location.city">City (Optional)</InputLabel>
                  <OutlinedInput
                    name="location.city"
                    id='location.city'
                    label="City (Optional)"
                    value={formik.values.location.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading}
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOn sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    }
                    sx={{ borderRadius: 2 }}
                  />
                </FormControl>
              </Grid>

              <Grid size = {{xs: 12, sm: 6}}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="location.country">Country</InputLabel>
                  <OutlinedInput
                    name="location.country"
                    id='location.country'
                    label="Country"
                    value={formik.values.location.country}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading}
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOn sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    }
                    sx={{ borderRadius: 2 }}
                  />
                </FormControl>
              </Grid>

              <Grid size = {{xs: 12}}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="location.address">Address (Optional)</InputLabel>
                  <OutlinedInput
                    name="location.address"
                    id='location.address'
                    label="Address (Optional)"
                    value={formik.values.location.address}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isLoading}
                    multiline
                    rows={2}
                    startAdornment={
                      <InputAdornment position="start">
                        <LocationOn sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    }
                    sx={{ borderRadius: 2 }}
                  />
                </FormControl>
              </Grid>

              <Grid size = {{xs: 12}}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: `2px dashed ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhotoCamera sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Campus Image *
                    </Typography>
                  </Box>
                  <UploadCampusImage
                    key={imageResetKey}
                    onImageChange={handleImageChange}
                    disabled={isLoading}
                  />
                </Paper>
              </Grid>
            </Grid>
          </Fade>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,

        // Animated background pattern
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 40%, rgba(255,255,255,0.25) 0%, transparent 55%),
            radial-gradient(circle at 75% 70%, rgba(255,255,255,0.2) 0%, transparent 60%)
          `,
          animation: 'breathe 8s ease-in-out infinite',
        },

        '@keyframes breathe': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.6 },
        },
      }}
    >
      <Container maxWidth="md">
        <Zoom in timeout={500}>
          <Card
            elevation={24}
            sx={{
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #0077be 0%, #00a8cc 100%)',
                color: 'white',
                p: 4,
                textAlign: 'center',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
                  }}
                >
                  <img
                    src="vite.svg"
                    alt="Logo"
                    style={{ width: 50, height: 50, objectFit: 'contain' }}
                  />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight="900" sx={{ mb: 1 }}>
                Create Excellence
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Establish a new campus of distinction
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {/* Stepper */}
              <Stepper
                activeStep={activeStep}
                sx={{
                  mb: 4,
                  '& .MuiStepLabel-root .Mui-completed': {
                    color: 'success.main',
                  },
                  '& .MuiStepLabel-root .Mui-active': {
                    color: 'primary.main',
                  },
                }}
              >
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                     slots={{
                      stepIcon: activeStep > index 
                        ? () => <CheckCircle color="success" /> 
                        : undefined
                    }}
                    >
                      {!isMobile && label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Divider sx={{ mb: 4 }} />

              {/* Form */}
              <Box component="form" onSubmit={formik.handleSubmit}>
                {getStepContent(activeStep)}

                {/* Navigation Buttons */}
                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                  <Button
                    disabled={activeStep === 0 || isLoading}
                    onClick={handleBack}
                    startIcon={<ArrowBack />}
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontWeight: 'bold',
                      textTransform: 'none',
                    }}
                  >
                    Back
                  </Button>

                  <Box sx={{ flex: 1 }} />

                  {activeStep === steps.length - 1 ? (
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      endIcon={
                        isLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <CheckCircle />
                        )
                      }
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        background: 'linear-gradient(45deg, #0077be 30%, #00a8cc 90%)',
                        boxShadow: '0 6px 20px rgba(0, 119, 190, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #005f99 30%, #008eb0 90%)',
                          boxShadow: '0 8px 25px rgba(0, 119, 190, 0.5)',
                        },
                      }}
                    >
                      {isLoading ? 'Creating...' : 'Create Campus'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      variant="contained"
                      endIcon={<ArrowForward />}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        background: 'linear-gradient(45deg, #0077be 30%, #00a8cc 90%)',
                      }}
                    >
                      Next
                    </Button>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Zoom>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        slots={{
          transition: Zoom,
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{
            width: '100%',
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}