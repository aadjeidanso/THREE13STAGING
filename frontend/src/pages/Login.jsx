import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PhoneIcon from '@mui/icons-material/Phone';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const theme = createTheme({
  palette: {
    primary: { main: '#123c69', dark: '#082540' },
    secondary: { main: '#f05a28' },
  },
  typography: {
    fontFamily: 'Poppins, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 800, letterSpacing: 0 },
    h4: { fontWeight: 800, letterSpacing: 0 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
});

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [credentials, setCredentials] = React.useState({ email: '', password: '' });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const googleSignInUrl = `${apiBaseUrl.replace(/\/$/, '')}/auth/google`;

  const handleCredentialsChange = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const handleEmailSignIn = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to sign in');

      window.localStorage.setItem('three13_token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          color: '#fff',
          display: 'flex',
          alignItems: 'stretch',
          backgroundImage: 'linear-gradient(90deg, rgba(8,37,64,0.94), rgba(8,37,64,0.78), rgba(8,37,64,0.48)), url("/images/loginbgg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Container maxWidth="xl" sx={{ pt: { xs: 2, md: 0 }, pb: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: { xs: 5, md: 6 }, pt: { xs: 0, md: 3 } }}>
            <Button
              component={RouterLink}
              to="/"
              startIcon={<ArrowBackIcon />}
              sx={{
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.16)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
              }}
            >
              Back home
            </Button>
            <Box component="img" src="/images/logo.png" alt="Three13 IT Solutions" sx={{ position: { md: 'fixed' }, top: { md: 0 }, right: { md: 0 }, height: { xs: 58, md: 76 }, filter: 'drop-shadow(0 12px 22px rgba(0,0,0,0.24))', zIndex: 2 }} />
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 560px) minmax(360px, 440px)' },
              gap: { xs: 3, md: 6 },
              alignItems: 'center',
              justifyContent: 'center',
              flexGrow: 1,
              width: '100%',
              maxWidth: 1120,
              mx: 'auto',
              transform: { md: 'translateY(-26px)' },
            }}
          >
            <Box sx={{ display: { xs: 'none', md: 'block' }, maxWidth: 700, transform: { md: 'translateX(-32px)' } }}>
              <Typography variant="h1" sx={{ fontSize: { xs: '2.25rem', sm: '2.8rem', md: '5.4rem' }, lineHeight: 0.98, mb: { xs: 2, md: 3 } }}>
                Welcome back.
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.78)', fontSize: { xs: '0.95rem', md: '1.18rem' }, lineHeight: { xs: 1.6, md: 1.8 }, maxWidth: 580 }}>
                Sign in to continue your IT career journey, review course materials, and stay connected to your live training schedule.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2 }} sx={{ mt: { xs: 2.5, md: 4 }, color: 'rgba(255,255,255,0.82)', fontSize: { xs: '0.9rem', md: '1rem' } }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhoneIcon fontSize="small" />
                  <Typography>732-470-2430</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ overflowWrap: 'anywhere' }}>
                  <EmailIcon fontSize="small" />
                  <Typography>INFO@THREE13ITSOLUTIONS.COM</Typography>
                </Stack>
              </Stack>
            </Box>

            <Box
              component="form"
              onSubmit={handleEmailSignIn}
              sx={{
                bgcolor: 'rgba(255,255,255,0.94)',
                color: '#172635',
                borderRadius: 3,
                border: '1px solid rgba(255,255,255,0.36)',
                boxShadow: '0 24px 70px rgba(0,0,0,0.28)',
                p: { xs: 2, sm: 3, md: 4 },
                backdropFilter: 'blur(18px)',
                width: '100%',
                maxWidth: { xs: 380, md: 'none' },
                mx: 'auto',
              }}
            >
              <Typography variant="h4" sx={{ color: 'primary.dark', mb: 1 }}>
                Sign in
              </Typography>
              <Typography sx={{ color: '#637083', mb: 3 }}>
                Access your student workspace.
              </Typography>

              <Button
                fullWidth
                size="large"
                component="a"
                href={googleSignInUrl}
                sx={{
                  color: '#243447',
                  bgcolor: '#fff',
                  border: '1px solid rgba(23,38,53,0.16)',
                  mb: 2,
                  '&:hover': {
                    bgcolor: '#f8fbff',
                    borderColor: 'rgba(18,60,105,0.32)',
                    boxShadow: '0 10px 24px rgba(18,60,105,0.12)',
                  },
                }}
              >
                <Box
                  component="svg"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  sx={{ width: 20, height: 20, mr: 1.2 }}
                >
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.37c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.37 12 5.37z" />
                </Box>
                Continue with Google
              </Button>

              <Divider sx={{ mb: 2, color: '#8090a3', fontSize: 13 }}>
                or sign in with email
              </Divider>

              <Stack spacing={2}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={credentials.email}
                  onChange={handleCredentialsChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  required
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleCredentialsChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword((shown) => !shown)} onMouseDown={(event) => event.preventDefault()} edge="end" aria-label="Toggle password visibility">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              {error && (
                <Typography sx={{ color: '#c62828', fontSize: 13, mt: 1.5, fontWeight: 700 }}>
                  {error}
                </Typography>
              )}

              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5, mb: 2 }}>
                <FormControlLabel control={<Checkbox defaultChecked color="primary" />} label={<Typography sx={{ fontSize: 14 }}>Remember me</Typography>} />
                <Link href="#" underline="hover" sx={{ fontSize: 14, fontWeight: 700 }}>
                  Lost password?
                </Link>
              </Stack>

              <Button type="submit" variant="contained" color="secondary" fullWidth size="large" disabled={loading} sx={{ color: '#fff', mb: 2 }}>
                {loading ? 'Signing in...' : 'Sign in now'}
              </Button>

              <Divider sx={{ my: 2 }} />

              <Typography sx={{ color: '#637083', fontSize: 13, textAlign: 'center' }}>
                By signing in, you agree to our{' '}
                <Link component={RouterLink} to="/terms-of-service" sx={{ fontWeight: 700 }}>Terms</Link>
                {' '}and{' '}
                <Link component={RouterLink} to="/privacy-policy" sx={{ fontWeight: 700 }}>Privacy Policy</Link>.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
