import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AppBar,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Container,
  Fab,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Modal,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ChatIcon from '@mui/icons-material/Chat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InstagramIcon from '@mui/icons-material/Instagram';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MenuIcon from '@mui/icons-material/Menu';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import PhoneIcon from '@mui/icons-material/Phone';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import ShieldIcon from '@mui/icons-material/Shield';
import StarIcon from '@mui/icons-material/Star';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const theme = createTheme({
  palette: {
    primary: { main: '#123c69', dark: '#082540' },
    secondary: { main: '#f05a28' },
    success: { main: '#16805f' },
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
        containedSecondary: {
          color: '#fff',
          '&:hover': { boxShadow: '0 14px 30px rgba(240, 90, 40, 0.25)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});

const navItems = [
  ['Home', 'top'],
  ['About Us', 'about'],
  ['Courses', 'courses'],
  ['Testimonials', 'testimonials'],
  ['FAQ', 'faq'],
  ['Contact', 'contact'],
];

const courses = [
  {
    title: 'Network Essentials',
    img: '/images/course1.jpg',
    icon: <NetworkCheckIcon />,
    prereq: 'No prior IT experience required',
    desc: 'Build a practical foundation in networking, infrastructure, troubleshooting, and core IT terminology.',
  },
  {
    title: 'Security Essentials',
    img: '/images/course2.jpg',
    icon: <ShieldIcon />,
    prereq: 'Network Essentials recommended',
    desc: 'Learn security operations, risk fundamentals, controls, incident response, and exam-ready security practices.',
  },
  {
    title: 'CISA / IT Audit',
    img: '/images/course3.jpg',
    icon: <WorkspacePremiumIcon />,
    prereq: 'Security Essentials recommended',
    desc: 'Prepare for audit, governance, compliance, controls testing, and career paths in assurance.',
  },
  {
    title: 'AI Essentials for IT Professionals',
    img: '/images/AI-Essential.jpg',
    icon: <PsychologyIcon />,
    prereq: 'Basic IT knowledge recommended',
    desc: 'Learn practical AI concepts, prompt workflows, automation opportunities, and responsible AI use for modern IT teams.',
  },
];

const faqs = [
  ['What are the prerequisites for the courses?', 'Network Essentials requires no prior experience. For Security Essentials, we recommend completing Network Essentials first. The CISA / IT Audit course is best after Security Essentials.'],
  ['How long do I have access to course materials?', 'You receive long-term access to lecture recordings, slides, labs, and practice resources so you can revisit the material as your career grows.'],
  ['What certifications will I be prepared for?', 'The program is designed around Network+, Security+, and CISA-aligned skills, with guided exam preparation and practice sessions.'],
  ['What is the class schedule?', 'Classes are held Mondays and Thursdays from 7:00 PM to 10:00 PM EST. Each course runs for 10 weeks.'],
  ['What if I miss a live session?', 'Live sessions are recorded and made available for review, so you can stay current even when life gets busy.'],
  ['Do you offer payment plans?', 'Yes. Flexible payment options are available, and the admissions team can walk you through the best fit.'],
  ['What kind of support do you provide?', 'Students get Q&A support, office hours, resume guidance, interview preparation, and instructor access.'],
  ['Do you offer job placement assistance?', 'Yes. Career support includes resume workshops, interview prep, and introductions to hiring partners when available.'],
];

const chatPrompts = [
  {
    question: 'Which course should I start with?',
    answer: 'If you are new to IT, start with Network Essentials. If you already understand basic networking, Security Essentials is a strong next step. CISA / IT Audit is best once you have security or compliance context.',
  },
  {
    question: 'How do I enroll?',
    answer: 'Click Enroll now, fill out the registration form, and our team will follow up with payment details, course approval, and next steps.',
  },
  {
    question: 'When are classes?',
    answer: 'Live classes are Mondays and Thursdays from 7:00 PM to 10:00 PM EST. Each course runs for 10 weeks.',
  },
  {
    question: 'Can I miss a class?',
    answer: 'Yes. Live sessions are recorded so you can review missed classes and revisit lessons while you study.',
  },
  {
    question: 'How do I access course content?',
    answer: 'After your enrollment is approved, your student account will unlock the course materials connected to your selected course.',
  },
];

const chatAttachmentLimitMb = 5;
const chatAttachmentLimitBytes = chatAttachmentLimitMb * 1024 * 1024;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const testimonials = [
  {
    name: 'Charles Robin',
    role: 'Entrepreneur',
    quote: 'This course transformed my career! The instructors are experts and the material is top-notch. I went from beginner to certified in just 3 months. The flexible schedule allowed me to balance work and studies. The instructors were always available for questions. Worth every penny! The flexible schedule allowed me to balance work and studies. The instructors were always available for questions. Worth every penny!',
  },
  {
    name: 'Guzzardi Taylor',
    role: 'Designer',
    quote: 'The hands-on labs were invaluable. I gained practical skills that helped me transition into cybersecurity. Highly recommend for career changers! The flexible schedule allowed me to balance work and studies. The instructors were always available for questions. Worth every penny!',
  },
  {
    name: 'Leo Macon',
    role: 'Freelancer',
    quote: 'The flexible schedule allowed me to balance work and studies. The instructors were always available for questions. Worth every penny! The flexible schedule allowed me to balance work and studies. The instructors were always available for questions. Worth every penny! The flexible schedule allowed me to balance work and studies. The instructors were always available for questions. Worth every penny!',
  },
  {
    name: 'Matt Newman',
    role: 'Store Owner',
    quote: 'I doubled my salary after completing the program. The career guidance helped me negotiate better offers. Best investment in my future!',
  },
];

const modalStyle = {
  position: 'absolute',
  top: { xs: '12px', sm: '50%' },
  left: '50%',
  transform: { xs: 'translateX(-50%)', sm: 'translate(-50%, -50%)' },
  width: { xs: 'min(390px, calc(100vw - 24px))', sm: 560 },
  maxHeight: { xs: 'calc(100dvh - 24px)', sm: '88vh' },
  overflowY: 'auto',
  bgcolor: '#fff',
  borderRadius: { xs: 2, sm: 3 },
  boxShadow: '0 24px 70px rgba(8, 37, 64, 0.28)',
  p: { xs: 1.6, sm: 3 },
};

function SectionHeader({ eyebrow, title, body, light = false }) {
  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', textAlign: 'center', mb: { xs: 4, md: 6 } }}>
      {eyebrow && (
        <Typography sx={{ color: light ? '#f8c7b1' : 'secondary.main', fontWeight: 800, mb: 1, textTransform: 'uppercase', fontSize: 13 }}>
          {eyebrow}
        </Typography>
      )}
      <Typography variant="h3" sx={{ color: light ? '#fff' : 'primary.dark', fontSize: { xs: '2rem', md: '2.75rem' }, mb: 2 }}>
        {title}
      </Typography>
      {body && (
        <Typography sx={{ color: light ? 'rgba(255,255,255,0.78)' : '#526273', fontSize: { xs: '1rem', md: '1.08rem' } }}>
          {body}
        </Typography>
      )}
    </Box>
  );
}

export default function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const coursesRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessageOpen, setChatMessageOpen] = useState(false);
  const [selectedChatPrompt, setSelectedChatPrompt] = useState(chatPrompts[0]);
  const [chatMessage, setChatMessage] = useState({ name: '', email: '', message: '', file: null });
  const [chatFileError, setChatFileError] = useState('');
  const [coursesInView, setCoursesInView] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState({ type: '', message: '' });
  const [registrationSubmitting, setRegistrationSubmitting] = useState(false);
  const [showRegistrationPassword, setShowRegistrationPassword] = useState(false);
  const [showRegistrationConfirmPassword, setShowRegistrationConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    courses: [],
    prerequisites: 'no',
    experienceLevel: '',
    learningGoal: '',
    agree: false,
  });
  const [errors, setErrors] = useState({ password: '', confirmPassword: '', agree: '' });

  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.pageYOffset > 320);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const node = coursesRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setCoursesInView(entry.isIntersecting),
      { threshold: 0.22 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [location]);

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

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleChatMessageChange = (event) => {
    const { name, value } = event.target;
    setChatMessage((current) => ({ ...current, [name]: value }));
  };

  const handleChatFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (file && file.size > chatAttachmentLimitBytes) {
      setChatFileError(`Please choose a file under ${chatAttachmentLimitMb} MB.`);
      setChatMessage((current) => ({ ...current, file: null }));
      event.target.value = '';
      return;
    }

    setChatFileError('');
    setChatMessage((current) => ({ ...current, file }));
  };

  const handleChatMessageSubmit = (event) => {
    event.preventDefault();
    alert('Message received. Our team will follow up with you shortly.');
    setChatMessage({ name: '', email: '', message: '', file: null });
    setChatFileError('');
    setChatMessageOpen(false);
  };

  const validateForm = () => {
    const nextErrors = { password: '', confirmPassword: '', agree: '' };
    let isValid = true;

    if (formData.password.length < 9) {
      nextErrors.password = 'Password must be at least 9 characters';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!formData.agree) {
      nextErrors.agree = 'You must agree to the terms';
      isValid = false;
    }

    if (!formData.courses.length) {
      setRegistrationStatus({ type: 'error', message: 'Please select at least one course.' });
      isValid = false;
    }

    setErrors(nextErrors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setRegistrationSubmitting(true);
    setRegistrationStatus({ type: '', message: '' });

    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/enrollment-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          course_titles: formData.courses,
          prerequisites: formData.prerequisites,
          experience_level: formData.experienceLevel,
          learning_goal: formData.learningGoal,
          agree: formData.agree,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to submit registration');

      setRegistrationStatus({ type: 'success', message: data.message });
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        courses: [],
        prerequisites: 'no',
        experienceLevel: '',
        learningGoal: '',
        agree: false,
      });
      window.setTimeout(() => {
        setOpenModal(false);
        navigate('/login');
      }, 3000);
    } catch (error) {
      setRegistrationStatus({ type: 'error', message: error.message });
    } finally {
      setRegistrationSubmitting(false);
    }
  };

  const navButtonSx = {
    color: '#23364a',
    px: 1.25,
    '&:hover': { color: 'secondary.main', backgroundColor: 'rgba(240, 90, 40, 0.08)' },
  };

  return (
    <ThemeProvider theme={theme}>
      <Box id="top" sx={{ bgcolor: 'background.default', color: '#1f2933' }}>
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
                <Button variant="contained" color="secondary" endIcon={<ArrowForwardIcon />} onClick={() => setOpenModal(true)}>
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
                <Button variant="contained" color="secondary" fullWidth onClick={() => setOpenModal(true)}>
                  Enroll
                </Button>
              </Stack>
            </Box>
          </Collapse>
        </AppBar>

        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: '92vh', md: '96vh' },
            display: 'flex',
            alignItems: 'center',
            pt: { xs: 12, md: 14 },
            pb: { xs: 6, md: 8 },
            overflow: 'hidden',
            color: '#fff',
            backgroundImage: 'linear-gradient(90deg, rgba(8,37,64,0.92), rgba(8,37,64,0.68), rgba(8,37,64,0.24)), url("/images/background.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
              <Grid item xs={12} md={7}>
                <Chip label="Live online IT career training" sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff', border: '1px solid rgba(255,255,255,0.24)', mb: 3 }} />
                <Typography variant="h1" sx={{ fontSize: { xs: '2.8rem', sm: '4rem', md: '5.8rem' }, lineHeight: 0.96, maxWidth: 830 }}>
                  Build a career-ready path into IT.
                </Typography>
                <Typography sx={{ mt: 3, maxWidth: 650, color: 'rgba(255,255,255,0.82)', fontSize: { xs: '1.05rem', md: '1.2rem' }, lineHeight: 1.8 }}>
                  Three13 IT Solutions helps new and growing professionals move from interest to certification-ready skills through live instruction, labs, and guided career support.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4, maxWidth: { xs: 420, sm: 'none' } }}>
                  <Button variant="contained" color="secondary" size="large" endIcon={<ArrowForwardIcon />} onClick={() => setOpenModal(true)}>
                    Start enrollment
                  </Button>
                  <Button component={Link} to="/#courses" variant="outlined" size="large" startIcon={<PlayCircleIcon />} sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.48)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}>
                    View courses
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 3, p: { xs: 2, md: 2.5 }, backdropFilter: 'blur(18px)', maxWidth: 440, ml: { md: 'auto' } }}>
                  <Box component="img" src="/images/teaching.png" alt="Instructor teaching online IT students" sx={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 2, display: 'block' }} />
                  <Grid container spacing={1.5} sx={{ mt: 1 }}>
                    {[
                      ['6 weeks', 'per course'],
                      ['2 nights', 'weekly live class'],
                      ['Career', 'coaching included'],
                    ].map(([value, label]) => (
                      <Grid item xs={4} key={value}>
                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2, p: 1.4, textAlign: 'center' }}>
                          <Typography fontWeight={800}>{value}</Typography>
                          <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Box id="about" component="section" sx={{ py: { xs: 7, md: 11 }, bgcolor: '#fff' }}>
          <Container maxWidth="xl">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(280px, 0.78fr)' },
                gap: { xs: 4, md: 'clamp(2.5rem, 5vw, 5rem)' },
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography sx={{ color: 'secondary.main', fontWeight: 800, mb: 1, textTransform: 'uppercase', fontSize: { xs: 12, md: 13 } }}>
                  About Three13
                </Typography>
                <Typography variant="h2" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', sm: '2.6rem', md: 'clamp(2.6rem, 4vw, 3.5rem)' }, lineHeight: 1.08, mb: 2 }}>
                  Practical training for the work, the exam, and the interview.
                </Typography>
                <Typography sx={{ color: '#526273', fontSize: { xs: '0.98rem', md: 'clamp(1rem, 1.25vw, 1.12rem)' }, lineHeight: 1.85, mb: { xs: 3, md: 4 }, maxWidth: 720 }}>
                  Our courses are built for learners who need structure, accountability, and usable skills. You get live instruction, recorded sessions, hands-on practice, and direct support as you prepare for your next role.
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                    gap: { xs: 2, md: 2.4 },
                  }}
                >
                  {[
                    ['Live instruction', 'Interactive evening classes with room for questions.'],
                    ['Guided practice', 'Labs and study resources tied to real scenarios.'],
                    ['Career support', 'Resume, interview, and next-step coaching.'],
                    ['Certification focus', 'Course paths aligned with respected IT credentials.'],
                  ].map(([title, copy]) => (
                    <Stack key={title} direction="row" spacing={1.4} sx={{ alignItems: 'flex-start' }}>
                      <CheckCircleIcon sx={{ color: '#16805f', fontSize: { xs: 22, md: 24 }, mt: 0.2, flexShrink: 0 }} />
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: '#102b49', fontSize: { xs: '0.96rem', md: '1rem' } }}>{title}</Typography>
                        <Typography sx={{ color: '#687789', fontSize: { xs: '0.85rem', md: '0.92rem' }, lineHeight: 1.55 }}>{copy}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Box>

                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 640,
                    bgcolor: 'secondary.main',
                    color: '#fff',
                    textAlign: 'center',
                    px: { xs: 2, sm: 4 },
                    py: { xs: 1.4, sm: 1.7 },
                    mt: { xs: 3, md: 4 },
                    boxShadow: '0 16px 38px rgba(18,60,105,0.16)',
                  }}
                >
                  <Typography sx={{ fontWeight: 900, fontSize: { xs: '0.95rem', sm: '1.05rem' }, lineHeight: 1.25 }}>
                    COURSE DETAILS
                  </Typography>
                  <Typography sx={{ mt: 0.35, fontWeight: 700, fontSize: { xs: '0.82rem', sm: '0.95rem' }, lineHeight: 1.4 }}>
                    JUNE 1ST - SEPT. 17TH, 2026 | MONDAYS & THURSDAYS | 7:00PM - 10.00PM | LOCATION: ZOOM
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  justifySelf: { xs: 'center', md: 'end' },
                  width: '100%',
                  maxWidth: { xs: 420, md: 'clamp(340px, 31vw, 500px)' },
                }}
              >
                <Box
                  component="img"
                  src="/images/person.png"
                  alt="Three13 student preparing for an IT career"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                    borderRadius: 0,
                    display: 'block',
                  }}
                />
              </Box>
            </Box>
          </Container>
        </Box>

        <Box id="courses" ref={coursesRef} component="section" sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 7, md: 11 }, bgcolor: '#eef3f8', overflow: 'hidden' }}>
          <Container maxWidth="xl">
            <SectionHeader title="Choose the track that matches your next move." body="Start with fundamentals, move into security, or deepen your path with IT audit and governance." />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
                gap: { xs: 3, md: 'clamp(1rem, 2vw, 2rem)' },
                alignItems: 'stretch',
                maxWidth: 1440,
                mx: 'auto',
              }}
            >
              {courses.map((course, index) => {
                const entranceTransforms = [
                  'translateX(-90px)',
                  'translateY(-90px)',
                  'translateY(90px)',
                  'translateX(90px)',
                ];

                return (
                <Box
                  key={course.title}
                  sx={{
                    opacity: coursesInView ? 1 : 0,
                    transform: coursesInView ? 'translate(0, 0)' : entranceTransforms[index % entranceTransforms.length],
                    transition: 'opacity 700ms ease, transform 760ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                    transitionDelay: coursesInView ? `${index * 110}ms` : '0ms',
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      bgcolor: '#fff',
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: '1px solid rgba(18,60,105,0.1)',
                      boxShadow: '0 2px 5px rgba(18,60,105,0.18)',
                      display: 'flex',
                      flexDirection: 'column',
                      width: '100%',
                      maxWidth: { xs: 400, lg: 'clamp(230px, 22vw, 320px)' },
                      mx: 'auto',
                    }}
                  >
                    <Box component="img" src={course.img} alt={course.title} sx={{ width: '100%', height: { xs: 205, sm: 'clamp(190px, 24vw, 230px)', lg: 'clamp(155px, 14vw, 205px)' }, objectFit: 'cover', display: 'block' }} />
                    <Box sx={{ p: { xs: 2, lg: 'clamp(1rem, 1.4vw, 1.6rem)' }, minHeight: { sm: 'clamp(300px, 38vw, 360px)', lg: 'clamp(285px, 25vw, 340px)' }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.dark', mb: { xs: 1.2, lg: 'clamp(0.65rem, 1vw, 1.2rem)' }, fontSize: { xs: '1.2rem', lg: 'clamp(0.92rem, 1.25vw, 1.18rem)' }, lineHeight: 1.25 }}>
                        {course.title}
                      </Typography>

                      <Stack direction="row" spacing={0.8} alignItems="flex-start" sx={{ color: '#102b49', mb: 1.1 }}>
                        <CheckCircleIcon sx={{ fontSize: { xs: 18, lg: 'clamp(14px, 1.2vw, 18px)' }, color: 'secondary.main', mt: 0.2 }} />
                        <Typography sx={{ fontSize: { xs: '0.95rem', lg: 'clamp(0.72rem, 0.95vw, 0.9rem)' }, lineHeight: 1.45 }}>
                          <Box component="span" sx={{ fontWeight: 800 }}>Prereq:</Box>
                          {course.prereq}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={0.8} alignItems="flex-start" sx={{ color: '#102b49', mb: { xs: 3, lg: 'clamp(1.2rem, 2vw, 3rem)' } }}>
                        <MenuBookIcon sx={{ fontSize: { xs: 18, lg: 'clamp(14px, 1.2vw, 18px)' }, color: '#16805f', mt: 0.2 }} />
                        <Typography sx={{ fontSize: { xs: '0.95rem', lg: 'clamp(0.72rem, 0.95vw, 0.9rem)' }, lineHeight: 1.5 }}>
                          <Box component="span" sx={{ fontWeight: 800 }}>Desc:</Box>
                          {' '}
                          {course.desc}
                        </Typography>
                      </Stack>

                      <Button variant="contained" color="primary" fullWidth onClick={() => setOpenModal(true)} sx={{ mt: 'auto', bgcolor: '#5684e1', '&:hover': { bgcolor: '#466fd0' } }}>
                        Enroll Now
                      </Button>
                    </Box>
                  </Box>
                </Box>
                );
              })}
            </Box>
          </Container>
        </Box>

        <Box id="testimonials" component="section" sx={{ bgcolor: '#f9f9f9' }}>
          <Box sx={{ bgcolor: '#1f4e89', height: { xs: 136, md: 160 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                color: '#fff',
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '2.6rem' },
                lineHeight: 1,
                textAlign: 'center',
              }}
            >
              Testimonials & Reviews
            </Typography>
          </Box>

          <Box sx={{ py: { xs: 5, md: 5 }, px: { xs: 2, md: 4 } }}>
            <Container maxWidth="xl">
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 330px))',
                    xl: 'repeat(4, minmax(0, 270px))',
                  },
                  gap: { xs: 3, md: 4 },
                  justifyContent: 'center',
                  alignItems: 'stretch',
                }}
              >
                {testimonials.map((review) => (
                  <Box key={review.name} sx={{ display: 'flex' }}>
                    <Box
                      sx={{
                        position: 'relative',
                        bgcolor: '#fff',
                        border: '1px solid #f0d389',
                        borderRadius: 1,
                        boxShadow: '0 2px 4px rgba(18, 60, 105, 0.18)',
                        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: '0 12px 22px rgba(18, 60, 105, 0.18)',
                          borderColor: '#e6bd50',
                        },
                        width: '100%',
                        minHeight: { xs: 380, sm: 430, lg: 'clamp(360px, 34vw, 470px)' },
                        maxWidth: { xs: 330, sm: 330, lg: 'clamp(195px, 17.5vw, 270px)' },
                        mx: 'auto',
                        px: { xs: 2, md: 'clamp(0.8rem, 1.25vw, 1.8rem)' },
                        pt: { xs: 2.8, md: 'clamp(1.5rem, 2vw, 2.8rem)' },
                        pb: { xs: 1.4, md: 'clamp(0.8rem, 1vw, 1.4rem)' },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -1,
                          left: 0,
                          width: 25,
                          height: 48,
                          bgcolor: '#d19a00',
                          borderRadius: '0 0 7px 7px',
                        }}
                      />

                      <Box
                        component="img"
                        src="/images/user.png"
                        alt={review.name}
                        sx={{
                          width: { xs: 58, md: 'clamp(48px, 4.6vw, 68px)' },
                          height: { xs: 58, md: 'clamp(48px, 4.6vw, 68px)' },
                          borderRadius: '50%',
                          objectFit: 'cover',
                          mb: 1.1,
                        }}
                      />
                      <Typography sx={{ color: '#102b49', fontWeight: 800, fontSize: { xs: '1rem', md: 'clamp(0.82rem, 1vw, 1.05rem)' }, lineHeight: 1.25 }}>
                        {review.name}
                      </Typography>
                      <Typography sx={{ color: '#b98700', fontSize: { xs: '0.9rem', md: 'clamp(0.72rem, 0.9vw, 0.95rem)' }, mb: { xs: 1.2, md: 'clamp(0.55rem, 0.9vw, 1.2rem)' } }}>
                        {review.role}
                      </Typography>
                      <Typography
                        sx={{
                          color: '#4c5561',
                          fontSize: { xs: '0.84rem', md: 'clamp(0.66rem, 0.78vw, 0.82rem)' },
                          lineHeight: { xs: 1.3, md: 'clamp(1.22, 1.6vw, 1.34)' },
                          textAlign: 'left',
                          flexGrow: 1,
                        }}
                      >
                        {review.quote}
                      </Typography>
                      <Stack direction="row" spacing={0.25} justifyContent="center" sx={{ color: '#e5ad12', mt: { xs: 1.4, md: 'clamp(0.7rem, 1vw, 1.4rem)' } }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon key={star} sx={{ fontSize: { xs: 15, md: 'clamp(12px, 1.2vw, 17px)' } }} />
                        ))}
                      </Stack>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Typography
                sx={{
                  mt: 4,
                  textAlign: 'center',
                  color: '#102b49',
                  fontWeight: 800,
                  fontSize: { xs: '0.9rem', md: '1.05rem' },
                }}
              >
                You can read more reviews / leave us a review{' '}
                <Box
                  component="a"
                  href="https://www.instagram.com/three13it_solutions?igsh=MW9oc3JjazFpeGt4bw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#1976d2', textDecoration: 'none', fontWeight: 800, '&:hover': { textDecoration: 'underline' } }}
                >
                  here ➝
                </Box>
              </Typography>
            </Container>
          </Box>
        </Box>

        <Box id="faq" component="section" sx={{ pt: { xs: 3, md: 'clamp(2.25rem, 4vw, 3.5rem)' }, pb: { xs: 7, md: 'clamp(5rem, 8vw, 7rem)' }, px: { xs: 0, md: 2 }, bgcolor: '#eae9e9' }}>
          <Container maxWidth="lg">
            <SectionHeader title="Frequently Asked Questions" body="A quick guide to schedule, support, access, and course fit." />
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              {faqs.map(([question, answer]) => (
                <Accordion
                  key={question}
                  disableGutters
                  elevation={0}
                  sx={{
                    mb: { xs: 1.2, md: 1.6 },
                    border: '1px solid rgba(18,60,105,0.12)',
                    borderRadius: '8px !important',
                    overflow: 'hidden',
                    bgcolor: '#fff',
                    boxShadow: '0 10px 28px rgba(18,60,105,0.06)',
                    transition: 'box-shadow 180ms ease, border-color 180ms ease',
                    '&:before': { display: 'none' },
                    '&.Mui-expanded': {
                      borderColor: 'rgba(18,60,105,0.22)',
                      boxShadow: '0 16px 36px rgba(18,60,105,0.09)',
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon color="primary" />}
                    sx={{
                      bgcolor: '#f8fafc',
                      minHeight: { xs: 58, md: 'clamp(4rem, 5.5vw, 4.8rem)' },
                      px: { xs: 2, md: 3 },
                      '&.Mui-expanded': { minHeight: { xs: 58, md: 'clamp(4rem, 5.5vw, 4.8rem)' } },
                    }}
                  >
                    <Typography sx={{ fontWeight: 800, color: 'primary.dark', fontSize: { xs: '0.95rem', md: 'clamp(1rem, 1.2vw, 1.15rem)' }, lineHeight: 1.35 }}>
                      {question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: '#fff', py: { xs: 2, md: 2.8 }, px: { xs: 2, md: 3 } }}>
                    <Typography sx={{ color: '#526273', fontSize: { xs: '0.9rem', md: 'clamp(0.95rem, 1.05vw, 1.05rem)' }, lineHeight: 1.75 }}>
                      {answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Container>
        </Box>

        <Box id="contact" component="footer" sx={{ py: { xs: 7, md: 9 }, bgcolor: '#082540', color: '#fff' }}>
          <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
            <SchoolIcon sx={{ color: 'secondary.main', fontSize: 42, mb: 2 }} />
            <Typography variant="h3" sx={{ fontSize: { xs: '2rem', md: '3rem' }, mb: 2 }}>
              Ready to break into IT?
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.72)', maxWidth: 620, mx: 'auto', mb: 4 }}>
              Join Three13 IT Solutions and get a structured path from learning to certification preparation to career conversations.
            </Typography>
            <Button variant="contained" color="secondary" size="large" endIcon={<ArrowForwardIcon />} onClick={() => setOpenModal(true)} sx={{ mb: 4 }}>
              Enroll now
            </Button>
            <Stack direction="row" spacing={{ xs: 1.5, sm: 4 }} justifyContent="center" sx={{ mb: 3 }}>
              <Button
                component={Link}
                to="/terms-of-service"
                sx={{
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
                }}
              >
                Terms of Service
              </Button>
              <Button
                component={Link}
                to="/privacy-policy"
                sx={{
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
                }}
              >
                Privacy Policy
              </Button>
            </Stack>
            <Box
              sx={{
                width: '100%',
                maxWidth: 1070,
                height: 2,
                mx: 'auto',
                mb: 3,
                borderRadius: 999,
                bgcolor: 'rgba(255,255,255,0.34)',
                boxShadow: '0 0 12px rgba(255,255,255,0.28)',
                transition: 'background-color 220ms ease, box-shadow 220ms ease, transform 220ms ease',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.78)',
                  boxShadow: '0 0 18px 5px rgba(255,255,255,0.52)',
                  transform: 'scaleY(1.35)',
                },
              }}
            />
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.2, sm: 1.8 }}
              justifyContent="center"
              alignItems="center"
              sx={{ mb: 2.2, color: 'rgba(255,255,255,0.78)', fontSize: '0.95rem' }}
            >
              <IconButton
                href="https://www.instagram.com/three13it_solutions?igsh=MW9oc3JjazFpeGt4bw=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                sx={{ color: 'inherit', p: 0, '&:hover': { color: '#e1306c' } }}
              >
                <InstagramIcon sx={{ fontSize: '1.2rem' }} />
              </IconButton>
              <Box component="span" sx={{ display: { xs: 'none', sm: 'block' } }}>|</Box>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <PhoneIcon sx={{ fontSize: '1.05rem' }} />
                <Box
                  component="a"
                  href="tel:7324702430"
                  sx={{
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
                  }}
                >
                  732-470-2430
                </Box>
              </Stack>
              <Box component="span" sx={{ display: { xs: 'none', sm: 'block' } }}>|</Box>
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                <EmailIcon sx={{ fontSize: '1.05rem' }} />
                <Box
                  component="a"
                  href="mailto:INFO@THREE13ITSOLUTIONS.COM"
                  sx={{
                    color: 'inherit',
                    textDecoration: 'underline',
                    textDecorationColor: 'transparent',
                    textUnderlineOffset: '4px',
                    overflowWrap: 'anywhere',
                    transition: 'color 180ms ease, text-decoration-color 180ms ease, transform 180ms ease',
                    '&:hover': {
                      color: '#7db7ff',
                      textDecorationColor: '#7db7ff',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  INFO@THREE13ITSOLUTIONS.COM
                </Box>
              </Stack>
            </Stack>
            <Typography sx={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.9rem' }}>
              Copyright {'\u00a9'} 2026 THREE13 IT SOLUTIONS. All Rights Reserved.
            </Typography>
          </Container>
        </Box>

        <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="registration-modal-title" sx={{ backdropFilter: 'blur(6px)' }}>
          <Box sx={modalStyle}>
            <Typography id="registration-modal-title" variant="h5" sx={{ color: 'primary.dark', fontWeight: 800, mb: 0.5, fontSize: { xs: '1.45rem', sm: '1.75rem' } }}>
              Course Registration
            </Typography>
            <Typography sx={{ color: '#687789', mb: { xs: 2, sm: 3 }, fontSize: { xs: 13, sm: 14 } }}>
              Tell us where you are starting, and our team will follow up with next steps.
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: { xs: 1.15, sm: 1.5 } }}>
                <TextField required fullWidth label="Full Name" name="fullName" value={formData.fullName} onChange={handleInputChange} size="small" />
                <TextField required fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} size="small" />
                <TextField required fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} size="small" />
                <TextField
                  required
                  fullWidth
                  label="Password (min. 9 chars)"
                  name="password"
                  type={showRegistrationPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowRegistrationPassword((shown) => !shown)} onMouseDown={(event) => event.preventDefault()} edge="end" aria-label="Toggle password visibility">
                          {showRegistrationPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  required
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showRegistrationConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowRegistrationConfirmPassword((shown) => !shown)} onMouseDown={(event) => event.preventDefault()} edge="end" aria-label="Toggle confirm password visibility">
                          {showRegistrationConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <FormControl fullWidth size="small" sx={{ minWidth: 0 }}>
                    <InputLabel>Select Course(s)</InputLabel>
                    <Select
                      multiple
                      value={formData.courses}
                      onChange={(event) => setFormData((current) => ({ ...current, courses: typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value }))}
                      label="Select Course(s)"
                      displayEmpty
                      renderValue={(selected) => selected.length ? selected.join(', ') : 'Select Course(s)'}
                      sx={{ textAlign: 'left' }}
                    >
                      {courses.map((course) => (
                        <MenuItem key={course.title} value={course.title}>{course.title}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography sx={{ fontWeight: 800, color: 'primary.dark', mb: 0.5, fontSize: 14 }}>Do you meet course prerequisites?</Typography>
                  <RadioGroup row name="prerequisites" value={formData.prerequisites} onChange={handleInputChange}>
                    <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                  </RadioGroup>
                </Box>
                <FormControl fullWidth size="small">
                  <InputLabel>Experience Level</InputLabel>
                  <Select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    label="Experience Level"
                  >
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Some IT experience">Some IT experience</MenuItem>
                    <MenuItem value="Currently working in IT">Currently working in IT</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Learning Goal</InputLabel>
                  <Select
                    name="learningGoal"
                    value={formData.learningGoal}
                    onChange={handleInputChange}
                    label="Learning Goal"
                  >
                    <MenuItem value="Career switch">Career switch</MenuItem>
                    <MenuItem value="Certification preparation">Certification preparation</MenuItem>
                    <MenuItem value="Promotion or career growth">Promotion or career growth</MenuItem>
                    <MenuItem value="Skill upgrade">Skill upgrade</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <FormControl error={Boolean(errors.agree)} fullWidth>
                    <FormControlLabel control={<Checkbox checked={formData.agree} onChange={handleInputChange} name="agree" size="small" />} label={<Typography sx={{ fontSize: 14 }}>I agree to the Terms of Service and Privacy Policy</Typography>} />
                    {errors.agree && <Typography color="error" sx={{ fontSize: 12 }}>{errors.agree}</Typography>}
                  </FormControl>
                </Box>
              </Box>
              {registrationStatus.message && (
                <Typography
                  sx={{
                    mt: 1.5,
                    color: registrationStatus.type === 'success' ? '#16805f' : 'error.main',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {registrationStatus.message}
                </Typography>
              )}
              <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.2} justifyContent="flex-end" sx={{ mt: { xs: 2, sm: 3 } }}>
                <Button variant="outlined" fullWidth={false} onClick={() => setOpenModal(false)} sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={registrationSubmitting} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  {registrationSubmitting ? 'Submitting...' : 'Submit registration'}
                </Button>
              </Stack>
            </Box>
          </Box>
        </Modal>

        {showScrollButton && (
          <Fab color="primary" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top" sx={{ position: 'fixed', bottom: 20, left: 20, zIndex: 1300 }}>
            <KeyboardArrowUpIcon />
          </Fab>
        )}

        <Collapse in={chatOpen} timeout={220}>
          <Box
            sx={{
              position: 'fixed',
              right: { xs: 10, sm: 24 },
              bottom: { xs: 78, sm: 96 },
              zIndex: 1299,
              width: { xs: 'min(340px, calc(100vw - 20px))', sm: 360 },
              maxHeight: { xs: 'min(560px, calc(100dvh - 98px))', sm: 'min(620px, calc(100dvh - 120px))' },
              overflow: 'auto',
              bgcolor: '#fff',
              color: '#172635',
              borderRadius: 2,
              boxShadow: '0 24px 70px rgba(8,37,64,0.28)',
              border: '1px solid rgba(18,60,105,0.12)',
            }}
          >
            <Box sx={{ position: 'sticky', top: 0, zIndex: 1, bgcolor: 'primary.dark', color: '#fff', p: { xs: 1.5, sm: 2 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: { xs: 15, sm: 16 } }}>Three13 Helper</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: { xs: 11, sm: 12 } }}>Quick answers for future students</Typography>
              </Box>
              <IconButton onClick={() => setChatOpen(false)} aria-label="Close chat" sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ p: { xs: 1.25, sm: 1.5 } }}>
              {chatMessageOpen ? (
                <Box component="form" onSubmit={handleChatMessageSubmit}>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 800, mb: 0.5 }}>
                    Send us a message
                  </Typography>
                  <Typography sx={{ color: '#637083', fontSize: 13, mb: 1.25 }}>
                    Share your question and our team will follow up.
                  </Typography>
                  <Stack spacing={1.2}>
                    <TextField required fullWidth size="small" label="Name" name="name" value={chatMessage.name} onChange={handleChatMessageChange} />
                    <TextField required fullWidth size="small" label="Email" name="email" type="email" value={chatMessage.email} onChange={handleChatMessageChange} />
                    <TextField required fullWidth multiline minRows={3} size="small" label="Message" name="message" value={chatMessage.message} onChange={handleChatMessageChange} />
                    <Button component="label" variant="outlined" sx={{ justifyContent: 'flex-start', color: 'primary.dark', borderColor: 'rgba(18,60,105,0.22)' }}>
                      Attach file
                      <Box component="input" type="file" hidden onChange={handleChatFileChange} accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" />
                    </Button>
                    <Typography sx={{ color: chatFileError ? 'error.main' : '#637083', fontSize: 12 }}>
                      {chatFileError || (chatMessage.file ? chatMessage.file.name : `Optional. PDF, DOC, PNG, or JPG under ${chatAttachmentLimitMb} MB.`)}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => {
                          setChatMessageOpen(false);
                          setChatFileError('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained" color="primary" fullWidth>
                        Send
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ) : (
                <>
                  <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1.5, p: 1.25, mb: 1.25 }}>
                    <Typography sx={{ color: '#526273', fontSize: 12, mb: 0.5 }}>Assistant</Typography>
                    <Typography sx={{ color: 'primary.dark', fontSize: 13, fontWeight: 500, lineHeight: 1.45 }}>
                      {selectedChatPrompt.answer}
                    </Typography>
                  </Box>

                  <Typography sx={{ color: '#637083', fontSize: 12, fontWeight: 800, mb: 0.75 }}>
                    Choose a question
                  </Typography>
                  <Stack spacing={0.75}>
                    {chatPrompts.map((prompt) => (
                      <Button
                        key={prompt.question}
                        variant={selectedChatPrompt.question === prompt.question ? 'contained' : 'outlined'}
                        color={selectedChatPrompt.question === prompt.question ? 'primary' : 'inherit'}
                        onClick={() => setSelectedChatPrompt(prompt)}
                        sx={{
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                      minHeight: { xs: 32, sm: 34 },
                      py: 0.5,
                      fontSize: { xs: 12.5, sm: 13 },
                          color: selectedChatPrompt.question === prompt.question ? '#fff' : 'primary.dark',
                          borderColor: 'rgba(18,60,105,0.2)',
                        }}
                      >
                        {prompt.question}
                      </Button>
                    ))}
                  </Stack>

                  <Button variant="contained" color="secondary" fullWidth onClick={() => setOpenModal(true)} sx={{ mt: 1.5, minHeight: { xs: 38, sm: 40 } }}>
                    Start enrollment
                  </Button>

                  <Button variant="outlined" fullWidth onClick={() => setChatMessageOpen(true)} sx={{ mt: 0.75, minHeight: { xs: 38, sm: 40 }, color: 'primary.dark', borderColor: 'rgba(18,60,105,0.22)' }}>
                    Send us a message
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Collapse>

        <Fab color="secondary" onClick={() => setChatOpen((open) => !open)} aria-label={chatOpen ? 'Close chat' : 'Open chat'} sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1300 }}>
          {chatOpen ? <CloseIcon /> : <ChatIcon />}
        </Fab>
      </Box>
    </ThemeProvider>
  );
}
