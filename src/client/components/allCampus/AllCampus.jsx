import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, Grid, Card, CardMedia, CardContent, Typography, 
  IconButton, Modal, Backdrop, Button, Avatar, Chip, TextField, InputAdornment
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import SchoolIcon from '@mui/icons-material/School';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import { API_BASE_URL } from '../../../config/env';
import { IMAGE_BASE_URL } from '../../../config/env';


const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);
const MotionDiv = motion.create('div');


export default function AllCampus() {
  const [open, setOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleOpen = (campus) => { 
    setSelectedCampus(campus); 
    setOpen(true); 
  };
  
  const handleClose = () => { 
    setOpen(false); 
    setTimeout(() => setSelectedCampus(null), 300);
  };

  useEffect(() => {
    const fetchCampus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/campus/all`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const resp = await response.json();
        
        setCampuses(resp.allCampus || []);
      } catch (error) { 
        console.error('❌ Error:', error); 
      }
    };

    fetchCampus();
  }, []);

  const filteredCampuses = campuses.filter(campus =>
    campus.campus_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campus.manager_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatLocation = (location) => {
    if (!location || typeof location !== 'object') return 'International Hub';
    
    const { city, country } = location;
    if (!city && !country) return 'International Hub';
    if (city && country) return `${city}, ${country}`;
    return city || country;
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Decorative Elements */}
      <Box sx={{
        position: 'absolute',
        top: -100,
        right: -100,
        width: 400,
        height: 400,
        background: 'radial-gradient(circle, rgba(73,137,200,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />
      
      <Box sx={{
        position: 'absolute',
        bottom: -150,
        left: -150,
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(255,127,62,0.08) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      <Box sx={{ position: 'relative', zIndex: 1, p: { xs: 2, sm: 3, md: 4 },m:1}}>
       
        {/* Header Section */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          sx={{ mb: 4 }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            mb: 3,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <MotionDiv
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <SchoolIcon sx={{ fontSize: 48, color: '#2a629a' }} />
              </MotionDiv>
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800, 
                    color: '#1a2027',
                    background: 'linear-gradient(135deg, #2a629a 0%, #4989c8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5
                  }}
                >
                  Our Elite Campuses
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={`${campuses.length} Campus actifs`}
                    size="small"
                    sx={{ 
                      background: 'linear-gradient(135deg, #ff7f3e 0%, #ffda78 100%)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                  <Chip 
                    label="Premium Network"
                    size="small"
                    variant="outlined"
                    sx={{ borderColor: '#4989c8', color: '#4989c8', fontWeight: 600 }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Search Bar */}
            <TextField
              placeholder="Rechercher un campus..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#4989c8' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                minWidth: { xs: '100%', sm: 225, md:350 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }
                }
              }}
            />
          </Box>

          {/* Stats Bar */}
          <MotionDiv
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              p: 3,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              {[
                { icon: <LocationOnIcon />, label: 'Countries', value: '12+', color: '#2a629a' },
                { icon: <GroupsIcon />, label: 'Students', value: '10K+', color: '#4989c8' },
                { icon: <PersonIcon />, label: 'Managers', value: campuses.length, color: '#ff7f3e' },
                { icon: <TrendingUpIcon />, label: 'Success Rate', value: '98%', color: '#ffc52c' }
              ].map((stat, i) => (
                <MotionDiv
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  style={{ flex: 1, minWidth: 150 }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5,
                    p: 2,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                    border: `1px solid ${stat.color}30`
                  }}>
                    <Box sx={{ 
                      color: stat.color,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: stat.color }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Box>
                  </Box>
                </MotionDiv>
              ))}
            </Box>
          </MotionDiv>
        </MotionBox>

        {/* Campus Grid */}
        <Box>
          <Grid 
            container 
            spacing={4} 
            justifyContent="center" 
            sx={{ mt: 2 }}
          >
            {filteredCampuses.map((campus, index) => (
            <Grid
              size={{ xs: 12, sm: 12, md: 6, lg:4}}
              sx={{display:'flex', justifyContent:'center'}}
              key={campus.id || index}
            >
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ y: -12 }}
                sx={{ 
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: { md: 420, lg: 460 },
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: 'linear-gradient(90deg, #2a629a 0%, #4989c8 50%, #ff7f3e 100%)',
                    transform: 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.3s ease'
                  },
                  '&:hover::before': {
                    transform: 'scaleX(1)'
                  }
                }}
                onClick={() => handleOpen(campus)}
              >
                {/* Image with Overlay */}
                <Box sx={{ 
                  position: 'relative', 
                  overflow: 'hidden', 
                  height: { xs: 220, md: 260 }
                }}>
                  <MotionDiv
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    style={{ height: '100%' }}
                  >
                    <CardMedia
                      component="img"
                      image={`${IMAGE_BASE_URL}${campus.campus_image}`}
                      alt={campus.campus_name}
                      sx={{ 
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </MotionDiv>
                  
                  {/* Gradient Overlay */}
                  <Box sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    p: 2.5
                  }}>
                    <MotionDiv
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: 'white', 
                          fontWeight: 700,
                          textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          mb: 0.5
                        }}
                      >
                        {campus.campus_name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 16, color: '#ffda78' }} />
                        <Typography variant="body2" sx={{ color: '#ffda78', fontWeight: 500 }}>
                          International Hub
                        </Typography>
                      </Box>
                    </MotionDiv>
                  </Box>

                  {/* Floating Badge */}
                  <Box sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 2,
                    px: 2,
                    py: 0.5,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#2a629a' }}>
                      ⭐ Premium
                    </Typography>
                  </Box>
                </Box>

                {/* Content */}
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar 
                        sx={{ 
                          width: 40, 
                          height: 40,
                          background: 'linear-gradient(135deg, #2a629a 0%, #4989c8 100%)',
                          fontWeight: 700
                        }}
                      >
                        {campus.manager_name?.charAt(0) || 'M'}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Campus Manager
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a2027' }}>
                          {campus.manager_name}
                        </Typography>
                      </Box>
                    </Box>

                    <MotionDiv
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IconButton 
                        size="small"
                        sx={{ 
                          background: 'linear-gradient(135deg, #4989c8 0%, #2a629a 100%)',
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(73,137,200,0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #2a629a 0%, #4989c8 100%)',
                            boxShadow: '0 6px 16px rgba(73,137,200,0.4)',
                          }
                        }}
                      >
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </MotionDiv>
                  </Box>

                  {/* Quick Info Tags */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      size="small" 
                      label="Active" 
                      sx={{ 
                        backgroundColor: '#e8f5e9',
                        color: '#2e7d32',
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }} 
                    />
                    <Chip 
                      size="small" 
                      label="Verified" 
                      sx={{ 
                        backgroundColor: '#e3f2fd',
                        color: '#1565c0',
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }} 
                    />
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>
            ))}
          </Grid>
          </Box>

        {/* No Results */}
        {filteredCampuses.length === 0 && (
          <MotionDiv
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Box sx={{ 
              textAlign: 'center', 
              p: 8,
              background: 'white',
              borderRadius: 4,
              mt: 4,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
            }}>
              <SearchIcon sx={{ fontSize: 80, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Aucun campus trouvé
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Essayez une autre recherche
              </Typography>
            </Box>
          </MotionDiv>
        )}
      </Box>

      {/* Premium Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ 
          timeout: 500, 
          sx: { 
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(0,0,0,0.5)'
          } 
        }}
      >
        <MotionDiv
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '90%', md: 600 },
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 6,
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.5)'
          }}>
            {/* Header Image */}
            <Box sx={{ 
              position: 'relative', 
              height: 280, 
              overflow: 'hidden'
            }}>
              <motion.img 
                src={`${IMAGE_BASE_URL}${selectedCampus?.campus_image}`}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
              />
              
              <Box sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)'
              }} />

              {/* Close Button */}
              <IconButton
                onClick={handleClose}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'white',
                    transform: 'rotate(90deg)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <CloseIcon />
              </IconButton>

              {/* Campus Name Overlay */}
              <Box sx={{
                position: 'absolute',
                bottom: 24,
                left: 24,
                right: 24
              }}>
                <MotionDiv
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      color: 'white', 
                      fontWeight: 800,
                      textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                      mb: 1
                    }}
                  >
                    {selectedCampus?.campus_name}
                  </Typography>
                  <Chip 
                    label="Elite Campus Network"
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #ff7f3e 0%, #ffda78 100%)',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </MotionDiv>
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ p: 4 }}>
              <MotionDiv
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 3,
                    background: 'linear-gradient(135deg, #2a629a 0%, #4989c8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Campus Information
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  {[
                    { 
                      icon: <PersonIcon />, 
                      label: 'Campus Manager', 
                      value: selectedCampus?.manager_name,
                      color: '#2a629a'
                    },
                    { 
                      icon: <EmailIcon />, 
                      label: 'Contact Email', 
                      value: selectedCampus?.email || 'contact@campus.com',
                      color: '#4989c8'
                    },
                    { 
                      icon: <PhoneIcon />, 
                      label: 'Phone Number', 
                      value: selectedCampus?.phone || '+1 (555) 123-4567',
                      color: '#ff7f3e'
                    },
                    { 
                        icon: <LocationOnIcon />, 
                        label: 'Location', 
                        value: formatLocation(selectedCampus?.location),
                        color: '#ffda78'
                    }
                  ].map((item, i) => (
                    <MotionDiv
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        p: 2,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${item.color}08 0%, ${item.color}02 100%)`,
                        border: `1px solid ${item.color}20`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}05 100%)`,
                          transform: 'translateX(8px)'
                        }
                      }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: `${item.color}20`,
                            color: item.color,
                            width: 48,
                            height: 48
                          }}
                        >
                          {item.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ display: 'block', fontWeight: 600 }}
                          >
                            {item.label}
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 700,
                              color: '#1a2027'
                            }}
                          >
                            {item.value}
                          </Typography>
                        </Box>
                      </Box>
                    </MotionDiv>
                  ))}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <MotionDiv style={{ flex: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        background: 'linear-gradient(135deg, #2a629a 0%, #4989c8 100%)',
                        borderRadius: 3,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(42,98,154,0.3)',
                        '&:hover': {
                          boxShadow: '0 6px 16px rgba(42,98,154,0.4)'
                        }
                      }}
                    >
                      Visit Campus
                    </Button>
                  </MotionDiv>
                  <MotionDiv style={{ flex: 1 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleClose}
                      sx={{
                        borderRadius: 3,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '1rem',
                        borderWidth: 2,
                        borderColor: '#e0e0e0',
                        color: '#666',
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: '#2a629a',
                          backgroundColor: 'rgba(42,98,154,0.04)'
                        }
                      }}
                    >
                      Close
                    </Button>
                  </MotionDiv>
                </Box>
              </MotionDiv>
            </Box>
          </Box>
        </MotionDiv>
      </Modal>
    </Box>
  );
}