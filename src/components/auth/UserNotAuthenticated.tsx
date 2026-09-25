import { Box, Typography, Button } from '@mui/material';

const BACKEND_OIDC_URL = import.meta.env.VITE_BACKEND_OIDC_URL || '/IsomReportingServices';

function UserNotAuthenticated() {
  const handleReturnToLogin = async () => {
    try {
      await fetch(`${BACKEND_OIDC_URL}/api/auth/logout`, { credentials: 'include' });
    } catch {
      // Continue to login regardless
    }
    window.location.href = `${BACKEND_OIDC_URL}/api/auth/oidc-login`;
  };

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
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        You are not authorized to access this application.
      </Typography>
      <Button variant="contained" onClick={handleReturnToLogin}>
        Return to Login
      </Button>
    </Box>
  );
}

export default UserNotAuthenticated;
