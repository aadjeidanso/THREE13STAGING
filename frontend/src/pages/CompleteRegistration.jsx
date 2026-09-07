import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const theme = createTheme({
  palette: {
    primary: { main: '#123c69', dark: '#082540' },
    secondary: { main: '#f05a28' },
    success: { main: '#16805f' },
    background: { default: '#f6f8fb' },
  },
  typography: {
    fontFamily: 'Poppins, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: { fontWeight: 800, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
});

function PayPalMark() {
  return (
    <Box
      component="svg"
      aria-hidden="true"
      viewBox="0 0 64 64"
      sx={{
        width: 22,
        height: 22,
        display: 'inline-block',
        overflow: 'visible',
      }}
    >
      <path
        fill="#003087"
        d="M19.2 7.2h23.4c9.9 0 17.2 7.1 17.2 16.5 0 12.2-9.5 20.7-23 20.7H28l-2.4 12.4H12.1L19.2 7.2Z"
      />
      <path
        fill="#009CDE"
        d="M29.2 20.1h18.4c8.9 0 14.2 5.6 13.1 13.8-1.4 10.2-9.7 16.8-21.4 16.8h-5.7l-1.4 7.1H18.9l4.7-30.4c0.7-4.6 2.1-7.3 5.6-7.3Z"
        opacity="0.96"
      />
      <path
        fill="#001C64"
        d="M29.2 20.1h18.4c5.9 0 10.3 2.5 12 6.7-2.5 10.2-10.7 16.1-22.8 16.1H25.9l2.5-16.1c0.4-2.8 0.9-5 0.8-6.7Z"
        opacity="0.82"
      />
    </Box>
  );
}

export default function CompleteRegistration() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const paymentState = searchParams.get('payment') || '';
  const paymentId = searchParams.get('payment_id') || '';
  const paypalOrderId = searchParams.get('token') || '';
  const [registration, setRegistration] = React.useState(null);
  const [programConfig, setProgramConfig] = React.useState(null);
  const [loading, setLoading] = React.useState(Boolean(token) && !paymentState);
  const [saving, setSaving] = React.useState(false);
  const [paying, setPaying] = React.useState('');
  const [capturing, setCapturing] = React.useState(false);
  const [paymentStatus, setPaymentStatus] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [accountReady, setAccountReady] = React.useState(Boolean(paymentState || !token));
  const [paymentRequired, setPaymentRequired] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [form, setForm] = React.useState({ password: '', confirmPassword: '' });
  const hasSession = Boolean(window.localStorage.getItem('three13_token'));

  React.useEffect(() => {
    let ignore = false;
    const loadConfig = async () => {
      try {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/program-enrollment/config`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to load program configuration');
        if (!ignore) setProgramConfig(data);
      } catch (_err) {
        if (!ignore) setProgramConfig({ program_fee_cents: 0, currency: 'USD' });
      }
    };
    loadConfig();
    return () => {
      ignore = true;
    };
  }, []);

  React.useEffect(() => {
    if (!token || paymentState) {
      setLoading(false);
      return;
    }
    let ignore = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/registrations/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to validate registration link');
        if (!ignore) setRegistration(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [token, paymentState]);

  React.useEffect(() => {
    if (paymentState === 'paypal-approved' && paypalOrderId) {
      const capture = async () => {
        setCapturing(true);
        setError('');
        try {
          const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/payments/paypal/${encodeURIComponent(paypalOrderId)}/capture`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${window.localStorage.getItem('three13_token') || ''}` },
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || 'Unable to confirm PayPal payment');
          setError('');
          setPaymentRequired(false);
          setAccountReady(true);
          setMessage(data.message || 'Payment confirmed. Your account is active.');
        } catch (err) {
          setError(err.message);
        } finally {
          setCapturing(false);
        }
      };
      capture();
    }
  }, [paymentState, paypalOrderId]);

  React.useEffect(() => {
    if (paymentState !== 'success' || !paymentId) return undefined;
    let ignore = false;
    let attempts = 0;
    const checkStatus = async () => {
      attempts += 1;
      try {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/payments/${paymentId}/status`, {
          headers: { Authorization: `Bearer ${window.localStorage.getItem('three13_token') || ''}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to check payment status');
        if (!ignore) {
          setPaymentStatus(data);
          if (data.status === 'paid' && data.learner_active) {
            setError('');
            setPaymentRequired(false);
            setAccountReady(true);
            setMessage('Enrollment complete. Your payment was successful and your Three13 learner account is now active.');
            return;
          }
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      }
      if (!ignore && attempts < 8) {
        window.setTimeout(checkStatus, 2500);
      }
    };
    checkStatus();
    return () => {
      ignore = true;
    };
  }, [paymentState, paymentId]);

  const feeCents = registration?.program_fee_cents ?? programConfig?.program_fee_cents ?? 0;
  const feeCurrency = registration?.currency ?? programConfig?.currency ?? 'USD';
  const feeLabel = feeCents ? `${feeCurrency} ${(feeCents / 100).toFixed(2)}` : 'Program fee';
  const paymentComplete = Boolean(
    (paymentStatus?.status === 'paid' && paymentStatus?.learner_active) ||
    (message && paymentState !== 'cancelled')
  );

  const retryPayment = () => {
    setPaymentStatus(null);
    setMessage('');
    setError('');
    navigate('/complete-registration', { replace: true });
  };

  const completeAccount = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/registrations/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: form.password, confirm_password: form.confirmPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to complete registration');
      window.localStorage.setItem('three13_token', data.token);
      setAccountReady(true);
      setPaymentRequired(data.payment_required);
      setMessage(data.message);
      if (!data.payment_required) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startPayment = async (provider) => {
    setPaying(provider);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/payments/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem('three13_token') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to start payment');
      if (!data.checkout_url) throw new Error('Payment provider did not return a checkout link');
      window.location.assign(data.checkout_url);
    } catch (err) {
      setError(err.message);
    } finally {
      setPaying('');
    }
  };

  const renderPaymentState = () => (
    <Stack spacing={2.2}>
      <Chip icon={<LockIcon />} label="Secure payment processing" sx={{ alignSelf: 'flex-start', bgcolor: '#eaf2ff', color: '#123c69', fontWeight: 850 }} />
      <Box sx={{ p: 2, border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, bgcolor: '#fff' }}>
        <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.25rem' }}>Three13 IT Training Program</Typography>
        <Typography sx={{ color: '#526273', mt: 0.4 }}>Full Program Bundle</Typography>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ color: '#526273', fontWeight: 800 }}>Total</Typography>
          <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.45rem' }}>{feeLabel}</Typography>
        </Stack>
      </Box>
      <Stack spacing={1.2}>
        <Button variant="contained" color="secondary" startIcon={<CreditCardIcon />} endIcon={<ArrowForwardIcon />} disabled={Boolean(paying)} onClick={() => startPayment('stripe')}>
          {paying === 'stripe' ? 'Opening secure checkout...' : `Pay ${feeLabel} with Card / Apple Pay`}
        </Button>
        <Button variant="outlined" startIcon={<PayPalMark />} disabled={Boolean(paying)} onClick={() => startPayment('paypal')} sx={{ color: 'primary.dark', borderColor: 'rgba(18,60,105,0.35)', fontWeight: 850 }}>
          {paying === 'paypal' ? 'Opening PayPal...' : 'Pay with PayPal'}
        </Button>
      </Stack>
    </Stack>
  );

  const renderSessionMissing = () => (
    <Stack spacing={2}>
      <Alert severity="warning">
        Your registration is saved, but this browser does not have an active learner session. Please sign in, then choose Complete Enrollment from your dashboard.
      </Alert>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
        <Button variant="contained" color="secondary" component={Link} to="/login">Sign In</Button>
        <Button variant="outlined" component={Link} to="/" sx={{ color: 'primary.dark' }}>Back to Home</Button>
      </Stack>
    </Stack>
  );

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', py: { xs: 3, md: 6 } }}>
        <Container maxWidth="md">
          <Box sx={{ bgcolor: '#fff', borderRadius: 2, border: '1px solid rgba(18,60,105,0.12)', boxShadow: '0 24px 70px rgba(8,37,64,0.12)', overflow: 'hidden' }}>
            <Box sx={{ p: { xs: 2.2, md: 3.4 }, bgcolor: '#082540', color: '#fff' }}>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: '1.9rem', md: '2.35rem' }, lineHeight: 1.1 }}>
                {paymentState ? 'Complete Your Enrollment' : 'Complete Your Registration'}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.76)', mt: 1 }}>
                {paymentState ? 'Payment confirmation is handled securely by the server.' : "Welcome to Three13. Let's finish setting up your learner account."}
              </Typography>
            </Box>
            <Box sx={{ p: { xs: 2.2, md: 3.4 } }}>
              {loading ? (
                <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress /></Stack>
              ) : !token && !paymentState && !hasSession ? (
                renderSessionMissing()
              ) : paymentState ? (
                <Stack spacing={2}>
                  {capturing && <Alert severity="info">Confirming payment...</Alert>}
                  {paymentState === 'success' && !message && <Alert severity="info">Thanks. We are waiting for the secure payment webhook to activate your account. This usually takes a moment.</Alert>}
                  {paymentStatus && paymentStatus.status !== 'paid' && <Alert severity="warning">Payment status: {paymentStatus.status}. Your account will unlock after provider verification is complete.</Alert>}
                  {paymentState === 'cancelled' && <Alert severity="warning">Payment was cancelled. Your registration is saved, and you can try again anytime.</Alert>}
                  {message && <Alert severity="success">{message}</Alert>}
                  {error && !paymentComplete && <Alert severity="error">{error}</Alert>}
                  {(paymentState === 'cancelled' || (error && !paymentComplete)) && hasSession && renderPaymentState()}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                    {(paymentState === 'success' || message) && <Button variant="contained" color="secondary" onClick={() => navigate('/dashboard')}>Go to My Dashboard</Button>}
                    {paymentState === 'cancelled' && hasSession && <Button variant="outlined" onClick={retryPayment} sx={{ color: 'primary.dark' }}>Choose Another Payment Method</Button>}
                    {!hasSession && <Button variant="contained" color="secondary" component={Link} to="/login">Sign In</Button>}
                    <Button variant="outlined" component={Link} to="/" sx={{ color: 'primary.dark' }}>Back to Home</Button>
                  </Stack>
                </Stack>
              ) : error ? (
                <Stack spacing={2}>
                  <Alert severity="error">{error}</Alert>
                  <Button variant="contained" color="secondary" component={Link} to="/">Request a New Link</Button>
                </Stack>
              ) : accountReady ? (
                paymentRequired ? renderPaymentState() : <Alert severity="success">Your account is active.</Alert>
              ) : (
                <Stack component="form" onSubmit={completeAccount} spacing={2.1}>
                  {registration && (
                    <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: '#f8fafc', border: '1px solid rgba(18,60,105,0.1)' }}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <CheckCircleIcon sx={{ color: '#16805f' }} />
                        <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Email verified</Typography>
                      </Stack>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>{registration.first_name} {registration.last_name}</Typography>
                      <Typography sx={{ color: '#526273', fontSize: 14 }}>{registration.email}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.4 }}>
                    <TextField
                      required
                      label="Create Password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                      helperText="Use at least 12 characters. Passphrases are welcome."
                      InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword((shown) => !shown)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
                    />
                    <TextField
                      required
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                      InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowConfirmPassword((shown) => !shown)}>{showConfirmPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }}
                    />
                  </Box>
                  {message && <Alert severity="success">{message}</Alert>}
                  {error && <Alert severity="error">{error}</Alert>}
                  <Button type="submit" variant="contained" color="secondary" disabled={saving} endIcon={<ArrowForwardIcon />}>
                    {saving ? 'Creating account...' : 'Continue to Payment'}
                  </Button>
                </Stack>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
