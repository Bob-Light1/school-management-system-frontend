import React, { useEffect, useState, useRef } from 'react';
import { 
  Grid, TextField, Button, MenuItem, CircularProgress, 
  InputAdornment, Divider, Typography, Box, Avatar, IconButton,
  Stack, Paper, Snackbar, Alert, useTheme, useMediaQuery, Collapse
} from '@mui/material';
import { 
  Person, Email, Phone, Badge, Lock, School, Domain,
  PhotoCamera, Close, Check, Cancel
} from '@mui/icons-material';
import { useFormik } from 'formik';
import axios from 'axios';
import { createStudentSchema } from '../../../yupSchema/createStudentSchema';
import { API_BASE_URL } from '../../../config/env';
import { useParams } from 'react-router-dom';

const StudentForm = ({ initialData, onSuccess, onCancel }) => {
  const { campusId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef(null);
  
  const [campus, setCampus] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(initialData?.profileImage || null);
  const isEdit = !!initialData;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Load reference data (campus, classes)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCampus, resClasses] = await Promise.all([
          axios.get(`${API_BASE_URL}/campus/${campusId}`, authHeader()),
          axios.get(`${API_BASE_URL}/class`, authHeader()),
        ]);
        
        setCampus(resCampus.data.data || []);
        setClasses(resClasses.data.data || []);

      } catch (err) {
        console.error('Error loading form data:', err);
        showSnackbar('Failed to load form data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [campusId]);

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      schoolCampus: initialData?.schoolCampus?._id || '',
      username: initialData?.username || '',
      phone: initialData?.phone || '',
      gender: initialData?.gender || 'male',
      studentClass: initialData?.studentClass?._id || '',
      password: '',
      dateOfBirth: initialData?.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
      profileImage: null, // File object
    },

    validationSchema: createStudentSchema(isEdit),
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async (values) => {
      setSubmitting(true);

      try {
        const formData = new FormData();
        
        // Append all form values
        Object.keys(values).forEach(key => {
          if (key === 'profileImage') {
            // Handle file separately
            if (values.profileImage instanceof File) {
              formData.append('profileImage', values.profileImage);
            }
          } else if (values[key] !== null && values[key] !== '') {
            if (isEdit && key === 'password' && !values[key]) return;
            formData.append(key, values[key]);
          }
        });

        const config = {
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        };

        if (isEdit) {
          await axios.patch(
            `${API_BASE_URL}/student/${initialData._id}`, 
            formData,
            config
          );
          onSuccess?.('Student updated successfully');
        } else {
          await axios.post(
            `${API_BASE_URL}/student`, 
            formData,
            config
          );
          onSuccess?.('Student created successfully');
          
          // Reset form after successful creation
          formik.resetForm();
          setImagePreview(null);
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'An error occurred';
        showSnackbar(errorMessage, 'error');
        console.error('Submit error:', err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Auto-set campus for non-edit mode
  useEffect(() => {
    if (!isEdit && campus?._id) {
      formik.setFieldValue('schoolCampus', campus._id, true);
    }
  }, [campus, isEdit]);

  // Handle image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showSnackbar('Please select a valid image file', 'error');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showSnackbar('Image size should not exceed 5MB', 'error');
      return;
    }

    // Update Formik state
    formik.setFieldValue('profileImage', file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    formik.setFieldValue('profileImage', null);
    setImagePreview(initialData?.profileImage || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          
          {/* PROFILE IMAGE SECTION */}
          <Grid size={{ xs: 12 }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                textAlign: 'center',
                bgcolor: 'background.neutral',
                borderRadius: 2,
                border: `2px dashed ${theme.palette.divider}`
              }}
            >
              <Stack spacing={2} alignItems="center">
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={imagePreview}
                    sx={{ 
                      width: 120, 
                      height: 120,
                      border: `4px solid ${theme.palette.primary.main}`,
                      boxShadow: theme.shadows[4]
                    }}
                  >
                    <Person sx={{ fontSize: 60 }} />
                  </Avatar>
                  {imagePreview && (
                    <IconButton
                      onClick={handleRemoveImage}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' },
                        width: 32,
                        height: 32
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                
                <input
                  ref={fileInputRef}
                  accept="image/*"
                  type="file"
                  hidden
                  onChange={handleImageChange}
                />
                
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  {imagePreview ? 'Change Photo' : 'Upload Photo'}
                </Button>
                
                <Typography variant="caption" color="text.secondary">
                  Recommended: Square image, max 5MB (JPG, PNG, WEBP)
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* IDENTITY SECTION */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="overline" color="primary" fontWeight="bold" fontSize="0.875rem">
              Personal Information
            </Typography>
            <Divider sx={{ mt: 0.5, mb: 2 }} />
          </Grid>
          
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth 
              name="firstName" 
              label="First Name"
              value={formik.values.firstName} 
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
              slotProps={{
                input: {
                  id: 'firstName',
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" color="action" />
                    </InputAdornment> 
                  ),
                },
                inputLabel: {
                  htmlFor: 'firstName',
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth 
              name="lastName" 
              label="Last Name"
              value={formik.values.lastName} 
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
              slotProps={{
                input: {id: 'lastName'},
                inputLabel: { htmlFor: 'lastName' },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth 
              name="username" 
              label="Username"
              value={formik.values.username} 
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
              slotProps={{
                input: {
                  id: 'userName',
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge fontSize="small" color="action" />
                    </InputAdornment> 
                  ),
                },
                inputLabel: {
                  htmlFor: 'userName',
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth 
              select 
              name="gender" 
              label="Gender"
              value={formik.values.gender} 
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              slotProps={{
                input: { id: 'gender'},
                inputLabel: { htmlFor: 'gender'},
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              name="dateOfBirth"
              label="Date of Birth"
              type="date"
              {...formik.getFieldProps('dateOfBirth')}
              error={formik.touched.dateOfBirth && !!formik.errors.dateOfBirth}
              helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
              slotProps={{
                input: {
                  id: 'dateOfBirth', 
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge fontSize="small" color="action" /> 
                    </InputAdornment>
                  ),
                },
                inputLabel: {
                  shrink: true,
                  htmlFor: 'dateOfBirth'
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          {/* CONTACT & SECURITY SECTION */}
          <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
            <Typography variant="overline" color="primary" fontWeight="bold" fontSize="0.875rem">
              Contact & Security
            </Typography>
            <Divider sx={{ mt: 0.5, mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth 
              name="email" 
              label="Email Address"
              type="email"
              value={formik.values.email} 
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              slotProps={{
                input: {
                  id: 'email', 
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize="small" color="action" />
                    </InputAdornment> 
                  ),
                },
                inputLabel: {
                  htmlFor: 'email'
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth 
              name="phone" 
              label="Phone Number"
              value={formik.values.phone} 
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
              slotProps={{
                input: {
                  id: 'phone',
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize="small" color="action" />
                    </InputAdornment> 
                  ),
                },
                inputLabel: {
                  htmlFor: 'phone',
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          {/* Password field - only for creation */}
          <Collapse in={!isEdit} sx={{ width: '100%' }}>
            <Grid container spacing={3} sx={{ pl: 3, pr: 3 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth 
                  name="password" 
                  label="Password" 
                  type="password"
                  value={formik.values.password} 
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock fontSize="small" color="action" />
                        </InputAdornment> 
                      ),
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
          </Collapse>

          {/* ACADEMIC ASSIGNMENT SECTION */}
          <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
            <Typography variant="overline" color="primary" fontWeight="bold" fontSize="0.875rem">
              Academic Assignment
            </Typography>
            <Divider sx={{ mt: 0.5, mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth 
              select 
              name="studentClass" 
              label="Class"
              value={formik.values.studentClass} 
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.studentClass && Boolean(formik.errors.studentClass)}
              helperText={formik.touched.studentClass && formik.errors.studentClass}
              slotProps={{
                input: {
                  id: 'studentClass',
                  startAdornment: (
                    <InputAdornment position="start">
                    <School fontSize="small" color="action" />
                  </InputAdornment> 
                  ),
                },
                inputLabel: {
                  htmlFor: 'studentClass',
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              {(Array.isArray(classes) ? classes : []).map((cls) => (
                <MenuItem key={cls._id} value={cls._id}>
                  {cls.className}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Campus"
              value={campus?.campus_name || ''}
              disabled
              slotProps={{
                input: {
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Domain fontSize="small" color="action" />
                    </InputAdornment> 
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Grid>

          {/* ACTION BUTTONS */}
          <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="flex-end"
            >
              {onCancel && (
                <Button 
                  variant="outlined" 
                  onClick={onCancel}
                  startIcon={<Cancel />}
                  disabled={submitting}
                  fullWidth={isMobile}
                  sx={{ 
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button 
                variant="contained" 
                type="submit" 
                startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Check />}
                disabled={submitting || !formik.isValid}
                fullWidth={isMobile}
                sx={{ 
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: theme.shadows[4],
                  '&:hover': {
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                {submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Student')}
              </Button>
            </Stack>
          </Grid>

        </Grid>
      </form>

      {/* SNACKBAR */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: theme.shadows[8]
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StudentForm;