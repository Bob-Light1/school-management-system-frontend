import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogContent,
  TextField,
  MenuItem,
  Chip,
  Stack,
  Tooltip,
  InputAdornment,
  Skeleton,
  Divider,
  Alert,
  CircularProgress,
  Snackbar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Groups as GroupsIcon,
  Business as BusinessIcon,
  Layers as LayersIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

import { Formik, Form} from 'formik';
import { createClassSchema } from '../../../yupSchema/createClassSchema';
import { API_BASE_URL } from '../../../config/env';
import axios from 'axios';
import ManageLevel from '../levels/ManageLevel';
import MobileClassCard from './MobileClassCard';

const Classes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [classes, setClasses] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openLevels, setOpenLevels] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Enhanced notification system
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  });

  const isEditMode = Boolean(selectedClass);

  // Get authentication header
  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
  });

  // Show notification helper
  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const [clsRes, campRes, lvlRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/class`, getAuthHeader()),
        axios.get(`${API_BASE_URL}/campus/all`, getAuthHeader()),
        axios.get(`${API_BASE_URL}/level`, getAuthHeader()),
      ]);

      setClasses(clsRes.data?.data || []);
      setCampuses(campRes.data?.allCampus || []);
      setLevels(lvlRes.data?.data || []);

    } catch (err) {
      console.error('Error loading data:', err);
      showNotification(
        err.response?.data?.message || 
        'Unable to load data. Please check your connection or permissions.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (values, { resetForm, setSubmitting }) => {
    try {
      if (isEditMode) {
        await axios.put(
          `${API_BASE_URL}/class/${selectedClass._id}`,
          values,
          getAuthHeader()
        );
        showNotification('Class updated successfully!', 'success');
      } else {
        await axios.post(`${API_BASE_URL}/class`, values, getAuthHeader());
        showNotification('Class created successfully!', 'success');
      }

      await fetchData();
      resetForm();
      setSelectedClass(null);
      setOpen(false);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (isEditMode ? 'Failed to update class' : 'Failed to create class');
      showNotification(msg, 'error');
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Do you really want to archive this class?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/class/${id}`, getAuthHeader());
      showNotification('Class archived successfully', 'success');
      await fetchData();
    } catch (error) {
      showNotification('Unable to archive the class', 'error');
      console.error(error);
    }
  };

  const handleOpenCreate = () => {
    setSelectedClass(null);
    setOpen(true);
  };

  const handleOpenEdit = (cls) => {
    setSelectedClass(cls);
    setOpen(true);
  };

  const isEmpty = !loading && classes.length === 0;

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        mt: { xs: 2, sm: 3, md: 4 }, 
        mb: { xs: 4, sm: 5, md: 6 },
        px: { xs: 2, sm: 3 }
      }}
    >
      {/* HEADER - Responsive */}
      <Box
        display="flex"
        flexDirection={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={{ xs: 2, sm: 0 }}
        mb={{ xs: 3, md: 4 }}
      >
        <Box>
          <Typography 
            variant={isMobile ? 'h5' : 'h4'} 
            fontWeight="800" 
            gutterBottom
            textAlign={{ xs: 'center', lg: 'start'}}
          >
            Classes Management
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            display={{ xs: 'none', sm: 'block' }}
            marginBottom={{ xs: 2 }}
            textAlign={{ xs: 'center', lg: 'start'}}
          >
            Creation, modification, and archiving of campus classes
          </Typography>
        </Box>

        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          spacing={2}
          width={{ xs: '100%', sm: 'auto' }}
        >
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            fullWidth={isMobile}
            sx={{ 
              borderRadius: 2, 
              px: { xs: 2, sm: 3 }, 
              py: 1.2 
            }}
          >
            New Class
          </Button>

          <Button
            variant="outlined"
            startIcon={<LayersIcon />}
            onClick={() => setOpenLevels(true)}
            fullWidth={isMobile}
            sx={{ borderRadius: 2 }}
          >
            Manage Levels
          </Button>
        </Stack>
      </Box>

      {/* Mobile View - Cards */}
      {isMobile ? (
        <Box>
          {loading ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} sx={{ mb: 2, borderRadius: 3 }}>
                <CardContent>
                  <Skeleton height={120} animation="wave" />
                </CardContent>
              </Card>
            ))
          ) : isEmpty ? (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 6, 
                textAlign: 'center', 
                borderRadius: 3,
                bgcolor: 'grey.50'
              }}
            >
              <SchoolIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No classes yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first class to get started
              </Typography>
            </Paper>
          ) : (
            classes.map((cls) => 
              <MobileClassCard 
                key={cls._id} 
                cls={cls} 
                edit={handleOpenEdit} 
                del={handleDelete}
              />)
          )}
        </Box>
      ) : (
        /* Desktop/Tablet View - Table */
        <TableContainer 
          component={Paper} 
          elevation={3} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            '& .MuiTableCell-root': {
              fontSize: isTablet ? '0.875rem' : '1rem'
            }
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: 'grey.100' }}>
              <TableRow>
                <TableCell>Class</TableCell>
                <TableCell>Campus</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton height={48} animation="wave" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isEmpty ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <SchoolIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                    <Typography variant="subtitle1" color="text.secondary">
                      No classes registered at the moment
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => (
                  <TableRow key={cls._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <SchoolIcon fontSize="small" color="action" />
                        <Typography fontWeight={600}>{cls.className || '—'}</Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>{cls.schoolCampus?.campus_name || 'N/A'}</TableCell>

                    <TableCell>
                      <Chip
                        label={cls.level?.name || '—'}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <GroupsIcon fontSize="small" color="disabled" />
                        <Typography variant="body2">{cls.maxStudents || 0} students</Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={cls.status || 'active'}
                        color={cls.status === 'active' ? 'success' : 'default'}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleOpenEdit(cls)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Archive">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDelete(cls._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* CREATE / EDIT MODAL - Responsive */}
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setSelectedClass(null);
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        disableEnforceFocus={true}
        closeAfterTransition={false}
        aria-labelledby="create-class-title"
        slotProps={{
          paper: {
            sx: {
              borderRadius: isMobile ? 0 : 3,
            }
          }
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            bgcolor: 'primary.main',
            color: 'white'
          }}
        >
          <Typography id="create-class-title" variant="h6" fontWeight="700">
            {isEditMode ? 'Edit Class' : 'New Class'}
          </Typography>
          <IconButton 
            onClick={() => setOpen(false)} 
            size="small"
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 3, px: { xs: 2, sm: 3 } }}>
          <Formik
            enableReinitialize
            initialValues={{
              className: selectedClass?.className || '',
              schoolCampus: selectedClass?.schoolCampus?._id || '',
              level: selectedClass?.level?._id || '',
              maxStudents: selectedClass?.maxStudents || 50,
            }}
            validationSchema={createClassSchema}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange, handleBlur, isSubmitting, errors, touched }) => (
              <Form>
                <Stack spacing={3}>
                  <TextField
                    autoFocus={!isMobile}
                    label="Class Name"
                    name="className"
                    value={values.className}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.className && Boolean(errors.className)}
                    helperText={touched.className && errors.className}
                    fullWidth
                    slotProps={{
                      input: {
                        id: 'className',
                        startAdornment: (
                          <InputAdornment position="start">
                            <SchoolIcon color="primary" />
                          </InputAdornment>
                        ),
                      },
                      inputLabel: {
                        htmlFor: 'className',
                      },
                    }}
                  />

                  <TextField
                    select
                    label="Campus"
                    name="schoolCampus"
                    value={values.schoolCampus || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.schoolCampus && Boolean(errors.schoolCampus)}
                    helperText={touched.schoolCampus && errors.schoolCampus}
                    fullWidth
                    slotProps={{
                      input: {
                        id: 'schoolCampus',
                        startAdornment: (
                          <InputAdornment position="start">
                            {loading ? (
                              <CircularProgress size={20} color="primary" />
                            ) : (
                              <BusinessIcon fontSize="small" />
                            )}
                          </InputAdornment>
                        ),
                      },
                      inputLabel: {
                        htmlFor: 'schoolCampus',
                      },
                    }}
                  >
                    {(Array.isArray(campuses) ? campuses : []).map((camp) => (
                      <MenuItem key={camp._id} value={camp._id}>
                        {camp.campus_name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Level"
                    name="level"
                    value={values.level}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.level && Boolean(errors.level)}
                    helperText={touched.level && errors.level}
                    fullWidth
                    slotProps={{
                    input: {
                      id: 'level',
                      startAdornment: (
                        <InputAdornment position="start">
                          <SchoolIcon color="primary" />
                        </InputAdornment>
                      ),
                    },
                    inputLabel: {
                      htmlFor: 'level',
                    },
                  }}
                  >
                    {(Array.isArray(levels) ? levels : []).map((l) => (
                      <MenuItem key={l._id} value={l._id}>
                        {l.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    type="number"
                    label="Maximum Capacity"
                    name="maxStudents"
                    value={values.maxStudents}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.maxStudents && Boolean(errors.maxStudents)}
                    helperText={touched.maxStudents && errors.maxStudents}
                    fullWidth
                    slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <GroupsIcon />
                        </InputAdornment>
                      ),
                    },
                  }}
                  />

                  <Stack 
                    direction={{ xs: 'column', lg: 'row' }} 
                    spacing={2} 
                    sx={{ mt: 4 }}
                  >
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setOpen(false)}
                      disabled={isSubmitting}
                      sx={{ order: { xs: 2, sm: 1 } }}
                    >
                      Cancel
                    </Button>
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      sx={{ order: { xs: 1, sm: 2 } }}
                    >
                      {isSubmitting
                        ? 'In progress...'
                        : isEditMode
                        ? 'Update'
                        : 'Create Class'}
                    </Button>
                  </Stack>
                </Stack>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* Enhanced Snackbar Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ 
          vertical: isMobile ? 'bottom' : 'top', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
        sx={{
          bottom: isMobile ? 80 : undefined,
        }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          iconMapping={{
            success: <SuccessIcon fontSize="inherit" />,
            error: <ErrorIcon fontSize="inherit" />,
            warning: <WarningIcon fontSize="inherit" />,
          }}
          sx={{ 
            width: '100%',
            minWidth: isMobile ? '90vw' : 300,
            boxShadow: 3,
            borderRadius: 2,
          }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Manage Levels Dialog */}
      <ManageLevel 
        open={openLevels}
        onClose={() => setOpenLevels(false)}
        onLevelsUpdated={fetchData}
      />
    </Container>
  );
};

export default Classes;