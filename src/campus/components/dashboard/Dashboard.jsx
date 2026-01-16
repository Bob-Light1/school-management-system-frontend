import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Divider,
  Stack,
  Skeleton
} from '@mui/material';
import Grid from '@mui/material/Grid';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EmailIcon from '@mui/icons-material/Email';
import axios from 'axios';

import { IMAGE_BASE_URL } from '../../../config/env';
import { API_BASE_URL } from '../../../config/env';
import EditCampusModal from './EditCampusModal';
import { useNavigate } from 'react-router-dom';

export default function CampusDashboard() {
  const [campus, setCampus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const campusModules = [
    // --- ACADEMIC GROUP ---
    { id: 1, name: 'Class Management', type: 'Academic', path: '/campus/classes', icon: '🏫', color: '#4989c8' },
    { id: 2, name: 'Schedule', type: 'Academic', path: '/campus/schedule', icon: '📅', color: '#4989c8' },
    { id: 3, name: 'Subjects & Units', type: 'Academic', path: '/campus/subjects', icon: '📚', color: '#4989c8' },
    { id: 4, name: 'Exams & Grades', type: 'Evaluation', path: '/campus/examination', icon: '📊', color: '#f59e0b' },

    // --- USER GROUP ---
    { id: 5, name: 'Student Register', type: 'Users', path: '/campus/students', icon: '👨‍🎓', color: '#10b981' },
    { id: 6, name: 'Teaching Staff', type: 'Users', path: '/campus/teachers', icon: '👨‍🏫', color: '#10b981' },
    { id: 7, name: 'Parents Area', type: 'Users', path: '/campus/parents', icon: '👨‍👩‍👧', color: '#10b981' },

    // --- MANAGEMENT & COMM ---
    { id: 8, name: 'Attendance Tracking', type: 'Management', path: '/campus/attendance', icon: '📝', color: '#6366f1' },
    { id: 9, name: 'Notification Center', type: 'Communication', path: '/campus/notification', icon: '🔔', color: '#ef4444' },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const campusRes = await axios.get(`${API_BASE_URL}/campus/single`, config);
        
        // Handle consistent response structure from the backend
        if (campusRes.data.success) {
          setCampus(campusRes.data.data);
        } else {
          console.error("Error:", campusRes.data.message);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 4, mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, color: '#2c3e50' }}>
        Dashboard
      </Typography>

      <Grid container spacing={4}>

        {/* Campus Profile */}
        <Grid size={{ xs: 12, md: 3 }} sx={{ mt: 3 }}>
          <Card sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <Box sx={{ height: 100, background: 'linear-gradient(45deg, #4989c8 30%, #3a6fa8 90%)' }} />
            <CardContent sx={{ mt: -6 }}>
              <Avatar
                src={`${IMAGE_BASE_URL}${campus?.campus_image}`}
                alt={campus?.campus_name}
                sx={{ 
                  width: 100, height: 100, mx: 'auto', mb: 2, 
                  border: '4px solid white', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' 
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>{campus?.campus_name}</Typography>
              <Chip 
                label="Active" 
                color="success" 
                size="small" 
                sx={{ mt: 1, mb: 2, fontWeight: 600 }} 
              />
              
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={2} sx={{ textAlign: 'left', px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SupervisorAccountIcon color="action" />
                  <Typography variant="body2"><strong>Manager:</strong> {campus?.manager_name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmailIcon color="action" />
                  <Typography variant="body2">{campus?.email}</Typography>
                </Box>
              </Stack>

              <Button
                fullWidth
                startIcon={<EditIcon />}
                variant="contained"
                onClick={() => setModalOpen(true)}
                sx={{ mt: 3, borderRadius: 2, textTransform: 'none', py: 1 }}
              >
                Edit Profile
              </Button>

              {/* The Modal */}
              {campus && (
                <EditCampusModal 
                  open={modalOpen} 
                  handleClose={() => setModalOpen(false)} 
                  campusData={campus}
                  onUpdate={(newData) => setCampus(newData)}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Statistics */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ml:5}}>
          <Grid container spacing={3}>
            {[
              { label: 'Courses', value: '24', icon: <SchoolIcon />, color: '#4989c8' },
              { label: 'Students', value: '1,240', icon: <PeopleIcon />, color: '#10b981' },
              { label: 'Teachers', value: '45', icon: <SupervisorAccountIcon />, color: '#f59e0b' }
            ].map((stat, i) => (
              <Grid size={{ xs: 12, sm: 4 }} key={i}>
                <Card sx={{ borderRadius: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      p: 1.5, borderRadius: 3, backgroundColor: `${stat.color}15`, color: stat.color 
                    }}>
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>{stat.value}</Typography>
                      <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Campus Elements Section */}
          <Grid container spacing={2} sx={{ mt: 3 }}>
            {campusModules.map((module) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={module.id}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    borderRadius: 3, 
                    transition: 'all 0.2s ease-in-out',
                    borderLeft: `5px solid ${module.color}`, // Side color bar
                    '&:hover': { 
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                      borderColor: module.color,
                      cursor: 'pointer' 
                    } 
                  }}
                  onClick={() => navigate(module.path)}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', p: 2.5 }}>
                    <Box sx={{ 
                      fontSize: '2rem', 
                      mr: 2, 
                      backgroundColor: `${module.color}10`, // Transparent background of the module color
                      p: 1.5, 
                      borderRadius: 2,
                      display: 'flex'
                    }}>
                      {module.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {module.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        {module.type}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}