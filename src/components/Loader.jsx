import { CircularProgress, Box, Typography } from '@mui/material';

export default function Loader() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        gap: 2,
        p: 3,
      }}
    >
      <CircularProgress size={50} />
      <Typography variant="body2" color="text.secondary">
        Loading...
      </Typography>
  </Box>
  );
}
