import React, { useEffect, useState, useRef } from 'react';
import {
  Grid,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  InputAdornment,
  Divider,
  Typography,
  Box,
  Avatar,
  IconButton,
  Stack,
  Paper,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Badge,
  Lock,
  Domain,
  PhotoCamera,
  Close,
  Check,
  Cancel,
  VisibilityOff,
  Visibility,
  Work,
  Star,
  Psychology,
  AccessTime,
  Business,
  ContactEmergency,
} from '@mui/icons-material';
import NumbersIcon from '@mui/icons-material/Numbers';

import { useFormik } from 'formik';
import axios from 'axios';
import { createTeacherSchema } from '../../../yupSchema/createTeacherSchema';
import { API_BASE_URL, IMAGE_BASE_URL } from '../../../config/env';
import { useParams } from 'react-router-dom';

const TeacherForm = ({ initialData, onSuccess, onCancel }) => {
  const { campusId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef(null);

  const [campus, setCampus] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [imagePreview, setImagePreview] = useState(
    initialData?.profileImage
      ? initialData.profileImage.startsWith('http')
        ? initialData.profileImage
        : `${IMAGE_BASE_URL.replace(/\/$/, '')}/${initialData.profileImage.replace(/^\//, '')}`
      : null
  );

  const isEdit = !!initialData;

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const authHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });

  // Load campus + departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCampus, resDepts] = await Promise.all([
          axios.get(`${API_BASE_URL}/campus/${campusId}`, authHeader()),
          axios.get(`${API_BASE_URL}/department?campusId=${campusId}`, authHeader()),
        ]);
        setCampus(resCampus.data.data || null);
        setDepartments(resDepts.data.data || []);
      } catch (err) {
        console.error('Error loading form data:', err);
        showSnackbar('Failed to load form data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [campusId]);

  const formik = useFormik({
    initialValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      username: initialData?.username || '',
      password: '',
      phone: initialData?.phone || '',
      gender: initialData?.gender || 'male',
      dateOfBirth: initialData?.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
      qualification: initialData?.qualification || '',
      specialization: initialData?.specialization || '',
      experience: initialData?.experience ?? 0,
      employmentType: initialData?.employmentType || 'full-time',
      department: initialData?.department?._id || '',
      matricule: initialData?.matricule || '',
      schoolCampus: initialData?.schoolCampus?._id || campusId || '',
      // Emergency contact
      'emergencyContact.name': initialData?.emergencyContact?.name || '',
      'emergencyContact.phone': initialData?.emergencyContact?.phone || '',
      'emergencyContact.relationship': initialData?.emergencyContact?.relationship || '',
      profileImage: null,
    },

    validationSchema: createTeacherSchema(isEdit),
    validateOnChange: true,
    validateOnBlur: true,

    onSubmit: async (values) => {
      if (submitting) return;
      setSubmitting(true);

      try {
        const formData = new FormData();

        Object.keys(values).forEach((key) => {
          if (key === 'profileImage') {
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
            'Content-Type': 'multipart/form-data',
          },
        };

        if (isEdit) {
          await axios.put(`${API_BASE_URL}/teacher/${initialData._id}`, formData, config);
          onSuccess?.('Teacher updated successfully');
        } else {
          await axios.post(`${API_BASE_URL}/teacher`, formData, config);
          onSuccess?.('Teacher created successfully');
          formik.resetForm();
          setImagePreview(null);
        }
      } catch (err) {
        console.error('Submit error:', err);
        let errorMessage = 'An error occurred';
        if (err.response?.status === 400)
          errorMessage = err.response.data?.message || 'Validation error';
        else if (err.response?.status === 413)
          errorMessage = 'File too large. Maximum size is 5MB';
        else if (err.response?.status === 401)
          errorMessage = 'Session expired. Please login again';
        else if (err.response?.status >= 500)
          errorMessage = 'Server error. Please try again later';
        showSnackbar(errorMessage, 'error');
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Sync campusId into form when campus loads
  useEffect(() => {
    if (campus?._id) {
      formik.setFieldValue('schoolCampus', campus._id, false);
    }
  }, [campus]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      showSnackbar('Only JPG, PNG and WEBP images are allowed', 'error');
      return;
    }
    const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      showSnackbar('Invalid file extension', 'error');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      showSnackbar('Image size should not exceed 5MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        formik.setFieldValue('profileImage', file);
        setImagePreview(e.target.result);
      };
      img.onerror = () => showSnackbar('File is not a valid image', 'error');
      img.src = e.target.result;
    };
    reader.onerror = () => showSnackbar('Error reading file', 'error');
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    formik.setFieldValue('profileImage', null);
    const originalImage = initialData?.profileImage
      ? initialData.profileImage.startsWith('http')
        ? initialData.profileImage
        : `${IMAGE_BASE_URL}/${initialData.profileImage}`
      : null;
    setImagePreview(originalImage);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

  return (
    <>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>

          {/* PROFILE IMAGE */}
          <Grid size={{ xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'background.neutral',
                borderRadius: 2,
                border: `2px dashed ${theme.palette.divider}`,
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
                      boxShadow: theme.shadows[4],
                      bgcolor: theme.palette.grey[200],
                      fontSize: '2.5rem',
                      fontWeight: 700,
                    }}
                  >
                    {formik.values.firstName?.[0]}
                    {formik.values.lastName?.[0]}
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
                        height: 32,
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
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  {imagePreview ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Recommended: Square image, max 5MB (JPG, PNG, WEBP)
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          {/* PERSONAL INFORMATION */}
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
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
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              name="matricule"
              label="Matricule (auto-generated if empty)"
              value={formik.values.matricule}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.matricule && Boolean(formik.errors.matricule)}
              helperText={formik.touched.matricule && formik.errors.matricule}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <NumbersIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
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
              sx={fieldSx}
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
              error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
              helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
              slotProps={{
                inputLabel: { shrink: true },
              }}
              sx={fieldSx}
            />
          </Grid>

          {/* CONTACT & SECURITY */}
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
            />
          </Grid>

          {/* Password - creation only */}
          <Collapse in={!isEdit} sx={{ width: '100%' }}>
            <Grid container spacing={3} sx={{ pl: 3, pr: 3 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
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
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={fieldSx}
                />
              </Grid>
            </Grid>
          </Collapse>

          {/* PROFESSIONAL INFORMATION */}
          <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
            <Typography variant="overline" color="primary" fontWeight="bold" fontSize="0.875rem">
              Professional Information
            </Typography>
            <Divider sx={{ mt: 0.5, mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              select
              name="department"
              label="Department"
              value={formik.values.department}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.department && Boolean(formik.errors.department)}
              helperText={formik.touched.department && formik.errors.department}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Business fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
            >
              {departments.map((dept) => (
                <MenuItem key={dept._id} value={dept._id}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              name="qualification"
              label="Qualification"
              value={formik.values.qualification}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.qualification && Boolean(formik.errors.qualification)}
              helperText={formik.touched.qualification && formik.errors.qualification}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Star fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              name="specialization"
              label="Specialization"
              value={formik.values.specialization}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.specialization && Boolean(formik.errors.specialization)}
              helperText={formik.touched.specialization && formik.errors.specialization}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Psychology fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              name="experience"
              label="Years of Experience"
              type="number"
              value={formik.values.experience}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.experience && Boolean(formik.errors.experience)}
              helperText={formik.touched.experience && formik.errors.experience}
              slotProps={{
                input: {
                  inputProps: { min: 0, max: 50 },
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTime fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              select
              name="employmentType"
              label="Employment Type"
              value={formik.values.employmentType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.employmentType && Boolean(formik.errors.employmentType)}
              helperText={formik.touched.employmentType && formik.errors.employmentType}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Work fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
            >
              <MenuItem value="full-time">Full-time</MenuItem>
              <MenuItem value="part-time">Part-time</MenuItem>
              <MenuItem value="contract">Contract</MenuItem>
              <MenuItem value="temporary">Temporary</MenuItem>
            </TextField>
          </Grid>

          {/* Campus - read only */}
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
              sx={fieldSx}
            />
          </Grid>

          {/* EMERGENCY CONTACT */}
          <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
            <Typography variant="overline" color="primary" fontWeight="bold" fontSize="0.875rem">
              Emergency Contact <Typography component="span" variant="caption" color="text.secondary">(optional)</Typography>
            </Typography>
            <Divider sx={{ mt: 0.5, mb: 2 }} />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              name="emergencyContact.name"
              label="Contact Name"
              value={formik.values['emergencyContact.name']}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <ContactEmergency fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              name="emergencyContact.phone"
              label="Contact Phone"
              value={formik.values['emergencyContact.phone']}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              name="emergencyContact.relationship"
              label="Relationship"
              value={formik.values['emergencyContact.relationship']}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              sx={fieldSx}
            />
          </Grid>

          {/* ACTION BUTTONS */}
          <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
              {onCancel && (
                <Button
                  variant="outlined"
                  onClick={onCancel}
                  startIcon={<Cancel />}
                  disabled={submitting}
                  fullWidth={isMobile}
                  sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="contained"
                type="submit"
                startIcon={
                  submitting ? <CircularProgress size={20} color="inherit" /> : <Check />
                }
                disabled={submitting || !formik.isValid}
                fullWidth={isMobile}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: theme.shadows[4],
                  '&:hover': { boxShadow: theme.shadows[8] },
                }}
              >
                {submitting
                  ? 'Saving...'
                  : isEdit
                  ? 'Save Changes'
                  : 'Create Teacher'}
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
          sx={{ width: '100%', borderRadius: 2, boxShadow: theme.shadows[8] }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TeacherForm;