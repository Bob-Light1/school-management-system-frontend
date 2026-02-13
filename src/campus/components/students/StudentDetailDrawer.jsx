import React from 'react';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  Avatar,
  Stack,
  Divider,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Grid,
  Tooltip,
} from '@mui/material';
import {
  Close,
  Edit,
  Email,
  Phone,
  School,
  Domain,
  Badge,
  Cake,
  Person,
  Male,
  Female,
  Archive,
} from '@mui/icons-material';
import { IMAGE_BASE_URL } from '../../../config/env';

/**
 * STUDENT DETAIL DRAWER
 * 
 * Show complete student information
 * 
 * @param {Object} props
 * @param {Object} props.entity - selected student
 * @param {Boolean} props.open - drawer state (opened / closed)
 * @param {Function} props.onClose - Callback to close the drawer
 * @param {Function} props.onEdit - Callback to edit student
 * @param {Function} props.onArchive - Callback to archive student
 */

const StudentDetailDrawer = ({ 
  entity: student,
  onClose, 
  onEdit,
  onArchive 
}) => {
  if (!student) return null;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(student.dateOfBirth);

  //call Image from backend
  const profileImageUrl = student.profileImage 
    ? (student.profileImage.startsWith('http') 
        ? student.profileImage 
        : `${IMAGE_BASE_URL.replace(/\/$/, '')}/${student.profileImage.replace(/^\//, '')}`)
    : null;

  return (
   

      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 3,
            bgcolor: 'primary.main',
            color: 'white',
            position: 'relative',
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
            }}
          >
            <Close />
          </IconButton>

          <Stack alignItems="center" spacing={2} sx={{ mt: 6 }}>
            <Avatar
              src={profileImageUrl}
              sx={{
                width: 100,
                height: 100,
                border: '4px solid white',
                boxShadow: 3,
              }}
            >
              <Person sx={{ fontSize: 50 }} />
            </Avatar>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700}>
                {student.firstName} {student.lastName}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {student.email}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          <Stack spacing={3}>
            {/* Status & Actions */}
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
                <Chip
                  label={student.status || 'Active'}
                  color={student.status === 'active' ? 'success' : 'warning'}
                  sx={{ fontWeight: 600 }}
                />
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Edit Student">
                    <IconButton size="small" color="primary" onClick={onEdit}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {onArchive && (
                    <Tooltip title="Archive Student">
                      <IconButton size="small" color="error" onClick={onArchive}>
                        <Archive fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Stack>
            </Paper>

            {/* Personal Information */}
            <Box>
              <Typography variant="overline" color="primary" fontWeight={700} fontSize="0.875rem">
                Personal Information
              </Typography>
              <Divider sx={{ mb: 2, mt: 0.5 }} />
              
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Badge color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Matricule"
                    secondary={student.matricule || 'N/A'}
                    slotProps={{
                      primary: { variant: 'caption', color: 'text.secondary'},
                      secondary: { variant: 'body2', fontWeight: 600  }
                    }}
                  />
                </ListItem>

                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Person color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Username"
                    secondary={student.username || 'N/A'}
                    slotProps={{
                      primary: { variant: 'caption', color: 'text.secondary'},
                      secondary: { variant: 'body2', fontWeight: 600  }
                    }}
                  />
                </ListItem>

                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {student.gender === 'male' ? (
                      <Male color="action" />
                    ) : student.gender === 'female' ? (
                      <Female color="action" />
                    ) : (
                      <Person color="action" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary="Gender"
                    secondary={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : 'N/A'}
                    slotProps={{
                      primary: { variant: 'caption', color: 'text.secondary'},
                      secondary: { variant: 'body2', fontWeight: 600  }
                    }}
                  />
                </ListItem>

                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Cake color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Date of Birth"
                    secondary={
                      student.dateOfBirth 
                        ? `${formatDate(student.dateOfBirth)}${age ? ` (${age} years old)` : ''}`
                        : 'N/A'
                    }
                    slotProps={{
                      primary: { variant: 'caption', color: 'text.secondary'},
                      secondary: { variant: 'body2', fontWeight: 600  }
                    }}
                  />
                </ListItem>
              </List>
            </Box>

            {/* Contact Information */}
            <Box>
              <Typography variant="overline" color="primary" fontWeight={700} fontSize="0.875rem">
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2, mt: 0.5 }} />
              
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Email color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={student.email || 'N/A'}
                    slotProps={{
                      primary: { variant: 'caption', color: 'text.secondary'},
                      secondary: { 
                        variant: 'body2', 
                        fontWeight: 600,
                        sx: { 
                          wordBreak: 'break-word',
                          color: 'primary.main',
                          textDecoration: 'underline',
                          cursor: 'pointer'
                        }
                      }
                    }}

                    onClick={() => window.location.href = `mailto:${student.email}`}
                  />
                </ListItem>

                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Phone color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Phone"
                    secondary={student.phone || 'N/A'}
                    slotProps={{
                      primary: { variant: 'caption', color: 'text.secondary'},
                      secondary: { variant: 'body2', fontWeight: 600  }
                    }}
                  />
                </ListItem>
              </List>
            </Box>

            {/* Academic Information */}
            <Box>
              <Typography variant="overline" color="primary" fontWeight={700} fontSize="0.875rem">
                Academic Information
              </Typography>
              <Divider sx={{ mb: 2, mt: 0.5 }} />
              
              <List disablePadding>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <School color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Class"
                    secondary={student.studentClass?.className || 'N/A'}
                    slotProps={{
                      primary: { variant: 'caption', color: 'text.secondary'},
                      secondary: { variant: 'body2', fontWeight: 600  }
                    }}
                  />
                </ListItem>

                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Domain color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Campus"
                    secondary={student.schoolCampus?.campus_name || 'N/A'}
                    slotProps={{
                      primary: { variant: 'caption', color: 'text.secondary'},
                      secondary: { variant: 'body2', fontWeight: 600  }
                    }}
                  />
                </ListItem>
              </List>
            </Box>

            {/* Timestamps */}
            <Box>
              <Typography variant="overline" color="text.secondary" fontSize="0.75rem">
                Account Information
              </Typography>
              <Divider sx={{ mb: 1, mt: 0.5 }} />
              
              <Grid container spacing={1}>
                <Grid size={{xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(student.createdAt)}
                  </Typography>
                </Grid>
                <Grid size={{xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {formatDate(student.updatedAt)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={onClose}
              sx={{ borderRadius: 2 }}
            >
              Close
            </Button>
            <Button
              variant="contained"
              fullWidth
              startIcon={<Edit />}
              onClick={onEdit}
              sx={{ borderRadius: 2 }}
            >
              Edit Student
            </Button>
          </Stack>
        </Box>
      </Box>
  );
};

export default StudentDetailDrawer;