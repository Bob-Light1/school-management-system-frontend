import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Card, Container, Stack, Typography, 
  TextField, InputAdornment, Table, TableBody, TableCell, 
  TableHead, TablePagination, TableRow, IconButton, Tooltip,
  Chip, Dialog, DialogTitle, DialogContent, Avatar, Grid,
  Snackbar, Alert, DialogActions, Divider, Paper, useTheme,
  useMediaQuery, List, ListItem, ListItemText, Fade, Zoom
} from '@mui/material';
import { 
  Add, Search, Edit, Delete, Visibility, Close,
  Person, Email, Phone, School, Domain, CalendarToday,
  Badge as BadgeIcon
} from '@mui/icons-material';
import axios from 'axios';
import StudentForm from './StudentForm';
import { API_BASE_URL } from '../../../config/env';
import { useParams } from 'react-router-dom';

const Students = () => {
  const { campusId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // --- STATES ---
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  
  // Snackbar states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // --- API CALLS ---
  const fetchStudents = async () => {

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(campusId);
    
    if (!campusId || !isMongoId) {
      console.warn("Skipping fetch: campusId is not a valid MongoDB ID:", campusId);
      return;
    }
    
    try {
      const res = await axios.get(`${API_BASE_URL}/student`, {
        params: { 
          page: page + 1, 
          limit: rowsPerPage, 
          search,
          campus: campusId, 
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.data && res.data.success) {
        setStudents(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Error loading students", err);
      setStudents([]);
      showSnackbar('Failed to load students', 'error');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, rowsPerPage, search, campusId]);

  // --- ACTIONS ---
  const handleOpenModal = (student = null) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (student) => {
    setViewStudent(student);
    setIsDetailModalOpen(true);
  };

  const handleArchive = async (id) => {
    if (window.confirm("Are you sure you want to archive this student?")) {
      try {
        await axios.delete(`${API_BASE_URL}/student/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchStudents();
        showSnackbar('Student archived successfully', 'success');
      } catch (err) {
        showSnackbar('Failed to archive student', 'error');
      }
    }
  };

  const handleFormSuccess = (message) => {
    setIsModalOpen(false);
    fetchStudents();
    showSnackbar(message, 'success');
  };

  // Mobile card view
  const MobileStudentCard = ({ student }) => (
    <Card 
      sx={{ 
        mb: 2, 
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        gap:2,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[8],
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Stack 
        direction="row" 
        spacing={2} 
        alignItems="flex-start"
      >
        
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ 
              display:'flex',
              alignItems:"center",
              justifyContent:"space-between",
              m:2, 
              gap:2, 
              }}
          >
            <Avatar 
              src={student.profileImage} 
              alt={`${student.firstName} ${student.lastName}`}
              sx={{ 
                width: 46, 
                height: 46,
                border: `2px solid ${theme.palette.primary.main}`
              }}
            >
              {student.firstName?.[0]}{student.lastName?.[0]}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {student.firstName} {student.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {student.email}
              </Typography>
            </Box>
          </Box>
         
          { isMobile && <Divider></Divider> }
          <Stack 
            direction="row" 
            spacing={0.5} 
            sx={{ 
              m: 2,
              flexWrap: 'wrap',
              justifyContent:'space-between', 
              gap: 1, 
            }}
          >
            <Chip 
              label={student.status} 
              size="small"
              color={student.status === 'active' ? 'success' : 'warning'} 
            />

            <Chip 
              label={student.studentClass?.className} 
              size="small" 
              color="primary"
              variant="outlined"
            />
          </Stack>
          
          { isMobile && <Divider></Divider> }
          <Stack 
            direction="row" 
            spacing={0.5} 
            sx={{ 
              m: 2,
              flexWrap: 'wrap',
              justifyContent:'space-between', 
              gap: 1, 
            }}
          >
            <IconButton 
              size="small" 
              color="primary"
              onClick={() => handleOpenDetailModal(student)}
            >
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="info"
              onClick={() => handleOpenModal(student)}
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleArchive(student._id)}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );

  return (
    <Box component="main" sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          {/* HEADER */}
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            justifyContent="space-between" 
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Stack spacing={1}>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight="bold">
                Students Management
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Manage and monitor all students in your institution
              </Typography>
            </Stack>
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={() => handleOpenModal()}
              fullWidth={isMobile}
              sx={{
                px: 3,
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
              Add New Student
            </Button>
          </Stack>

          {/* FILTERS & SEARCH */}
          <Card 
            sx={{ 
              p: 2,
              borderRadius: 2,
              boxShadow: theme.shadows[2]
            }}
          >
            <TextField
              fullWidth
              placeholder="Search by name, email, username or phone..."
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }
              }}
            />
          </Card>

          {/* TABLE / CARDS */}
          {isMobile ? (
            // Mobile view - Cards
            <Box>
              {students && students.length > 0 ? (
                students.map((student) => (
                  <MobileStudentCard key={student._id} student={student} />
                ))
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    No students found
                  </Typography>
                </Paper>
              )}
            </Box>
          ) : (
            // Desktop view - Table
            <Card 
              sx={{ 
                borderRadius: 2,
                boxShadow: theme.shadows[2],
                overflow: 'hidden'
              }}
            >
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 800 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.neutral' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Academic Info</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                   {students && students.length > 0 ? (
                    students.map((student) => (
                      <TableRow 
                        hover 
                        key={student._id}
                        sx={{
                          '&:hover': {
                            bgcolor: 'action.hover',
                          }
                        }}
                      >
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar 
                              src={student.profileImage} 
                              alt={`${student.firstName} ${student.lastName}`}
                              sx={{ 
                                width: 48, 
                                height: 48,
                                border: `2px solid ${theme.palette.primary.light}`
                              }}
                            >
                              {student.firstName?.[0]}{student.lastName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {student.firstName} {student.lastName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {student.email}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        
                        <TableCell>
                          <Chip 
                            icon={<BadgeIcon />}
                            label={student.username} 
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <School fontSize="small" color="primary" />
                              <Typography variant="body2" fontWeight="medium">
                                {student.studentClass?.className || 'N/A'}
                              </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Domain fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {student.schoolCampus?.campus_name || 'N/A'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>
                        
                        <TableCell>
                          <Chip 
                            label={student.status || 'active'} 
                            color={student.status === 'active' ? 'success' : 'warning'} 
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="View Details" arrow>
                              <IconButton 
                                onClick={() => handleOpenDetailModal(student)}
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': { bgcolor: 'primary.lighter' }
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit" arrow>
                              <IconButton 
                                onClick={() => handleOpenModal(student)}
                                sx={{
                                  color: 'info.main',
                                  '&:hover': { bgcolor: 'info.lighter' }
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Archive" arrow>
                              <IconButton 
                                onClick={() => handleArchive(student._id)}
                                sx={{
                                  color: 'error.main',
                                  '&:hover': { bgcolor: 'error.lighter' }
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          No students found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                  </TableBody>
                </Table>
              </Box>
              <Divider />
              <TablePagination
                component="div"
                count={total}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25, 50]}
                slotProps={{
                  select: {
                    inputProps: {
                      id: 'rows-per-page-select',
                      name: 'rows-per-page',
                    },
                  },
                }}
              />
            </Card>
          )}
        </Stack>
      </Container>

      {/* MODAL FOR CREATION / EDITING */}
      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        fullWidth 
        maxWidth="md"
        disableEnforceFocus={true}
        closeAfterTransition={false}
        aria-labelledby="create-subject-title"
        fullScreen={isMobile}
        slots={{ transition: Zoom }}
        slotProps={{ 
          paper: { 
            sx: {
              borderRadius: isMobile ? 0 : 3,
              boxShadow: theme.shadows[24]
            },
       
          } 
        }}
      >
        <DialogTitle 
          sx={{ 
            fontWeight: 'bold', 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2
          }}
        >
          
            {selectedStudent ? 'Edit Student Information' : 'Enroll New Student'}
       
          <IconButton 
            onClick={() => setIsModalOpen(false)}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2, px: { xs: 2, sm: 3 } }}>
          <StudentForm 
            initialData={selectedStudent} 
            onSuccess={handleFormSuccess}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* DETAIL VIEW MODAL */}
      <Dialog 
        open={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        fullWidth 
        maxWidth="sm"
        disableEnforceFocus={true}
        closeAfterTransition={false}
        aria-labelledby="create-subject-title"
        fullScreen={isMobile}
        slots={{ transition: Fade }}
        slotProps={{ 
          paper: { 
            sx: {
              borderRadius: isMobile ? 0 : 3,
              boxShadow: theme.shadows[24]
            },
       
          } 
        }}
      >
        <DialogTitle 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2
          }}
        >
       
            Student Details
        
          <IconButton 
            onClick={() => setIsDetailModalOpen(false)}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {viewStudent && (
            <Stack spacing={3}>
              {/* Profile Section */}
              <Box sx={{ textAlign: 'center' }}>
                <Avatar 
                  src={viewStudent.profileImage} 
                  alt={`${viewStudent.firstName} ${viewStudent.lastName}`}
                  sx={{ 
                    width: 120, 
                    height: 120,
                    margin: '0 auto',
                    border: `4px solid ${theme.palette.primary.main}`,
                    boxShadow: theme.shadows[8]
                  }}
                >
                  <Typography variant="h3">
                    {viewStudent.firstName?.[0]}{viewStudent.lastName?.[0]}
                  </Typography>
                </Avatar>
                <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
                  {viewStudent.firstName} {viewStudent.lastName}
                </Typography>
                <Chip 
                  label={viewStudent.status || 'active'} 
                  color={viewStudent.status === 'active' ? 'success' : 'warning'} 
                  size="small"
                  sx={{ mt: 1, fontWeight: 600 }}
                />
              </Box>

              <Divider />

              {/* Information List */}
              <List dense>
                <ListItem>
                  <Stack direction="row" spacing={2} alignItems="center" width="100%">
                    <BadgeIcon color="action" />
                    <ListItemText 
                      primary="Username" 
                      secondary={viewStudent.username || 'N/A'}
                      slotProps={{ 
                        primary: { 
                          fontWeight: 600,
                          variant: 'body2'
                        } 
                      }}
                    />
                  </Stack>
                </ListItem>
                
                <ListItem>
                  <Stack direction="row" spacing={2} alignItems="center" width="100%">
                    <Email color="action" />
                    <ListItemText 
                      primary="Email" 
                      secondary={viewStudent.email || 'N/A'}
                      slotProps={{ 
                        primary: { 
                          fontWeight: 600,
                          variant: 'body2'
                        } 
                      }}
                    />
                  </Stack>
                </ListItem>
                
                <ListItem>
                  <Stack direction="row" spacing={2} alignItems="center" width="100%">
                    <Phone color="action" />
                    <ListItemText 
                      primary="Phone" 
                      secondary={viewStudent.phone || 'N/A'}
                       slotProps={{ 
                        primary: { 
                          fontWeight: 600,
                          variant: 'body2'
                        } 
                      }}
                    />
                  </Stack>
                </ListItem>
                
                <ListItem>
                  <Stack direction="row" spacing={2} alignItems="center" width="100%">
                    <Person color="action" />
                    <ListItemText 
                      primary="Gender" 
                      secondary={viewStudent.gender ? viewStudent.gender.charAt(0).toUpperCase() + viewStudent.gender.slice(1) : 'N/A'}
                       slotProps={{ 
                        primary: { 
                          fontWeight: 600,
                          variant: 'body2'
                        } 
                      }}
                    />
                  </Stack>
                </ListItem>
                
                <Divider sx={{ my: 1 }} />
                
                <ListItem>
                  <Stack direction="row" spacing={2} alignItems="center" width="100%">
                    <School color="primary" />
                    <ListItemText 
                      primary="Class" 
                      secondary={viewStudent.studentClass?.className || 'Not assigned'}
                       slotProps={{ 
                        primary: { 
                          fontWeight: 600,
                          variant: 'body2'
                        } 
                      }}
                    />
                  </Stack>
                </ListItem>
                
                <ListItem>
                  <Stack direction="row" spacing={2} alignItems="center" width="100%">
                    <Domain color="primary" />
                    <ListItemText 
                      primary="Campus" 
                      secondary={viewStudent.schoolCampus?.campus_name || 'Not assigned'}
                       slotProps={{ 
                        primary: { 
                          fontWeight: 600,
                          variant: 'body2'
                        } 
                      }}
                    />
                  </Stack>
                </ListItem>
              </List>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button 
            onClick={() => {
              setIsDetailModalOpen(false);
              handleOpenModal(viewStudent);
            }}
            variant="contained"
            startIcon={<Edit />}
            fullWidth={isMobile}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Edit Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
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
    </Box>
  );
};

export default Students;