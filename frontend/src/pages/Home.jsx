import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  InputLabel,
  MenuItem,
  Modal,
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
  ['Community', null],
  ['Contact', 'contact'],
];

const courses = [
  {
    title: 'Security Essentials',
    img: '/images/course2.jpg',
    icon: <ShieldIcon />,
    prereq: 'No prior IT experience required',
    desc: 'Learn security operations, risk fundamentals, controls, incident response, and exam-ready security practices.',
    details: 'Security Essentials helps students understand the foundations of cybersecurity work. The course covers risks, controls, common threats, and the practical mindset needed to protect systems and respond to incidents.',
    highlights: ['Security operations and threat awareness', 'Risk, controls, access, and incident response basics', 'Career-ready security concepts for entry-level roles'],
  },
  {
    title: 'Network Essentials',
    img: '/images/course1.jpg',
    icon: <NetworkCheckIcon />,
    prereq: 'No prior IT experience required',
    desc: 'Build a practical foundation in networking, infrastructure, troubleshooting, and core IT terminology.',
    details: 'Network Essentials introduces the practical language and systems behind modern IT environments. Students learn how devices connect, how information moves across networks, and how to approach common troubleshooting tasks with confidence.',
    highlights: ['Core networking concepts and terminology', 'Routers, switches, IP addressing, and connectivity basics', 'Troubleshooting methods for real IT support scenarios'],
  },
  {
    title: 'IT Audit',
    img: '/images/course3.jpg',
    icon: <WorkspacePremiumIcon />,
    prereq: 'No prior IT experience required',
    desc: 'Prepare for audit, governance, compliance, controls testing, and career paths in assurance.',
    details: 'IT Audit focuses on how organizations assess technology risk, governance, compliance, and controls. Students learn how audits are planned, how evidence is reviewed, and how assurance work supports business trust.',
    highlights: ['IT governance, compliance, and audit foundations', 'Control testing, evidence review, and risk assessment', 'Practical preparation for audit and assurance career paths'],
  },
  {
    title: 'AI Essentials for IT Professionals',
    img: '/images/AI-Essential.jpg',
    icon: <PsychologyIcon />,
    prereq: 'No prior IT experience required',
    desc: 'Learn practical AI concepts, prompt workflows, automation opportunities, and responsible AI use for modern IT teams.',
    details: 'AI Essentials for IT Professionals gives students a practical introduction to AI tools, workflows, and responsible usage. The course is designed for learners who want to understand how AI can support productivity, automation, and IT operations.',
    highlights: ['Practical AI concepts and prompt workflows', 'Automation opportunities for IT and business tasks', 'Responsible AI use, limitations, and workplace applications'],
  },
];

const CourseInfoBadge = ({ type }) => {
  const isPrereq = type === 'prereq';

  return (
    <Box
      sx={{
        position: 'relative',
        flex: '0 0 auto',
        width: { xs: 20, lg: 'clamp(18px, 1.45vw, 22px)' },
        height: { xs: 20, lg: 'clamp(18px, 1.45vw, 22px)' },
        borderRadius: isPrereq ? '50%' : 1.6,
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        background: isPrereq
          ? 'radial-gradient(circle at 32% 24%, #ffb267 0 14%, #ff7a13 38%, #f05a28 100%)'
          : 'linear-gradient(145deg, #32bca5 0%, #0a7569 100%)',
        boxShadow: isPrereq
          ? '0 10px 20px rgba(240,90,40,0.28), inset 0 -5px 10px rgba(175,58,6,0.26)'
          : '0 10px 20px rgba(10,117,105,0.26), inset 0 -6px 12px rgba(4,72,66,0.28)',
        '&:before': {
          content: '""',
          position: 'absolute',
          inset: isPrereq ? 3 : 2,
          borderRadius: isPrereq ? '50%' : 1.2,
          border: '1px solid rgba(255,255,255,0.28)',
          pointerEvents: 'none',
        },
        '&:after': {
          content: '""',
          position: 'absolute',
          top: isPrereq ? 3 : 2,
          right: isPrereq ? 4 : 3,
          width: 4,
          height: 4,
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.86)',
          boxShadow: '0 0 8px rgba(255,255,255,0.8)',
          pointerEvents: 'none',
        },
      }}
      aria-hidden="true"
    >
      {isPrereq ? (
        <CheckCircleIcon sx={{ fontSize: { xs: 14, lg: 'clamp(12px, 1vw, 15px)' }, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.14))' }} />
      ) : (
        <MenuBookIcon sx={{ fontSize: { xs: 14, lg: 'clamp(12px, 1vw, 15px)' }, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.16))' }} />
      )}
    </Box>
  );
};

const faqs = [
  ['What are the prerequisites for the courses?', 'No prior IT experience is required for any course.'],
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
    question: 'Which courses are offered?',
    answer: 'Three13 currently offers Network Essentials, Security Essentials, IT Audit, and AI Essentials for IT Professionals.',
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

const experienceLevelOptions = [
  'No IT experience',
  'Beginner',
  'Some IT experience',
  'Intermediate',
  'Experienced IT professional',
];

const learningGoalOptions = [
  'Start a career in IT',
  'Transition into IT from another field',
  'Prepare for industry certifications',
  'Build practical technical skills',
  'Advance in my current IT role',
  'Build AI and emerging technology skills',
  'Prepare for further education',
  'Professional development',
  'Other',
];

const referralSourceOptions = [
  'Google Search',
  'LinkedIn',
  'Instagram',
  'Facebook',
  'YouTube',
  'Friend or Family',
  'Church / Community Organization',
  'Employer',
  'School / University',
  'Three13 Event',
  'Other',
];

const countryCodes = [
  'AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ',
  'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BQ', 'BA', 'BW', 'BV', 'BR',
  'IO', 'BN', 'BG', 'BF', 'BI', 'CV', 'KH', 'CM', 'CA', 'KY', 'CF', 'TD', 'CL', 'CN', 'CX', 'CC',
  'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CW', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO',
  'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF',
  'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY',
  'HT', 'HM', 'VA', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM',
  'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY',
  'LI', 'LT', 'LU', 'MO', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT', 'MX',
  'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI',
  'NE', 'NG', 'NU', 'NF', 'MK', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH',
  'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC',
  'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS',
  'SS', 'ES', 'LK', 'SD', 'SR', 'SJ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK',
  'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UM', 'UY', 'UZ', 'VU',
  'VE', 'VN', 'VG', 'VI', 'WF', 'EH', 'YE', 'ZM', 'ZW',
];

const countryOptions = (() => {
  try {
    const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return [...countryCodes.map((code) => displayNames.of(code)).filter(Boolean).sort((first, second) => first.localeCompare(second)), 'Other'];
  } catch {
    return ['United States', 'Canada', 'Ghana', 'Nigeria', 'United Kingdom', 'Other'];
  }
})();

const registrationSelectMenuProps = {
  variant: 'menu',
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
  PaperProps: {
    sx: {
      maxHeight: 236,
      overflowY: 'auto',
      borderRadius: 1.5,
      boxShadow: '0 18px 44px rgba(8,37,64,0.18)',
      mt: 0.5,
      '& .MuiMenuItem-root': {
        minHeight: 38,
        whiteSpace: 'normal',
        alignItems: 'flex-start',
      },
    },
  },
  MenuListProps: {
    dense: true,
    sx: { py: 0.5 },
  },
};

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
  width: { xs: 'min(430px, calc(100vw - 24px))', sm: 760 },
  maxHeight: { xs: 'calc(100dvh - 24px)', sm: '88vh' },
  overflowY: 'auto',
  overflowX: 'hidden',
  scrollbarGutter: 'stable',
  scrollbarWidth: 'thin',
  scrollbarColor: 'rgba(8, 37, 64, 0.34) transparent',
  bgcolor: '#fff',
  borderRadius: { xs: 2, sm: 3 },
  boxShadow: '0 24px 70px rgba(8, 37, 64, 0.28)',
  p: { xs: 1.6, sm: 3 },
  '&::-webkit-scrollbar': {
    width: 12,
  },
  '&::-webkit-scrollbar-track': {
    bgcolor: 'transparent',
    borderRadius: 999,
    marginBlock: '16px',
  },
  '&::-webkit-scrollbar-thumb': {
    bgcolor: 'rgba(8, 37, 64, 0.34)',
    border: '3px solid #fff',
    borderRadius: 999,
  },
  '&::-webkit-scrollbar-thumb:hover': {
    bgcolor: 'rgba(8, 37, 64, 0.48)',
  },
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
  const headerRef = useRef(null);
  const coursesRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessageOpen, setChatMessageOpen] = useState(false);
  const [selectedChatPrompt, setSelectedChatPrompt] = useState(chatPrompts[0]);
  const [chatMessage, setChatMessage] = useState({ name: '', email: '', message: '', file: null });
  const [chatFileError, setChatFileError] = useState('');
  const [coursesInView, setCoursesInView] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState({ type: '', message: '' });
  const [registrationSubmitting, setRegistrationSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [resendSubmitting, setResendSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    experienceLevel: '',
    learningGoal: '',
    learningGoalOther: '',
    referralSource: '',
    referralSourceOther: '',
    agree: false,
    marketingConsent: false,
  });
  const [errors, setErrors] = useState({});

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
    const nextErrors = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      nextErrors.firstName = 'First name is required';
      isValid = false;
    }
    if (!formData.lastName.trim()) {
      nextErrors.lastName = 'Last name is required';
      isValid = false;
    }
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
      isValid = false;
    }
    if (!formData.phone.trim()) {
      nextErrors.phone = 'Phone number is required';
      isValid = false;
    }
    if (!formData.experienceLevel) {
      nextErrors.experienceLevel = 'Experience level is required';
      isValid = false;
    }
    if (!formData.learningGoal) {
      nextErrors.learningGoal = 'Learning goal is required';
      isValid = false;
    }
    if (formData.learningGoal === 'Other' && !formData.learningGoalOther.trim()) {
      nextErrors.learningGoalOther = 'Tell us briefly what you are hoping to achieve';
      isValid = false;
    }
    if (!formData.agree) {
      nextErrors.agree = 'You must agree to the terms';
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
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/pre-registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          experience_level: formData.experienceLevel,
          learning_goal: formData.learningGoal,
          learning_goal_other: formData.learningGoalOther,
          referral_source: formData.referralSource,
          referral_source_other: formData.referralSourceOther,
          agree: formData.agree,
          marketing_consent: formData.marketingConsent,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to submit registration');

      setRegistrationSuccess({ ...data, rawEmail: formData.email });
      setRegistrationStatus({ type: 'success', message: data.message });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: '',
        experienceLevel: '',
        learningGoal: '',
        learningGoalOther: '',
        referralSource: '',
        referralSourceOther: '',
        agree: false,
        marketingConsent: false,
      });
    } catch (error) {
      setRegistrationStatus({ type: 'error', message: error.message });
    } finally {
      setRegistrationSubmitting(false);
    }
  };

  const handleResendRegistration = async () => {
    if (!registrationSuccess?.rawEmail) return;
    setResendSubmitting(true);
    setRegistrationStatus({ type: '', message: '' });
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/pre-registrations/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registrationSuccess.rawEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to resend email');
      setRegistrationSuccess((current) => ({ ...current, ...data }));
      setRegistrationStatus({ type: 'success', message: data.message });
    } catch (error) {
      setRegistrationStatus({ type: 'error', message: error.message });
    } finally {
      setResendSubmitting(false);
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
        <Box
          sx={{
            minHeight: { xs: 28, md: 34 },
            px: { xs: 1.25, md: 2.5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 0.75, sm: 1.2 },
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
            textAlign: 'center',
            color: '#fff',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            backgroundImage: 'linear-gradient(90deg, rgba(8,37,64,0.94), rgba(10,64,101,0.9), rgba(8,37,64,0.94)), url("/images/background.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <Stack direction="row" spacing={0.55} alignItems="center" sx={{ minWidth: 0 }}>
            <Typography component="span" sx={{ color: '#ff7a18', fontSize: { xs: 8, md: 10 }, lineHeight: 1, flexShrink: 0, textShadow: '0 0 10px rgba(255,122,24,0.85)' }}>
              ●
            </Typography>
            <Typography
              component="span"
              sx={{
                color: '#ff7a18',
                fontWeight: 500,
                fontSize: { xs: 10, sm: 11, md: 12.5 },
                letterSpacing: { xs: 1.4, sm: 2.2, md: 3.4 },
                textTransform: 'uppercase',
                whiteSpace: { xs: 'normal', sm: 'nowrap' },
                textShadow: '0 0 12px rgba(255,122,24,0.55)',
              }}
            >
              Current Session (June 2026 - September 2026)
            </Typography>
          </Stack>
          <Typography component="span" sx={{ display: { xs: 'none', sm: 'inline' }, color: 'rgba(255,255,255,0.78)', fontWeight: 500 }}>
            |
          </Typography>
          <Typography
            component="span"
            sx={{
              color: 'rgba(255,255,255,0.92)',
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontWeight: 500,
              fontSize: { xs: 10.5, sm: 11.5, md: 13 },
              letterSpacing: 0,
              whiteSpace: 'nowrap',
            }}
          >
            MONDAYS & THURSDAYS 7PM - 10PM
          </Typography>
          <Typography component="span" sx={{ display: { xs: 'none', sm: 'inline' }, color: 'rgba(255,255,255,0.78)', fontWeight: 500 }}>
            |
          </Typography>
          <Button
            color="secondary"
            endIcon={<ArrowForwardIcon />}
            onClick={() => setOpenModal(true)}
            sx={{
              minHeight: 'auto',
              p: 0,
              color: '#ff7a18',
              fontWeight: 500,
              fontSize: { xs: 10, sm: 11, md: 12 },
              letterSpacing: { xs: 0.1, md: 0.35 },
              textTransform: 'uppercase',
              textShadow: '0 0 10px rgba(255,122,24,0.5)',
              '&:hover': { bgcolor: 'transparent', color: '#f2b94b', textShadow: '0 0 12px rgba(242,185,75,0.65)' },
            }}
          >
            Enroll Now
          </Button>
        </Box>

        <AppBar
          ref={headerRef}
          position="sticky"
          elevation={0}
          sx={{
            top: 0,
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
                {navItems.map(([label, hash]) => {
                  const isCommunity = label === 'Community';
                  return (
                    <Button
                      key={label}
                      component={isCommunity || hash ? Link : 'button'}
                      to={isCommunity ? '/login' : hash ? `/#${hash}` : undefined}
                      type={!isCommunity && !hash ? 'button' : undefined}
                      sx={navButtonSx}
                    >
                      {label}
                    </Button>
                  );
                })}
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
              {navItems.map(([label, hash]) => {
                const isCommunity = label === 'Community';
                return (
                  <Button
                    key={label}
                    component={isCommunity || hash ? Link : 'button'}
                    to={isCommunity ? '/login' : hash ? `/#${hash}` : undefined}
                    type={!isCommunity && !hash ? 'button' : undefined}
                    fullWidth
                    onClick={() => setMobileOpen(false)}
                    sx={{ justifyContent: 'flex-start', color: 'primary.dark' }}
                  >
                    {label}
                  </Button>
                );
              })}
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
            pt: { xs: 6, md: 7 },
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
              <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, width: '100%' }}>
                <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 3, p: { xs: 2, md: 2.5 }, backdropFilter: 'blur(18px)', width: '100%', maxWidth: 440 }}>
                  <Box component="img" src="/images/teaching.png" alt="Instructor teaching online IT students" sx={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 2, display: 'block' }} />
                  <Typography sx={{ mt: 1.4, fontWeight: 900, fontSize: { xs: '1.15rem', sm: '1.35rem' }, textAlign: 'center', color: '#fff' }}>
                    WE ENABLE POSSIBILITIES
                  </Typography>
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
                    JUNE 1ST - SEPT. 17TH, 2026 | MONDAYS & THURSDAYS | 7:00PM - 10.00PM | LOCATION: WEBX
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
            <SectionHeader title="Explore the Program" body="Build practical, career-focused skills across four key areas of modern IT: security, networking, IT audit, and AI for IT professionals, all included in one comprehensive program." />
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

                      <Stack direction="row" spacing={0.85} alignItems="flex-start" sx={{ color: '#102b49', mb: 1.35 }}>
                        <CourseInfoBadge type="prereq" />
                        <Typography sx={{ fontSize: { xs: '0.95rem', lg: 'clamp(0.72rem, 0.95vw, 0.9rem)' }, lineHeight: 1.45 }}>
                          <Box component="span" sx={{ fontWeight: 800, display: 'block', mb: 0.1 }}>Prerequisite</Box>
                          {course.prereq}
                        </Typography>
                      </Stack>

                      <Stack direction="row" spacing={0.85} alignItems="flex-start" sx={{ color: '#102b49', mb: { xs: 3, lg: 'clamp(1.2rem, 2vw, 3rem)' } }}>
                        <CourseInfoBadge type="desc" />
                        <Typography sx={{ fontSize: { xs: '0.95rem', lg: 'clamp(0.72rem, 0.95vw, 0.9rem)' }, lineHeight: 1.5 }}>
                          <Box component="span" sx={{ fontWeight: 800, display: 'block', mb: 0.1 }}>Description</Box>
                          {course.desc}
                        </Typography>
                      </Stack>

                      <Button variant="contained" color="primary" fullWidth onClick={() => setSelectedCourseDetails(course)} sx={{ mt: 'auto', bgcolor: '#5684e1', '&:hover': { bgcolor: '#466fd0' } }}>
                        Read more...
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
                    lg: 'repeat(4, minmax(0, 1fr))',
                  },
                  gap: { xs: 3, md: 3, xl: 4 },
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
                        maxWidth: { xs: 330, sm: 330, lg: 'none' },
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
              Take the Next Step in Your IT Career
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

        <Modal open={Boolean(selectedCourseDetails)} onClose={() => setSelectedCourseDetails(null)} aria-labelledby="course-detail-modal-title" sx={{ backdropFilter: 'blur(6px)' }}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '92vw', md: 880 },
              maxHeight: '88vh',
              overflowY: 'auto',
              bgcolor: '#fff',
              borderRadius: { xs: 2, sm: 3 },
              boxShadow: '0 24px 70px rgba(8,37,64,0.28)',
              border: '1px solid rgba(18,60,105,0.12)',
            }}
          >
            {selectedCourseDetails && (
              <>
                <Box sx={{ position: 'relative', height: { xs: 210, sm: 270 }, overflow: 'hidden', borderTopLeftRadius: { xs: 16, sm: 24 }, borderTopRightRadius: { xs: 16, sm: 24 } }}>
                  <Box component="img" src={selectedCourseDetails.img} alt={selectedCourseDetails.title} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,37,64,0.14) 0%, rgba(8,37,64,0.72) 100%)' }} />
                  <IconButton
                    aria-label="Close course details"
                    onClick={() => setSelectedCourseDetails(null)}
                    sx={{ position: 'absolute', top: 14, right: 14, bgcolor: 'rgba(255,255,255,0.92)', color: 'primary.dark', '&:hover': { bgcolor: '#fff' } }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <Box sx={{ position: 'absolute', left: { xs: 20, sm: 30 }, right: { xs: 20, sm: 30 }, bottom: { xs: 18, sm: 26 } }}>
                    <Typography id="course-detail-modal-title" variant="h3" sx={{ color: '#fff', fontSize: { xs: '2rem', sm: '2.65rem' }, lineHeight: 1.08, fontWeight: 900 }}>
                      {selectedCourseDetails.title}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ p: { xs: 2.2, sm: 3.2 } }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.25fr 0.75fr' }, gap: 2.5, alignItems: 'start' }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: '1.05rem', mb: 0.75 }}>Course Overview</Typography>
                        <Typography sx={{ color: '#526273', fontSize: { xs: '0.98rem', sm: '1.02rem' }, lineHeight: 1.75 }}>
                          {selectedCourseDetails.details}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: '1.05rem', mb: 1 }}>What you will learn</Typography>
                        <Stack spacing={1}>
                          {selectedCourseDetails.highlights.map((item) => (
                            <Stack key={item} direction="row" spacing={1.1} alignItems="flex-start">
                              <CheckCircleIcon sx={{ color: 'secondary.main', fontSize: 20, mt: '2px' }} />
                              <Typography sx={{ color: '#102b49', lineHeight: 1.55 }}>{item}</Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    </Stack>

                    <Box sx={{ bgcolor: '#f6f8fb', border: '1px solid rgba(18,60,105,0.1)', borderRadius: 2, p: 2 }}>
                      <Stack spacing={1.8}>
                        <Stack direction="row" spacing={1.2} alignItems="flex-start">
                          <CourseInfoBadge type="prereq" />
                          <Box>
                            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Prerequisite</Typography>
                            <Typography sx={{ color: '#526273', fontSize: 14 }}>{selectedCourseDetails.prereq}</Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1.2} alignItems="flex-start">
                          <CourseInfoBadge type="desc" />
                          <Box>
                            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Short Description</Typography>
                            <Typography sx={{ color: '#526273', fontSize: 14, lineHeight: 1.6 }}>{selectedCourseDetails.desc}</Typography>
                          </Box>
                        </Stack>
                        <Button
                          variant="contained"
                          color="secondary"
                          fullWidth
                          onClick={() => {
                            setSelectedCourseDetails(null);
                            setOpenModal(true);
                          }}
                        >
                          Enroll Now
                        </Button>
                      </Stack>
                    </Box>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Modal>

        <Modal open={openModal} onClose={() => setOpenModal(false)} aria-labelledby="registration-modal-title" sx={{ backdropFilter: 'blur(6px)' }}>
          <Box sx={modalStyle}>
            {registrationSuccess ? (
              <Stack spacing={2.1}>
                <Box>
                  <Typography id="registration-modal-title" variant="h5" sx={{ color: 'primary.dark', fontWeight: 900, mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.9rem' } }}>
                    Check your email
                  </Typography>
                  <Typography sx={{ color: '#687789', fontSize: { xs: 13.5, sm: 14.5 }, lineHeight: 1.7 }}>
                    We've sent a secure registration link to {registrationSuccess.email}. Open the email to verify your address and finish setting up your Three13 learner account.
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: '#f8fafc', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.4, p: 1.6 }}>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 0.4 }}>Didn't receive it?</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 13.5 }}>You may also want to check your spam or junk folder.</Typography>
                  {registrationSuccess.setup_url && (
                    <Button size="small" href={registrationSuccess.setup_url} sx={{ mt: 1, color: '#0b67c2', fontWeight: 850 }}>
                      Open development setup link
                    </Button>
                  )}
                </Box>
                {registrationStatus.message && (
                  <Typography sx={{ color: registrationStatus.type === 'error' ? 'error.main' : '#16805f', fontSize: 13, fontWeight: 800 }}>
                    {registrationStatus.message}
                  </Typography>
                )}
                <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.2} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => { setRegistrationSuccess(null); setOpenModal(false); }} sx={{ width: { xs: '100%', sm: 'auto' } }}>Done</Button>
                  <Button variant="contained" color="primary" disabled={resendSubmitting} onClick={handleResendRegistration} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    {resendSubmitting ? 'Sending...' : 'Resend Email'}
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <>
                <Typography id="registration-modal-title" variant="h5" sx={{ color: 'primary.dark', fontWeight: 900, mb: 0.5, fontSize: { xs: '1.45rem', sm: '1.85rem' } }}>
                  Start Your Registration
                </Typography>
                <Typography sx={{ color: '#687789', mb: 1, fontSize: { xs: 13, sm: 14.5 }, lineHeight: 1.6 }}>
                  Tell us a little about yourself and your learning goals. We'll email you a secure link to complete your registration.
                </Typography>
                <Chip label="Step 1 of 2 - Pre-Registration" sx={{ mb: { xs: 2, sm: 2.4 }, bgcolor: '#eef6ff', color: 'primary.dark', fontWeight: 850 }} />
                <Box component="form" onSubmit={handleSubmit}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: { xs: 1.15, sm: 1.5 } }}>
                    <TextField required fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} error={Boolean(errors.firstName)} helperText={errors.firstName} size="small" />
                    <TextField required fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} error={Boolean(errors.lastName)} helperText={errors.lastName} size="small" />
                    <TextField required fullWidth label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} error={Boolean(errors.email)} helperText={errors.email} size="small" />
                    <TextField required fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} error={Boolean(errors.phone)} helperText={errors.phone} size="small" />
                    <FormControl fullWidth size="small">
                      <InputLabel>Country / Location</InputLabel>
                      <Select name="country" value={formData.country} onChange={handleInputChange} label="Country / Location" MenuProps={registrationSelectMenuProps}>
                        {countryOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small" error={Boolean(errors.experienceLevel)}>
                      <InputLabel>Experience Level</InputLabel>
                      <Select name="experienceLevel" value={formData.experienceLevel} onChange={handleInputChange} label="Experience Level" MenuProps={registrationSelectMenuProps}>
                        {experienceLevelOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                      </Select>
                      {errors.experienceLevel && <Typography color="error" sx={{ fontSize: 12, mt: 0.4 }}>{errors.experienceLevel}</Typography>}
                    </FormControl>
                    <FormControl fullWidth size="small" error={Boolean(errors.learningGoal)}>
                      <InputLabel>Learning Goal</InputLabel>
                      <Select name="learningGoal" value={formData.learningGoal} onChange={handleInputChange} label="Learning Goal" MenuProps={registrationSelectMenuProps}>
                        {learningGoalOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                      </Select>
                      {errors.learningGoal && <Typography color="error" sx={{ fontSize: 12, mt: 0.4 }}>{errors.learningGoal}</Typography>}
                    </FormControl>
                    {formData.learningGoal === 'Other' && (
                      <TextField required fullWidth label="Tell us briefly what you're hoping to achieve" name="learningGoalOther" value={formData.learningGoalOther} onChange={handleInputChange} error={Boolean(errors.learningGoalOther)} helperText={errors.learningGoalOther} size="small" />
                    )}
                    <FormControl fullWidth size="small">
                      <InputLabel>How did you hear about Three13?</InputLabel>
                      <Select name="referralSource" value={formData.referralSource} onChange={handleInputChange} label="How did you hear about Three13?" MenuProps={registrationSelectMenuProps}>
                        {referralSourceOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                      </Select>
                    </FormControl>
                    {formData.referralSource === 'Other' && (
                      <TextField fullWidth label="Referral source" name="referralSourceOther" value={formData.referralSourceOther} onChange={handleInputChange} size="small" />
                    )}
                    <Box sx={{ gridColumn: '1 / -1', bgcolor: '#eef3f8', borderRadius: 1.2, p: 1.5 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 14 }}>What happens next?</Typography>
                      <Typography sx={{ color: '#637083', fontSize: 13.5, mt: 0.4, lineHeight: 1.6 }}>
                        After you submit this form, we'll email you a secure link to verify your email, create your password, and complete your Three13 registration.
                      </Typography>
                    </Box>
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <FormControl error={Boolean(errors.agree)} fullWidth>
                        <FormControlLabel
                          control={<Checkbox checked={formData.agree} onChange={handleInputChange} name="agree" size="small" />}
                          label={<Typography sx={{ fontSize: 14 }}>I agree to the Terms of Service and Privacy Policy.</Typography>}
                        />
                        {errors.agree && <Typography color="error" sx={{ fontSize: 12 }}>{errors.agree}</Typography>}
                      </FormControl>
                      <FormControlLabel
                        control={<Checkbox checked={formData.marketingConsent} onChange={handleInputChange} name="marketingConsent" size="small" />}
                        label={<Typography sx={{ fontSize: 14 }}>I'd like to receive Three13 course updates, training opportunities, and announcements.</Typography>}
                      />
                    </Box>
                  </Box>
                  {registrationStatus.message && (
                    <Typography sx={{ mt: 1.5, color: registrationStatus.type === 'success' ? '#16805f' : 'error.main', fontSize: 13, fontWeight: 800 }}>
                      {registrationStatus.message}
                    </Typography>
                  )}
                  <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.2} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mt: { xs: 2, sm: 3 } }}>
                    <Typography sx={{ color: '#637083', fontSize: 12.5 }}>No payment is required at this stage.</Typography>
                    <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.2}>
                      <Button variant="outlined" onClick={() => setOpenModal(false)} sx={{ width: { xs: '100%', sm: 'auto' } }}>Cancel</Button>
                      <Button type="submit" variant="contained" color="primary" disabled={registrationSubmitting} endIcon={<ArrowForwardIcon />} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        {registrationSubmitting ? 'Sending...' : 'Continue'}
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </>
            )}
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
