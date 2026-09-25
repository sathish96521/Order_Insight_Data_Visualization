import { useState, FormEvent, ChangeEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../../context/AuthContext';

const BACKEND_OIDC_URL = import.meta.env.VITE_BACKEND_OIDC_URL || '/IsomReportingServices';
const authMode = import.meta.env.VITE_AUTH_MODE || '';
const isLocalMode = authMode === 'test';

function AuthPage() {
  const [attuid, setAttuid] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!attuid.trim()) {
      setErrorMessage('ATTUID is required');
      return;
    }

    setLoading(true);
    try {
      await login(attuid.trim());
      navigate({ to: '/' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your ATTUID.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSsoLogin = () => {
    window.location.href = `${BACKEND_OIDC_URL}/api/auth/oidc-login`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        px: 2,
        background: 'linear-gradient(160deg, #f5f8fb 0%, #d8e7f6 100%)',
      }}
    >
      <Card elevation={4} sx={{ width: '100%', maxWidth: 400 }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#067ab4' }}>
              AT&amp;T ISOM
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              ISOM Reporting Services
            </Typography>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {isLocalMode ? (
            <Box component="form" onSubmit={handleLoginSubmit}>
              <TextField
                fullWidth
                label="ATTUID"
                value={attuid}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setAttuid(event.target.value)}
                variant="outlined"
                size="small"
                sx={{ mb: 2 }}
                autoFocus
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: '#067ab4',
                  '&:hover': { backgroundColor: '#045a8a' },
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sign in with AT&T SSO.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSsoLogin}
                sx={{
                  backgroundColor: '#067ab4',
                  '&:hover': { backgroundColor: '#045a8a' },
                }}
              >
                Continue with SSO
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default AuthPage;
