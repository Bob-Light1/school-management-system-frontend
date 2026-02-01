import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import {
  Box,
  IconButton,
  InputLabel,
  InputAdornment,
  FormControl,
  OutlinedInput,
  CircularProgress,
  Typography,
  Button,
  FormHelperText,
  Snackbar,
  Alert,
  Paper,
  Stack,
  Fade,
  Zoom,
  alpha,
  useTheme,
} from '@mui/material';
import {
  MailOutline,
  LockOutlined,
  Visibility,
  VisibilityOff,
  Business,
  School,
  Badge,
  RecordVoiceOver,
  FamilyRestroom,
  Psychology,
  Handshake,
  Login as LoginIcon,
} from '@mui/icons-material';

import { loginSchema } from '../../../yupSchema/loginSchema';
import { useAuth } from '../../../hooks/useAuth';
import '../../styles/Background.css';

// User types configuration
const USER_TYPES = [
  {
    value: 'admin',
    label: 'Admin',
    icon: Business,
    gradient: 'linear-gradient(135deg, #003285 0%, #2a629a 100%)',
    color: '#003285',
  },
  {
    value: 'director',
    label: 'Director',
    icon: Handshake,
    gradient: 'linear-gradient(135deg, #ff7f3e 0%, #ff9f5a 100%)',
    color: '#ff7f3e',
  }
];



export default function LoginAdmin() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState('admin');
  const [useUsername, setUseUsername] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const currentUserType = USER_TYPES.find((type) => type.value === userType) || USER_TYPES[0];


  const formik = useFormik({
    initialValues: {
      identifier: '', // Can be email or username
      password: '',
    },
    validationSchema: loginSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        // Prepare credentials based on identifier type
        const credentials = {
          password: values.password,
        };

        // If using username, send username, otherwise send email
        if (useUsername) {
          credentials.username = values.identifier;
        } else {
          credentials.email = values.identifier;
        }

        await login(credentials, userType);

        setSnackbar({
          open: true,
          message: `✨ Welcome Back! Connected successfully as ${currentUserType.label}.`,
          severity: 'success',
        });

        // Redirect based on user type
        setTimeout(() => {
          const redirectMap = {
            admin: '/',
            director: '/',
          };

          navigate(redirectMap[userType] || '/dashboard');
        }, 1200);

      } catch (error) {
        const errorMessage =
          error.message || 'Failed to connect. Please verify your credentials.';
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

  const handleUserTypeChange = (event, newUserType) => {
    if (newUserType !== null) {
      setUserType(newUserType);
      formik.resetForm();
    }
  };

  const toggleIdentifierType = () => {
    setUseUsername(!useUsername);
    formik.setFieldValue('identifier', '');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
        overflow: 'hidden',
        background: currentUserType.gradient || '#4989c8',
        transition: 'background 0.5s ease',
      }}
      className="animated-background"
    >
      {/* Animated Bubbles */}
      <Box className="bubbles">
        <span className="bubble b1" />
        <span className="bubble b2" />
        <span className="bubble b3" />
        <span className="bubble b4" />
      </Box>

      <Zoom in timeout={600}>
        <Paper
          elevation={24}
          sx={{
            display: 'flex',
            width: '100%',
            maxWidth: 1100,
            borderRadius: 4,
            overflow: 'hidden',
            minHeight: 650,
            zIndex: 2,
            position: 'relative',
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(255,255,255,0.98)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
          }}
        >
          {/* Left Side: Branding - Hidden on mobile */}
          <Box
            sx={{
              flex: 1,
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#4989c8',
              color: 'white',
              p: 6,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              transition: 'background 0.5s ease',

              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1), transparent 50%)',
                animation: 'pulse 4s ease-in-out infinite',
              },

              '@keyframes pulse': {
                '0%, 100%': { opacity: 0.5 },
                '50%': { opacity: 1 },
              },
            }}
          >
            <Fade in timeout={1000}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h2" fontWeight="900" gutterBottom>
                  wewigo
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    opacity: 0.95,
                    fontWeight: 300,
                    mb: 4,
                    maxWidth: 400,
                    mx: 'auto',
                  }}
                >
                  The excellent platform for managing your educational institution
                </Typography>
                <Box
                  component="img"
                  src="../vite.svg"
                  sx={{
                    width: '70%',
                    maxWidth: 280,
                    filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.3))',
                    animation: 'float 6s ease-in-out infinite',
                  }}
                />
              </Box>
            </Fade>
          </Box>

          {/* Right Side: Form */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, sm: 6 },
              bgcolor: 'white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Fade in timeout={800}>
              <Box>
                {/* Header */}
                <Stack spacing={1} sx={{ mb: 4 }}>
                  <Typography
                    variant="h4"
                    fontWeight="900"
                    sx={{
                      background: currentUserType.gradient,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      transition: 'all 0.5s ease',
                    }}
                  >
                    Welcome Back
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Select your role and sign in to continue
                  </Typography>
                </Stack>

                {/* User Type Selection */}
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ mb: 2, color: 'text.secondary' }}
                >
                  I am a:
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      sm: 'repeat(3, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  {USER_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = userType === type.value;

                    return (
                      <Box
                        key={type.value}
                        onClick={() => handleUserTypeChange(null, type.value)}
                        sx={{
                          cursor: 'pointer',
                          borderRadius: 3,
                          p: 2,
                          textAlign: 'center',
                          border: '2px solid',
                          borderColor: isSelected ? type.color : 'divider',
                          bgcolor: isSelected
                            ? alpha(type.color, 0.08)
                            : 'background.paper',
                          transition: 'all 0.25s ease',
                          boxShadow: isSelected
                            ? `0 8px 24px ${alpha(type.color, 0.35)}`
                            : 'none',

                          '&:hover': {
                            transform: 'translateY(-2px)',
                            borderColor: type.color,
                            boxShadow: `0 6px 18px ${alpha(type.color, 0.25)}`,
                          },
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: 28,
                            mb: 1,
                            color: isSelected ? type.color : 'text.secondary',
                          }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight={isSelected ? 700 : 500}
                          color={isSelected ? type.color : 'text.primary'}
                        >
                          {type.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>


                {/* Login Form */}
                <form onSubmit={formik.handleSubmit}>
                  <Stack spacing={3}>
                    {/* Email/Username Field */}
                    <FormControl
                      fullWidth
                      error={
                        formik.touched.identifier &&
                        Boolean(formik.errors.identifier)
                      }
                    >
                      <InputLabel>
                        {useUsername ? 'Username' : 'Email Address'}
                      </InputLabel>
                      <OutlinedInput
                        name="identifier"
                        label={useUsername ? 'Username' : 'Email Address'}
                        value={formik.values.identifier}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={isLoading}
                        startAdornment={
                          <InputAdornment position="start">
                            {useUsername ? (
                              <Badge
                                sx={{ color: currentUserType.color }}
                              />
                            ) : (
                              <MailOutline
                                sx={{ color: currentUserType.color }}
                              />
                            )}
                          </InputAdornment>
                        }
                        sx={{
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 2,
                            transition: 'border-color 0.3s ease',
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: currentUserType.color,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: currentUserType.color,
                          },
                        }}
                      />
                      {formik.touched.identifier &&
                        formik.errors.identifier && (
                          <FormHelperText>
                            {formik.errors.identifier}
                          </FormHelperText>
                        )}
                      <Button
                        size="small"
                        onClick={toggleIdentifierType}
                        sx={{
                          mt: 0.5,
                          alignSelf: 'flex-start',
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          color: currentUserType.color,
                          '&:hover': {
                            bgcolor: alpha(currentUserType.color, 0.05),
                          },
                        }}
                      >
                        Use {useUsername ? 'Email' : 'Username'} instead
                      </Button>
                    </FormControl>

                    {/* Password Field */}
                    <FormControl
                      fullWidth
                      error={
                        formik.touched.password &&
                        Boolean(formik.errors.password)
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
                        startAdornment={
                          <InputAdornment position="start">
                            <LockOutlined
                              sx={{ color: currentUserType.color }}
                            />
                          </InputAdornment>
                        }
                        endAdornment={
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        }
                        sx={{
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 2,
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: currentUserType.color,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: currentUserType.color,
                          },
                        }}
                      />
                      {formik.touched.password && formik.errors.password && (
                        <FormHelperText>
                          {formik.errors.password}
                        </FormHelperText>
                      )}
                    </FormControl>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      fullWidth
                      size="large"
                      variant="contained"
                      disabled={isLoading}
                      startIcon={
                        isLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <LoginIcon />
                        )
                      }
                      sx={{
                        py: 1.8,
                        borderRadius: 2,
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        textTransform: 'none',
                        background: currentUserType.gradient,
                        boxShadow: `0 8px 20px ${alpha(
                          currentUserType.color,
                          0.3
                        )}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 12px 28px ${alpha(
                            currentUserType.color,
                            0.4
                          )}`,
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        },
                      }}
                    >
                      {isLoading
                        ? 'Connecting...'
                        : `Sign in as ${currentUserType.label}`}
                    </Button>
                  </Stack>
                </form>

                {/* Footer */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Need help?{' '}
                    <a
                      href="#"
                      style={{
                        color: currentUserType.color,
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      Contact Support
                    </a>
                  </Typography>
                </Box>
              </Box>
            </Fade>
          </Box>
        </Paper>
      </Zoom>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        slots={{
          transition: Zoom,
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          elevation={6}
          sx={{
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