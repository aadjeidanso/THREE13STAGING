import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Box,
  Typography,
  Button,
  Container,
  AppBar,
  Toolbar,
  IconButton,
  Fab,
  Collapse,
  // Add modal components
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  FormLabel,
  Grid,
  Stack
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import InstagramIcon from '@mui/icons-material/Instagram';
import ChatIcon from '@mui/icons-material/Chat';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

// Add modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: 'calc(100% - 40px)', sm: '85vw', md: '500px' },
  maxWidth: '550px',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: { xs: 1.2, sm: 3 },
  borderRadius: 2,
  maxHeight: '85vh',
  overflowY: 'auto',
  overflowX: 'auto',
};

const customTheme = createTheme({
  palette: {
    primary: { main: '#123c69', dark: '#082540' },
    secondary: { main: '#f05a28' },
    background: { default: '#f6f8fb' },
  },
  typography: {
    fontFamily: 'Poppins, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 800, letterSpacing: 0 },
    h2: { fontWeight: 800, letterSpacing: 0 },
    h3: { fontWeight: 800, letterSpacing: 0 },
    h4: { fontWeight: 800, letterSpacing: 0 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: 'none', minHeight: 44 },
      },
    },
  },
});

const navItems = [
  ['Home', 'top'],
  ['About Us', 'about'],
  ['Courses', 'courses'],
  ['FAQ', 'faq'],
  ['Contact', 'contact'],
  ['Testimonials', 'testimonials'],
];

const footerLinkSx = {
  color: 'rgba(255,255,255,0.78)',
  fontSize: '0.95rem',
  textDecorationColor: 'transparent',
  transition: 'color 180ms ease, text-decoration-color 180ms ease, transform 180ms ease',
  '&:hover': {
    color: '#7db7ff',
    textDecoration: 'underline',
    textDecorationColor: '#7db7ff',
    textUnderlineOffset: '5px',
    bgcolor: 'transparent',
    transform: 'translateY(-1px)',
  },
};

const footerContactLinkSx = {
  color: 'inherit',
  textDecoration: 'underline',
  textDecorationColor: 'transparent',
  textUnderlineOffset: '4px',
  transition: 'color 180ms ease, text-decoration-color 180ms ease, transform 180ms ease',
  '&:hover': {
    color: '#7db7ff',
    textDecorationColor: '#7db7ff',
    transform: 'translateY(-1px)',
  },
};

export default function PrivacyPolicy() {
  const headerRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHoveringLinks, setIsHoveringLinks] = useState(false);
  
  // Add modal state
  const [openModal, setOpenModal] = useState(false);
  
  // Add form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    courses: [],
    prerequisites: 'no',
    agree: false
  });

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
    agree: ''
  });

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCourseChange = (event) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      courses: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { password: '', confirmPassword: '', agree: '' };

    // Password validation
    if (formData.password.length < 9) {
      newErrors.password = 'Password must be at least 9 characters';
      isValid = false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // Agreement validation
    if (!formData.agree) {
      newErrors.agree = 'You must agree to the terms';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      // Here you would typically send data to your backend
      handleCloseModal();
      alert('Form submission successful! We will contact you shortly so be on the lookout for more info regarding payment and approval of courses');
    }
  };

  // Inside the component function:
  const location = useLocation();

  // 👇 Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Add a small delay to ensure the page has rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [mobileOpen]);

  const navButtonSx = {
    color: '#23364a',
    px: 1.25,
    '&:hover': { color: 'secondary.main', backgroundColor: 'rgba(240, 90, 40, 0.08)' },
  };

  return (
    <ThemeProvider theme={customTheme}>
      {/* HEADER */}
      <AppBar
        ref={headerRef}
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(18,60,105,0.1)',
        }}
      >
        <Container maxWidth={false} disableGutters>
          <Toolbar disableGutters sx={{ minHeight: { xs: 72, md: 78 }, justifyContent: 'space-between', pr: { xs: 2, md: 3 } }}>
            <Box component={Link} to="/#top" sx={{ display: 'flex', alignItems: 'stretch', alignSelf: 'stretch', flexShrink: 0 }}>
              <Box component="img" src="/images/logo.png" alt="Three13 IT Solutions" sx={{ height: { xs: 73, md: 79 }, display: 'block', mb: '-1px' }} />
            </Box>

            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
              {navItems.map(([label, hash]) => (
                <Button key={label} component={Link} to={`/#${hash}`} sx={navButtonSx}>
                  {label}
                </Button>
              ))}
              <IconButton component={Link} to="/login" color="primary" aria-label="Login">
                <AccountCircleIcon />
              </IconButton>
              <Button variant="contained" color="secondary" endIcon={<ArrowForwardIcon />} onClick={handleOpenModal}>
                Enroll now
              </Button>
            </Stack>

            <IconButton onClick={() => setMobileOpen((open) => !open)} sx={{ display: { xs: 'inline-flex', md: 'none' } }} aria-label="Toggle navigation">
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Toolbar>
        </Container>

        <Collapse in={mobileOpen} timeout={240}>
          <Box sx={{ display: { xs: 'block', md: 'none' }, bgcolor: '#fff', borderTop: '1px solid rgba(18,60,105,0.1)', px: 2, pb: 2 }}>
            {navItems.map(([label, hash]) => (
              <Button key={label} component={Link} to={`/#${hash}`} fullWidth onClick={() => setMobileOpen(false)} sx={{ justifyContent: 'flex-start', color: 'primary.dark' }}>
                {label}
              </Button>
            ))}
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Button component={Link} to="/login" variant="outlined" fullWidth startIcon={<AccountCircleIcon />}>
                Login
              </Button>
              <Button variant="contained" color="secondary" fullWidth onClick={handleOpenModal}>
                Enroll
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </AppBar>

      {/* PRIVACY POLICY CONTENT */}
      <Box sx={{ pt: { xs: 14, md: 16 }, pb: { xs: 8, md: 10 }, px: { xs: 2, md: 4 }, backgroundColor: '#f6f8fb' }}>
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.75rem' } }}>
            Privacy Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            At Three 13 IT Solutions, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
             At Three 13 IT Solutions, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
              At Three 13 IT Solutions, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
               At Three 13 IT Solutions, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                At Three 13 IT Solutions, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                 At Three 13 IT Solutions, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </Typography>

          {/* Add other privacy policy sections here */}
          
        </Container>
      </Box>

      {/* CONTACT SECTION - Same as Home */}
      <Box
        id="contact"
        sx={{
          backgroundColor: '#082540',
          py: { xs: 7, md: 9 },
          px: { xs: 2, md: 4 },
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ 
              mb: 3,
              fontSize: { xs: '1.6rem', md: '2rem' }
            }}
          >
            Ready to break into IT?
          </Typography>
          <Typography
            variant="h5"
            sx={{ 
              mb: 4,
              fontSize: { xs: '1.3rem', md: '1.5rem' }
            }}
          >
            Join Three13 IT Solutions and get a structured path from learning to certification preparation to career conversations.
          </Typography>
          
          {/* Updated contact enroll button */}
          <Button 
            variant="contained" 
            color="secondary"
            sx={{
              fontSize: { xs: '1rem', md: '1.1rem' },
              px: 4,
              py: 1.5,
              mb: 4,
              fontWeight: 'bold',
              textTransform: 'none',
                   '&:focus': { outline: 'none' },
          '&:focus-visible': { outline: 'none' }
            }}
            onClick={handleOpenModal} // Add click handler
          >
              Enroll now
          </Button>

          <Box 
            onMouseEnter={() => setIsHoveringLinks(true)}
            onMouseLeave={() => setIsHoveringLinks(false)}
            sx={{ position: 'relative' }}
          >
            <Box sx={{ mb: 3 }}>
              <Button 
                component={Link}
                to="/terms-of-service" 
                sx={footerLinkSx}
              >
                Terms of Service
              </Button>
              <Button 
                component={Link}
                to="/privacy-policy"
                sx={footerLinkSx}
              >
                Privacy Policy
              </Button>
            </Box>
            <Box sx={{ 
              width: '100%', 
              height: 2, 
              backgroundColor: 'rgba(255,255,255,0.34)', 
              borderRadius: 999,
              mb: 3,
              boxShadow: isHoveringLinks ? '0 0 18px 5px rgba(255,255,255,0.52)' : '0 0 12px rgba(255,255,255,0.28)',
              transition: 'background-color 220ms ease, box-shadow 220ms ease, transform 220ms ease',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.78)', transform: 'scaleY(1.35)' }
            }} />
          </Box>
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: { xs: 'row', sm: 'row' },
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              mb: 2,
              gap: { xs: 1, sm: 1 },
              width: '100%',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            <IconButton 
              href="https://www.instagram.com/three13it_solutions?igsh=MW9oc3JjazFpeGt4bw==" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ 
                color: 'inherit', 
                p: 0,
                '&:hover': { color: '#e1306c' }
              }}
            >
              <InstagramIcon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
            
            <Box component="span" sx={{ display: { xs: 'none', sm: 'block' }, mx: 0.5 }}>|</Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 0.5
            }}>
              <PhoneIcon sx={{ fontSize: '1rem' }} />
              <Box component="a" href="tel:7324702430" sx={footerContactLinkSx}>
                732-470-2430
              </Box>
            </Box>
            
            <Box component="span" sx={{ display: { xs: 'none', sm: 'block' }, mx: 0.5 }}>|</Box>
            
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 0.5
            }}>
              <EmailIcon sx={{ fontSize: '1rem' }} />
              <Box component="a" href="mailto:INFO@THREE13ITSOLUTIONS.COM" sx={{ ...footerContactLinkSx, overflowWrap: 'anywhere' }}>
                INFO@THREE13ITSOLUTIONS.COM
              </Box>
            </Box>
          </Box>

          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
            Copyright © 2025 THREE13 IT SOLUTIONS. All Rights Reserved.
          </Typography>
        </Container>
      </Box>
      
      {/* ENROLLMENT MODAL */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="registration-modal-title"
        aria-describedby="registration-modal-description"
        sx={{ backdropFilter: 'blur(5px)' }}
      >
        <Box sx={modalStyle}>
          <Typography 
            id="registration-modal-title" 
            variant="h5" 
            component="h2" 
            sx={{ 
              mb: 2, 
              fontWeight: 'bold', 
              color: '#1f4e89', 
              fontSize: { xs: '1.2rem', sm: '1.4rem' }
            }}
          >
            Course Registration
          </Typography>
          
          <form onSubmit={handleSubmit}>
            {/* Personal Info Section */}
            <Typography variant="h6" sx={{ 
              mb: 1, 
              mt: 1, 
              color: '#1f4e89', 
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}>
              Personal Information
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Login Credentials */}
            <Typography variant="h6" sx={{ 
              mb: 1, 
              mt: 2, 
              color: '#1f4e89',
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}>
              Create Login Credentials
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Password (min. 9 chars)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  variant="outlined"
                  error={!!errors.password}
                  helperText={errors.password}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  variant="outlined"
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Course Enrollment */}
            <Typography variant="h6" sx={{ 
              mb: 1, 
              mt: 1, 
              color: '#1f4e89',
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}>
              Course Enrollment
            </Typography>
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }} size="small">
              <InputLabel>Select Course(s)</InputLabel>
              <Select
                multiple
                size="small"
                value={formData.courses}
                onChange={handleCourseChange}
                label="Select Course(s)"
                renderValue={(selected) => selected.join(', ')}
              >
                <MenuItem value="Network Essentials">Network Essentials</MenuItem>
                <MenuItem value="Security Essentials">Security Essentials</MenuItem>
                <MenuItem value="CISA/IT Audit">CISA/IT Audit</MenuItem>
              </Select>
            </FormControl>

            {/* Prerequisites */}
            <Typography variant="h6" sx={{ 
              mb: 1, 
              color: '#1f4e89',
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}>
              Do you meet course prerequisites?
            </Typography>
            <RadioGroup
              row
              name="prerequisites"
              value={formData.prerequisites}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            >
              <FormControlLabel 
                value="yes" 
                control={<Radio size="small" />}
                label={<Typography variant="body2">Yes</Typography>}
              />
              <FormControlLabel 
                value="no" 
                control={<Radio size="small" />}
                label={<Typography variant="body2">No</Typography>}
              />
            </RadioGroup>

            {/* Agreement */}
            <FormControl error={!!errors.agree} fullWidth sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    size="small"
                    checked={formData.agree} 
                    onChange={handleInputChange}
                    name="agree" 
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the Terms of Service and Privacy Policy
                  </Typography>
                }
              />
              {errors.agree && (
                <Typography variant="caption" color="error">
                  {errors.agree}
                </Typography>
              )}
            </FormControl>

            {/* Form Actions */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 1.5, 
              mt: 1  
            }}>
              <Button 
                variant="outlined" 
                onClick={handleCloseModal}
                sx={{ 
                  textTransform: 'none',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="contained" 
                color="primary"
                sx={{ 
                  textTransform: 'none',
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }}
              >
                Submit Registration
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>
      
      {/* SCROLL TO TOP BUTTON */}
      {showScrollButton && (
        <Fab
          color="primary"
          onClick={scrollToTop}
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            left: 20,
            '&:focus': { outline: 'none' },
            '&:focus-visible': { outline: 'none' }  
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      )}

      {/* CHAT BUTTON */}
      <Fab
        color="primary"
        onClick={() => alert('Chatbot coming soon!')}
        sx={{ 
          position: 'fixed', 
          bottom: 20, 
          right: 20,
          '&:focus': { outline: 'none' },
          '&:focus-visible': { outline: 'none' } 
        }}
      >
        <ChatIcon />
      </Fab>
    </ThemeProvider>
  );
}
