import { Box, Typography } from '@mui/material';

function UserLoggedOut() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Logged Out Successfully
      </Typography>
      <Typography variant="body1" color="text.secondary">
        You have been signed out. Close this window or navigate away.
      </Typography>
    </Box>
  );
}

export default UserLoggedOut;
