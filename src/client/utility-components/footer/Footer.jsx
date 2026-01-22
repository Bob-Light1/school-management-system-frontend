import { Box, Typography, Container, Grid, IconButton, Divider } from '@mui/material';
import { School, Email, Phone, LocationOn, Facebook, Twitter, LinkedIn, Instagram } from '@mui/icons-material';
import React from 'react';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        background: 'linear-gradient(135deg, #4989c8 0%, #3a6fa8 50%, #2d5a8f 100%)',
        color: 'white',
        pt: 6,
        pb: 3,
        mt: 4,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.5) 50%, #fff 100%)',
          opacity: 0.3,
        }
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* About Section */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <School sx={{ fontSize: 32, mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                School App
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.7 }}>
              A comprehensive solution for modern management of schools and universities.
            </Typography>
          </Grid>

          {/* Quick Links Section */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {['Home', 'Campus', 'Students', 'Teachers', 'About'].map((link) => (
                <Typography
                  key={link}
                  variant="body2"
                  sx={{
                    opacity: 0.9,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      opacity: 1,
                      transform: 'translateX(5px)',
                      color: '#fff',
                    },
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Contact Section */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Contact
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ fontSize: 18, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  contact@schoolapp.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ fontSize: 18, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  +237 6XX XXX XXX
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: 18, opacity: 0.8 }} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Yaoundé, Cameroon
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Social Media Section */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
              Follow Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[
                { icon: <Facebook />, color: '#1877f2' },
                { icon: <Twitter />, color: '#1da1f2' },
                { icon: <LinkedIn />, color: '#0a66c2' },
                { icon: <Instagram />, color: '#e4405f' },
              ].map((social, index) => (
                <IconButton
                  key={index}
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: social.color,
                      transform: 'translateY(-3px)',
                      boxShadow: `0 5px 15px ${social.color}40`,
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 2, fontSize: '0.85rem' }}>
              Stay connected for the latest news and updates.
            </Typography>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8, textAlign: 'center' }}>
            © 2026 School Management App. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <Typography
                key={item}
                variant="body2"
                sx={{
                  opacity: 0.8,
                  cursor: 'pointer',
                  transition: 'opacity 0.3s',
                  '&:hover': { opacity: 1 },
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>

      {/* Decoration */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(50%, 50%)',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
};

export default Footer;