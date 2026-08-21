import React from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPassword, setShowPassword] = React.useState(false);
  const [credentials, setCredentials] = React.useState({ email: '', password: '' });
  const [twoFactor, setTwoFactor] = React.useState({ required: false, challengeToken: '', code: '' });
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [resetStep, setResetStep] = React.useState('request');
  const [resetForm, setResetForm] = React.useState({ email: '', token: '', newPassword: '', confirmPassword: '' });
  const [completedCohorts, setCompletedCohorts] = React.useState([]);
  const [selectedAlumniCohort, setSelectedAlumniCohort] = React.useState(null);
  const [isAlumniSetupLink, setIsAlumniSetupLink] = React.useState(false);
  const [resetMessage, setResetMessage] = React.useState('');
  const [resetError, setResetError] = React.useState('');
  const [resetDevToken, setResetDevToken] = React.useState('');
  const [resetLoading, setResetLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  React.useEffect(() => {
    const resetToken = searchParams.get('reset_token');
    if (!resetToken) return;
    setResetDialogOpen(true);
    setResetStep('confirm');
    setIsAlumniSetupLink(true);
    setResetForm((current) => ({
      ...current,
      email: searchParams.get('email') || current.email,
      token: resetToken,
    }));
    setResetMessage('Reset link opened. Choose a new password.');
    setResetError('');
    setResetDevToken('');
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  React.useEffect(() => {
    if (!isAlumniSetupLink) return;
    let mounted = true;
    fetch(`${apiBaseUrl.replace(/\/$/, '')}/cohorts/completed`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to load cohorts');
        if (mounted) {
          setCompletedCohorts(Array.isArray(data) ? data : []);
          setSelectedAlumniCohort((current) => current || data?.[0] || null);
        }
      })
      .catch(() => {
        if (mounted) setCompletedCohorts([]);
      });
    return () => {
      mounted = false;
    };
  }, [apiBaseUrl, isAlumniSetupLink]);

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
      if (data.requires_two_factor) {
        setTwoFactor({ required: true, challengeToken: data.challenge_token, code: '' });
        return;
      }

      window.localStorage.setItem('three13_token', data.token);
      window.sessionStorage.setItem('three13_student_start_pane', 'dashboard');
      window.sessionStorage.setItem('three13_admin_start_pane', 'dashboard');
      navigate('/dashboard', { replace: true, state: { studentStartPane: 'dashboard' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const completeTwoFactorSignIn = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/login/2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_token: twoFactor.challengeToken,
          code: twoFactor.code,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to verify code');
      window.localStorage.setItem('three13_token', data.token);
      window.sessionStorage.setItem('three13_student_start_pane', 'dashboard');
      window.sessionStorage.setItem('three13_admin_start_pane', 'dashboard');
      navigate('/dashboard', { replace: true, state: { studentStartPane: 'dashboard' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openResetDialog = () => {
    setResetDialogOpen(true);
    setResetStep('request');
    setResetForm({ email: credentials.email || '', token: '', newPassword: '', confirmPassword: '' });
    setResetMessage('');
    setResetError('');
    setResetDevToken('');
    setError('');
  };

  const requestPasswordReset = async (event) => {
    event.preventDefault();
    setResetLoading(true);
    setResetError('');
    setResetMessage('');
    setResetDevToken('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/password-reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetForm.email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to request password reset');
      setResetMessage(data.message || 'Password reset instructions generated.');
      setResetDevToken(data.dev_token || '');
      setResetForm((current) => ({ ...current, token: data.dev_token || current.token }));
      setResetStep('confirm');
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const confirmPasswordReset = async (event) => {
    event.preventDefault();
    setResetLoading(true);
    setResetError('');
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError('New password and confirmation do not match');
      setResetLoading(false);
      return;
    }
    if (isAlumniSetupLink && completedCohorts.length > 0 && !selectedAlumniCohort) {
      setResetError('Choose the cohort you belonged to.');
      setResetLoading(false);
      return;
    }
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/password-reset/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetForm.token,
          new_password: resetForm.newPassword,
          cohort_id: isAlumniSetupLink && selectedAlumniCohort?.id ? selectedAlumniCohort.id : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to reset password');
      setResetMessage(data.message || 'Password reset successfully.');
      setCredentials((current) => ({ ...current, email: resetForm.email, password: '' }));
      setResetForm({ email: resetForm.email, token: '', newPassword: '', confirmPassword: '' });
      setResetDevToken('');
      setResetStep('done');
    } catch (err) {
      setResetError(err.message);
    } finally {
      setResetLoading(false);
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
              onSubmit={twoFactor.required ? completeTwoFactorSignIn : handleEmailSignIn}
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
                {twoFactor.required ? 'Verify your login' : 'Sign in'}
              </Typography>
              <Typography sx={{ color: '#637083', mb: 3 }}>
                {twoFactor.required ? 'Enter the code from Google Authenticator to finish signing in.' : 'Access your student workspace.'}
              </Typography>

              {!twoFactor.required ? <Stack spacing={2}>
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
              </Stack> : <Stack spacing={2}>
                <TextField
                  required
                  fullWidth
                  label={twoFactor.method === 'email' ? 'Email verification code' : 'Authenticator code'}
                  value={twoFactor.code}
                  onChange={(event) => setTwoFactor((current) => ({ ...current, code: event.target.value }))}
                  inputProps={{ inputMode: 'numeric', maxLength: 8 }}
                  helperText="Use the 6-digit code from Google Authenticator."
                />
              </Stack>}

              {error && (
                <Typography sx={{ color: '#c62828', fontSize: 13, mt: 1.5, fontWeight: 700 }}>
                  {error}
                </Typography>
              )}

              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5, mb: 2 }}>
                {!twoFactor.required && <FormControlLabel control={<Checkbox defaultChecked color="primary" />} label={<Typography sx={{ fontSize: 14 }}>Remember me</Typography>} />}
                <Link component="button" type="button" underline="hover" onClick={openResetDialog} sx={{ fontSize: 14, fontWeight: 700 }}>
                  Lost password?
                </Link>
              </Stack>

              <Button type="submit" variant="contained" color="secondary" fullWidth size="large" disabled={loading} sx={{ color: '#fff', mb: 2 }}>
                {loading ? (twoFactor.required ? 'Verifying...' : 'Signing in...') : (twoFactor.required ? 'Verify and sign in' : 'Sign in now')}
              </Button>
              {twoFactor.required && (
                <Button fullWidth variant="text" onClick={() => setTwoFactor({ required: false, challengeToken: '', code: '' })}>
                  Back to password
                </Button>
              )}

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

      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 900 }}>
          Reset password
        </DialogTitle>
        <DialogContent>
          <Stack
            component="form"
            id={resetStep === 'request' ? 'password-reset-request-form' : 'password-reset-confirm-form'}
            onSubmit={resetStep === 'request' ? requestPasswordReset : confirmPasswordReset}
            spacing={1.5}
            sx={{ pt: 1 }}
          >
            <Typography sx={{ color: '#637083', fontSize: 14 }}>
              {resetStep === 'request'
                ? 'Enter your account email and we will send reset instructions.'
                : resetStep === 'done'
                  ? 'Your password has been updated.'
                  : 'Use the reset token from your email and choose a new password.'}
            </Typography>
            {resetMessage && (
              <Typography sx={{ color: '#16805f', fontSize: 13, fontWeight: 800 }}>
                {resetMessage}
              </Typography>
            )}
            {resetDevToken && (
              <Box sx={{ bgcolor: '#eef3f8', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1, p: 1.2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 12 }}>Development reset token</Typography>
                <Typography sx={{ color: '#526273', fontSize: 12, overflowWrap: 'anywhere' }}>{resetDevToken}</Typography>
              </Box>
            )}
            {resetError && (
              <Typography sx={{ color: '#c62828', fontSize: 13, fontWeight: 700 }}>
                {resetError}
              </Typography>
            )}
            {resetStep === 'request' && (
              <TextField
                label="Email address"
                type="email"
                value={resetForm.email}
                onChange={(event) => setResetForm((current) => ({ ...current, email: event.target.value }))}
                required
                autoComplete="email"
              />
            )}
            {resetStep === 'confirm' && (
              <>
                {isAlumniSetupLink && (
                  <Autocomplete
                    options={completedCohorts}
                    value={selectedAlumniCohort}
                    onChange={(_event, option) => setSelectedAlumniCohort(option)}
                    getOptionLabel={(option) => option?.name || ''}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Alumni cohort"
                        helperText={completedCohorts.length ? 'Select the cohort you belonged to.' : 'No completed cohorts are available yet.'}
                      />
                    )}
                  />
                )}
                <TextField
                  label="Reset token"
                  value={resetForm.token}
                  onChange={(event) => setResetForm((current) => ({ ...current, token: event.target.value }))}
                  required
                />
                <TextField
                  label="New password"
                  type="password"
                  value={resetForm.newPassword}
                  onChange={(event) => setResetForm((current) => ({ ...current, newPassword: event.target.value }))}
                  required
                  helperText="Use at least 9 characters."
                />
                <TextField
                  label="Confirm new password"
                  type="password"
                  value={resetForm.confirmPassword}
                  onChange={(event) => setResetForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  required
                />
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setResetDialogOpen(false)}>Close</Button>
          {resetStep === 'request' && (
            <Button type="submit" form="password-reset-request-form" variant="contained" color="secondary" disabled={resetLoading}>
              {resetLoading ? 'Sending...' : 'Continue'}
            </Button>
          )}
          {resetStep === 'confirm' && (
            <Button type="submit" form="password-reset-confirm-form" variant="contained" color="secondary" disabled={resetLoading}>
              {resetLoading ? 'Resetting...' : 'Reset password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
