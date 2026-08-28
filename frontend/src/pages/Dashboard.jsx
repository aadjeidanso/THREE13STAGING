import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  AccountCircleOutlined,
  AddOutlined,
  AccessTimeOutlined,
  ArticleOutlined,
  AssignmentOutlined,
  CalendarTodayOutlined,
  CampaignOutlined,
  CheckCircleOutlined,
  ChevronRightOutlined,
  CloseOutlined,
  DashboardOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  EmailOutlined,
  EmojiEventsOutlined,
  ExpandMoreOutlined,
  FilterAltOffOutlined,
  FolderCopyOutlined,
  ForumOutlined,
  GroupOutlined,
  HelpOutlineOutlined,
  InsertDriveFileOutlined,
  KeyboardArrowUpOutlined,
  KeyboardArrowDownOutlined,
  LinkOutlined,
  LightbulbOutlined,
  LockOutlined,
  MenuOutlined,
  MenuBookOutlined,
  MoreHorizOutlined,
  MoreVertOutlined,
  NotificationsOutlined,
  OndemandVideoOutlined,
  OpenInNewOutlined,
  PersonOutlineOutlined,
  PhoneOutlined,
  PictureAsPdfOutlined,
  SearchOutlined,
  SchoolOutlined,
  SendOutlined,
  SettingsOutlined,
  ShieldOutlined,
  SlideshowOutlined,
  SupportAgentOutlined,
  ThumbDownOutlined,
  ThumbUpOutlined,
  TrendingUpOutlined,
  VerifiedOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
  ViewModuleOutlined,
} from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Avatar,
  Badge,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Popover,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#123c69', dark: '#082540' },
    secondary: { main: '#f05a28' },
    background: { default: '#f6f8fb' },
    success: { main: '#16805f' },
  },
  typography: {
    fontFamily: 'Poppins, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h3: { fontWeight: 800, letterSpacing: 0 },
    h4: { fontWeight: 800, letterSpacing: 0 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
});

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
const lmsFileAccept = '.pdf,.ppt,.pptx,.doc,.docx,.txt,.md,.csv,.xlsx,.zip,.py,.js,.jsx,.ts,.tsx,.html,.css,.json,.sql,.jpg,.jpeg,.png,.webp,.gif';
const learnerDisplayId = (user) => {
  if (!user) return 'STU-2026-00000';
  if (user.display_id) return user.display_id;
  const isAlumni = (user.lifecycle_status || 'active_student') === 'alumni';
  const year = user.created_at ? new Date(user.created_at * 1000).getFullYear() : 2026;
  return `${isAlumni ? 'ALM' : 'STU'}-${year}-${String(user.id || 0).padStart(5, '0')}`;
};

const roleLabels = {
  admin: 'Admin Portal',
  teacher: 'Teacher Portal',
  student: 'Student Portal',
};

const roleNextSteps = {
  admin: ['Review pending enrollment requests', 'Create courses and assign teachers', 'Post announcements'],
  teacher: ['Open assigned courses', 'Upload course materials', 'Review student submissions'],
  student: ['Continue approved courses', 'Check assignments', 'View recent announcements'],
};

const adminNavItems = [
  { key: 'dashboard', label: 'Dashboard', icon: DashboardOutlined },
  { key: 'students', label: 'Students', icon: GroupOutlined },
  { key: 'cohorts', label: 'Cohorts', icon: CalendarTodayOutlined },
  { key: 'teachers', label: 'Teachers', icon: SchoolOutlined },
  { key: 'courses', label: 'Courses', icon: MenuBookOutlined },
  { key: 'materials', label: 'Course Materials', icon: FolderCopyOutlined },
  { key: 'assignments', label: 'Assignments', icon: AssignmentOutlined },
  { key: 'submissions', label: 'Submissions', icon: AssignmentOutlined },
  { key: 'announcements', label: 'Announcements', icon: CampaignOutlined },
  { key: 'community', label: 'Community', icon: ForumOutlined },
  { key: 'support', label: 'Support', icon: SupportAgentOutlined },
  { key: 'settings', label: 'Settings', icon: SettingsOutlined },
];

const studentNavItems = [
  { key: 'dashboard', label: 'Dashboard', icon: DashboardOutlined },
  { key: 'my-courses', label: 'My Courses', icon: MenuBookOutlined },
  { key: 'announcements', label: 'Announcements', icon: CampaignOutlined },
  { key: 'community', label: 'Community', icon: ForumOutlined },
  { key: 'support', label: 'Support', icon: SupportAgentOutlined },
  { key: 'profile', label: 'Profile', icon: AccountCircleOutlined },
];

const studentCourseNavItems = [
  { key: 'modules', label: 'Modules', icon: ViewModuleOutlined },
  { key: 'materials', label: 'Course Materials', icon: FolderCopyOutlined },
  { key: 'assignments', label: 'Assignments', icon: AssignmentOutlined },
  { key: 'certificates', label: 'Certificates', icon: VerifiedOutlined },
];

const studentPaneKeys = [
  ...studentNavItems.map((item) => item.key),
  ...studentCourseNavItems.map((item) => item.key),
];

const teacherNavItems = [
  { key: 'dashboard', label: 'Dashboard', icon: DashboardOutlined },
  { key: 'students', label: 'Students', icon: GroupOutlined },
  { key: 'my-courses', label: 'My Courses', icon: MenuBookOutlined },
  { key: 'materials', label: 'Course Materials', icon: FolderCopyOutlined },
  { key: 'assignments', label: 'Assignments', icon: AssignmentOutlined },
  { key: 'submissions', label: 'Submissions', icon: AssignmentOutlined },
  { key: 'announcements', label: 'Announcements', icon: CampaignOutlined },
  { key: 'community', label: 'Community', icon: ForumOutlined },
  { key: 'support', label: 'Support', icon: SupportAgentOutlined },
  { key: 'profile', label: 'Profile', icon: AccountCircleOutlined },
];

const materialTypeOptions = [
  { value: 'youtube', label: 'YouTube recording' },
  { value: 'pdf', label: 'PDF' },
  { value: 'powerpoint', label: 'PowerPoint slides' },
  { value: 'word', label: 'Word document' },
  { value: 'code', label: 'Code file' },
  { value: 'external_link', label: 'External link' },
  { value: 'downloadable', label: 'Downloadable resource' },
  { value: 'other', label: 'Other' },
];

const materialTypeLabels = materialTypeOptions.reduce((labels, option) => ({
  ...labels,
  [option.value]: option.label,
}), {});

const sortModules = (modules, sortBy = 'position') => [...modules].sort((first, second) => {
  if (sortBy === 'title_az') return String(first.title || '').localeCompare(String(second.title || ''));
  if (sortBy === 'title_za') return String(second.title || '').localeCompare(String(first.title || ''));
  if (sortBy === 'newest') return (second.created_at || 0) - (first.created_at || 0);
  if (sortBy === 'oldest') return (first.created_at || 0) - (second.created_at || 0);
  return (first.position || 0) - (second.position || 0) || (first.created_at || 0) - (second.created_at || 0);
});

const supportCategoryOptions = [
  { value: 'student_question', label: 'Student questions' },
  { value: 'teacher_issue', label: 'Teacher issues' },
  { value: 'technical_problem', label: 'Technical problems' },
  { value: 'enrollment_confirmation', label: 'Enrollment confirmations' },
];

const supportCategoryLabels = supportCategoryOptions.reduce((labels, option) => ({
  ...labels,
  [option.value]: option.label,
}), {});

const courseImageMap = {
  'network essentials': '/images/course1.jpg',
  'security essentials': '/images/course2.jpg',
  'cisa / it audit': '/images/course3.jpg',
  'cisa/it audit': '/images/course3.jpg',
  'ai essentials for it professionals': '/images/AI-Essential.jpg',
};

function getToken() {
  return window.localStorage.getItem('three13_token');
}

function getCourseImage(title) {
  return courseImageMap[(title || '').trim().toLowerCase()];
}

function formatTimestamp(timestamp, options = {}) {
  if (!timestamp) return 'Not set';
  return new Date(timestamp * 1000).toLocaleDateString(undefined, options);
}

function formatDateTime(timestamp) {
  if (!timestamp) return 'Recent';
  return new Date(timestamp * 1000).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const adminTableHeaderSx = {
  display: { xs: 'none', lg: 'grid' },
  gap: 1,
  px: { lg: 1.1, xl: 1.5 },
  py: { lg: 1.15, xl: 1.35 },
  bgcolor: 'primary.dark',
  borderBottom: '1px solid rgba(18,60,105,0.08)',
  '& .admin-table-heading': {
    color: '#fff',
    fontWeight: 900,
    fontSize: { lg: 11.5, xl: 12.5 },
    lineHeight: 1.2,
  },
};

function getMaterialUrl(material) {
  return material?.external_url || material?.file_url || '';
}

function isImageUrl(url = '') {
  return /\.(png|jpe?g|gif|webp)(\?|#|$)/i.test(url);
}

function isCsvFile(material, url = '') {
  const name = `${url || ''} ${material?.title || ''} ${material?.file_name || ''} ${material?.attachment_name || ''}`;
  return /\.csv(\?|#|$|\s)/i.test(name) || material?.material_type === 'csv';
}

function parseCsvText(text = '') {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  row.push(cell);
  if (row.some((value) => value.trim() !== '')) rows.push(row);
  return rows;
}

function previewText(text = '', maxLength = 96) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}...`;
}

function getYouTubeVideoId(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    let videoId = '';
    if (host === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
    } else if (host.endsWith('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) videoId = parsed.pathname.split('/').filter(Boolean)[1] || '';
      if (parsed.pathname.startsWith('/shorts/')) videoId = parsed.pathname.split('/').filter(Boolean)[1] || '';
      if (!videoId) videoId = parsed.searchParams.get('v') || '';
    }
    return videoId;
  } catch {
    return '';
  }
}

function getYouTubeEmbedUrl(url) {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
}

function getYouTubeThumbnailUrl(url) {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
}

function PdfFileTile({ size = 34 }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: size <= 20 ? 0.5 : 0.9,
        bgcolor: '#e6312b',
        position: 'relative',
        boxShadow: '0 7px 15px rgba(217,48,37,0.24)',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: size * 0.28,
          height: size * 0.28,
          bgcolor: '#ff8a80',
          clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
        },
      }}
    >
      <PictureAsPdfOutlined sx={{ position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%, -50%)', color: '#fff', fontSize: size * 0.54 }} />
    </Box>
  );
}

function MaterialViewerDialog({ material, open, onClose }) {
  const url = getMaterialUrl(material);
  const youtubeUrl = material?.material_type === 'youtube' ? getYouTubeEmbedUrl(url) : '';
  const previewUrl = youtubeUrl || url;
  const canPreview = Boolean(previewUrl);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ color: 'primary.dark', fontWeight: 900, pr: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>{material?.title || 'Course material'}</Typography>
            {material?.course?.title && <Typography sx={{ color: '#637083', fontSize: 13 }}>{material.course.title}</Typography>}
          </Box>
          <Stack direction="row" spacing={1}>
            {url && <Button component="a" href={url} target="_blank" rel="noreferrer" variant="outlined" size="small">Open tab</Button>}
            <Button onClick={onClose} variant="contained" color="secondary" size="small">Close</Button>
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        {material?.description && <Typography sx={{ color: '#526273', mb: 1.2 }}>{material.description}</Typography>}
        {canPreview ? (
          <Box sx={{ bgcolor: '#082540', borderRadius: 1, overflow: 'hidden', height: { xs: '60vh', md: '72vh' } }}>
            <Box
              component="iframe"
              title={material?.title || 'Course material viewer'}
              src={previewUrl}
              allow={youtubeUrl ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' : undefined}
              allowFullScreen={Boolean(youtubeUrl)}
              sx={{ width: '100%', height: '100%', border: 0, bgcolor: '#fff' }}
            />
          </Box>
        ) : (
          <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>No preview link is available for this material.</Typography>
          </Box>
        )}
        {!youtubeUrl && url && (
          <Typography sx={{ color: '#637083', fontSize: 12, mt: 1 }}>
            Some document types may download or block embedded preview depending on the file format and browser.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MaterialInlineViewer({ material, onBack, backLabel = 'Back to materials', subtitle }) {
  const url = getMaterialUrl(material);
  const youtubeUrl = material?.material_type === 'youtube' ? getYouTubeEmbedUrl(url) : '';
  const isCsv = isCsvFile(material, url);
  const previewUrl = youtubeUrl || url;
  const [csvState, setCsvState] = React.useState({ loading: false, error: '', rows: [] });

  React.useEffect(() => {
    if (!isCsv || !url) {
      setCsvState({ loading: false, error: '', rows: [] });
      return;
    }
    let mounted = true;
    setCsvState({ loading: true, error: '', rows: [] });
    fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load CSV preview');
        const text = await response.text();
        if (mounted) setCsvState({ loading: false, error: '', rows: parseCsvText(text) });
      })
      .catch((err) => mounted && setCsvState({ loading: false, error: err.message, rows: [] }));
    return () => { mounted = false; };
  }, [isCsv, url]);

  return (
    <Stack spacing={2.2}>
      <StudentPageHeader
        title={material?.title || 'Course Material'}
        subtitle={subtitle || (material?.course?.title ? `${material.course.title} | ${material.module_title || 'Course resource'}` : 'Course resource')}
        icon={FolderCopyOutlined}
        action={<Button variant="outlined" onClick={onBack}>{backLabel}</Button>}
      />
      {material?.description && (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
          <Typography sx={{ color: '#526273' }}>{material.description}</Typography>
        </Box>
      )}
      <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 1, md: 1.5 } }}>
        {isCsv ? (
          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1, overflow: 'hidden', bgcolor: '#fff' }}>
            <Box sx={{ px: 1.5, py: 1.2, bgcolor: '#f8fbff', borderBottom: '1px solid rgba(18,60,105,0.1)' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                <Box>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>CSV Preview</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 12 }}>
                    {csvState.rows.length ? `${csvState.rows.length} row${csvState.rows.length === 1 ? '' : 's'} loaded` : 'Spreadsheet-style preview'}
                  </Typography>
                </Box>
                {csvState.loading && <CircularProgress size={22} />}
              </Stack>
            </Box>
            {csvState.error ? (
              <Box sx={{ p: 2 }}>
                <Alert severity="error">{csvState.error}</Alert>
              </Box>
            ) : csvState.loading ? (
              <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 280 }}>
                <CircularProgress size={28} />
              </Stack>
            ) : csvState.rows.length === 0 ? (
              <Box sx={{ p: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>No CSV rows found.</Typography>
              </Box>
            ) : (
              <Box sx={{ maxHeight: { xs: '58vh', md: '70vh' }, overflow: 'auto' }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 720 }}>
                  <Box component="thead" sx={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <Box component="tr">
                      {csvState.rows[0].map((heading, index) => (
                        <Box
                          key={`csv-heading-${index}`}
                          component="th"
                          sx={{
                            bgcolor: '#082540',
                            color: '#fff',
                            textAlign: 'left',
                            px: 1.25,
                            py: 1,
                            fontSize: 12.5,
                            fontWeight: 900,
                            borderRight: '1px solid rgba(255,255,255,0.12)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {heading || `Column ${index + 1}`}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {csvState.rows.slice(1).map((row, rowIndex) => (
                      <Box key={`csv-row-${rowIndex}`} component="tr" sx={{ bgcolor: rowIndex % 2 === 0 ? '#fff' : '#f8fbff' }}>
                        {csvState.rows[0].map((_, cellIndex) => (
                          <Box
                            key={`csv-cell-${rowIndex}-${cellIndex}`}
                            component="td"
                            sx={{
                              px: 1.25,
                              py: 0.9,
                              color: '#123c69',
                              fontSize: 13,
                              borderBottom: '1px solid rgba(18,60,105,0.08)',
                              borderRight: '1px solid rgba(18,60,105,0.06)',
                              verticalAlign: 'top',
                              maxWidth: 320,
                              wordBreak: 'break-word',
                            }}
                          >
                            {row[cellIndex] || ''}
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        ) : previewUrl ? (
          <Box sx={{ bgcolor: '#082540', borderRadius: 1, overflow: 'hidden', height: { xs: '62vh', md: '72vh' } }}>
            <Box
              component="iframe"
              title={material?.title || 'Course material viewer'}
              src={previewUrl}
              allow={youtubeUrl ? 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' : undefined}
              allowFullScreen={Boolean(youtubeUrl)}
              sx={{ width: '100%', height: '100%', border: 0, bgcolor: '#fff' }}
            />
          </Box>
        ) : (
          <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>No preview link is available for this material.</Typography>
          </Box>
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mt: 1.2 }}>
          <Typography sx={{ color: '#637083', fontSize: 12 }}>
            {isCsv ? 'CSV files are rendered as a table inside the Three13 portal.' : !youtubeUrl && url ? 'Some document types may download or block embedded preview depending on the file format and browser.' : 'Video is playing inside the Three13 portal.'}
          </Typography>
          {url && (
            <Stack direction="row" spacing={1}>
              <Button component="a" href={url} download={material?.title || true} variant="outlined" size="small" startIcon={<DownloadOutlined />}>Download</Button>
              <Button component="a" href={url} target="_blank" rel="noreferrer" variant="outlined" size="small">Open tab</Button>
            </Stack>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}

function UserAvatar({ user, size = 44 }) {
  const initials = (user?.full_name || user?.email || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <Avatar
      src={user?.profile_image_url || undefined}
      alt={user?.full_name || 'User profile'}
      sx={{
        width: size,
        height: size,
        bgcolor: '#123c69',
        color: '#fff',
        fontWeight: 900,
        fontSize: size > 48 ? '1.1rem' : '0.95rem',
      }}
    >
      {initials}
    </Avatar>
  );
}

function useAdminPaneToast(message, setMessage, error, setError, onAdminToast) {
  React.useEffect(() => {
    if (!onAdminToast || !message) return;
    onAdminToast(message, 'success');
    setMessage('');
  }, [message, onAdminToast, setMessage]);

  React.useEffect(() => {
    if (!onAdminToast || !error) return;
    onAdminToast(error, 'error');
    setError('');
  }, [error, onAdminToast, setError]);
}

function AdminEnrollmentRequests({ onAdminDataChanged, onAdminToast, initialStatus = 'pending', showStatusFilters = true, compactTitle = false }) {
  const [requests, setRequests] = React.useState([]);
  const [statusFilter, setStatusFilter] = React.useState(initialStatus);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [busyId, setBusyId] = React.useState(null);
  useAdminPaneToast(message, setMessage, error, setError, onAdminToast);

  const loadRequests = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/enrollment-requests?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load enrollment requests');
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  React.useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const decideRequest = async (requestId, status) => {
    setBusyId(requestId);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/enrollment-requests/${requestId}/decision`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || `Unable to ${status} request`);
      setRequests((current) => (
        statusFilter === 'pending'
          ? current.filter((request) => request.id !== requestId)
          : current.map((request) => (request.id === requestId ? data : request))
      ));
      onAdminDataChanged?.();
      setMessage(`Enrollment request ${status}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const groupedRequests = requests.reduce((groups, request) => {
    const key = request.student.id;
    if (!groups[key]) {
      groups[key] = {
        student: request.student,
        requests: [],
      };
    }
    groups[key].requests.push(request);
    return groups;
  }, {});

  const requestGroups = Object.values(groupedRequests);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography variant={compactTitle ? 'h4' : 'h3'} sx={{ color: 'primary.dark', fontSize: compactTitle ? { xs: '1.45rem', md: '1.85rem' } : { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>
            {statusFilter === 'pending' && compactTitle ? 'Pending Enrollment Requests' : 'Enrollment Requests'}
          </Typography>
          <Typography sx={{ color: '#637083' }}>
            Confirm manual payment outside the platform, then approve or reject course access.
          </Typography>
        </Box>
        <Button variant="outlined" onClick={loadRequests}>Refresh</Button>
      </Stack>

      {showStatusFilters && (
      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.2, bgcolor: '#fff', mb: 2 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          {[
            ['pending', 'Pending'],
            ['approved', 'Approved'],
            ['rejected', 'Rejected'],
            ['removed', 'Removed'],
            ['all', 'All'],
          ].map(([value, label]) => (
            <Button
              key={value}
              variant={statusFilter === value ? 'contained' : 'outlined'}
              color={statusFilter === value ? 'secondary' : 'primary'}
              onClick={() => setStatusFilter(value)}
              sx={{ mb: 0.5 }}
            >
              {label}
            </Button>
          ))}
        </Stack>
      </Box>
      )}

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : requestGroups.length === 0 ? (
        <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}>
          <Typography sx={{ color: 'primary.dark', fontWeight: 700 }}>No {statusFilter === 'all' ? '' : statusFilter} enrollment requests right now.</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {requestGroups.map((group) => (
            <Box key={group.student.id} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 1.5, sm: 2 }, bgcolor: '#fff' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} sx={{ mb: 1.5 }}>
                <Box>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: '1.05rem' }}>{group.student.full_name}</Typography>
                  <Typography sx={{ color: '#526273', fontSize: 14 }}>{group.student.email}</Typography>
                  <Typography sx={{ color: '#526273', fontSize: 14 }}>{group.student.phone || 'No phone provided'}</Typography>
                </Box>
                <Chip label={`${group.requests.length} pending course${group.requests.length === 1 ? '' : 's'}`} color="warning" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 800 }} />
              </Stack>

              <Stack spacing={1}>
                {group.requests.map((request) => (
                  <Box key={request.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.4 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, flexWrap: 'wrap' }}>
                          <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{request.course.title}</Typography>
                          <Chip
                            label={request.status}
                            size="small"
                            color={request.status === 'approved' ? 'success' : request.status === 'pending' ? 'warning' : request.status === 'rejected' ? 'error' : 'default'}
                          />
                        </Stack>
                        <Typography sx={{ color: '#637083', fontSize: 13 }}>
                          Prerequisites: {request.prerequisites === 'yes' ? 'Yes' : 'No'}
                          {request.experience_level ? ` | Experience: ${request.experience_level}` : ''}
                          {request.learning_goal ? ` | Goal: ${request.learning_goal}` : ''}
                        </Typography>
                      </Box>
                      {request.status === 'pending' && (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ minWidth: { md: 220 } }}>
                          <Button variant="contained" color="success" disabled={busyId === request.id} onClick={() => decideRequest(request.id, 'approved')}>
                            Approve
                          </Button>
                          <Button variant="outlined" color="error" disabled={busyId === request.id} onClick={() => decideRequest(request.id, 'rejected')}>
                            Reject
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}

function AdminDashboardHome({ refreshKey, setActivePane }) {
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showAllActivity, setShowAllActivity] = React.useState(false);
  const [activityRangeDays, setActivityRangeDays] = React.useState(30);
  const activityRangeOptions = [7, 15, 30, 60, 90];

  React.useEffect(() => {
    let isMounted = true;

    const loadSummary = async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
        setError('');
      }
      try {
        const headers = { Authorization: `Bearer ${getToken()}` };
        const base = apiBaseUrl.replace(/\/$/, '');
        const [summaryResponse, activityResponse] = await Promise.all([
          fetch(`${base}/admin/dashboard-summary`, { headers }),
          fetch(`${base}/admin/recent-activity?limit=50`, { headers }),
        ]);
        const data = await summaryResponse.json();
        if (!summaryResponse.ok) throw new Error(data.detail || 'Unable to load admin dashboard');
        let activityData = [];
        if (activityResponse.ok) {
          activityData = await activityResponse.json();
        }
        if (isMounted) setSummary({ ...data, recent_activity: activityData.length ? activityData : data.recent_activity });
      } catch (err) {
        if (isMounted && !silent) setError(err.message);
      } finally {
        if (isMounted && !silent) setLoading(false);
      }
    };

    loadSummary();
    const refreshId = window.setInterval(() => loadSummary({ silent: true }), 15000);
    return () => {
      isMounted = false;
      window.clearInterval(refreshId);
    };
  }, [refreshKey]);

  const totals = summary?.totals || {};
  const recentSubmissions = summary?.recent_submissions || [];
  const recentAnnouncements = summary?.recent_announcements || [];
  const backendRecentActivity = summary?.recent_activity || [];
  const stats = [
    { label: 'Current Students', value: totals.students ?? 0, source: 'Active cohort learners', icon: GroupOutlined, color: '#8b5cf6', bg: '#f0e7ff' },
    { label: 'Total Courses', value: totals.courses ?? 0, source: 'Live course count', icon: MenuBookOutlined, color: '#1b7df3', bg: '#e6f0ff' },
    { label: 'Pending Students', value: totals.pending_enrollment_requests ?? 0, source: 'Awaiting approval', icon: AssignmentOutlined, color: '#f05a28', bg: '#fff0e7' },
    { label: 'Program Participants', value: totals.program_participants ?? 0, source: 'All registered students', icon: DashboardOutlined, color: '#8b5cf6', bg: '#f0e7ff' },
  ];
  const activityMeta = {
    submission: { icon: AssignmentOutlined, color: '#15965f', bg: '#def7e8', dot: '#37b977' },
    announcement: { icon: CampaignOutlined, color: '#f05a28', bg: '#fff0e7', dot: '#ff8b6a' },
    material: { icon: InsertDriveFileOutlined, color: '#1b6ef3', bg: '#e8f1ff', dot: '#1b6ef3' },
    module: { icon: ViewModuleOutlined, color: '#7a4fe8', bg: '#f1e9ff', dot: '#8b5cf6' },
    enrollment: { icon: PersonOutlineOutlined, color: '#8b5cf6', bg: '#f0e7ff', dot: '#c4b5fd' },
    course: { icon: MenuBookOutlined, color: '#1b6ef3', bg: '#e8f1ff', dot: '#1b6ef3' },
    support: { icon: SupportAgentOutlined, color: '#d32f2f', bg: '#ffe8e8', dot: '#f05a28' },
  };
  const recentActivity = backendRecentActivity.length ? backendRecentActivity : [
    ...recentSubmissions.map((submission) => ({
      id: `submission-${submission.id}`,
      type: 'submission',
      title: 'Assignment submitted',
      detail: `${submission.student_name} submitted ${submission.assignment_title ? `"${submission.assignment_title}"` : 'an assignment'}`,
      detail_status: submission.status === 'late' ? 'Late' : 'On time',
      course: submission.course_title || 'Course',
      location: submission.module_title || 'Assignment',
      created_at: submission.submitted_at,
      action_label: 'View submission',
      pane: 'assignments',
    })),
    ...recentAnnouncements.map((announcement) => ({
      id: `announcement-${announcement.id}`,
      type: 'announcement',
      title: 'Announcement posted',
      detail: `${announcement.author_name || 'Administrator'} posted "${announcement.title}"`,
      detail_status: 'Visible',
      course: announcement.audience === 'course' ? 'Course' : 'All Courses',
      location: 'Announcement',
      created_at: announcement.created_at,
      action_label: 'View announcement',
      pane: 'announcements',
    })),
  ].sort((first, second) => (second.created_at || 0) - (first.created_at || 0)).slice(0, 8);
  const activityCutoff = Math.floor(Date.now() / 1000) - (activityRangeDays * 24 * 60 * 60);
  const rangedActivity = recentActivity.filter((item) => !item.created_at || item.created_at >= activityCutoff);
  const displayedActivity = showAllActivity ? rangedActivity : rangedActivity.slice(0, 5);
  const hiddenActivityCount = Math.max(rangedActivity.length - displayedActivity.length, 0);
  const cardSx = {
    bgcolor: '#fff',
    border: '1px solid rgba(18,60,105,0.1)',
    borderRadius: 1.5,
    boxShadow: '0 16px 40px rgba(18,60,105,0.06)',
  };

  return (
    <Stack spacing={2.4}>
      <Box sx={{ position: 'relative', minHeight: { xs: 148, md: 160 }, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <Box sx={{ maxWidth: { xs: '100%', md: '64%' }, zIndex: 1 }}>
          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.45rem' }, mb: 0.8 }}>
            Welcome back, Admin!
          </Typography>
          <Typography sx={{ color: '#637083', fontSize: { xs: 14, md: 16 } }}>
            Here's what's happening in your learning platform today.
          </Typography>
        </Box>
        <Box
          component="img"
          src="/images/student_illustration_upscaled.png"
          alt=""
          sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', right: 0, bottom: -10, width: { md: 260, lg: 340 }, opacity: 0.94 }}
        />
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 1.4, lg: 1.2, xl: 1.8 } }}>
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Box key={stat.label} sx={{ ...cardSx, p: { xs: 1.6, lg: 1.35, xl: 2 } }}>
                  <Stack direction="row" spacing={{ xs: 1.4, lg: 1.05, xl: 1.4 }} alignItems="center">
                    <Box sx={{ width: { xs: 52, lg: 46, xl: 52 }, height: { xs: 52, lg: 46, xl: 52 }, borderRadius: 1.5, bgcolor: stat.bg, color: stat.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon sx={{ fontSize: { xs: 28, lg: 25, xl: 28 } }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ color: '#526273', fontSize: { xs: 12, lg: 11.3, xl: 12 }, fontWeight: 800 }}>{stat.label}</Typography>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: { xs: 28, lg: 25, xl: 28 }, lineHeight: 1 }}>{stat.value}</Typography>
                      <Typography noWrap sx={{ color: '#637083', fontSize: { xs: 11, lg: 10.5, xl: 11 }, mt: 0.5 }}>{stat.source}</Typography>
                      <Stack direction="row" spacing={1} alignItems="baseline" sx={{ display: 'none' }}>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: 28, lineHeight: 1 }}>{stat.value}</Typography>
                        <Typography sx={{ color: '#16a36d', fontWeight: 850, fontSize: 12 }}>↑ {stat.delta}</Typography>
                      </Stack>
                      <Typography sx={{ display: 'none' }}>vs last month</Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ height: 4, bgcolor: '#edf2f7', borderRadius: 5, mt: 2 }}>
                    <Box sx={{ height: '100%', width: '100%', bgcolor: stat.color, borderRadius: 5 }} />
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ ...cardSx, p: { xs: 1.4, md: 2.2 }, overflow: 'hidden' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={1.2} sx={{ mb: 2 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.12rem' }}>Recent Activity</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  select
                  size="small"
                  value={activityRangeDays}
                  onChange={(event) => {
                    setActivityRangeDays(Number(event.target.value));
                    setShowAllActivity(false);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayOutlined sx={{ color: '#526273', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    minWidth: 170,
                    '& .MuiSelect-select': { display: 'flex', alignItems: 'center', py: 1.05 },
                  }}
                >
                  {activityRangeOptions.map((days) => (
                    <MenuItem key={days} value={days}>Last {days} days</MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>
            {recentActivity.length === 0 ? (
              <Typography sx={{ color: '#637083', fontSize: 14 }}>No recent activity yet.</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 860 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1.35fr) minmax(130px, 0.65fr) minmax(170px, 0.8fr) minmax(140px, 0.7fr) 148px', px: 1.2, pb: 1.1, borderBottom: '1px solid rgba(18,60,105,0.12)' }}>
                    {['Activity', 'Details', 'Course / Location', 'Date & Time', ''].map((heading) => (
                      <Typography key={heading || 'actions'} sx={{ color: '#637083', fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>{heading}</Typography>
                    ))}
                  </Box>
                  {displayedActivity.map((item, index) => {
                    const meta = activityMeta[item.type] || activityMeta.course;
                    const Icon = meta.icon;
                    return (
                      <Box key={item.id || `${item.type}-${index}`} sx={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1.35fr) minmax(130px, 0.65fr) minmax(170px, 0.8fr) minmax(140px, 0.7fr) 148px', gap: 1.2, alignItems: 'center', px: 1.2, py: 1.15, borderBottom: index < displayedActivity.length - 1 ? '1px solid rgba(18,60,105,0.08)' : 'none' }}>
                        <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
                          <Box sx={{ width: 42, height: 42, borderRadius: 1.2, bgcolor: meta.bg, color: meta.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <Icon fontSize="small" />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={0.7} alignItems="center">
                              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: meta.dot, flexShrink: 0 }} />
                              <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 950, fontSize: 13.5 }}>{item.title}</Typography>
                            </Stack>
                            <Typography noWrap sx={{ color: '#526273', fontSize: 12.5 }}>
                              {item.detail}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={0.7} alignItems="center">
                          {item.detail_status === 'On time' ? <CheckCircleOutlined sx={{ color: '#15965f', fontSize: 17 }} /> : item.detail_status === 'Visible' ? <VisibilityOutlined sx={{ color: '#f05a28', fontSize: 17 }} /> : <InsertDriveFileOutlined sx={{ color: meta.color, fontSize: 17 }} />}
                          <Typography noWrap sx={{ color: '#526273', fontSize: 12.5 }}>{item.detail_status}</Typography>
                        </Stack>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography noWrap sx={{ color: 'primary.dark', fontSize: 12.5 }}>{item.course || 'Platform'}</Typography>
                          <Typography noWrap sx={{ color: '#637083', fontSize: 12 }}>{item.location || item.type}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ color: 'primary.dark', fontSize: 12.5 }}>{formatDateTime(item.created_at)}</Typography>
                        </Box>
                        <Button size="small" variant="text" endIcon={<ChevronRightOutlined />} onClick={() => setActivePane(item.pane || 'dashboard')} sx={{ justifySelf: 'end', whiteSpace: 'nowrap' }}>
                          {item.action_label || 'View'}
                        </Button>
                      </Box>
                    );
                  })}
                </Box>
                {recentActivity.length > 5 && (
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<AccessTimeOutlined sx={{ fontSize: 18 }} />}
                    endIcon={showAllActivity ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
                    onClick={() => setShowAllActivity((current) => !current)}
                    sx={{ mt: 1.2, color: '#0f63c7', fontWeight: 900 }}
                  >
                    {showAllActivity ? 'Show less activity' : `Show more activity${hiddenActivityCount ? ` (${hiddenActivityCount})` : ''}`}
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </>
      )}
    </Stack>
  );
}

function AdminPlaceholderPane({ item }) {
  const Icon = item.icon || HelpOutlineOutlined;

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <Box sx={{ width: 42, height: 42, borderRadius: 1.5, bgcolor: '#eef3f8', color: 'primary.dark', display: 'grid', placeItems: 'center' }}>
          <Icon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '1.85rem', md: '2.35rem' } }}>
            {item.label}
          </Typography>
          <Typography sx={{ color: '#637083' }}>
            This workspace will be built in the next LMS phase.
          </Typography>
        </Box>
      </Stack>
      <Box sx={{ mt: 3, border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2.5, bgcolor: '#fff' }}>
        <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 0.8 }}>Coming next</Typography>
        <Typography sx={{ color: '#637083' }}>
          We will connect this pane to the database, add forms and filters, then lock actions by role.
        </Typography>
      </Box>
    </Box>
  );
}

function AdminCohortsPane({ onAdminDataChanged, setActivePane, onAdminToast }) {
  const [cohorts, setCohorts] = React.useState([]);
  const [form, setForm] = React.useState({ name: '', starts_at: '', ends_at: '' });
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('newest');
  const [selectedCohortId, setSelectedCohortId] = React.useState(null);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [cohortMenuAnchor, setCohortMenuAnchor] = React.useState(null);
  const [menuCohort, setMenuCohort] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  useAdminPaneToast(message, setMessage, error, setError, onAdminToast);

  const loadCohorts = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/cohorts`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load cohorts');
      setCohorts(data);
      setSelectedCohortId((current) => current || data.find((cohort) => cohort.status === 'active')?.id || data[0]?.id || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCohorts();
  }, [loadCohorts]);

  const toDateInput = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toISOString().slice(0, 10);
  };

  const toTimestamp = (value) => (value ? Math.floor(new Date(`${value}T00:00:00`).getTime() / 1000) : null);
  const formatCohortDate = (timestamp) => timestamp ? formatTimestamp(timestamp, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set';
  const formatWeekday = (timestamp) => timestamp ? formatTimestamp(timestamp, { weekday: 'short' }) : '';
  const daysUntil = (timestamp) => timestamp ? Math.ceil((timestamp - Math.floor(Date.now() / 1000)) / (24 * 60 * 60)) : null;
  const durationLabel = (cohort) => {
    if (!cohort.starts_at || !cohort.ends_at) return 'Dates not set';
    const months = Math.max(1, Math.round((cohort.ends_at - cohort.starts_at) / (30 * 24 * 60 * 60)));
    return `${months} month${months === 1 ? '' : 's'}`;
  };

  const createCohort = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/cohorts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          starts_at: toTimestamp(form.starts_at),
          ends_at: toTimestamp(form.ends_at),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to create cohort');
      setForm({ name: '', starts_at: '', ends_at: '' });
      setCreateDialogOpen(false);
      setSelectedCohortId(data.id);
      setMessage('Cohort created.');
      await loadCohorts();
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const activateCohort = async (cohortId, cohortStatus = '') => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      if (cohortStatus === 'completed' && !window.confirm('Reactivate this completed cohort? Its alumni from this cohort will become active students again.')) {
        setSaving(false);
        return;
      }
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/cohorts/${cohortId}/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to activate cohort');
      setMessage(cohortStatus === 'completed' ? 'Cohort reactivated. Students were restored from alumni to active students.' : 'Cohort activated.');
      await loadCohorts();
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const completeActiveCohort = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/cohorts/active/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive_students_as_alumni: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to complete active cohort');
      setMessage('Active cohort completed. Approved students were moved to alumni.');
      await loadCohorts();
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteUpcomingCohort = async (cohort) => {
    if (!cohort || cohort.status !== 'upcoming') return;
    if (!window.confirm(`Delete upcoming cohort "${cohort.name}"? This cannot be undone.`)) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/cohorts/${cohort.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to delete cohort');
      setMessage('Upcoming cohort deleted.');
      setSelectedCohortId((current) => (current === cohort.id ? null : current));
      await loadCohorts();
      onAdminDataChanged?.();
      onAdminToast?.('Upcoming cohort deleted.', 'success');
    } catch (err) {
      setError(err.message);
      onAdminToast?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const activeCohort = cohorts.find((cohort) => cohort.status === 'active');
  const selectedCohort = cohorts.find((cohort) => cohort.id === selectedCohortId) || activeCohort || cohorts[0] || null;
  const alumniCount = cohorts.reduce((total, cohort) => total + (cohort.stats?.alumni || 0), 0);
  const stats = [
    { label: 'Total Cohorts', value: cohorts.length, detail: 'All sessions', icon: GroupOutlined, color: '#1b6ef3', bg: '#eaf2ff' },
    { label: 'Active Cohorts', value: cohorts.filter((cohort) => cohort.status === 'active').length, detail: 'Current sessions', icon: SchoolOutlined, color: '#16805f', bg: '#e8f7ef' },
    { label: 'Upcoming Cohorts', value: cohorts.filter((cohort) => cohort.status === 'upcoming').length, detail: 'Starting soon', icon: AccessTimeOutlined, color: '#f59e0b', bg: '#fff7e8' },
    { label: 'Completed Cohorts', value: cohorts.filter((cohort) => cohort.status === 'completed').length, detail: 'Archived sessions', icon: CheckCircleOutlined, color: '#1b6ef3', bg: '#eaf2ff' },
    { label: 'Alumni', value: alumniCount, detail: 'From completed cohorts', icon: PersonOutlineOutlined, color: '#7c3aed', bg: '#f4ecff' },
  ];

  const visibleCohorts = React.useMemo(() => cohorts
    .filter((cohort) => {
      const query = search.trim().toLowerCase();
      if (query && !cohort.name.toLowerCase().includes(query)) return false;
      if (statusFilter !== 'all' && cohort.status !== statusFilter) return false;
      if (typeFilter === 'current' && cohort.status !== 'active') return false;
      if (typeFilter === 'historical' && cohort.status !== 'completed') return false;
      return true;
    })
    .sort((first, second) => {
      if (sortBy === 'oldest') return (first.starts_at || first.created_at || 0) - (second.starts_at || second.created_at || 0);
      if (sortBy === 'students') return (second.stats?.students || 0) - (first.stats?.students || 0);
      if (sortBy === 'az') return first.name.localeCompare(second.name);
      return (second.starts_at || second.created_at || 0) - (first.starts_at || first.created_at || 0);
    }), [cohorts, search, statusFilter, typeFilter, sortBy]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter, sortBy]);

  React.useEffect(() => {
    if (!visibleCohorts.length) {
      setSelectedCohortId(null);
      return;
    }
    if (!selectedCohortId || !visibleCohorts.some((cohort) => cohort.id === selectedCohortId)) {
      setSelectedCohortId(visibleCohorts[0].id);
    }
  }, [visibleCohorts, selectedCohortId]);

  const rowsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(visibleCohorts.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * rowsPerPage;
  const paginatedCohorts = visibleCohorts.slice(pageStartIndex, pageStartIndex + rowsPerPage);

  const statusChipSx = (status) => ({
    bgcolor: status === 'active' ? '#e8f7ef' : status === 'completed' ? '#eef3f8' : '#eaf2ff',
    color: status === 'active' ? '#16805f' : status === 'completed' ? '#526273' : '#1b6ef3',
    fontWeight: 850,
  });

  const openCohortMenu = (event, cohort) => {
    event.stopPropagation();
    setMenuCohort(cohort);
    setCohortMenuAnchor(event.currentTarget);
  };

  const closeCohortMenu = () => {
    setMenuCohort(null);
    setCohortMenuAnchor(null);
  };

  const runCohortMenuAction = async (action) => {
    const cohort = menuCohort;
    closeCohortMenu();
    if (!cohort) return;
    if (action === 'view') {
      setSelectedCohortId(cohort.id);
      return;
    }
    if (action === 'activate') {
      await activateCohort(cohort.id, cohort.status);
      return;
    }
    if (action === 'complete') {
      await completeActiveCohort();
      return;
    }
    if (action === 'students') {
      setActivePane?.('students');
      return;
    }
    if (action === 'export') exportCohorts();
    if (action === 'export-students') exportCohortStudents(cohort.id, cohort.name);
    if (action === 'delete') deleteUpcomingCohort(cohort);
  };

  const exportCohorts = () => {
    const rows = [
      ['Cohort', 'Status', 'Students', 'Enrollments', 'Requests', 'Start Date', 'End Date'],
      ...visibleCohorts.map((cohort) => [
        cohort.name,
        cohort.status,
        cohort.stats?.students || 0,
        cohort.stats?.enrollments || 0,
        cohort.stats?.requests || 0,
        formatCohortDate(cohort.starts_at),
        formatCohortDate(cohort.ends_at),
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'three13-cohorts.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const exportCohortStudents = async (cohortId, cohortName = 'cohort') => {
    try {
      setError('');
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/cohorts/${cohortId}/students.csv`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) {
        if (response.status === 404) {
          const studentsResponse = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/students`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          const studentsData = await studentsResponse.json();
          if (!studentsResponse.ok) throw new Error(studentsData.detail || 'Unable to export cohort students');
          const cohortStudents = studentsData.filter((student) => {
            const lifecycle = student.lifecycle_status || 'active_student';
            return (
              (lifecycle === 'alumni' && Number(student.alumni_cohort_id) === Number(cohortId))
              || (student.enrolled_courses || []).some((course) => Number(course.cohort_id) === Number(cohortId))
              || (student.enrollment_requests || []).some((request) => Number(request.cohort_id) === Number(cohortId))
            );
          });
          const rows = [
            ['Student ID', 'Full Name', 'Email', 'Phone', 'Role', 'Account Status', 'Lifecycle', 'Cohort', 'Approved Courses', 'Enrollment Requests'],
            ...cohortStudents.map((student) => [
              learnerDisplayId(student),
              student.full_name,
              student.email,
              student.phone || '',
              (student.lifecycle_status || 'active_student') === 'alumni' ? 'Alumni' : 'Student',
              student.is_active ? 'Active' : 'Pending/Suspended',
              student.lifecycle_status || 'active_student',
              cohortName,
              (student.enrolled_courses || []).filter((course) => Number(course.cohort_id) === Number(cohortId)).map((course) => course.title).join('; '),
              (student.enrollment_requests || []).filter((request) => Number(request.cohort_id) === Number(cohortId)).map((request) => `${request.course_title} (${request.status})`).join('; '),
            ]),
          ];
          const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
          const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
          const link = document.createElement('a');
          link.href = url;
          link.download = `three13-${cohortName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-students.csv`;
          link.click();
          window.URL.revokeObjectURL(url);
          setMessage('Cohort student CSV downloaded.');
          onAdminToast?.('Cohort student CSV downloaded.', 'success');
          return;
        }
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || 'Unable to export cohort students');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `three13-${cohortName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-students.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      setMessage('Cohort student CSV downloaded.');
      onAdminToast?.('Cohort student CSV downloaded.', 'success');
    } catch (err) {
      setError(err.message);
      onAdminToast?.(err.message, 'error');
    }
  };

  return (
    <Stack spacing={2.4}>
      <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={1.5}>
        <Box>
          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.45rem' }, mb: 0.5 }}>
            Cohorts
          </Typography>
          <Typography sx={{ color: '#637083' }}>Create sessions, end the current cohort, and keep alumni records separate from current students.</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' }, rowGap: 1 }}>
          <Button variant="outlined" disabled={saving || !activeCohort} onClick={completeActiveCohort}>Complete active cohort</Button>
          <Button variant="contained" color="secondary" startIcon={<AddOutlined />} onClick={() => setCreateDialogOpen(true)}>Create New Cohort</Button>
        </Stack>
      </Stack>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, minmax(0, 1fr))' }, gap: { xs: 1.5, lg: 1.1, xl: 1.5 } }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Box key={stat.label} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.8, boxShadow: '0 14px 36px rgba(18,60,105,0.06)' }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ width: 50, height: 50, borderRadius: 1.4, bgcolor: stat.bg, color: stat.color, display: 'grid', placeItems: 'center' }}><Icon /></Box>
                <Box>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.55rem', lineHeight: 1 }}>{stat.value}</Typography>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 13 }}>{stat.label}</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 11.5 }}>{stat.detail}</Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.4, bgcolor: '#fff' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.4fr 160px 150px 170px auto' }, gap: 1.2, alignItems: 'center' }}>
          <TextField label="Search cohorts" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search cohorts..." InputProps={{ endAdornment: <InputAdornment position="end"><SearchOutlined fontSize="small" /></InputAdornment> }} />
          <TextField select label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="upcoming">Upcoming</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
          <TextField select label="Type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <MenuItem value="all">All types</MenuItem>
            <MenuItem value="current">Current</MenuItem>
            <MenuItem value="historical">Historical</MenuItem>
          </TextField>
          <TextField select label="Sort by" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <MenuItem value="newest">Newest first</MenuItem>
            <MenuItem value="oldest">Oldest first</MenuItem>
            <MenuItem value="students">Most students</MenuItem>
            <MenuItem value="az">A-Z</MenuItem>
          </TextField>
          <IconButton onClick={loadCohorts} sx={{ border: '1px solid rgba(18,60,105,0.16)', borderRadius: 1, width: 46, height: 46 }}>
            <FilterAltOffOutlined />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 280px', xl: 'minmax(0, 1fr) 310px' }, gap: { xs: 2, lg: 1.4, xl: 2 }, alignItems: 'start' }}>
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, overflow: 'hidden', boxShadow: '0 18px 48px rgba(18,60,105,0.06)', minWidth: 0, maxWidth: '100%' }}>
          <Box sx={{ display: { xs: 'none', lg: 'grid' }, gridTemplateColumns: 'minmax(220px, 1fr) 96px 90px 172px 92px', gap: 1, px: 1.2, py: 1.2, bgcolor: 'primary.dark' }}>
            {['Cohort', 'Status', 'Students', 'Dates', 'Actions'].map((label) => (
              <Typography key={label} sx={{ color: '#fff', fontWeight: 850, fontSize: 12, textAlign: label === 'Actions' ? 'center' : 'left' }}>{label}</Typography>
            ))}
          </Box>
          {loading ? (
            <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
          ) : visibleCohorts.length === 0 ? (
            <Box sx={{ p: 2.5 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>No cohorts match this view.</Typography>
            </Box>
          ) : (
            <Stack divider={<Divider />}>
              {paginatedCohorts.map((cohort, index) => {
                const isSelected = selectedCohort?.id === cohort.id;
                const iconColors = [
                  ['#f4ecff', '#7c3aed'],
                  ['#fff0e7', '#f05a28'],
                  ['#eaf2ff', '#1b6ef3'],
                  ['#e8f7ef', '#16805f'],
                ][index % 4];
                return (
                  <Box
                    key={cohort.id}
                    onClick={() => setSelectedCohortId(cohort.id)}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', lg: 'minmax(190px, 1fr) 86px 74px 150px 76px', xl: 'minmax(220px, 1fr) 96px 90px 172px 92px' },
                      gap: 1,
                      alignItems: 'center',
                      px: 1.2,
                      py: 1.5,
                      bgcolor: isSelected ? '#f6fbff' : '#fff',
                      borderLeft: isSelected ? '3px solid #1b6ef3' : '3px solid transparent',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f8fafc' },
                    }}
                  >
                    <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box sx={{ width: 46, height: 46, borderRadius: 1.4, bgcolor: iconColors[0], color: iconColors[1], display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <CalendarTodayOutlined />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={0.7} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                          <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 950 }}>{cohort.name}</Typography>
                          {cohort.id === activeCohort?.id && <Chip label="Current" size="small" sx={{ bgcolor: '#f4ecff', color: '#7c3aed', fontWeight: 800 }} />}
                        </Stack>
                      </Box>
                    </Stack>
                    <Chip label={cohort.status} size="small" sx={{ ...statusChipSx(cohort.status), width: 'fit-content', textTransform: 'capitalize' }} />
                    <Box>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{cohort.stats?.students || 0}</Typography>
                      <Typography sx={{ color: '#637083', fontSize: 11.5 }}>{cohort.status === 'completed' ? 'learners' : 'students'}</Typography>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ color: 'primary.dark', fontSize: 12.5 }}>
                        {formatCohortDate(cohort.starts_at)} - {formatCohortDate(cohort.ends_at)}
                      </Typography>
                      <Typography sx={{ color: '#637083', fontSize: 11.5 }}>
                        {formatWeekday(cohort.starts_at)} to {formatWeekday(cohort.ends_at)}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.6} justifyContent={{ xs: 'flex-start', lg: 'center' }} alignItems="center" sx={{ minWidth: { lg: 84 } }}>
                      <IconButton size="small" aria-label="View cohort" onClick={(event) => { event.stopPropagation(); setSelectedCohortId(cohort.id); }} sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}>
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                      <IconButton size="small" disabled={saving} onClick={(event) => openCohortMenu(event, cohort)} sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}>
                        <MoreHorizOutlined fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.2} sx={{ px: 1.5, py: 1.4, borderTop: '1px solid rgba(18,60,105,0.1)' }}>
            <Typography sx={{ color: '#526273', fontSize: 12.5 }}>
              Showing {visibleCohorts.length ? pageStartIndex + 1 : 0}-{Math.min(pageStartIndex + rowsPerPage, visibleCohorts.length)} of {visibleCohorts.length} cohort{visibleCohorts.length === 1 ? '' : 's'}
            </Typography>
            <Stack direction="row" spacing={0.7}>
              {Array.from({ length: totalPages }, (_item, index) => index + 1).map((page) => (
                <Button key={page} variant={page === safeCurrentPage ? 'contained' : 'outlined'} size="small" onClick={() => setCurrentPage(page)} sx={{ minWidth: 36 }}>{page}</Button>
              ))}
            </Stack>
          </Stack>
        </Box>

        <Menu
          anchorEl={cohortMenuAnchor}
          open={Boolean(cohortMenuAnchor)}
          onClose={closeCohortMenu}
          PaperProps={{ sx: { minWidth: 220, borderRadius: 1.5, boxShadow: '0 18px 44px rgba(18,60,105,0.18)' } }}
        >
          <MenuItem onClick={() => runCohortMenuAction('view')}>
            <Stack direction="row" spacing={1} alignItems="center">
              <VisibilityOutlined fontSize="small" />
              <Typography sx={{ fontWeight: 800, fontSize: 13 }}>View cohort</Typography>
            </Stack>
          </MenuItem>
          {menuCohort?.status !== 'active' && (
            <MenuItem
              disabled={Boolean(activeCohort && activeCohort.id !== menuCohort?.id)}
              onClick={() => runCohortMenuAction('activate')}
            >
              <Stack spacing={0.2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircleOutlined fontSize="small" />
                  <Typography sx={{ fontWeight: 800, fontSize: 13 }}>{menuCohort?.status === 'completed' ? 'Reactivate cohort' : 'Activate cohort'}</Typography>
                </Stack>
                {activeCohort && activeCohort.id !== menuCohort?.id && (
                  <Typography sx={{ color: '#637083', fontSize: 11, pl: 3.6 }}>Complete current active cohort first</Typography>
                )}
              </Stack>
            </MenuItem>
          )}
          {menuCohort?.status === 'active' && (
            <MenuItem onClick={() => runCohortMenuAction('complete')}>
              <Stack direction="row" spacing={1} alignItems="center">
                <SchoolOutlined fontSize="small" />
                <Typography sx={{ fontWeight: 800, fontSize: 13 }}>Complete cohort</Typography>
              </Stack>
            </MenuItem>
          )}
          <MenuItem onClick={() => runCohortMenuAction('students')}>
            <Stack direction="row" spacing={1} alignItems="center">
              <GroupOutlined fontSize="small" />
              <Typography sx={{ fontWeight: 800, fontSize: 13 }}>Manage students</Typography>
            </Stack>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => runCohortMenuAction('export')}>
            <Stack direction="row" spacing={1} alignItems="center">
              <ArticleOutlined fontSize="small" />
              <Typography sx={{ fontWeight: 800, fontSize: 13 }}>Export cohort list</Typography>
            </Stack>
          </MenuItem>
          <MenuItem onClick={() => runCohortMenuAction('export-students')}>
            <Stack direction="row" spacing={1} alignItems="center">
              <DownloadOutlined fontSize="small" />
              <Typography sx={{ fontWeight: 800, fontSize: 13 }}>Export students CSV</Typography>
            </Stack>
          </MenuItem>
          {menuCohort?.status === 'upcoming' && (
            <MenuItem onClick={() => runCohortMenuAction('delete')}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: '#dc2626' }}>
                <DeleteOutlined fontSize="small" />
                <Typography sx={{ fontWeight: 800, fontSize: 13 }}>Delete cohort</Typography>
              </Stack>
            </MenuItem>
          )}
        </Menu>

        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 2, lg: 1.4, xl: 2 }, position: { lg: 'sticky' }, top: 92, boxShadow: '0 18px 48px rgba(18,60,105,0.06)', minWidth: 0 }}>
          {!selectedCohort ? (
            <Typography sx={{ color: '#526273' }}>Select a cohort to view details.</Typography>
          ) : (
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.1rem' }}>{selectedCohort.name}</Typography>
                <Chip label={selectedCohort.status} size="small" sx={{ ...statusChipSx(selectedCohort.status), textTransform: 'capitalize' }} />
              </Stack>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarTodayOutlined sx={{ color: '#526273', fontSize: 20 }} />
                  <Box>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 13 }}>{formatCohortDate(selectedCohort.starts_at)} - {formatCohortDate(selectedCohort.ends_at)}</Typography>
                    <Typography sx={{ color: '#637083', fontSize: 12 }}>{durationLabel(selectedCohort)}</Typography>
                  </Box>
                </Stack>
              </Stack>
              <Divider />
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1 }}>Overview</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    component="img"
                    src="/images/spin.png"
                    alt="Cohort overview"
                    sx={{ width: 104, height: 104, objectFit: 'contain', flexShrink: 0 }}
                  />
                  <Stack spacing={0.8}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{selectedCohort.stats?.students || 0} <Box component="span" sx={{ color: '#637083', fontWeight: 500, fontSize: 12 }}>Learners</Box></Typography>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{selectedCohort.stats?.alumni || 0} <Box component="span" sx={{ color: '#637083', fontWeight: 500, fontSize: 12 }}>Alumni</Box></Typography>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{selectedCohort.stats?.enrollments || 0} <Box component="span" sx={{ color: '#637083', fontWeight: 500, fontSize: 12 }}>Enrollments</Box></Typography>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{selectedCohort.stats?.requests || 0} <Box component="span" sx={{ color: '#637083', fontWeight: 500, fontSize: 12 }}>Requests</Box></Typography>
                  </Stack>
                </Stack>
              </Box>
              <Button variant="outlined" endIcon={<ChevronRightOutlined />}>View Cohort Details</Button>
              <Divider />
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1 }}>Quick Actions</Typography>
                <Stack spacing={0.8}>
                  {[
                    ['Manage Students', GroupOutlined, 'students'],
                    ['View Enrollments', SchoolOutlined, 'students'],
                    ['Send Announcement', CampaignOutlined, 'announcements'],
                    ['Export Students CSV', DownloadOutlined, 'export-students'],
                  ].map(([label, Icon, pane]) => (
                    <Button key={label} variant="text" onClick={() => (pane === 'export-students' ? exportCohortStudents(selectedCohort.id, selectedCohort.name) : setActivePane?.(pane))} endIcon={<ChevronRightOutlined />} sx={{ justifyContent: 'space-between', color: 'primary.dark', bgcolor: '#f8fafc', py: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 26, height: 26, borderRadius: 1, bgcolor: '#eaf2ff', color: '#1b6ef3', display: 'grid', placeItems: 'center' }}><Icon sx={{ fontSize: 16 }} /></Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 13 }}>{label}</Typography>
                      </Stack>
                    </Button>
                  ))}
                </Stack>
              </Box>
              {['upcoming', 'completed'].includes(selectedCohort.status) && (
                <Button variant="contained" color="secondary" disabled={saving || Boolean(activeCohort && activeCohort.id !== selectedCohort.id)} onClick={() => activateCohort(selectedCohort.id, selectedCohort.status)}>
                  {selectedCohort.status === 'completed' ? 'Reactivate cohort' : 'Activate cohort'}
                </Button>
              )}
            </Stack>
          )}
        </Box>
      </Box>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Create New Cohort</DialogTitle>
        <DialogContent>
          <Box component="form" id="admin-create-cohort-form" onSubmit={createCohort} sx={{ pt: 1 }}>
            <Stack spacing={1.4}>
              <TextField label="Cohort name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="June-Sep 2026 Cohort" required fullWidth />
              <TextField type="date" label="Start date" value={form.starts_at} onChange={(event) => setForm((current) => ({ ...current, starts_at: event.target.value }))} InputLabelProps={{ shrink: true }} />
              <TextField type="date" label="End date" value={form.ends_at} onChange={(event) => setForm((current) => ({ ...current, ends_at: event.target.value }))} InputLabelProps={{ shrink: true }} />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setCreateDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button type="submit" form="admin-create-cohort-form" variant="contained" color="secondary" disabled={saving || !form.name.trim()}>
            {saving ? 'Creating...' : 'Create cohort'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function AdminStudentsPane({ onAdminDataChanged, onOpenActivityLink, onAdminToast }) {
  const [students, setStudents] = React.useState([]);
  const [courses, setCourses] = React.useState([]);
  const [cohorts, setCohorts] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [courseFilter, setCourseFilter] = React.useState('all');
  const [cohortFilter, setCohortFilter] = React.useState('all');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('az');
  const [selectedStudentId, setSelectedStudentId] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [courseActivity, setCourseActivity] = React.useState({});
  const [activityDialogKey, setActivityDialogKey] = React.useState('');
  const [activityLoadingKey, setActivityLoadingKey] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [certificateFiles, setCertificateFiles] = React.useState({});
  const [certificateUploadingKey, setCertificateUploadingKey] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  useAdminPaneToast(message, setMessage, error, setError, onAdminToast);
  const [alumniForm, setAlumniForm] = React.useState({ full_name: '', email: '', phone: '', cohort_id: '' });
  const [alumniSetup, setAlumniSetup] = React.useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false);

  const loadStudents = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      params.set('status', statusFilter);
      const [studentsResponse, coursesResponse, cohortsResponse] = await Promise.all([
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/students?${params.toString()}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/courses`),
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/cohorts`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
      ]);
      const studentsData = await studentsResponse.json();
      const coursesData = await coursesResponse.json();
      const cohortsData = await cohortsResponse.json();
      if (!studentsResponse.ok) throw new Error(studentsData.detail || 'Unable to load students');
      if (!coursesResponse.ok) throw new Error(coursesData.detail || 'Unable to load courses');
      if (!cohortsResponse.ok) throw new Error(cohortsData.detail || 'Unable to load cohorts');
      setStudents(studentsData);
      setCourses(coursesData);
      setCohorts(cohortsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  React.useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const updateStudentInList = (updatedStudent) => {
    setStudents((current) => current.map((student) => (student.id === updatedStudent.id ? updatedStudent : student)));
  };

  const removeStudentFromList = (studentId) => {
    setStudents((current) => current.filter((student) => student.id !== studentId));
    setSelectedStudentId((current) => (current === studentId ? null : current));
  };

  const upsertStudentInList = (updatedStudent) => {
    setStudents((current) => {
      const exists = current.some((student) => student.id === updatedStudent.id);
      const next = exists
        ? current.map((student) => (student.id === updatedStudent.id ? updatedStudent : student))
        : [...current, updatedStudent];
      return next.sort((first, second) => first.full_name.localeCompare(second.full_name));
    });
  };

  const updateAlumniForm = (field, value) => {
    setAlumniForm((current) => ({ ...current, [field]: value }));
  };

  const getLatestEnrollmentTime = (student) => {
    const timestamps = student.enrolled_courses.map((course) => course.approved_at || 0);
    return timestamps.length ? Math.max(...timestamps) : 0;
  };
  const cohortOptions = React.useMemo(() => {
    const order = { active: 0, upcoming: 1, completed: 2, archived: 3 };
    return [
      { id: 'all', name: 'All cohorts', status: '' },
      ...cohorts
        .slice()
        .sort((first, second) => {
          const statusRank = (order[first.status] ?? 9) - (order[second.status] ?? 9);
          if (statusRank !== 0) return statusRank;
          return (second.starts_at || second.created_at || 0) - (first.starts_at || first.created_at || 0);
        }),
    ];
  }, [cohorts]);
  const selectedCohortOption = cohortOptions.find((cohort) => String(cohort.id) === String(cohortFilter)) || cohortOptions[0];

  const visibleStudents = React.useMemo(() => {
    return students
      .filter((student) => {
        const lifecycle = student.lifecycle_status || 'active_student';
        if (roleFilter === 'student' && lifecycle === 'alumni') return false;
        if (roleFilter === 'alumni' && lifecycle !== 'alumni') return false;
        if (cohortFilter !== 'all') {
          const cohortId = Number(cohortFilter);
          const matchesAlumniCohort = lifecycle === 'alumni' && student.alumni_cohort_id === cohortId;
          const matchesEnrollmentCohort = student.enrolled_courses.some((course) => course.cohort_id === cohortId);
          const matchesRequestCohort = (student.enrollment_requests || []).some((request) => request.cohort_id === cohortId);
          if (!matchesAlumniCohort && !matchesEnrollmentCohort && !matchesRequestCohort) return false;
        }
        if (courseFilter === 'all') return true;
        return student.enrolled_courses.some((course) => course.id === Number(courseFilter));
      })
      .sort((first, second) => {
        if (sortBy === 'newest') return (second.created_at || 0) - (first.created_at || 0);
        if (sortBy === 'oldest') return (first.created_at || 0) - (second.created_at || 0);
        if (sortBy === 'enroll-time') return getLatestEnrollmentTime(second) - getLatestEnrollmentTime(first);
        if (sortBy === 'za') return second.full_name.localeCompare(first.full_name);
        return first.full_name.localeCompare(second.full_name);
      });
  }, [students, courseFilter, cohortFilter, roleFilter, sortBy]);

  React.useEffect(() => {
    if (!visibleStudents.length) {
      setSelectedStudentId(null);
      return;
    }
    if (!selectedStudentId || !visibleStudents.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId(visibleStudents[0].id);
    }
  }, [visibleStudents, selectedStudentId]);

  const selectedStudent = visibleStudents.find((student) => student.id === selectedStudentId) || visibleStudents[0] || null;
  const rowsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(visibleStudents.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * rowsPerPage;
  const paginatedStudents = visibleStudents.slice(pageStartIndex, pageStartIndex + rowsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, courseFilter, cohortFilter, roleFilter, sortBy]);

  React.useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const learnerStats = React.useMemo(() => {
    const activeStudents = students.filter((student) => (student.lifecycle_status || 'active_student') !== 'alumni');
    const alumni = students.filter((student) => (student.lifecycle_status || 'active_student') === 'alumni');
    return [
      { label: 'Current Students', value: activeStudents.length, detail: 'Active cohort learners', icon: GroupOutlined, color: '#1b6ef3', bg: '#eaf2ff' },
      { label: 'Alumni', value: alumni.length, detail: 'Community members', icon: SchoolOutlined, color: '#7c3aed', bg: '#f4ecff' },
      { label: 'Pending Accounts', value: students.filter((student) => !student.is_active).length, detail: 'Awaiting activation', icon: AccessTimeOutlined, color: '#f59e0b', bg: '#fff7e8' },
      { label: 'Active Accounts', value: students.filter((student) => student.is_active).length, detail: 'Can sign in now', icon: CheckCircleOutlined, color: '#16805f', bg: '#e8f7ef' },
      { label: 'Total Courses', value: courses.length, detail: 'Course catalog', icon: MenuBookOutlined, color: '#1b6ef3', bg: '#eaf2ff' },
    ];
  }, [students, courses]);

  const learnerRoleLabel = (student) => ((student.lifecycle_status || 'active_student') === 'alumni' ? 'Alumni' : 'Student');
  const learnerStatusLabel = (student) => (student.is_active ? 'Active' : 'Inactive');
  const selectedIsAlumni = selectedStudent && (selectedStudent.lifecycle_status || 'active_student') === 'alumni';

  const updateStudentStatus = async (studentId, isActive) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/students/${studentId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: isActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update student account');
      updateStudentInList(data);
      onAdminDataChanged?.();
      setMessage(isActive ? 'Student account approved/activated.' : 'Student account marked inactive.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const createAlumni = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    setAlumniSetup(null);
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/alumni`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alumniForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to add alumni');
      upsertStudentInList(data.student);
      setSelectedStudentId(data.student.id);
      setSearch('');
      setStatusFilter('all');
      setCourseFilter('all');
      setCohortFilter('all');
      setRoleFilter('all');
      setSortBy('az');
      setAlumniForm({ full_name: '', email: '', phone: '', cohort_id: '' });
      setAlumniSetup(data.email_sent ? null : data);
      setInviteDialogOpen(false);
      onAdminDataChanged?.();
      setMessage(data.email_sent ? 'Alumni account saved and setup email sent.' : 'Alumni account saved. Email was not delivered, so use the development setup link below.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const loadStudentCourseActivity = async (studentId, courseId) => {
    const key = `${studentId}-${courseId}`;
    if (courseActivity[key]) {
      setActivityDialogKey(key);
      return;
    }

    setActivityLoadingKey(key);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/students/${studentId}/courses/${courseId}/activity`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load course activity');
      setCourseActivity((current) => ({ ...current, [key]: { data } }));
      setActivityDialogKey(key);
    } catch (err) {
      setError(err.message);
    } finally {
      setActivityLoadingKey('');
    }
  };

  const uploadCertificate = async (studentId, courseId) => {
    const key = `${studentId}-${courseId}`;
    const file = certificateFiles[key];
    if (!file) {
      setError('Choose a certificate file before uploading.');
      return;
    }
    setCertificateUploadingKey(key);
    setError('');
    setMessage('');
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/students/${studentId}/courses/${courseId}/certificate/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to upload certificate');
      setCertificateFiles((current) => ({ ...current, [key]: null }));
      setMessage(`Certificate uploaded for ${data.student.full_name} in ${data.course.title}.`);
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setCertificateUploadingKey('');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not set';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const exportLearners = async () => {
    if (cohortFilter !== 'all') {
      const selectedCohort = cohorts.find((cohort) => String(cohort.id) === String(cohortFilter));
      try {
        setError('');
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/cohorts/${cohortFilter}/students.csv`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.detail || 'Unable to export cohort students');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `three13-${(selectedCohort?.name || 'cohort').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-students.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        setMessage('Cohort student CSV downloaded.');
        onAdminToast?.('Cohort student CSV downloaded.', 'success');
      } catch (err) {
        setError(err.message);
        onAdminToast?.(err.message, 'error');
      }
      return;
    }
    const rows = [
      ['Learner ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Enrolled Courses'],
      ...visibleStudents.map((student) => [
        learnerDisplayId(student),
        student.full_name,
        student.email,
        student.phone || '',
        learnerRoleLabel(student),
        learnerStatusLabel(student),
        formatDate(student.created_at),
        student.enrolled_courses.map((course) => course.title).join('; '),
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'three13-learners.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const renderActivityPanel = (activity) => {
    const data = activity.data;
    const openActivityLink = (pane) => {
      setActivityDialogKey('');
      onOpenActivityLink?.(pane, {
        courseId: data.course.id,
        studentId: data.student.id,
        courseTitle: data.course.title,
        studentName: data.student.full_name,
      });
    };
    const submittedCount = data.assignments.filter((assignment) => assignment.submission).length;
    const completedMaterials = data.materials.filter((material) => material.viewed_at).length;
    const totalMinutes = [
      ...data.materials.map((material) => material.estimated_minutes || 0),
      ...data.assignments.map((assignment) => assignment.estimated_minutes || 0),
    ].reduce((total, minutes) => total + minutes, 0);
    const timeLabel = `${Math.floor(totalMinutes / 60) ? `${Math.floor(totalMinutes / 60)}h ` : ''}${totalMinutes % 60}m`;
    const summaryCards = [
      { label: 'Materials', value: data.materials.length, detail: `${completedMaterials} completed`, icon: MenuBookOutlined, color: '#1b6ef3', bg: '#eaf2ff', progress: data.materials.length ? (completedMaterials / data.materials.length) * 100 : 0 },
      { label: 'Assignments', value: data.assignments.length, detail: `${submittedCount} submitted`, icon: AssignmentOutlined, color: '#16805f', bg: '#e8f7ef', progress: data.assignments.length ? (submittedCount / data.assignments.length) * 100 : 0 },
      { label: 'Submitted', value: submittedCount, detail: '', icon: SendOutlined, color: '#7c3aed', bg: '#f4ecff', progress: data.assignments.length ? (submittedCount / data.assignments.length) * 100 : 0 },
      { label: 'Time Spent', value: timeLabel, detail: 'Total in this course', icon: AccessTimeOutlined, color: '#f05a28', bg: '#fff0e7', progress: 0 },
    ];

    return (
      <Stack spacing={2}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 1.4 }}>
          {summaryCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Box key={stat.label} sx={{ bgcolor: '#fff', border: `1px solid ${stat.color}22`, borderRadius: 1.5, p: 1.7, minHeight: 118 }}>
                <Stack direction="row" spacing={1.3} alignItems="center">
                  <Box sx={{ width: 50, height: 50, borderRadius: 1.6, bgcolor: stat.bg, color: stat.color, display: 'grid', placeItems: 'center' }}><Icon /></Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.5rem', lineHeight: 1 }}>{stat.value}</Typography>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 12.5 }}>{stat.label}</Typography>
                    {stat.detail && <Typography sx={{ color: '#526273', fontSize: 12, mt: 0.7 }}>{stat.detail}</Typography>}
                    {stat.label !== 'Time Spent' && <Box sx={{ mt: 1, height: 4, bgcolor: '#edf2f7', borderRadius: 999 }}><Box sx={{ height: 1, width: `${stat.progress}%`, bgcolor: stat.color, borderRadius: 999 }} /></Box>}
                  </Box>
                </Stack>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.05rem' }}>Assignments</Typography>
            <Button size="small" variant="text" onClick={() => openActivityLink('assignments')} sx={{ color: '#0b67c2' }} endIcon={<ChevronRightOutlined />}>View all assignments</Button>
          </Stack>
          <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: 'minmax(280px, 1fr) 170px 170px', gap: 1, px: 1.2, pb: 0.8 }}>
            {['Assignment', 'Due Date', 'Status'].map((label) => <Typography key={label} sx={{ color: '#526273', fontSize: 12 }}>{label}</Typography>)}
          </Box>
          <Stack spacing={0.7}>
            {data.assignments.length === 0 ? (
              <Typography sx={{ color: '#637083', fontSize: 13, p: 1 }}>No assignments for this course yet.</Typography>
            ) : data.assignments.slice(0, 5).map((assignment, index) => {
              const statusLabel = assignment.submission ? (assignment.submission.status === 'late' ? 'Submitted late' : 'Submitted') : 'Not submitted';
              const statusColor = assignment.submission ? (assignment.submission.status === 'late' ? '#dc2626' : '#16805f') : '#526273';
              const statusBg = assignment.submission ? (assignment.submission.status === 'late' ? '#fee2e2' : '#e8f7ef') : '#eef3f8';
              return (
                <Box key={assignment.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 1fr) 170px 170px' }, gap: 1, alignItems: 'center', p: 1.2, border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1.2, bgcolor: index % 2 ? '#fbfdff' : '#fff' }}>
                  <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box sx={{ width: 42, height: 42, borderRadius: 1.2, bgcolor: ['#f4ecff', '#eaf2ff', '#e8f7ef'][index % 3], color: ['#7c3aed', '#1b6ef3', '#16805f'][index % 3], display: 'grid', placeItems: 'center', flexShrink: 0 }}><ArticleOutlined fontSize="small" /></Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13.5 }}>{assignment.title}</Typography>
                      <Typography noWrap sx={{ color: '#526273', fontSize: 12 }}>{assignment.instructions || 'No description provided'}</Typography>
                    </Box>
                  </Stack>
                  <Typography sx={{ color: 'primary.dark', fontSize: 12.5 }}>{formatDate(assignment.due_at)}</Typography>
                  <Chip label={statusLabel} size="small" sx={{ bgcolor: statusBg, color: statusColor, fontWeight: 750, width: 'fit-content' }} />
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1.4 }}>
          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Recent Materials</Typography>
              <Button size="small" variant="text" onClick={() => openActivityLink('materials')} sx={{ color: '#0b67c2' }}>View all materials</Button>
            </Stack>
            <Stack divider={<Divider />}>
              {data.materials.slice(0, 4).map((material, index) => (
                <Stack key={material.id} direction="row" spacing={1.1} alignItems="center" sx={{ py: 1 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: ['#f4ecff', '#eaf2ff', '#fff0e7', '#e8f7ef'][index % 4], color: ['#7c3aed', '#1b6ef3', '#f05a28', '#16805f'][index % 4], display: 'grid', placeItems: 'center' }}><InsertDriveFileOutlined fontSize="small" /></Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 13 }}>{material.title}</Typography>
                    <Typography sx={{ color: '#526273', fontSize: 12 }}>{material.material_type} | {material.estimated_minutes || 0} min</Typography>
                  </Box>
                  <Chip label={material.viewed_at ? 'Completed' : 'Not started'} size="small" sx={{ bgcolor: material.viewed_at ? '#e8f7ef' : '#eef3f8', color: material.viewed_at ? '#16805f' : '#526273', fontWeight: 750 }} />
                  <MoreHorizOutlined sx={{ color: '#526273', fontSize: 20 }} />
                </Stack>
              ))}
              {data.materials.length === 0 && <Typography sx={{ color: '#637083', fontSize: 13, py: 1 }}>No materials posted yet.</Typography>}
            </Stack>
          </Box>

          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Announcements</Typography>
              <Button size="small" variant="text" onClick={() => openActivityLink('announcements')} sx={{ color: '#0b67c2' }}>View all announcements</Button>
            </Stack>
            <Stack divider={<Divider />}>
              {data.announcements.slice(0, 4).map((announcement, index) => (
                <Stack key={announcement.id} direction="row" spacing={1.1} alignItems="center" sx={{ py: 1 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: index % 2 ? '#fff0e7' : '#eaf2ff', color: index % 2 ? '#f05a28' : '#1b6ef3', display: 'grid', placeItems: 'center' }}><CampaignOutlined fontSize="small" /></Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 13 }}>{announcement.title}</Typography>
                    <Typography sx={{ color: '#526273', fontSize: 12 }}>{announcement.audience === 'platform' ? 'Platform Announcement' : 'Course Announcement'} | {formatDate(announcement.created_at)}</Typography>
                  </Box>
                  {!announcement.read_at && <Chip label="New" size="small" sx={{ bgcolor: '#eaf2ff', color: '#1b6ef3', fontWeight: 800 }} />}
                </Stack>
              ))}
              {data.announcements.length === 0 && <Typography sx={{ color: '#637083', fontSize: 13, py: 1 }}>No announcements yet.</Typography>}
            </Stack>
          </Box>
        </Box>
      </Stack>
    );
  };

  const deletePendingStudentAccount = async (student) => {
    if (!student || student.is_active || (student.lifecycle_status || 'active_student') === 'alumni') return;
    const confirmed = window.confirm(`Delete pending account for ${student.full_name}? This removes the account and pending course requests.`);
    if (!confirmed) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/students/${student.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to delete pending account');
      removeStudentFromList(student.id);
      onAdminDataChanged?.();
      setMessage(data.message || 'Pending student account deleted.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const activityDialog = activityDialogKey ? courseActivity[activityDialogKey] : null;
  const activityDialogData = activityDialog?.data;

  return (
    <Stack spacing={2.4}>
      <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={1.5}>
        <Box>
          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.35rem' }, mb: 0.8 }}>
            Students & Alumni
          </Typography>
          <Typography sx={{ color: '#637083' }}>
            View active learners, import alumni, monitor enrolled courses, and manage account access.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="primary" startIcon={<GroupOutlined />} onClick={() => setInviteDialogOpen(true)} sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: '#061c31' } }}>
            Invite Alumni
          </Button>
          <Button variant="outlined" onClick={exportLearners} startIcon={<DownloadOutlined />}>Export</Button>
        </Stack>
      </Stack>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(5, minmax(0, 1fr))' }, gap: { xs: 1.5, lg: 1.1, xl: 1.5 } }}>
        {learnerStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Box key={stat.label} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.8, boxShadow: '0 14px 36px rgba(18,60,105,0.06)' }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ width: 46, height: 46, borderRadius: 1.4, bgcolor: stat.bg, color: stat.color, display: 'grid', placeItems: 'center' }}><Icon /></Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: '#526273', fontSize: 12, fontWeight: 750 }}>{stat.label}</Typography>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.65rem', lineHeight: 1.05 }}>{stat.value}</Typography>
                  <Typography noWrap sx={{ color: '#637083', fontSize: 11.5 }}>{stat.detail}</Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.4, bgcolor: '#fff' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: '1.2fr 150px 140px 170px 150px 160px auto' }, gap: 1.2, alignItems: 'center' }}>
          <TextField
            label="Search learners"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name, email, or phone"
            InputProps={{ endAdornment: <InputAdornment position="end"><SearchOutlined fontSize="small" /></InputAdornment> }}
          />
          <TextField select label="Account status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <MenuItem value="all">All accounts</MenuItem>
            <MenuItem value="active">Active only</MenuItem>
            <MenuItem value="suspended">Inactive only</MenuItem>
          </TextField>
          <TextField select label="Role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <MenuItem value="all">All roles</MenuItem>
            <MenuItem value="student">Students</MenuItem>
            <MenuItem value="alumni">Alumni</MenuItem>
          </TextField>
          <Autocomplete
            options={cohortOptions}
            value={selectedCohortOption}
            onChange={(_event, option) => setCohortFilter(String(option?.id || 'all'))}
            getOptionLabel={(option) => option?.id === 'all' ? 'All cohorts' : `${option?.name || ''}${option?.status ? ` (${option.status})` : ''}`}
            isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
            renderInput={(params) => <TextField {...params} label="Cohort" />}
          />
          <TextField select label="Course" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
            <MenuItem value="all">All courses</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Sort by" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <MenuItem value="az">A-Z</MenuItem>
            <MenuItem value="za">Z-A</MenuItem>
            <MenuItem value="newest">Newest first</MenuItem>
            <MenuItem value="oldest">Oldest first</MenuItem>
            <MenuItem value="enroll-time">Enroll time</MenuItem>
          </TextField>
          <IconButton onClick={loadStudents} sx={{ border: '1px solid rgba(18,60,105,0.16)', borderRadius: 1, width: 46, height: 46 }}>
            <FilterAltOffOutlined />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px', xl: 'minmax(0, 1fr) 340px' }, gap: { xs: 2, lg: 1.4, xl: 2 }, alignItems: 'start' }}>
        <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, bgcolor: '#fff', overflow: 'hidden', boxShadow: '0 18px 48px rgba(18,60,105,0.06)' }}>
          <Box sx={{ ...adminTableHeaderSx, gridTemplateColumns: { lg: '34px minmax(185px, 1.25fr) 112px minmax(170px, 1fr) 82px 64px', xl: '44px minmax(230px, 1.35fr) 150px minmax(250px, 1fr) 110px 86px' } }}>
            {['', 'Learner', 'Status', 'Courses', 'Joined', 'Actions'].map((label) => (
              <Typography key={label || 'select'} className="admin-table-heading" sx={{ textAlign: label === 'Actions' ? 'center' : 'left' }}>{label}</Typography>
            ))}
          </Box>
          {loading ? (
            <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
          ) : visibleStudents.length === 0 ? (
            <Box sx={{ bgcolor: '#fff', p: 2.5 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>No learners match this view.</Typography>
            </Box>
          ) : (
            <Stack divider={<Divider />}>
              {paginatedStudents.map((student) => {
                const isSelected = selectedStudent?.id === student.id;
                const isAlumni = (student.lifecycle_status || 'active_student') === 'alumni';
                const visibleCourses = student.enrolled_courses.slice(0, 3);
                return (
                  <Box
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', lg: '34px minmax(185px, 1.25fr) 112px minmax(170px, 1fr) 82px 64px', xl: '44px minmax(230px, 1.35fr) 150px minmax(250px, 1fr) 110px 86px' },
                      gap: 1,
                      alignItems: 'center',
                      px: 1.4,
                      py: 1.25,
                      cursor: 'pointer',
                      bgcolor: isSelected ? '#f1f7ff' : '#fff',
                      borderLeft: isSelected ? '3px solid #1b6ef3' : '3px solid transparent',
                      '&:hover': { bgcolor: isSelected ? '#f1f7ff' : '#f8fafc' },
                    }}
                  >
                    <Checkbox checked={isSelected} size="small" sx={{ display: { xs: 'none', lg: 'inline-flex' } }} />
                    <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
                      <UserAvatar user={student} size={42} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900 }}>{student.full_name}</Typography>
                        <Typography noWrap sx={{ color: '#526273', fontSize: 12.5 }}>{student.email}</Typography>
                        <Typography noWrap sx={{ color: '#526273', fontSize: 12 }}>{student.phone || 'No phone provided'}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.7} alignItems="center">
                      <Chip label={learnerStatusLabel(student)} size="small" sx={{ bgcolor: student.is_active ? '#e8f7ef' : '#fff0e7', color: student.is_active ? '#16805f' : '#f05a28', fontWeight: 800 }} />
                      <Chip label={isAlumni ? 'Alumni' : 'Student'} size="small" sx={{ bgcolor: isAlumni ? '#f4ecff' : '#eaf2ff', color: isAlumni ? '#7c3aed' : '#1b6ef3', fontWeight: 800, display: { xs: 'inline-flex', xl: 'none' } }} />
                    </Stack>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(2, minmax(0, 116px))' }, gap: 0.6, alignItems: 'center', minWidth: 0 }}>
                      {isAlumni ? (
                        <Chip label="Community access" size="small" sx={{ bgcolor: '#f4ecff', color: '#7c3aed', fontWeight: 750, justifyContent: 'flex-start', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }} />
                      ) : visibleCourses.length === 0 ? (
                        <Typography sx={{ color: '#637083', fontSize: 13 }}>No courses</Typography>
                      ) : (
                        <>
                          {visibleCourses.map((course) => (
                            <Chip key={course.enrollment_id || course.id} label={course.title} size="small" sx={{ bgcolor: '#eef6ff', color: '#1b6ef3', fontWeight: 750, width: '100%', justifyContent: 'flex-start', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }} />
                          ))}
                          {student.enrolled_courses.length > visibleCourses.length && (
                            <Chip label={`+${student.enrolled_courses.length - visibleCourses.length}`} size="small" sx={{ width: { xs: '100%', lg: 42 } }} />
                          )}
                        </>
                      )}
                    </Box>
                    <Typography sx={{ color: '#526273', fontSize: 12.5 }}>{formatDate(student.created_at)}</Typography>
                    <Stack direction="row" spacing={0.7} justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}>
                      <IconButton size="small" onClick={(event) => { event.stopPropagation(); setSelectedStudentId(student.id); }} sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}>
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                      <IconButton size="small" disabled sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}>
                        <MoreHorizOutlined fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.2} sx={{ px: 1.5, py: 1.4, borderTop: '1px solid rgba(18,60,105,0.1)', bgcolor: '#fff' }}>
            <Typography sx={{ color: '#526273', fontSize: 12.5 }}>
              Showing {visibleStudents.length ? pageStartIndex + 1 : 0}-{Math.min(pageStartIndex + rowsPerPage, visibleStudents.length)} of {visibleStudents.length} learner{visibleStudents.length === 1 ? '' : 's'}
            </Typography>
            <Stack direction="row" spacing={0.7}>
              {Array.from({ length: totalPages }, (_item, index) => index + 1).slice(0, 5).map((page) => (
                <Button key={page} variant={page === safeCurrentPage ? 'contained' : 'outlined'} size="small" onClick={() => setCurrentPage(page)} sx={{ minWidth: 36 }}>{page}</Button>
              ))}
              {totalPages > 5 && <Button size="small" variant="outlined" disabled sx={{ minWidth: 36 }}>...</Button>}
              {totalPages > 5 && (
                <Button variant={totalPages === safeCurrentPage ? 'contained' : 'outlined'} size="small" onClick={() => setCurrentPage(totalPages)} sx={{ minWidth: 36 }}>
                  {totalPages}
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 2, lg: 1.4, xl: 2 }, position: { lg: 'sticky' }, top: 92, boxShadow: '0 18px 48px rgba(18,60,105,0.06)', minWidth: 0 }}>
          {!selectedStudent ? (
            <Typography sx={{ color: '#526273' }}>Select a learner to view details.</Typography>
          ) : (
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box sx={{ position: 'relative', width: 62, height: 62, flexShrink: 0 }}>
                    <UserAvatar user={selectedStudent} size={62} />
                    {selectedStudent.is_active && (
                      <Box sx={{ position: 'absolute', right: 2, bottom: 3, width: 14, height: 14, borderRadius: '50%', bgcolor: '#16a36d', border: '2px solid #fff' }} />
                    )}
                  </Box>
                  <Box>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.1rem' }}>{selectedStudent.full_name}</Typography>
                    <Chip label={learnerRoleLabel(selectedStudent)} size="small" sx={{ mt: 0.5, bgcolor: selectedIsAlumni ? '#f4ecff' : '#eaf2ff', color: selectedIsAlumni ? '#7c3aed' : '#1b6ef3', fontWeight: 800 }} />
                  </Box>
                </Stack>
                <IconButton size="small" disabled><MoreHorizOutlined /></IconButton>
              </Stack>
              <Stack spacing={0.9}>
                {[
                  [selectedIsAlumni ? 'Alumni ID' : 'Student ID', learnerDisplayId(selectedStudent), ArticleOutlined],
                  ['Status', learnerStatusLabel(selectedStudent), ShieldOutlined],
                  ['Role', learnerRoleLabel(selectedStudent), SchoolOutlined],
                  ['Email', selectedStudent.email, EmailOutlined],
                  ['Phone', selectedStudent.phone || 'Not provided', PhoneOutlined],
                  ['Joined', formatDate(selectedStudent.created_at), CalendarTodayOutlined],
                ].map(([label, value, Icon]) => (
                  <Box key={label} sx={{ display: 'grid', gridTemplateColumns: 'minmax(96px, auto) minmax(0, 1fr)', gap: 1, alignItems: 'center', py: 0.7, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
                    <Stack direction="row" spacing={0.85} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box sx={{ width: 26, height: 26, borderRadius: 1, bgcolor: '#f3f7fb', color: '#526273', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <Icon sx={{ fontSize: 16 }} />
                      </Box>
                      <Typography sx={{ color: '#526273', fontSize: 13 }}>{label}</Typography>
                    </Stack>
                    {label === 'Status' ? (
                      <Chip label={value} size="small" sx={{ justifySelf: 'end', bgcolor: selectedStudent.is_active ? '#e8f7ef' : '#fff0e7', color: selectedStudent.is_active ? '#16805f' : '#f05a28', fontWeight: 800 }} />
                    ) : (
                      <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 13, textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere', lineHeight: 1.35 }}>{value}</Typography>
                    )}
                  </Box>
                ))}
              </Stack>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>{selectedIsAlumni ? 'Community Access' : `Enrolled Courses (${selectedStudent.enrolled_courses.length})`}</Typography>
                </Stack>
                {selectedIsAlumni ? (
                  <Box sx={{ bgcolor: '#f4ecff', borderRadius: 1, p: 1.2 }}>
                    <Typography sx={{ color: '#7c3aed', fontWeight: 850 }}>Alumni community access only</Typography>
                    <Typography sx={{ color: '#526273', fontSize: 12.5 }}>This account does not see the student course workspace.</Typography>
                  </Box>
                ) : selectedStudent.enrolled_courses.length === 0 ? (
                  <Typography sx={{ color: '#637083', fontSize: 13 }}>No approved courses yet.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {selectedStudent.enrolled_courses.map((course) => {
                      const key = `${selectedStudent.id}-${course.id}`;
                      return (
                        <Box key={course.enrollment_id} sx={{ bgcolor: '#f8fafc', borderRadius: 1, p: 1 }}>
                          <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 13 }}>{course.title}</Typography>
                          <Typography sx={{ color: '#526273', fontSize: 12 }}>Approved {formatDate(course.approved_at)}</Typography>
                          <Stack direction="row" spacing={0.7} sx={{ mt: 1, flexWrap: 'wrap' }}>
                            <Button size="small" variant="outlined" disabled={activityLoadingKey === key} onClick={() => loadStudentCourseActivity(selectedStudent.id, course.id)}>
                              {activityLoadingKey === key ? 'Loading...' : 'View activity'}
                            </Button>
                            <Button variant="outlined" size="small" component="label" disabled={certificateUploadingKey === key}>
                              {certificateFiles[key]?.name || 'Choose cert'}
                              <input
                                type="file"
                                hidden
                                accept={lmsFileAccept}
                                onChange={(event) => setCertificateFiles((current) => ({ ...current, [key]: event.target.files?.[0] || null }))}
                              />
                            </Button>
                            <Button size="small" variant="contained" color="secondary" disabled={certificateUploadingKey === key || !certificateFiles[key]} onClick={() => uploadCertificate(selectedStudent.id, course.id)}>
                              {certificateUploadingKey === key ? 'Uploading...' : 'Upload'}
                            </Button>
                          </Stack>
                          {activityLoadingKey === key && <Stack alignItems="center" sx={{ py: 1.5 }}><CircularProgress size={20} /></Stack>}
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>
              <Divider />
              <Stack spacing={1}>
                <Button variant={selectedStudent.is_active ? 'outlined' : 'contained'} color={selectedStudent.is_active ? 'error' : 'success'} disabled={saving} onClick={() => updateStudentStatus(selectedStudent.id, !selectedStudent.is_active)}>
                  {selectedStudent.is_active ? 'Suspend Account' : 'Activate Account'}
                </Button>
                {!selectedStudent.is_active && !selectedIsAlumni && (
                  <Button variant="outlined" color="error" disabled={saving} onClick={() => deletePendingStudentAccount(selectedStudent)}>
                    Delete Pending Account
                  </Button>
                )}
              </Stack>
            </Stack>
          )}
        </Box>
      </Box>

      <Dialog open={Boolean(activityDialogData)} onClose={() => setActivityDialogKey('')} fullWidth maxWidth="lg" PaperProps={{ sx: { borderRadius: 1.5, maxHeight: '92vh' } }}>
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950, pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box>
              <Typography variant="h4" sx={{ color: 'primary.dark', fontSize: { xs: '1.55rem', md: '1.9rem' } }}>Course Activity</Typography>
              {activityDialogData && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <UserAvatar user={activityDialogData.student} size={28} />
                  <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 14 }}>{activityDialogData.student.full_name}</Typography>
                  <Divider orientation="vertical" flexItem />
                  <Typography sx={{ color: '#526273', fontSize: 14 }}>{activityDialogData.course.title}</Typography>
                </Stack>
              )}
            </Box>
            <IconButton onClick={() => setActivityDialogKey('')} sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}>
              <CloseOutlined />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#f6f8fb', pt: 1.5 }}>
          {activityDialogData ? renderActivityPanel(activityDialog) : (
            <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={26} /></Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" color="secondary" onClick={() => setActivityDialogKey('')}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Invite Alumni</DialogTitle>
        <DialogContent>
          <Stack component="form" id="admin-alumni-invite-form" onSubmit={createAlumni} spacing={1.5} sx={{ pt: 1 }}>
            <Typography sx={{ color: '#526273', fontSize: 14 }}>Create an alumni account with community-only access and email a password setup link.</Typography>
            <TextField label="Full name" value={alumniForm.full_name} onChange={(event) => updateAlumniForm('full_name', event.target.value)} required />
            <TextField label="Email" type="email" value={alumniForm.email} onChange={(event) => updateAlumniForm('email', event.target.value)} required />
            <TextField label="Phone" value={alumniForm.phone} onChange={(event) => updateAlumniForm('phone', event.target.value)} />
            <Autocomplete
              options={cohorts.filter((cohort) => cohort.status === 'completed')}
              value={cohorts.find((cohort) => String(cohort.id) === String(alumniForm.cohort_id)) || null}
              onChange={(_event, option) => updateAlumniForm('cohort_id', option?.id ? String(option.id) : '')}
              getOptionLabel={(option) => option?.name || ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => <TextField {...params} label="Alumni cohort" helperText="Choose the completed cohort this alumni belonged to." />}
            />
          </Stack>
          {alumniSetup?.setup_url && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Development setup link: <Button size="small" href={alumniSetup.setup_url} sx={{ ml: 1, color: '#0b67c2', fontWeight: 850 }}>Open setup link</Button>
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setInviteDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button type="submit" form="admin-alumni-invite-form" variant="contained" color="secondary" disabled={saving} startIcon={<SendOutlined />}>
            {saving ? 'Sending...' : 'Send invite'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function AdminTeachersPane({ onAdminDataChanged, onAdminToast }) {
  const [teachers, setTeachers] = React.useState([]);
  const [courses, setCourses] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [courseFilter, setCourseFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('az');
  const [selectedTeacherId, setSelectedTeacherId] = React.useState(null);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  useAdminPaneToast(message, setMessage, error, setError, onAdminToast);
  const [form, setForm] = React.useState({ full_name: '', email: '', phone: '', password: '' });
  const [editForm, setEditForm] = React.useState({ full_name: '', email: '', phone: '' });
  const [courseSelections, setCourseSelections] = React.useState({});

  const loadTeachers = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [teachersResponse, coursesResponse] = await Promise.all([
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/teachers`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/courses`),
      ]);
      const teachersData = await teachersResponse.json();
      const coursesData = await coursesResponse.json();
      if (!teachersResponse.ok) throw new Error(teachersData.detail || 'Unable to load teachers');
      if (!coursesResponse.ok) throw new Error(coursesData.detail || 'Unable to load courses');
      setTeachers(teachersData);
      setCourses(coursesData);
      setSelectedTeacherId((current) => current || teachersData[0]?.id || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const visibleTeachers = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return teachers
      .filter((teacher) => {
        if (statusFilter === 'active' && !teacher.is_active) return false;
        if (statusFilter === 'inactive' && teacher.is_active) return false;
        if (courseFilter !== 'all' && !teacher.assigned_courses.some((course) => course.id === Number(courseFilter))) return false;
        if (!normalizedSearch) return true;
        return [teacher.full_name, teacher.email, teacher.phone || ''].some((value) => value.toLowerCase().includes(normalizedSearch));
      })
      .sort((first, second) => {
        if (sortBy === 'newest') return (second.created_at || 0) - (first.created_at || 0);
        if (sortBy === 'courses') return second.assigned_courses.length - first.assigned_courses.length;
        if (sortBy === 'za') return second.full_name.localeCompare(first.full_name);
        return first.full_name.localeCompare(second.full_name);
      });
  }, [teachers, search, statusFilter, courseFilter, sortBy]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, courseFilter, sortBy]);

  React.useEffect(() => {
    if (!visibleTeachers.length) {
      setSelectedTeacherId(null);
      return;
    }
    if (!selectedTeacherId || !visibleTeachers.some((teacher) => teacher.id === selectedTeacherId)) {
      setSelectedTeacherId(visibleTeachers[0].id);
    }
  }, [visibleTeachers, selectedTeacherId]);

  const selectedTeacher = visibleTeachers.find((teacher) => teacher.id === selectedTeacherId) || visibleTeachers[0] || null;
  const rowsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(visibleTeachers.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * rowsPerPage;
  const paginatedTeachers = visibleTeachers.slice(pageStartIndex, pageStartIndex + rowsPerPage);

  const teacherDepartment = (teacher) => {
    const title = teacher?.assigned_courses?.[0]?.title?.toLowerCase() || '';
    if (title.includes('security')) return 'Cyber Security';
    if (title.includes('audit') || title.includes('cisa')) return 'IT Audit';
    if (title.includes('network')) return 'Networking';
    if (title.includes('ai')) return 'Information Technology';
    return teacher?.assigned_courses?.length ? 'Technology' : 'Unassigned';
  };
  const assignedCourseSummary = (teacher) => {
    const courses = teacher?.assigned_courses || [];
    if (courses.length === 0) return 'Unassigned';
    if (courses.length === 1) return courses[0].title;
    return `${courses[0].title} +${courses.length - 1}`;
  };

  const teacherStats = [
    { label: 'Total Teachers', value: teachers.length, detail: 'Instructor accounts', icon: GroupOutlined, color: '#1b6ef3', bg: '#eaf2ff' },
    { label: 'Active Teachers', value: teachers.filter((teacher) => teacher.is_active).length, detail: 'Can access courses', icon: CheckCircleOutlined, color: '#16805f', bg: '#e8f7ef' },
    { label: 'Courses Assigned', value: teachers.reduce((total, teacher) => total + teacher.assigned_courses.length, 0), detail: 'Teaching assignments', icon: MenuBookOutlined, color: '#f05a28', bg: '#fff0e7' },
    { label: 'Pending Invites', value: teachers.filter((teacher) => !teacher.email_verified || !teacher.is_active).length, detail: 'Need attention', icon: CalendarTodayOutlined, color: '#7c3aed', bg: '#f4ecff' },
  ];

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateEditForm = (field, value) => {
    setEditForm((current) => ({ ...current, [field]: value }));
  };

  const openEditTeacher = (teacher) => {
    if (!teacher) return;
    setEditForm({
      full_name: teacher.full_name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
    });
    setEditDialogOpen(true);
  };

  const upsertTeacher = (updatedTeacher) => {
    setTeachers((current) => current.map((teacher) => (teacher.id === updatedTeacher.id ? updatedTeacher : teacher)));
  };

  const createTeacher = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/teachers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to add teacher');
      setTeachers((current) => [...current, data].sort((a, b) => a.full_name.localeCompare(b.full_name)));
      setSearch('');
      setStatusFilter('all');
      setCourseFilter('all');
      setSortBy('az');
      setSelectedTeacherId(data.id);
      setForm({ full_name: '', email: '', phone: '', password: '' });
      setCreateDialogOpen(false);
      onAdminDataChanged?.();
      setMessage('Teacher account created.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateTeacher = async (event) => {
    event.preventDefault();
    if (!selectedTeacher) return;

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/teachers/${selectedTeacher.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update teacher');
      upsertTeacher(data);
      setEditDialogOpen(false);
      onAdminDataChanged?.();
      setMessage('Teacher updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateTeacherStatus = async (teacherId, isActive) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/teachers/${teacherId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: isActive }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update teacher');
      upsertTeacher(data);
      onAdminDataChanged?.();
      setMessage(isActive ? 'Teacher activated.' : 'Teacher deactivated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const assignCourse = async (teacherId) => {
    const courseId = Number(courseSelections[teacherId]);
    if (!courseId) return;

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/teachers/${teacherId}/assign-course`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course_id: courseId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to assign course');
      upsertTeacher(data);
      setCourseSelections((current) => ({ ...current, [teacherId]: '' }));
      onAdminDataChanged?.();
      setMessage('Course assigned to teacher.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const unassignCourse = async (teacherId, courseId, courseTitle) => {
    const confirmed = window.confirm(`Unassign ${courseTitle} from this teacher?`);
    if (!confirmed) return;

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/teachers/${teacherId}/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to unassign course');
      upsertTeacher(data);
      onAdminDataChanged?.();
      setMessage('Course unassigned from teacher.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const exportTeachers = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Status', 'Department', 'Courses'],
      ...visibleTeachers.map((teacher) => [
        teacher.full_name,
        teacher.email,
        teacher.phone || '',
        teacher.is_active ? 'Active' : 'Inactive',
        teacherDepartment(teacher),
        teacher.assigned_courses.map((course) => course.title).join('; '),
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'three13-teachers.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Stack spacing={2.4}>
      <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={1.5}>
        <Box>
          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>Teachers</Typography>
          <Typography sx={{ color: '#637083' }}>Add instructor accounts, manage access, and assign teachers to active courses.</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' }, rowGap: 1 }}>
          <Button variant="contained" color="primary" startIcon={<AddOutlined />} onClick={() => setCreateDialogOpen(true)} sx={{ bgcolor: 'primary.dark', '&:hover': { bgcolor: '#061c31' } }}>Add New Teacher</Button>
          <IconButton onClick={exportTeachers} sx={{ border: '1px solid rgba(18,60,105,0.16)', borderRadius: 1 }}><MoreHorizOutlined /></IconButton>
        </Stack>
      </Stack>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 1.5, lg: 1.1, xl: 1.5 } }}>
        {teacherStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Box key={stat.label} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.8, boxShadow: '0 14px 36px rgba(18,60,105,0.06)' }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ width: 50, height: 50, borderRadius: 1.4, bgcolor: stat.bg, color: stat.color, display: 'grid', placeItems: 'center' }}><Icon /></Box>
                <Box>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.55rem', lineHeight: 1 }}>{stat.value}</Typography>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 13 }}>{stat.label}</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 11.5 }}>{stat.detail}</Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.4, bgcolor: '#fff' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: '1.4fr 160px 190px 170px auto' }, gap: 1.2, alignItems: 'center' }}>
          <TextField label="Search teachers" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, or phone" InputProps={{ endAdornment: <InputAdornment position="end"><SearchOutlined fontSize="small" /></InputAdornment> }} />
          <TextField select label="Account status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <MenuItem value="all">All teachers</MenuItem>
            <MenuItem value="active">Active only</MenuItem>
            <MenuItem value="inactive">Inactive only</MenuItem>
          </TextField>
          <TextField select label="Assigned course" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
            <MenuItem value="all">All courses</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Sort by" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <MenuItem value="az">A-Z</MenuItem>
            <MenuItem value="za">Z-A</MenuItem>
            <MenuItem value="newest">Newest first</MenuItem>
            <MenuItem value="courses">Most courses</MenuItem>
          </TextField>
          <IconButton onClick={loadTeachers} sx={{ border: '1px solid rgba(18,60,105,0.16)', borderRadius: 1, width: 46, height: 46 }}><FilterAltOffOutlined /></IconButton>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px', xl: 'minmax(0, 1fr) 340px' }, gap: { xs: 2, lg: 1.4, xl: 2 }, alignItems: 'start' }}>
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, overflow: 'hidden', boxShadow: '0 18px 48px rgba(18,60,105,0.06)', minWidth: 0, maxWidth: '100%' }}>
          <Box sx={{ ...adminTableHeaderSx, gridTemplateColumns: { lg: 'minmax(180px, 1.35fr) 92px 130px 82px 54px', xl: 'minmax(220px, 1.4fr) 104px 160px 104px 64px' } }}>
            {['Teacher', 'Status', 'Assigned Course', 'Courses', 'Actions'].map((label) => <Typography key={label} className="admin-table-heading" sx={{ textAlign: label === 'Actions' ? 'center' : 'left' }}>{label}</Typography>)}
          </Box>
          {loading ? (
            <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
          ) : visibleTeachers.length === 0 ? (
            <Box sx={{ p: 2.5 }}><Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>No teachers match this view.</Typography></Box>
          ) : (
            <Stack divider={<Divider />}>
              {paginatedTeachers.map((teacher) => {
                const isSelected = selectedTeacher?.id === teacher.id;
                return (
                  <Box key={teacher.id} onClick={() => setSelectedTeacherId(teacher.id)} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(180px, 1.35fr) 92px 130px 82px 54px', xl: 'minmax(220px, 1.4fr) 104px 160px 104px 64px' }, gap: 1, alignItems: 'center', px: 1.2, py: 1.25, cursor: 'pointer', bgcolor: isSelected ? '#f1f7ff' : '#fff', borderLeft: isSelected ? '3px solid #1b6ef3' : '3px solid transparent', '&:hover': { bgcolor: '#f8fafc' } }}>
                    <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
                      <UserAvatar user={teacher} size={44} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 950 }}>{teacher.full_name}</Typography>
                        <Typography noWrap sx={{ color: '#526273', fontSize: 12.5 }}>{teacher.email}</Typography>
                        <Typography noWrap sx={{ color: '#526273', fontSize: 12 }}>{teacher.phone || 'No phone provided'}</Typography>
                      </Box>
                    </Stack>
                    <Chip label={teacher.is_active ? 'Active' : 'Inactive'} size="small" sx={{ bgcolor: teacher.is_active ? '#e8f7ef' : '#eef3f8', color: teacher.is_active ? '#16805f' : '#526273', fontWeight: 850, width: 'fit-content' }} />
                    <Typography noWrap sx={{ color: 'primary.dark', fontSize: 12.5 }}>{assignedCourseSummary(teacher)}</Typography>
                    <Typography sx={{ color: '#0b67c2', fontWeight: 850, fontSize: 12.5 }}>{teacher.assigned_courses.length} Course{teacher.assigned_courses.length === 1 ? '' : 's'}</Typography>
                    <Stack direction="row" spacing={0.7} justifyContent={{ xs: 'flex-start', lg: 'center' }} sx={{ minWidth: { lg: 44 } }}>
                      <IconButton size="small" onClick={(event) => { event.stopPropagation(); setSelectedTeacherId(teacher.id); }} sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}><VisibilityOutlined fontSize="small" /></IconButton>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.2} sx={{ px: 1.5, py: 1.4, borderTop: '1px solid rgba(18,60,105,0.1)' }}>
            <Typography sx={{ color: '#526273', fontSize: 12.5 }}>Showing {visibleTeachers.length ? pageStartIndex + 1 : 0}-{Math.min(pageStartIndex + rowsPerPage, visibleTeachers.length)} of {visibleTeachers.length} teacher{visibleTeachers.length === 1 ? '' : 's'}</Typography>
            <Stack direction="row" spacing={0.7}>
              {Array.from({ length: totalPages }, (_item, index) => index + 1).map((page) => <Button key={page} variant={page === safeCurrentPage ? 'contained' : 'outlined'} size="small" onClick={() => setCurrentPage(page)} sx={{ minWidth: 36 }}>{page}</Button>)}
            </Stack>
          </Stack>
        </Box>

        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 2, lg: 1.4, xl: 2 }, position: { lg: 'sticky' }, top: 92, boxShadow: '0 18px 48px rgba(18,60,105,0.06)', minWidth: 0 }}>
          {!selectedTeacher ? (
            <Typography sx={{ color: '#526273' }}>Select a teacher to view details.</Typography>
          ) : (
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box sx={{ position: 'relative', width: 62, height: 62, flexShrink: 0 }}>
                    <UserAvatar user={selectedTeacher} size={62} />
                    {selectedTeacher.is_active && <Box sx={{ position: 'absolute', right: 2, bottom: 3, width: 14, height: 14, borderRadius: '50%', bgcolor: '#16a36d', border: '2px solid #fff' }} />}
                  </Box>
                  <Box>
                    <Chip label={selectedTeacher.is_active ? 'Active' : 'Inactive'} size="small" sx={{ mb: 0.5, bgcolor: selectedTeacher.is_active ? '#e8f7ef' : '#eef3f8', color: selectedTeacher.is_active ? '#16805f' : '#526273', fontWeight: 800 }} />
                    <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.1rem' }}>{selectedTeacher.full_name}</Typography>
                    <Typography sx={{ color: '#526273', fontSize: 13 }}>{selectedTeacher.email}</Typography>
                    <Typography sx={{ color: '#526273', fontSize: 13 }}>{selectedTeacher.phone || 'No phone provided'}</Typography>
                  </Box>
                </Stack>
                <IconButton size="small" disabled><CloseOutlined /></IconButton>
              </Stack>
              <Stack spacing={0.9}>
                {[
                  ['Assigned Course', assignedCourseSummary(selectedTeacher), MenuBookOutlined],
                  ['Joined', selectedTeacher.created_at ? formatTimestamp(selectedTeacher.created_at, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set', CalendarTodayOutlined],
                  ['Status', selectedTeacher.is_active ? 'Active' : 'Inactive', ShieldOutlined],
                  ['Total Courses', `${selectedTeacher.assigned_courses.length} Course${selectedTeacher.assigned_courses.length === 1 ? '' : 's'}`, MenuBookOutlined],
                ].map(([label, value, Icon]) => (
                  <Stack key={label} direction="row" justifyContent="space-between" spacing={1} sx={{ py: 0.7, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
                    <Stack direction="row" spacing={0.85} alignItems="center">
                      <Box sx={{ width: 26, height: 26, borderRadius: 1, bgcolor: '#f3f7fb', color: '#526273', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon sx={{ fontSize: 16 }} /></Box>
                      <Typography sx={{ color: '#526273', fontSize: 13 }}>{label}</Typography>
                    </Stack>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 13, textAlign: 'right' }}>{value}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Courses Assigned ({selectedTeacher.assigned_courses.length})</Typography>
                </Stack>
                {selectedTeacher.assigned_courses.length === 0 ? (
                  <Typography sx={{ color: '#637083', fontSize: 13 }}>No courses assigned.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {selectedTeacher.assigned_courses.slice(0, 4).map((course, index) => (
                      <Stack key={course.id} direction="row" spacing={1} alignItems="center" sx={{ p: 0.85, borderRadius: 1, bgcolor: '#f8fafc', border: '1px solid rgba(18,60,105,0.08)' }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: 1, bgcolor: ['#eaf2ff', '#fff0e7', '#f4ecff', '#e8f7ef'][index % 4], color: ['#1b6ef3', '#f05a28', '#7c3aed', '#16805f'][index % 4], display: 'grid', placeItems: 'center', flexShrink: 0 }}><MenuBookOutlined fontSize="small" /></Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 13 }}>{course.title}</Typography>
                          <Typography sx={{ color: '#526273', fontSize: 12, textTransform: 'capitalize' }}>{course.status}</Typography>
                        </Box>
                        <Button size="small" variant="outlined" color="error" disabled={saving} onClick={() => unassignCourse(selectedTeacher.id, course.id, course.title)} sx={{ flexShrink: 0 }}>Unassign</Button>
                      </Stack>
                    ))}
                    {selectedTeacher.assigned_courses.length > 4 && <Typography sx={{ color: '#0b67c2', fontWeight: 850, fontSize: 12 }}>+{selectedTeacher.assigned_courses.length - 4} more courses</Typography>}
                  </Stack>
                )}
              </Box>
              <Divider />
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1 }}>Assign Course</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField select size="small" label="Course" value={courseSelections[selectedTeacher.id] || ''} onChange={(event) => setCourseSelections((current) => ({ ...current, [selectedTeacher.id]: event.target.value }))} disabled={!selectedTeacher.is_active} sx={{ flex: 1 }}>
                    <MenuItem value="">Select a course</MenuItem>
                    {courses.map((course) => <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>)}
                  </TextField>
                  <Button variant="contained" color="primary" disabled={saving || !selectedTeacher.is_active || !courseSelections[selectedTeacher.id]} onClick={() => assignCourse(selectedTeacher.id)}>Assign</Button>
                </Stack>
              </Box>
              <Divider />
              <Stack spacing={1}>
                <Button variant="outlined" startIcon={<EditOutlined />} onClick={() => openEditTeacher(selectedTeacher)}>Edit Teacher</Button>
                <Button variant="outlined" color={selectedTeacher.is_active ? 'error' : 'success'} disabled={saving} onClick={() => updateTeacherStatus(selectedTeacher.id, !selectedTeacher.is_active)}>
                  {selectedTeacher.is_active ? 'Deactivate Teacher' : 'Activate Teacher'}
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </Box>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Add New Teacher</DialogTitle>
        <DialogContent>
          <Stack component="form" id="admin-create-teacher-form" onSubmit={createTeacher} spacing={1.4} sx={{ pt: 1 }}>
            <TextField label="Full name" value={form.full_name} onChange={(event) => updateForm('full_name', event.target.value)} required />
            <TextField label="Email" type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} required />
            <TextField label="Phone" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} />
            <TextField label="Temporary password" type="password" value={form.password} onChange={(event) => updateForm('password', event.target.value)} required helperText="At least 9 characters" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setCreateDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button type="submit" form="admin-create-teacher-form" variant="contained" color="secondary" disabled={saving || !form.full_name.trim() || !form.email.trim() || form.password.length < 9}>{saving ? 'Creating...' : 'Create teacher'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Edit Teacher</DialogTitle>
        <DialogContent>
          <Stack component="form" id="admin-edit-teacher-form" onSubmit={updateTeacher} spacing={1.4} sx={{ pt: 1 }}>
            <TextField label="Full name" value={editForm.full_name} onChange={(event) => updateEditForm('full_name', event.target.value)} required />
            <TextField label="Email" type="email" value={editForm.email} onChange={(event) => updateEditForm('email', event.target.value)} required />
            <TextField label="Phone" value={editForm.phone} onChange={(event) => updateEditForm('phone', event.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setEditDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button type="submit" form="admin-edit-teacher-form" variant="contained" color="secondary" disabled={saving || !editForm.full_name.trim() || !editForm.email.trim()}>{saving ? 'Saving...' : 'Save changes'}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function AdminCoursesPane({ onAdminDataChanged, onOpenMaterials, onAdminToast }) {
  const [courses, setCourses] = React.useState([]);
  const [teachers, setTeachers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  useAdminPaneToast(message, setMessage, error, setError, onAdminToast);
  const [selectedCourseId, setSelectedCourseId] = React.useState(null);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [teacherFilter, setTeacherFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('newest');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [form, setForm] = React.useState({ title: '', description: '', status: 'inactive', teacher_id: '' });
  const [editForms, setEditForms] = React.useState({});

  const loadCourses = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [coursesResponse, teachersResponse] = await Promise.all([
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/courses`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/teachers`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
      ]);
      const coursesData = await coursesResponse.json();
      const teachersData = await teachersResponse.json();
      if (!coursesResponse.ok) throw new Error(coursesData.detail || 'Unable to load courses');
      if (!teachersResponse.ok) throw new Error(teachersData.detail || 'Unable to load teachers');
      const normalizedCourses = Array.isArray(coursesData)
        ? coursesData.map((course) => ({ ...course, enrolled_students: Array.isArray(course.enrolled_students) ? course.enrolled_students : [] }))
        : [];
      const normalizedTeachers = Array.isArray(teachersData) ? teachersData.filter((teacher) => teacher.is_active) : [];
      setCourses(normalizedCourses);
      setTeachers(normalizedTeachers);
      setSelectedCourseId((current) => current || normalizedCourses[0]?.id || null);
      setEditForms(normalizedCourses.reduce((forms, course) => ({
        ...forms,
        [course.id]: {
          title: course.title,
          description: course.description || '',
          status: course.status,
          teacher_id: course.teacher?.id || '',
        },
      }), {}));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const courseEnrollments = (course) => (Array.isArray(course?.enrolled_students) ? course.enrolled_students : []);

  const visibleCourses = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return courses
      .filter((course) => {
        if (statusFilter !== 'all' && course.status !== statusFilter) return false;
        if (teacherFilter !== 'all' && String(course.teacher?.id || '') !== teacherFilter) return false;
        if (!normalizedSearch) return true;
        return [
          course.title,
          course.description || '',
          course.teacher?.full_name || '',
        ].some((value) => value.toLowerCase().includes(normalizedSearch));
      })
      .sort((first, second) => {
        if (sortBy === 'az') return first.title.localeCompare(second.title);
        if (sortBy === 'za') return second.title.localeCompare(first.title);
        if (sortBy === 'enrollments') return courseEnrollments(second).length - courseEnrollments(first).length;
        if (sortBy === 'oldest') return (first.created_at || 0) - (second.created_at || 0);
        return (second.created_at || 0) - (first.created_at || 0);
      });
  }, [courses, search, statusFilter, teacherFilter, sortBy]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, teacherFilter, sortBy]);

  React.useEffect(() => {
    if (!visibleCourses.length) {
      setSelectedCourseId(null);
      return;
    }
    if (!selectedCourseId || !visibleCourses.some((course) => course.id === selectedCourseId)) {
      setSelectedCourseId(visibleCourses[0].id);
    }
  }, [visibleCourses, selectedCourseId]);

  const selectedCourse = visibleCourses.find((course) => course.id === selectedCourseId) || visibleCourses[0] || null;
  const rowsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(visibleCourses.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * rowsPerPage;
  const paginatedCourses = visibleCourses.slice(pageStartIndex, pageStartIndex + rowsPerPage);
  const totalEnrollments = courses.reduce((total, course) => total + courseEnrollments(course).length, 0);
  const statusChipSxForCourse = (status) => {
    if (status === 'active') return { bgcolor: '#e8f7ef', color: '#16805f' };
    if (status === 'archived') return { bgcolor: '#eef3f8', color: '#526273' };
    return { bgcolor: '#fff0e7', color: '#f05a28' };
  };
  const courseStats = [
    { label: 'Total Courses', value: courses.length, detail: 'Catalog items', icon: GroupOutlined, color: '#1b6ef3', bg: '#eaf2ff' },
    { label: 'Active Courses', value: courses.filter((course) => course.status === 'active').length, detail: 'Available to students', icon: SchoolOutlined, color: '#16805f', bg: '#e8f7ef' },
    { label: 'Inactive Courses', value: courses.filter((course) => course.status === 'inactive').length, detail: 'Hidden or draft', icon: MenuBookOutlined, color: '#f05a28', bg: '#fff0e7' },
    { label: 'Archived Courses', value: courses.filter((course) => course.status === 'archived').length, detail: 'Closed courses', icon: FolderCopyOutlined, color: '#7c3aed', bg: '#f4ecff' },
    { label: 'Total Enrollments', value: totalEnrollments, detail: 'Approved access rows', icon: GroupOutlined, color: '#1b6ef3', bg: '#eaf2ff' },
  ];

  const updateCourseInList = (updatedCourse) => {
    setCourses((current) => current.map((course) => (course.id === updatedCourse.id ? updatedCourse : course)));
    setEditForms((current) => ({
      ...current,
      [updatedCourse.id]: {
        title: updatedCourse.title,
        description: updatedCourse.description || '',
        status: updatedCourse.status,
        teacher_id: updatedCourse.teacher?.id || '',
      },
    }));
  };

  const createCourse = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/courses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          teacher_id: form.teacher_id ? Number(form.teacher_id) : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to create course');
      setCourses((current) => [data, ...current]);
      setEditForms((current) => ({
        ...current,
        [data.id]: { title: data.title, description: data.description || '', status: data.status, teacher_id: data.teacher?.id || '' },
      }));
      setSelectedCourseId(data.id);
      setForm({ title: '', description: '', status: 'inactive', teacher_id: '' });
      setCreateDialogOpen(false);
      onAdminDataChanged?.();
      setMessage('Course created.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveCourse = async (courseId) => {
    const editForm = editForms[courseId];
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          teacher_id: editForm.teacher_id ? Number(editForm.teacher_id) : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update course');
      updateCourseInList(data);
      onAdminDataChanged?.();
      setMessage('Course updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const archiveCourse = async (courseId) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/courses/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to archive course');
      updateCourseInList(data);
      onAdminDataChanged?.();
      setMessage('Course archived.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteCoursePermanently = async (courseId) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/courses/${courseId}/permanent`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to delete course');
      setCourses((current) => current.filter((course) => course.id !== courseId));
      setSelectedCourseId(null);
      setEditForms((current) => {
        const next = { ...current };
        delete next[courseId];
        return next;
      });
      onAdminDataChanged?.();
      setMessage('Course permanently deleted.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2.2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={1.4}>
        <Box>
          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.5 }}>Courses</Typography>
          <Typography sx={{ color: '#637083' }}>Create courses, assign teachers, set availability, and view enrolled students.</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="secondary" startIcon={<AddOutlined />} onClick={() => setCreateDialogOpen(true)}>Create Course</Button>
          <IconButton onClick={loadCourses} sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}><MoreHorizOutlined /></IconButton>
        </Stack>
      </Stack>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, minmax(0, 1fr))' }, gap: { xs: 1.4, lg: 1.1, xl: 1.4 } }}>
        {courseStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Box key={stat.label} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6, boxShadow: '0 14px 36px rgba(18,60,105,0.06)' }}>
              <Stack direction="row" spacing={1.1} alignItems="center">
                <Box sx={{ width: 50, height: 50, borderRadius: 1.4, bgcolor: stat.bg, color: stat.color, display: 'grid', placeItems: 'center' }}><Icon /></Box>
                <Box>
                  <Typography sx={{ color: '#526273', fontSize: 12, fontWeight: 800 }}>{stat.label}</Typography>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.65rem', lineHeight: 1 }}>{stat.value}</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 11.5 }}>{stat.detail}</Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px', xl: 'minmax(0, 1fr) 340px' }, gap: { xs: 2, lg: 1.4, xl: 2 }, alignItems: 'start' }}>
        <Stack spacing={1.6}>
          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.4 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: '1.4fr 150px 210px 170px auto' }, gap: 1.1, alignItems: 'center' }}>
              <TextField size="small" label="Search courses" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Title, teacher, description" InputProps={{ endAdornment: <InputAdornment position="end"><SearchOutlined fontSize="small" /></InputAdornment> }} />
              <TextField select size="small" label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <MenuItem value="all">All statuses</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
              <TextField select size="small" label="Teacher" value={teacherFilter} onChange={(event) => setTeacherFilter(event.target.value)}>
                <MenuItem value="all">All teachers</MenuItem>
                {teachers.map((teacher) => <MenuItem key={teacher.id} value={String(teacher.id)}>{teacher.full_name}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Sort by" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <MenuItem value="newest">Newest first</MenuItem>
                <MenuItem value="oldest">Oldest first</MenuItem>
                <MenuItem value="az">A-Z</MenuItem>
                <MenuItem value="za">Z-A</MenuItem>
                <MenuItem value="enrollments">Most enrolled</MenuItem>
              </TextField>
              <Button variant="outlined" startIcon={<FilterAltOffOutlined />} onClick={() => { setSearch(''); setStatusFilter('all'); setTeacherFilter('all'); setSortBy('newest'); }}>Filters</Button>
            </Box>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
            <Typography sx={{ color: '#526273', fontSize: 12.5 }}>Showing {visibleCourses.length ? pageStartIndex + 1 : 0}-{Math.min(pageStartIndex + rowsPerPage, visibleCourses.length)} of {visibleCourses.length} courses</Typography>
            <Stack direction="row" spacing={0.7}>
              {Array.from({ length: totalPages }, (_item, index) => index + 1).map((page) => (
                <Button key={page} variant={page === safeCurrentPage ? 'contained' : 'outlined'} size="small" onClick={() => setCurrentPage(page)} sx={{ minWidth: 36 }}>{page}</Button>
              ))}
            </Stack>
          </Stack>

          {loading ? (
            <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
          ) : visibleCourses.length === 0 ? (
            <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>No courses match this view.</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 1.5 }}>
              {paginatedCourses.map((course) => {
                const courseImage = getCourseImage(course.title);
                return (
                  <Box key={course.id} onClick={() => setSelectedCourseId(course.id)} sx={{ bgcolor: '#fff', borderRadius: 1.5, overflow: 'hidden', cursor: 'pointer', border: selectedCourse?.id === course.id ? '1px solid #1b6ef3' : '1px solid rgba(18,60,105,0.12)', minHeight: 300, display: 'flex', flexDirection: 'column', boxShadow: '0 16px 42px rgba(18,60,105,0.06)', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 18px 44px rgba(18,60,105,0.12)' }, transition: 'transform 160ms ease, box-shadow 160ms ease' }}>
                    <Box sx={{ minHeight: 140, p: 1.3, color: '#fff', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', bgcolor: '#123c69', backgroundImage: courseImage ? `linear-gradient(180deg, rgba(8,37,64,0.12), rgba(8,37,64,0.72)), url(${courseImage})` : 'linear-gradient(135deg, #123c69, #f05a28)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      <Chip label={course.status} size="small" sx={{ ...statusChipSxForCourse(course.status), textTransform: 'capitalize', fontWeight: 850 }} />
                      <IconButton size="small" sx={{ bgcolor: 'rgba(255,255,255,0.86)', borderRadius: 1 }}><MoreHorizOutlined fontSize="small" /></IconButton>
                    </Box>
                    <Box sx={{ p: 1.6, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 0.6 }}>{course.title}</Typography>
                      <Typography sx={{ color: '#526273', fontSize: 13.5, flex: 1 }}>{course.description || 'No description yet'}</Typography>
                      <Stack direction="row" spacing={1.2} justifyContent="space-between" sx={{ mt: 1.5, color: '#123c69' }}>
                        <Stack direction="row" spacing={0.5} alignItems="center"><PersonOutlineOutlined sx={{ fontSize: 16 }} /><Typography noWrap sx={{ fontSize: 12 }}>{course.teacher?.full_name || 'Unassigned'}</Typography></Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center"><GroupOutlined sx={{ fontSize: 16 }} /><Typography sx={{ fontSize: 12 }}>{courseEnrollments(course).length} Enrolled</Typography></Stack>
                      </Stack>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Stack>

        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 1.8, lg: 1.4, xl: 1.8 }, position: { lg: 'sticky' }, top: 92, boxShadow: '0 18px 48px rgba(18,60,105,0.06)', minWidth: 0 }}>
          {!selectedCourse ? (
            <Typography sx={{ color: '#526273' }}>Select a course to view details.</Typography>
          ) : (() => {
            const editForm = editForms[selectedCourse.id] || {};
            const courseImage = getCourseImage(selectedCourse.title);
            return (
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box component="img" src={courseImage || '/images/course1.jpg'} alt={selectedCourse.title} sx={{ width: 128, height: 90, borderRadius: 1, objectFit: 'cover' }} />
                  <Chip label={selectedCourse.status} size="small" sx={{ ...statusChipSxForCourse(selectedCourse.status), textTransform: 'capitalize', fontWeight: 850 }} />
                </Stack>
                <Box>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.15rem' }}>{selectedCourse.title}</Typography>
                  <Typography sx={{ color: '#526273', fontSize: 13 }}>{selectedCourse.teacher?.full_name || 'Unassigned'} | {courseEnrollments(selectedCourse).length} enrolled</Typography>
                </Box>
                <Divider />
                <Stack spacing={0.8}>
                  {[
                    ['Course ID', `CS-${String(selectedCourse.id).padStart(4, '0')}`, ArticleOutlined],
                    ['Status', selectedCourse.status, ShieldOutlined],
                    ['Created', selectedCourse.created_at ? formatTimestamp(selectedCourse.created_at, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set', CalendarTodayOutlined],
                    ['Teacher', selectedCourse.teacher?.full_name || 'Unassigned', PersonOutlineOutlined],
                    ['Enrollments', `${courseEnrollments(selectedCourse).length} students`, GroupOutlined],
                  ].map(([label, value, Icon]) => (
                    <Stack key={label} direction="row" justifyContent="space-between" spacing={1} sx={{ py: 0.5 }}>
                      <Stack direction="row" spacing={0.8} alignItems="center"><Icon sx={{ color: '#526273', fontSize: 17 }} /><Typography sx={{ color: '#526273', fontSize: 13 }}>{label}</Typography></Stack>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 13, textAlign: 'right' }}>{value}</Typography>
                    </Stack>
                  ))}
                </Stack>
                <Divider />
                <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Description</Typography>
                <Typography sx={{ color: '#526273', fontSize: 13 }}>{selectedCourse.description || 'No description yet.'}</Typography>
                <Divider />
                <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Quick Actions</Typography>
                <Stack spacing={1}>
                  <TextField size="small" label="Title" value={editForm.title || ''} onChange={(event) => setEditForms((current) => ({ ...current, [selectedCourse.id]: { ...current[selectedCourse.id], title: event.target.value } }))} />
                  <TextField size="small" label="Description" value={editForm.description || ''} onChange={(event) => setEditForms((current) => ({ ...current, [selectedCourse.id]: { ...current[selectedCourse.id], description: event.target.value } }))} multiline minRows={2} />
                  <TextField select size="small" label="Teacher" value={editForm.teacher_id || ''} onChange={(event) => setEditForms((current) => ({ ...current, [selectedCourse.id]: { ...current[selectedCourse.id], teacher_id: event.target.value } }))}>
                    <MenuItem value="">Unassigned</MenuItem>
                    {teachers.map((teacher) => <MenuItem key={teacher.id} value={teacher.id}>{teacher.full_name}</MenuItem>)}
                  </TextField>
                  <TextField select size="small" label="Status" value={editForm.status || 'inactive'} onChange={(event) => setEditForms((current) => ({ ...current, [selectedCourse.id]: { ...current[selectedCourse.id], status: event.target.value } }))}>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </TextField>
                  <Button variant="contained" color="primary" disabled={saving} onClick={() => saveCourse(selectedCourse.id)} startIcon={<EditOutlined />}>Save changes</Button>
                  <Button variant="outlined" color="error" disabled={saving || selectedCourse.status === 'archived'} onClick={() => archiveCourse(selectedCourse.id)}>Archive Course</Button>
                  <Button variant="contained" color="error" disabled={saving} onClick={() => deleteCoursePermanently(selectedCourse.id)}>Delete permanently</Button>
                </Stack>
              </Stack>
            );
          })()}
        </Box>
      </Box>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Create Course</DialogTitle>
        <DialogContent>
          <Stack component="form" id="admin-create-course-form" onSubmit={createCourse} spacing={1.3} sx={{ pt: 1 }}>
            <TextField label="Course title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
            <TextField label="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} multiline minRows={3} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '180px 1fr' }, gap: 1.2 }}>
              <TextField select label="Status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </TextField>
              <TextField select label="Teacher" value={form.teacher_id} onChange={(event) => setForm((current) => ({ ...current, teacher_id: event.target.value }))}>
                <MenuItem value="">Unassigned</MenuItem>
                {teachers.map((teacher) => <MenuItem key={teacher.id} value={teacher.id}>{teacher.full_name}</MenuItem>)}
              </TextField>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setCreateDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button type="submit" form="admin-create-course-form" variant="contained" color="secondary" disabled={saving || !form.title.trim()}>{saving ? 'Creating...' : 'Create course'}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function AdminCourseMaterialsPane({ onAdminDataChanged, initialCourseId = '', onAdminToast, scope = 'admin' }) {
  const [courses, setCourses] = React.useState([]);
  const [selectedCourseId, setSelectedCourseId] = React.useState('');
  const [content, setContent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [contentLoading, setContentLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  useAdminPaneToast(message, setMessage, error, setError, onAdminToast);
  const [selectedMaterialFile, setSelectedMaterialFile] = React.useState(null);
  const [selectedAssignmentFile, setSelectedAssignmentFile] = React.useState(null);
  const [expandedModuleId, setExpandedModuleId] = React.useState(null);
  const [activeContentTab, setActiveContentTab] = React.useState('structure');
  const [moduleSort, setModuleSort] = React.useState('position');
  const [moduleDialogOpen, setModuleDialogOpen] = React.useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = React.useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = React.useState(false);
  const [materialActionMenu, setMaterialActionMenu] = React.useState({ anchorEl: null, material: null });
  const [assignmentActionMenu, setAssignmentActionMenu] = React.useState({ anchorEl: null, assignment: null });
  const [viewingMaterial, setViewingMaterial] = React.useState(null);
  const [viewingAssignment, setViewingAssignment] = React.useState(null);
  const [collapsedMaterialGroups, setCollapsedMaterialGroups] = React.useState({});
  const [assignmentFilters, setAssignmentFilters] = React.useState({ search: '', module: 'all', status: 'all', sort: 'due_date' });
  const [moduleForm, setModuleForm] = React.useState({ title: '', description: '', position: 1, is_visible: true });
  const [materialForm, setMaterialForm] = React.useState({
    title: '',
    description: '',
    material_type: 'youtube',
    module_id: '',
    external_url: '',
    file_url: '',
    is_visible: true,
    estimated_minutes: 15,
  });
  const [assignmentForm, setAssignmentForm] = React.useState({
    title: '',
    instructions: '',
    module_id: '',
    due_date: '',
    is_open: true,
    estimated_minutes: 30,
  });
  const apiScope = scope === 'teacher' ? 'teacher' : 'admin';

  const selectedCourse = courses.find((course) => course.id === Number(selectedCourseId));
  const modules = sortModules(content?.modules || [], moduleSort);
  const allMaterials = content ? [...(content.unassigned_materials || []), ...modules.flatMap((module) => module.materials || [])] : [];
  const allAssignments = content ? [...(content.unassigned_assignments || []), ...modules.flatMap((module) => module.assignments || [])] : [];
  const selectedModule = modules.find((module) => module.id === expandedModuleId) || modules[0] || null;
  const selectedModuleMaterials = selectedModule?.materials || [];
  const selectedModuleAssignments = selectedModule?.assignments || [];
  const courseImage = selectedCourse ? getCourseImage(selectedCourse.title) : '';
  const selectedCourseEnrollments = Array.isArray(selectedCourse?.enrolled_students) ? selectedCourse.enrolled_students.length : 0;
  const materialGroups = [
    ...modules.map((module) => ({ id: `module-${module.id}`, title: `Week ${module.position || ''}${module.position ? ' - ' : ''}${module.title}`, materials: module.materials || [] })),
    ...(content?.unassigned_materials?.length ? [{ id: 'unassigned', title: 'Unassigned Materials', materials: content.unassigned_materials }] : []),
  ].filter((group) => group.materials.length > 0);
  const assignmentRows = allAssignments.map((assignment) => {
    const ownerModule = modules.find((module) => (module.assignments || []).some((item) => item.id === assignment.id));
    return { ...assignment, module_title: ownerModule?.title || 'Unassigned', module_position: ownerModule?.position || null };
  });
  const filteredAssignmentRows = assignmentRows
    .filter((assignment) => {
      const query = assignmentFilters.search.trim().toLowerCase();
      if (query && ![assignment.title, assignment.instructions, assignment.module_title].filter(Boolean).join(' ').toLowerCase().includes(query)) return false;
      if (assignmentFilters.module !== 'all') {
        if (assignmentFilters.module === 'unassigned' && assignment.module_id) return false;
        if (assignmentFilters.module !== 'unassigned' && String(assignment.module_id || '') !== assignmentFilters.module) return false;
      }
      if (assignmentFilters.status === 'open' && !assignment.is_open) return false;
      if (assignmentFilters.status === 'closed' && assignment.is_open) return false;
      return true;
    })
    .sort((first, second) => {
      if (assignmentFilters.sort === 'newest') return (second.created_at || 0) - (first.created_at || 0);
      if (assignmentFilters.sort === 'oldest') return (first.created_at || 0) - (second.created_at || 0);
      return (first.due_at || Number.MAX_SAFE_INTEGER) - (second.due_at || Number.MAX_SAFE_INTEGER);
    });

  const loadContent = React.useCallback(async (courseId) => {
    if (!courseId) {
      setContent(null);
      return;
    }
    setContentLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/courses/${courseId}/content`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load course content');
      setContent(data);
      setModuleForm((current) => ({ ...current, position: (data.modules?.length || 0) + 1 }));
    } catch (err) {
      setError(err.message);
    } finally {
      setContentLoading(false);
    }
  }, []);

  const loadCourses = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/courses`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load courses');
      setCourses(data);
      const requestedCourseId = initialCourseId ? String(initialCourseId) : '';
      const firstCourseId = data[0]?.id ? String(data[0].id) : '';
      const nextCourseId = data.some((course) => String(course.id) === requestedCourseId) ? requestedCourseId : firstCourseId;
      setSelectedCourseId(nextCourseId);
      if (nextCourseId) await loadContent(nextCourseId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [initialCourseId, loadContent]);

  React.useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleCourseChange = async (event) => {
    const courseId = event.target.value;
    setSelectedCourseId(courseId);
    setExpandedModuleId(null);
    setMessage('');
    await loadContent(courseId);
  };

  const createModule = async (event) => {
    event.preventDefault();
    if (!selectedCourseId) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/courses/${selectedCourseId}/modules`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...moduleForm, position: Number(moduleForm.position) || 0 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to create module');
      setContent(data);
      setModuleForm({ title: '', description: '', position: (data.modules?.length || 0) + 1, is_visible: true });
      const createdModule = [...(data.modules || [])].sort((first, second) => second.created_at - first.created_at)[0];
      if (createdModule) setExpandedModuleId(createdModule.id);
      setModuleDialogOpen(false);
      setMessage('Module created.');
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const createMaterial = async (event) => {
    event.preventDefault();
    if (!selectedCourseId) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      let uploadedFileUrl = materialForm.file_url || '';
      let materialTitle = materialForm.title;

      if (selectedMaterialFile) {
        setUploading(true);
        const uploadBody = new FormData();
        uploadBody.append('file', selectedMaterialFile);
        const uploadResponse = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/courses/${selectedCourseId}/materials/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: uploadBody,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.detail || 'Unable to upload file');
        uploadedFileUrl = uploadData.file_url;
        materialTitle = materialTitle || uploadData.file_name;
      }

      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/courses/${selectedCourseId}/materials`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...materialForm,
          title: materialTitle,
          module_id: materialForm.module_id ? Number(materialForm.module_id) : null,
          external_url: materialForm.external_url || null,
          file_url: uploadedFileUrl || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to add material');
      setContent(data);
      setMaterialForm({
        title: '',
        description: '',
        material_type: 'youtube',
        module_id: materialForm.module_id,
        external_url: '',
        file_url: '',
        is_visible: true,
        estimated_minutes: 15,
      });
      setSelectedMaterialFile(null);
      setMaterialDialogOpen(false);
      setMessage('Material added.');
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const createAssignment = async (event) => {
    event.preventDefault();
    if (!selectedCourseId) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      let attachmentUrl = '';
      let attachmentName = '';
      if (selectedAssignmentFile) {
        setUploading(true);
        const uploadBody = new FormData();
        uploadBody.append('file', selectedAssignmentFile);
        const uploadResponse = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/courses/${selectedCourseId}/assignments/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: uploadBody,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.detail || 'Unable to upload assignment file');
        attachmentUrl = uploadData.file_url;
        attachmentName = uploadData.file_name;
      }
      const due_at = assignmentForm.due_date ? Math.floor(new Date(`${assignmentForm.due_date}T23:59:00`).getTime() / 1000) : null;
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/courses/${selectedCourseId}/assignments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: assignmentForm.title,
          instructions: assignmentForm.instructions,
          module_id: assignmentForm.module_id ? Number(assignmentForm.module_id) : null,
          attachment_url: attachmentUrl || null,
          attachment_name: attachmentName || null,
          due_at,
          is_open: assignmentForm.is_open,
          estimated_minutes: Number(assignmentForm.estimated_minutes) || 30,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to create assignment');
      setContent(data);
      setAssignmentForm({ title: '', instructions: '', module_id: assignmentForm.module_id, due_date: '', is_open: true, estimated_minutes: 30 });
      setSelectedAssignmentFile(null);
      setAssignmentDialogOpen(false);
      setMessage('Assignment created. Student submissions are for review only.');
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const toggleModuleVisibility = async (module) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/modules/${module.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_visible: !module.is_visible }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update module');
      setContent(data);
      setMessage('Module visibility updated.');
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleMaterialVisibility = async (material) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/materials/${material.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_visible: !material.is_visible }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update material');
      setContent(data);
      setMessage('Material visibility updated.');
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteMaterial = async (materialId) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/materials/${materialId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to delete material');
      setContent(data);
      setMessage('Material deleted.');
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteModule = async (moduleId) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/modules/${moduleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to delete module');
      setContent(data);
      setMessage('Module deleted.');
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAssignmentOpen = async (assignment) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/assignments/${assignment.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_open: !assignment.is_open }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update assignment');
      setContent(data);
      setViewingAssignment((current) => current?.id === assignment.id ? { ...current, is_open: !assignment.is_open } : current);
      setMessage(`Assignment ${assignment.is_open ? 'closed' : 'opened'} for submissions.`);
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const openMaterialActionMenu = (event, material) => {
    setMaterialActionMenu({ anchorEl: event.currentTarget, material });
  };

  const closeMaterialActionMenu = () => {
    setMaterialActionMenu({ anchorEl: null, material: null });
  };

  const runMaterialMenuAction = async (action) => {
    const material = materialActionMenu.material;
    closeMaterialActionMenu();
    if (!material) return;
    if (action === 'visibility') {
      await toggleMaterialVisibility(material);
      return;
    }
    if (action === 'delete') {
      await deleteMaterial(material.id);
    }
  };

  const openAssignmentActionMenu = (event, assignment) => {
    setAssignmentActionMenu({ anchorEl: event.currentTarget, assignment });
  };

  const closeAssignmentActionMenu = () => {
    setAssignmentActionMenu({ anchorEl: null, assignment: null });
  };

  const runAssignmentMenuAction = async (action) => {
    const assignment = assignmentActionMenu.assignment;
    closeAssignmentActionMenu();
    if (!assignment) return;
    if (action === 'toggle-open') {
      await toggleAssignmentOpen(assignment);
    }
  };

  const getMaterialModuleTitle = (material) => {
    const ownerModule = modules.find((module) => (module.materials || []).some((item) => item.id === material.id));
    return ownerModule?.title || 'Course resource';
  };

  const openMaterialInlineViewer = (material) => {
    setViewingMaterial({
      ...material,
      course: selectedCourse ? { id: selectedCourse.id, title: selectedCourse.title } : null,
      module_title: getMaterialModuleTitle(material),
    });
  };

  const toggleMaterialGroupCollapse = (groupId) => {
    setCollapsedMaterialGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  };

  const renderMaterial = (material) => {
    const materialUrl = getMaterialUrl(material);
    return (
      <Box key={material.id} sx={{ bgcolor: '#fff', borderRadius: 1, p: 1.2, border: '1px solid rgba(18,60,105,0.1)' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.2}>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', mb: 0.4 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{material.title}</Typography>
              <Chip label={materialTypeLabels[material.material_type] || material.material_type} size="small" color="primary" />
              <Chip label={material.is_visible ? 'Visible' : 'Hidden'} size="small" color={material.is_visible ? 'success' : 'default'} />
            </Stack>
            {material.description && <Typography sx={{ color: '#637083', fontSize: 13 }}>{material.description}</Typography>}
            {materialUrl && (
              <Typography component="a" href={materialUrl} target="_blank" rel="noreferrer" sx={{ display: 'block', color: '#123c69', fontSize: 13, mt: 0.4, overflowWrap: 'anywhere' }}>
                {materialUrl}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
            <Button size="small" variant="outlined" component="a" href={materialUrl || undefined} target="_blank" rel="noreferrer" disabled={!materialUrl}>
              Open
            </Button>
            <Button size="small" variant="outlined" disabled={saving} onClick={() => toggleMaterialVisibility(material)}>
              {material.is_visible ? 'Hide' : 'Show'}
            </Button>
            <Button size="small" variant="outlined" color="error" disabled={saving} onClick={() => deleteMaterial(material.id)}>
              Delete
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  };

  const renderMaterialLibraryRow = (material) => {
    const materialUrl = getMaterialUrl(material);
    const typeLabel = materialTypeLabels[material.material_type] || material.material_type || 'Material';
    const isVideo = material.material_type === 'youtube' || material.material_type === 'video';
    const isPdf = material.material_type === 'pdf' || /\.pdf(\?|#|$)/i.test(materialUrl || material.file_url || '');
    const Icon = isVideo ? OndemandVideoOutlined : isPdf ? PictureAsPdfOutlined : LinkOutlined;
    const iconSx = isVideo
      ? { bgcolor: '#f2eaff', color: '#7c3aed' }
      : isPdf
        ? { bgcolor: '#ffe8e8', color: '#e53935' }
        : { bgcolor: '#e8f7ef', color: '#16805f' };
    return (
      <Box key={material.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 120px 92px 40px' }, gap: 1, alignItems: 'center', p: 1, borderTop: '1px solid rgba(18,60,105,0.08)' }}>
        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
          <Box sx={{ width: 44, height: 44, flex: '0 0 44px', borderRadius: 1, display: 'grid', placeItems: 'center', ...iconSx }}>
            <Icon fontSize="small" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap' }}>
              <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13.5 }}>{material.title}</Typography>
              <Chip label={typeLabel} size="small" sx={{ height: 20, bgcolor: '#eef3f8', color: '#526273', fontWeight: 800, fontSize: 11 }} />
            </Stack>
            <Typography sx={{ color: '#637083', fontSize: 12 }}>
              {material.estimated_minutes ? `${material.estimated_minutes} min` : 'No time set'} · Added {formatTimestamp(material.created_at, { month: 'short', day: 'numeric', year: 'numeric' })} · By You
            </Typography>
          </Box>
        </Stack>
        <Chip
          icon={<VisibilityOutlined sx={{ fontSize: '14px !important' }} />}
          label={material.is_visible ? 'Visible' : 'Hidden'}
          size="small"
          sx={{ justifySelf: { lg: 'center' }, bgcolor: material.is_visible ? '#e8f7ef' : '#eef3f8', color: material.is_visible ? '#16805f' : '#526273', fontWeight: 850, '& .MuiChip-icon': { color: material.is_visible ? '#16805f' : '#526273' } }}
        />
        <Button
          size="small"
          variant="outlined"
          disabled={!materialUrl}
          onClick={() => openMaterialInlineViewer(material)}
          endIcon={<OpenInNewOutlined sx={{ fontSize: 18 }} />}
          sx={{
            justifySelf: { lg: 'end' },
            minWidth: 96,
            height: 38,
            borderRadius: 1,
            borderColor: 'rgba(18,60,105,0.24)',
            color: 'primary.dark',
            bgcolor: '#fff',
            fontWeight: 900,
            boxShadow: '0 4px 12px rgba(18,60,105,0.04)',
            '&:hover': {
              borderColor: 'rgba(18,60,105,0.38)',
              bgcolor: '#f8fbff',
            },
            '& .MuiButton-endIcon': { ml: 0.8 },
          }}
        >
          Open
        </Button>
        <IconButton size="small" onClick={(event) => openMaterialActionMenu(event, material)} sx={{ justifySelf: { lg: 'end' } }}>
          <MoreHorizOutlined fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  const renderMaterialLibrary = () => (
    <Stack spacing={1.2}>
      {materialGroups.length === 0 ? (
        <Typography sx={{ color: '#637083' }}>No materials yet.</Typography>
      ) : materialGroups.map((group) => (
        <Box key={group.id} sx={{ border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1.2, overflow: 'hidden', bgcolor: '#fff' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.2, py: 0.9, bgcolor: '#fbfdff' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, cursor: 'pointer' }} onClick={() => toggleMaterialGroupCollapse(group.id)}>
              <IconButton size="small" aria-label={collapsedMaterialGroups[group.id] === false ? 'Collapse materials' : 'Expand materials'} sx={{ width: 28, height: 28, color: '#526273' }}>
                <KeyboardArrowDownOutlined sx={{ fontSize: 22, transform: collapsedMaterialGroups[group.id] === false ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 160ms ease' }} />
              </IconButton>
              <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13.5 }}>{group.title}</Typography>
              <Chip label={`${group.materials.length} item${group.materials.length === 1 ? '' : 's'}`} size="small" sx={{ height: 20, bgcolor: '#ffe8de', color: '#f05a28', fontWeight: 850, fontSize: 11 }} />
            </Stack>
            <IconButton size="small"><MoreHorizOutlined fontSize="small" /></IconButton>
          </Stack>
          {collapsedMaterialGroups[group.id] === false && group.materials.map(renderMaterialLibraryRow)}
        </Box>
      ))}
    </Stack>
  );

  const renderStructureModuleContent = (module) => (
    <Box sx={{ mt: 1.6, border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.4, bgcolor: '#fff', overflow: 'hidden' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={1.2} sx={{ p: 1.5, borderBottom: '1px solid rgba(18,60,105,0.08)', bgcolor: '#fbfdff' }}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Module {module.position || ''}: {module.title}</Typography>
            <Chip label={module.is_visible ? 'Visible' : 'Hidden'} size="small" sx={{ bgcolor: module.is_visible ? '#e8f7ef' : '#eef3f8', color: module.is_visible ? '#16805f' : '#526273', fontWeight: 800 }} />
          </Stack>
          <Typography sx={{ color: '#637083', fontSize: 13 }}>{module.description || 'No module description yet.'}</Typography>
        </Box>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1.4, p: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1 }}>Materials</Typography>
          {(module.materials || []).length === 0 ? (
            <Box sx={{ bgcolor: '#f8fbff', border: '1px dashed rgba(18,60,105,0.18)', borderRadius: 1, p: 1.4 }}>
              <Typography sx={{ color: '#637083', fontSize: 13 }}>No materials in this module yet.</Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {(module.materials || []).map((material) => {
                const materialUrl = getMaterialUrl(material);
                const Icon = material.material_type === 'youtube' || material.material_type === 'video'
                  ? OndemandVideoOutlined
                  : material.material_type === 'pdf' || /\.pdf(\?|#|$)/i.test(materialUrl || material.file_url || '')
                    ? PictureAsPdfOutlined
                    : LinkOutlined;
                return (
                  <Box key={material.id} sx={{ display: 'grid', gridTemplateColumns: '38px minmax(0, 1fr) auto', gap: 1, alignItems: 'center', border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1, p: 1, bgcolor: '#fff' }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: 1, bgcolor: '#eef3f8', color: '#123c69', display: 'grid', placeItems: 'center' }}><Icon fontSize="small" /></Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13.5 }}>{material.title}</Typography>
                      <Typography sx={{ color: '#637083', fontSize: 12 }}>{materialTypeLabels[material.material_type] || material.material_type} · {material.estimated_minutes || 15} min</Typography>
                    </Box>
                    <Button size="small" variant="outlined" disabled={!materialUrl} onClick={() => openMaterialInlineViewer(material)} endIcon={<OpenInNewOutlined sx={{ fontSize: 16 }} />} sx={{ color: 'primary.dark', fontWeight: 850 }}>Open</Button>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1 }}>Assignments</Typography>
          {(module.assignments || []).length === 0 ? (
            <Box sx={{ bgcolor: '#f8fbff', border: '1px dashed rgba(18,60,105,0.18)', borderRadius: 1, p: 1.4 }}>
              <Typography sx={{ color: '#637083', fontSize: 13 }}>No assignments in this module yet.</Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {(module.assignments || []).map((assignment) => (
                <Box key={assignment.id} sx={{ display: 'grid', gridTemplateColumns: '38px minmax(0, 1fr) auto', gap: 1, alignItems: 'center', border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1, p: 1, bgcolor: '#fff' }}>
                  <Box sx={{ width: 38, height: 38, borderRadius: 1, bgcolor: '#fff0e8', color: '#f05a28', display: 'grid', placeItems: 'center' }}><AssignmentOutlined fontSize="small" /></Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                      <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13.5 }}>{assignment.title}</Typography>
                      <Chip label={assignment.is_open ? 'Open' : 'Closed'} size="small" sx={{ height: 22, borderRadius: '999px', bgcolor: assignment.is_open ? '#e8f7ef' : '#eef3f8', border: `1px solid ${assignment.is_open ? '#7fd5ad' : '#cbd5e1'}`, color: 'primary.dark', fontWeight: 650, '& .MuiChip-label': { px: 1, color: '#082540' } }} />
                    </Stack>
                    <Typography sx={{ color: '#637083', fontSize: 12 }}>{assignment.due_at ? `Due ${formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })}` : 'No due date'} · {assignment.estimated_minutes || 30} min</Typography>
                  </Box>
                  <Button size="small" variant="outlined" onClick={() => setViewingAssignment({ ...assignment, module_title: module.title })} sx={{ color: 'primary.dark', fontWeight: 850 }}>Open</Button>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );

  const renderAssignment = (assignment) => (
    <Box key={assignment.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 110px 110px 90px 96px 36px' }, gap: 1.2, alignItems: 'center', border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1.2, p: 1.2, bgcolor: '#fff' }}>
      <Stack direction="row" spacing={1.4} alignItems="center" sx={{ minWidth: 0 }}>
        <Box sx={{ width: 54, height: 54, flex: '0 0 54px', borderRadius: 1.2, bgcolor: '#fff0e8', color: '#f05a28', display: 'grid', placeItems: 'center' }}>
          <AssignmentOutlined />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap' }}>
            <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 950, fontSize: 15 }}>{assignment.title}</Typography>
            <Chip
              label={assignment.is_open ? 'Open' : 'Closed'}
              size="small"
              sx={{
                height: 24,
                borderRadius: '999px',
                bgcolor: assignment.is_open ? '#e8f7ef' : '#eef3f8',
                border: `1px solid ${assignment.is_open ? '#7fd5ad' : '#cbd5e1'}`,
                color: 'primary.dark',
                fontWeight: 650,
                '& .MuiChip-label': { px: 1.1, color: '#082540' },
              }}
            />
          </Stack>
          <Typography sx={{ color: '#526273', fontSize: 13 }}>{assignment.module_title} · {assignment.due_at ? `Due ${formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })}` : 'No due date'} · {assignment.estimated_minutes ? `${assignment.estimated_minutes} min` : 'No time set'}</Typography>
        </Box>
      </Stack>
      {[
        [GroupOutlined, `${assignment.submitted_count || 0}/${assignment.expected_count || 0}`, 'Submitted', '#16805f'],
        [AccessTimeOutlined, assignment.pending_count || 0, 'Pending', '#f05a28'],
        [CalendarTodayOutlined, assignment.late_count || 0, 'Late', '#d93025'],
      ].map(([Icon, value, label, color]) => (
        <Stack key={label} direction="row" spacing={0.8} alignItems="center" sx={{ borderLeft: { lg: '1px solid rgba(18,60,105,0.1)' }, pl: { lg: 1.2 } }}>
          <Icon sx={{ color, fontSize: 20 }} />
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 950, lineHeight: 1 }}>{value}</Typography>
            <Typography sx={{ color: '#526273', fontSize: 12 }}>{label}</Typography>
          </Box>
        </Stack>
      ))}
      <Button variant="outlined" size="small" onClick={() => setAssignmentDialogOpen(true)} sx={{ height: 38, color: 'primary.dark', fontWeight: 900 }}>Open</Button>
      <IconButton size="small"><MoreHorizOutlined /></IconButton>
    </Box>
  );

  const renderAssignmentCard = (assignment, index = 0) => {
    const iconStyles = [
      { bgcolor: '#fff0e8', color: '#f05a28', icon: AssignmentOutlined },
      { bgcolor: '#f2eaff', color: '#7c3aed', icon: ArticleOutlined },
      { bgcolor: '#ffe8e8', color: '#d93025', icon: InsertDriveFileOutlined },
      { bgcolor: '#e8f1ff', color: '#1b6ef3', icon: SendOutlined },
      { bgcolor: '#e8f7ef', color: '#16805f', icon: AssignmentOutlined },
    ];
    const style = iconStyles[index % iconStyles.length];
    const AssignmentIcon = style.icon;
    const dueText = assignment.due_at
      ? `${assignment.is_open ? 'Due' : 'Closed'} ${formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })}`
      : 'No due date';

    return (
      <Box key={assignment.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 112px 112px 90px 96px 36px' }, gap: 1.2, alignItems: 'center', border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1.2, p: 1.2, bgcolor: '#fff', boxShadow: '0 8px 22px rgba(8,37,64,0.035)' }}>
        <Stack direction="row" spacing={1.4} alignItems="center" sx={{ minWidth: 0 }}>
          <Box sx={{ width: 54, height: 54, flex: '0 0 54px', borderRadius: 1.2, display: 'grid', placeItems: 'center', bgcolor: style.bgcolor, color: style.color }}>
            <AssignmentIcon />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap' }}>
              <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 950, fontSize: 15 }}>{assignment.title}</Typography>
              <Chip
                label={assignment.is_open ? 'Open' : 'Closed'}
                size="small"
                sx={{
                  height: 24,
                  borderRadius: '999px',
                  bgcolor: assignment.is_open ? '#e8f7ef' : '#eef3f8',
                  border: `1px solid ${assignment.is_open ? '#7fd5ad' : '#cbd5e1'}`,
                  color: 'primary.dark',
                  fontWeight: 650,
                  '& .MuiChip-label': { px: 1.1, color: '#082540' },
                }}
              />
            </Stack>
            <Typography sx={{ color: '#526273', fontSize: 13 }}>{assignment.module_title} · {dueText} · {assignment.estimated_minutes ? `${assignment.estimated_minutes} min` : 'No time set'}</Typography>
          </Box>
        </Stack>
        {[
          [GroupOutlined, `${assignment.submitted_count || 0}/${assignment.expected_count || 0}`, 'Submitted', '#16805f'],
          [AccessTimeOutlined, assignment.pending_count || 0, 'Pending', '#f05a28'],
          [CalendarTodayOutlined, assignment.late_count || 0, 'Late', '#d93025'],
        ].map(([Icon, value, label, color]) => (
          <Stack key={label} direction="row" spacing={0.8} alignItems="center" sx={{ borderLeft: { lg: '1px solid rgba(18,60,105,0.1)' }, pl: { lg: 1.2 } }}>
            <Icon sx={{ color, fontSize: 20 }} />
            <Box>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950, lineHeight: 1 }}>{value}</Typography>
              <Typography sx={{ color: '#526273', fontSize: 12 }}>{label}</Typography>
            </Box>
          </Stack>
        ))}
        <Button variant="outlined" size="small" onClick={() => setViewingAssignment(assignment)} sx={{ height: 38, color: 'primary.dark', fontWeight: 900 }}>Open</Button>
        <IconButton size="small" onClick={(event) => openAssignmentActionMenu(event, assignment)}><MoreVertOutlined /></IconButton>
      </Box>
    );
  };

  const renderAssignmentsLibrary = () => (
    <Stack spacing={1.4}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.4fr) repeat(3, minmax(150px, 1fr)) auto' }, gap: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search assignments..."
          value={assignmentFilters.search}
          onChange={(event) => setAssignmentFilters((current) => ({ ...current, search: event.target.value }))}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }}
        />
        <TextField select size="small" value={assignmentFilters.module} onChange={(event) => setAssignmentFilters((current) => ({ ...current, module: event.target.value }))}>
          <MenuItem value="all">All Modules</MenuItem>
          {modules.map((module) => <MenuItem key={module.id} value={String(module.id)}>{module.title}</MenuItem>)}
          <MenuItem value="unassigned">Unassigned</MenuItem>
        </TextField>
        <TextField select size="small" value={assignmentFilters.status} onChange={(event) => setAssignmentFilters((current) => ({ ...current, status: event.target.value }))}>
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="open">Open</MenuItem>
          <MenuItem value="closed">Closed</MenuItem>
        </TextField>
        <TextField select size="small" value={assignmentFilters.sort} onChange={(event) => setAssignmentFilters((current) => ({ ...current, sort: event.target.value }))}>
          <MenuItem value="due_date">Sort by: Due date</MenuItem>
          <MenuItem value="newest">Newest first</MenuItem>
          <MenuItem value="oldest">Oldest first</MenuItem>
        </TextField>
        <IconButton sx={{ width: 40, height: 40, border: '1px solid rgba(240,90,40,0.32)', borderRadius: 1, color: '#f05a28', bgcolor: '#fff4ef', justifySelf: { xs: 'start', md: 'end' } }}>
          <DashboardOutlined fontSize="small" />
        </IconButton>
      </Box>

      {filteredAssignmentRows.length ? (
        filteredAssignmentRows.map(renderAssignmentCard)
      ) : (
        <Box sx={{ border: '1px dashed rgba(18,60,105,0.2)', borderRadius: 1.2, p: 2, bgcolor: '#fbfdff' }}>
          <Typography sx={{ color: '#637083' }}>No assignments match the selected filters.</Typography>
        </Box>
      )}

      <Button
        fullWidth
        variant="outlined"
        startIcon={<AddOutlined />}
        onClick={() => setAssignmentDialogOpen(true)}
        sx={{ minHeight: 62, color: 'primary.dark', borderColor: 'rgba(18,60,105,0.16)', fontWeight: 900, bgcolor: '#fff', '& .MuiButton-startIcon': { color: '#f05a28' } }}
      >
        Create New Assignment
      </Button>
    </Stack>
  );

  if (viewingMaterial) {
    return (
      <MaterialInlineViewer
        material={viewingMaterial}
        onBack={() => setViewingMaterial(null)}
        backLabel="Back to course materials"
        subtitle={`${selectedCourse?.title || 'Course material'} | ${viewingMaterial.module_title || 'Course resource'}`}
      />
    );
  }

  return (
    <Stack spacing={2.2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={1.5}>
        <Box>
          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' } }}>Course Materials</Typography>
          <Typography sx={{ color: '#637083' }}>Organize learning content by course, module/week, materials, and submission-only assignments.</Typography>
        </Box>
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1, minWidth: { xs: '100%', lg: 380 } }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box component="img" src={courseImage || '/images/course1.jpg'} alt={selectedCourse?.title || 'Course'} sx={{ width: 88, height: 52, borderRadius: 1, objectFit: 'cover' }} />
            <TextField select size="small" label="Course" value={selectedCourseId} onChange={handleCourseChange} disabled={loading || courses.length === 0} sx={{ flex: 1 }}>
              {courses.map((course) => <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>)}
            </TextField>
          </Stack>
        </Box>
      </Stack>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {loading || contentLoading ? (
        <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
      ) : courses.length === 0 ? (
        <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}><Typography sx={{ color: 'primary.dark', fontWeight: 700 }}>Create a course before adding materials.</Typography></Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 290px', xl: 'minmax(0, 1fr) 330px' }, gap: { xs: 2, lg: 1.4, xl: 2 }, alignItems: 'start' }}>
          <Stack spacing={1.5}>
            <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, overflow: 'hidden', boxShadow: '0 18px 48px rgba(18,60,105,0.06)' }}>
              <Stack direction="row" spacing={2} sx={{ px: 1.6, py: 1.1, borderBottom: '1px solid rgba(18,60,105,0.1)', overflowX: 'auto' }}>
                {[
                  ['structure', 'Structure', ViewModuleOutlined, null],
                  ['materials', 'Materials', FolderCopyOutlined, allMaterials.length],
                  ['assignments', 'Assignments', AssignmentOutlined, allAssignments.length],
                ].map(([key, label, Icon, count]) => (
                  <Button key={key} type="button" startIcon={<Icon sx={{ fontSize: 17 }} />} onClick={() => setActiveContentTab(key)} sx={{ color: activeContentTab === key ? '#f05a28' : '#526273', borderBottom: activeContentTab === key ? '2px solid #f05a28' : '2px solid transparent', borderRadius: 0, px: 0.8, whiteSpace: 'nowrap' }}>
                    {label}{count !== null && <Chip label={count} size="small" sx={{ ml: 0.8, height: 20, fontWeight: 850 }} />}
                  </Button>
                ))}
              </Stack>

              {activeContentTab === 'structure' && (
                <Box sx={{ p: 1.6 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.2} sx={{ mb: 1.4 }}>
                    <Box>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Course Structure</Typography>
                      <Typography sx={{ color: '#637083', fontSize: 13 }}>{modules.length} module{modules.length === 1 ? '' : 's'} organized</Typography>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                      <TextField select size="small" label="Sort modules" value={moduleSort} onChange={(event) => setModuleSort(event.target.value)} sx={{ minWidth: 170 }}>
                        <MenuItem value="position">Module order</MenuItem>
                        <MenuItem value="newest">Newest first</MenuItem>
                        <MenuItem value="oldest">Oldest first</MenuItem>
                        <MenuItem value="title_az">Title A-Z</MenuItem>
                        <MenuItem value="title_za">Title Z-A</MenuItem>
                      </TextField>
                      <Button variant="outlined" size="small" onClick={() => setExpandedModuleId(null)}>Collapse all</Button>
                      <Button variant="contained" color="secondary" size="small" startIcon={<AddOutlined />} onClick={() => setModuleDialogOpen(true)}>Create Module</Button>
                    </Stack>
                  </Stack>
                  {modules.length === 0 ? (
                    <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>No modules yet. Create the first module to start organizing this course.</Typography>
                    </Box>
                  ) : (
                    <Stack sx={{ border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1.3, overflow: 'hidden' }}>
                      {modules.map((module, index) => (
                        <Box key={module.id} onClick={() => setExpandedModuleId(module.id)} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '70px minmax(220px, 1fr) 140px 140px 110px' }, gap: 1, alignItems: 'center', px: 1.4, py: 1.2, bgcolor: expandedModuleId === module.id ? '#f8fbff' : '#fff', borderBottom: index < modules.length - 1 ? '1px solid rgba(18,60,105,0.1)' : 'none', cursor: 'pointer' }}>
                          <Box sx={{ width: 44, height: 44, borderRadius: 1, bgcolor: '#f3f7fb', color: 'primary.dark', fontWeight: 950, display: 'grid', placeItems: 'center' }}>{String(module.position || index + 1).padStart(2, '0')}</Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                              <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 950 }}>{module.title}</Typography>
                              <Chip label={module.is_visible ? 'Visible' : 'Hidden'} size="small" sx={{ bgcolor: module.is_visible ? '#e8f7ef' : '#eef3f8', color: module.is_visible ? '#16805f' : '#526273', fontWeight: 800 }} />
                            </Stack>
                            <Typography noWrap sx={{ color: '#526273', fontSize: 12.5 }}>{module.description || 'No module description yet.'}</Typography>
                          </Box>
                          <Stack direction="row" spacing={0.8} alignItems="center"><FolderCopyOutlined sx={{ fontSize: 17, color: '#526273' }} /><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{(module.materials || []).length}</Typography><Typography sx={{ color: '#637083', fontSize: 12 }}>Materials</Typography></Stack>
                          <Stack direction="row" spacing={0.8} alignItems="center"><AssignmentOutlined sx={{ fontSize: 17, color: '#526273' }} /><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{(module.assignments || []).length}</Typography><Typography sx={{ color: '#637083', fontSize: 12 }}>Assignments</Typography></Stack>
                          <Stack direction="row" spacing={0.7} justifyContent={{ lg: 'flex-end' }} onClick={(event) => event.stopPropagation()}>
                            <IconButton size="small" onClick={() => toggleModuleVisibility(module)} sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}>
                              {module.is_visible ? <VisibilityOutlined fontSize="small" /> : <VisibilityOffOutlined fontSize="small" />}
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => deleteModule(module.id)} sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}><DeleteOutlined fontSize="small" /></IconButton>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                  {expandedModuleId && modules.find((module) => module.id === expandedModuleId) && renderStructureModuleContent(modules.find((module) => module.id === expandedModuleId))}
                  <Button fullWidth variant="outlined" color="secondary" startIcon={<AddOutlined />} onClick={() => setModuleDialogOpen(true)} sx={{ mt: 1.2, borderStyle: 'dashed' }}>Add Module</Button>
                </Box>
              )}

              {activeContentTab !== 'structure' && (
                <Box sx={{ p: 1.6 }}>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1 }}>{activeContentTab === 'assignments' ? 'Assignments' : 'All Materials'}</Typography>
                  {activeContentTab === 'assignments' ? (
                    renderAssignmentsLibrary()
                  ) : (
                    renderMaterialLibrary()
                  )}
                </Box>
              )}
            </Box>

          </Stack>

          <Stack spacing={1.4} sx={{ position: { lg: 'sticky' }, top: 92, minWidth: 0 }}>
            <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.8 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.2 }}>Course Overview</Typography>
              {[
                ['Total Modules', modules.length, ViewModuleOutlined],
                ['Total Materials', allMaterials.length, FolderCopyOutlined],
                ['Total Assignments', allAssignments.length, AssignmentOutlined],
                ['Enrolled Students', selectedCourseEnrollments, GroupOutlined],
              ].map(([label, value, Icon]) => (
                <Stack key={label} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.65 }}>
                  <Stack direction="row" spacing={0.8} alignItems="center"><Icon sx={{ color: '#526273', fontSize: 17 }} /><Typography sx={{ color: '#526273', fontSize: 13 }}>{label}</Typography></Stack>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{value}</Typography>
                </Stack>
              ))}
            </Box>
            <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.8 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.1 }}>Quick Actions</Typography>
              {[
                ['Add Material', () => setMaterialDialogOpen(true), FolderCopyOutlined],
                ['Create Assignment', () => setAssignmentDialogOpen(true), AssignmentOutlined],
                ['Create Module', () => setModuleDialogOpen(true), ViewModuleOutlined],
                ['Import Content', () => setMaterialDialogOpen(true), DownloadOutlined],
              ].map(([label, action, Icon]) => (
                <Button
                  key={label}
                  fullWidth
                  onClick={action}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '28px minmax(0, 1fr) 18px',
                    columnGap: 1,
                    alignItems: 'center',
                    justifyContent: 'stretch',
                    color: 'primary.dark',
                    borderBottom: '1px solid rgba(18,60,105,0.08)',
                    borderRadius: 0,
                    py: 1,
                    px: 0.4,
                    textAlign: 'left',
                    '& .MuiButton-startIcon, & .MuiButton-endIcon': { m: 0 },
                  }}
                  startIcon={<Icon sx={{ fontSize: 20 }} />}
                  endIcon={<ChevronRightOutlined sx={{ fontSize: 20 }} />}
                >
                  <Box component="span" sx={{ minWidth: 0, justifySelf: 'start', fontWeight: 850, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {label}
                  </Box>
                </Button>
              ))}
            </Box>
          </Stack>
        </Box>
      )}

      <Menu
        anchorEl={materialActionMenu.anchorEl}
        open={Boolean(materialActionMenu.anchorEl)}
        onClose={closeMaterialActionMenu}
      >
        <MenuItem onClick={() => runMaterialMenuAction('visibility')}>
          {materialActionMenu.material?.is_visible ? 'Hide material' : 'Show material'}
        </MenuItem>
        <MenuItem onClick={() => runMaterialMenuAction('delete')} sx={{ color: '#d93025' }}>
          Delete material
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={assignmentActionMenu.anchorEl}
        open={Boolean(assignmentActionMenu.anchorEl)}
        onClose={closeAssignmentActionMenu}
      >
        <MenuItem onClick={() => runAssignmentMenuAction('toggle-open')}>
          {assignmentActionMenu.assignment?.is_open ? 'Close assignment' : 'Open assignment'}
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(viewingAssignment)} onClose={() => setViewingAssignment(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>
          {viewingAssignment?.title || 'Assignment'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.4} sx={{ pt: 0.5 }}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              <Chip label={viewingAssignment?.is_open ? 'Open' : 'Closed'} size="small" sx={{ bgcolor: viewingAssignment?.is_open ? '#e8f7ef' : '#eef3f8', color: viewingAssignment?.is_open ? '#16805f' : '#526273', fontWeight: 850 }} />
              <Chip label={viewingAssignment?.module_title || 'Unassigned'} size="small" />
              <Chip label={viewingAssignment?.due_at ? formatTimestamp(viewingAssignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No due date'} size="small" />
            </Stack>
            <Typography sx={{ color: '#526273', whiteSpace: 'pre-wrap' }}>
              {viewingAssignment?.instructions || 'No instructions added yet.'}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1 }}>
              {[
                ['Submitted', `${viewingAssignment?.submitted_count || 0}/${viewingAssignment?.expected_count || 0}`, '#16805f'],
                ['Pending', viewingAssignment?.pending_count || 0, '#f05a28'],
                ['Late', viewingAssignment?.late_count || 0, '#d93025'],
              ].map(([label, value, color]) => (
                <Box key={label} sx={{ border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1, p: 1.2, bgcolor: '#fbfdff' }}>
                  <Typography sx={{ color, fontWeight: 950, fontSize: 20 }}>{value}</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 12 }}>{label}</Typography>
                </Box>
              ))}
            </Box>
            {viewingAssignment?.attachment_url && (
              <Button variant="outlined" component="a" href={viewingAssignment.attachment_url} target="_blank" rel="noreferrer" startIcon={<DownloadOutlined />}>
                Open attachment
              </Button>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {viewingAssignment && (
            <Button variant="outlined" disabled={saving} onClick={() => toggleAssignmentOpen(viewingAssignment)}>
              {viewingAssignment.is_open ? 'Close submissions' : 'Open submissions'}
            </Button>
          )}
          <Button variant="contained" color="secondary" onClick={() => setViewingAssignment(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={moduleDialogOpen} onClose={() => setModuleDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Create Module</DialogTitle>
        <DialogContent><Stack component="form" id="admin-create-module-form" onSubmit={createModule} spacing={1.3} sx={{ pt: 1 }}><TextField label="Module title" value={moduleForm.title} onChange={(event) => setModuleForm((current) => ({ ...current, title: event.target.value }))} required /><TextField label="Description" value={moduleForm.description} onChange={(event) => setModuleForm((current) => ({ ...current, description: event.target.value }))} multiline minRows={2} /><TextField type="number" label="Order" value={moduleForm.position} onChange={(event) => setModuleForm((current) => ({ ...current, position: event.target.value }))} /><FormControlLabel control={<Switch checked={moduleForm.is_visible} onChange={(event) => setModuleForm((current) => ({ ...current, is_visible: event.target.checked }))} />} label="Visible to students" /></Stack></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button variant="outlined" onClick={() => setModuleDialogOpen(false)}>Cancel</Button><Button type="submit" form="admin-create-module-form" variant="contained" color="secondary" disabled={saving || !moduleForm.title.trim()}>Create module</Button></DialogActions>
      </Dialog>

      <Dialog open={materialDialogOpen} onClose={() => setMaterialDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Add Material</DialogTitle>
        <DialogContent><Stack component="form" id="admin-create-material-form" onSubmit={createMaterial} spacing={1.3} sx={{ pt: 1 }}><TextField label="Material title" value={materialForm.title} onChange={(event) => setMaterialForm((current) => ({ ...current, title: event.target.value }))} placeholder="Leave blank to use attached filename" /><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.2 }}><TextField select label="Material type" value={materialForm.material_type} onChange={(event) => setMaterialForm((current) => ({ ...current, material_type: event.target.value }))}>{materialTypeOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField><TextField select label="Module / Week" value={materialForm.module_id} onChange={(event) => setMaterialForm((current) => ({ ...current, module_id: event.target.value }))}><MenuItem value="">Unassigned</MenuItem>{modules.map((module) => <MenuItem key={module.id} value={String(module.id)}>{module.title}</MenuItem>)}</TextField><TextField label="External link" value={materialForm.external_url} onChange={(event) => setMaterialForm((current) => ({ ...current, external_url: event.target.value }))} /><TextField type="number" label="Estimated minutes" value={materialForm.estimated_minutes} onChange={(event) => setMaterialForm((current) => ({ ...current, estimated_minutes: event.target.value }))} inputProps={{ min: 1 }} /></Box><Button variant="outlined" component="label">{selectedMaterialFile ? selectedMaterialFile.name : 'Choose file'}<input type="file" hidden onChange={(event) => setSelectedMaterialFile(event.target.files?.[0] || null)} accept={lmsFileAccept} /></Button><TextField label="Description" value={materialForm.description} onChange={(event) => setMaterialForm((current) => ({ ...current, description: event.target.value }))} multiline minRows={2} /><FormControlLabel control={<Switch checked={materialForm.is_visible} onChange={(event) => setMaterialForm((current) => ({ ...current, is_visible: event.target.checked }))} />} label="Visible to students" /></Stack></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button variant="outlined" onClick={() => setMaterialDialogOpen(false)}>Cancel</Button><Button type="submit" form="admin-create-material-form" variant="contained" color="secondary" disabled={saving || uploading}>{uploading ? 'Uploading...' : 'Add material'}</Button></DialogActions>
      </Dialog>

      <Dialog open={assignmentDialogOpen} onClose={() => setAssignmentDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Create Assignment</DialogTitle>
        <DialogContent><Stack component="form" id="admin-create-assignment-form" onSubmit={createAssignment} spacing={1.3} sx={{ pt: 1 }}><TextField label="Assignment title" value={assignmentForm.title} onChange={(event) => setAssignmentForm((current) => ({ ...current, title: event.target.value }))} required /><TextField label="Instructions" value={assignmentForm.instructions} onChange={(event) => setAssignmentForm((current) => ({ ...current, instructions: event.target.value }))} multiline minRows={3} /><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.2 }}><TextField select label="Module / Week" value={assignmentForm.module_id} onChange={(event) => setAssignmentForm((current) => ({ ...current, module_id: event.target.value }))}><MenuItem value="">Unassigned</MenuItem>{modules.map((module) => <MenuItem key={module.id} value={String(module.id)}>{module.title}</MenuItem>)}</TextField><TextField type="number" label="Estimated minutes" value={assignmentForm.estimated_minutes} onChange={(event) => setAssignmentForm((current) => ({ ...current, estimated_minutes: event.target.value }))} inputProps={{ min: 1 }} /><TextField type="date" label="Due date" value={assignmentForm.due_date} onChange={(event) => setAssignmentForm((current) => ({ ...current, due_date: event.target.value }))} InputLabelProps={{ shrink: true }} /></Box><Button variant="outlined" component="label">{selectedAssignmentFile ? selectedAssignmentFile.name : 'Choose file'}<input type="file" hidden onChange={(event) => setSelectedAssignmentFile(event.target.files?.[0] || null)} accept={lmsFileAccept} /></Button><FormControlLabel control={<Switch checked={assignmentForm.is_open} onChange={(event) => setAssignmentForm((current) => ({ ...current, is_open: event.target.checked }))} />} label="Open for submissions" /></Stack></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button variant="outlined" onClick={() => setAssignmentDialogOpen(false)}>Cancel</Button><Button type="submit" form="admin-create-assignment-form" variant="contained" color="secondary" disabled={saving || uploading || !assignmentForm.title.trim()}>{uploading ? 'Uploading...' : 'Create assignment'}</Button></DialogActions>
      </Dialog>
    </Stack>
  );
}

function AdminAssignmentsPane({ initialCourseId = '', onOpenMaterials, onAdminToast, scope = 'admin' }) {
  const [assignments, setAssignments] = React.useState([]);
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  useAdminPaneToast(message, setMessage, error, setError, onAdminToast);
  const [filters, setFilters] = React.useState({ course_id: initialCourseId ? String(initialCourseId) : '', status: 'all', search: '', due: 'all', sort: 'due_earliest' });
  const [activeTab, setActiveTab] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedAssignmentId, setSelectedAssignmentId] = React.useState(null);
  const [deletingAssignmentId, setDeletingAssignmentId] = React.useState(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = React.useState(false);
  const [assignmentModules, setAssignmentModules] = React.useState([]);
  const [selectedAssignmentFile, setSelectedAssignmentFile] = React.useState(null);
  const [savingAssignment, setSavingAssignment] = React.useState(false);
  const [assignmentForm, setAssignmentForm] = React.useState({
    course_id: initialCourseId ? String(initialCourseId) : '',
    title: '',
    instructions: '',
    module_id: '',
    due_date: '',
    is_open: true,
    estimated_minutes: 30,
  });
  const apiScope = scope === 'teacher' ? 'teacher' : 'admin';

  React.useEffect(() => {
    if (initialCourseId) {
      setFilters((current) => ({ ...current, course_id: String(initialCourseId) }));
    }
  }, [initialCourseId]);

  const loadAssignments = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        status: ['open', 'closed'].includes(filters.status) ? filters.status : 'all',
      });
      if (filters.course_id) params.set('course_id', filters.course_id);

      const [assignmentsResponse, coursesResponse] = await Promise.all([
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/assignments?${params.toString()}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/courses`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
      ]);
      const assignmentsData = await assignmentsResponse.json();
      const coursesData = await coursesResponse.json();
      if (!assignmentsResponse.ok) throw new Error(assignmentsData.detail || 'Unable to load assignments');
      if (!coursesResponse.ok) throw new Error(coursesData.detail || 'Unable to load courses');
      setAssignments(assignmentsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [apiScope, filters.course_id, filters.status]);

  React.useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.course_id, filters.status, filters.due, filters.sort, activeTab]);

  const nowSeconds = Math.floor(Date.now() / 1000);
  const sevenDaysSeconds = nowSeconds + (7 * 24 * 60 * 60);

  const getAssignmentState = React.useCallback((assignment) => {
    if (!assignment.is_open) return 'closed';
    if (assignment.due_at && assignment.due_at < nowSeconds) return 'overdue';
    if (assignment.due_at && assignment.due_at <= sevenDaysSeconds) return 'due_soon';
    return 'open';
  }, [nowSeconds, sevenDaysSeconds]);

  const filteredAssignments = React.useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return assignments
      .filter((assignment) => {
        const state = getAssignmentState(assignment);
        if (activeTab === 'open' && !assignment.is_open) return false;
        if (activeTab !== 'all' && activeTab !== 'open' && state !== activeTab) return false;
        if (filters.status === 'open' && !assignment.is_open) return false;
        if (filters.status === 'closed' && assignment.is_open) return false;
        if (filters.status === 'overdue' && state !== 'overdue') return false;
        if (filters.status === 'due_soon' && state !== 'due_soon') return false;
        if (filters.due === 'with_due' && !assignment.due_at) return false;
        if (filters.due === 'no_due' && assignment.due_at) return false;
        if (query) {
          const haystack = [
            assignment.title,
            assignment.instructions,
            assignment.course?.title,
            assignment.module?.title,
            assignment.teacher?.full_name,
            assignment.teacher?.email,
          ].filter(Boolean).join(' ').toLowerCase();
          if (!haystack.includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sort === 'newest') return (b.created_at || 0) - (a.created_at || 0);
        if (filters.sort === 'submissions') return (b.submissions?.total || 0) - (a.submissions?.total || 0);
        if (filters.sort === 'due_latest') return (b.due_at || 0) - (a.due_at || 0);
        return (a.due_at || Number.MAX_SAFE_INTEGER) - (b.due_at || Number.MAX_SAFE_INTEGER);
      });
  }, [assignments, activeTab, filters, getAssignmentState]);

  const selectedAssignment = React.useMemo(
    () => assignments.find((assignment) => assignment.id === selectedAssignmentId) || null,
    [assignments, selectedAssignmentId]
  );

  const rowsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / rowsPerPage));
  const pagedAssignments = filteredAssignments.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const totals = assignments.reduce((summary, assignment) => ({
    assignments: summary.assignments + 1,
    submitted: summary.submitted + (assignment.submissions?.total || 0),
    late: summary.late + (assignment.submissions?.late || 0),
    upcoming: summary.upcoming + (getAssignmentState(assignment) === 'due_soon' ? 1 : 0),
    open: summary.open + (assignment.is_open ? 1 : 0),
    closed: summary.closed + (!assignment.is_open ? 1 : 0),
    overdue: summary.overdue + (getAssignmentState(assignment) === 'overdue' ? 1 : 0),
  }), { assignments: 0, submitted: 0, late: 0, upcoming: 0, open: 0, closed: 0, overdue: 0 });

  const upcomingAssignments = assignments
    .filter((assignment) => assignment.due_at && assignment.is_open && assignment.due_at >= nowSeconds)
    .sort((a, b) => a.due_at - b.due_at)
    .slice(0, 4);

  const assignmentStatus = (assignment) => {
    const state = getAssignmentState(assignment);
    if (state === 'closed') return { label: 'Closed', color: '#526273', bgcolor: '#edf1f5' };
    if (state === 'overdue') return { label: 'Overdue', color: '#d93025', bgcolor: '#fde7e7' };
    if (state === 'due_soon') return { label: 'Due soon', color: '#b86600', bgcolor: '#fff2dd' };
    return { label: 'Open', color: '#16805f', bgcolor: '#e1f6ec' };
  };

  const exportAssignments = () => {
    const rows = filteredAssignments.map((assignment) => [
      assignment.title,
      assignment.course?.title || '',
      assignment.module?.title || '',
      formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' }),
      assignment.submissions?.total || 0,
      assignment.submissions?.late || 0,
    ]);
    const csv = [['Assignment', 'Course', 'Module', 'Due Date', 'Submissions', 'Late'], ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'assignments-report.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const openMaterialsPane = () => {
    if (onOpenMaterials) {
      onOpenMaterials(filters.course_id || courses[0]?.id || '');
      return;
    }
    setMessage('Open Course Materials to create assignments inside a course module.');
  };

  const loadAssignmentModules = async (courseId) => {
    if (!courseId) {
      setAssignmentModules([]);
      return;
    }
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/courses/${courseId}/content`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load course modules');
      setAssignmentModules(sortModules(data.modules || []));
    } catch (err) {
      setAssignmentModules([]);
      setError(err.message);
    }
  };

  const openAssignmentDialog = async () => {
    const nextCourseId = filters.course_id || courses[0]?.id || '';
    const courseId = nextCourseId ? String(nextCourseId) : '';
    setAssignmentForm({
      course_id: courseId,
      title: '',
      instructions: '',
      module_id: '',
      due_date: '',
      is_open: true,
      estimated_minutes: 30,
    });
    setSelectedAssignmentFile(null);
    setAssignmentDialogOpen(true);
    await loadAssignmentModules(courseId);
  };

  const changeAssignmentCourse = async (courseId) => {
    setAssignmentForm((current) => ({ ...current, course_id: courseId, module_id: '' }));
    await loadAssignmentModules(courseId);
  };

  const createAssignment = async (event) => {
    event.preventDefault();
    if (!assignmentForm.course_id) {
      setError('Choose a course before creating an assignment.');
      return;
    }
    setSavingAssignment(true);
    setError('');
    setMessage('');
    try {
      let attachmentUrl = '';
      let attachmentName = '';
      if (selectedAssignmentFile) {
        const uploadBody = new FormData();
        uploadBody.append('file', selectedAssignmentFile);
        const uploadResponse = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/courses/${assignmentForm.course_id}/assignments/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: uploadBody,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.detail || 'Unable to upload assignment file');
        attachmentUrl = uploadData.file_url;
        attachmentName = uploadData.file_name;
      }

      const due_at = assignmentForm.due_date ? Math.floor(new Date(`${assignmentForm.due_date}T23:59:00`).getTime() / 1000) : null;
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/courses/${assignmentForm.course_id}/assignments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: assignmentForm.title,
          instructions: assignmentForm.instructions,
          module_id: assignmentForm.module_id ? Number(assignmentForm.module_id) : null,
          attachment_url: attachmentUrl || null,
          attachment_name: attachmentName || null,
          due_at,
          is_open: assignmentForm.is_open,
          estimated_minutes: Number(assignmentForm.estimated_minutes) || 30,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to create assignment');
      setAssignmentDialogOpen(false);
      setSelectedAssignmentFile(null);
      setMessage('Assignment created.');
      await loadAssignments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingAssignment(false);
    }
  };

  const deleteAssignment = async (assignment) => {
    const confirmed = window.confirm(`Delete "${assignment.title}"? This will also remove student submissions for this assignment.`);
    if (!confirmed) return;
    setDeletingAssignmentId(assignment.id);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${apiScope}/assignments/${assignment.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to delete assignment');
      setAssignments((current) => current.filter((item) => item.id !== assignment.id));
      if (selectedAssignmentId === assignment.id) setSelectedAssignmentId(null);
      setMessage('Assignment deleted.');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingAssignmentId(null);
    }
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' } }}>
              Assignments
            </Typography>
            <AssignmentOutlined sx={{ color: '#8aa0b8' }} />
          </Stack>
          <Typography sx={{ color: '#637083', mt: 0.8 }}>
            View assignments across courses, track due dates, and monitor submissions.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' }, rowGap: 1 }}>
          <Button variant="outlined" startIcon={<DownloadOutlined />} onClick={exportAssignments}>Export</Button>
          <Button variant="contained" color="secondary" startIcon={<AddOutlined />} onClick={openAssignmentDialog}>Create Assignment</Button>
          <IconButton sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }} onClick={loadAssignments}><MoreHorizOutlined /></IconButton>
        </Stack>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
      {message && <Alert severity="info" onClose={() => setMessage('')}>{message}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 1.5, lg: 1.1, xl: 1.5 } }}>
        {[
          ['Total Assignments', totals.assignments, 'All courses', AssignmentOutlined, '#8b5cf6', '#f0e8ff'],
          ['Submitted', totals.submitted, 'Total received', CheckCircleOutlined, '#16805f', '#e1f6ec'],
          ['Late Submissions', totals.late, 'Marked late', AccessTimeOutlined, '#f05a28', '#fff0e8'],
          ['Upcoming Due', totals.upcoming, 'Due in next 7 days', CalendarTodayOutlined, '#1b6ef3', '#e8f1ff'],
        ].map(([label, value, helper, Icon, color, bg]) => (
          <Box key={label} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff', boxShadow: '0 12px 30px rgba(8,37,64,0.05)', display: 'flex', alignItems: 'center', gap: 1.6 }}>
            <Avatar variant="rounded" sx={{ bgcolor: bg, color, width: 58, height: 58 }}><Icon /></Avatar>
            <Box>
              <Typography sx={{ color: '#637083', fontSize: 13, fontWeight: 800 }}>{label}</Typography>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: '2rem', lineHeight: 1.05 }}>{value}</Typography>
              <Typography sx={{ color: '#637083', fontSize: 12 }}>{helper}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 290px', xl: 'minmax(0, 1fr) 320px' }, gap: { xs: 2, lg: 1.4, xl: 2 } }}>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff', boxShadow: '0 12px 30px rgba(8,37,64,0.04)' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: '1.6fr repeat(4, 1fr)' }, gap: 1.2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search assignments..."
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }}
              />
              <TextField select size="small" label="Course" value={filters.course_id} onChange={(event) => setFilters((current) => ({ ...current, course_id: event.target.value }))}>
                <MenuItem value="">All Courses</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>
                ))}
              </TextField>
              <TextField select size="small" label="Status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
                <MenuItem value="due_soon">Due Soon</MenuItem>
                <MenuItem value="overdue">Overdue</MenuItem>
              </TextField>
              <TextField select size="small" label="Due Date" value={filters.due} onChange={(event) => setFilters((current) => ({ ...current, due: event.target.value }))}>
                <MenuItem value="all">All Dates</MenuItem>
                <MenuItem value="with_due">Has Due Date</MenuItem>
                <MenuItem value="no_due">No Due Date</MenuItem>
              </TextField>
              <TextField select size="small" label="Sort by" value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}>
                <MenuItem value="due_earliest">Due Date: Earliest</MenuItem>
                <MenuItem value="due_latest">Due Date: Latest</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="submissions">Most Submissions</MenuItem>
              </TextField>
            </Box>
          </Box>

          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, bgcolor: '#fff', overflow: 'hidden', boxShadow: '0 12px 30px rgba(8,37,64,0.04)', minWidth: 0 }}>
            <Stack direction="row" spacing={2.4} sx={{ px: 2, pt: 1.6, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
              {[
                ['all', 'All', assignments.length],
                ['open', 'Open', totals.open],
                ['due_soon', 'Due Soon', totals.upcoming],
                ['overdue', 'Overdue', totals.overdue],
                ['closed', 'Closed', totals.closed],
              ].map(([key, label, count]) => (
                <Button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  sx={{
                    color: activeTab === key ? '#f05a28' : '#526273',
                    borderBottom: activeTab === key ? '2px solid #f05a28' : '2px solid transparent',
                    borderRadius: 0,
                    pb: 1.2,
                    px: 0,
                    minWidth: 0,
                  }}
                >
                  {label}
                  <Chip size="small" label={count} sx={{ ml: 0.8, height: 22, bgcolor: activeTab === key ? '#ffe8de' : '#e8eef5', color: activeTab === key ? '#f05a28' : '#637083', fontWeight: 900 }} />
                </Button>
              ))}
            </Stack>

            <Box sx={{ ...adminTableHeaderSx, gridTemplateColumns: { lg: 'minmax(190px, 1.3fr) minmax(120px, 0.8fr) 104px 120px 72px', xl: 'minmax(230px, 1.3fr) minmax(140px, 0.8fr) 120px 150px 84px' } }}>
              {['Assignment', 'Course', 'Due Date', 'Submissions', 'Actions'].map((label) => (
                <Box component="span" key={label} className="admin-table-heading" sx={{ textAlign: label === 'Actions' ? 'center' : 'left' }}>{label}</Box>
              ))}
            </Box>

            {loading ? (
              <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
            ) : pagedAssignments.length === 0 ? (
              <Box sx={{ p: 2.2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>No assignments match these filters yet.</Typography>
              </Box>
            ) : (
              <Stack divider={<Divider />}>
                {pagedAssignments.map((assignment, index) => {
                  const submittedCount = assignment.submissions?.total || 0;
                  const expectedCount = assignment.submissions?.expected || 0;
                  const lateCount = assignment.submissions?.late || 0;
                  const progress = expectedCount ? Math.min(100, Math.round((submittedCount / expectedCount) * 100)) : 0;
                  const iconPalette = [
                    ['#f0e8ff', '#8b5cf6'],
                    ['#fff0e8', '#f05a28'],
                    ['#fde7e7', '#ef4444'],
                    ['#e1f6ec', '#16805f'],
                    ['#e8f1ff', '#1b6ef3'],
                  ][index % 5];
                  return (
                    <Box
                      key={assignment.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'minmax(190px, 1.3fr) minmax(120px, 0.8fr) 104px 120px 72px', xl: 'minmax(230px, 1.3fr) minmax(140px, 0.8fr) 120px 150px 84px' },
                        gap: { xs: 1.2, lg: 1 },
                        alignItems: 'center',
                        px: 1.5,
                        py: 1.6,
                        bgcolor: index % 2 === 0 ? '#fff' : '#fbfdff',
                      }}
                    >
                      <Stack direction="row" spacing={1.4} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar variant="rounded" sx={{ bgcolor: iconPalette[0], color: iconPalette[1], width: 50, height: 50 }}>
                          <AssignmentOutlined />
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: 'primary.dark', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{assignment.title}</Typography>
                          <Typography sx={{ color: '#526273', fontSize: 12.5 }}>by {assignment.teacher?.full_name || 'Unassigned'}</Typography>
                          {assignment.module?.title && <Typography sx={{ color: '#637083', fontSize: 12 }}>{assignment.module.title}</Typography>}
                        </Box>
                      </Stack>
                      <Typography noWrap sx={{ color: '#123c69', fontSize: 13.5 }}>{assignment.course?.title || 'No course'}</Typography>
                      <Box>
                        <Typography sx={{ color: '#123c69', fontSize: 13 }}>{formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
                        <Typography sx={{ color: '#637083', fontSize: 11 }}>11:59 PM</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ color: 'primary.dark', fontSize: 13, fontWeight: 900 }}>
                          {submittedCount} / {expectedCount || '-'}
                          <Box component="span" sx={{ color: '#637083', ml: 0.6, fontWeight: 650 }}>submitted</Box>
                        </Typography>
                        <Box sx={{ height: 4, bgcolor: '#e8eef5', borderRadius: 999, mt: 0.8, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${progress}%`, bgcolor: lateCount ? '#f59e0b' : '#16a57a' }} />
                        </Box>
                        {lateCount ? <Typography sx={{ color: '#d93025', fontSize: 11, mt: 0.4, fontWeight: 750 }}>{lateCount} late</Typography> : null}
                      </Box>
                      <Stack direction="row" spacing={0.6} justifyContent={{ xs: 'flex-start', lg: 'center' }} alignItems="center" sx={{ minWidth: { lg: 84 } }}>
                        <IconButton size="small" aria-label="View assignment" onClick={() => setSelectedAssignmentId(assignment.id)} sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}><VisibilityOutlined fontSize="small" /></IconButton>
                        <IconButton
                          size="small"
                          aria-label="Delete assignment"
                          disabled={deletingAssignmentId === assignment.id}
                          onClick={() => deleteAssignment(assignment)}
                          sx={{ border: '1px solid rgba(217,48,37,0.28)', borderRadius: 1, color: '#d93025', '&:hover': { bgcolor: '#fde7e7' } }}
                        >
                          <DeleteOutlined fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}

            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ px: 2, py: 1.6, borderTop: '1px solid rgba(18,60,105,0.08)' }}>
              <Typography sx={{ color: '#526273', fontSize: 13 }}>
                Showing {filteredAssignments.length === 0 ? 0 : ((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredAssignments.length)} of {filteredAssignments.length} assignments
              </Typography>
              <Stack direction="row" spacing={0.8}>
                {Array.from({ length: totalPages }).slice(0, 4).map((_, pageIndex) => (
                  <Button key={pageIndex + 1} variant={currentPage === pageIndex + 1 ? 'contained' : 'outlined'} onClick={() => setCurrentPage(pageIndex + 1)} sx={{ minWidth: 38 }}>{pageIndex + 1}</Button>
                ))}
                <Button variant="outlined" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage >= totalPages}><ChevronRightOutlined /></Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>

        <Stack spacing={2}>
          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, bgcolor: '#fff', p: 2, boxShadow: '0 12px 30px rgba(8,37,64,0.04)' }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1.5 }}>Assignment Summary</Typography>
            <Stack spacing={1.1}>
              {[
                ['Open', totals.open, '#16805f'],
                ['Due Soon', totals.upcoming, '#f59e0b'],
                ['Overdue', totals.overdue, '#ef4444'],
                ['Closed', totals.closed, '#8aa0b8'],
              ].map(([label, value, color]) => {
                const width = totals.assignments ? Math.round((value / totals.assignments) * 100) : 0;
                return (
                  <Box key={label}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: '#526273', fontSize: 13 }}>{label}</Typography>
                      <Typography sx={{ color: 'primary.dark', fontSize: 13, fontWeight: 900 }}>{value} ({width}%)</Typography>
                    </Stack>
                    <Box sx={{ height: 6, bgcolor: '#edf2f7', borderRadius: 999, mt: 0.7, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${width}%`, bgcolor: color }} />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
            <Button fullWidth variant="outlined" sx={{ mt: 2 }} onClick={exportAssignments} startIcon={<DownloadOutlined />}>View Report</Button>
          </Box>

          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, bgcolor: '#fff', p: 2, boxShadow: '0 12px 30px rgba(8,37,64,0.04)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Upcoming Due</Typography>
              <Button size="small" onClick={() => setFilters((current) => ({ ...current, status: 'due_soon' }))}>View all</Button>
            </Stack>
            <Stack spacing={1.2}>
              {upcomingAssignments.length === 0 ? (
                <Typography sx={{ color: '#637083', fontSize: 13 }}>No upcoming due dates.</Typography>
              ) : upcomingAssignments.map((assignment) => (
                <Stack key={assignment.id} direction="row" spacing={1.1} alignItems="center">
                  <Avatar variant="rounded" sx={{ bgcolor: '#edf3fb', color: 'primary.dark', width: 36, height: 36 }}><AssignmentOutlined fontSize="small" /></Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: 'primary.dark', fontSize: 13, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{assignment.title}</Typography>
                    <Typography sx={{ color: '#637083', fontSize: 12 }}>{formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Box>

          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, bgcolor: '#fff', p: 2, boxShadow: '0 12px 30px rgba(8,37,64,0.04)' }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Quick Actions</Typography>
            <Stack divider={<Divider />} spacing={0}>
              {[
                ['Create Assignment', AddOutlined, openAssignmentDialog],
                ['Export Assignments', DownloadOutlined, exportAssignments],
                ['Refresh Assignments', FilterAltOffOutlined, loadAssignments],
              ].map(([label, Icon, onClick]) => (
                <Button key={label} onClick={onClick} endIcon={<ChevronRightOutlined />} sx={{ justifyContent: 'space-between', color: 'primary.dark', py: 1.2 }}>
                  <Stack direction="row" spacing={1} alignItems="center"><Icon fontSize="small" /> <span>{label}</span></Stack>
                </Button>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Dialog open={assignmentDialogOpen} onClose={() => !savingAssignment && setAssignmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Create Assignment</DialogTitle>
        <DialogContent>
          <Stack component="form" id="admin-assignments-create-form" onSubmit={createAssignment} spacing={1.4} sx={{ pt: 1 }}>
            <TextField
              select
              label="Course"
              value={assignmentForm.course_id}
              onChange={(event) => changeAssignmentCourse(event.target.value)}
              required
            >
              {courses.map((course) => (
                <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Assignment title"
              value={assignmentForm.title}
              onChange={(event) => setAssignmentForm((current) => ({ ...current, title: event.target.value }))}
              required
            />
            <TextField
              label="Instructions"
              value={assignmentForm.instructions}
              onChange={(event) => setAssignmentForm((current) => ({ ...current, instructions: event.target.value }))}
              multiline
              minRows={3}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr 1fr' }, gap: 1.2 }}>
              <TextField
                select
                label="Module / Week"
                value={assignmentForm.module_id}
                onChange={(event) => setAssignmentForm((current) => ({ ...current, module_id: event.target.value }))}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {assignmentModules.map((module) => (
                  <MenuItem key={module.id} value={String(module.id)}>{module.title}</MenuItem>
                ))}
              </TextField>
              <TextField
                type="number"
                label="Estimated minutes"
                value={assignmentForm.estimated_minutes}
                onChange={(event) => setAssignmentForm((current) => ({ ...current, estimated_minutes: event.target.value }))}
                inputProps={{ min: 1 }}
              />
              <TextField
                type="date"
                label="Due date"
                value={assignmentForm.due_date}
                onChange={(event) => setAssignmentForm((current) => ({ ...current, due_date: event.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Button variant="outlined" component="label" disabled={savingAssignment}>
              {selectedAssignmentFile ? selectedAssignmentFile.name : 'Choose file'}
              <input type="file" hidden onChange={(event) => setSelectedAssignmentFile(event.target.files?.[0] || null)} accept={lmsFileAccept} />
            </Button>
            <FormControlLabel
              control={<Switch checked={assignmentForm.is_open} onChange={(event) => setAssignmentForm((current) => ({ ...current, is_open: event.target.checked }))} />}
              label="Open for submissions"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setAssignmentDialogOpen(false)} disabled={savingAssignment}>Cancel</Button>
          <Button type="submit" form="admin-assignments-create-form" variant="contained" color="secondary" disabled={savingAssignment || !assignmentForm.course_id || !assignmentForm.title.trim()}>
            {savingAssignment ? 'Creating...' : 'Create assignment'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(selectedAssignment)}
        onClose={() => setSelectedAssignmentId(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { position: 'relative' } }}
      >
        {selectedAssignment && (
          <>
            <IconButton
              aria-label="Close assignment details"
              onClick={() => setSelectedAssignmentId(null)}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                color: '#d93025',
                zIndex: 1,
                '&:hover': { bgcolor: '#fde7e7' },
              }}
            >
              <CloseOutlined />
            </IconButton>
            <DialogTitle sx={{ color: 'primary.dark', fontWeight: 900, pr: 6 }}>{selectedAssignment.title}</DialogTitle>
            <DialogContent>
              <Stack spacing={1.4}>
                <Typography sx={{ color: '#526273' }}>{selectedAssignment.instructions || 'No instructions provided.'}</Typography>
                <Divider />
                <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>Course: {selectedAssignment.course?.title || 'No course'}</Typography>
                <Typography sx={{ color: '#526273' }}>Module: {selectedAssignment.module?.title || 'Unassigned'}</Typography>
                <Typography sx={{ color: '#526273' }}>Due: {formatTimestamp(selectedAssignment.due_at, { month: 'long', day: 'numeric', year: 'numeric' })}</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                  {[
                    ['Submitted', selectedAssignment.submissions?.total || 0],
                    ['Late', selectedAssignment.submissions?.late || 0],
                  ].map(([label, value]) => (
                    <Box key={label} sx={{ bgcolor: '#f4f7fb', borderRadius: 1, p: 1.2, textAlign: 'center' }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: '1.4rem' }}>{value}</Typography>
                      <Typography sx={{ color: '#637083', fontSize: 12 }}>{label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" color="secondary" onClick={openMaterialsPane}>Open in Course Materials</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
}

function AdminAnnouncementsPane({ onAdminDataChanged, initialCourseId = '', onAdminToast, scope = 'admin' }) {
  const [announcements, setAnnouncements] = React.useState([]);
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  useAdminPaneToast(message, setMessage, error, setError, onAdminToast);
  const [selectedAnnouncementFile, setSelectedAnnouncementFile] = React.useState(null);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [filters, setFilters] = React.useState({ audience: initialCourseId ? 'course' : 'all', urgent: 'all', course_id: initialCourseId ? String(initialCourseId) : '' });
  const isTeacherScope = scope === 'teacher';
  const announcementsPath = isTeacherScope ? '/teacher/announcements' : '/admin/announcements';
  const coursesPath = isTeacherScope ? '/teacher/courses' : '/admin/courses';
  const uploadPath = isTeacherScope ? '/teacher/announcements/upload' : '/admin/announcements/upload';
  const [form, setForm] = React.useState({ title: '', body: '', audience: isTeacherScope ? 'course' : 'platform', course_id: '', is_urgent: false });

  React.useEffect(() => {
    if (initialCourseId) {
      setFilters((current) => ({ ...current, audience: 'course', course_id: String(initialCourseId) }));
    }
  }, [initialCourseId]);

  const loadAnnouncements = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        audience: filters.audience,
        urgent: filters.urgent,
      });
      if (filters.course_id) params.set('course_id', filters.course_id);
      const [announcementsResponse, coursesResponse] = await Promise.all([
        fetch(`${apiBaseUrl.replace(/\/$/, '')}${announcementsPath}?${params.toString()}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${apiBaseUrl.replace(/\/$/, '')}${coursesPath}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
      ]);
      const announcementsData = await announcementsResponse.json();
      const coursesData = await coursesResponse.json();
      if (!announcementsResponse.ok) throw new Error(announcementsData.detail || 'Unable to load announcements');
      if (!coursesResponse.ok) throw new Error(coursesData.detail || 'Unable to load courses');
      setAnnouncements(announcementsData);
      setCourses(coursesData);
      if (isTeacherScope) {
        setForm((current) => ({ ...current, audience: 'course', course_id: current.course_id || (coursesData[0]?.id ? String(coursesData[0].id) : '') }));
      }
      setSelectedAnnouncementId((current) => current || announcementsData[0]?.id || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, announcementsPath, coursesPath, isTeacherScope]);

  React.useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const totals = announcements.reduce((summary, announcement) => ({
    total: summary.total + 1,
    platform: summary.platform + (announcement.audience === 'platform' ? 1 : 0),
    course: summary.course + (announcement.audience === 'course' ? 1 : 0),
    urgent: summary.urgent + (announcement.is_urgent ? 1 : 0),
    attachments: summary.attachments + (announcement.attachment_url ? 1 : 0),
  }), { total: 0, platform: 0, course: 0, urgent: 0, attachments: 0 });

  const filteredAnnouncements = React.useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return announcements.filter((announcement) => {
      if (activeTab === 'urgent' && !announcement.is_urgent) return false;
      if (activeTab === 'platform' && announcement.audience !== 'platform') return false;
      if (activeTab === 'course' && announcement.audience !== 'course') return false;
      if (activeTab === 'attachments' && !announcement.attachment_url) return false;
      if (!normalizedSearch) return true;
      return [
        announcement.title,
        announcement.body,
        announcement.course?.title || '',
        announcement.author?.full_name || '',
      ].some((value) => value.toLowerCase().includes(normalizedSearch));
    });
  }, [announcements, activeTab, search]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, filters]);

  React.useEffect(() => {
    if (!filteredAnnouncements.length) {
      setSelectedAnnouncementId(null);
      return;
    }
    if (!selectedAnnouncementId || !filteredAnnouncements.some((announcement) => announcement.id === selectedAnnouncementId)) {
      setSelectedAnnouncementId(filteredAnnouncements[0].id);
    }
  }, [filteredAnnouncements, selectedAnnouncementId]);

  const selectedAnnouncement = filteredAnnouncements.find((announcement) => announcement.id === selectedAnnouncementId) || filteredAnnouncements[0] || null;
  const recentAnnouncement = announcements[0] || null;
  const rowsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredAnnouncements.length / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * rowsPerPage;
  const paginatedAnnouncements = filteredAnnouncements.slice(pageStartIndex, pageStartIndex + rowsPerPage);

  const announcementScopeLabel = (announcement) => (announcement.audience === 'platform' ? 'Platform-wide' : announcement.course?.title || 'Course-specific');
  const announcementAudienceLabel = (announcement) => (announcement.audience === 'platform' ? 'All users' : 'Enrolled students');
  const statCards = [
    { label: 'Total Announcements', value: totals.total, detail: 'Published notices', icon: CampaignOutlined, color: '#1b6ef3', bg: '#eaf2ff' },
    { label: 'Platform-wide', value: totals.platform, detail: 'For all users', icon: ViewModuleOutlined, color: '#16805f', bg: '#e8f7ef' },
    { label: 'Course-specific', value: totals.course, detail: 'Linked to courses', icon: MenuBookOutlined, color: '#f59e0b', bg: '#fff5df' },
    { label: 'Urgent Notices', value: totals.urgent, detail: 'Needs attention', icon: NotificationsOutlined, color: '#7c3aed', bg: '#f4ecff' },
  ];
  const announcementTabs = [
    ['all', `All (${totals.total})`],
    ['platform', `Platform (${totals.platform})`],
    ['course', `Course (${totals.course})`],
    ['urgent', `Urgent (${totals.urgent})`],
    ['attachments', `Attachments (${totals.attachments})`],
  ];

  const createAnnouncement = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      let attachmentUrl = null;
      let attachmentName = null;
      if (selectedAnnouncementFile) {
        const uploadBody = new FormData();
        uploadBody.append('file', selectedAnnouncementFile);
        const uploadResponse = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${uploadPath}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: uploadBody,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.detail || 'Unable to upload attachment');
        attachmentUrl = uploadData.file_url;
        attachmentName = uploadData.file_name;
      }
      const createPath = isTeacherScope
        ? `/teacher/courses/${form.course_id}/announcements`
        : '/admin/announcements';
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${createPath}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          audience: isTeacherScope ? 'course' : form.audience,
          course_id: (isTeacherScope || form.audience === 'course') ? Number(form.course_id) : null,
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to post announcement');
      setAnnouncements((current) => [data, ...current]);
      setForm({ title: '', body: '', audience: isTeacherScope ? 'course' : 'platform', course_id: isTeacherScope ? form.course_id : '', is_urgent: false });
      setSelectedAnnouncementFile(null);
      setSelectedAnnouncementId(data.id);
      setCreateDialogOpen(false);
      setMessage('Announcement posted.');
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${announcementsPath}/${announcementId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to delete announcement');
      setAnnouncements((current) => current.filter((announcement) => announcement.id !== announcementId));
      setSelectedAnnouncementId((current) => (current === announcementId ? null : current));
      setMessage('Announcement deleted.');
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2.2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={1.4}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' } }}>
              Announcements
            </Typography>
            <CampaignOutlined sx={{ color: '#526273', fontSize: 28 }} />
          </Stack>
          <Typography sx={{ color: '#637083' }}>
            Post platform-wide announcements, course-specific updates, and urgent notices.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="secondary" startIcon={<AddOutlined />} onClick={() => setCreateDialogOpen(true)}>New Announcement</Button>
          <IconButton onClick={loadAnnouncements} sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}><MoreHorizOutlined /></IconButton>
        </Stack>
      </Stack>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 1.5, lg: 1.1, xl: 1.5 } }}>
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Box key={stat.label} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.8, bgcolor: '#fff', boxShadow: '0 14px 36px rgba(18,60,105,0.06)' }}>
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box sx={{ width: 54, height: 54, borderRadius: 1.4, bgcolor: stat.bg, color: stat.color, display: 'grid', placeItems: 'center' }}><Icon /></Box>
                <Box>
                  <Typography sx={{ color: '#526273', fontSize: 12, fontWeight: 800 }}>{stat.label}</Typography>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.9rem', lineHeight: 1 }}>{stat.value}</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 11.5 }}>{stat.detail}</Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 290px', xl: 'minmax(0, 1fr) 330px' }, gap: { xs: 2, lg: 1.4, xl: 2 }, alignItems: 'start' }}>
      <Stack spacing={1.5}>
      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff', boxShadow: '0 18px 48px rgba(18,60,105,0.06)' }}>
        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Posted Announcements</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>{filteredAnnouncements.length} announcement{filteredAnnouncements.length === 1 ? '' : 's'} in this view</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 1.2, alignItems: 'center', width: '100%', minWidth: 0 }}>
            <TextField
              size="small"
              label="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Title, course, keywords"
              InputProps={{ endAdornment: <InputAdornment position="end"><SearchOutlined fontSize="small" /></InputAdornment> }}
              sx={{ minWidth: 0 }}
            />
            <TextField select size="small" label="Audience" value={filters.audience} onChange={(event) => setFilters((current) => ({ ...current, audience: event.target.value, course_id: event.target.value === 'course' ? current.course_id : '' }))} sx={{ minWidth: 0 }}>
              <MenuItem value="all">All audiences</MenuItem>
              <MenuItem value="platform">Platform-wide</MenuItem>
              <MenuItem value="course">Course-specific</MenuItem>
            </TextField>
            <TextField select size="small" label="Course" value={filters.course_id} onChange={(event) => setFilters((current) => ({ ...current, course_id: event.target.value, audience: event.target.value ? 'course' : current.audience }))} disabled={filters.audience === 'platform'} sx={{ minWidth: 0 }}>
              <MenuItem value="">All courses</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Urgency" value={filters.urgent} onChange={(event) => setFilters((current) => ({ ...current, urgent: event.target.value }))} sx={{ minWidth: 0 }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
            </TextField>
            <Button variant="outlined" startIcon={<FilterAltOffOutlined />} onClick={() => { setSearch(''); setActiveTab('all'); setFilters({ audience: 'all', urgent: 'all', course_id: '' }); }} sx={{ height: 40, justifySelf: { xs: 'stretch', sm: 'end' }, width: { xs: '100%', sm: 132 }, gridColumn: { xs: '1', sm: '2', lg: '4' } }}>Filters</Button>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mb: 1.5, borderBottom: '1px solid rgba(18,60,105,0.1)', overflowX: 'auto' }}>
          {announcementTabs.map(([key, label]) => (
            <Button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              sx={{
                color: activeTab === key ? '#f05a28' : '#526273',
                borderBottom: activeTab === key ? '2px solid #f05a28' : '2px solid transparent',
                borderRadius: 0,
                px: 0.5,
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </Button>
          ))}
        </Stack>

        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
        ) : filteredAnnouncements.length === 0 ? (
          <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>No announcements match these filters yet.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.2}>
            {paginatedAnnouncements.map((announcement) => {
              const isSelected = selectedAnnouncement?.id === announcement.id;
              return (
              <Box key={announcement.id} onClick={() => setSelectedAnnouncementId(announcement.id)} sx={{ bgcolor: isSelected ? 'rgba(240,90,40,0.08)' : '#fff', border: `1px solid ${isSelected ? 'rgba(240,90,40,0.42)' : 'rgba(18,60,105,0.1)'}`, borderLeft: `4px solid ${isSelected ? '#f05a28' : 'transparent'}`, borderRadius: 1, p: { xs: 1.3, md: 1.6 }, cursor: 'pointer', transition: 'background-color 160ms ease, border-color 160ms ease', '&:hover': { bgcolor: isSelected ? 'rgba(240,90,40,0.08)' : '#f8fafc' } }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={1.4}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', mb: 0.5 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{announcement.title}</Typography>
                      <Chip label={announcementScopeLabel(announcement)} size="small" sx={{ bgcolor: announcement.audience === 'platform' ? '#f4ecff' : '#fff5df', color: announcement.audience === 'platform' ? '#6d28d9' : '#c76600', fontWeight: 800 }} />
                      {announcement.is_urgent && <Chip label="Urgent" size="small" sx={{ bgcolor: '#ffe3e3', color: '#dc2626', fontWeight: 800 }} />}
                      {announcement.attachment_url && <Chip label="Attachment" size="small" variant="outlined" />}
                    </Stack>
                    <Typography sx={{ color: '#526273', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{previewText(announcement.body, 92)}</Typography>
                    <Typography sx={{ color: '#637083', fontSize: 13, mt: 0.8 }}>
                      {announcementAudienceLabel(announcement)} | {announcement.author.full_name} | {formatTimestamp(announcement.created_at, { month: 'short', day: 'numeric', year: 'numeric' })} | {formatTimestamp(announcement.created_at, { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                  {(!isTeacherScope || announcement.course?.id) && (
                    <Button variant="outlined" color="error" disabled={saving} onClick={(event) => { event.stopPropagation(); deleteAnnouncement(announcement.id); }} sx={{ alignSelf: { xs: 'flex-start', lg: 'center' } }}>
                      Delete
                    </Button>
                  )}
                </Stack>
              </Box>
              );
            })}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
              <Typography sx={{ color: '#526273', fontSize: 12.5 }}>Showing {filteredAnnouncements.length ? pageStartIndex + 1 : 0}-{Math.min(pageStartIndex + rowsPerPage, filteredAnnouncements.length)} of {filteredAnnouncements.length} announcements</Typography>
              <Stack direction="row" spacing={0.7}>
                {Array.from({ length: totalPages }, (_item, index) => index + 1).map((page) => (
                  <Button key={page} variant={page === safeCurrentPage ? 'contained' : 'outlined'} size="small" onClick={() => setCurrentPage(page)} sx={{ minWidth: 36 }}>{page}</Button>
                ))}
              </Stack>
            </Stack>
          </Stack>
        )}
      </Box>

      {selectedAnnouncement && (
        <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 1.8, md: 2.2 }, bgcolor: '#fff', boxShadow: '0 18px 48px rgba(18,60,105,0.06)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.2} sx={{ mb: 1.2 }}>
            <Box>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: { xs: '1.2rem', md: '1.35rem' } }}>{selectedAnnouncement.title}</Typography>
              <Typography sx={{ color: '#637083', fontSize: 13 }}>
                {selectedAnnouncement.author.full_name} | {formatTimestamp(selectedAnnouncement.created_at, { month: 'short', day: 'numeric', year: 'numeric' })} | {formatTimestamp(selectedAnnouncement.created_at, { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
            {(!isTeacherScope || selectedAnnouncement.course?.id) && (
              <Button variant="outlined" color="error" disabled={saving} onClick={() => deleteAnnouncement(selectedAnnouncement.id)}>Delete announcement</Button>
            )}
          </Stack>
          <Stack direction="row" spacing={0.7} sx={{ flexWrap: 'wrap', gap: 0.7, mb: 1.4 }}>
            <Chip label={announcementScopeLabel(selectedAnnouncement)} size="small" />
            {selectedAnnouncement.is_urgent && <Chip label="Urgent" size="small" color="error" />}
            {selectedAnnouncement.attachment_url && <Chip label="Attachment" size="small" variant="outlined" />}
          </Stack>
          <Typography sx={{ color: '#526273', fontSize: 14, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{selectedAnnouncement.body}</Typography>
          {selectedAnnouncement.attachment_url && (
            isImageUrl(selectedAnnouncement.attachment_url) ? (
              <Box component="img" src={selectedAnnouncement.attachment_url} alt={selectedAnnouncement.attachment_name || 'Announcement attachment'} sx={{ display: 'block', maxWidth: 520, width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 1.2, border: '1px solid rgba(18,60,105,0.12)', mt: 1.5, bgcolor: '#f8fafc' }} />
            ) : (
              <Button component="a" href={selectedAnnouncement.attachment_url} target="_blank" rel="noreferrer" variant="outlined" startIcon={<DownloadOutlined />} sx={{ mt: 1.5 }}>
                {selectedAnnouncement.attachment_name || 'Download attachment'}
              </Button>
            )
          )}
        </Box>
      )}
      </Stack>

      <Stack spacing={1.5} sx={{ position: { lg: 'sticky' }, top: 92, minWidth: 0 }}>
        <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.8, bgcolor: '#fff', boxShadow: '0 18px 48px rgba(18,60,105,0.06)' }}>
          <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.4 }}>Recent Announcement</Typography>
          {recentAnnouncement ? (
            <Stack spacing={1.2}>
              <Stack direction="row" spacing={1.1} alignItems="center">
                <Box sx={{ width: 52, height: 52, borderRadius: 1.3, bgcolor: recentAnnouncement.is_urgent ? '#ffe3e3' : '#eaf2ff', color: recentAnnouncement.is_urgent ? '#f05a28' : '#1b6ef3', display: 'grid', placeItems: 'center' }}>
                  <CampaignOutlined />
                </Box>
                <Box>
                  {recentAnnouncement.is_urgent && <Chip label="Urgent" size="small" sx={{ bgcolor: '#ffe3e3', color: '#dc2626', fontWeight: 850, mb: 0.5 }} />}
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>{recentAnnouncement.title}</Typography>
                </Box>
              </Stack>
              <Typography sx={{ color: '#526273', fontSize: 13, lineHeight: 1.55 }}>{previewText(recentAnnouncement.body, 150)}</Typography>
              <Typography sx={{ color: '#637083', fontSize: 12 }}>Published on {formatTimestamp(recentAnnouncement.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
              <Button variant="outlined" endIcon={<ChevronRightOutlined />} onClick={() => setSelectedAnnouncementId(recentAnnouncement.id)}>View Full Details</Button>
            </Stack>
          ) : (
            <Typography sx={{ color: '#637083', fontSize: 13 }}>No announcements yet.</Typography>
          )}
        </Box>

        <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.8, bgcolor: '#fff' }}>
          <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.2 }}>Quick Stats</Typography>
          <Stack spacing={0.8}>
            {[
              ['Published', totals.total, '#16805f'],
              ['Platform-wide', totals.platform, '#1b6ef3'],
              ['Course-specific', totals.course, '#f59e0b'],
              ['Urgent', totals.urgent, '#f05a28'],
              ['Attachments', totals.attachments, '#94a3b8'],
            ].map(([label, value, color]) => (
              <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: color }} />
                  <Typography sx={{ color: '#526273', fontSize: 13 }}>{label}</Typography>
                </Stack>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{value}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.8, bgcolor: '#fff' }}>
          <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.1 }}>Quick Actions</Typography>
          {[
            ['Post Announcement', () => setCreateDialogOpen(true), CampaignOutlined],
            ['Urgent Notices', () => setActiveTab('urgent'), NotificationsOutlined],
          ].map(([label, handler, Icon]) => (
            <Button key={label} type="button" fullWidth onClick={handler} sx={{ color: 'primary.dark', borderBottom: '1px solid rgba(18,60,105,0.08)', borderRadius: 0, py: 1.05, px: 0.4 }}>
              <Stack direction="row" alignItems="center" spacing={1.1} sx={{ width: '100%' }}>
                <Icon sx={{ fontSize: 20, flexShrink: 0 }} />
                <Typography sx={{ flex: 1, textAlign: 'left', fontWeight: 800, fontSize: 14 }}>{label}</Typography>
                <ChevronRightOutlined sx={{ fontSize: 20, flexShrink: 0 }} />
              </Stack>
            </Button>
          ))}
        </Box>
      </Stack>
      </Box>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>New Announcement</DialogTitle>
        <DialogContent>
          <Stack component="form" id="admin-create-announcement-form" onSubmit={createAnnouncement} spacing={1.3} sx={{ pt: 1 }}>
            <TextField label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px 1fr' }, gap: 1.2 }}>
              <TextField select label="Audience" value={form.audience} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value, course_id: '' }))} disabled={isTeacherScope}>
                <MenuItem value="platform">Platform-wide</MenuItem>
                <MenuItem value="course">Course-specific</MenuItem>
              </TextField>
              <TextField select label="Course" value={form.course_id} onChange={(event) => setForm((current) => ({ ...current, course_id: event.target.value }))} disabled={form.audience !== 'course'} required={form.audience === 'course'}>
                <MenuItem value="">Select a course</MenuItem>
                {courses.map((course) => <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>)}
              </TextField>
            </Box>
            <TextField label="Message" value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} multiline minRows={5} required fullWidth />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
              <FormControlLabel control={<Switch checked={form.is_urgent} onChange={(event) => setForm((current) => ({ ...current, is_urgent: event.target.checked }))} />} label="Urgent notice" />
              <Button variant="outlined" component="label" disabled={saving}>
                {selectedAnnouncementFile ? selectedAnnouncementFile.name : 'Attach image/file'}
                <input type="file" hidden accept={lmsFileAccept} onChange={(event) => setSelectedAnnouncementFile(event.target.files?.[0] || null)} />
              </Button>
              {selectedAnnouncementFile && <Button variant="text" size="small" onClick={() => setSelectedAnnouncementFile(null)} disabled={saving}>Clear</Button>}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setCreateDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button type="submit" form="admin-create-announcement-form" variant="contained" color="secondary" disabled={saving || !form.title.trim() || !form.body.trim() || (form.audience === 'course' && !form.course_id)}>
            {saving ? 'Posting...' : 'Post announcement'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function CommunityHub({ adminView = false }) {
  const categories = [
    { value: 'all', label: 'All' },
    { value: 'general', label: 'General' },
    { value: 'jobs', label: 'Jobs' },
    { value: 'resources', label: 'Resources' },
    { value: 'wins', label: 'Wins' },
    { value: 'questions', label: 'Questions' },
  ];
  const categoryStyles = {
    general: { color: '#123c69', bg: '#eef3f8' },
    jobs: { color: '#16805f', bg: '#e2f7ed' },
    resources: { color: '#1b7df3', bg: '#e6f0ff' },
    wins: { color: '#8b5cf6', bg: '#f0e7ff' },
    questions: { color: '#f05a28', bg: '#fff0e7' },
  };
  const [posts, setPosts] = React.useState([]);
  const [category, setCategory] = React.useState('all');
  const [form, setForm] = React.useState({ title: '', body: '', category: 'general', audience: 'community' });
  const [commentDrafts, setCommentDrafts] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');

  const loadPosts = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/community/posts?category=${category}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load community posts');
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  React.useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const createPost = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/community/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to publish post');
      setPosts((current) => [data, ...current]);
      setForm({ title: '', body: '', category: 'general', audience: 'community' });
      setMessage('Post published.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addComment = async (postId) => {
    const body = (commentDrafts[postId] || '').trim();
    if (!body) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to add comment');
      setPosts((current) => current.map((post) => (post.id === postId ? data : post)));
      setCommentDrafts((current) => ({ ...current, [postId]: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const authorRoleLabel = (author) => {
    if (author.role === 'admin') return 'Admin';
    if (author.lifecycle_status === 'alumni') return 'Alumni';
    if (author.role === 'teacher') return 'Teacher';
    return 'Student';
  };

  return (
    <Stack spacing={3}>
      {adminView ? (
        <Box>
          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>
            Community
          </Typography>
          <Typography sx={{ color: '#637083' }}>
            Basic student and alumni network for resources, questions, wins, and job opportunities.
          </Typography>
        </Box>
      ) : (
        <StudentPageHeader
          title="Community"
          subtitle="Share resources, referrals, questions, and career updates with the Three13 network."
          icon={ForumOutlined}
        />
      )}

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box component="form" onSubmit={createPost} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 2, md: 2.4 }, boxShadow: '0 16px 42px rgba(18,60,105,0.06)' }}>
        <Stack spacing={1.4}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box sx={{ width: 42, height: 42, borderRadius: 1.2, bgcolor: '#fff0e7', color: 'secondary.main', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <ForumOutlined />
            </Box>
            <Box>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Start a conversation</Typography>
              <Typography sx={{ color: '#637083', fontSize: 13 }}>Keep it helpful, professional, and relevant to learning or career growth.</Typography>
            </Box>
          </Stack>
          <TextField label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
          <TextField label="Message" value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} multiline minRows={3} required />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
            <TextField select label="Category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} sx={{ flex: 1 }}>
              {categories.filter((item) => item.value !== 'all').map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
            </TextField>
            {adminView && (
              <TextField select label="Audience" value={form.audience} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value }))} sx={{ flex: 1 }}>
                <MenuItem value="community">Everyone</MenuItem>
                <MenuItem value="students">Current students</MenuItem>
                <MenuItem value="alumni">Alumni</MenuItem>
              </TextField>
            )}
            <Button type="submit" variant="contained" color="secondary" disabled={saving || !form.title.trim() || !form.body.trim()} sx={{ px: 3 }}>
              Publish
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 1.4, md: 1.8 }, boxShadow: '0 16px 42px rgba(18,60,105,0.05)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={1.2} sx={{ mb: 1.5 }}>
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Community Feed</Typography>
            <Typography sx={{ color: '#637083', fontSize: 13 }}>{posts.length} post{posts.length === 1 ? '' : 's'} visible</Typography>
          </Box>
          <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap' }}>
            {categories.map((item) => (
              <Button key={item.value} size="small" variant={category === item.value ? 'contained' : 'outlined'} color={category === item.value ? 'secondary' : 'primary'} onClick={() => setCategory(item.value)}>
                {item.label}
              </Button>
            ))}
          </Stack>
        </Stack>

        {loading ? (
          <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
        ) : posts.length === 0 ? (
          <Box sx={{ border: '1px dashed rgba(18,60,105,0.2)', borderRadius: 1.2, p: 3, textAlign: 'center', bgcolor: '#f8fafc' }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>No community posts yet</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14, mt: 0.5 }}>Be the first to start a useful conversation.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.4}>
            {posts.map((post) => {
              const style = categoryStyles[post.category] || categoryStyles.general;
              return (
                <Box key={post.id} sx={{ border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1.4, p: { xs: 1.5, md: 2 }, bgcolor: '#fff' }}>
                  <Stack direction="row" spacing={1.2} alignItems="flex-start">
                    <UserAvatar user={post.author} size={42} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap', mb: 0.5 }}>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>{post.title}</Typography>
                        <Chip label={categories.find((item) => item.value === post.category)?.label || post.category} size="small" sx={{ bgcolor: style.bg, color: style.color, fontWeight: 850 }} />
                        {post.audience !== 'community' && <Chip label={post.audience} size="small" variant="outlined" />}
                      </Stack>
                      <Typography sx={{ color: '#526273', fontSize: 13, mb: 1 }}>
                        {post.author.full_name} • {authorRoleLabel(post.author)} • {formatTimestamp(post.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                      <Typography sx={{ color: '#102b49', whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{post.body}</Typography>

                      <Box sx={{ mt: 1.6, pt: 1.4, borderTop: '1px solid #eef3f8' }}>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13, mb: 1 }}>Comments ({post.comment_count})</Typography>
                        <Stack spacing={0.8}>
                          {(post.comments || []).map((comment) => (
                            <Box key={comment.id} sx={{ bgcolor: '#f8fafc', borderRadius: 1, p: 1 }}>
                              <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 13 }}>
                                {comment.author.full_name} <Box component="span" sx={{ color: '#637083', fontWeight: 500 }}>• {authorRoleLabel(comment.author)}</Box>
                              </Typography>
                              <Typography sx={{ color: '#526273', fontSize: 13, whiteSpace: 'pre-wrap' }}>{comment.body}</Typography>
                            </Box>
                          ))}
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                          <TextField size="small" placeholder="Add a comment..." value={commentDrafts[post.id] || ''} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} fullWidth />
                          <Button variant="outlined" disabled={saving || !(commentDrafts[post.id] || '').trim()} onClick={() => addComment(post.id)}>
                            Reply
                          </Button>
                        </Stack>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

function CommunityHubModern({ adminView = false }) {
  const categories = [
    { value: 'all', label: 'All', icon: ForumOutlined, color: '#f05a28', bg: '#fff0e7' },
    { value: 'general', label: 'Discussions', icon: ForumOutlined, color: '#123c69', bg: '#eef3f8' },
    { value: 'questions', label: 'Questions', icon: HelpOutlineOutlined, color: '#1b6ef3', bg: '#eaf2ff' },
    { value: 'resources', label: 'Resources', icon: InsertDriveFileOutlined, color: '#7c3aed', bg: '#f4ecff' },
    { value: 'jobs', label: 'Jobs', icon: AssignmentOutlined, color: '#16805f', bg: '#e8f7ef' },
    { value: 'wins', label: 'Wins', icon: EmojiEventsOutlined, color: '#f59e0b', bg: '#fff5df' },
  ];
  const categoryLookup = categories.reduce((lookup, item) => ({ ...lookup, [item.value]: item }), {});
  const categoryAliases = { discussion: 'general', question: 'questions', resource: 'resources', job: 'jobs', win: 'wins' };
  const [posts, setPosts] = React.useState([]);
  const [category, setCategory] = React.useState('all');
  const [feedTab, setFeedTab] = React.useState('for_you');
  const [search, setSearch] = React.useState('');
  const [composerOpen, setComposerOpen] = React.useState(false);
  const [form, setForm] = React.useState({ title: '', body: '', category: 'general', audience: 'community' });
  const [commentDrafts, setCommentDrafts] = React.useState({});
  const [replyTargets, setReplyTargets] = React.useState({});
  const [likedPosts, setLikedPosts] = React.useState({});
  const [helpfulPosts, setHelpfulPosts] = React.useState({});
  const [savedPosts, setSavedPosts] = React.useState({});
  const [likedComments, setLikedComments] = React.useState({});
  const [expandedReplies, setExpandedReplies] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');

  const loadPosts = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/community/posts?category=${category}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load community posts');
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  React.useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const authorRoleLabel = (author = {}) => {
    if (author.role === 'admin') return 'Admin';
    if (author.lifecycle_status === 'alumni') return 'Alumni';
    if (author.role === 'teacher') return 'Teacher';
    return 'Student';
  };
  const roleStyle = (author) => ({
    Admin: { bg: '#fff0e7', color: '#f05a28' },
    Teacher: { bg: '#e8f7ef', color: '#16805f' },
    Alumni: { bg: '#f4ecff', color: '#7c3aed' },
    Student: { bg: '#eaf2ff', color: '#1b6ef3' },
  }[authorRoleLabel(author)] || { bg: '#eef3f8', color: '#526273' });
  const categoryMeta = (value) => categoryLookup[categoryAliases[value] || value] || categoryLookup.general;
  const findLinks = (body = '') => Array.from(new Set((body.match(/https?:\/\/[^\s)]+/g) || []).map((url) => url.replace(/[.,;]+$/, ''))));
  const toggle = (setter, id) => setter((current) => ({ ...current, [id]: !current[id] }));

  const visiblePosts = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts.filter((post) => {
      if (feedTab === 'saved' && !savedPosts[post.id]) return false;
      if (!term) return true;
      return [post.title, post.body, post.author?.full_name, categoryMeta(post.category).label]
        .filter(Boolean)
        .some((item) => String(item).toLowerCase().includes(term));
    }).sort((a, b) => (feedTab === 'latest' ? (b.created_at || 0) - (a.created_at || 0) : (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0) || (b.comment_count || 0) - (a.comment_count || 0) || (b.created_at || 0) - (a.created_at || 0)));
  }, [feedTab, posts, savedPosts, search]);

  const createPost = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/community/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to publish post');
      setPosts((current) => [data, ...current]);
      setForm({ title: '', body: '', category: 'general', audience: 'community' });
      setComposerOpen(false);
      setMessage('Post published.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addComment = async (postId, parentId = null) => {
    const key = parentId ? `comment-${parentId}` : `post-${postId}`;
    const body = (commentDrafts[key] || '').trim();
    if (!body) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, parent_id: parentId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to add comment');
      setPosts((current) => current.map((post) => (post.id === postId ? data : post)));
      setCommentDrafts((current) => ({ ...current, [key]: '' }));
      if (parentId) setReplyTargets((current) => ({ ...current, [postId]: null }));
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const renderLinkPreview = (url, compact = false) => (
    <Box key={url} component="a" href={url} target="_blank" rel="noreferrer" sx={{ display: 'grid', gridTemplateColumns: compact ? '34px 1fr' : '44px minmax(0,1fr) auto', gap: 1, alignItems: 'center', textDecoration: 'none', border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1.2, p: 1, bgcolor: '#f8fbff', mt: compact ? 0 : 1 }}>
      <Box sx={{ width: compact ? 34 : 44, height: compact ? 34 : 44, borderRadius: 1, bgcolor: '#eaf2ff', color: '#1b6ef3', display: 'grid', placeItems: 'center' }}><LinkOutlined fontSize="small" /></Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: compact ? 12.5 : 13.5 }}>{url.replace(/^https?:\/\//, '')}</Typography>
        <Typography sx={{ color: '#637083', fontSize: 12 }}>Shared link</Typography>
      </Box>
      {!compact && <ChevronRightOutlined sx={{ color: '#526273' }} />}
    </Box>
  );

  const renderComment = (post, comment, depth = 0) => {
    const role = roleStyle(comment.author);
    const replies = comment.replies || [];
    const visibleReplies = expandedReplies[comment.id] ? replies : replies.slice(0, depth >= 2 ? 1 : 3);
    const hiddenCount = replies.length - visibleReplies.length;
    return (
      <Box key={comment.id} sx={{ ml: { xs: Math.min(depth, 2) * 1.2, md: Math.min(depth, 3) * 2.4 }, pl: depth ? 1.2 : 0, borderLeft: depth ? '1px solid rgba(18,60,105,0.12)' : 'none' }}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <UserAvatar user={comment.author} size={34} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ bgcolor: depth ? '#fff' : '#f8fafc', border: '1px solid rgba(18,60,105,0.08)', borderRadius: 1.2, p: 1 }}>
              <Stack direction="row" spacing={0.6} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{comment.author.full_name}</Typography>
                <Chip label={authorRoleLabel(comment.author)} size="small" sx={{ height: 19, bgcolor: role.bg, color: role.color, fontWeight: 800 }} />
                <Typography sx={{ color: '#637083', fontSize: 11 }}>{formatTimestamp(comment.created_at, { month: 'short', day: 'numeric' })}</Typography>
                <MoreHorizOutlined sx={{ ml: 'auto', color: '#637083', fontSize: 18 }} />
              </Stack>
              <Typography sx={{ color: '#526273', fontSize: 13, whiteSpace: 'pre-wrap', mt: 0.4 }}>{comment.body}</Typography>
            </Box>
            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ ml: 0.4, mt: 0.35 }}>
              <Button size="small" onClick={() => toggle(setLikedComments, comment.id)} sx={{ px: 0, minWidth: 0, color: likedComments[comment.id] ? '#1b6ef3' : '#526273', fontSize: 12 }}>Like</Button>
              <Button size="small" onClick={() => setReplyTargets((current) => ({ ...current, [post.id]: current[post.id] === comment.id ? null : comment.id }))} sx={{ px: 0, minWidth: 0, color: '#1b6ef3', fontSize: 12 }}>Reply</Button>
              <Typography sx={{ color: '#637083', fontSize: 12 }}>{comment.reply_count || replies.length || 0} replies</Typography>
            </Stack>
            {replyTargets[post.id] === comment.id && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 0.8 }}>
                <TextField size="small" placeholder={`Reply to ${comment.author.full_name}...`} value={commentDrafts[`comment-${comment.id}`] || ''} onChange={(event) => setCommentDrafts((current) => ({ ...current, [`comment-${comment.id}`]: event.target.value }))} fullWidth />
                <Button variant="contained" color="secondary" disabled={saving || !(commentDrafts[`comment-${comment.id}`] || '').trim()} onClick={() => addComment(post.id, comment.id)}>Reply</Button>
              </Stack>
            )}
            <Stack spacing={0.8} sx={{ mt: 0.8 }}>
              {visibleReplies.map((reply) => renderComment(post, reply, depth + 1))}
              {hiddenCount > 0 && (
                <Button size="small" onClick={() => setExpandedReplies((current) => ({ ...current, [comment.id]: true }))} sx={{ alignSelf: 'flex-start', color: '#1b6ef3' }}>
                  View {hiddenCount} more repl{hiddenCount === 1 ? 'y' : 'ies'}
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </Box>
    );
  };

  const trendingPosts = [...posts].sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0)).slice(0, 4);
  const resourcePosts = posts.filter((post) => ['resources', 'resource'].includes(post.category)).slice(0, 3);
  const opportunityPosts = posts.filter((post) => ['jobs', 'job'].includes(post.category)).slice(0, 3);
  const onlineAuthors = posts.reduce((authors, post) => {
    if (!authors.some((author) => author.id === post.author.id)) authors.push(post.author);
    return authors;
  }, []).slice(0, 8);

  return (
    <Stack spacing={2.4}>
      <StudentPageHeader
        title="Community"
        subtitle={adminView ? 'Connect students, alumni, teachers, and admins through resources, opportunities, and real conversations.' : 'Connect, share, learn, and grow together.'}
        icon={ForumOutlined}
      />
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 290px', xl: 'minmax(0, 1fr) 330px' }, gap: { xs: 2, lg: 1.4, xl: 2 }, alignItems: 'start' }}>
        <Stack spacing={1.5}>
          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6, boxShadow: '0 16px 42px rgba(18,60,105,0.06)' }}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar sx={{ bgcolor: '#123c69', fontWeight: 900 }}>3</Avatar>
              <Button fullWidth variant="outlined" onClick={() => setComposerOpen(true)} sx={{ justifyContent: 'flex-start', color: '#637083', py: 1.2, borderColor: 'rgba(18,60,105,0.16)' }}>Share something with the community...</Button>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 1, mt: 1.2 }}>
              {categories.filter((item) => item.value !== 'all').map((item) => {
                const Icon = item.icon;
                return <Button key={item.value} variant="outlined" onClick={() => { setForm((current) => ({ ...current, category: item.value })); setComposerOpen(true); }} startIcon={<Icon />} sx={{ color: item.color, borderColor: 'rgba(18,60,105,0.12)', bgcolor: category === item.value ? item.bg : '#fff' }}>{item.label.replace(/s$/, '')}</Button>;
              })}
            </Box>
          </Box>

          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.4, boxShadow: '0 16px 42px rgba(18,60,105,0.05)' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={1.2} sx={{ borderBottom: '1px solid rgba(18,60,105,0.1)', mb: 1.3 }}>
              <Stack direction="row" spacing={2}>
                {[['for_you', 'For You'], ['latest', 'Latest'], ['following', 'Following'], ['saved', 'Saved']].map(([key, label]) => (
                  <Button key={key} onClick={() => setFeedTab(key)} sx={{ color: feedTab === key ? '#f05a28' : '#526273', borderBottom: feedTab === key ? '2px solid #f05a28' : '2px solid transparent', borderRadius: 0 }}>{label}</Button>
                ))}
              </Stack>
              <TextField size="small" placeholder="Search community" value={search} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }} sx={{ minWidth: { md: 220, xl: 260 }, pb: { xs: 1, md: 0.7 } }} />
            </Stack>
            <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', gap: 0.8 }}>
              {categories.map((item) => <Button key={item.value} size="small" variant={category === item.value ? 'contained' : 'outlined'} color={category === item.value ? 'secondary' : 'primary'} onClick={() => setCategory(item.value)}>{item.label}</Button>)}
            </Stack>
          </Box>

          {loading ? (
            <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
          ) : visiblePosts.length === 0 ? (
            <Box sx={{ border: '1px dashed rgba(18,60,105,0.2)', borderRadius: 1.2, p: 3, textAlign: 'center', bgcolor: '#f8fafc' }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>No community posts yet</Typography>
              <Typography sx={{ color: '#637083', fontSize: 14, mt: 0.5 }}>Be the first to start a useful conversation.</Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {visiblePosts.map((post) => {
                const meta = categoryMeta(post.category);
                const role = roleStyle(post.author);
                const links = findLinks(post.body).slice(0, 2);
                return (
                  <Box key={post.id} sx={{ border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1.4, p: { xs: 1.5, md: 2 }, bgcolor: '#fff', boxShadow: '0 14px 34px rgba(18,60,105,0.05)' }}>
                    <Stack direction="row" spacing={1.2} alignItems="flex-start">
                      <UserAvatar user={post.author} size={44} />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap', mb: 0.5 }}>
                          <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>{post.author.full_name}</Typography>
                          <Chip label={authorRoleLabel(post.author)} size="small" sx={{ bgcolor: role.bg, color: role.color, fontWeight: 850 }} />
                          <Typography sx={{ color: '#637083', fontSize: 12 }}>in</Typography>
                          <Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 850 }} />
                          <Typography sx={{ color: '#637083', fontSize: 12 }}>{formatTimestamp(post.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
                          <MoreHorizOutlined sx={{ ml: 'auto', color: '#637083' }} />
                        </Stack>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: 16, mb: 0.7 }}>{post.title}</Typography>
                        <Typography sx={{ color: '#102b49', whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{post.body}</Typography>
                        <Stack spacing={0.8}>{links.map((url) => renderLinkPreview(url))}</Stack>
                        <Stack direction="row" spacing={{ xs: 1, md: 2 }} alignItems="center" sx={{ mt: 1.4, flexWrap: 'wrap' }}>
                          <Button size="small" startIcon={<ThumbUpOutlined />} onClick={() => toggle(setLikedPosts, post.id)} sx={{ color: likedPosts[post.id] ? '#f05a28' : '#526273' }}>Like {likedPosts[post.id] ? '1' : ''}</Button>
                          <Button size="small" startIcon={<ThumbUpOutlined />} onClick={() => toggle(setHelpfulPosts, post.id)} sx={{ color: helpfulPosts[post.id] ? '#16805f' : '#526273' }}>Helpful</Button>
                          <Button size="small" startIcon={<ForumOutlined />} onClick={() => setReplyTargets((current) => ({ ...current, [post.id]: current[post.id] === 'post' ? null : 'post' }))} sx={{ color: '#526273' }}>Comment</Button>
                          <Button size="small" startIcon={<LinkOutlined />} sx={{ color: '#526273' }}>Share</Button>
                          <Button size="small" startIcon={<FolderCopyOutlined />} onClick={() => toggle(setSavedPosts, post.id)} sx={{ color: savedPosts[post.id] ? '#1b6ef3' : '#526273' }}>{savedPosts[post.id] ? 'Saved' : 'Save'}</Button>
                        </Stack>
                        <Box sx={{ mt: 1.6, pt: 1.3, borderTop: '1px solid #eef3f8' }}>
                          <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13, mb: 1 }}>Comments ({post.comment_count})</Typography>
                          <Stack spacing={0.8}>{(post.comments || []).map((comment) => renderComment(post, comment))}</Stack>
                          {(replyTargets[post.id] === 'post' || !(post.comments || []).length) && (
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                              <TextField size="small" placeholder="Add a comment..." value={commentDrafts[`post-${post.id}`] || ''} onChange={(event) => setCommentDrafts((current) => ({ ...current, [`post-${post.id}`]: event.target.value }))} fullWidth />
                              <Button variant="contained" color="secondary" disabled={saving || !(commentDrafts[`post-${post.id}`] || '').trim()} onClick={() => addComment(post.id)}>Post</Button>
                            </Stack>
                          )}
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Stack>

        <Stack spacing={1.5} sx={{ position: { lg: 'sticky' }, top: 92, minWidth: 0 }}>
          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6, boxShadow: '0 16px 42px rgba(18,60,105,0.05)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}><Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Trending Discussions</Typography><Button size="small">View all</Button></Stack>
            <Stack spacing={1.1}>{trendingPosts.map((post, index) => <Stack key={post.id} direction="row" spacing={1} alignItems="center"><Avatar sx={{ width: 28, height: 28, bgcolor: ['#f05a28', '#1b6ef3', '#16805f', '#8b5cf6'][index % 4], fontSize: 13 }}>{index + 1}</Avatar><Box sx={{ minWidth: 0 }}><Typography noWrap sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 13 }}>{post.title}</Typography><Typography sx={{ color: '#637083', fontSize: 12 }}>{post.comment_count || 0} replies</Typography></Box></Stack>)}</Stack>
          </Box>
          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}><Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Popular Resources</Typography><Button size="small" onClick={() => setCategory('resources')}>View all</Button></Stack>
            <Stack spacing={1}>{resourcePosts.length ? resourcePosts.map((post) => <Box key={post.id}>{findLinks(post.body)[0] ? renderLinkPreview(findLinks(post.body)[0], true) : <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 13 }}>{post.title}</Typography>}</Box>) : <Typography sx={{ color: '#637083', fontSize: 13 }}>No resources shared yet.</Typography>}</Stack>
          </Box>
          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}><Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Online Members</Typography><Button size="small">View all</Button></Stack>
            <Stack direction="row" spacing={-0.5} sx={{ mb: 1 }}>{onlineAuthors.map((author) => <UserAvatar key={author.id} user={author} size={34} />)}</Stack>
            <Typography sx={{ color: '#637083', fontSize: 12 }}>{onlineAuthors.length} recently active member{onlineAuthors.length === 1 ? '' : 's'}</Typography>
          </Box>
          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}><Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Upcoming Opportunities</Typography><Button size="small" onClick={() => setCategory('jobs')}>View all</Button></Stack>
            <Stack spacing={1}>{opportunityPosts.length ? opportunityPosts.map((post) => <Box key={post.id} sx={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 1, alignItems: 'center', border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1.2, p: 1 }}><Avatar variant="rounded" sx={{ bgcolor: '#f4ecff', color: '#7c3aed' }}><AssignmentOutlined fontSize="small" /></Avatar><Box sx={{ minWidth: 0 }}><Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{post.title}</Typography><Typography sx={{ color: '#637083', fontSize: 12 }}>{post.author.full_name}</Typography></Box><Button size="small" variant="outlined" href={findLinks(post.body)[0] || undefined} target="_blank" rel="noreferrer">View</Button></Box>) : <Typography sx={{ color: '#637083', fontSize: 13 }}>No opportunities posted yet.</Typography>}</Stack>
          </Box>
        </Stack>
      </Box>

      <Dialog open={composerOpen} onClose={() => setComposerOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Share with the community</DialogTitle>
        <DialogContent>
          <Stack component="form" id="community-post-form" onSubmit={createPost} spacing={1.4} sx={{ pt: 1 }}>
            <TextField label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
            <TextField label="Message, link, resource, or opportunity details" value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} multiline minRows={5} required />
            <TextField select label="Post type" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
              {categories.filter((item) => item.value !== 'all').map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
            </TextField>
            {adminView && <TextField select label="Audience" value={form.audience} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value }))}><MenuItem value="community">Everyone</MenuItem><MenuItem value="students">Current students</MenuItem><MenuItem value="alumni">Alumni</MenuItem></TextField>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setComposerOpen(false)} disabled={saving}>Cancel</Button>
          <Button type="submit" form="community-post-form" variant="contained" color="secondary" disabled={saving || !form.title.trim() || !form.body.trim()}>{saving ? 'Publishing...' : 'Publish'}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function AdminCommunityPane() {
  return <CommunityHubModern adminView />;
}

function AdminReportsPane({ setActivePane }) {
  const [reports, setReports] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [reportType, setReportType] = React.useState('overview');
  const [period, setPeriod] = React.useState('current');

  const loadReports = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/reports-summary`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load reports');
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  const totals = reports?.totals || {};
  const enrollment = reports?.enrollment || {};
  const courses = reports?.courses || [];
  const cohorts = reports?.cohorts || [];
  const activeStudents = totals.active_students || 0;
  const alumniTotal = totals.alumni || 0;
  const pendingStudents = totals.pending_students || 0;
  const totalEnrollments = enrollment.current_cohort_students || enrollment.approved_students || 0;
  const courseAccessRecords = enrollment.current_cohort_course_access_records || enrollment.approved_course_access_records || 0;
  const assignmentSubmissionTotal = totals.submissions || 0;
  const lateSubmissionTotal = totals.late_submissions || 0;
  const openAssignmentTotal = totals.open_assignments || 0;
  const openTickets = totals.open_tickets || 0;
  const inProgressTickets = totals.in_progress_tickets || 0;
  const closedTickets = totals.closed_tickets || 0;
  const activeCohort = reports?.active_cohort || null;
  const completionRate = totals.support_tickets ? Math.round((closedTickets / totals.support_tickets) * 100) : 0;
  const submissionRate = totals.assignments ? Math.round((assignmentSubmissionTotal / Math.max(totals.assignments, 1)) * 100) : 0;

  const topCourses = [...courses]
    .sort((a, b) => (b.enrolled_students || 0) - (a.enrolled_students || 0))
    .slice(0, 5);
  const ticketCategories = supportCategoryOptions.map((option) => {
    const category = (reports?.support_categories || []).find((item) => item.category === option.value);
    return { ...option, count: category?.count || 0 };
  });
  const cohortRows = [...cohorts].slice(0, 5);
  const assignmentRows = [...(reports?.upcoming_assignments || [])]
    .sort((a, b) => (a.due_at || Number.MAX_SAFE_INTEGER) - (b.due_at || Number.MAX_SAFE_INTEGER))
    .slice(0, 5);

  const exportReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Active students', activeStudents],
      ['Alumni', alumniTotal],
      ['Pending students', pendingStudents],
      ['Courses', totals.courses || 0],
      ['Current cohort students', totalEnrollments],
      ['Course access records', courseAccessRecords],
      ['Assignments', totals.assignments || 0],
      ['Assignment submissions', assignmentSubmissionTotal],
      ['Late submissions', lateSubmissionTotal],
      ['Support tickets', totals.support_tickets || 0],
      ['Open support tickets', openTickets],
      ['Closed support tickets', closedTickets],
      ['Active cohort', activeCohort?.name || 'None'],
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `three13-${reportType}-report.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const cardSx = {
    bgcolor: '#fff',
    border: '1px solid rgba(18,60,105,0.12)',
    borderRadius: 1.5,
    boxShadow: '0 12px 30px rgba(8,37,64,0.05)',
  };
  const progressBar = (value, color = '#1b6ef3') => (
    <Box sx={{ height: 6, bgcolor: '#edf2f7', borderRadius: 999, overflow: 'hidden' }}>
      <Box sx={{ height: '100%', width: `${Math.min(100, Math.max(0, value))}%`, bgcolor: color }} />
    </Box>
  );

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' } }}>
              Reports
            </Typography>
            <ArticleOutlined sx={{ color: '#8aa0b8' }} />
          </Stack>
          <Typography sx={{ color: '#637083', mt: 0.8 }}>
            Review platform health, learner activity, course demand, assignments, support trends, and cohort performance.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<DownloadOutlined />} onClick={exportReport}>Export Report</Button>
          <Button variant="contained" color="secondary" onClick={loadReports}>Refresh</Button>
        </Stack>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ ...cardSx, p: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 220px 220px' }, gap: 1.2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search reports, students, courses..."
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }}
          />
          <TextField select size="small" label="Report" value={reportType} onChange={(event) => setReportType(event.target.value)}>
            <MenuItem value="overview">Overview</MenuItem>
            <MenuItem value="learners">Learners</MenuItem>
            <MenuItem value="courses">Courses</MenuItem>
            <MenuItem value="assignments">Assignments</MenuItem>
            <MenuItem value="support">Support</MenuItem>
          </TextField>
          <TextField select size="small" label="Period" value={period} onChange={(event) => setPeriod(event.target.value)}>
            <MenuItem value="current">Current cohort</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="all">All time</MenuItem>
          </TextField>
        </Box>
      </Box>

      {loading ? (
        <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={28} /></Stack>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 1.5 }}>
            {[
              ['Learners', activeStudents + alumniTotal, `${activeStudents} active | ${alumniTotal} alumni`, GroupOutlined, '#8b5cf6', '#f0e8ff'],
              ['Courses', totals.courses || 0, `${totalEnrollments} current learners`, MenuBookOutlined, '#1b6ef3', '#e8f1ff'],
              ['Assignments', totals.assignments || 0, `${assignmentSubmissionTotal} submissions`, AssignmentOutlined, '#16805f', '#e1f6ec'],
              ['Support Tickets', totals.support_tickets || 0, `${openTickets + inProgressTickets} active`, SupportAgentOutlined, '#f05a28', '#fff0e8'],
            ].map(([label, value, helper, Icon, color, bg]) => (
              <Box key={label} sx={{ ...cardSx, p: 2, display: 'flex', alignItems: 'center', gap: 1.6 }}>
                <Avatar variant="rounded" sx={{ bgcolor: bg, color, width: 58, height: 58 }}><Icon /></Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: '#637083', fontSize: 13, fontWeight: 800 }}>{label}</Typography>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '2rem', lineHeight: 1.05 }}>{value}</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 12 }}>{helper}</Typography>
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.45fr) 360px' }, gap: 2 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
                <Box sx={{ ...cardSx, p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.4 }}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Top Courses</Typography>
                    <Button size="small" onClick={() => setActivePane?.('courses')}>View all</Button>
                  </Stack>
                  <Stack spacing={1.2}>
                    {topCourses.length === 0 ? <Typography sx={{ color: '#637083', fontSize: 13 }}>No courses yet.</Typography> : topCourses.map((course, index) => {
                      const count = course.enrolled_students || 0;
                      const max = Math.max(1, ...topCourses.map((item) => item.enrolled_students || 0));
                      return (
                        <Stack key={course.id} direction="row" spacing={1.2} alignItems="center">
                          <Avatar variant="rounded" src={getCourseImage(course.title)} sx={{ width: 46, height: 46, bgcolor: '#e8f1ff' }}>{index + 1}</Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13.5 }}>{course.title}</Typography>
                            <Typography sx={{ color: '#637083', fontSize: 12 }}>{count} enrolled</Typography>
                            {progressBar(Math.round((count / max) * 100), '#1b6ef3')}
                          </Box>
                        </Stack>
                      );
                    })}
                  </Stack>
                </Box>

                <Box sx={{ ...cardSx, p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.4 }}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Assignment Health</Typography>
                    <Button size="small" onClick={() => setActivePane?.('assignments')}>View all</Button>
                  </Stack>
                  <Stack spacing={1.1}>
                    {assignmentRows.length === 0 ? <Typography sx={{ color: '#637083', fontSize: 13 }}>No assignments yet.</Typography> : assignmentRows.map((assignment, index) => (
                      <Box key={assignment.id} sx={{ p: 1.1, borderRadius: 1, bgcolor: index % 2 ? '#fbfdff' : '#f4f8fc' }}>
                        <Stack direction="row" justifyContent="space-between" spacing={1}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{assignment.title}</Typography>
                            <Typography sx={{ color: '#637083', fontSize: 12 }}>{assignment.course_title || 'No course'} | {formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
                          </Box>
                          <Chip label={`${assignment.submissions || 0} submitted`} size="small" sx={{ bgcolor: '#e1f6ec', color: '#16805f', fontWeight: 800 }} />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>

              <Box sx={{ ...cardSx, overflow: 'hidden' }}>
                <Box sx={{ px: 2, py: 1.6, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Cohort Snapshot</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 13 }}>Current and recent sessions.</Typography>
                </Box>
                <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: 'minmax(220px, 1fr) 130px 120px 120px 150px', gap: 1, px: 2, py: 1.2, bgcolor: '#082540', color: '#fff', fontSize: 12, fontWeight: 900 }}>
                  <span>Cohort</span><span>Status</span><span>Learners</span><span>Enrollments</span><span>Dates</span>
                </Box>
                <Stack divider={<Divider />}>
                  {cohortRows.length === 0 ? (
                    <Box sx={{ p: 2 }}><Typography sx={{ color: '#637083', fontSize: 13 }}>No cohorts configured yet.</Typography></Box>
                  ) : cohortRows.map((cohort, index) => (
                    <Box key={cohort.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(220px, 1fr) 130px 120px 120px 150px' }, gap: 1, alignItems: 'center', px: 2, py: 1.3, bgcolor: index % 2 ? '#fff' : '#fbfdff' }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{cohort.name}</Typography>
                      <Chip label={cohort.status} size="small" sx={{ width: 'fit-content', bgcolor: cohort.status === 'active' ? '#e1f6ec' : cohort.status === 'completed' ? '#edf1f5' : '#fff2dd', color: cohort.status === 'active' ? '#16805f' : cohort.status === 'completed' ? '#526273' : '#b86600', fontWeight: 850 }} />
                      <Typography sx={{ color: '#526273', fontSize: 13 }}>{cohort.stats?.students ?? 0}</Typography>
                      <Typography sx={{ color: '#526273', fontSize: 13 }}>{cohort.stats?.enrollments ?? 0}</Typography>
                      <Typography sx={{ color: '#526273', fontSize: 12 }}>{formatTimestamp(cohort.starts_at, { month: 'short', day: 'numeric' })} - {formatTimestamp(cohort.ends_at, { month: 'short', day: 'numeric' })}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>

            <Stack spacing={2}>
              <Box sx={{ ...cardSx, p: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.4 }}>Learner Mix</Typography>
                <Stack spacing={1.4}>
                  {[
                    ['Active students', activeStudents, '#16805f'],
                    ['Alumni', alumniTotal, '#8b5cf6'],
                    ['Pending', pendingStudents, '#f05a28'],
                  ].map(([label, value, color]) => {
                    const total = Math.max(1, activeStudents + alumniTotal + pendingStudents);
                    return (
                      <Box key={label}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.6 }}>
                          <Typography sx={{ color: '#526273', fontSize: 13 }}>{label}</Typography>
                          <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{value}</Typography>
                        </Stack>
                        {progressBar(Math.round((value / total) * 100), color)}
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Box sx={{ ...cardSx, p: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.4 }}>Support Categories</Typography>
                <Stack spacing={1.1}>
                  {ticketCategories.map((category) => (
                    <Stack key={category.value} direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" spacing={0.8} alignItems="center">
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: category.value === 'technical_problem' ? '#1b6ef3' : category.value === 'enrollment_confirmation' ? '#16805f' : category.value === 'teacher_issue' ? '#f59e0b' : '#8b5cf6' }} />
                        <Typography sx={{ color: '#526273', fontSize: 13 }}>{category.label}</Typography>
                      </Stack>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{category.count}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              <Box sx={{ ...cardSx, p: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1 }}>Quick Actions</Typography>
                <Stack divider={<Divider />}>
                  {[
                    ['Open Students', GroupOutlined, 'students'],
                    ['Open Courses', MenuBookOutlined, 'courses'],
                    ['Open Assignments', AssignmentOutlined, 'assignments'],
                    ['Open Support', SupportAgentOutlined, 'support'],
                  ].map(([label, Icon, pane]) => (
                    <Button key={label} onClick={() => setActivePane?.(pane)} endIcon={<ChevronRightOutlined />} sx={{ justifyContent: 'space-between', color: 'primary.dark', py: 1.2 }}>
                      <Stack direction="row" spacing={1} alignItems="center"><Icon fontSize="small" /> <span>{label}</span></Stack>
                    </Button>
                  ))}
                </Stack>
              </Box>

              <Box sx={{ ...cardSx, p: 2, bgcolor: '#f8fbff' }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Avatar variant="rounded" sx={{ bgcolor: '#e8f1ff', color: '#1b6ef3' }}><LightbulbOutlined /></Avatar>
                  <Box>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Reporting Note</Typography>
                    <Typography sx={{ color: '#526273', fontSize: 13 }}>This page reports from live LMS records. Trend deltas can be added once historical snapshots are stored.</Typography>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  );
}

function AdminSupportPane({ onAdminDataChanged, onAdminToast }) {
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  useAdminPaneToast(message, setMessage, error, setError, onAdminToast);
  const [filters, setFilters] = React.useState({ status: 'all', category: 'all', search: '', sort: 'newest' });
  const [activeTab, setActiveTab] = React.useState('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedTicketId, setSelectedTicketId] = React.useState(null);

  const loadTickets = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        status: 'all',
        category: filters.category,
        search: filters.search,
      });
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/support-tickets?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load support tickets');
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.search]);

  React.useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters.status, filters.category, filters.search, filters.sort, activeTab]);

  const totals = tickets.reduce((summary, ticket) => ({
    total: summary.total + 1,
    open: summary.open + (ticket.status === 'open' ? 1 : 0),
    progress: summary.progress + (ticket.status === 'in_progress' ? 1 : 0),
    closed: summary.closed + (ticket.status === 'closed' ? 1 : 0),
  }), { total: 0, open: 0, progress: 0, closed: 0 });

  const categoryTotals = supportCategoryOptions.map((option) => ({
    ...option,
    total: tickets.filter((ticket) => ticket.category === option.value).length,
  }));

  const filteredTickets = React.useMemo(() => {
    return tickets
      .filter((ticket) => {
        if (activeTab !== 'all' && ticket.status !== activeTab) return false;
        if (filters.status !== 'all' && ticket.status !== filters.status) return false;
        return true;
      })
      .sort((a, b) => {
        if (filters.sort === 'oldest') return (a.created_at || 0) - (b.created_at || 0);
        if (filters.sort === 'status') return String(a.status).localeCompare(String(b.status));
        if (filters.sort === 'category') return String(a.category).localeCompare(String(b.category));
        return (b.created_at || 0) - (a.created_at || 0);
      });
  }, [tickets, activeTab, filters.status, filters.sort]);

  const rowsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / rowsPerPage));
  const pagedTickets = filteredTickets.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) || null;
  const oldestOpenTicket = tickets
    .filter((ticket) => ticket.status !== 'closed')
    .sort((a, b) => (a.created_at || 0) - (b.created_at || 0))[0];

  const updateTicketStatus = async (ticketId, status) => {
    setSavingId(ticketId);
    setMessage('');
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/support-tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update ticket');
      setTickets((current) => current.map((ticket) => (ticket.id === ticketId ? data : ticket)));
      setMessage('Support ticket updated.');
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const resolveQuickTicket = () => {
    const ticketToResolve = selectedTicket?.status !== 'closed' ? selectedTicket : oldestOpenTicket;
    if (!ticketToResolve) {
      setMessage('There are no active tickets to resolve.');
      setError('');
      return;
    }
    updateTicketStatus(ticketToResolve.id, 'closed');
  };

  const statusMeta = (status) => {
    if (status === 'open') return { label: 'Open', color: '#16805f', bgcolor: '#e1f6ec', icon: EmailOutlined };
    if (status === 'in_progress') return { label: 'In Progress', color: '#1b6ef3', bgcolor: '#e8f1ff', icon: AccessTimeOutlined };
    return { label: 'Closed', color: '#526273', bgcolor: '#edf1f5', icon: CheckCircleOutlined };
  };

  const categoryMeta = (category) => {
    const colors = {
      student_question: ['#f0e8ff', '#8b5cf6', PersonOutlineOutlined],
      teacher_issue: ['#fff2dd', '#f59e0b', SchoolOutlined],
      technical_problem: ['#e8f1ff', '#1b6ef3', SettingsOutlined],
      enrollment_confirmation: ['#e1f6ec', '#16805f', GroupOutlined],
    };
    const [bgcolor, color, Icon] = colors[category] || ['#edf1f5', '#637083', HelpOutlineOutlined];
    return { label: supportCategoryLabels[category] || category, bgcolor, color, Icon };
  };

  const clearFilters = () => {
    setFilters({ status: 'all', category: 'all', search: '', sort: 'newest' });
    setActiveTab('all');
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' } }}>
              Support
            </Typography>
            <SupportAgentOutlined sx={{ color: '#8aa0b8' }} />
          </Stack>
          <Typography sx={{ color: '#637083', mt: 0.8 }}>
            Manage student questions, teacher issues, technical problems, and enrollment confirmation issues.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="secondary" startIcon={<CheckCircleOutlined />} disabled={savingId !== null} onClick={resolveQuickTicket}>Resolve Ticket</Button>
          <IconButton onClick={loadTickets} sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}><MoreHorizOutlined /></IconButton>
        </Stack>
      </Box>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 1.5, lg: 1.1, xl: 1.5 } }}>
        {[
          ['Total Tickets', totals.total, 'All submitted requests', HelpOutlineOutlined, '#8b5cf6', '#f0e8ff'],
          ['Open', totals.open, 'Needs first response', EmailOutlined, '#16805f', '#e1f6ec'],
          ['In Progress', totals.progress, 'Being handled', AccessTimeOutlined, '#f59e0b', '#fff2dd'],
          ['Closed', totals.closed, 'Resolved requests', CheckCircleOutlined, '#1b6ef3', '#e8f1ff'],
        ].map(([label, value, helper, Icon, color, bg]) => (
          <Box key={label} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff', boxShadow: '0 12px 30px rgba(8,37,64,0.05)', display: 'flex', alignItems: 'center', gap: 1.6 }}>
            <Avatar variant="rounded" sx={{ bgcolor: bg, color, width: 58, height: 58 }}><Icon /></Avatar>
            <Box>
              <Typography sx={{ color: '#637083', fontSize: 13, fontWeight: 800 }}>{label}</Typography>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: '2rem', lineHeight: 1.05 }}>{value}</Typography>
              <Typography sx={{ color: '#637083', fontSize: 12 }}>{helper}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 290px', xl: 'minmax(0, 1fr) 320px' }, gap: { xs: 2, lg: 1.4, xl: 2 } }}>
        <Stack spacing={2}>
          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff', boxShadow: '0 12px 30px rgba(8,37,64,0.04)' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: '1.6fr repeat(4, 1fr)' }, gap: 1.2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search tickets by keyword..."
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                InputProps={{ endAdornment: <InputAdornment position="end"><SearchOutlined /></InputAdornment> }}
              />
              <TextField select size="small" label="Category" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}>
                <MenuItem value="all">All categories</MenuItem>
                {supportCategoryOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                ))}
              </TextField>
              <TextField select size="small" label="Status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                <MenuItem value="all">All statuses</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="in_progress">In progress</MenuItem>
                <MenuItem value="closed">Closed</MenuItem>
              </TextField>
              <TextField select size="small" label="Priority" value="all">
                <MenuItem value="all">All priorities</MenuItem>
              </TextField>
              <Button variant="outlined" startIcon={<FilterAltOffOutlined />} onClick={clearFilters} sx={{ height: 40 }}>Filters</Button>
            </Box>
          </Box>

          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, bgcolor: '#fff', overflow: 'hidden', boxShadow: '0 12px 30px rgba(8,37,64,0.04)', minWidth: 0 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ px: 2, pt: 1.5, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
              <Stack direction="row" spacing={2.4}>
                {[
                  ['all', 'All Tickets', totals.total],
                  ['open', 'Open', totals.open],
                  ['in_progress', 'In Progress', totals.progress],
                  ['closed', 'Closed', totals.closed],
                ].map(([key, label, count]) => (
                  <Button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    sx={{
                      color: activeTab === key ? '#f05a28' : '#526273',
                      borderBottom: activeTab === key ? '2px solid #f05a28' : '2px solid transparent',
                      borderRadius: 0,
                      pb: 1.2,
                      px: 0,
                      minWidth: 0,
                    }}
                  >
                    {label}
                    <Chip size="small" label={count} sx={{ ml: 0.8, height: 22, bgcolor: activeTab === key ? '#ffe8de' : '#e8eef5', color: activeTab === key ? '#f05a28' : '#637083', fontWeight: 900 }} />
                  </Button>
                ))}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ pb: { xs: 1.5, md: 1 } }}>
                <TextField select size="small" label="Sort by" value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))} sx={{ minWidth: 170 }}>
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                  <MenuItem value="category">Category</MenuItem>
                </TextField>
                <IconButton onClick={loadTickets} sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}><ViewModuleOutlined /></IconButton>
              </Stack>
            </Stack>

            {loading ? (
              <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
            ) : pagedTickets.length === 0 ? (
              <Box sx={{ p: 2.2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>No support tickets match these filters yet.</Typography>
              </Box>
            ) : (
              <Stack divider={<Divider />}>
                {pagedTickets.map((ticket, index) => {
                  const status = statusMeta(ticket.status);
                  const category = categoryMeta(ticket.category);
                  const StatusIcon = status.icon;
                  const CategoryIcon = category.Icon;
                  return (
                    <Box key={ticket.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(240px, 1.4fr) 170px 112px 112px 92px' }, gap: 1.1, alignItems: 'center', px: 1.5, py: 1.6, bgcolor: index % 2 === 0 ? '#fff' : '#fbfdff' }}>
                      <Stack direction="row" spacing={1.4} alignItems="center" sx={{ minWidth: 0 }}>
                        <Avatar variant="rounded" sx={{ bgcolor: category.bgcolor, color: category.color, width: 52, height: 52 }}><CategoryIcon /></Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: 'primary.dark', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.subject}</Typography>
                          <Typography sx={{ color: '#526273', fontSize: 12.5 }}>{ticket.name} | {ticket.email}</Typography>
                          <Typography sx={{ color: '#637083', fontSize: 12 }}>{ticket.user?.role || 'Guest'}{ticket.user?.full_name ? ` | ${ticket.user.full_name}` : ''}</Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={0.8} alignItems="center" sx={{ minWidth: 0 }}>
                        <Chip label={category.label} size="small" sx={{ bgcolor: category.bgcolor, color: category.color, fontWeight: 800, maxWidth: 160, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }} />
                      </Stack>
                      <Box>
                        <Typography sx={{ color: 'primary.dark', fontSize: 13, fontWeight: 850 }}>#TKT-{String(ticket.id).padStart(4, '0')}</Typography>
                        <Typography sx={{ color: '#637083', fontSize: 12 }}>{formatTimestamp(ticket.created_at, { month: 'short', day: 'numeric' })}</Typography>
                      </Box>
                      <Chip icon={<StatusIcon />} label={status.label} size="small" sx={{ maxWidth: 108, bgcolor: status.bgcolor, color: status.color, fontWeight: 850, '& .MuiChip-icon': { color: status.color }, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }} />
                      <Stack direction="row" spacing={0.6} justifyContent={{ xs: 'flex-start', lg: 'center' }} alignItems="center" sx={{ minWidth: { lg: 84 } }}>
                        <IconButton size="small" aria-label="View ticket" onClick={() => setSelectedTicketId(ticket.id)} sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}><VisibilityOutlined fontSize="small" /></IconButton>
                        <IconButton size="small" aria-label="Ticket actions" onClick={() => setSelectedTicketId(ticket.id)} sx={{ border: '1px solid rgba(18,60,105,0.14)', borderRadius: 1 }}><MoreHorizOutlined fontSize="small" /></IconButton>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}

            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ px: 2, py: 1.6, borderTop: '1px solid rgba(18,60,105,0.08)' }}>
              <Typography sx={{ color: '#526273', fontSize: 13 }}>
                Showing {filteredTickets.length === 0 ? 0 : ((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredTickets.length)} of {filteredTickets.length} tickets
              </Typography>
              <Stack direction="row" spacing={0.8}>
                {Array.from({ length: totalPages }).slice(0, 4).map((_, pageIndex) => (
                  <Button key={pageIndex + 1} variant={currentPage === pageIndex + 1 ? 'contained' : 'outlined'} onClick={() => setCurrentPage(pageIndex + 1)} sx={{ minWidth: 38 }}>{pageIndex + 1}</Button>
                ))}
                <Button variant="outlined" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage >= totalPages}><ChevronRightOutlined /></Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>

        <Stack spacing={2}>
          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, bgcolor: '#fff', p: 2, boxShadow: '0 12px 30px rgba(8,37,64,0.04)' }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1.4 }}>Support Overview</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ width: 118, height: 118, borderRadius: '50%', background: `conic-gradient(#16805f 0 ${totals.total ? (totals.open / totals.total) * 100 : 0}%, #1b6ef3 0 ${totals.total ? ((totals.open + totals.progress) / totals.total) * 100 : 0}%, #cbd5e1 0 100%)`, display: 'grid', placeItems: 'center' }}>
                <Box sx={{ width: 78, height: 78, borderRadius: '50%', bgcolor: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                  <Box>
                    <Typography sx={{ color: 'primary.dark', fontSize: 28, fontWeight: 950, lineHeight: 1 }}>{totals.total}</Typography>
                    <Typography sx={{ color: '#637083', fontSize: 12 }}>Total</Typography>
                  </Box>
                </Box>
              </Box>
              <Stack spacing={1} sx={{ flex: 1 }}>
                {[
                  ['Open', totals.open, '#16805f'],
                  ['In Progress', totals.progress, '#1b6ef3'],
                  ['Closed', totals.closed, '#94a3b8'],
                ].map(([label, value, color]) => (
                  <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: color }} />
                      <Typography sx={{ color: '#526273', fontSize: 13 }}>{label}</Typography>
                    </Stack>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Box>

          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, bgcolor: '#fff', p: 2, boxShadow: '0 12px 30px rgba(8,37,64,0.04)' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Oldest Active Ticket</Typography>
                <Typography sx={{ color: 'primary.dark', fontSize: 24, fontWeight: 950, mt: 0.5 }}>{oldestOpenTicket ? `#TKT-${String(oldestOpenTicket.id).padStart(4, '0')}` : 'None'}</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13 }}>{oldestOpenTicket ? formatTimestamp(oldestOpenTicket.created_at, { month: 'short', day: 'numeric', year: 'numeric' }) : 'No active tickets'}</Typography>
              </Box>
              <Avatar variant="rounded" sx={{ bgcolor: '#e8f1ff', color: '#1b6ef3', width: 58, height: 58 }}><AccessTimeOutlined /></Avatar>
            </Stack>
          </Box>

          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, bgcolor: '#fff', p: 2, boxShadow: '0 12px 30px rgba(8,37,64,0.04)' }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1.4 }}>Popular Categories</Typography>
            <Stack spacing={1}>
              {categoryTotals.map((item) => {
                const meta = categoryMeta(item.value);
                return (
                  <Stack key={item.value} direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: meta.color }} />
                      <Typography sx={{ color: '#526273', fontSize: 13 }}>{item.label}</Typography>
                    </Stack>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{item.total}</Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Box>

          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, bgcolor: '#fff', p: 2, boxShadow: '0 12px 30px rgba(8,37,64,0.04)' }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Quick Actions</Typography>
            <Stack divider={<Divider />} spacing={0}>
              {[
                ['View All Tickets', ViewModuleOutlined, clearFilters],
                ['Open Tickets', EmailOutlined, () => { setActiveTab('open'); setFilters((current) => ({ ...current, status: 'all' })); }],
                ['In Progress', AccessTimeOutlined, () => { setActiveTab('in_progress'); setFilters((current) => ({ ...current, status: 'all' })); }],
                ['Closed Tickets', CheckCircleOutlined, () => { setActiveTab('closed'); setFilters((current) => ({ ...current, status: 'all' })); }],
              ].map(([label, Icon, onClick]) => (
                <Button key={label} onClick={onClick} endIcon={<ChevronRightOutlined />} sx={{ justifyContent: 'space-between', color: 'primary.dark', py: 1.2 }}>
                  <Stack direction="row" spacing={1} alignItems="center"><Icon fontSize="small" /> <span>{label}</span></Stack>
                </Button>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Dialog open={Boolean(selectedTicket)} onClose={() => setSelectedTicketId(null)} maxWidth="md" fullWidth>
        {selectedTicket && (
          <>
            <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: 24 }}>{selectedTicket.subject}</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 13 }}>#TKT-{String(selectedTicket.id).padStart(4, '0')} | {formatTimestamp(selectedTicket.created_at, { month: 'long', day: 'numeric', year: 'numeric' })}</Typography>
                </Box>
                <IconButton onClick={() => setSelectedTicketId(null)}><CloseOutlined /></IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' }, gap: 2 }}>
                <Stack spacing={1.5}>
                  <Box sx={{ bgcolor: '#f8fafc', border: '1px solid rgba(18,60,105,0.08)', borderRadius: 1.2, p: 1.6 }}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 0.8 }}>Message</Typography>
                    <Typography sx={{ color: '#526273', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{selectedTicket.message}</Typography>
                  </Box>
                  {selectedTicket.attachment_url && (
                    <Button component="a" href={selectedTicket.attachment_url} target="_blank" rel="noreferrer" variant="outlined" startIcon={<DownloadOutlined />}>
                      Download attachment
                    </Button>
                  )}
                </Stack>
                <Stack spacing={1.2}>
                  <Box sx={{ border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1.2, p: 1.4 }}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Requester</Typography>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>{selectedTicket.name}</Typography>
                    <Typography sx={{ color: '#526273', fontSize: 13 }}>{selectedTicket.email}</Typography>
                    {selectedTicket.user && <Typography sx={{ color: '#637083', fontSize: 13 }}>{selectedTicket.user.role} account</Typography>}
                  </Box>
                  <Box sx={{ border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1.2, p: 1.4 }}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Ticket Status</Typography>
                    <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', gap: 0.8 }}>
                      <Chip label={categoryMeta(selectedTicket.category).label} sx={{ bgcolor: categoryMeta(selectedTicket.category).bgcolor, color: categoryMeta(selectedTicket.category).color, fontWeight: 850 }} />
                      <Chip label={statusMeta(selectedTicket.status).label} sx={{ bgcolor: statusMeta(selectedTicket.status).bgcolor, color: statusMeta(selectedTicket.status).color, fontWeight: 850 }} />
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button fullWidth variant={selectedTicket.status === 'open' ? 'contained' : 'outlined'} disabled={savingId === selectedTicket.id} onClick={() => updateTicketStatus(selectedTicket.id, 'open')}>Open</Button>
                    <Button fullWidth variant={selectedTicket.status === 'in_progress' ? 'contained' : 'outlined'} disabled={savingId === selectedTicket.id} onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}>Progress</Button>
                    <Button fullWidth variant={selectedTicket.status === 'closed' ? 'contained' : 'outlined'} disabled={savingId === selectedTicket.id} onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}>Closed</Button>
                  </Stack>
                </Stack>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button variant="outlined" onClick={() => setSelectedTicketId(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
}

function AdminHistoryPane() {
  const [logs, setLogs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [limit, setLimit] = React.useState('50');

  const loadHistory = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/audit-logs?limit=${limit}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load history');
      setLogs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const actionColor = (action) => {
    if (action.includes('deleted') || action.includes('removed') || action.includes('rejected')) return 'error';
    if (action.includes('created') || action.includes('approved') || action.includes('uploaded')) return 'success';
    if (action.includes('updated') || action.includes('status')) return 'primary';
    return 'default';
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>
          History
        </Typography>
        <Typography sx={{ color: '#637083' }}>
          Review admin actions across enrollments, courses, materials, announcements, support, and account changes.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: 'center' }}>
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Activity Log</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>{logs.length} recent event{logs.length === 1 ? '' : 's'}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <TextField select size="small" label="Show" value={limit} onChange={(event) => setLimit(event.target.value)} sx={{ minWidth: 130 }}>
              <MenuItem value="25">25</MenuItem>
              <MenuItem value="50">50</MenuItem>
              <MenuItem value="100">100</MenuItem>
              <MenuItem value="200">200</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={loadHistory}>Refresh</Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
        ) : logs.length === 0 ? (
          <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>No history recorded yet.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.1}>
            {logs.map((log) => (
              <Box key={log.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: { xs: 1.3, md: 1.5 } }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={1.2}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', mb: 0.4 }}>
                      <Chip label={log.action} size="small" color={actionColor(log.action)} />
                      <Chip label={log.target_type} size="small" />
                      {log.target_id && <Chip label={`#${log.target_id}`} size="small" />}
                    </Stack>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{log.summary}</Typography>
                    <Typography sx={{ color: '#637083', fontSize: 13 }}>
                      {log.actor ? `${log.actor.full_name} (${log.actor.role})` : 'System'} | {formatTimestamp(log.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

function AdminSettingsPane({ user, onUserUpdated, onAdminDataChanged, onAdminToast, setActivePane }) {
  const normalizeSettings = React.useCallback((data = {}, storedPreferences = null) => ({
    platform_profile: {
      platform_name: 'Three13 IT Solutions LMS',
      contact_email: 'INFO@THREE13ITSOLUTIONS.COM',
      contact_phone: '732-470-2431',
      support_email: 'INFO@THREE13ITSOLUTIONS.COM',
      ...(data.platform_profile || {}),
    },
    enrollment_rules: {
      default_enrollment_status: 'pending',
      allow_rejected_reapply: true,
      ...(data.enrollment_rules || {}),
    },
    security: {
      session_timeout_hours: 8,
      password_min_length: 9,
      ...(data.security || {}),
    },
    platform_preferences: {
      language: 'english_us',
      date_format: 'month_day_year',
      time_format: '12h',
      ...(storedPreferences || {}),
      ...(data.platform_preferences || {}),
    },
    course_categories: Array.isArray(data.course_categories) ? data.course_categories : ['Network', 'Security', 'IT Audit', 'AI'],
    notifications: {
      enrollment_decisions: false,
      urgent_announcements: false,
      assignment_posted: false,
      ...(data.notifications || {}),
    },
    updated_at: data.updated_at || null,
  }), []);
  const [settings, setSettings] = React.useState(null);
  const [categoryText, setCategoryText] = React.useState('');
  const [activeSettingsTab, setActiveSettingsTab] = React.useState('platform');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [platformProfileEditing, setPlatformProfileEditing] = React.useState(false);
  const [currentDateTime, setCurrentDateTime] = React.useState(() => new Date());
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({ current_password: '', new_password: '', confirm_password: '' });
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = React.useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = React.useState(null);
  const [twoFactorCode, setTwoFactorCode] = React.useState('');
  const [twoFactorDisablePassword, setTwoFactorDisablePassword] = React.useState('');
  const [savingTwoFactor, setSavingTwoFactor] = React.useState(false);
  const settingsRef = React.useRef(null);
  const categoryTextRef = React.useRef('');
  const platformPreferenceStorageKey = 'three13_platform_preferences';
  useAdminPaneToast(message, setMessage, error, setError, onAdminToast);

  const loadSettings = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/settings`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load settings');
      let storedPreferences = null;
      try {
        storedPreferences = JSON.parse(window.localStorage.getItem(platformPreferenceStorageKey) || 'null');
      } catch {
        storedPreferences = null;
      }
      const mergedData = normalizeSettings(data, storedPreferences);
      setSettings(mergedData);
      settingsRef.current = mergedData;
      setCategoryText(mergedData.course_categories.join('\n'));
      categoryTextRef.current = mergedData.course_categories.join('\n');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  React.useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  React.useEffect(() => {
    categoryTextRef.current = categoryText;
  }, [categoryText]);

  React.useEffect(() => {
    const timer = window.setInterval(() => setCurrentDateTime(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, [normalizeSettings]);

  const updateSection = (section, field, value) => {
    setSettings((current) => {
      const base = normalizeSettings(current || {});
      const next = {
        ...base,
        [section]: {
          ...(base[section] || {}),
          [field]: value,
        },
      };
      settingsRef.current = next;
      return next;
    });
  };

  const updateSectionAndPersist = async (section, field, value, successMessage = 'Settings saved.') => {
    const previousSettings = normalizeSettings(settingsRef.current || settings || {});
    const nextSettings = {
      ...previousSettings,
      [section]: {
        ...(previousSettings?.[section] || {}),
        [field]: value,
      },
    };
    settingsRef.current = nextSettings;
    setSettings(nextSettings);
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await persistSettings(nextSettings, categoryTextRef.current, successMessage);
    } catch (err) {
      settingsRef.current = previousSettings;
      setSettings(previousSettings);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const persistSettings = async (nextSettings, nextCategoryText, successMessage = 'Settings saved.') => {
    const effectiveSettings = normalizeSettings(nextSettings || settingsRef.current || settings || {});
    const effectiveCategoryText = nextCategoryText ?? categoryTextRef.current ?? categoryText;
    const payload = {
      platform_profile: effectiveSettings.platform_profile,
      enrollment_rules: effectiveSettings.enrollment_rules,
      security: {
        ...effectiveSettings.security,
        session_timeout_hours: Number(effectiveSettings.security.session_timeout_hours) || 8,
        password_min_length: Number(effectiveSettings.security.password_min_length) || 9,
      },
      platform_preferences: effectiveSettings.platform_preferences || {
        language: 'english_us',
        date_format: 'month_day_year',
        time_format: '12h',
      },
      course_categories: effectiveCategoryText.split('\n').map((category) => category.trim()).filter(Boolean),
      notifications: effectiveSettings.notifications,
    };
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/settings`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Unable to save settings');
    const mergedData = normalizeSettings(data, payload.platform_preferences);
    try {
      window.localStorage.setItem(platformPreferenceStorageKey, JSON.stringify(mergedData.platform_preferences));
    } catch {
      // Preferences remain in React state if local storage is unavailable.
    }
    setSettings(mergedData);
    settingsRef.current = mergedData;
    setCategoryText(mergedData.course_categories.join('\n'));
    categoryTextRef.current = mergedData.course_categories.join('\n');
    setMessage(successMessage);
    setPlatformProfileEditing(false);
    onAdminDataChanged?.();
    return data;
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await persistSettings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleNotificationSetting = async (field, checked) => {
    const previousSettings = settings;
    const nextSettings = {
      ...settings,
      notifications: {
        ...(settings.notifications || {}),
        [field]: checked,
      },
    };
    setSettings(nextSettings);
    setSaving(true);
    setMessage('');
    setError('');
    try {
      await persistSettings(nextSettings, categoryText, 'Notification preference updated.');
    } catch (err) {
      setSettings(previousSettings);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New password and confirmation do not match');
      return;
    }
    if (passwordForm.new_password.length < 9) {
      setError('New password must be at least 9 characters');
      return;
    }
    setChangingPassword(true);
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to change password');
      setPasswordDialogOpen(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setMessage('Password updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const openTwoFactorDialog = async () => {
    setTwoFactorDialogOpen(true);
    setTwoFactorCode('');
    setTwoFactorDisablePassword('');
    setError('');
    setMessage('');
    if (user?.two_factor_enabled) return;
    setSavingTwoFactor(true);
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/2fa/setup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to start two-factor setup');
      setTwoFactorSetup(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTwoFactor(false);
    }
  };

  const enableTwoFactor = async (event) => {
    event.preventDefault();
    setSavingTwoFactor(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/2fa/enable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: twoFactorCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to enable two-factor authentication');
      onUserUpdated?.(data);
      setTwoFactorDialogOpen(false);
      setTwoFactorCode('');
      setTwoFactorSetup(null);
      setMessage('Two-factor authentication enabled.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTwoFactor(false);
    }
  };

  const disableTwoFactor = async (event) => {
    event.preventDefault();
    setSavingTwoFactor(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/2fa/disable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: twoFactorDisablePassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to disable two-factor authentication');
      onUserUpdated?.(data);
      setTwoFactorDialogOpen(false);
      setTwoFactorDisablePassword('');
      setTwoFactorSetup(null);
      setMessage('Two-factor authentication disabled.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingTwoFactor(false);
    }
  };

  const tabs = [
    { key: 'account', label: 'Account & Security', icon: LockOutlined },
    { key: 'platform', label: 'Platform', icon: GroupOutlined },
    { key: 'notifications', label: 'Notifications', icon: NotificationsOutlined },
  ];

  const rowIconSx = (bg, color) => ({ width: 42, height: 42, borderRadius: 1.2, bgcolor: bg, color, display: 'grid', placeItems: 'center', flexShrink: 0 });
  const rowSx = {
    display: 'grid',
    gridTemplateColumns: { xs: '42px minmax(0, 1fr)', md: '42px minmax(0, 1fr) auto 28px' },
    gap: 1.3,
    alignItems: 'center',
    px: 1.2,
    py: 1.25,
    border: '1px solid rgba(18,60,105,0.10)',
    borderRadius: 1.2,
    bgcolor: '#fff',
  };
  const fieldSx = {
    '& .MuiInputBase-root': { bgcolor: '#fbfcfe', borderRadius: 1 },
    '& .MuiInputBase-input': { fontSize: 13, color: 'primary.dark' },
  };
  const platformPreferences = settings?.platform_preferences || {};
  const languageLabels = {
    english_us: 'English (US)',
    english_uk: 'English (UK)',
  };
  const dateFormatLabels = {
    month_day_year: 'MM-DD-YYYY',
    day_month_year: 'DD-MM-YYYY',
    iso: 'YYYY-MM-DD',
  };
  const timeFormatLabels = {
    '12h': '12-hour clock',
    '24h': '24-hour clock',
  };
  const formatSettingsPreview = () => {
    const previewDate = currentDateTime;
    const dateFormat = platformPreferences.date_format || 'month_day_year';
    const timeFormat = platformPreferences.time_format || '12h';
    const year = previewDate.getFullYear();
    const month = String(previewDate.getMonth() + 1).padStart(2, '0');
    const day = String(previewDate.getDate()).padStart(2, '0');
    const dateText = dateFormat === 'iso'
      ? `${year}-${month}-${day}`
      : dateFormat === 'day_month_year'
        ? `${day}-${month}-${year}`
        : `${month}-${day}-${year}`;
    const timeText = previewDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: timeFormat !== '24h',
    });
    return { dateText, timeText };
  };
  const settingsPreview = formatSettingsPreview();

  const SettingRow = ({ icon: Icon, bg, color, title, detail, badge, children, showChevron = true, actionFlushRight = false }) => (
    <Box sx={{ ...rowSx, gridTemplateColumns: { xs: '42px minmax(0, 1fr)', md: showChevron ? '42px minmax(0, 1fr) auto 28px' : '42px minmax(0, 1fr) auto' } }}>
      <Box sx={rowIconSx(bg, color)}><Icon fontSize="small" /></Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: 14 }}>{title}</Typography>
        <Typography sx={{ color: '#637083', fontSize: 12.5 }}>{detail}</Typography>
      </Box>
      <Box sx={{ justifySelf: { md: 'end' }, gridColumn: { xs: '1 / -1', md: actionFlushRight ? '3 / 5' : '3' }, pr: { md: actionFlushRight ? 0 : undefined } }}>
        {children || (badge ? <Chip label={badge} size="small" sx={{ bgcolor: '#e8f7ef', color: '#16805f', fontWeight: 850 }} /> : null)}
      </Box>
      {showChevron && <ChevronRightOutlined sx={{ display: { xs: 'none', md: 'block' }, color: '#526273', justifySelf: 'end' }} />}
    </Box>
  );

  const AccountContent = () => (
    <Stack spacing={1.1}>
      <Box sx={{ p: 1.2, border: '1px solid rgba(18,60,105,0.10)', borderRadius: 1.2, bgcolor: '#fff' }}>
        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 1.2 }}>
          <Box sx={rowIconSx('#eaf2ff', '#1b6ef3')}><PersonOutlineOutlined fontSize="small" /></Box>
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Profile Information</Typography>
            <Typography sx={{ color: '#637083', fontSize: 12.5 }}>Admin account details used across the platform.</Typography>
          </Box>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.1 }}>
          {[
            ['Full name', user?.full_name === 'Admin User' ? 'Administrator' : user?.full_name || 'Administrator', PersonOutlineOutlined],
            ['Email', user?.email || 'Not set', EmailOutlined],
            ['Phone number', user?.phone || '732-470-2431', PhoneOutlined],
            ['Role', user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : 'Admin', ShieldOutlined],
          ].map(([label, value, Icon]) => (
            <Box key={label} sx={{ display: 'grid', gridTemplateColumns: '32px minmax(0, 1fr)', gap: 1, alignItems: 'center', p: 1, border: '1px solid rgba(18,60,105,0.08)', borderRadius: 1, bgcolor: '#fbfcfe' }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: '#eef3f8', color: 'primary.dark', display: 'grid', placeItems: 'center' }}><Icon fontSize="small" /></Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: '#637083', fontSize: 11.5 }}>{label}</Typography>
                <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13.5 }}>{value}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      <SettingRow icon={LockOutlined} bg="#fff0e7" color="#f05a28" title="Change Password" detail="Update the administrator account password." showChevron={false} actionFlushRight>
        <Button type="button" variant="outlined" size="small" startIcon={<LockOutlined />} onClick={() => setPasswordDialogOpen(true)}>
          Change password
        </Button>
      </SettingRow>
      <SettingRow icon={ShieldOutlined} bg="#e8f7ef" color="#16805f" title="Two-Factor Authentication" detail="Protect this administrator account with an authenticator app." badge={user?.two_factor_enabled ? 'Enabled' : 'Disabled'} showChevron={false} actionFlushRight>
        <Button type="button" variant="outlined" size="small" startIcon={<ShieldOutlined />} onClick={openTwoFactorDialog}>
          {user?.two_factor_enabled ? 'Manage 2FA' : 'Set up 2FA'}
        </Button>
      </SettingRow>
    </Stack>
  );

  const PlatformContent = () => (
    <Stack spacing={1.2}>
      <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mb: 0.2 }}>
        <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#f4ecff', color: '#7c3aed', display: 'grid', placeItems: 'center' }}>
          <GroupOutlined />
        </Box>
        <Box>
          <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.35rem' }}>Platform</Typography>
          <Typography sx={{ color: '#637083' }}>Customize platform profile and default preferences.</Typography>
        </Box>
      </Stack>

      <Box sx={{ p: 1.8, border: '1px solid rgba(18,60,105,0.10)', borderRadius: 1.2, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.2} sx={{ mb: 1.4 }}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box sx={rowIconSx('#f4ecff', '#7c3aed')}><ViewModuleOutlined fontSize="small" /></Box>
            <Box>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Platform Profile</Typography>
              <Typography sx={{ color: '#637083', fontSize: 12.5 }}>Update platform name and contact details.</Typography>
            </Box>
          </Stack>
          <Button
            type={platformProfileEditing ? 'submit' : 'button'}
            variant="outlined"
            size="small"
            startIcon={<EditOutlined />}
            onClick={platformProfileEditing ? undefined : () => setPlatformProfileEditing(true)}
            disabled={saving}
          >
            {platformProfileEditing ? 'Save' : 'Edit'}
          </Button>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.1 }}>
          <TextField size="small" label="Platform name" value={settings.platform_profile.platform_name || ''} onChange={(event) => updateSection('platform_profile', 'platform_name', event.target.value)} disabled={!platformProfileEditing} sx={fieldSx} />
          <TextField size="small" label="Contact phone" value={settings.platform_profile.contact_phone || ''} onChange={(event) => updateSection('platform_profile', 'contact_phone', event.target.value)} disabled={!platformProfileEditing} sx={fieldSx} />
          <TextField size="small" label="Contact email" value={settings.platform_profile.contact_email || ''} onChange={(event) => updateSection('platform_profile', 'contact_email', event.target.value)} disabled={!platformProfileEditing} sx={fieldSx} />
          <TextField size="small" label="Support email" value={settings.platform_profile.support_email || ''} onChange={(event) => updateSection('platform_profile', 'support_email', event.target.value)} disabled={!platformProfileEditing} sx={fieldSx} />
        </Box>
      </Box>

      <SettingRow icon={GroupOutlined} bg="#e8f7ef" color="#16805f" title="Rejected Student Reapply" detail="Allow rejected learners to submit a new request." showChevron={false}>
        <FormControlLabel control={<Switch checked={Boolean(settings.enrollment_rules.allow_rejected_reapply)} onChange={(event) => updateSectionAndPersist('enrollment_rules', 'allow_rejected_reapply', event.target.checked, 'Reapply preference updated.')} disabled={saving} />} label={settings.enrollment_rules.allow_rejected_reapply ? 'Allowed' : 'Blocked'} sx={{ color: 'primary.dark', justifySelf: { md: 'end' } }} />
      </SettingRow>
      <SettingRow icon={LinkOutlined} bg="#fff0e7" color="#f05a28" title="Platform Language" detail="Select the default language used across the platform." showChevron={false}>
        <TextField select size="small" label="Language" value={platformPreferences.language || 'english_us'} onChange={(event) => updateSectionAndPersist('platform_preferences', 'language', event.target.value, 'Language preference updated.')} disabled={saving} sx={{ ...fieldSx, width: { xs: '100%', md: 220 } }}>
          <MenuItem value="english_us">English (US)</MenuItem>
          <MenuItem value="english_uk">English (UK)</MenuItem>
        </TextField>
      </SettingRow>
      <SettingRow icon={CalendarTodayOutlined} bg="#eaf2ff" color="#1b6ef3" title="Date & Time Format" detail="Configure how dates and times are displayed." showChevron={false}>
        <Stack spacing={0.6} sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
            <TextField
              select
              size="small"
              label="Date"
              value={platformPreferences.date_format || 'month_day_year'}
              onChange={(event) => updateSectionAndPersist('platform_preferences', 'date_format', event.target.value, 'Date format updated.')}
              disabled={saving}
              SelectProps={{ renderValue: (value) => dateFormatLabels[value] || 'MM-DD-YYYY' }}
              sx={{ ...fieldSx, width: { xs: '100%', md: 170 } }}
            >
              <MenuItem value="month_day_year">MM-DD-YYYY</MenuItem>
              <MenuItem value="day_month_year">DD-MM-YYYY</MenuItem>
              <MenuItem value="iso">YYYY-MM-DD</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Time"
              value={platformPreferences.time_format || '12h'}
              onChange={(event) => updateSectionAndPersist('platform_preferences', 'time_format', event.target.value, 'Time format updated.')}
              disabled={saving}
              SelectProps={{ renderValue: (value) => timeFormatLabels[value] || '12-hour clock' }}
              sx={{ ...fieldSx, width: { xs: '100%', md: 150 } }}
            >
              <MenuItem value="12h">12-hour clock</MenuItem>
              <MenuItem value="24h">24-hour clock</MenuItem>
            </TextField>
          </Stack>
          <Typography sx={{ color: '#526273', fontSize: 12, textAlign: { xs: 'left', md: 'right' } }}>
            Preview: {settingsPreview.dateText} · {settingsPreview.timeText}
          </Typography>
        </Stack>
      </SettingRow>
    </Stack>
  );

  const NotificationSettings = () => (
    <Stack spacing={1.1}>
      <SettingRow icon={GroupOutlined} bg="#e8f7ef" color="#16805f" title="Enrollment Approved / Rejected" detail="Notify learners when admin reviews access." showChevron={false}>
        <Switch checked={Boolean(settings.notifications.enrollment_decisions)} onChange={(event) => toggleNotificationSetting('enrollment_decisions', event.target.checked)} disabled={saving} />
      </SettingRow>
      <SettingRow icon={CampaignOutlined} bg="#fff0e7" color="#f05a28" title="Urgent Announcements" detail="Send urgent announcement notifications." showChevron={false}>
        <Switch checked={Boolean(settings.notifications.urgent_announcements)} onChange={(event) => toggleNotificationSetting('urgent_announcements', event.target.checked)} disabled={saving} />
      </SettingRow>
      <SettingRow icon={AssignmentOutlined} bg="#eaf2ff" color="#1b6ef3" title="Assignment Posted" detail="Notify students when new assignments are posted." showChevron={false}>
        <Switch checked={Boolean(settings.notifications.assignment_posted)} onChange={(event) => toggleNotificationSetting('assignment_posted', event.target.checked)} disabled={saving} />
      </SettingRow>
    </Stack>
  );

  const activeContent = {
    account: <AccountContent />,
    platform: <PlatformContent />,
    notifications: <NotificationSettings />,
  }[activeSettingsTab];

  return (
    <Stack spacing={2.2}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.5}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' } }}>Settings</Typography>
            <SettingsOutlined sx={{ color: '#637083', fontSize: 28 }} />
          </Stack>
          <Typography sx={{ color: '#637083' }}>Manage your platform, security, preferences, and system configurations.</Typography>
        </Box>
        {!loading && settings && (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={loadSettings} disabled={saving}>Discard changes</Button>
            <Button component="button" type="submit" form="admin-settings-form" variant="contained" color="secondary" disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</Button>
          </Stack>
        )}
      </Stack>

      {loading || !settings ? (
        <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
      ) : (
        <Box component="form" id="admin-settings-form" onSubmit={saveSettings}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px', xl: 'minmax(0, 1fr) 330px' }, gap: { xs: 2.2, lg: 1.4, xl: 2.2 }, alignItems: 'start' }}>
            <Stack spacing={1.5}>
              <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 0.5, overflowX: 'auto', boxShadow: '0 12px 32px rgba(18,60,105,0.04)' }}>
                <Stack direction="row" spacing={0.4} sx={{ minWidth: 760 }}>
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeSettingsTab === tab.key;
                    return (
                      <Button key={tab.key} type="button" startIcon={<Icon sx={{ fontSize: 17 }} />} onClick={() => setActiveSettingsTab(tab.key)} sx={{ color: active ? '#f05a28' : '#526273', bgcolor: active ? 'rgba(240,90,40,0.08)' : 'transparent', borderRadius: 1, px: 1.4, py: 1.1, borderBottom: active ? '2px solid #f05a28' : '2px solid transparent', whiteSpace: 'nowrap', '&:hover': { bgcolor: active ? 'rgba(240,90,40,0.1)' : '#f8fafc' } }}>
                        {tab.label}
                      </Button>
                    );
                  })}
                </Stack>
              </Box>

              <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 1.5, md: 2 }, boxShadow: '0 16px 42px rgba(18,60,105,0.05)' }}>
                {activeContent}
              </Box>
            </Stack>

            <Stack spacing={1.4} sx={{ position: { lg: 'sticky' }, top: 92, minWidth: 0 }}>
              <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, boxShadow: '0 16px 42px rgba(18,60,105,0.05)' }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.3 }}>Platform Overview</Typography>
                {[
                  ['Platform name', settings.platform_profile.platform_name || 'Three13 IT Solutions LMS', ViewModuleOutlined, '#7c3aed', '#f4ecff'],
                  ['Contact phone', settings.platform_profile.contact_phone || '732-470-2431', PhoneOutlined, '#16805f', '#e8f7ef'],
                  ['Contact email', settings.platform_profile.contact_email || 'INFO@THREE13ITSOLUTIONS.COM', EmailOutlined, '#f05a28', '#fff0e7'],
                  ['Support email', settings.platform_profile.support_email || 'INFO@THREE13ITSOLUTIONS.COM', SupportAgentOutlined, '#1b6ef3', '#eaf2ff'],
                  ['Default enrollment status', (settings.enrollment_rules.default_enrollment_status || 'pending').replace('_', ' '), EmailOutlined, '#1b6ef3', '#eaf2ff'],
                  ['Student reapply', settings.enrollment_rules.allow_rejected_reapply ? 'Allowed' : 'Blocked', GroupOutlined, '#16805f', '#e8f7ef', true],
                  ['Language', languageLabels[platformPreferences.language || 'english_us'], LinkOutlined, '#f05a28', '#fff0e7'],
                  ['Date & time', `${settingsPreview.dateText} · ${settingsPreview.timeText}`, CalendarTodayOutlined, '#1b6ef3', '#eaf2ff'],
                ].map(([label, value, Icon, color, bg, chip]) => (
                  <Stack key={label} direction="row" spacing={1} alignItems="center" sx={{ py: 0.85, borderBottom: '1px solid rgba(18,60,105,0.06)' }}>
                    <Box sx={{ width: 30, height: 30, borderRadius: 1, bgcolor: bg, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon sx={{ fontSize: 17 }} /></Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 13 }}>{label}</Typography>
                      {chip ? (
                        <Chip label={value} size="small" sx={{ mt: 0.3, height: 22, bgcolor: value === 'Allowed' ? '#dff5e9' : '#eef3f8', color: value === 'Allowed' ? '#16805f' : '#526273', fontWeight: 850 }} />
                      ) : (
                        <Typography noWrap sx={{ color: '#526273', fontSize: 12, textTransform: label === 'Default enrollment status' ? 'capitalize' : 'none' }}>{value}</Typography>
                      )}
                    </Box>
                  </Stack>
                ))}
              </Box>

              <Box sx={{ bgcolor: '#eaf5ff', border: '1px solid rgba(27,110,243,0.10)', borderRadius: 1.5, p: 2, boxShadow: '0 16px 42px rgba(18,60,105,0.04)' }}>
                <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1.2 }}>
                  <HelpOutlineOutlined sx={{ color: '#1b6ef3', mt: 0.1 }} />
                  <Box>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 0.2 }}>Go To Support</Typography>
                    <Typography sx={{ color: '#526273', fontSize: 13 }}>Open the support workspace to manage tickets and requests.</Typography>
                  </Box>
                </Stack>
                <Button fullWidth variant="outlined" endIcon={<OpenInNewOutlined fontSize="small" />} onClick={() => setActivePane?.('support')}>
                  Open Support
                </Button>
              </Box>

              <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, boxShadow: '0 16px 42px rgba(18,60,105,0.05)', display: activeSettingsTab === 'account' ? 'block' : 'none' }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.2 }}>Security Status</Typography>
                {[['Password Strength', 'Strong'], ['Two-Factor', user?.two_factor_enabled ? 'Enabled' : 'Disabled'], ['Session Timeout', `${settings.security.session_timeout_hours || 8} hours`]].map(([label, value]) => (
                  <Stack key={label} direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ py: 0.95, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
                    <Stack direction="row" spacing={1} alignItems="center"><CheckCircleOutlined sx={{ color: '#16805f', fontSize: 18 }} /><Typography sx={{ color: '#526273', fontSize: 13 }}>{label}</Typography></Stack>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 750, fontSize: 13 }}>{value}</Typography>
                  </Stack>
                ))}
              </Box>
            </Stack>
          </Box>
        </Box>
      )}

      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Change Password</DialogTitle>
        <DialogContent>
          <Stack component="form" id="admin-change-password-form" onSubmit={changePassword} spacing={1.4} sx={{ pt: 1 }}>
            <TextField
              label="Current password"
              type="password"
              value={passwordForm.current_password}
              onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))}
              required
              autoComplete="current-password"
            />
            <TextField
              label="New password"
              type="password"
              value={passwordForm.new_password}
              onChange={(event) => setPasswordForm((current) => ({ ...current, new_password: event.target.value }))}
              required
              autoComplete="new-password"
              helperText="Use at least 9 characters."
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={passwordForm.confirm_password}
              onChange={(event) => setPasswordForm((current) => ({ ...current, confirm_password: event.target.value }))}
              required
              autoComplete="new-password"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setPasswordDialogOpen(false)} disabled={changingPassword}>Cancel</Button>
          <Button type="submit" form="admin-change-password-form" variant="contained" color="secondary" disabled={changingPassword}>
            {changingPassword ? 'Updating...' : 'Update password'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={twoFactorDialogOpen} onClose={() => setTwoFactorDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Two-Factor Authentication</DialogTitle>
        <DialogContent>
          {user?.two_factor_enabled ? (
            <Stack component="form" id="admin-disable-2fa-form" onSubmit={disableTwoFactor} spacing={1.5} sx={{ pt: 1 }}>
              <Alert severity="success">Two-factor authentication is currently enabled for this admin account.</Alert>
              <Typography sx={{ color: '#526273', fontSize: 14 }}>To disable it, confirm your current password.</Typography>
              <TextField
                label="Current password"
                type="password"
                value={twoFactorDisablePassword}
                onChange={(event) => setTwoFactorDisablePassword(event.target.value)}
                required
                autoComplete="current-password"
              />
            </Stack>
          ) : (
            <Stack component="form" id="admin-enable-2fa-form" onSubmit={enableTwoFactor} spacing={1.5} sx={{ pt: 1 }}>
              <Typography sx={{ color: '#526273', fontSize: 14 }}>
                Add this account to Google Authenticator, then enter the 6-digit code to finish setup.
              </Typography>
              {savingTwoFactor && !twoFactorSetup ? (
                <Stack alignItems="center" sx={{ py: 3 }}><CircularProgress size={26} /></Stack>
              ) : twoFactorSetup && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, gap: 2, alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(twoFactorSetup.otpauth_url)}`}
                    alt="Authenticator setup QR code"
                    sx={{ width: 160, height: 160, borderRadius: 1, border: '1px solid rgba(18,60,105,0.12)', bgcolor: '#fff' }}
                  />
                  <Stack spacing={1}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 14 }}>Manual setup key</Typography>
                    <Box sx={{ bgcolor: '#f3f7fb', border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1, p: 1.2, color: 'primary.dark', fontWeight: 850, overflowWrap: 'anywhere', fontSize: 13 }}>
                      {twoFactorSetup.secret}
                    </Box>
                    <Typography sx={{ color: '#637083', fontSize: 12 }}>
                      If the QR code does not load, enter this key manually in Google Authenticator.
                    </Typography>
                  </Stack>
                </Box>
              )}
              <TextField
                label="6-digit authenticator code"
                value={twoFactorCode}
                onChange={(event) => setTwoFactorCode(event.target.value)}
                required
                inputProps={{ inputMode: 'numeric', maxLength: 8 }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setTwoFactorDialogOpen(false)} disabled={savingTwoFactor}>Cancel</Button>
          {user?.two_factor_enabled ? (
            <Button type="submit" form="admin-disable-2fa-form" variant="contained" color="error" disabled={savingTwoFactor}>
              {savingTwoFactor ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          ) : (
            <Button type="submit" form="admin-enable-2fa-form" variant="contained" color="secondary" disabled={savingTwoFactor || !twoFactorSetup}>
              {savingTwoFactor ? 'Saving...' : 'Enable 2FA'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function AdminPortal({ user, onSignOut, onUserUpdated }) {
  const adminPaneKeys = adminNavItems.map((item) => item.key);
  const adminDisplayName = user?.full_name === 'Admin User' ? 'Administrator' : user?.full_name;
  const adminActivePaneStorageKey = `three13_admin_active_pane_${user?.id || user?.email || 'admin'}`;
  const [activePane, setActivePane] = React.useState(() => {
    try {
      if (window.sessionStorage.getItem('three13_admin_start_pane') === 'dashboard') {
        window.sessionStorage.removeItem('three13_admin_start_pane');
        window.localStorage.setItem(adminActivePaneStorageKey, 'dashboard');
        return 'dashboard';
      }
      const savedPane = window.localStorage.getItem(adminActivePaneStorageKey);
      return adminPaneKeys.includes(savedPane) ? savedPane : 'dashboard';
    } catch {
      return 'dashboard';
    }
  });
  const [paneContext, setPaneContext] = React.useState({});
  const [adminRefreshKey, setAdminRefreshKey] = React.useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notificationAnchor, setNotificationAnchor] = React.useState(null);
  const [adminNotifications, setAdminNotifications] = React.useState([]);
  const [adminToast, setAdminToast] = React.useState(null);
  const adminNotificationStorageKey = `three13_admin_cleared_notifications_${user?.id || user?.email || 'admin'}`;
  const [clearedAdminNotificationIds, setClearedAdminNotificationIds] = React.useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(adminNotificationStorageKey) || '[]');
    } catch {
      return [];
    }
  });
  const activeItem = adminNavItems.find((item) => item.key === activePane) || adminNavItems[0];
  const visibleAdminNotifications = adminNotifications.filter((notification) => !clearedAdminNotificationIds.includes(notification.id));
  const markAdminDataChanged = React.useCallback(() => {
    setAdminRefreshKey((current) => current + 1);
  }, []);

  const showAdminToast = React.useCallback((text, severity = 'success') => {
    if (!text) return;
    setAdminToast({ text, severity, id: Date.now() });
  }, []);

  React.useEffect(() => {
    if (!adminToast) return undefined;
    const timeoutId = window.setTimeout(() => setAdminToast(null), 4200);
    return () => window.clearTimeout(timeoutId);
  }, [adminToast]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(adminActivePaneStorageKey, activePane);
    } catch {
      // Remembering the current admin section is a convenience.
    }
  }, [activePane, adminActivePaneStorageKey]);

  const openAdminPane = React.useCallback((pane, context = {}) => {
    setPaneContext(context);
    setActivePane(pane);
  }, []);

  const updateClearedAdminNotifications = React.useCallback((ids) => {
    const uniqueIds = [...new Set(ids)];
    setClearedAdminNotificationIds(uniqueIds);
    try {
      window.localStorage.setItem(adminNotificationStorageKey, JSON.stringify(uniqueIds));
    } catch {
      // Clearing notifications should still work in-memory if storage is unavailable.
    }
  }, [adminNotificationStorageKey]);

  const clearAdminNotification = React.useCallback((notificationId) => {
    if (!notificationId) return;
    updateClearedAdminNotifications([...clearedAdminNotificationIds, notificationId]);
  }, [clearedAdminNotificationIds, updateClearedAdminNotifications]);

  const clearAllAdminNotifications = React.useCallback(() => {
    updateClearedAdminNotifications([
      ...clearedAdminNotificationIds,
      ...adminNotifications.map((notification) => notification.id).filter(Boolean),
    ]);
  }, [adminNotifications, clearedAdminNotificationIds, updateClearedAdminNotifications]);

  React.useEffect(() => {
    let mounted = true;
    const loadAdminNotifications = async () => {
      try {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/dashboard-summary`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await response.json();
        if (mounted && response.ok) {
          setAdminNotifications((data.notifications || []).slice(0, 8));
        }
      } catch {
        if (mounted) setAdminNotifications([]);
      }
    };

    loadAdminNotifications();
    return () => { mounted = false; };
  }, [adminRefreshKey]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fb', display: { md: 'grid' }, gridTemplateColumns: { md: '252px minmax(0, 1fr)', xl: '280px minmax(0, 1fr)' } }}>
      <Box sx={{ bgcolor: '#082540', color: '#fff', p: { xs: 2, md: 2 }, position: { md: 'sticky' }, top: 0, height: { md: '100vh' }, overflowY: 'auto', display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box component="img" src="/images/logo.png" alt="Three13 IT Solutions" sx={{ height: 52, objectFit: 'contain' }} />
          <Chip label="Admin" size="small" sx={{ bgcolor: 'rgba(240,90,40,0.16)', color: '#ffd7c8', fontWeight: 800 }} />
        </Stack>

        <Stack spacing={0.8} sx={{ flex: 1 }}>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.key === activePane;
            return (
              <Button
                key={item.key}
                onClick={() => {
                  openAdminPane(item.key);
                }}
                startIcon={<Icon />}
                sx={{
                  justifyContent: 'flex-start',
                  color: active ? '#fff' : 'rgba(255,255,255,0.76)',
                  bgcolor: active ? 'rgba(240,90,40,0.95)' : 'transparent',
                  border: active ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
                  borderRadius: 1,
                  px: 1.4,
                  py: 1,
                  minHeight: 42,
                  '&:hover': { bgcolor: active ? '#f05a28' : 'rgba(255,255,255,0.08)', color: '#fff' },
                }}
              >
                {item.label}
              </Button>
            );
          })}

          <Box sx={{ flex: 1 }} />
          <Box sx={{ mt: 3, p: 2, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.4 }}>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 14 }}>Quick Actions</Typography>
              <KeyboardArrowUpOutlined sx={{ fontSize: 18, color: 'rgba(255,255,255,0.72)' }} />
            </Stack>
            <Stack spacing={0.8}>
              {(activePane === 'cohorts'
                ? [
                    { label: 'Create Cohort', pane: 'cohorts', icon: CalendarTodayOutlined },
                    { label: 'Import Alumni', pane: 'students', icon: DownloadOutlined },
                    { label: 'Export Report', pane: 'cohorts', icon: ArticleOutlined },
                    { label: 'Send Announcement', pane: 'announcements', icon: CampaignOutlined },
                  ]
                : activePane === 'teachers'
                  ? [
                      { label: 'Add Teacher', pane: 'teachers', icon: PersonOutlineOutlined },
                      { label: 'Export Teachers', pane: 'teachers', icon: DownloadOutlined },
                      { label: 'Send Announcement', pane: 'announcements', icon: CampaignOutlined },
                    ]
                  : [
                      { label: 'Create Course', pane: 'courses', icon: MenuBookOutlined },
                      { label: 'Send Announcement', pane: 'announcements', icon: CampaignOutlined },
                    ]).map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    onClick={() => openAdminPane(action.pane)}
                    startIcon={<Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)', display: 'grid', placeItems: 'center' }}><Icon sx={{ fontSize: 18 }} /></Box>}
                    sx={{ justifyContent: 'flex-start', color: '#fff', px: 0, py: 0.4, fontSize: 12, '& .MuiButton-startIcon': { mr: 1 }, '&:hover': { bgcolor: 'transparent', color: '#ffd7c8' } }}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </Stack>
          </Box>
          <Box sx={{ pt: 3, color: 'rgba(255,255,255,0.58)', fontSize: 12 }}>
            <Typography sx={{ fontSize: 12 }}>© 2026 Three13</Typography>
            <Typography sx={{ fontSize: 12 }}>All rights reserved</Typography>
          </Box>
        </Stack>
      </Box>
      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{ sx: { width: 286, bgcolor: '#082540', color: '#fff', p: 2 } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Box component="img" src="/images/logo.png" alt="Three13 IT Solutions" sx={{ height: { md: 48, xl: 52 }, objectFit: 'contain' }} />
          <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#fff' }}><CloseOutlined /></IconButton>
        </Stack>
        <Stack spacing={0.8}>
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.key === activePane;
            return (
              <Button
                key={item.key}
                onClick={() => {
                  openAdminPane(item.key);
                  setMobileMenuOpen(false);
                }}
                startIcon={<Icon />}
                sx={{
                  justifyContent: 'flex-start',
                  color: active ? '#fff' : 'rgba(255,255,255,0.78)',
                  bgcolor: active ? 'rgba(240,90,40,0.95)' : 'transparent',
                  border: active ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
                  borderRadius: 1,
                  px: { md: 1.15, xl: 1.4 },
                  py: 1,
                  '&:hover': { bgcolor: active ? '#f05a28' : 'rgba(255,255,255,0.08)', color: '#fff' },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
      </Drawer>

      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid rgba(18,60,105,0.12)', px: { xs: 2, md: 2.5, xl: 4 }, py: { xs: 1.6, md: 1.35, xl: 2 }, position: 'sticky', top: 0, zIndex: 1200 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'center' }} spacing={{ xs: 1.5, md: 1.2 }}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                component="img"
                src="/images/adminprofile.png"
                alt="Three13 administrator profile"
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  objectFit: 'contain',
                  bgcolor: '#fff',
                  border: '1px solid rgba(18,60,105,0.14)',
                  p: 0.45,
                  flexShrink: 0,
                }}
              />
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{adminDisplayName}</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13 }}>{user.email}</Typography>
              </Box>
            </Stack>
            <Box sx={{ width: { xs: '100%', lg: 420 }, minHeight: 46, display: 'flex', alignItems: 'center' }}>
              {adminToast ? (
                <Alert
                  key={adminToast.id}
                  severity={adminToast.severity}
                  onClose={() => setAdminToast(null)}
                  sx={{
                    width: '100%',
                    py: 0.25,
                    borderRadius: 999,
                    alignItems: 'center',
                    boxShadow: '0 10px 28px rgba(18,60,105,0.10)',
                    '& .MuiAlert-message': {
                      py: 0.7,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: 750,
                    },
                  }}
                >
                  {adminToast.text}
                </Alert>
              ) : (
                <Box sx={{ width: '100%', px: 2, py: 1.1, border: '1px solid rgba(18,60,105,0.12)', borderRadius: 999, bgcolor: '#f8fafc', color: '#637083', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Platform alerts will appear here.
                  </Box>
                </Box>
              )}
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                sx={{ display: { xs: 'inline-flex', md: 'none' }, border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, color: 'primary.dark' }}
                aria-label="Open menu"
              >
                <MenuOutlined />
              </IconButton>
              <IconButton onClick={(event) => setNotificationAnchor(event.currentTarget)} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5 }}>
                <Badge badgeContent={visibleAdminNotifications.length || null} color="secondary" max={99}>
                  <NotificationsOutlined sx={{ color: 'primary.dark' }} />
                </Badge>
              </IconButton>
              <Button component={RouterLink} to="/" variant="outlined">Home</Button>
              <Button variant="contained" color="secondary" onClick={onSignOut}>Sign out</Button>
            </Stack>
          </Stack>
          <Popover
            open={Boolean(notificationAnchor)}
            anchorEl={notificationAnchor}
            onClose={() => setNotificationAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { width: 360, maxWidth: 'calc(100vw - 32px)', borderRadius: 1.5, mt: 1, boxShadow: '0 18px 48px rgba(18,60,105,0.18)' } }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #eef3f8' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                <Box>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Admin Notifications</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 12 }}>{visibleAdminNotifications.length} unread platform event{visibleAdminNotifications.length === 1 ? '' : 's'}.</Typography>
                </Box>
                {visibleAdminNotifications.length > 0 && (
                  <Button size="small" variant="text" onClick={clearAllAdminNotifications}>
                    Clear all
                  </Button>
                )}
              </Stack>
            </Box>
            <Stack sx={{ maxHeight: 390, overflowY: 'auto' }}>
              {visibleAdminNotifications.length === 0 ? (
                <Typography sx={{ color: '#637083', fontSize: 14, p: 2 }}>No notifications yet.</Typography>
              ) : visibleAdminNotifications.map((notification) => (
                <Box
                  key={notification.id}
                  onClick={() => {
                    clearAdminNotification(notification.id);
                    if (notification.pane) openAdminPane(notification.pane);
                    setNotificationAnchor(null);
                  }}
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    color: 'inherit',
                    borderRadius: 0,
                    px: 2,
                    py: 1.35,
                    borderBottom: '1px solid #eef3f8',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f8fafc' },
                  }}
                >
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ width: '100%' }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: 1.2, bgcolor: notification.type === 'enrollment' ? '#fff0e7' : notification.type === 'submission' ? '#e2f7ed' : '#e6f0ff', color: notification.type === 'enrollment' ? '#f05a28' : notification.type === 'submission' ? '#16a36d' : '#1b7df3', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      {notification.type === 'enrollment' ? <GroupOutlined fontSize="small" /> : notification.type === 'submission' ? <AssignmentOutlined fontSize="small" /> : <CampaignOutlined fontSize="small" />}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{notification.title}</Typography>
                      <Typography noWrap sx={{ color: '#637083', fontSize: 12 }}>{notification.detail}</Typography>
                    </Box>
                    <Typography sx={{ color: '#637083', fontSize: 11, whiteSpace: 'nowrap' }}>
                      {notification.created_at ? formatTimestamp(notification.created_at, { month: 'short', day: 'numeric' }) : 'Now'}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        event.stopPropagation();
                        clearAdminNotification(notification.id);
                      }}
                      sx={{ ml: 0.2 }}
                    >
                      <MoreHorizOutlined fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Popover>
        </Box>

        <Box component="main" sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
          {activePane === 'dashboard' && <AdminDashboardHome refreshKey={adminRefreshKey} setActivePane={openAdminPane} />}
          {activePane === 'students' && <AdminStudentsPane onAdminDataChanged={markAdminDataChanged} onOpenActivityLink={openAdminPane} onAdminToast={showAdminToast} />}
          {activePane === 'cohorts' && <AdminCohortsPane onAdminDataChanged={markAdminDataChanged} setActivePane={openAdminPane} onAdminToast={showAdminToast} />}
          {activePane === 'teachers' && <AdminTeachersPane onAdminDataChanged={markAdminDataChanged} onAdminToast={showAdminToast} />}
          {activePane === 'courses' && <AdminCoursesPane onAdminDataChanged={markAdminDataChanged} onOpenMaterials={(courseId) => openAdminPane('materials', { courseId })} onAdminToast={showAdminToast} />}
          {activePane === 'materials' && <AdminCourseMaterialsPane onAdminDataChanged={markAdminDataChanged} initialCourseId={paneContext.courseId || ''} onAdminToast={showAdminToast} />}
          {activePane === 'assignments' && <AdminAssignmentsPane initialCourseId={paneContext.courseId || ''} onOpenMaterials={(courseId) => openAdminPane('materials', { courseId })} onAdminToast={showAdminToast} />}
          {activePane === 'submissions' && <TeacherSubmissionsPane scope="admin" onTeacherToast={showAdminToast} />}
          {activePane === 'announcements' && <AdminAnnouncementsPane onAdminDataChanged={markAdminDataChanged} initialCourseId={paneContext.courseId || ''} onAdminToast={showAdminToast} />}
          {activePane === 'community' && <AdminCommunityPane />}
          {activePane === 'support' && <AdminSupportPane onAdminDataChanged={markAdminDataChanged} onAdminToast={showAdminToast} />}
          {activePane === 'settings' && <AdminSettingsPane user={user} onUserUpdated={onUserUpdated} onAdminDataChanged={markAdminDataChanged} onAdminToast={showAdminToast} setActivePane={openAdminPane} />}
          {!['dashboard', 'students', 'cohorts', 'teachers', 'courses', 'materials', 'assignments', 'submissions', 'announcements', 'community', 'support', 'settings'].includes(activePane) && <AdminPlaceholderPane item={activeItem} />}
        </Box>
      </Box>
    </Box>
  );
}

function StudentEnrollmentStatus() {
  const [status, setStatus] = React.useState({ approved: [], pending: [], rejected: [] });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let isMounted = true;

    const loadEnrollmentStatus = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/enrollments`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to load course access');
        if (isMounted) setStatus(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadEnrollmentStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  const hasActivity = status.approved.length > 0 || status.pending.length > 0 || status.rejected.length > 0;

  const renderCourseGroup = (title, courses, color, emptyText) => (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{title}</Typography>
        <Chip label={courses.length} size="small" color={color} sx={{ fontWeight: 800 }} />
      </Stack>
      {courses.length === 0 ? (
        <Typography sx={{ color: '#637083', fontSize: 14 }}>{emptyText}</Typography>
      ) : (
        <Stack spacing={1}>
          {courses.map((item) => (
            <Box key={`${item.status}-${item.course.id}`} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.4 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.2}>
                <Box>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{item.course.title}</Typography>
                  {item.course.description && (
                    <Typography sx={{ color: '#637083', fontSize: 13 }}>{item.course.description}</Typography>
                  )}
                </Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                  <Chip label={item.status} size="small" color={color} />
                  {item.status === 'approved' && (
                    <Button variant="outlined" size="small" disabled>
                      Course page coming soon
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" sx={{ color: 'primary.dark', fontSize: { xs: '1.45rem', md: '1.85rem' }, mb: 0.5 }}>
        My Course Access
      </Typography>
      <Typography sx={{ color: '#637083', fontSize: 14, mb: 2 }}>
        Approved courses appear here after admin confirms manual enrollment.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : !hasActivity ? (
        <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}>
          <Typography sx={{ color: 'primary.dark', fontWeight: 700 }}>No course enrollment activity yet.</Typography>
        </Box>
      ) : (
        <>
          {renderCourseGroup('Approved Courses', status.approved, 'success', 'No approved courses yet.')}
          {renderCourseGroup('Pending Requests', status.pending, 'warning', 'No pending requests.')}
          {renderCourseGroup('Rejected Requests', status.rejected, 'error', 'No rejected requests.')}
        </>
      )}
    </Box>
  );
}

function StudentDashboardHome({ setActivePane, user, onOpenCourse }) {
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/dashboard-summary`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to load student dashboard');
        if (isMounted) setSummary(data);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  const approvedCourses = summary?.approved_courses || [];
  const pendingActivation = user && !user.is_active;
  const firstName = user?.full_name?.split(' ')[0] || 'student';
  const dashboardStats = [
    { label: 'Enrolled courses', value: approvedCourses.length, action: 'View all courses', icon: MenuBookOutlined, color: '#1b6ef3', bg: '#eaf2ff', pane: 'my-courses' },
    { label: 'Recent materials', value: summary?.recent_materials?.length || 0, action: 'View materials', icon: FolderCopyOutlined, color: '#15965f', bg: '#e8f7ef', pane: 'materials' },
    { label: 'Upcoming assignments', value: summary?.upcoming_assignments?.length || 0, action: 'View assignments', icon: AssignmentOutlined, color: '#f05a28', bg: '#fff0e9', pane: 'assignments' },
    { label: 'Announcements', value: summary?.announcements?.length || 0, action: 'View announcements', icon: CampaignOutlined, color: '#7c3aed', bg: '#f2eaff', pane: 'announcements' },
  ];

  return (
    <Stack spacing={3}>
      <Box sx={{ position: 'relative', minHeight: { xs: 118, md: 150 }, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <Box sx={{ pr: { xs: 0, md: 28 } }}>
          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.35rem' }, mb: 0.8 }}>
            Welcome back, {firstName}!
          </Typography>
          <Typography sx={{ color: '#637083' }}>
            {pendingActivation ? 'Your dashboard is ready. Course access will unlock after admin activation.' : "Here's what's happening in your learning journey today."}
          </Typography>
        </Box>
        <Box component="img" src="/images/student_illustration_upscaled.png" alt="" sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', right: 0, bottom: -4, width: 230, height: 132, objectFit: 'contain' }} />
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 1.5 }}>
            {dashboardStats.map((stat) => {
              const Icon = stat.icon;
              return (
              <Box key={stat.label} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.4, p: 1.6, bgcolor: '#fff', boxShadow: '0 14px 34px rgba(18,60,105,0.06)', minHeight: 112 }}>
                <Stack direction="row" spacing={1.4} alignItems="center">
                  <Box sx={{ width: 48, height: 48, borderRadius: 1.2, bgcolor: stat.bg, color: stat.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ color: '#526273', fontSize: 12, fontWeight: 700 }}>{stat.label}</Typography>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.8rem', lineHeight: 1.05 }}>{stat.value}</Typography>
                    <Button size="small" variant="text" onClick={() => setActivePane(stat.pane)} sx={{ px: 0, minWidth: 0, justifyContent: 'flex-start', color: '#1b6ef3', fontSize: 12, mt: 0.2 }}>
                      {stat.action} →
                    </Button>
                  </Box>
                </Stack>
              </Box>
              );
            })}
          </Box>

          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.35rem' }, mb: 0.4 }}>
                Enrolled Courses
              </Typography>
              <Typography sx={{ color: '#637083' }}>
                Open approved courses, recordings, documents, and assignments.
              </Typography>
            </Box>
            {approvedCourses.length === 0 ? (
              <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2.4, mt: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 700 }}>{pendingActivation ? 'Course access pending admin activation.' : 'No enrolled courses yet.'}</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 1.5, mt: 2 }}>
                {approvedCourses.map((item) => (
                  <StudentCourseCard
                    key={item.course.id}
                    course={item.course}
                    onOpen={() => onOpenCourse?.(item.course.id)}
                  />
                ))}
              </Box>
            )}
          </Box>
        </>
      )}
    </Stack>
  );
}

function StudentPageHeader({ title, subtitle, icon: Icon = MenuBookOutlined, action }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
      <Stack direction="row" spacing={1.4} alignItems="center">
        <Box sx={{ width: 48, height: 48, borderRadius: 1.5, bgcolor: 'rgba(240,90,40,0.12)', color: 'secondary.main', display: 'grid', placeItems: 'center' }}>
          <Icon />
        </Box>
        <Box>
          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '1.85rem', md: '2.35rem' }, lineHeight: 1.1 }}>
            {title}
          </Typography>
          <Typography sx={{ color: '#637083', mt: 0.5 }}>{subtitle}</Typography>
        </Box>
      </Stack>
      {action}
    </Stack>
  );
}

function StudentCourseCard({ course, onOpen, label = 'Open course', status, disabled = false }) {
  const image = getCourseImage(course.title);
  return (
    <Box
      sx={{
        border: '1px solid rgba(18,60,105,0.12)',
        borderRadius: 1.5,
        overflow: 'hidden',
        bgcolor: '#fff',
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          height: 150,
          bgcolor: image ? '#123c69' : '#082540',
          backgroundImage: image ? `linear-gradient(180deg, rgba(8,37,64,0.05), rgba(8,37,64,0.58)), url(${image})` : 'linear-gradient(135deg, #082540, #123c69)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'flex-end',
          p: 1.5,
        }}
      >
        <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.15rem', textShadow: '0 2px 10px rgba(0,0,0,0.28)' }}>
          {course.title}
        </Typography>
      </Box>
      <Stack spacing={1.1} sx={{ p: 1.6, flex: 1 }}>
        <Typography sx={{ color: '#526273', fontSize: 14, flex: 1 }}>
          {course.description || 'Course details will be posted soon.'}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap' }}>
            {course.teacher?.full_name && <Chip label={course.teacher.full_name} size="small" color="primary" />}
            {status && <Chip label={status} size="small" color={status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'default'} />}
          </Stack>
          <Button variant="contained" color="secondary" onClick={onOpen} disabled={disabled} size="small" sx={{ flexShrink: 0 }}>
            {label}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function StudentMyCoursesPane({ setActivePane, user, onOpenCourse }) {
  const [courses, setCourses] = React.useState([]);
  const [selectedCourseId, setSelectedCourseId] = React.useState(null);
  const [content, setContent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [contentLoading, setContentLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [viewingMaterial, setViewingMaterial] = React.useState(null);

  const loadCourses = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/courses`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load courses');
      setCourses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const openCourse = async (courseId) => {
    setSelectedCourseId(courseId);
    setContentLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/courses/${courseId}/content`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load course content');
      setContent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setContentLoading(false);
    }
  };

  const renderMaterial = (material) => (
    <Box key={material.id} sx={{ bgcolor: '#fff', borderRadius: 1, p: 1.1, border: '1px solid rgba(18,60,105,0.08)' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
        <Box>
          <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>{material.title}</Typography>
          <Typography sx={{ color: '#637083', fontSize: 13 }}>{materialTypeLabels[material.material_type] || material.material_type}</Typography>
        </Box>
        {(material.file_url || material.external_url) && (
          <Button onClick={() => setViewingMaterial(material)} size="small" variant="outlined">
            Open
          </Button>
        )}
      </Stack>
    </Box>
  );

  const renderAssignment = (assignment) => (
    <Box key={assignment.id} sx={{ bgcolor: '#fff', borderRadius: 1, p: 1.1, border: '1px solid rgba(18,60,105,0.08)' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
        <Box>
          <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>{assignment.title}</Typography>
          <Typography sx={{ color: '#637083', fontSize: 13 }}>
            Due {formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })}
          </Typography>
          {assignment.attachment_url && (
            <Typography component="a" href={assignment.attachment_url} target="_blank" rel="noreferrer" sx={{ color: '#123c69', fontSize: 13, fontWeight: 800 }}>
              {assignment.attachment_name || 'Assignment attachment'}
            </Typography>
          )}
        </Box>
        <Chip label={assignment.student_status.replace('_', ' ')} size="small" color={assignment.student_status === 'not_submitted' ? 'warning' : assignment.student_status === 'late' ? 'error' : 'primary'} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }} />
      </Stack>
    </Box>
  );

  if (selectedCourseId) {
    const allMaterials = content ? [...content.unassigned_materials, ...content.modules.flatMap((module) => module.materials)] : [];
    const allAssignments = content ? [...content.unassigned_assignments, ...content.modules.flatMap((module) => module.assignments)] : [];

    if (viewingMaterial) {
      return (
        <MaterialInlineViewer
          material={viewingMaterial}
          onBack={() => setViewingMaterial(null)}
        />
      );
    }

    return (
      <Stack spacing={3}>
        <StudentPageHeader
          title={content?.course?.title || 'Course Workspace'}
          subtitle={content?.course?.teacher?.full_name ? `Instructor: ${content.course.teacher.full_name}` : 'Your approved course content.'}
          icon={MenuBookOutlined}
          action={<Button variant="outlined" onClick={() => { setSelectedCourseId(null); setContent(null); }}>Back to courses</Button>}
        />
        {error && <Alert severity="error">{error}</Alert>}
        {contentLoading ? (
          <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
        ) : content && (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
              {[['Modules', content.modules.length], ['Materials', allMaterials.length], ['Assignments', allAssignments.length]].map(([label, value]) => (
                <Box key={label} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2 }}>
                  <Typography sx={{ color: '#637083', fontSize: 13, fontWeight: 800 }}>{label}</Typography>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '2rem', lineHeight: 1 }}>{value}</Typography>
                </Box>
              ))}
            </Box>
            <Stack spacing={1.5}>
              {[...content.modules, { id: 'unassigned', title: 'General Course Resources', description: '', materials: content.unassigned_materials, assignments: content.unassigned_assignments }].filter((module) => module.materials.length || module.assignments.length).map((module) => (
                <Box key={module.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1.5, p: 1.6 }}>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>{module.title}</Typography>
                  {module.description && <Typography sx={{ color: '#637083', fontSize: 14, mb: 1 }}>{module.description}</Typography>}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1.2, mt: 1 }}>
                    <Stack spacing={0.8}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 14 }}>Materials</Typography>
                      {module.materials.length ? module.materials.map(renderMaterial) : <Typography sx={{ color: '#637083', fontSize: 13 }}>No materials posted.</Typography>}
                    </Stack>
                    <Stack spacing={0.8}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 14 }}>Assignments</Typography>
                      {module.assignments.length ? module.assignments.map(renderAssignment) : <Typography sx={{ color: '#637083', fontSize: 13 }}>No assignments posted.</Typography>}
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <StudentPageHeader title="My Courses" subtitle="Open approved courses, recordings, documents, and assignments." icon={MenuBookOutlined} />
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack> : courses.length === 0 ? (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2.4 }}>
          <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{user?.is_active ? 'No courses are available yet.' : 'Course access pending activation.'}</Typography>
          <Typography sx={{ color: '#637083' }}>{user?.is_active ? 'Your current Three13 courses will appear here as soon as they are active.' : 'An admin needs to activate your account before courses, materials, and assignments unlock.'}</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          {courses.map((course) => <StudentCourseCard key={course.id} course={course} onOpen={() => onOpenCourse?.(course.id)} />)}
        </Box>
      )}
    </Stack>
  );
}

function StudentMaterialsPane({ selectedCourseId }) {
  const [materials, setMaterials] = React.useState([]);
  const [courseFilter, setCourseFilter] = React.useState(selectedCourseId ? String(selectedCourseId) : 'all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [sortOrder, setSortOrder] = React.useState('newest');
  const [search, setSearch] = React.useState('');
  const [expandedGroup, setExpandedGroup] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [viewingMaterial, setViewingMaterial] = React.useState(null);
  const [materialMenu, setMaterialMenu] = React.useState({ anchorEl: null, material: null });

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const coursesResponse = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/courses`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const coursesData = await coursesResponse.json();
        if (!coursesResponse.ok) throw new Error(coursesData.detail || 'Unable to load courses');
        const content = await Promise.all(coursesData.map(async (course) => {
          const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/courses/${course.id}/content`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || `Unable to load ${course.title}`);
          return data;
        }));
        const nextMaterials = content.flatMap((courseContent) => [
          ...courseContent.unassigned_materials.map((material, materialIndex) => ({
            ...material,
            course: courseContent.course,
            module_id: 'general',
            module_title: 'General Course Resources',
            module_order: 999,
            material_order: materialIndex,
          })),
          ...courseContent.modules.flatMap((module, moduleIndex) => module.materials.map((material, materialIndex) => ({
            ...material,
            course: courseContent.course,
            module_id: module.id,
            module_title: module.title,
            module_description: module.description,
            module_order: moduleIndex,
            material_order: materialIndex,
          }))),
        ]);
        if (mounted) {
          setMaterials(nextMaterials);
          const first = nextMaterials[0];
          if (first) setExpandedGroup(`${first.course.id}-${first.module_id}`);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    setCourseFilter(selectedCourseId ? String(selectedCourseId) : 'all');
  }, [selectedCourseId]);

  const courses = Array.from(new Map(materials.map((material) => [material.course.id, material.course])).values());
  const searchTerm = search.trim().toLowerCase();
  const visibleMaterials = materials
    .filter((material) => courseFilter === 'all' || material.course.id === Number(courseFilter))
    .filter((material) => typeFilter === 'all' || material.material_type === typeFilter)
    .filter((material) => {
      if (!searchTerm) return true;
      return [material.title, material.description, material.course?.title, material.module_title, materialTypeLabels[material.material_type]]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm));
    })
    .sort((first, second) => {
      if (sortOrder === 'oldest') return (first.created_at || 0) - (second.created_at || 0) || first.material_order - second.material_order;
      if (sortOrder === 'title') return first.title.localeCompare(second.title);
      return (second.created_at || 0) - (first.created_at || 0) || first.material_order - second.material_order;
    });
  const groupedMaterials = Array.from(visibleMaterials.reduce((groups, material) => {
    const key = `${material.course.id}-${material.module_id}`;
    const existing = groups.get(key) || {
      key,
      course: material.course,
      title: material.module_title,
      description: material.module_description,
      order: material.module_order,
      materials: [],
    };
    existing.materials.push(material);
    groups.set(key, existing);
    return groups;
  }, new Map()).values()).sort((first, second) => {
    if (first.course.id !== second.course.id) return first.course.title.localeCompare(second.course.title);
    return first.order - second.order;
  });
  const stats = {
    total: visibleMaterials.length,
    videos: visibleMaterials.filter((material) => material.material_type === 'youtube').length,
    documents: visibleMaterials.filter((material) => ['pdf', 'powerpoint', 'word', 'code', 'downloadable', 'other'].includes(material.material_type)).length,
    links: visibleMaterials.filter((material) => material.material_type === 'external_link').length,
  };
  const materialTypes = materialTypeOptions.filter((option) => materials.some((material) => material.material_type === option.value));
  const recentlyAdded = [...materials]
    .filter((material) => courseFilter === 'all' || material.course.id === Number(courseFilter))
    .sort((first, second) => (second.created_at || 0) - (first.created_at || 0))
    .slice(0, 3);
  const quickPicks = [...materials]
    .filter((material) => courseFilter === 'all' || material.course.id === Number(courseFilter))
    .slice(0, 3);

  const getMaterialIcon = (type) => {
    if (type === 'youtube') return OndemandVideoOutlined;
    if (type === 'pdf') return PictureAsPdfOutlined;
    if (type === 'powerpoint') return SlideshowOutlined;
    if (type === 'external_link') return LinkOutlined;
    if (type === 'downloadable') return DownloadOutlined;
    return InsertDriveFileOutlined;
  };

  const getMaterialTone = (type) => {
    if (type === 'youtube') return { color: '#0f63c7', bg: 'rgba(15,99,199,0.1)' };
    if (type === 'pdf') return { color: '#d93025', bg: 'rgba(217,48,37,0.1)' };
    if (type === 'powerpoint') return { color: '#6f42c1', bg: 'rgba(111,66,193,0.1)' };
    if (type === 'external_link') return { color: '#15965f', bg: 'rgba(21,150,95,0.1)' };
    if (type === 'downloadable') return { color: '#0089a7', bg: 'rgba(0,137,167,0.1)' };
    return { color: '#526273', bg: '#eef3f8' };
  };

  const renderPdfMark = (size = 34) => <PdfFileTile size={size} />;

  const renderMaterialVisual = (material, { compact = false, clickable = false, onClick } = {}) => {
    const Icon = getMaterialIcon(material.material_type);
    const tone = getMaterialTone(material.material_type);
    const thumbnailUrl = material.material_type === 'youtube' ? getYouTubeThumbnailUrl(getMaterialUrl(material)) : '';
    const width = compact ? 28 : { xs: '100%', sm: 112 };
    const minHeight = compact ? 28 : { xs: 74, sm: 58 };
    const iconSize = compact ? 17 : 34;
    const commonSx = {
      width,
      minWidth: compact ? 28 : undefined,
      height: compact ? 28 : undefined,
      minHeight,
      borderRadius: compact ? 1 : 1,
      border: 0,
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      cursor: clickable ? 'pointer' : 'default',
    };

    if (thumbnailUrl) {
      return (
        <Box
          component={clickable ? 'button' : 'div'}
          type={clickable ? 'button' : undefined}
          onClick={clickable ? onClick : undefined}
          aria-label={clickable ? `Open ${material.title}` : undefined}
          sx={{ ...commonSx, bgcolor: '#082540', backgroundImage: `linear-gradient(180deg, rgba(8,37,64,0.04), rgba(8,37,64,0.42)), url(${thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <Box sx={{ width: compact ? 18 : 30, height: compact ? 18 : 30, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.9)', color: '#0f63c7', display: 'grid', placeItems: 'center' }}>
            <OndemandVideoOutlined sx={{ fontSize: compact ? 13 : 20 }} />
          </Box>
        </Box>
      );
    }

    return (
      <Box
        component={clickable ? 'button' : 'div'}
        type={clickable ? 'button' : undefined}
        onClick={clickable ? onClick : undefined}
        aria-label={clickable ? `Open ${material.title}` : undefined}
        sx={{ ...commonSx, bgcolor: tone.bg, color: tone.color }}
      >
        {material.material_type === 'pdf' ? renderPdfMark(iconSize) : <Icon sx={{ fontSize: iconSize }} />}
      </Box>
    );
  };

  const markMaterialViewed = async (material) => {
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/materials/${material.id}/view`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update material progress');
      setMaterials((current) => current.map((item) => (item.id === material.id ? { ...item, viewed: true, viewed_at: data.viewed_at } : item)));
    } catch (err) {
      setError(err.message);
    }
  };

  const closeMaterialMenu = () => {
    setMaterialMenu({ anchorEl: null, material: null });
  };

  const markMenuMaterialCompleted = async () => {
    const material = materialMenu.material;
    closeMaterialMenu();
    if (!material || material.viewed) return;
    await markMaterialViewed(material);
  };

  const renderMiniMaterial = (material) => {
    return (
      <Stack key={`${material.course.id}-${material.id}`} direction="row" spacing={1.1} alignItems="center">
        {renderMaterialVisual(material, { compact: true })}
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 13 }}>{material.title}</Typography>
          <Typography noWrap sx={{ color: '#637083', fontSize: 12 }}>{material.module_title}</Typography>
        </Box>
      </Stack>
    );
  };

  const renderMaterialRow = (material) => {
    const url = getMaterialUrl(material);
    const openMaterial = () => setViewingMaterial({ ...material });
    return (
      <Box key={`${material.course.id}-${material.id}`} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1, overflow: 'hidden' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.4} sx={{ p: 1.2 }}>
          {renderMaterialVisual(material, { clickable: Boolean(material.viewed && url), onClick: openMaterial })}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 15 }}>{material.title}</Typography>
            {material.description && <Typography sx={{ color: '#637083', fontSize: 13, mt: 0.2 }} noWrap>{material.description}</Typography>}
            <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', mt: 0.6, color: '#637083', fontSize: 12 }}>
              <Typography sx={{ fontSize: 12 }}>{materialTypeLabels[material.material_type] || material.material_type}</Typography>
              <Typography sx={{ fontSize: 12 }}>|</Typography>
              <Typography sx={{ fontSize: 12 }}>{material.course.title}</Typography>
              {material.created_at && (
                <>
                  <Typography sx={{ fontSize: 12 }}>|</Typography>
                  <Typography sx={{ fontSize: 12 }}>{formatTimestamp(material.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
                </>
              )}
              {material.viewed && (
                <>
                  <Typography sx={{ fontSize: 12 }}>|</Typography>
                  <Typography sx={{ fontSize: 12, color: '#15965f', fontWeight: 850 }}>Completed</Typography>
                </>
              )}
            </Stack>
          </Box>
          <Stack direction="row" spacing={0.8} alignItems="center" justifyContent={{ xs: 'space-between', sm: 'flex-end' }}>
            {url && !material.viewed && (
              <Button onClick={openMaterial} size="small" variant="outlined" sx={{ minWidth: 86 }}>
                Open
              </Button>
            )}
            <IconButton size="small" aria-label={`More actions for ${material.title}`} onClick={(event) => setMaterialMenu({ anchorEl: event.currentTarget, material })}>
              <MoreHorizOutlined fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    );
  };

  if (viewingMaterial) {
    return <MaterialInlineViewer material={viewingMaterial} onBack={() => setViewingMaterial(null)} />;
  }

  return (
    <Stack spacing={2.3}>
      <StudentPageHeader
        title="Course Materials"
        subtitle="Everything you need to succeed in your courses."
        icon={FolderCopyOutlined}
        action={(
          <TextField
            size="small"
            placeholder="Search materials..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{ width: { xs: '100%', sm: 320 } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ color: '#526273' }} /></InputAdornment>,
            }}
          />
        )}
      />
      <Stack direction="row" spacing={1.4} sx={{ flexWrap: 'wrap' }}>
        {[
          ['Videos', OndemandVideoOutlined, '#0f63c7'],
          ['PDFs', PictureAsPdfOutlined, '#d93025'],
          ['Slides', SlideshowOutlined, '#6f42c1'],
          ['Links', LinkOutlined, '#15965f'],
          ['Downloads', DownloadOutlined, '#0089a7'],
        ].map(([label, Icon, color]) => (
          <Stack key={label} direction="row" spacing={0.5} alignItems="center">
            <Icon sx={{ color, fontSize: 17 }} />
            <Typography sx={{ color: '#526273', fontWeight: 750, fontSize: 13 }}>{label}</Typography>
          </Stack>
        ))}
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      <Menu
        anchorEl={materialMenu.anchorEl}
        open={Boolean(materialMenu.anchorEl)}
        onClose={closeMaterialMenu}
      >
        <MenuItem onClick={markMenuMaterialCompleted} disabled={!materialMenu.material || materialMenu.material.viewed}>
          Mark as completed
        </MenuItem>
      </Menu>
      {loading ? <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack> : visibleMaterials.length === 0 ? (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2.4 }}>
          <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>No materials match these filters.</Typography>
          <Typography sx={{ color: '#637083' }}>Try a different course, type, or search term.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '270px 1fr' }, gap: 1.8, alignItems: 'start' }}>
          <Stack spacing={1.6}>
            <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.4 }}>Quick Stats</Typography>
              {[
                ['Total Materials', stats.total, InsertDriveFileOutlined, '#29a7df'],
                ['Videos', stats.videos, OndemandVideoOutlined, '#0f63c7'],
                ['Documents', stats.documents, PictureAsPdfOutlined, '#6f42c1'],
                ['Links', stats.links, LinkOutlined, '#15965f'],
              ].map(([label, value, Icon, color]) => (
                <Stack key={label} direction="row" spacing={1.1} alignItems="center" sx={{ py: 0.65 }}>
                  <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: `${color}18`, color, display: 'grid', placeItems: 'center' }}>
                    <Icon sx={{ fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13, lineHeight: 1 }}>{value}</Typography>
                    <Typography sx={{ color: '#526273', fontSize: 12 }}>{label}</Typography>
                  </Box>
                </Stack>
              ))}
            </Box>
            {quickPicks.length > 0 && (
              <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.3 }}>Quick Picks</Typography>
                <Stack spacing={1.3}>{quickPicks.map(renderMiniMaterial)}</Stack>
              </Box>
            )}
            {recentlyAdded.length > 0 && (
              <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.3 }}>Recently Added</Typography>
                <Stack spacing={1.3}>{recentlyAdded.map(renderMiniMaterial)}</Stack>
              </Box>
            )}
          </Stack>
          <Stack spacing={1.4}>
            <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.2 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: '1.2fr 1fr 1fr auto' }, gap: 1 }}>
                <TextField select size="small" label="Course" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
                  <MenuItem value="all">All courses</MenuItem>
                  {courses.map((course) => <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                  <MenuItem value="all">All types</MenuItem>
                  {materialTypes.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                </TextField>
                <TextField select size="small" label="Sort by" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)}>
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                </TextField>
                <Button
                  variant="text"
                  startIcon={<FilterAltOffOutlined />}
                  onClick={() => { setCourseFilter('all'); setTypeFilter('all'); setSortOrder('newest'); setSearch(''); }}
                  sx={{ justifySelf: { xs: 'stretch', xl: 'end' } }}
                >
                  Clear
                </Button>
              </Box>
            </Box>
            <Stack spacing={1.2}>
              {groupedMaterials.map((group, index) => {
                const isExpanded = expandedGroup ? expandedGroup === group.key : index === 0;
                return (
                  <Box key={group.key} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, overflow: 'hidden', boxShadow: '0 10px 26px rgba(18,60,105,0.06)' }}>
                    <Button
                      fullWidth
                      onClick={() => setExpandedGroup(isExpanded ? '' : group.key)}
                      sx={{ justifyContent: 'space-between', color: 'primary.dark', p: 1.5, textAlign: 'left' }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 950, fontSize: { xs: 16, md: 18 } }} noWrap>{group.title}</Typography>
                        <Chip label={`${group.materials.length} material${group.materials.length === 1 ? '' : 's'}`} size="small" color="primary" variant="outlined" />
                      </Stack>
                      <KeyboardArrowDownOutlined sx={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 160ms ease' }} />
                    </Button>
                    {isExpanded && (
                      <Stack spacing={1} sx={{ px: 1.5, pb: 1.5 }}>
                        {group.description && <Typography sx={{ color: '#637083', fontSize: 13 }}>{group.description}</Typography>}
                        {group.materials.map(renderMaterialRow)}
                      </Stack>
                    )}
                  </Box>
                );
              })}
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
              <Typography sx={{ color: '#637083', fontSize: 13 }}>Showing {visibleMaterials.length} of {materials.length} materials</Typography>
              <Stack direction="row" spacing={0.8} alignItems="center">
                <Chip icon={<CheckCircleOutlined />} label="Organized by module/week" size="small" variant="outlined" />
              </Stack>
            </Stack>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

function StudentModuleLanding({ courseContent, stats, loading, error, message, moduleProgress, onOpenModule, setActivePane }) {
  const modules = courseContent?.modules || [];
  const course = courseContent?.course || {};

  return (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      {message && <Alert severity="success">{message}</Alert>}
      {loading ? (
        <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
      ) : modules.length === 0 ? (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2.4 }}>
          <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>No modules posted yet.</Typography>
          <Typography sx={{ color: '#637083' }}>Your instructor will add module content as the course progresses.</Typography>
        </Box>
      ) : (
        <>
          <Stack spacing={1.6}>
            <Box sx={{ minWidth: 0, maxWidth: 980 }}>
              <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.35rem' }, lineHeight: 1.05 }}>
                {course.title}
              </Typography>
              <Typography sx={{ color: '#526273', fontSize: 16, mt: 0.8 }}>
                Follow your learning path and complete all modules.
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 1.2 }}>
              {[
                ['Modules', modules.length, MenuBookOutlined, '#1b6ef3', '#eaf2ff'],
                ['Materials', stats.totalMaterials, InsertDriveFileOutlined, '#16805f', '#e8f7ef'],
                ['Assignments', stats.totalAssignments, AssignmentOutlined, '#f05a28', '#fff0e7'],
                ['Overall Progress', `${stats.overallPercent}%`, TrendingUpOutlined, '#8a4fe8', '#f4ecff'],
              ].map(([label, value, Icon, color, bg]) => (
                <Box key={label} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.10)', borderRadius: 1.4, p: 1.35, boxShadow: '0 12px 32px rgba(18,60,105,0.05)', display: 'grid', gridTemplateColumns: '46px 1fr', gap: 1, alignItems: 'center', minHeight: 82 }}>
                  <Box sx={{ width: 46, height: 46, borderRadius: 1.2, bgcolor: bg, color, display: 'grid', placeItems: 'center' }}><Icon /></Box>
                  <Box>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: 23, lineHeight: 1 }}>{value}</Typography>
                    <Typography sx={{ color: '#526273', fontSize: 12.5 }}>{label}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Stack>

          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 1.5, md: 2 }, boxShadow: '0 16px 42px rgba(18,60,105,0.05)' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '82px minmax(0, 1fr)' }, gap: 1.4, alignItems: 'center' }}>
              <Box sx={{ width: 70, height: 70, borderRadius: '50%', background: `conic-gradient(#f05a28 ${stats.overallPercent * 3.6}deg, #fff0e7 0deg)`, display: 'grid', placeItems: 'center', p: 0.7 }}>
                <Box sx={{ width: '100%', height: '100%', borderRadius: '50%', bgcolor: '#fff', display: 'grid', placeItems: 'center', color: 'primary.dark', fontWeight: 950, fontSize: 18 }}>
                  {stats.overallPercent}%
                </Box>
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Course Progress</Typography>
                <Typography sx={{ color: '#526273', fontSize: 13, mb: 1 }}>{stats.completedModules} of {modules.length} modules completed</Typography>
                <Box sx={{ height: 8, borderRadius: 999, bgcolor: '#e8edf3', overflow: 'hidden' }}>
                  <Box sx={{ width: `${stats.overallPercent}%`, height: '100%', bgcolor: '#f05a28', borderRadius: 999 }} />
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ position: 'relative', pl: { xs: 0, md: 7.5 } }}>
            <Box sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', left: 24, top: 38, bottom: 44, width: 2, bgcolor: '#d8e0e8', borderRadius: 999 }} />
            <Stack spacing={1.2}>
              {modules.map((module, index) => {
                const progress = moduleProgress(module);
                const isCompleted = progress.status === 'completed';
                const isInProgress = progress.status === 'in_progress';
                const statusLabel = isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Not Started';
                const statusColor = isCompleted ? '#16805f' : isInProgress ? '#f05a28' : '#526273';
                const actionLabel = isCompleted ? 'Review Module' : isInProgress ? 'Continue Module' : 'Start Module';
                return (
                  <Box key={module.id} sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        display: { xs: 'none', md: 'grid' },
                        position: 'absolute',
                        left: -64,
                        top: 22,
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        placeItems: 'center',
                        bgcolor: isCompleted ? '#16805f' : isInProgress ? '#f05a28' : '#fff',
                        color: isCompleted || isInProgress ? '#fff' : 'primary.dark',
                        border: `3px solid ${isCompleted ? '#dff5e9' : isInProgress ? '#fff1ec' : '#e3eaf1'}`,
                        boxShadow: '0 8px 22px rgba(18,60,105,0.10)',
                        fontWeight: 950,
                      }}
                    >
                      {isCompleted ? <CheckCircleOutlined /> : String(index + 1).padStart(2, '0')}
                    </Box>
                    <Box
                      sx={{
                        bgcolor: '#fff',
                        border: `1px solid ${isInProgress ? 'rgba(240,90,40,0.28)' : 'rgba(18,60,105,0.12)'}`,
                        borderLeft: `4px solid ${isInProgress ? '#f05a28' : 'transparent'}`,
                        borderRadius: 1.5,
                        p: { xs: 1.4, md: 1.6 },
                        boxShadow: '0 12px 32px rgba(18,60,105,0.05)',
                      }}
                    >
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 130px 150px 220px 210px' }, gap: 1.2, alignItems: 'center' }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: '#526273', fontSize: 12.5, fontWeight: 800 }}>Module {index + 1}</Typography>
                          <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: 18 }}>{module.title}</Typography>
                          <Typography noWrap sx={{ color: '#526273', fontSize: 13 }}>{module.description || (isInProgress ? 'Continue your learning from where you left off.' : isCompleted ? 'Introduction and first course activity.' : 'Continue through the learning activities.')}</Typography>
                        </Box>
                        <Stack direction="row" spacing={0.7} alignItems="center" sx={{ borderLeft: { lg: '1px solid rgba(18,60,105,0.10)' }, pl: { lg: 1.2 } }}>
                          <MenuBookOutlined sx={{ color: '#1b6ef3' }} />
                          <Box>
                            <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: 18 }}>{module.materials.length}</Typography>
                            <Typography sx={{ color: '#526273', fontSize: 12 }}>{module.materials.length === 1 ? 'Material' : 'Materials'}</Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={0.7} alignItems="center" sx={{ borderLeft: { lg: '1px solid rgba(18,60,105,0.10)' }, pl: { lg: 1.2 } }}>
                          <AssignmentOutlined sx={{ color: '#f05a28' }} />
                          <Box>
                            <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: 18 }}>{module.assignments.length}</Typography>
                            <Typography sx={{ color: '#526273', fontSize: 12 }}>{module.assignments.length === 1 ? 'Assignment' : 'Assignments'}</Typography>
                          </Box>
                        </Stack>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: statusColor, fontWeight: 950, fontSize: 13 }}>{statusLabel}</Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.7 }}>
                            <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: 13 }}>{progress.percent}%</Typography>
                            <Box sx={{ height: 7, borderRadius: 999, bgcolor: '#e8edf3', width: 136, overflow: 'hidden' }}>
                              <Box sx={{ height: '100%', width: `${progress.percent}%`, bgcolor: isCompleted ? '#16805f' : isInProgress ? '#f05a28' : '#d8e0e8', borderRadius: 999 }} />
                            </Box>
                          </Stack>
                        </Box>
                        <Button
                          variant={isInProgress ? 'contained' : 'outlined'}
                          color={isInProgress ? 'secondary' : 'primary'}
                          endIcon={<ChevronRightOutlined />}
                          onClick={() => onOpenModule(module, course)}
                          sx={{ minHeight: 44, justifySelf: { lg: 'end' }, width: { xs: '100%', sm: 210, lg: 190 } }}
                        >
                          {actionLabel}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          <Box sx={{ bgcolor: '#eef5ff', borderRadius: 1.5, p: 1.6, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '44px 1fr auto' }, gap: 1.2, alignItems: 'center' }}>
            <LightbulbOutlined sx={{ color: '#1b6ef3', fontSize: 34 }} />
            <Box>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Need help?</Typography>
              <Typography sx={{ color: '#526273', fontSize: 13 }}>Visit our Help Center for guides and support.</Typography>
            </Box>
            <Button variant="outlined" endIcon={<OpenInNewOutlined />} onClick={() => setActivePane?.('support')} sx={{ minHeight: 42 }}>
              Open Help Center
            </Button>
          </Box>
        </>
      )}
    </Stack>
  );
}

function StudentModulesPane({ selectedCourseId, setActivePane }) {
  const [courseContents, setCourseContents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [selectedModule, setSelectedModule] = React.useState(null);
  const [viewingMaterial, setViewingMaterial] = React.useState(null);
  const [selectedFiles, setSelectedFiles] = React.useState({});
  const [savingId, setSavingId] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [showAllModuleAssignments, setShowAllModuleAssignments] = React.useState(false);
  const [moduleAssignmentSort, setModuleAssignmentSort] = React.useState('due_date');
  const [moduleAssignmentDueOrder, setModuleAssignmentDueOrder] = React.useState('asc');
  const [moduleMaterialMenu, setModuleMaterialMenu] = React.useState({ anchorEl: null, material: null });

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const coursesResponse = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/courses`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const coursesData = await coursesResponse.json();
        if (!coursesResponse.ok) throw new Error(coursesData.detail || 'Unable to load courses');

        const visibleCourses = selectedCourseId
          ? coursesData.filter((course) => course.id === Number(selectedCourseId))
          : coursesData;

        const content = await Promise.all(visibleCourses.map(async (course) => {
          const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/courses/${course.id}/content`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.detail || `Unable to load ${course.title}`);
          return data;
        }));
        if (mounted) {
          setCourseContents(content);
          setSelectedModule(null);
          setViewingMaterial(null);
          setSelectedFiles({});
          setMessage('');
          setShowAllModuleAssignments(false);
          setModuleAssignmentSort('due_date');
          setModuleAssignmentDueOrder('asc');
          setModuleMaterialMenu({ anchorEl: null, material: null });
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [selectedCourseId]);

  const selectedCourse = courseContents[0]?.course;
  const allModules = courseContents.flatMap((content) => content.modules.map((module) => ({ ...module, course: content.course })));
  const visibleModuleCourse = selectedCourseId && courseContents.length === 1 ? courseContents[0] : null;
  const moduleProgress = (module) => {
    const materials = module.materials || [];
    const assignments = module.assignments || [];
    const completedMaterials = materials.filter((material) => material.viewed || material.viewed_at).length;
    const completedAssignments = assignments.filter((assignment) => assignment.submission || ['submitted', 'graded'].includes(assignment.student_status)).length;
    const totalItems = materials.length + assignments.length;
    const completedItems = completedMaterials + completedAssignments;
    const percent = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
    const status = percent >= 100 && totalItems > 0 ? 'completed' : percent > 0 ? 'in_progress' : 'not_started';
    return { percent, status, completedItems, totalItems };
  };
  const visibleModuleStats = visibleModuleCourse ? (() => {
    const modules = visibleModuleCourse.modules || [];
    const totalMaterials = modules.reduce((sum, module) => sum + (module.materials?.length || 0), 0) + (visibleModuleCourse.unassigned_materials?.length || 0);
    const totalAssignments = modules.reduce((sum, module) => sum + (module.assignments?.length || 0), 0) + (visibleModuleCourse.unassigned_assignments?.length || 0);
    const progressByModule = modules.map(moduleProgress);
    const completedModules = progressByModule.filter((progress) => progress.status === 'completed').length;
    const overallPercent = progressByModule.length
      ? Math.round(progressByModule.reduce((sum, progress) => sum + progress.percent, 0) / progressByModule.length)
      : 0;
    return { totalMaterials, totalAssignments, completedModules, overallPercent };
  })() : null;
  const currentCourseContent = selectedModule
    ? courseContents.find((content) => content.course.id === selectedModule.course.id)
    : null;
  const moduleOverview = currentCourseContent?.modules || [];
  const selectedModuleIndex = selectedModule
    ? moduleOverview.findIndex((module) => module.id === selectedModule.id)
    : -1;

  const openModule = React.useCallback((module, course) => {
    setSelectedModule({ ...module, course });
    setShowAllModuleAssignments(false);
    setViewingMaterial(null);
    setModuleAssignmentSort('due_date');
    setModuleAssignmentDueOrder('asc');
    setModuleMaterialMenu({ anchorEl: null, material: null });
  }, []);

  const moduleMaterialIcon = (type) => {
    if (type === 'youtube') return OndemandVideoOutlined;
    if (type === 'pdf') return PictureAsPdfOutlined;
    if (type === 'powerpoint') return SlideshowOutlined;
    if (type === 'external_link') return LinkOutlined;
    if (type === 'downloadable') return DownloadOutlined;
    return InsertDriveFileOutlined;
  };

  const moduleMaterialTone = (type) => {
    if (type === 'youtube') return { color: '#6f42c1', bg: 'rgba(111,66,193,0.12)' };
    if (type === 'pdf') return { color: '#d93025', bg: 'rgba(217,48,37,0.1)' };
    if (type === 'powerpoint') return { color: '#6f42c1', bg: 'rgba(111,66,193,0.12)' };
    if (type === 'external_link') return { color: '#15965f', bg: 'rgba(21,150,95,0.1)' };
    if (type === 'downloadable') return { color: '#0089a7', bg: 'rgba(0,137,167,0.1)' };
    return { color: '#526273', bg: '#eef3f8' };
  };

  const markModuleMaterialViewed = async (material) => {
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/materials/${material.id}/view`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update material progress');
      setSelectedModule((current) => current ? ({
        ...current,
        materials: current.materials.map((item) => (item.id === material.id ? { ...item, viewed: true, viewed_at: data.viewed_at } : item)),
      }) : current);
      setCourseContents((current) => current.map((content) => ({
        ...content,
        modules: content.modules.map((module) => ({
          ...module,
          materials: module.materials.map((item) => (item.id === material.id ? { ...item, viewed: true, viewed_at: data.viewed_at } : item)),
        })),
      })));
    } catch (err) {
      setError(err.message);
    }
  };

  const closeModuleMaterialMenu = () => {
    setModuleMaterialMenu({ anchorEl: null, material: null });
  };

  const markMenuModuleMaterialCompleted = async () => {
    const material = moduleMaterialMenu.material;
    closeModuleMaterialMenu();
    if (!material || material.viewed) return;
    await markModuleMaterialViewed(material);
  };

  const updateModuleAssignment = (assignmentId, nextAssignment) => {
    setSelectedModule((current) => current ? ({
      ...current,
      assignments: current.assignments.map((assignment) => (assignment.id === assignmentId ? nextAssignment : assignment)),
    }) : current);
    setCourseContents((current) => current.map((content) => ({
      ...content,
      modules: content.modules.map((module) => ({
        ...module,
        assignments: module.assignments.map((assignment) => (assignment.id === assignmentId ? nextAssignment : assignment)),
      })),
    })));
  };

  const submitModuleAssignment = async (assignmentId) => {
    const assignment = selectedModule?.assignments.find((item) => item.id === assignmentId);
    if (assignment && !assignment.is_open) {
      setError('This assignment is closed for submissions.');
      return;
    }
    const file = selectedFiles[assignmentId];
    if (!file) {
      setError('Choose a file before submitting.');
      return;
    }
    setSavingId(assignmentId);
    setError('');
    setMessage('');
    try {
      const uploadBody = new FormData();
      uploadBody.append('file', file);
      const uploadResponse = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/assignments/${assignmentId}/submission/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: uploadBody,
      });
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadData.detail || 'Unable to upload submission file');

      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_url: uploadData.file_url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to submit assignment');
      updateModuleAssignment(assignmentId, data);
      setSelectedFiles((current) => ({ ...current, [assignmentId]: null }));
      setMessage('Assignment submitted.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  if (viewingMaterial) {
    return (
      <MaterialInlineViewer
        material={viewingMaterial}
        onBack={() => setViewingMaterial(null)}
        backLabel="Back to module"
      />
    );
  }

  if (selectedModule) {
    const submittedAssignments = selectedModule.assignments.filter((assignment) => assignment.submission || ['submitted', 'graded'].includes(assignment.student_status)).length;
    const viewedMaterials = selectedModule.materials.filter((material) => material.viewed || material.viewed_at).length;
    const totalProgressItems = selectedModule.materials.length + selectedModule.assignments.length;
    const completedProgressItems = viewedMaterials + submittedAssignments;
    const progress = totalProgressItems ? Math.round((completedProgressItems / totalProgressItems) * 100) : 0;
    const estimatedMinutes = selectedModule.materials.reduce((total, material) => total + (material.estimated_minutes || 0), 0)
      + selectedModule.assignments.reduce((total, assignment) => total + (assignment.estimated_minutes || 0), 0);
    const estimatedTime = estimatedMinutes >= 60
      ? `${Math.floor(estimatedMinutes / 60)}h ${estimatedMinutes % 60 ? `${estimatedMinutes % 60}m` : ''}`.trim()
      : `${estimatedMinutes}m`;
    const filteredModuleAssignments = selectedModule.assignments.filter((assignment) => {
      if (moduleAssignmentSort === 'submitted') return Boolean(assignment.submission);
      if (moduleAssignmentSort === 'not_submitted') return !assignment.submission;
      return true;
    });
    const sortedModuleAssignments = [...filteredModuleAssignments].sort((a, b) => {
      const aDue = a.due_at || Number.MAX_SAFE_INTEGER;
      const bDue = b.due_at || Number.MAX_SAFE_INTEGER;
      if (aDue !== bDue) return moduleAssignmentDueOrder === 'asc' ? aDue - bDue : bDue - aDue;
      return String(a.title || '').localeCompare(String(b.title || ''));
    });
    const visibleModuleAssignments = showAllModuleAssignments
      ? sortedModuleAssignments
      : sortedModuleAssignments.slice(0, 1);
    const hiddenModuleAssignmentCount = Math.max(sortedModuleAssignments.length - visibleModuleAssignments.length, 0);
    const moduleAssignmentStatus = (assignment) => {
      const hasSubmission = Boolean(assignment.submission);
      const isLate = assignment.student_status === 'late' || assignment.submission?.status === 'late';
      if (!assignment.is_open) return { label: 'Closed', color: 'default', state: 'closed' };
      if (isLate && hasSubmission) return { label: 'Submitted late', color: 'error', state: 'late_submitted' };
      if (isLate) return { label: 'Late', color: 'error', state: 'late' };
      if (hasSubmission || assignment.student_status === 'submitted') return { label: 'Submitted', color: 'success', state: 'submitted' };
      return { label: 'Not submitted', color: 'warning', state: 'not_submitted' };
    };

    return (
      <Stack spacing={2.2}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.5}>
          <Stack spacing={0.9}>
            <Stack direction="row" spacing={0.8} sx={{ color: '#637083', flexWrap: 'wrap', fontSize: 12 }}>
              <Typography sx={{ fontSize: 12 }}>My Courses</Typography>
              <Typography sx={{ fontSize: 12 }}>/</Typography>
              <Typography sx={{ fontSize: 12 }}>{selectedModule.course.title}</Typography>
              <Typography sx={{ fontSize: 12 }}>/</Typography>
              <Typography sx={{ fontSize: 12 }}>Modules</Typography>
              <Typography sx={{ fontSize: 12 }}>/</Typography>
              <Typography sx={{ color: 'secondary.main', fontWeight: 800, fontSize: 12 }}>{selectedModule.title}</Typography>
            </Stack>
            <Stack direction="row" spacing={1.4} alignItems="center">
              <Box sx={{ width: 54, height: 54, borderRadius: 1.5, bgcolor: 'rgba(240,90,40,0.12)', color: 'secondary.main', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <ViewModuleOutlined />
              </Box>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                  <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '1.9rem', md: '2.35rem' }, lineHeight: 1.05 }}>
                    {selectedModule.title}
                  </Typography>
                  {selectedModuleIndex >= 0 && <Chip label={`Module ${selectedModuleIndex + 1} of ${moduleOverview.length}`} size="small" color="primary" variant="outlined" />}
                </Stack>
                <Typography sx={{ color: '#637083', mt: 0.4 }}>{selectedModule.course.title} module content.</Typography>
              </Box>
            </Stack>
          </Stack>
          <Button variant="outlined" onClick={() => setSelectedModule(null)} sx={{ alignSelf: { xs: 'flex-start', md: 'center' } }}>
            Back to modules
          </Button>
        </Stack>

        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 1.4, md: 1.8 }, boxShadow: '0 10px 26px rgba(18,60,105,0.06)' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 1.4 }}>
            {[
              ['Materials', selectedModule.materials.length, `${viewedMaterials} viewed`, SlideshowOutlined, '#6f42c1'],
              ['Assignment', selectedModule.assignments.length, `${submittedAssignments} submitted`, AssignmentOutlined, '#15965f'],
              ['Total content', estimatedTime, 'Estimated time', AccessTimeOutlined, '#f05a28'],
              ['Module progress', `${progress}%`, 'Based on submissions', CheckCircleOutlined, '#1b6ef3'],
            ].map(([label, value, helper, Icon, color]) => (
              <Stack key={label} direction="row" spacing={1.2} alignItems="center" sx={{ borderRight: { xl: label === 'Module progress' ? 'none' : '1px solid rgba(18,60,105,0.08)' }, pr: { xl: 1.2 } }}>
                <Box sx={{ width: 46, height: 46, borderRadius: 1.5, bgcolor: `${color}16`, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950, lineHeight: 1 }}>{value}</Typography>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 750, fontSize: 12, mt: 0.35 }}>{label}</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 11.5 }}>{helper}</Typography>
                  {label === 'Module progress' && (
                    <Box sx={{ mt: 0.8, height: 5, borderRadius: 999, bgcolor: '#e6edf6', overflow: 'hidden' }}>
                      <Box sx={{ width: `${progress}%`, height: '100%', bgcolor: color }} />
                    </Box>
                  )}
                </Box>
              </Stack>
            ))}
          </Box>
        </Box>

        {message && <Alert severity="success">{message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <Menu
          anchorEl={moduleMaterialMenu.anchorEl}
          open={Boolean(moduleMaterialMenu.anchorEl)}
          onClose={closeModuleMaterialMenu}
        >
          <MenuItem onClick={markMenuModuleMaterialCompleted} disabled={!moduleMaterialMenu.material || moduleMaterialMenu.material.viewed}>
            Mark as completed
          </MenuItem>
        </Menu>

        {selectedModule.description && (
          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 0.5 }}>Module description</Typography>
            <Typography sx={{ color: '#526273' }}>{selectedModule.description}</Typography>
          </Box>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: showAllModuleAssignments && selectedModule.assignments.length > 1
                ? 'minmax(260px, 0.72fr) minmax(0, 1.28fr)'
                : '1fr 1fr',
            },
            gap: 1.5,
            alignItems: 'start',
          }}
        >
          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Materials</Typography>
              <Button size="small" variant="text">View all</Button>
            </Stack>
            {selectedModule.materials.length === 0 ? (
              <Typography sx={{ color: '#637083', fontSize: 14 }}>No materials posted for this module yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {selectedModule.materials.map((material) => {
                  const Icon = moduleMaterialIcon(material.material_type);
                  const tone = moduleMaterialTone(material.material_type);
                  const url = getMaterialUrl(material);
                  const thumbnailUrl = material.material_type === 'youtube' ? getYouTubeThumbnailUrl(url) : '';
                  const openModuleMaterial = () => setViewingMaterial({ ...material, course: selectedModule.course, module_title: selectedModule.title });
                  return (
                    <Box key={material.id} sx={{ bgcolor: '#f8fafc', border: '1px solid rgba(18,60,105,0.08)', borderRadius: 1.2, p: 1.2 }}>
                      <Stack direction="row" alignItems="center" spacing={1.2}>
                        <Box
                          component={material.viewed && url ? 'button' : 'div'}
                          type={material.viewed && url ? 'button' : undefined}
                          onClick={material.viewed && url ? openModuleMaterial : undefined}
                          aria-label={material.viewed && url ? `Open ${material.title}` : undefined}
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 1.2,
                            bgcolor: tone.bg,
                            color: tone.color,
                            border: 0,
                            display: 'grid',
                            placeItems: 'center',
                            flexShrink: 0,
                            overflow: 'hidden',
                            cursor: material.viewed && url ? 'pointer' : 'default',
                            backgroundImage: thumbnailUrl ? `linear-gradient(180deg, rgba(8,37,64,0.04), rgba(8,37,64,0.42)), url(${thumbnailUrl})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          {thumbnailUrl ? (
                            <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.9)', color: '#0f63c7', display: 'grid', placeItems: 'center' }}>
                              <OndemandVideoOutlined sx={{ fontSize: 17 }} />
                            </Box>
                          ) : material.material_type === 'pdf' ? (
                            <PdfFileTile size={30} />
                          ) : (
                            <Icon />
                          )}
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                            <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900 }}>{material.title}</Typography>
                            <Chip label={materialTypeLabels[material.material_type] || material.material_type} size="small" />
                            {material.viewed && <Chip label="Completed" size="small" color="success" variant="outlined" />}
                          </Stack>
                          <Typography sx={{ color: '#637083', fontSize: 12 }}>
                            {material.viewed ? 'Click the icon to open' : `${material.estimated_minutes || 0} min estimated`}
                          </Typography>
                        </Box>
                        {url && !material.viewed && (
                          <Button size="small" variant="outlined" onClick={openModuleMaterial}>
                            Open
                          </Button>
                        )}
                        <IconButton size="small" aria-label={`More actions for ${material.title}`} onClick={(event) => setModuleMaterialMenu({ anchorEl: event.currentTarget, material })}>
                          <MoreHorizOutlined fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            )}
          </Box>
          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Assignments</Typography>
                {selectedModule.assignments.length > 1 && (
                  <Chip label={`${selectedModule.assignments.length} total`} size="small" variant="outlined" />
                )}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                {selectedModule.assignments.length > 1 && (
                  <TextField
                    select
                    size="small"
                    value={moduleAssignmentSort}
                    onChange={(event) => {
                      setModuleAssignmentSort(event.target.value);
                      if (event.target.value !== 'due_date') setShowAllModuleAssignments(true);
                    }}
                    sx={{
                      width: 126,
                      '& .MuiSelect-select': { py: 0.65, fontSize: 12, fontWeight: 800 },
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(18,60,105,0.18)' },
                    }}
                  >
                    <MenuItem value="due_date">Due</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="not_submitted">Not submitted</MenuItem>
                  </TextField>
                )}
                {selectedModule.assignments.length > 1 && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setModuleAssignmentDueOrder((current) => (current === 'asc' ? 'desc' : 'asc'))}
                    title={moduleAssignmentDueOrder === 'asc' ? 'Showing soonest first' : 'Showing latest first'}
                    sx={{ minWidth: 38, px: 0.8, fontSize: 16, lineHeight: 1 }}
                  >
                    ⇅
                  </Button>
                )}
                {selectedModule.assignments.length > 1 && (
                  <Button size="small" variant="text" onClick={() => setShowAllModuleAssignments((current) => !current)}>
                    {showAllModuleAssignments ? 'View less' : 'View all'}
                  </Button>
                )}
              </Stack>
            </Stack>
            {selectedModule.assignments.length === 0 ? (
              <Typography sx={{ color: '#637083', fontSize: 14 }}>No assignments posted for this module yet.</Typography>
            ) : sortedModuleAssignments.length === 0 ? (
              <Box sx={{ bgcolor: '#eef3f8', border: '1px solid rgba(18,60,105,0.08)', borderRadius: 1.2, p: 1.4 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>No {moduleAssignmentSort.replace('_', ' ')} assignments.</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13 }}>Switch back to Due to see every assignment in this module.</Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {visibleModuleAssignments.map((assignment, assignmentIndex) => {
                  const selectedFile = selectedFiles[assignment.id];
                  const statusMeta = moduleAssignmentStatus(assignment);
                  const isSubmitted = statusMeta.state === 'submitted';
                  const isLate = statusMeta.state === 'late' || statusMeta.state === 'late_submitted';
                  const submissionsClosed = statusMeta.state === 'closed';
                  const isBlueRow = assignmentIndex % 2 === 1;
                  const cardBg = isBlueRow ? '#eef6ff' : '#fff';
                  const cardBorder = isLate
                    ? 'rgba(211,47,47,0.28)'
                    : submissionsClosed
                    ? 'rgba(82,98,115,0.18)'
                    : isSubmitted
                    ? 'rgba(21,150,95,0.28)'
                    : isBlueRow
                    ? 'rgba(18,60,105,0.16)'
                    : 'rgba(18,60,105,0.08)';
                  return (
                    <Box
                      key={assignment.id}
                      sx={{
                        bgcolor: cardBg,
                        border: `1px solid ${cardBorder}`,
                        borderLeft: `4px solid ${isLate ? '#d32f2f' : submissionsClosed ? '#94a3b8' : isSubmitted ? '#15965f' : isBlueRow ? '#2f80ed' : '#f05a28'}`,
                        borderRadius: 1.2,
                        p: 1.25,
                        boxShadow: isBlueRow ? '0 8px 18px rgba(18,60,105,0.05)' : 'none',
                      }}
                    >
                      <Stack spacing={1.1}>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto' },
                            gap: 1,
                            alignItems: 'start',
                          }}
                        >
                          <Stack direction="row" spacing={1.1} alignItems="flex-start">
                            <Box sx={{ width: 42, height: 42, borderRadius: 1.2, bgcolor: 'rgba(21,150,95,0.12)', color: '#15965f', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                              <AssignmentOutlined />
                            </Box>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>{assignment.title}</Typography>
                              <Typography sx={{ color: '#637083', fontSize: 13 }}>
                                Due {formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </Typography>
                              {assignment.instructions && <Typography sx={{ color: '#526273', fontSize: 13, mt: 0.7, whiteSpace: 'pre-wrap' }}>{assignment.instructions}</Typography>}
                            </Box>
                          </Stack>
                          <Chip
                            label={statusMeta.label}
                            size="small"
                            color={statusMeta.color === 'default' ? undefined : statusMeta.color}
                            sx={{
                              justifySelf: { xs: 'start', sm: 'end' },
                              fontWeight: 850,
                              ...(statusMeta.color === 'default' ? { bgcolor: '#eef3f8', color: '#526273' } : {}),
                            }}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 178px)' },
                            gap: 0.8,
                            alignItems: 'center',
                          }}
                        >
                          {assignment.attachment_url && (
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ minHeight: 34, justifyContent: 'center' }}
                              onClick={() => setViewingMaterial({
                                title: assignment.attachment_name || assignment.title,
                                file_url: assignment.attachment_url,
                                material_type: 'downloadable',
                                course: selectedModule.course,
                                module_title: 'Assignment file',
                              })}
                            >
                              {assignment.attachment_name || 'Open homework file'}
                            </Button>
                          )}
                          {assignment.submission?.file_url && (
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<VisibilityOutlined />}
                              sx={{ minHeight: 34, justifyContent: 'center' }}
                              onClick={() => setViewingMaterial({
                                title: `${assignment.title} submission`,
                                file_url: assignment.submission.file_url,
                                material_type: 'downloadable',
                                course: selectedModule.course,
                                module_title: 'Submitted file',
                              })}
                            >
                              Open submitted file
                            </Button>
                          )}
                        </Box>
                        <Box sx={{ bgcolor: '#fff', borderRadius: 1, p: 1 }}>
                          <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 13 }}>Submission file</Typography>
                          <Typography sx={{ color: '#637083', fontSize: 12, overflowWrap: 'anywhere', mb: 0.8 }}>
                            {submissionsClosed ? 'Submission denied until this assignment is opened.' : selectedFile ? `${selectedFile.name} (${Math.ceil(selectedFile.size / 1024)} KB)` : 'Attach your completed file. Max 25 MB.'}
                          </Typography>
                          {submissionsClosed ? (
                            <Alert severity="info" sx={{ py: 0.2, '& .MuiAlert-message': { py: 0.45, fontSize: 13 } }}>
                              Closed for submissions
                            </Alert>
                          ) : (
                            <Box
                              sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: selectedFile ? '112px 132px 132px' : '132px 132px' },
                                gap: 0.8,
                                alignItems: 'center',
                              }}
                            >
                              {selectedFile && (
                                <Button variant="outlined" size="small" disabled={savingId === assignment.id} sx={{ minHeight: 34 }} onClick={() => setSelectedFiles((current) => ({ ...current, [assignment.id]: null }))}>
                                  Clear
                                </Button>
                              )}
                              <Button variant="outlined" component="label" size="small" disabled={savingId === assignment.id} sx={{ minHeight: 34 }}>
                                Choose file
                                <input
                                  type="file"
                                  hidden
                                  onChange={(event) => setSelectedFiles((current) => ({ ...current, [assignment.id]: event.target.files?.[0] || null }))}
                                  accept={lmsFileAccept}
                                />
                              </Button>
                              <Button variant="contained" color="secondary" size="small" disabled={savingId === assignment.id || !selectedFile} sx={{ minHeight: 34 }} onClick={() => submitModuleAssignment(assignment.id)}>
                                {savingId === assignment.id ? 'Uploading...' : 'Submit file'}
                              </Button>
                            </Box>
                          )}
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
                {hiddenModuleAssignmentCount > 0 && (
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => setShowAllModuleAssignments(true)}
                    sx={{ justifyContent: 'center', borderStyle: 'dashed', py: 1.1 }}
                  >
                    Show {hiddenModuleAssignmentCount} more assignment{hiddenModuleAssignmentCount === 1 ? '' : 's'}
                  </Button>
                )}
              </Stack>
            )}
          </Box>
        </Box>

        {moduleOverview.length > 0 && (
          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 0.4 }}>Module overview</Typography>
            <Typography sx={{ color: '#637083', fontSize: 13, mb: 1.4 }}>All modules in this course</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 1.2 }}>
              {moduleOverview.map((module, index) => {
                const active = module.id === selectedModule.id;
                const complete = moduleProgress(module).status === 'completed';
                return (
                  <Button
                    key={module.id}
                    onClick={() => openModule(module, selectedModule.course)}
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      bgcolor: active ? 'rgba(240,90,40,0.08)' : '#fff',
                      border: `1px solid ${active ? 'rgba(240,90,40,0.42)' : 'rgba(18,60,105,0.1)'}`,
                      borderRadius: 1.2,
                      p: 1.2,
                      color: 'primary.dark',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: complete ? 'rgba(21,150,95,0.12)' : active ? 'rgba(240,90,40,0.12)' : '#eef3f8', color: complete ? '#15965f' : active ? '#f05a28' : '#637083', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        {complete ? <CheckCircleOutlined sx={{ fontSize: 18 }} /> : <ViewModuleOutlined sx={{ fontSize: 17 }} />}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ fontWeight: 950, fontSize: 13 }}>Module {index + 1}</Typography>
                        <Typography noWrap sx={{ color: 'primary.dark', fontSize: 12 }}>{module.title}</Typography>
                      </Box>
                    </Stack>
                  </Button>
                );
              })}
            </Box>
          </Box>
        )}
      </Stack>
    );
  }

  if (visibleModuleCourse) {
    return (
      <StudentModuleLanding
        courseContent={visibleModuleCourse}
        stats={visibleModuleStats}
        loading={loading}
        error={error}
        message={message}
        moduleProgress={moduleProgress}
        onOpenModule={openModule}
        setActivePane={setActivePane}
      />
    );
  }

  return (
    <Stack spacing={3}>
      <StudentPageHeader
        title="Modules"
        subtitle={selectedCourse ? `${selectedCourse.title} modules, materials, and assignments.` : 'Browse modules across your enrolled courses.'}
        icon={ViewModuleOutlined}
      />
      {loading ? (
        <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
      ) : allModules.length === 0 ? (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2.4 }}>
          <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>No modules posted yet.</Typography>
          <Typography sx={{ color: '#637083' }}>Your instructor will add module content as the course progresses.</Typography>
        </Box>
      ) : (
        <Stack spacing={1.4}>
          {courseContents.map((content) => (
            <Box key={content.course.id}>
              {!selectedCourseId && (
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: 18, mb: 1 }}>
                  {content.course.title}
                </Typography>
              )}
              <Stack spacing={1.1}>
                {content.modules.map((module, index) => (
                  <Box
                    key={module.id}
                    onClick={() => openModule(module, content.course)}
                    sx={{
                      bgcolor: '#fff',
                      border: '1px solid rgba(18,60,105,0.12)',
                      borderRadius: 1.5,
                      p: 1.6,
                      cursor: 'pointer',
                      transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
                      '&:hover': {
                        borderColor: 'rgba(240,90,40,0.45)',
                        boxShadow: '0 12px 28px rgba(18,60,105,0.1)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 326px' },
                        gap: 1.4,
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>
                          Module {index + 1}: {module.title}
                        </Typography>
                        {module.description && <Typography sx={{ color: '#637083', fontSize: 14, mt: 0.3 }}>{module.description}</Typography>}
                      </Box>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: '116px 124px 58px' },
                          gap: 0.8,
                          alignItems: 'center',
                          justifyContent: { xs: 'start', md: 'end' },
                        }}
                      >
                        <Chip label={`${module.materials.length} material${module.materials.length === 1 ? '' : 's'}`} size="small" color="primary" variant="outlined" sx={{ width: '100%' }} />
                        <Chip label={`${module.assignments.length} assignment${module.assignments.length === 1 ? '' : 's'}`} size="small" variant="outlined" sx={{ width: '100%' }} />
                        <Button size="small" variant="text" sx={{ px: 0.8, minWidth: 58, justifySelf: { xs: 'start', sm: 'end' } }}>Open</Button>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function StudentAssignmentsPane({ selectedCourseId }) {
  const [assignments, setAssignments] = React.useState([]);
  const [filter, setFilter] = React.useState('all');
  const [courseFilter, setCourseFilter] = React.useState(selectedCourseId ? String(selectedCourseId) : 'all');
  const [dueSort, setDueSort] = React.useState('asc');
  const [search, setSearch] = React.useState('');
  const [showAllAssignments, setShowAllAssignments] = React.useState(false);
  const [selectedFiles, setSelectedFiles] = React.useState({});
  const [viewingFile, setViewingFile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [commentPopover, setCommentPopover] = React.useState({ anchorEl: null, assignment: null });

  const load = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/assignments?status=all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load assignments');
      setAssignments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  React.useEffect(() => {
    setCourseFilter(selectedCourseId ? String(selectedCourseId) : 'all');
    setShowAllAssignments(false);
  }, [selectedCourseId]);

  const courses = Array.from(new Map(assignments.map((assignment) => [assignment.course.id, assignment.course])).values());
  const selectedCourse = courses.find((course) => course.id === Number(courseFilter));
  const getAssignmentStatus = (assignment) => {
    const hasSubmission = Boolean(assignment.submission);
    const isLate = assignment.student_status === 'late' || assignment.submission?.status === 'late';
    if (!assignment.is_open) return { label: 'Closed', color: 'default', group: 'closed' };
    if (assignment.grade || assignment.student_status === 'graded') return { label: 'Reviewed', color: 'reviewed', group: 'reviewed' };
    if (isLate && hasSubmission) return { label: 'Submitted late', color: 'error', group: 'submitted' };
    if (isLate) return { label: 'Late', color: 'error', group: 'late' };
    if (hasSubmission || assignment.student_status === 'submitted') return { label: 'Submitted', color: 'success', group: 'submitted' };
    return { label: 'Pending', color: 'warning', group: 'pending' };
  };
  const getTeacherComment = (assignment) => assignment?.teacher_comment || assignment?.grade?.feedback || '';
  const getAssignmentStatusSx = (status) => {
    if (status.color === 'error') {
      return { bgcolor: 'rgba(211,47,47,0.12)', color: '#b42318', border: '1px solid rgba(211,47,47,0.14)' };
    }
    if (status.color === 'success') {
      return { bgcolor: 'rgba(21,150,95,0.12)', color: '#0f7a55', border: '1px solid rgba(21,150,95,0.14)' };
    }
    if (status.color === 'default') {
      return { bgcolor: '#eef3f8', color: '#526273', border: '1px solid rgba(82,98,115,0.14)' };
    }
    if (status.color === 'reviewed') {
      return { bgcolor: 'rgba(38,120,243,0.12)', color: '#185abc', border: '1px solid rgba(38,120,243,0.16)' };
    }
    return { bgcolor: 'rgba(240,90,40,0.12)', color: '#b84a1f', border: '1px solid rgba(240,90,40,0.14)' };
  };
  const getDueCopy = (assignment) => {
    if (!assignment.due_at) return 'No due date';
    const seconds = assignment.due_at - Math.floor(Date.now() / 1000);
    const days = Math.ceil(seconds / 86400);
    if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
    if (days === 0) return 'Due today';
    return `${days} day${days === 1 ? '' : 's'} left`;
  };
  const searchTerm = search.trim().toLowerCase();
  const courseAssignments = assignments
    .filter((assignment) => courseFilter === 'all' || assignment.course.id === Number(courseFilter))
    .filter((assignment) => {
      if (!searchTerm) return true;
      return [assignment.title, assignment.instructions, assignment.course?.title, assignment.module?.title]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm));
    });
  const filteredAssignments = courseAssignments
    .filter((assignment) => {
      const status = getAssignmentStatus(assignment).group;
      if (filter === 'all') return true;
      return status === filter;
    });
  const visibleAssignments = filteredAssignments
    .sort((first, second) => {
      const firstDue = first.due_at ?? Number.POSITIVE_INFINITY;
      const secondDue = second.due_at ?? Number.POSITIVE_INFINITY;
      return dueSort === 'asc' ? firstDue - secondDue : secondDue - firstDue;
    });
  const displayedAssignments = showAllAssignments ? visibleAssignments : visibleAssignments.slice(0, 3);
  const hiddenAssignmentCount = Math.max(visibleAssignments.length - displayedAssignments.length, 0);
  const assignmentIconPalette = ['#f05a28', '#1b6ef3', '#6f42c1', '#15965f', '#0089a7', '#d93025'];
  const totals = {
    total: courseAssignments.length,
    submitted: courseAssignments.filter((assignment) => getAssignmentStatus(assignment).group === 'submitted').length,
    reviewed: courseAssignments.filter((assignment) => getAssignmentStatus(assignment).group === 'reviewed').length,
    pending: courseAssignments.filter((assignment) => getAssignmentStatus(assignment).group === 'pending').length,
    late: courseAssignments.filter((assignment) => getAssignmentStatus(assignment).group === 'late').length,
    closed: courseAssignments.filter((assignment) => getAssignmentStatus(assignment).group === 'closed').length,
  };
  const progress = totals.total ? Math.round(((totals.submitted + totals.reviewed) / totals.total) * 100) : 0;
  const tabs = [
    ['all', 'All Assignments', totals.total],
    ['pending', 'Pending', totals.pending],
    ['submitted', 'Submitted', totals.submitted],
    ['reviewed', 'Reviewed', totals.reviewed],
    ['late', 'Late', totals.late],
    ['closed', 'Closed', totals.closed],
  ];

  if (viewingFile) {
    return (
      <MaterialInlineViewer
        material={viewingFile}
        onBack={() => setViewingFile(null)}
        backLabel="Back to assignments"
        subtitle={viewingFile.course?.title || 'Assignment file'}
      />
    );
  }

  const submitAssignment = async (assignmentId) => {
    const assignment = assignments.find((item) => item.id === assignmentId);
    if (assignment && !assignment.is_open) {
      setError('This assignment is closed for submissions.');
      return;
    }
    const file = selectedFiles[assignmentId];
    if (!file) {
      setError('Choose a file before submitting.');
      return;
    }
    setSavingId(assignmentId);
    setError('');
    setMessage('');
    try {
      const uploadBody = new FormData();
      uploadBody.append('file', file);
      const uploadResponse = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/assignments/${assignmentId}/submission/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: uploadBody,
      });
      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(uploadData.detail || 'Unable to upload submission file');

      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_url: uploadData.file_url }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to submit assignment');
      setAssignments((current) => current.map((assignment) => (assignment.id === assignmentId ? data : assignment)));
      setSelectedFiles((current) => ({ ...current, [assignmentId]: null }));
      setMessage('Assignment submitted.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Stack spacing={2.2}>
      <Stack direction="row" spacing={0.8} sx={{ color: '#637083', flexWrap: 'wrap', fontSize: 12 }}>
        <Typography sx={{ fontSize: 12 }}>My Courses</Typography>
        <Typography sx={{ fontSize: 12 }}>/</Typography>
        <Typography sx={{ fontSize: 12 }}>{selectedCourse?.title || 'All Courses'}</Typography>
        <Typography sx={{ fontSize: 12 }}>/</Typography>
        <Typography sx={{ color: 'secondary.main', fontWeight: 850, fontSize: 12 }}>Assignments</Typography>
      </Stack>

      <StudentPageHeader
        title="Assignments"
        subtitle="View instructions, upload files, and track your submission progress."
        icon={AssignmentOutlined}
      />
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.2, boxShadow: '0 10px 26px rgba(18,60,105,0.05)' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.4fr 240px 190px auto' }, gap: 1.2, alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search assignments..."
            value={search}
            onChange={(event) => { setSearch(event.target.value); setShowAllAssignments(false); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ color: '#526273' }} /></InputAdornment> }}
          />
          <TextField select size="small" label="Course" value={courseFilter} onChange={(event) => { setCourseFilter(event.target.value); setShowAllAssignments(false); }}>
            <MenuItem value="all">All courses</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
            ))}
          </TextField>
          <TextField select size="small" label="Due date" value={dueSort} onChange={(event) => { setDueSort(event.target.value); setShowAllAssignments(false); }}>
            <MenuItem value="asc">Soonest first</MenuItem>
            <MenuItem value="desc">Latest first</MenuItem>
          </TextField>
          <Button
            variant="outlined"
            startIcon={<FilterAltOffOutlined />}
            onClick={() => { setSearch(''); setCourseFilter(selectedCourseId ? String(selectedCourseId) : 'all'); setFilter('all'); setDueSort('asc'); setShowAllAssignments(false); }}
            sx={{ justifySelf: { xs: 'stretch', lg: 'end' } }}
          >
            Filters
          </Button>
        </Box>
      </Box>

      <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 1.4, md: 1.7 }, boxShadow: '0 10px 26px rgba(18,60,105,0.05)' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 1.4 }}>
          {[
            ['Total assignments', totals.total, AssignmentOutlined, '#6f42c1'],
            ['Submitted', totals.submitted, CheckCircleOutlined, '#15965f'],
            ['Pending', totals.pending, AccessTimeOutlined, '#f05a28'],
            ['Progress', `${progress}%`, CheckCircleOutlined, '#1b6ef3'],
          ].map(([label, value, Icon, color]) => (
            <Stack key={label} direction="row" spacing={1.2} alignItems="center" sx={{ borderRight: { xl: label === 'Progress' ? 'none' : '1px solid rgba(18,60,105,0.08)' }, pr: { xl: 1.2 } }}>
              <Box sx={{ width: 44, height: 44, borderRadius: 1.4, bgcolor: `${color}16`, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Icon />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, lineHeight: 1 }}>{value}</Typography>
                <Typography sx={{ color: '#526273', fontSize: 12.5 }}>{label}</Typography>
                {label === 'Progress' && (
                  <Box sx={{ mt: 0.8, height: 5, borderRadius: 999, bgcolor: '#e6edf6', overflow: 'hidden' }}>
                    <Box sx={{ width: `${progress}%`, height: '100%', bgcolor: color }} />
                  </Box>
                )}
              </Box>
            </Stack>
          ))}
        </Box>
      </Box>

      {loading ? <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack> : courseAssignments.length === 0 ? (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2.4 }}>
          <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>No assignments in this view.</Typography>
          <Typography sx={{ color: '#637083', fontSize: 14 }}>Try a different course or search term.</Typography>
        </Box>
      ) : (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.2, boxShadow: '0 10px 26px rgba(18,60,105,0.05)' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={1.2} sx={{ borderBottom: '1px solid rgba(18,60,105,0.1)', mb: 1.2 }}>
            <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap' }}>
              {tabs.map(([value, label, count]) => {
                const active = filter === value;
                return (
                  <Button
                    key={value}
                    onClick={() => { setFilter(value); setShowAllAssignments(false); }}
                    sx={{
                      color: active ? 'secondary.main' : '#526273',
                      borderBottom: active ? '2px solid #f05a28' : '2px solid transparent',
                      borderRadius: 0,
                      px: 1.4,
                      py: 1,
                      fontWeight: 850,
                    }}
                  >
                    {label}
                    <Chip label={count} size="small" sx={{ ml: 0.8, height: 20, fontWeight: 850, bgcolor: active ? 'rgba(240,90,40,0.13)' : '#eef3f8', color: active ? 'secondary.main' : '#637083' }} />
                  </Button>
                );
              })}
            </Stack>
          </Stack>
          {visibleAssignments.length === 0 ? (
            <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1.2, p: 1.6 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>No {filter === 'all' ? '' : filter} assignments here.</Typography>
              <Typography sx={{ color: '#637083', fontSize: 14 }}>Switch tabs or clear filters to see more assignments.</Typography>
            </Box>
          ) : (
            <Stack spacing={1.1}>
            {displayedAssignments.map((assignment, assignmentIndex) => {
            const selectedFile = selectedFiles[assignment.id];
            const status = getAssignmentStatus(assignment);
            const submissionsClosed = !assignment.is_open;
            const iconTone = assignmentIconPalette[assignmentIndex % assignmentIconPalette.length];
            const teacherComment = getTeacherComment(assignment);
            return (
              <Box key={assignment.id} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1.5, p: { xs: 1.2, md: 1.35 } }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.2fr) 220px 280px 36px' }, gap: 1.4, alignItems: 'center' }}>
                  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box sx={{ width: 48, height: 48, borderRadius: 1.4, bgcolor: `${iconTone}16`, color: iconTone, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <AssignmentOutlined />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>{assignment.title}</Typography>
                      <Typography sx={{ color: '#526273', fontSize: 13 }}>
                        {assignment.course.title} {assignment.module?.title ? `| ${assignment.module.title}` : ''} | Due {formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                      {assignment.instructions && <Typography noWrap sx={{ color: '#637083', fontSize: 13, mt: 0.2 }}>{assignment.instructions}</Typography>}
                      <Stack direction="row" spacing={0.7} sx={{ flexWrap: 'wrap', mt: 0.7 }}>
                        <Chip label="Individual" size="small" sx={{ height: 22 }} />
                        <Chip label="Max 25 MB" size="small" sx={{ height: 22 }} />
                        {submissionsClosed && <Chip label="Submission closed" size="small" sx={{ height: 22, bgcolor: '#eef3f8', color: '#526273' }} />}
                        {assignment.attachment_url && (
                          <Chip label={assignment.attachment_name || 'Homework file'} size="small" variant="outlined" sx={{ height: 22 }} />
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                  <Box>
                    <Chip
                      label={status.label}
                      size="small"
                      sx={{ ...getAssignmentStatusSx(status), fontWeight: 650, mb: 0.6, '& .MuiChip-label': { px: 1.1 } }}
                    />
                    <Typography sx={{ color: status.group === 'late' ? '#b42318' : '#526273', fontSize: 12.5, fontWeight: 400 }}>
                      {assignment.submission?.submitted_at
                        ? `Submitted ${formatTimestamp(assignment.submission.submitted_at, { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : getDueCopy(assignment)}
                    </Typography>
                  </Box>
                  <Stack spacing={0.8} sx={{ '& .MuiButton-root': { fontWeight: 650 } }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, max-content)', justifyItems: 'start', gap: 0.65 }}>
                      {assignment.attachment_url && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setViewingFile({
                            title: assignment.attachment_name || assignment.title,
                            file_url: assignment.attachment_url,
                            material_type: 'downloadable',
                            course: assignment.course,
                            module_title: 'Assignment file',
                          })}
                        >
                          Open instructions
                        </Button>
                      )}
                      {assignment.submission?.file_url && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityOutlined />}
                          onClick={() => setViewingFile({
                            title: `${assignment.title} submission`,
                            file_url: assignment.submission.file_url,
                            material_type: 'downloadable',
                            course: assignment.course,
                            module_title: 'Submitted file',
                          })}
                        >
                          Open submission
                        </Button>
                      )}
                    </Box>
                    {submissionsClosed ? (
                      <Alert severity="info" sx={{ py: 0.2, '& .MuiAlert-message': { py: 0.45, fontSize: 13 } }}>
                        Submission denied until this assignment is opened.
                      </Alert>
                    ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'max-content max-content', justifyContent: 'start', gap: 0.8 }}>
                      {selectedFile && (
                        <Button variant="outlined" size="small" disabled={savingId === assignment.id} onClick={() => setSelectedFiles((current) => ({ ...current, [assignment.id]: null }))}>
                          Clear
                        </Button>
                      )}
                      <Button variant="outlined" component="label" size="small" disabled={savingId === assignment.id}>
                        {selectedFile ? selectedFile.name : 'Choose file'}
                        <input
                          type="file"
                          hidden
                          onChange={(event) => setSelectedFiles((current) => ({ ...current, [assignment.id]: event.target.files?.[0] || null }))}
                          accept={lmsFileAccept}
                        />
                      </Button>
                      <Button variant="contained" color="secondary" size="small" disabled={savingId === assignment.id || !selectedFile} onClick={() => submitAssignment(assignment.id)}>
                        {savingId === assignment.id ? 'Uploading...' : assignment.submission ? 'Resubmit' : 'Submit'}
                      </Button>
                    </Box>
                    )}
                  </Stack>
                  <IconButton
                    size="small"
                    disabled={!teacherComment}
                    aria-label={teacherComment ? `View teacher comment for ${assignment.title}` : `No teacher comment for ${assignment.title}`}
                    onClick={(event) => setCommentPopover({ anchorEl: event.currentTarget, assignment })}
                    sx={{
                      justifySelf: 'center',
                      border: '1px solid rgba(18,60,105,0.14)',
                      borderRadius: 1,
                      color: teacherComment ? 'primary.dark' : '#9aa7b5',
                      bgcolor: teacherComment ? '#fff' : '#f4f7fb',
                      '&:hover': { bgcolor: teacherComment ? '#f1f7ff' : '#f4f7fb' },
                    }}
                  >
                    <Badge badgeContent={teacherComment ? 1 : 0} color="secondary" overlap="circular">
                      <ForumOutlined fontSize="small" />
                    </Badge>
                  </IconButton>
                </Box>
              </Box>
            );
            })}
            {visibleAssignments.length > 3 && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setShowAllAssignments((current) => !current)}
                sx={{ justifyContent: 'center', borderStyle: 'dashed', py: 1.1 }}
              >
                {showAllAssignments ? 'View less' : `View all +${hiddenAssignmentCount} assignment${hiddenAssignmentCount === 1 ? '' : 's'}`}
              </Button>
            )}
            </Stack>
          )}
        </Box>
      )}
      <Popover
        open={Boolean(commentPopover.anchorEl)}
        anchorEl={commentPopover.anchorEl}
        onClose={() => setCommentPopover({ anchorEl: null, assignment: null })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 320,
            borderRadius: 1.5,
            border: '1px solid rgba(18,60,105,0.12)',
            boxShadow: '0 18px 44px rgba(18,60,105,0.16)',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ p: 1.5, bgcolor: '#f8fbff', borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 34, height: 34, borderRadius: 1, bgcolor: '#eaf2ff', color: '#2678f3', display: 'grid', placeItems: 'center' }}>
              <ForumOutlined fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950, lineHeight: 1.2 }}>Teacher comment</Typography>
              <Typography noWrap sx={{ color: '#637083', fontSize: 12.5 }}>{commentPopover.assignment?.title || 'Assignment'}</Typography>
            </Box>
          </Stack>
        </Box>
        <Box sx={{ p: 1.7 }}>
          <Typography sx={{ color: '#526273', fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
            {getTeacherComment(commentPopover.assignment) || 'No comment available.'}
          </Typography>
        </Box>
      </Popover>
    </Stack>
  );
}

function StudentAnnouncementsPane({ user, selectedAnnouncementId, onAnnouncementRead }) {
  const [announcements, setAnnouncements] = React.useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [courseFilter, setCourseFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [dateSort, setDateSort] = React.useState('desc');
  const helpfulVotesStorageKey = `three13_student_announcement_helpful_votes_${user?.id || user?.email || 'student'}`;
  const [helpfulVotes, setHelpfulVotes] = React.useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(helpfulVotesStorageKey) || '{}');
    } catch {
      return {};
    }
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    let mounted = true;
    fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/announcements`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to load announcements');
        if (mounted) setAnnouncements(data);
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    if (!selectedAnnouncementId || announcements.length === 0) return;
    const matchingAnnouncement = announcements.find((announcement) => announcement.id === selectedAnnouncementId);
    if (matchingAnnouncement) setSelectedAnnouncement(matchingAnnouncement);
  }, [announcements, selectedAnnouncementId]);

  const announcementCourses = React.useMemo(() => {
    const map = new Map();
    announcements.forEach((announcement) => {
      if (announcement.course?.id) map.set(String(announcement.course.id), announcement.course);
    });
    return Array.from(map.values());
  }, [announcements]);

  const filteredAnnouncements = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return announcements
      .filter((announcement) => {
        if (courseFilter !== 'all') {
          if (courseFilter === 'platform' && announcement.course?.id) return false;
          if (courseFilter !== 'platform' && String(announcement.course?.id || '') !== courseFilter) return false;
        }
        if (statusFilter === 'urgent' && !announcement.is_urgent) return false;
        if (statusFilter === 'attachments' && !announcement.attachment_url) return false;
        if (statusFilter === 'platform' && announcement.course?.id) return false;
        if (!term) return true;
        return [
          announcement.title,
          announcement.body,
          announcement.course?.title,
          announcement.author?.full_name,
        ].filter(Boolean).some((value) => value.toLowerCase().includes(term));
      })
      .sort((a, b) => {
        const first = Number(a.created_at || 0);
        const second = Number(b.created_at || 0);
        return dateSort === 'asc' ? first - second : second - first;
      });
  }, [announcements, courseFilter, dateSort, search, statusFilter]);

  React.useEffect(() => {
    setSelectedAnnouncement(null);
  }, [courseFilter, dateSort, search, statusFilter]);

  const announcementStats = [
    { label: 'Total notices', value: announcements.length, icon: CampaignOutlined, color: '#7c3aed', bg: '#f2eaff' },
    { label: 'Urgent', value: announcements.filter((announcement) => announcement.is_urgent).length, icon: AccessTimeOutlined, color: '#f05a28', bg: '#fff0e9' },
    { label: 'Attachments', value: announcements.filter((announcement) => announcement.attachment_url).length, icon: FolderCopyOutlined, color: '#2563eb', bg: '#eaf2ff' },
  ];

  const announcementTabs = [
    ['all', 'All Announcements', announcements.length],
    ['urgent', 'Urgent', announcements.filter((announcement) => announcement.is_urgent).length],
    ['attachments', 'Attachments', announcements.filter((announcement) => announcement.attachment_url).length],
    ['platform', 'Platform', announcements.filter((announcement) => !announcement.course?.id).length],
  ];

  const rowIconPalette = [
    { bg: '#ffe8e1', color: '#f05a28' },
    { bg: '#eaf2ff', color: '#2563eb' },
    { bg: '#edf8f2', color: '#15965f' },
    { bg: '#f2eaff', color: '#7c3aed' },
  ];

  const activeAnnouncement = filteredAnnouncements.find((announcement) => announcement.id === selectedAnnouncement?.id) || filteredAnnouncements[0] || null;
  const activeHelpfulVote = activeAnnouncement ? helpfulVotes[activeAnnouncement.id] : '';

  const markAnnouncementRead = React.useCallback(async (announcementId) => {
    setAnnouncements((current) => current.map((announcement) => (
      announcement.id === announcementId ? { ...announcement, is_read: true, read_at: announcement.read_at || Math.floor(Date.now() / 1000) } : announcement
    )));
    onAnnouncementRead?.(announcementId);
    try {
      await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/announcements/${announcementId}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch {
      // Keep the optimistic read state; the next refresh can reconcile it.
    }
  }, [onAnnouncementRead]);

  React.useEffect(() => {
    if (activeAnnouncement && !activeAnnouncement.is_read) {
      markAnnouncementRead(activeAnnouncement.id);
    }
  }, [activeAnnouncement, markAnnouncementRead]);

  const toggleHelpfulVote = (announcementId, vote) => {
    setHelpfulVotes((current) => ({
      ...current,
      [announcementId]: current[announcementId] === vote ? '' : vote,
    }));
  };

  React.useEffect(() => {
    try {
      window.localStorage.setItem(helpfulVotesStorageKey, JSON.stringify(helpfulVotes));
    } catch {
      // Helpful votes can still work for the current visit if storage is unavailable.
    }
  }, [helpfulVotes, helpfulVotesStorageKey]);

  return (
    <Stack spacing={3}>
      <StudentPageHeader title="Announcements" subtitle="Course updates, platform notices, and deadline reminders." icon={CampaignOutlined} />
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack> : announcements.length === 0 ? (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2 }}>No announcements yet.</Box>
      ) : (
        <Stack spacing={2}>
          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.2, boxShadow: '0 16px 40px rgba(18,60,105,0.06)' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(260px, 1fr) 240px 180px 120px' }, gap: 1.2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search announcements..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }}
              />
              <TextField select size="small" label="Course" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
                <MenuItem value="all">All courses</MenuItem>
                <MenuItem value="platform">Platform</MenuItem>
                {announcementCourses.map((course) => <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>)}
              </TextField>
              <TextField select size="small" label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="attachments">Attachments</MenuItem>
                <MenuItem value="platform">Platform</MenuItem>
              </TextField>
              <TextField select size="small" label="Date" value={dateSort} onChange={(event) => setDateSort(event.target.value)}>
                <MenuItem value="desc">Newest first</MenuItem>
                <MenuItem value="asc">Oldest first</MenuItem>
              </TextField>
            </Box>
          </Box>

          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.5, boxShadow: '0 16px 40px rgba(18,60,105,0.06)' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.5 }}>
              {announcementStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Box key={stat.label} sx={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 1.1, alignItems: 'center', borderLeft: index === 0 ? 'none' : { lg: '1px solid rgba(18,60,105,0.1)' }, pl: index === 0 ? 0 : { lg: 1.5 } }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 1.2, bgcolor: stat.bg, color: stat.color, display: 'grid', placeItems: 'center' }}>
                      <Icon />
                    </Box>
                    <Box>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 18, lineHeight: 1 }}>{stat.value}</Typography>
                      <Typography sx={{ color: '#526273', fontSize: 13 }}>{stat.label}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.2, boxShadow: '0 18px 44px rgba(18,60,105,0.07)' }}>
            <Stack direction="row" spacing={1.8} sx={{ borderBottom: '1px solid rgba(18,60,105,0.1)', px: 0.4, overflowX: 'auto' }}>
              {announcementTabs.map(([value, label, count]) => (
                <Button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  sx={{
                    color: statusFilter === value ? 'secondary.main' : '#526273',
                    borderBottom: statusFilter === value ? '2px solid #f05a28' : '2px solid transparent',
                    borderRadius: 0,
                    minWidth: 'max-content',
                    px: 1.2,
                    pb: 1.1,
                  }}
                >
                  {label}
                  <Chip label={count} size="small" sx={{ ml: 0.8, height: 22, bgcolor: statusFilter === value ? '#ffe2d7' : '#e8eef5', color: statusFilter === value ? '#f05a28' : '#637083', fontWeight: 850 }} />
                </Button>
              ))}
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '0.92fr 1.08fr' }, gap: 1.6, pt: 1.2 }}>
              <Stack spacing={1}>
              {filteredAnnouncements.length === 0 ? (
                <Box sx={{ border: '1px dashed rgba(18,60,105,0.18)', borderRadius: 1.2, p: 2, textAlign: 'center' }}>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>No announcements match this view.</Typography>
                </Box>
              ) : filteredAnnouncements.map((announcement, index) => {
                const palette = rowIconPalette[index % rowIconPalette.length];
                const active = activeAnnouncement?.id === announcement.id;
                return (
                  <Box
                    key={announcement.id}
                    onClick={() => setSelectedAnnouncement(announcement)}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) 12px',
                      gap: 1,
                      alignItems: 'center',
                      bgcolor: active ? 'rgba(240,90,40,0.08)' : '#fff',
                      border: `1px solid ${active ? 'rgba(240,90,40,0.36)' : 'rgba(18,60,105,0.1)'}`,
                      borderLeft: `4px solid ${active ? '#f05a28' : 'transparent'}`,
                      borderRadius: 1.2,
                      p: 1.25,
                      cursor: 'pointer',
                      transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
                      '&:hover': {
                        borderColor: active ? 'rgba(240,90,40,0.45)' : 'rgba(18,60,105,0.2)',
                        boxShadow: '0 12px 28px rgba(18,60,105,0.1)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={0.6} alignItems="center" sx={{ mb: 0.45, minWidth: 0, flexWrap: 'wrap' }}>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 900, lineHeight: 1.25 }}>{announcement.title}</Typography>
                        {announcement.is_urgent && <Chip label="Urgent" size="small" sx={{ bgcolor: '#ffe2df', color: '#d32f2f', height: 20, fontWeight: 850 }} />}
                        <Chip label={announcement.course?.title ? 'Course' : 'Platform'} size="small" sx={{ bgcolor: announcement.course?.title ? '#eaf2ff' : '#123c69', color: announcement.course?.title ? '#2563eb' : '#fff', height: 20, fontWeight: 800 }} />
                        {announcement.attachment_url && <Chip label="Attachment" size="small" sx={{ bgcolor: '#f3eee9', color: '#5a4b3f', height: 20, fontWeight: 800 }} />}
                      </Stack>
                      <Typography sx={{ color: '#526273', fontSize: 13, mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {previewText(announcement.body, 82)}
                      </Typography>
                      <Typography sx={{ color: '#526273', fontSize: 12, mt: 0.55 }}>
                        {announcement.author.full_name} | {formatTimestamp(announcement.created_at, { month: 'short', day: 'numeric', year: 'numeric' })} | {formatTimestamp(announcement.created_at, { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: active ? '#f05a28' : palette.color, justifySelf: 'end', opacity: active ? 1 : 0.75 }} />
                  </Box>
                );
              })}
                {filteredAnnouncements.length > 0 && (
                  <Typography sx={{ color: '#637083', fontSize: 13, pt: 1 }}>
                    Showing 1-{Math.min(filteredAnnouncements.length, announcements.length)} of {announcements.length} announcements
                  </Typography>
                )}
              </Stack>

              <Box sx={{ display: { xs: activeAnnouncement ? 'block' : 'none', xl: 'block' } }}>
                {activeAnnouncement ? (
                  <Box sx={{ bgcolor: '#fff', border: `1px solid ${activeAnnouncement.is_urgent ? 'rgba(240,90,40,0.22)' : 'rgba(18,60,105,0.12)'}`, borderRadius: 1.5, p: { xs: 2, md: 2.4 }, minHeight: 430, position: { xl: 'sticky' }, top: { xl: 18 }, boxShadow: '0 18px 44px rgba(18,60,105,0.08)' }}>
                    <Stack spacing={1.7}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.2}>
                        <Stack spacing={0.8}>
                          <Stack direction="row" spacing={0.7} sx={{ flexWrap: 'wrap' }}>
                            {activeAnnouncement.is_urgent && <Chip label="Urgent" size="small" sx={{ bgcolor: '#ffe2df', color: '#d32f2f', fontWeight: 850 }} />}
                            <Chip label={activeAnnouncement.course?.title || 'Platform'} size="small" sx={{ bgcolor: '#123c69', color: '#fff', fontWeight: 850 }} />
                            {activeAnnouncement.attachment_url && <Chip label="Attachment" size="small" sx={{ bgcolor: '#f3eee9', color: '#5a4b3f', fontWeight: 850 }} />}
                          </Stack>
                          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '1.45rem', md: '1.85rem' }, lineHeight: 1.15 }}>
                            {activeAnnouncement.title}
                          </Typography>
                        </Stack>
                        <IconButton size="small" aria-label={`More actions for ${activeAnnouncement.title}`}>
                          <MoreHorizOutlined fontSize="small" />
                        </IconButton>
                      </Stack>

                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#123c69', fontSize: 15, fontWeight: 900 }}>
                          {(activeAnnouncement.author?.full_name || 'A').charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>{activeAnnouncement.author.full_name}</Typography>
                          <Typography sx={{ color: '#526273', fontSize: 13 }}>
                            {formatTimestamp(activeAnnouncement.created_at, { month: 'short', day: 'numeric', year: 'numeric' })} | {formatTimestamp(activeAnnouncement.created_at, { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      </Stack>

                      <Typography sx={{ color: '#526273', whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                        {activeAnnouncement.body}
                      </Typography>

                      {activeAnnouncement.attachment_url && (
                        <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.2, p: 1.4 }}>
                          <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Attachments (1)</Typography>
                          <Box sx={{ display: 'grid', gridTemplateColumns: '42px minmax(0, 1fr) 40px', gap: 1, alignItems: 'center', border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1, p: 1 }}>
                            {isImageUrl(activeAnnouncement.attachment_url) || isImageUrl(activeAnnouncement.attachment_name) ? (
                              <Box sx={{ width: 34, height: 34, borderRadius: 0.9, bgcolor: '#eaf2ff', color: '#2563eb', display: 'grid', placeItems: 'center' }}>
                                <InsertDriveFileOutlined sx={{ fontSize: 20 }} />
                              </Box>
                            ) : (
                              <PdfFileTile size={34} />
                            )}
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {activeAnnouncement.attachment_name || 'Announcement attachment'}
                              </Typography>
                              <Typography sx={{ color: '#637083', fontSize: 12 }}>Open or download attachment</Typography>
                            </Box>
                            <IconButton component="a" href={activeAnnouncement.attachment_url} target="_blank" rel="noreferrer" size="small" aria-label="Open attachment">
                              <DownloadOutlined fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      )}

                      <Stack direction="row" spacing={1} alignItems="center" sx={{ pt: 1.2 }}>
                        <Typography sx={{ color: '#526273', fontSize: 13 }}>Was this helpful?</Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ThumbUpOutlined fontSize="small" />}
                          onClick={() => toggleHelpfulVote(activeAnnouncement.id, 'yes')}
                          sx={{
                            bgcolor: activeHelpfulVote === 'yes' ? '#e8f7ef' : '#fff',
                            color: activeHelpfulVote === 'yes' ? '#16805f' : 'primary.dark',
                            borderColor: activeHelpfulVote === 'yes' ? 'rgba(22,128,95,0.36)' : 'rgba(18,60,105,0.14)',
                            boxShadow: '0 8px 18px rgba(18,60,105,0.06)',
                            minWidth: 74,
                          }}
                        >
                          Yes
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ThumbDownOutlined fontSize="small" />}
                          onClick={() => toggleHelpfulVote(activeAnnouncement.id, 'no')}
                          sx={{
                            bgcolor: activeHelpfulVote === 'no' ? '#fff0e9' : '#fff',
                            color: activeHelpfulVote === 'no' ? '#d32f2f' : 'primary.dark',
                            borderColor: activeHelpfulVote === 'no' ? 'rgba(211,47,47,0.32)' : 'rgba(18,60,105,0.14)',
                            boxShadow: '0 8px 18px rgba(18,60,105,0.06)',
                            minWidth: 68,
                          }}
                        >
                          No
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                ) : (
                  <Box sx={{ border: '1px dashed rgba(18,60,105,0.18)', borderRadius: 1.2, p: 2, textAlign: 'center' }}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>Select an announcement to read it.</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Stack>
      )}
    </Stack>
  );
}

function StudentCommunityPane() {
  return <CommunityHubModern />;
}

function AlumniProfilePane({ user, onUserUpdated }) {
  const [profileForm, setProfileForm] = React.useState({ full_name: user.full_name || '', phone: user.phone || '' });
  const [passwordForm, setPasswordForm] = React.useState({ current_password: '', new_password: '', confirm_password: '' });
  const [profileDialogOpen, setProfileDialogOpen] = React.useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const memberSince = user?.created_at ? formatTimestamp(user.created_at, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Alumni';

  React.useEffect(() => {
    setProfileForm({ full_name: user.full_name || '', phone: user.phone || '' });
  }, [user.full_name, user.phone]);

  React.useEffect(() => {
    if (!message) return undefined;
    const timeoutId = window.setTimeout(() => setMessage(''), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [message]);

  const updateProfileInfo = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/profile`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update profile');
      onUserUpdated?.(data);
      setProfileDialogOpen(false);
      setMessage('Profile updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadProfilePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadingPhoto(true);
    setError('');
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/profile-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update profile photo');
      onUserUpdated?.(data);
      setMessage('Profile photo updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError('New password and confirmation do not match');
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: passwordForm.current_password, new_password: passwordForm.new_password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to change password');
      setPasswordDialogOpen(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setMessage('Password updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2.5}>
      <StudentPageHeader title="Alumni Profile" subtitle="Manage your community identity and account access." icon={PersonOutlineOutlined} />
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '320px 1fr' }, gap: 2 }}>
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2.2, boxShadow: '0 18px 44px rgba(18,60,105,0.07)' }}>
          <Stack alignItems="center" spacing={1.1}>
            <Box sx={{ position: 'relative' }}>
              <UserAvatar user={user} size={92} />
              <IconButton component="label" size="small" disabled={uploadingPhoto} sx={{ position: 'absolute', right: -4, bottom: 4, bgcolor: '#fff', color: 'primary.main', border: '1px solid rgba(18,60,105,0.14)', '&:hover': { bgcolor: '#eef3f8' } }}>
                <EditOutlined sx={{ fontSize: 15 }} />
                <Box component="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={uploadProfilePhoto} />
              </IconButton>
            </Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.25rem' }}>{user.full_name}</Typography>
            <Chip label="Alumni" size="small" sx={{ bgcolor: '#f4ecff', color: '#7c3aed', fontWeight: 800 }} />
            <Typography sx={{ color: '#526273', fontSize: 13, textAlign: 'center' }}>{user.email}</Typography>
            <Typography sx={{ color: '#526273', fontSize: 12 }}>Member since {memberSince}</Typography>
          </Stack>
        </Box>

        <Stack spacing={2}>
          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2.2, boxShadow: '0 18px 44px rgba(18,60,105,0.06)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Personal Information</Typography>
              <Button variant="outlined" size="small" startIcon={<EditOutlined />} onClick={() => setProfileDialogOpen(true)}>Edit</Button>
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
              {[
                ['Full Name', user.full_name, PersonOutlineOutlined],
                ['Email Address', user.email, EmailOutlined],
                ['Phone Number', user.phone || 'Not provided', PhoneOutlined],
                ['Alumni ID', `ALM-${String(user.id || 0).padStart(5, '0')}`, ArticleOutlined],
              ].map(([label, value, Icon]) => (
                <Stack key={label} direction="row" spacing={1.2} alignItems="center" sx={{ bgcolor: '#f8fafc', borderRadius: 1, p: 1.3 }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: 1, bgcolor: '#eef3f8', color: 'primary.main', display: 'grid', placeItems: 'center' }}><Icon fontSize="small" /></Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: '#637083', fontSize: 12 }}>{label}</Typography>
                    <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 850 }}>{value}</Typography>
                  </Box>
                </Stack>
              ))}
            </Box>
          </Box>

          <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2.2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.4 }}>Account Access</Typography>
            <Stack spacing={1}>
              <Button variant="outlined" startIcon={<LockOutlined />} onClick={() => setPasswordDialogOpen(true)} sx={{ justifyContent: 'flex-start' }}>Change password</Button>
              <Button variant="outlined" startIcon={<ForumOutlined />} onClick={() => {}} sx={{ justifyContent: 'flex-start', pointerEvents: 'none' }}>Community access active</Button>
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Dialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Edit Profile</DialogTitle>
        <DialogContent>
          <Stack component="form" id="alumni-profile-form" onSubmit={updateProfileInfo} spacing={1.4} sx={{ pt: 1 }}>
            <TextField label="Full name" value={profileForm.full_name} onChange={(event) => setProfileForm((current) => ({ ...current, full_name: event.target.value }))} required />
            <TextField label="Phone number" value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Optional" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setProfileDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button type="submit" form="alumni-profile-form" variant="contained" color="secondary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Change Password</DialogTitle>
        <DialogContent>
          <Stack component="form" id="alumni-password-form" onSubmit={changePassword} spacing={1.4} sx={{ pt: 1 }}>
            <TextField label="Current password" type="password" value={passwordForm.current_password} onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))} required />
            <TextField label="New password" type="password" value={passwordForm.new_password} onChange={(event) => setPasswordForm((current) => ({ ...current, new_password: event.target.value }))} required helperText="Use at least 9 characters." />
            <TextField label="Confirm new password" type="password" value={passwordForm.confirm_password} onChange={(event) => setPasswordForm((current) => ({ ...current, confirm_password: event.target.value }))} required />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setPasswordDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button type="submit" form="alumni-password-form" variant="contained" color="secondary" disabled={saving}>{saving ? 'Updating...' : 'Update password'}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function StudentCertificatesPane({ selectedCourseId }) {
  const [certificates, setCertificates] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [viewingCertificate, setViewingCertificate] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/certificates`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to load certificates');
        if (mounted) setCertificates(data);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const visibleCertificates = certificates.filter((certificate) => (
    selectedCourseId ? certificate.course.id === Number(selectedCourseId) : true
  ));

  if (viewingCertificate) {
    return (
      <Box sx={{ height: { xs: 'calc(100vh - 96px)', md: 'calc(100vh - 116px)' }, display: 'flex', flexDirection: 'column', minHeight: 560 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1.2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '1.55rem', md: '1.9rem' }, lineHeight: 1.1 }}>
              {viewingCertificate.course.title}
            </Typography>
            <Typography sx={{ color: '#637083', fontSize: 13 }}>{viewingCertificate.file_name}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => setViewingCertificate(null)}>Back</Button>
            <Button variant="contained" color="secondary" href={viewingCertificate.file_url} target="_blank" rel="noreferrer" download>Download</Button>
          </Stack>
        </Stack>
        <Box sx={{ flex: 1, bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, overflow: 'hidden', minHeight: 0 }}>
          {isImageUrl(viewingCertificate.file_url) || isImageUrl(viewingCertificate.file_name) ? (
            <Box
              component="img"
              src={viewingCertificate.file_url}
              alt={viewingCertificate.file_name || 'Certificate'}
              sx={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain', bgcolor: '#fff' }}
            />
          ) : (
            <Box
              component="iframe"
              title={viewingCertificate.file_name || 'Certificate viewer'}
              src={viewingCertificate.file_url}
              sx={{ width: '100%', height: '100%', border: 0, bgcolor: '#fff' }}
            />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <StudentPageHeader
        title="Certificates"
        subtitle="View and download certificates issued for your completed courses."
        icon={VerifiedOutlined}
      />
      <Box sx={{ borderTop: '1px solid rgba(18,60,105,0.14)' }} />
      {loading ? (
        <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
      ) : visibleCertificates.length === 0 ? (
        <Box sx={{ p: 1 }}>
          <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>No certificates issued yet.</Typography>
          <Typography sx={{ color: '#637083' }}>When your course is completed and the admin uploads your certificate, it will appear here.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          {visibleCertificates.map((certificate) => (
            <Box key={certificate.id} sx={{ p: { xs: 0.5, md: 0.8 } }}>
              <Stack spacing={1.4}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box sx={{ width: 50, height: 50, borderRadius: 1.4, bgcolor: 'rgba(21,150,95,0.12)', color: '#15965f', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <VerifiedOutlined />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 950 }}>{certificate.course.title}</Typography>
                    <Typography sx={{ color: '#637083', fontSize: 13 }}>
                      Issued {formatTimestamp(certificate.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </Box>
                </Stack>
                <Typography noWrap sx={{ color: '#526273', fontSize: 13 }}>{certificate.file_name}</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  <Button size="small" variant="outlined" startIcon={<VisibilityOutlined />} onClick={() => setViewingCertificate(certificate)}>
                    View
                  </Button>
                  <Button size="small" variant="contained" color="secondary" href={certificate.file_url} target="_blank" rel="noreferrer" download>
                    Download
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Box>
      )}
    </Stack>
  );
}

function StudentSupportPane({ user, supportRole = 'student' }) {
  const isTeacherSupport = supportRole === 'teacher';
  const defaultCategory = isTeacherSupport ? 'teacher_issue' : 'student_question';
  const supportEndpoint = isTeacherSupport ? 'teacher' : 'student';
  const supportTitle = isTeacherSupport ? 'Teacher Support' : 'Support';
  const supportSubtitle = isTeacherSupport
    ? 'Get help with course content, student submissions, announcements, and platform tools.'
    : "We're here to help. Submit a ticket or view your previous requests.";
  const ticketFormId = `${supportEndpoint}-support-ticket-form`;
  const canSubmitSupportTicket = isTeacherSupport || Boolean(user?.is_active);
  const ticketDisabledMessage = 'Your account is waiting for admin approval. You can submit support tickets after your account is approved.';
  const visibleCategoryOptions = isTeacherSupport
    ? supportCategoryOptions.filter((option) => option.value !== 'student_question' && option.value !== 'enrollment_confirmation')
    : supportCategoryOptions;
  const [form, setForm] = React.useState({ subject: '', message: '', category: defaultCategory });
  const [tickets, setTickets] = React.useState([]);
  const [loadingTickets, setLoadingTickets] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [ticketDialogOpen, setTicketDialogOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState(null);
  const [expandedFaq, setExpandedFaq] = React.useState('');
  const ticketsRef = React.useRef(null);

  const loadTickets = React.useCallback(async () => {
    setLoadingTickets(true);
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/${supportEndpoint}/support-tickets`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load support tickets');
      setTickets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingTickets(false);
    }
  }, [supportEndpoint]);

  React.useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const sendSupport = async (event) => {
    event.preventDefault();
    if (!canSubmitSupportTicket) {
      setError(ticketDisabledMessage);
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/support-tickets`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user.full_name, email: user.email, category: form.category, subject: form.subject, message: form.message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to send support message');
      setForm({ subject: '', message: '', category: defaultCategory });
      setTickets((current) => [data, ...current.filter((ticket) => ticket.id !== data.id)]);
      setTicketDialogOpen(false);
      setMessage('Ticket submitted. Support will get back to you.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const statusStyles = {
    open: { label: 'Open', color: '#0b63ce', bg: '#eaf2ff' },
    in_progress: { label: 'In progress', color: '#e86a00', bg: '#fff2df' },
    closed: { label: 'Resolved', color: '#16805f', bg: '#e5f6ed' },
  };
  const faqs = isTeacherSupport ? [
    { question: 'How do I upload course materials?', answer: 'Open Course Materials, choose the course and module, then add a file, recording, link, or downloadable resource.' },
    { question: 'How do I review a student submission?', answer: 'Open Submissions, use the filters to find the work, open the submitted file, add a comment if needed, then mark it reviewed.' },
    { question: 'How do I create or close an assignment?', answer: 'Open Assignments or Course Materials, create the assignment for the right course/module, then use the assignment actions menu to open or close submissions.' },
    { question: 'How do teacher announcements work?', answer: 'Teachers can post course-specific announcements to students enrolled in their assigned courses.' },
  ] : [
    { question: 'How do I reset my password?', answer: 'Use the sign-in page password reset option, then check your email for the reset link.' },
    { question: 'How do I submit an assignment?', answer: 'Open the course module or Assignments page, choose the assignment, attach your file, and submit before the due date.' },
    { question: 'Where can I download my certificate?', answer: 'Open Certificates from the student sidebar. Issued certificates can be viewed or downloaded there.' },
    { question: "Why can't I access my course materials?", answer: 'Course access depends on admin approval. If your enrollment is pending, wait for admin review before submitting tickets or accessing course tools.' },
  ];
  const ticketIconColors = ['#eaf2ff', '#fff0e9', '#e8f7ef', '#f2eafb'];
  const visibleTickets = tickets.slice(0, 4);
  const scrollToTickets = () => ticketsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <Stack spacing={3}>
      <StudentPageHeader title={supportTitle} subtitle={supportSubtitle} icon={SupportAgentOutlined} />
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1.05fr' }, gap: 3 }}>
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(240,90,40,0.22)', borderRadius: 1.5, p: { xs: 2, md: 2.5 }, minHeight: 190, boxShadow: '0 16px 42px rgba(18,60,105,0.07)', position: 'relative', overflow: 'hidden' }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.05rem' }}>Submit a Ticket</Typography>
              <Typography sx={{ color: '#526273', mt: 1 }}>{isTeacherSupport ? 'Need help with teaching tools or course operations? Send us a message.' : "Can't find what you need? Send us a message."}</Typography>
              <Button variant="contained" color="secondary" startIcon={<SendOutlined />} disabled={!canSubmitSupportTicket} onClick={() => (canSubmitSupportTicket ? setTicketDialogOpen(true) : setError(ticketDisabledMessage))} sx={{ mt: 3, px: 2.5, '&.Mui-disabled': { bgcolor: '#f7b097', color: '#fff', opacity: 0.75 } }}>
                Submit a new ticket
              </Button>
              {!canSubmitSupportTicket && (
                <Typography sx={{ color: '#d3522d', mt: 1.2, fontSize: 13, fontWeight: 750, maxWidth: 360 }}>
                  Available after admin approval.
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>

        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 2, md: 2.5 }, minHeight: 190, boxShadow: '0 16px 42px rgba(18,60,105,0.07)', overflow: 'hidden' }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.05rem' }}>My Support Tickets</Typography>
              <Typography sx={{ color: '#526273', mt: 1 }}>{isTeacherSupport ? 'Track your teaching support requests and platform issues.' : 'View the status and history of your support requests.'}</Typography>
              <Button variant="outlined" startIcon={<ArticleOutlined />} onClick={scrollToTickets} sx={{ mt: 3, px: 2.5 }}>
                View my tickets
              </Button>
            </Box>
            <Box sx={{ width: 142, height: 130, borderRadius: 2, bgcolor: '#eef5ff', display: { xs: 'none', sm: 'grid' }, placeItems: 'center', color: '#6b9af8' }}>
              <ArticleOutlined sx={{ fontSize: 74 }} />
            </Box>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '0.95fr 1.05fr' }, gap: 3 }}>
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 2, md: 2.3 }, boxShadow: '0 16px 42px rgba(18,60,105,0.06)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.08rem' }}>Frequently Asked Questions</Typography>
            <Button variant="text" color="secondary" size="small" onClick={() => setExpandedFaq(faqs[0].question)}>View all FAQs</Button>
          </Stack>
          <Stack spacing={1.1}>
            {faqs.map((faq) => {
              const open = expandedFaq === faq.question;
              return (
                <Box key={faq.question} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.2, overflow: 'hidden', bgcolor: '#fff' }}>
                  <Button fullWidth onClick={() => setExpandedFaq(open ? '' : faq.question)} endIcon={<ExpandMoreOutlined sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: '160ms ease' }} />} sx={{ justifyContent: 'space-between', px: 2, py: 1.35, color: 'primary.dark', fontWeight: 750 }}>
                    {faq.question}
                  </Button>
                  {open && (
                    <Typography sx={{ px: 2, pb: 1.6, color: '#526273', fontSize: 14 }}>
                      {faq.answer}
                    </Typography>
                  )}
                </Box>
              );
            })}
            <Stack direction="row" spacing={1.4} alignItems="center" sx={{ mt: 1.2, p: 2, borderRadius: 1.2, bgcolor: '#f4f7fb' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#fff0e9', color: 'secondary.main', display: 'grid', placeItems: 'center' }}>
                <LightbulbOutlined fontSize="small" />
              </Box>
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 14 }}>Still need help?</Typography>
                <Typography sx={{ color: '#526273', fontSize: 13 }}>Submit a ticket and our team will get back to you.</Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Box ref={ticketsRef} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 2, md: 2.3 }, boxShadow: '0 16px 42px rgba(18,60,105,0.06)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.08rem' }}>My Support Tickets</Typography>
            <Button variant="text" color="secondary" size="small" onClick={loadTickets}>View all tickets</Button>
          </Stack>
          {loadingTickets ? (
            <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
          ) : tickets.length === 0 ? (
            <Box sx={{ border: '1px dashed rgba(18,60,105,0.22)', borderRadius: 1.2, p: 3, textAlign: 'center' }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>No support tickets yet</Typography>
              <Typography sx={{ color: '#526273', fontSize: 14, mt: 0.5 }}>Your submitted tickets will appear here.</Typography>
            </Box>
          ) : (
            <Stack spacing={1.1}>
              {visibleTickets.map((ticket, index) => {
                const status = statusStyles[ticket.status] || statusStyles.open;
                return (
                  <Stack key={ticket.id} direction="row" spacing={1.5} alignItems="center" sx={{ border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1.2, p: 1.4, bgcolor: index % 2 === 0 ? '#fff' : '#f8fbff' }}>
                    <Box sx={{ width: 44, height: 44, flex: '0 0 auto', borderRadius: 1.2, bgcolor: ticketIconColors[index % ticketIconColors.length], color: index % 2 === 0 ? '#0b63ce' : 'secondary.main', display: 'grid', placeItems: 'center' }}>
                      <ArticleOutlined fontSize="small" />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 14 }}>{ticket.subject}</Typography>
                      <Typography noWrap sx={{ color: '#526273', fontSize: 12.5 }}>
                        Ticket #TKT-{String(ticket.id).padStart(4, '0')} &nbsp; • &nbsp; {formatTimestamp(ticket.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                    </Box>
                    <Chip label={status.label} size="small" sx={{ bgcolor: status.bg, color: status.color, fontWeight: 800, minWidth: 88 }} />
                    <IconButton size="small" onClick={() => setSelectedTicket(ticket)} sx={{ color: 'primary.dark' }}><ChevronRightOutlined /></IconButton>
                  </Stack>
                );
              })}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, p: 1.5, borderRadius: 1.2, bgcolor: '#eef5ff', color: 'primary.dark' }}>
                <HelpOutlineOutlined fontSize="small" color="primary" />
                <Typography sx={{ fontSize: 14 }}>Average response time: within 24 hours</Typography>
              </Stack>
            </Stack>
          )}
        </Box>
      </Box>

      <Dialog open={ticketDialogOpen && canSubmitSupportTicket} onClose={() => setTicketDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Submit a new ticket</DialogTitle>
        <DialogContent>
          <Stack component="form" id={ticketFormId} onSubmit={sendSupport} spacing={1.4} sx={{ pt: 1 }}>
            <TextField select label="Topic" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
              {visibleCategoryOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField label="Subject" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} required />
            <TextField label="Message" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} multiline minRows={5} required />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setTicketDialogOpen(false)}>Cancel</Button>
          <Button type="submit" form={ticketFormId} variant="contained" color="secondary" disabled={saving || !canSubmitSupportTicket} startIcon={<SendOutlined />}>
            {saving ? 'Sending...' : 'Submit ticket'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(selectedTicket)} onClose={() => setSelectedTicket(null)} fullWidth maxWidth="sm">
        {selectedTicket && (
          <>
            <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950, pb: 1 }}>
              {selectedTicket.subject}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 0.5 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                  <Chip label={`Ticket #TKT-${String(selectedTicket.id).padStart(4, '0')}`} size="small" sx={{ bgcolor: '#eef3f8', color: 'primary.dark', fontWeight: 750 }} />
                  <Chip label={supportCategoryLabels[selectedTicket.category] || selectedTicket.category} size="small" sx={{ bgcolor: '#fff0e9', color: 'secondary.main', fontWeight: 750 }} />
                  <Chip
                    label={(statusStyles[selectedTicket.status] || statusStyles.open).label}
                    size="small"
                    sx={{
                      bgcolor: (statusStyles[selectedTicket.status] || statusStyles.open).bg,
                      color: (statusStyles[selectedTicket.status] || statusStyles.open).color,
                      fontWeight: 800,
                    }}
                  />
                </Stack>
                <Box sx={{ borderTop: '1px solid rgba(18,60,105,0.1)', pt: 1.5 }}>
                  <Typography sx={{ color: '#526273', fontSize: 13, mb: 0.5 }}>Submitted</Typography>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 750 }}>
                    {formatTimestamp(selectedTicket.created_at, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: '#f7f9fc', border: '1px solid rgba(18,60,105,0.08)', borderRadius: 1.2, p: 2 }}>
                  <Typography sx={{ color: '#526273', fontSize: 13, mb: 0.8 }}>Message</Typography>
                  <Typography sx={{ color: 'primary.dark', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                    {selectedTicket.message}
                  </Typography>
                </Box>
                {selectedTicket.attachment_url && (
                  <Button variant="outlined" href={selectedTicket.attachment_url} target="_blank" rel="noreferrer" startIcon={<DownloadOutlined />} sx={{ alignSelf: 'flex-start' }}>
                    Open attachment
                  </Button>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button variant="contained" color="secondary" onClick={() => setSelectedTicket(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Stack>
  );
}

function StudentProfilePane({ user, onUserUpdated }) {
  const [summary, setSummary] = React.useState(null);
  const [assignments, setAssignments] = React.useState([]);
  const [certificates, setCertificates] = React.useState([]);
  const [courseProgressRows, setCourseProgressRows] = React.useState([]);
  const [profileActivityRows, setProfileActivityRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({ current_password: '', new_password: '', confirm_password: '' });
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = React.useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = React.useState(null);
  const [twoFactorCode, setTwoFactorCode] = React.useState('');
  const [twoFactorDisablePassword, setTwoFactorDisablePassword] = React.useState('');
  const [savingTwoFactor, setSavingTwoFactor] = React.useState(false);
  const [accountActionMessage, setAccountActionMessage] = React.useState('');
  const [accountActionError, setAccountActionError] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const base = apiBaseUrl.replace(/\/$/, '');
        const headers = { Authorization: `Bearer ${getToken()}` };
        const [summaryResponse, assignmentsResponse, certificatesResponse] = await Promise.all([
          fetch(`${base}/student/dashboard-summary`, { headers }),
          fetch(`${base}/student/assignments`, { headers }),
          fetch(`${base}/student/certificates`, { headers }),
        ]);
        const [summaryData, assignmentsData, certificatesData] = await Promise.all([
          summaryResponse.json(),
          assignmentsResponse.json(),
          certificatesResponse.json(),
        ]);
        if (!summaryResponse.ok) throw new Error(summaryData.detail || 'Unable to load profile summary');
        if (!assignmentsResponse.ok) throw new Error(assignmentsData.detail || 'Unable to load assignments');
        if (!certificatesResponse.ok) throw new Error(certificatesData.detail || 'Unable to load certificates');

        const courseContentResults = await Promise.all((summaryData.approved_courses || []).slice(0, 4).map(async (item, index) => {
          const course = item.course || item;
          const fallback = {
            title: course.title,
            image: getCourseImage(course.title),
            progress: 0,
            completedItems: 0,
            totalItems: 0,
            color: ['#16805f', '#1b6ef3', '#7c3aed', '#f05a28'][index % 4],
          };
          if (!course.id) return { progress: fallback, activities: [] };
          try {
            const contentResponse = await fetch(`${base}/student/courses/${course.id}/content`, { headers });
            const contentData = await contentResponse.json();
            if (!contentResponse.ok) return { progress: fallback, activities: [] };
            const moduleMaterials = (contentData.modules || []).flatMap((module) => module.materials || []);
            const moduleAssignments = (contentData.modules || []).flatMap((module) => module.assignments || []);
            const materials = [...moduleMaterials, ...(contentData.unassigned_materials || [])];
            const courseAssignments = [...moduleAssignments, ...(contentData.unassigned_assignments || [])];
            const completedMaterials = materials.filter((material) => material.viewed || material.viewed_at).length;
            const submittedCourseAssignments = courseAssignments.filter((assignment) => assignment.submission).length;
            const totalItems = materials.length + courseAssignments.length;
            const completedItems = completedMaterials + submittedCourseAssignments;
            return {
              progress: {
                ...fallback,
                progress: totalItems ? Math.round((completedItems / totalItems) * 100) : 0,
                completedItems,
                totalItems,
              },
              activities: [
                ...materials
                  .filter((material) => material.viewed_at)
                  .map((material) => ({
                    title: `Viewed ${material.title}`,
                    detail: course.title,
                    timestamp: material.viewed_at,
                    icon: CheckCircleOutlined,
                    color: '#16805f',
                    bg: '#e8f7ef',
                  })),
                ...courseAssignments
                  .filter((assignment) => assignment.submission?.submitted_at)
                  .map((assignment) => ({
                    title: `Submitted ${assignment.title}`,
                    detail: course.title,
                    timestamp: assignment.submission.submitted_at,
                    icon: SendOutlined,
                    color: '#1b6ef3',
                    bg: '#eaf2ff',
                  })),
              ],
            };
          } catch (_err) {
            return { progress: fallback, activities: [] };
          }
        }));
        const courseProgress = courseContentResults.map((result) => result.progress);
        const realActivity = [
          ...courseContentResults.flatMap((result) => result.activities),
          ...certificatesData.map((certificate) => ({
            title: `Certificate issued`,
            detail: certificate.course?.title || certificate.file_name || 'Course certificate',
            timestamp: certificate.created_at,
            icon: VerifiedOutlined,
            color: '#f05a28',
            bg: '#fff0e9',
          })),
        ]
          .filter((item) => item.timestamp)
          .sort((first, second) => second.timestamp - first.timestamp)
          .slice(0, 4)
          .map((item) => ({
            ...item,
            when: formatTimestamp(item.timestamp, { month: 'short', day: 'numeric' }),
          }));
        if (mounted) {
          setSummary(summaryData);
          setAssignments(assignmentsData);
          setCertificates(certificatesData);
          setCourseProgressRows(courseProgress);
          setProfileActivityRows(realActivity);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!accountActionMessage) return undefined;
    const timeoutId = window.setTimeout(() => setAccountActionMessage(''), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [accountActionMessage]);

  React.useEffect(() => {
    if (!accountActionError) return undefined;
    const timeoutId = window.setTimeout(() => setAccountActionError(''), 5500);
    return () => window.clearTimeout(timeoutId);
  }, [accountActionError]);

  const uploadProfilePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadingPhoto(true);
    setAccountActionError('');
    setAccountActionMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/profile-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update profile photo');
      onUserUpdated?.(data);
      setAccountActionMessage('Profile photo updated.');
    } catch (err) {
      setAccountActionError(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setAccountActionError('');
    setAccountActionMessage('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setAccountActionError('New password and confirmation do not match');
      return;
    }
    if (passwordForm.new_password.length < 9) {
      setAccountActionError('New password must be at least 9 characters');
      return;
    }
    setChangingPassword(true);
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to change password');
      setPasswordDialogOpen(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setAccountActionMessage('Password updated successfully.');
    } catch (err) {
      setAccountActionError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const openTwoFactorDialog = async () => {
    setTwoFactorDialogOpen(true);
    setTwoFactorCode('');
    setTwoFactorDisablePassword('');
    setAccountActionError('');
    setAccountActionMessage('');
    if (user.two_factor_enabled) return;
    setSavingTwoFactor(true);
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/2fa/setup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to start two-factor setup');
      setTwoFactorSetup(data);
    } catch (err) {
      setAccountActionError(err.message);
    } finally {
      setSavingTwoFactor(false);
    }
  };

  const enableTwoFactor = async (event) => {
    event.preventDefault();
    setSavingTwoFactor(true);
    setAccountActionError('');
    setAccountActionMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/2fa/enable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: twoFactorCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to enable two-factor authentication');
      onUserUpdated?.(data);
      setTwoFactorDialogOpen(false);
      setTwoFactorCode('');
      setAccountActionMessage('Two-factor authentication enabled.');
    } catch (err) {
      setAccountActionError(err.message);
    } finally {
      setSavingTwoFactor(false);
    }
  };

  const disableTwoFactor = async (event) => {
    event.preventDefault();
    setSavingTwoFactor(true);
    setAccountActionError('');
    setAccountActionMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/2fa/disable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: twoFactorDisablePassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to disable two-factor authentication');
      onUserUpdated?.(data);
      setTwoFactorDialogOpen(false);
      setTwoFactorDisablePassword('');
      setTwoFactorSetup(null);
      setAccountActionMessage('Two-factor authentication disabled.');
    } catch (err) {
      setAccountActionError(err.message);
    } finally {
      setSavingTwoFactor(false);
    }
  };

  const isAlumni = user?.lifecycle_status === 'alumni';
  const learnerLabel = isAlumni ? 'Alumni' : 'Student';
  const firstName = user?.full_name?.split(' ')[0] || learnerLabel;
  const approvedCourses = summary?.approved_courses || [];
  const submittedAssignments = assignments.filter((assignment) => assignment.submission).length;
  const memberSince = user?.created_at ? formatTimestamp(user.created_at, { month: 'short', day: 'numeric', year: 'numeric' }) : (isAlumni ? 'Alumni' : 'Active student');
  const hoursLearned = Math.max(approvedCourses.length * 8 + submittedAssignments * 2 + certificates.length * 6, 0);
  const profileStats = [
    { label: 'Courses Enrolled', value: approvedCourses.length, icon: MenuBookOutlined, color: '#1b6ef3', bg: '#eaf2ff' },
    { label: 'Assignments Submitted', value: submittedAssignments, icon: AssignmentOutlined, color: '#f05a28', bg: '#fff0e9' },
    { label: 'Certificates Earned', value: certificates.length, icon: EmojiEventsOutlined, color: '#e86a00', bg: '#fff2df' },
    { label: 'Hours Learned', value: hoursLearned, icon: AccessTimeOutlined, color: '#1b6ef3', bg: '#eaf2ff' },
  ];
  const progressStats = [
    { label: 'Courses in Progress', value: approvedCourses.length, icon: MenuBookOutlined, color: '#16805f', bg: '#e8f7ef' },
    { label: 'Assignments Submitted', value: submittedAssignments, icon: AssignmentOutlined, color: '#7c3aed', bg: '#f2eaff' },
    { label: 'Certificates Earned', value: certificates.length, icon: EmojiEventsOutlined, color: '#f05a28', bg: '#fff0e9' },
  ];
  const recentActivity = profileActivityRows;
  const courseRows = approvedCourses.slice(0, 4).map((item, index) => ({
    title: item.course.title,
    image: getCourseImage(item.course.title),
    progress: 0,
    color: ['#16805f', '#1b6ef3', '#7c3aed', '#f05a28'][index % 4],
  }));
  const currentCourseRows = courseProgressRows.length ? courseProgressRows : courseRows;
  const infoRows = [
    { label: 'Full Name', value: user.full_name, icon: PersonOutlineOutlined },
    { label: 'Email Address', value: user.email, icon: EmailOutlined },
    { label: 'Phone Number', value: user.phone || 'Not provided', icon: PhoneOutlined },
    { label: 'Role', value: learnerLabel, icon: SchoolOutlined },
    { label: isAlumni ? 'Alumni ID' : 'Student ID', value: learnerDisplayId(user), icon: ArticleOutlined },
    { label: 'Status', value: user.is_active ? 'Active' : 'Pending', icon: ShieldOutlined, chip: true },
    { label: 'Member Since', value: memberSince, icon: CalendarTodayOutlined },
  ];
  const settingsRows = [
    { label: 'Change Password', icon: LockOutlined, action: 'password' },
    { label: 'Profile Photo', icon: PersonOutlineOutlined, action: 'photo' },
    { label: 'Two-Factor Authentication', icon: ShieldOutlined, action: 'two_factor' },
  ];

  return (
    <Stack spacing={3.2}>
      <Box sx={{ position: 'relative', minHeight: { xs: 116, md: 150 }, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <Box sx={{ pr: { xs: 0, md: 30 } }}>
          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.35rem' }, mb: 0.8 }}>
            Hi there, {firstName}!
          </Typography>
          <Typography sx={{ color: '#526273' }}>Manage your profile and track your learning journey.</Typography>
        </Box>
        <Box component="img" src="/images/student_illustration_upscaled.png" alt="" sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', right: 0, bottom: -4, width: 245, height: 142, objectFit: 'contain' }} />
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 6 }}><CircularProgress size={30} /></Stack>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '305px 1fr' }, gap: 2 }}>
          <Stack spacing={2}>
            <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2.2, boxShadow: '0 18px 44px rgba(18,60,105,0.07)' }}>
              <Stack alignItems="center" spacing={1.1}>
                <Box sx={{ position: 'relative' }}>
                  <UserAvatar user={user} size={88} />
                  <IconButton component="label" size="small" disabled={uploadingPhoto} sx={{ position: 'absolute', right: -4, bottom: 4, bgcolor: '#fff', color: 'primary.main', border: '1px solid rgba(18,60,105,0.14)', '&:hover': { bgcolor: '#eef3f8' } }}>
                    <EditOutlined sx={{ fontSize: 15 }} />
                    <Box component="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={uploadProfilePhoto} />
                  </IconButton>
                </Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.2rem' }}>{user.full_name}</Typography>
                <Chip label={learnerLabel} size="small" sx={{ bgcolor: isAlumni ? '#f4ecff' : '#eaf2ff', color: isAlumni ? '#7c3aed' : '#1b6ef3', fontWeight: 750 }} />
                <Typography sx={{ color: '#526273', fontSize: 13, textAlign: 'center' }}>{user.email}</Typography>
                <Typography sx={{ color: '#526273', fontSize: 12 }}><CalendarTodayOutlined sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom' }} />Member since {memberSince}</Typography>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.4, mt: 2.3 }}>
                {profileStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Stack key={stat.label} direction="row" spacing={1} alignItems="center">
                      <Box sx={{ width: 34, height: 34, borderRadius: 1, bgcolor: stat.bg, color: stat.color, display: 'grid', placeItems: 'center' }}><Icon fontSize="small" /></Box>
                      <Box>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>{stat.value}</Typography>
                        <Typography sx={{ color: '#526273', fontSize: 11 }}>{stat.label}</Typography>
                      </Box>
                    </Stack>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, boxShadow: '0 18px 44px rgba(18,60,105,0.06)' }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.2 }}>Account Settings</Typography>
              {accountActionMessage && <Alert severity="success" sx={{ mb: 1.2 }}>{accountActionMessage}</Alert>}
              {accountActionError && <Alert severity="error" sx={{ mb: 1.2 }}>{accountActionError}</Alert>}
              <Stack spacing={0.4}>
                {settingsRows.map((setting) => {
                  const Icon = setting.icon;
                  const isPhotoSetting = setting.action === 'photo';
                  const isPasswordSetting = setting.action === 'password';
                  const isTwoFactorSetting = setting.action === 'two_factor';
                  return (
                    <Stack
                      key={setting.label}
                      component={isPhotoSetting ? 'label' : 'div'}
                      onClick={isPasswordSetting ? () => setPasswordDialogOpen(true) : isTwoFactorSetting ? openTwoFactorDialog : undefined}
                      direction="row"
                      alignItems="center"
                      spacing={1.1}
                      sx={{
                        py: 0.8,
                        cursor: isPhotoSetting || isPasswordSetting || isTwoFactorSetting ? 'pointer' : 'default',
                        borderRadius: 1,
                        px: 0.6,
                        mx: -0.6,
                        '&:hover': isPhotoSetting || isPasswordSetting || isTwoFactorSetting ? { bgcolor: '#f6f9fc' } : undefined,
                      }}
                    >
                      <Icon sx={{ fontSize: 17, color: '#526273' }} />
                      <Typography sx={{ color: '#526273', fontSize: 13, flex: 1 }}>{setting.label}</Typography>
                      <Chip
                        label={isPhotoSetting ? (uploadingPhoto ? 'Uploading...' : 'Upload') : isPasswordSetting ? 'Update' : isTwoFactorSetting ? (user.two_factor_enabled ? 'Enabled' : 'Set up') : 'Coming soon'}
                        size="small"
                        sx={{
                          bgcolor: isTwoFactorSetting && user.two_factor_enabled ? '#e5f6ed' : isPhotoSetting || isPasswordSetting || isTwoFactorSetting ? '#eaf2ff' : '#eef3f8',
                          color: isTwoFactorSetting && user.two_factor_enabled ? '#16805f' : isPhotoSetting || isPasswordSetting || isTwoFactorSetting ? '#1b6ef3' : '#637083',
                          fontSize: 10,
                          height: 20,
                        }}
                      />
                      <ChevronRightOutlined sx={{ color: '#8b98a8', fontSize: 18 }} />
                      {isPhotoSetting && <Box component="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={uploadProfilePhoto} disabled={uploadingPhoto} />}
                    </Stack>
                  );
                })}
              </Stack>
            </Box>

          </Stack>

          <Stack spacing={2}>
            <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, boxShadow: '0 18px 44px rgba(18,60,105,0.06)' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Personal Information</Typography>
            </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, columnGap: 4, rowGap: 0.5 }}>
                {infoRows.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Stack key={item.label} direction="row" spacing={1.4} alignItems="center" sx={{ py: 1.25, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: '#f3f7fb', color: 'primary.dark', display: 'grid', placeItems: 'center' }}><Icon fontSize="small" /></Box>
                      <Typography sx={{ color: '#526273', fontSize: 13, minWidth: 118 }}>{item.label}</Typography>
                      {item.chip ? <Chip label={item.value} size="small" sx={{ bgcolor: item.value === 'Active' ? '#e5f6ed' : '#fff2df', color: item.value === 'Active' ? '#16805f' : '#e86a00', fontWeight: 800 }} /> : <Typography noWrap sx={{ color: 'primary.dark', fontSize: 13, fontWeight: 650 }}>{item.value}</Typography>}
                    </Stack>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, boxShadow: '0 18px 44px rgba(18,60,105,0.06)' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Learning Progress</Typography>
              </Stack>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.4 }}>
                {progressStats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Box key={stat.label} sx={{ bgcolor: stat.bg, borderRadius: 1.4, p: 1.7, minHeight: 116 }}>
                      <Box sx={{ width: 42, height: 42, borderRadius: 1, bgcolor: '#fff', color: stat.color, display: 'grid', placeItems: 'center', mb: 1 }}><Icon /></Box>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.35rem', lineHeight: 1 }}>{stat.value}</Typography>
                      <Typography sx={{ color: '#123c69', fontSize: 12, mt: 0.8 }}>{stat.label}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.05fr 0.95fr' }, gap: 2 }}>
              <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, boxShadow: '0 18px 44px rgba(18,60,105,0.06)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.4 }}>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Recent Activity</Typography>
                </Stack>
                <Stack spacing={1}>
                  {recentActivity.length === 0 ? <Typography sx={{ color: '#526273', fontSize: 14 }}>No activity yet.</Typography> : recentActivity.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Stack key={`${item.title}-${item.when}`} direction="row" spacing={1.3} alignItems="center" sx={{ py: 1, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 1.2, bgcolor: item.bg, color: item.color, display: 'grid', placeItems: 'center' }}><Icon fontSize="small" /></Box>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 13 }}>{item.title}</Typography>
                          <Typography noWrap sx={{ color: '#526273', fontSize: 12 }}>{item.detail}</Typography>
                        </Box>
                        <Typography sx={{ color: '#526273', fontSize: 12 }}>{item.when}</Typography>
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>

              <Stack spacing={2}>
                <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, boxShadow: '0 18px 44px rgba(18,60,105,0.06)' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.4 }}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Current Courses</Typography>
                  </Stack>
                  <Stack spacing={1.1}>
                    {currentCourseRows.length === 0 ? <Typography sx={{ color: '#526273', fontSize: 14 }}>No active courses yet.</Typography> : currentCourseRows.map((course) => (
                      <Stack key={course.title} direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 42, height: 34, borderRadius: 1, bgcolor: '#eef3f8', backgroundImage: course.image ? `url(${course.image})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 12 }}>{course.title}</Typography>
                          <Box sx={{ height: 5, bgcolor: '#edf2f7', borderRadius: 999, mt: 0.7 }}><Box sx={{ height: 1, width: `${course.progress}%`, bgcolor: course.color, borderRadius: 999 }} /></Box>
                        </Box>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 12 }}>{course.progress}%</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>
      )}

      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Change Password</DialogTitle>
        <DialogContent>
          {accountActionError && <Alert severity="error" sx={{ mb: 1.4 }}>{accountActionError}</Alert>}
          <Stack component="form" id="student-change-password-form" onSubmit={changePassword} spacing={1.4} sx={{ pt: 1 }}>
            <TextField
              label="Current password"
              type="password"
              value={passwordForm.current_password}
              onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))}
              required
              autoComplete="current-password"
            />
            <TextField
              label="New password"
              type="password"
              value={passwordForm.new_password}
              onChange={(event) => setPasswordForm((current) => ({ ...current, new_password: event.target.value }))}
              required
              autoComplete="new-password"
              helperText="Use at least 9 characters."
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={passwordForm.confirm_password}
              onChange={(event) => setPasswordForm((current) => ({ ...current, confirm_password: event.target.value }))}
              required
              autoComplete="new-password"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setPasswordDialogOpen(false)} disabled={changingPassword}>Cancel</Button>
          <Button type="submit" form="student-change-password-form" variant="contained" color="secondary" disabled={changingPassword}>
            {changingPassword ? 'Updating...' : 'Update password'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={twoFactorDialogOpen} onClose={() => setTwoFactorDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>
          Two-Factor Authentication
        </DialogTitle>
        <DialogContent>
          {accountActionError && <Alert severity="error" sx={{ mb: 1.4 }}>{accountActionError}</Alert>}
          {user.two_factor_enabled ? (
            <Stack component="form" id="student-disable-2fa-form" onSubmit={disableTwoFactor} spacing={1.5} sx={{ pt: 1 }}>
              <Alert severity="success">Two-factor authentication is currently enabled for this account.</Alert>
              <Typography sx={{ color: '#526273', fontSize: 14 }}>
                To disable it, confirm your current password.
              </Typography>
              <TextField
                label="Current password"
                type="password"
                value={twoFactorDisablePassword}
                onChange={(event) => setTwoFactorDisablePassword(event.target.value)}
                required
                autoComplete="current-password"
              />
            </Stack>
          ) : (
            <Stack component="form" id="student-enable-2fa-form" onSubmit={enableTwoFactor} spacing={1.5} sx={{ pt: 1 }}>
              <Typography sx={{ color: '#526273', fontSize: 14 }}>
                Add this account to Google Authenticator, then enter the 6-digit code to finish setup.
              </Typography>
              {savingTwoFactor && !twoFactorSetup ? (
                <Stack alignItems="center" sx={{ py: 3 }}><CircularProgress size={26} /></Stack>
              ) : twoFactorSetup && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, gap: 2, alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(twoFactorSetup.otpauth_url)}`}
                    alt="Authenticator setup QR code"
                    sx={{ width: 160, height: 160, borderRadius: 1, border: '1px solid rgba(18,60,105,0.12)', bgcolor: '#fff' }}
                  />
                  <Stack spacing={1}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 14 }}>Manual setup key</Typography>
                    <Box sx={{ bgcolor: '#f3f7fb', border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1, p: 1.2, color: 'primary.dark', fontWeight: 850, overflowWrap: 'anywhere', fontSize: 13 }}>
                      {twoFactorSetup.secret}
                    </Box>
                    <Typography sx={{ color: '#637083', fontSize: 12 }}>
                      If the QR code does not load, enter this key manually in Google Authenticator.
                    </Typography>
                  </Stack>
                </Box>
              )}
              <TextField
                label="6-digit authenticator code"
                value={twoFactorCode}
                onChange={(event) => setTwoFactorCode(event.target.value)}
                required
                inputProps={{ inputMode: 'numeric', maxLength: 8 }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setTwoFactorDialogOpen(false)} disabled={savingTwoFactor}>Cancel</Button>
          {user.two_factor_enabled ? (
            <Button type="submit" form="student-disable-2fa-form" variant="contained" color="error" disabled={savingTwoFactor}>
              {savingTwoFactor ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          ) : (
            <Button type="submit" form="student-enable-2fa-form" variant="contained" color="secondary" disabled={savingTwoFactor || !twoFactorSetup}>
              {savingTwoFactor ? 'Saving...' : 'Enable 2FA'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function StudentPlaceholderPane({ item }) {
  const Icon = item.icon || HelpOutlineOutlined;

  return (
    <Box>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
        <Box sx={{ width: 42, height: 42, borderRadius: 1.5, bgcolor: '#eef3f8', color: 'primary.dark', display: 'grid', placeItems: 'center' }}>
          <Icon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '1.85rem', md: '2.35rem' } }}>
            {item.label}
          </Typography>
          <Typography sx={{ color: '#637083' }}>
            This student workspace will connect to live course content in the next LMS phase.
          </Typography>
        </Box>
      </Stack>
      <Box sx={{ mt: 3, border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2.5, bgcolor: '#fff' }}>
        <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 0.8 }}>Coming next</Typography>
        <Typography sx={{ color: '#637083' }}>
          We will add course pages, materials, assignments, announcements, and profile management behind this navigation.
        </Typography>
      </Box>
    </Box>
  );
}

function TeacherDashboardHome({ setActivePane, user, onTeacherToast }) {
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [activityRangeDays, setActivityRangeDays] = React.useState(30);
  const [showAllActivity, setShowAllActivity] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/dashboard-summary`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to load teacher dashboard');
        if (mounted) setSummary(data);
      } catch (err) {
        if (mounted) {
          setError(err.message);
          onTeacherToast?.(err.message, 'error');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const courses = summary?.assigned_courses || [];
  const upcomingAssignments = summary?.upcoming_assignments || [];
  const backendTeacherActivity = summary?.recent_activity || [];
  const recentSubmissions = backendTeacherActivity.filter((item) => !item.type || item.type === 'submission');
  const recentMaterials = summary?.recent_materials || [];
  const recentAnnouncements = summary?.announcements || [];
  const pendingSubmissions = summary?.pending_submissions || 0;
  const lastSevenDelta = (summary?.recent_submissions_count || 0) - (summary?.previous_recent_submissions_count || 0);
  const activityRangeOptions = [7, 15, 30, 60, 90];

  const statCards = [
    { label: 'Assigned Courses', value: courses.length, helper: courses.length ? 'Courses you manage' : 'No courses assigned', color: '#2678f3', icon: MenuBookOutlined },
    { label: 'Enrolled Students', value: summary?.total_students || 0, helper: 'Across your courses', color: '#14a36f', icon: GroupOutlined },
    { label: 'Pending Submissions', value: pendingSubmissions, helper: `${lastSevenDelta >= 0 ? '+' : ''}${lastSevenDelta} from last 7 days`, color: '#f05a28', icon: AssignmentOutlined },
    { label: 'Upcoming Deadlines', value: summary?.upcoming_deadlines || 0, helper: 'View all', color: '#7a4fe8', icon: CalendarTodayOutlined, action: () => setActivePane('assignments') },
  ];

  const dashboardCardSx = {
    border: '1px solid rgba(18,60,105,0.12)',
    borderRadius: 1.5,
    bgcolor: '#fff',
    boxShadow: '0 14px 36px rgba(18,60,105,0.06)',
  };

  const timeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const diff = Math.max(0, Math.floor(Date.now() / 1000) - timestamp);
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const daysUntil = (timestamp) => {
    if (!timestamp) return 'No due date';
    const diffDays = Math.ceil((timestamp * 1000 - Date.now()) / (24 * 60 * 60 * 1000));
    if (diffDays <= 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const activityMeta = {
    submission: { icon: AssignmentOutlined, bg: '#e7f7ef', color: '#16805f', dot: '#16805f', action: 'View submissions', pane: 'submissions' },
    assignment: { icon: AssignmentOutlined, bg: '#fff1ec', color: '#f05a28', dot: '#f05a28', action: 'View assignments', pane: 'assignments' },
    material: { icon: InsertDriveFileOutlined, bg: '#e8f1ff', color: '#2678f3', dot: '#2678f3', action: 'Open materials', pane: 'materials' },
    announcement: { icon: CampaignOutlined, bg: '#fff1ec', color: '#f05a28', dot: '#f05a28', action: 'View announcement', pane: 'announcements' },
  };
  const combinedRecentActivity = (backendTeacherActivity.some((item) => item.type) ? backendTeacherActivity : [
    ...recentSubmissions.map((item) => ({
      id: `submission-${item.submission_id}`,
      type: 'submission',
      title: 'Assignment submitted',
      detail: `${item.student_name} submitted "${item.assignment_title}"`,
      status: item.graded ? 'Reviewed' : 'Pending review',
      course: item.course_title,
      location: 'Submission',
      created_at: item.submitted_at,
    })),
    ...recentMaterials.map((item) => ({
      id: `material-${item.id}`,
      type: 'material',
      title: 'Material uploaded',
      detail: item.title,
      status: materialTypeLabels[item.material_type] || item.material_type || 'Material',
      course: item.course_title,
      location: 'Course material',
      created_at: item.created_at,
    })),
    ...recentAnnouncements.map((item) => ({
      id: `announcement-${item.id}`,
      type: 'announcement',
      title: item.is_urgent ? 'Urgent announcement posted' : 'Announcement posted',
      detail: item.title,
      status: item.is_urgent ? 'Urgent' : 'Visible',
      course: item.course_title,
      location: 'Announcement',
      created_at: item.created_at,
    })),
  ]).sort((first, second) => (second.created_at || 0) - (first.created_at || 0));
  const activityCutoff = Math.floor(Date.now() / 1000) - (activityRangeDays * 24 * 60 * 60);
  const rangedActivity = combinedRecentActivity.filter((item) => !item.created_at || item.created_at >= activityCutoff);
  const displayedActivity = showAllActivity ? rangedActivity : rangedActivity.slice(0, 8);
  const hiddenActivityCount = Math.max(rangedActivity.length - displayedActivity.length, 0);

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', lg: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.45rem' }, mb: 0.8 }}>
            Welcome back, {(user?.full_name || 'Teacher').split(' ')[0]}!
          </Typography>
          <Typography sx={{ color: '#637083' }}>Here's what's happening with your courses today.</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Button variant="contained" color="secondary" startIcon={<AddOutlined />} onClick={() => setActivePane('materials')}>Create New</Button>
        </Stack>
      </Stack>
      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 1.5 }}>
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
              <Box key={card.label} sx={{ ...dashboardCardSx, p: 2.2, minHeight: 132 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 56, height: 56, borderRadius: 1.5, bgcolor: `${card.color}14`, color: card.color, display: 'grid', placeItems: 'center' }}>
                    <Icon />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: '#637083', fontSize: 12.5, fontWeight: 800 }}>{card.label}</Typography>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: '2rem', lineHeight: 1.05 }}>{card.value}</Typography>
                    <Typography onClick={card.action} sx={{ color: card.action ? card.color : '#637083', fontSize: 12.5, fontWeight: card.action ? 800 : 500, cursor: card.action ? 'pointer' : 'default' }}>{card.helper}</Typography>
                  </Box>
                </Stack>
              </Box>
            );})}
          </Box>

          <Box>
            <Box sx={{ ...dashboardCardSx, p: 2.2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.8 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: '1.1rem' }}>Upcoming Assignments</Typography>
                <Button size="small" onClick={() => setActivePane('assignments')}>View all</Button>
              </Stack>
              <Stack spacing={1}>
                {upcomingAssignments.length === 0 ? (
                  <Typography sx={{ color: '#637083', fontSize: 14 }}>No upcoming assignments.</Typography>
                ) : upcomingAssignments.slice(0, 3).map((assignment) => (
                  <Box key={assignment.id} sx={{ display: 'grid', gridTemplateColumns: '54px 1fr auto', alignItems: 'center', gap: 1.4, borderRadius: 1.2, bgcolor: '#f6f8fb', p: 1.1 }}>
                    <Box sx={{ width: 44, height: 44, borderRadius: 1.2, bgcolor: '#fff1ec', color: '#f05a28', display: 'grid', placeItems: 'center', textAlign: 'center', fontWeight: 900, fontSize: 12 }}>
                      {formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric' })}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900 }}>{assignment.title}</Typography>
                      <Typography noWrap sx={{ color: '#637083', fontSize: 13 }}>{assignment.course_title}</Typography>
                    </Box>
                    <Chip label={daysUntil(assignment.due_at)} size="small" sx={{ bgcolor: '#fff1ec', color: '#f05a28', fontWeight: 700 }} />
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>

          <Box sx={{ ...dashboardCardSx, p: { xs: 1.4, md: 2.2 }, overflow: 'hidden' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={1.2} sx={{ mb: 2 }}>
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.12rem' }}>Recent Activity</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13 }}>Submissions, assignments, materials, and announcements from your courses.</Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  select
                  size="small"
                  value={activityRangeDays}
                  onChange={(event) => {
                    setActivityRangeDays(Number(event.target.value));
                    setShowAllActivity(false);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayOutlined sx={{ color: '#526273', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 168, '& .MuiSelect-select': { display: 'flex', alignItems: 'center', py: 1.05 } }}
                >
                  {activityRangeOptions.map((days) => (
                    <MenuItem key={days} value={days}>Last {days} days</MenuItem>
                  ))}
                </TextField>
                <Chip label={`${rangedActivity.length} recent`} size="small" sx={{ bgcolor: '#eef3f8', color: 'primary.dark', fontWeight: 800 }} />
              </Stack>
            </Stack>
            {rangedActivity.length === 0 ? (
              <Typography sx={{ color: '#637083', fontSize: 14 }}>No recent activity yet.</Typography>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: 860 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.35fr) minmax(150px, 0.65fr) minmax(190px, 0.8fr) minmax(150px, 0.7fr) 150px', px: 1.2, pb: 1.1, borderBottom: '1px solid rgba(18,60,105,0.12)' }}>
                    {['Activity', 'Details', 'Course / Location', 'Date & Time', ''].map((heading) => (
                      <Typography key={heading || 'actions'} sx={{ color: '#637083', fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>{heading}</Typography>
                    ))}
                  </Box>
                  {displayedActivity.map((item, index) => {
                    const meta = activityMeta[item.type] || activityMeta.submission;
                    const Icon = meta.icon;
                    return (
                      <Box key={item.id || `${item.type}-${index}`} sx={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.35fr) minmax(150px, 0.65fr) minmax(190px, 0.8fr) minmax(150px, 0.7fr) 150px', gap: 1.2, alignItems: 'center', px: 1.2, py: 1.15, borderBottom: index < displayedActivity.length - 1 ? '1px solid rgba(18,60,105,0.08)' : 'none' }}>
                        <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
                          <Box sx={{ width: 42, height: 42, borderRadius: 1.2, bgcolor: meta.bg, color: meta.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <Icon fontSize="small" />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={0.7} alignItems="center">
                              <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: meta.dot, flexShrink: 0 }} />
                              <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 950, fontSize: 13.5 }}>{item.title}</Typography>
                            </Stack>
                            <Typography noWrap sx={{ color: '#526273', fontSize: 12.5 }}>{item.detail}</Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={0.7} alignItems="center" sx={{ minWidth: 0 }}>
                          {['submission', 'assignment'].includes(item.type) ? <CheckCircleOutlined sx={{ color: ['Reviewed', 'Open'].includes(item.detail_status || item.status) ? '#15965f' : '#f05a28', fontSize: 17 }} /> : item.type === 'announcement' ? <VisibilityOutlined sx={{ color: '#f05a28', fontSize: 17 }} /> : <InsertDriveFileOutlined sx={{ color: meta.color, fontSize: 17 }} />}
                          <Typography noWrap sx={{ color: '#526273', fontSize: 12.5 }}>{item.detail_status || item.status}</Typography>
                        </Stack>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography noWrap sx={{ color: 'primary.dark', fontSize: 12.5 }}>{item.course || 'Platform'}</Typography>
                          <Typography noWrap sx={{ color: '#637083', fontSize: 12 }}>{item.location}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ color: 'primary.dark', fontSize: 12.5 }}>{formatDateTime(item.created_at)}</Typography>
                          <Typography sx={{ color: '#637083', fontSize: 12 }}>{timeAgo(item.created_at)}</Typography>
                        </Box>
                        <Button size="small" variant="text" endIcon={<ChevronRightOutlined />} onClick={() => setActivePane(meta.pane)} sx={{ justifySelf: 'end', whiteSpace: 'nowrap' }}>
                          {item.action_label || meta.action}
                        </Button>
                      </Box>
                    );
                  })}
                </Box>
                {rangedActivity.length > 8 && (
                  <Button
                    size="small"
                    variant="text"
                    startIcon={<AccessTimeOutlined sx={{ fontSize: 18 }} />}
                    endIcon={showAllActivity ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
                    onClick={() => setShowAllActivity((current) => !current)}
                    sx={{ mt: 1.2, color: '#0f63c7', fontWeight: 900 }}
                  >
                    {showAllActivity ? 'Show less activity' : `Show more activity${hiddenActivityCount ? ` (${hiddenActivityCount})` : ''}`}
                  </Button>
                )}
              </Box>
            )}
          </Box>

          <Box sx={{ ...dashboardCardSx, p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto auto' }, gap: 1.5, alignItems: 'center' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 46, height: 46, borderRadius: 1.5, bgcolor: '#e8f1ff', color: '#2678f3', display: 'grid', placeItems: 'center' }}>
                <SupportAgentOutlined />
              </Box>
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Need Help or Have Questions?</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13 }}>Connect with support or visit the teacher community.</Typography>
              </Box>
            </Stack>
            <Button variant="outlined" onClick={() => setActivePane('profile')}>Teacher profile</Button>
            <Button variant="contained" color="secondary" onClick={() => setActivePane('announcements')}>Post Announcement</Button>
          </Box>
        </>
      )}
    </Stack>
  );
}

function TeacherCourseWorkspace({ focus = 'courses', setActivePane, onTeacherToast }) {
  const [courses, setCourses] = React.useState([]);
  const [selectedCourseId, setSelectedCourseId] = React.useState('');
  const [content, setContent] = React.useState(null);
  const [dashboardSummary, setDashboardSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [courseSearch, setCourseSearch] = React.useState('');
  const [courseStatus, setCourseStatus] = React.useState('all');
  const [courseView, setCourseView] = React.useState('list');
  const [materialSearch, setMaterialSearch] = React.useState('');
  const [materialTypeFilter, setMaterialTypeFilter] = React.useState('all');
  const [materialModuleFilter, setMaterialModuleFilter] = React.useState('all');
  const [materialSort, setMaterialSort] = React.useState('newest');
  const [moduleSort, setModuleSort] = React.useState('position');
  const [materialView, setMaterialView] = React.useState('list');
  const [materialTab, setMaterialTab] = React.useState('library');
  const [assignmentSearch, setAssignmentSearch] = React.useState('');
  const [assignmentModuleFilter, setAssignmentModuleFilter] = React.useState('all');
  const [assignmentStatusFilter, setAssignmentStatusFilter] = React.useState('all');
  const [assignmentSort, setAssignmentSort] = React.useState('newest');
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [selectedAssignmentFile, setSelectedAssignmentFile] = React.useState(null);
  const [moduleForm, setModuleForm] = React.useState({ title: '', description: '', position: 1, is_visible: true });
  const [materialForm, setMaterialForm] = React.useState({ title: '', description: '', material_type: 'youtube', module_id: '', external_url: '', file_url: '', is_visible: true, estimated_minutes: 15 });
  const [assignmentForm, setAssignmentForm] = React.useState({ title: '', instructions: '', module_id: '', due_date: '', is_open: true, estimated_minutes: 30 });

  const loadContent = React.useCallback(async (courseId) => {
    if (!courseId) return;
    const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/courses/${courseId}/content`, { headers: { Authorization: `Bearer ${getToken()}` } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Unable to load course workspace');
    setContent(data);
    setModuleForm((current) => ({ ...current, position: (data.modules?.length || 0) + 1 }));
  }, []);

  const loadCourses = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/courses`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load courses');
      setCourses(data);
      fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/dashboard-summary`, { headers: { Authorization: `Bearer ${getToken()}` } })
        .then((summaryResponse) => summaryResponse.ok ? summaryResponse.json() : null)
        .then((summaryData) => { if (summaryData) setDashboardSummary(summaryData); })
        .catch(() => {});
      const nextCourseId = selectedCourseId || (data[0]?.id ? String(data[0].id) : '');
      setSelectedCourseId(nextCourseId);
      if (nextCourseId) await loadContent(nextCourseId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadContent, selectedCourseId]);

  React.useEffect(() => { loadCourses(); }, [loadCourses]);

  const selectedCourse = courses.find((course) => course.id === Number(selectedCourseId));
  const modules = sortModules(content?.modules || [], moduleSort);
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = `${course.title || ''} ${course.description || ''}`.toLowerCase().includes(courseSearch.trim().toLowerCase());
    const matchesStatus = courseStatus === 'all' || course.status === courseStatus;
    return matchesSearch && matchesStatus;
  });
  const upcomingAssignments = dashboardSummary?.upcoming_assignments || [];
  const recentActivity = dashboardSummary?.recent_activity || [];
  const selectedCourseModules = content?.modules?.length ?? selectedCourse?.modules ?? 0;
  const selectedCourseMaterials = content
    ? modules.reduce((total, module) => total + (module.materials?.length || 0), 0) + (content.unassigned_materials?.length || 0)
    : selectedCourse?.materials || 0;
  const selectedCourseAssignments = content
    ? modules.reduce((total, module) => total + (module.assignments?.length || 0), 0) + (content.unassigned_assignments?.length || 0)
    : selectedCourse?.assignments || 0;
  const allMaterials = [
    ...modules.flatMap((module) => (module.materials || []).map((material) => ({ ...material, module_title: module.title }))),
    ...(content?.unassigned_materials || []).map((material) => ({ ...material, module_title: 'Unassigned' })),
  ];
  const allAssignments = [
    ...modules.flatMap((module) => (module.assignments || []).map((assignment) => ({ ...assignment, module_title: module.title }))),
    ...(content?.unassigned_assignments || []).map((assignment) => ({ ...assignment, module_title: 'Unassigned' })),
  ];
  const filteredAssignments = [...allAssignments]
    .filter((assignment) => {
      const overdue = assignment.is_open && assignment.due_at && assignment.due_at * 1000 < Date.now();
      const status = overdue ? 'overdue' : assignment.is_open ? 'open' : 'closed';
      const haystack = `${assignment.title || ''} ${assignment.instructions || ''} ${assignment.module_title || ''}`.toLowerCase();
      const matchesSearch = haystack.includes(assignmentSearch.trim().toLowerCase());
      const matchesModule = assignmentModuleFilter === 'all' || String(assignment.module_id || '') === assignmentModuleFilter;
      const matchesStatus = assignmentStatusFilter === 'all' || assignmentStatusFilter === status;
      return matchesSearch && matchesModule && matchesStatus;
    })
    .sort((a, b) => {
      if (assignmentSort === 'oldest') return (a.created_at || 0) - (b.created_at || 0);
      if (assignmentSort === 'due_soon') return (a.due_at || Number.MAX_SAFE_INTEGER) - (b.due_at || Number.MAX_SAFE_INTEGER);
      return (b.created_at || 0) - (a.created_at || 0);
    });
  const materialTypeCounts = allMaterials.reduce((counts, material) => ({ ...counts, [material.material_type]: (counts[material.material_type] || 0) + 1 }), {});
  const fileMaterialCount = allMaterials.filter((material) => material.file_url).length;
  const videoMaterialCount = allMaterials.filter((material) => material.material_type === 'youtube' || material.material_type === 'video').length;
  const linkMaterialCount = allMaterials.filter((material) => material.external_url && !material.file_url).length;
  const estimatedStorageMb = Math.max(fileMaterialCount * 2.4 + videoMaterialCount * 0.2 + linkMaterialCount * 0.05, 0);
  const filteredMaterials = [...allMaterials]
    .filter((material) => {
      const haystack = `${material.title || ''} ${material.description || ''} ${material.module_title || ''} ${material.material_type || ''}`.toLowerCase();
      const matchesSearch = haystack.includes(materialSearch.trim().toLowerCase());
      const matchesType = materialTypeFilter === 'all' || material.material_type === materialTypeFilter;
      const matchesModule = materialModuleFilter === 'all' || String(material.module_id || '') === materialModuleFilter;
      return matchesSearch && matchesType && matchesModule;
    })
    .sort((a, b) => materialSort === 'oldest' ? (a.created_at || 0) - (b.created_at || 0) : (b.created_at || 0) - (a.created_at || 0));

  const selectCourse = async (courseId) => {
    const value = String(courseId);
    setSelectedCourseId(value);
    await loadContent(value);
  };

  const courseWorkspaceCardSx = {
    border: '1px solid rgba(18,60,105,0.12)',
    borderRadius: 1.5,
    bgcolor: '#fff',
    boxShadow: '0 14px 36px rgba(18,60,105,0.06)',
  };

  const teacherTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const diff = Math.max(0, Math.floor(Date.now() / 1000) - timestamp);
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const teacherDueLabel = (timestamp) => {
    if (!timestamp) return 'No due date';
    const diffDays = Math.ceil((timestamp * 1000 - Date.now()) / (24 * 60 * 60 * 1000));
    if (diffDays <= 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const refreshContent = async () => {
    if (!selectedCourseId) return;
    const data = await (await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/courses/${selectedCourseId}/content`, { headers: { Authorization: `Bearer ${getToken()}` } })).json();
    setContent(data);
  };

  const createModule = async (event) => {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/courses/${selectedCourseId}/modules`, {
        method: 'POST', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...moduleForm, position: Number(moduleForm.position) || 0 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to create module');
      setContent(data);
      setModuleForm({ title: '', description: '', position: (data.modules?.length || 0) + 1, is_visible: true });
      setMessage('Module created.');
      onTeacherToast?.('Module created.', 'success');
    } catch (err) { setError(err.message); onTeacherToast?.(err.message, 'error'); } finally { setSaving(false); }
  };

  const createMaterial = async (event) => {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      let fileUrl = materialForm.file_url || '';
      let title = materialForm.title;
      if (selectedFile) {
        setUploading(true);
        const body = new FormData();
        body.append('file', selectedFile);
        const upload = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/courses/${selectedCourseId}/materials/upload`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body });
        const uploadData = await upload.json();
        if (!upload.ok) throw new Error(uploadData.detail || 'Unable to upload file');
        fileUrl = uploadData.file_url;
        title = title || uploadData.file_name;
      }
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/courses/${selectedCourseId}/materials`, {
        method: 'POST', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...materialForm, title, module_id: materialForm.module_id ? Number(materialForm.module_id) : null, external_url: materialForm.external_url || null, file_url: fileUrl || null, estimated_minutes: Number(materialForm.estimated_minutes) || 15 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to add material');
      setContent(data);
      setMaterialForm({ title: '', description: '', material_type: 'youtube', module_id: materialForm.module_id, external_url: '', file_url: '', is_visible: true, estimated_minutes: 15 });
      setSelectedFile(null);
      setMessage('Material added.');
      onTeacherToast?.('Material added.', 'success');
    } catch (err) { setError(err.message); onTeacherToast?.(err.message, 'error'); } finally { setUploading(false); setSaving(false); }
  };

  const createAssignment = async (event) => {
    event.preventDefault();
    setSaving(true); setError(''); setMessage('');
    try {
      let attachmentUrl = '';
      let attachmentName = '';
      if (selectedAssignmentFile) {
        setUploading(true);
        const body = new FormData();
        body.append('file', selectedAssignmentFile);
        const upload = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/courses/${selectedCourseId}/assignments/upload`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body });
        const uploadData = await upload.json();
        if (!upload.ok) throw new Error(uploadData.detail || 'Unable to upload assignment file');
        attachmentUrl = uploadData.file_url;
        attachmentName = uploadData.file_name;
      }
      const due_at = assignmentForm.due_date ? Math.floor(new Date(`${assignmentForm.due_date}T23:59:00`).getTime() / 1000) : null;
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/courses/${selectedCourseId}/assignments`, {
        method: 'POST', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: assignmentForm.title, instructions: assignmentForm.instructions, module_id: assignmentForm.module_id ? Number(assignmentForm.module_id) : null, attachment_url: attachmentUrl || null, attachment_name: attachmentName || null, due_at, is_open: assignmentForm.is_open, estimated_minutes: Number(assignmentForm.estimated_minutes) || 30 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to create assignment');
      setContent(data);
      setAssignmentForm({ title: '', instructions: '', module_id: assignmentForm.module_id, due_date: '', is_open: true, estimated_minutes: 30 });
      setSelectedAssignmentFile(null);
      setMessage('Assignment created.');
      onTeacherToast?.('Assignment created.', 'success');
    } catch (err) { setError(err.message); onTeacherToast?.(err.message, 'error'); } finally { setUploading(false); setSaving(false); }
  };

  const renderMaterial = (material) => (
    <Box key={material.id} sx={{ bgcolor: '#fff', borderRadius: 1, p: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{material.title}</Typography>
        <Chip label={materialTypeLabels[material.material_type] || material.material_type} size="small" />
      </Stack>
      {(material.external_url || material.file_url) && <Typography component="a" href={material.external_url || material.file_url} target="_blank" rel="noreferrer" sx={{ color: '#123c69', fontSize: 13, overflowWrap: 'anywhere' }}>{material.external_url || material.file_url}</Typography>}
    </Box>
  );

  const renderAssignment = (assignment) => (
    <Box key={assignment.id} sx={{ bgcolor: '#fff', borderRadius: 1, p: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{assignment.title}</Typography>
        <Chip label={assignment.is_open ? 'Open' : 'Closed'} size="small" color={assignment.is_open ? 'success' : 'default'} />
      </Stack>
      <Typography sx={{ color: '#637083', fontSize: 13 }}>Due: {formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
      {assignment.attachment_url && (
        <Typography component="a" href={assignment.attachment_url} target="_blank" rel="noreferrer" sx={{ color: '#123c69', fontSize: 13, fontWeight: 800 }}>
          {assignment.attachment_name || 'Assignment attachment'}
        </Typography>
      )}
    </Box>
  );

  if (focus === 'courses') {
    return (
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ md: 'center' }}>
          <Box>
            <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.45rem' }, mb: 0.4 }}>My Courses</Typography>
            <Typography sx={{ color: '#637083' }}>Manage content and submission-only assignments for courses assigned to you.</Typography>
          </Box>
          <Button variant="contained" color="secondary" startIcon={<AddOutlined />} onClick={() => setActivePane?.('materials')}>New Content</Button>
        </Stack>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
        ) : courses.length === 0 ? (
          <Box sx={{ ...courseWorkspaceCardSx, p: 2.5 }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>No assigned courses yet.</Typography></Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 360px' }, gap: 2 }}>
            <Stack spacing={2}>
              <Box sx={{ ...courseWorkspaceCardSx, p: 1.4 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ md: 'center' }}>
                  <TextField
                    placeholder="Search courses..."
                    value={courseSearch}
                    onChange={(event) => setCourseSearch(event.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }}
                    sx={{ flex: 1 }}
                  />
                  <TextField select label="Status" value={courseStatus} onChange={(event) => setCourseStatus(event.target.value)} sx={{ minWidth: { md: 190 } }}>
                    <MenuItem value="all">All statuses</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="archived">Archived</MenuItem>
                  </TextField>
                  <Stack direction="row" spacing={0.8}>
                    <IconButton onClick={() => setCourseView('grid')} sx={{ border: '1px solid rgba(18,60,105,0.12)', bgcolor: courseView === 'grid' ? '#eef3f8' : '#fff', borderRadius: 1 }}><ViewModuleOutlined /></IconButton>
                    <IconButton onClick={() => setCourseView('list')} sx={{ border: '1px solid rgba(18,60,105,0.12)', bgcolor: courseView === 'list' ? '#eef3f8' : '#fff', borderRadius: 1 }}><MenuBookOutlined /></IconButton>
                  </Stack>
                </Stack>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: courseView === 'grid' ? 'repeat(2, minmax(0, 1fr))' : '1fr' }, gap: 1.6 }}>
                {filteredCourses.length === 0 ? (
                  <Box sx={{ ...courseWorkspaceCardSx, p: 2 }}><Typography sx={{ color: '#637083' }}>No courses match your filters.</Typography></Box>
                ) : filteredCourses.map((course) => {
                  const active = course.id === Number(selectedCourseId);
                  const image = getCourseImage(course.title) || '/images/course1.jpg';
                  const progress = course.progress || 0;
                  return (
                    <Box key={course.id} onClick={() => selectCourse(course.id)} sx={{ ...courseWorkspaceCardSx, p: 1.8, cursor: 'pointer', borderColor: active ? '#2678f3' : 'rgba(18,60,105,0.12)', boxShadow: active ? '0 18px 44px rgba(38,120,243,0.12)' : '0 14px 36px rgba(18,60,105,0.06)' }}>
                      <Stack direction={{ xs: 'column', sm: courseView === 'grid' ? 'column' : 'row' }} spacing={1.8}>
                        <Box component="img" src={image} alt="" sx={{ width: { xs: '100%', sm: courseView === 'grid' ? '100%' : 150 }, height: courseView === 'grid' ? 150 : 132, objectFit: 'cover', borderRadius: 1.2, bgcolor: '#e8f1ff' }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="flex-start">
                            <Box sx={{ minWidth: 0 }}>
                              <Chip label={course.status || 'inactive'} size="small" sx={{ mb: 0.8, textTransform: 'capitalize', bgcolor: course.status === 'active' ? '#e7f7ef' : '#eef3f8', color: course.status === 'active' ? '#16805f' : '#526273', fontWeight: 800 }} />
                              <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.12rem' }}>{course.title}</Typography>
                            </Box>
                          </Stack>
                          <Typography sx={{ color: '#526273', fontSize: 13.2, lineHeight: 1.55, mt: 0.5 }}>{previewText(course.description || 'No course description yet.', 132)}</Typography>
                          <Box sx={{ border: '1px solid rgba(18,60,105,0.10)', borderRadius: 1.2, p: 1.1, mt: 1.4 }}>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1 }}>
                              {[
                                ['Students', course.enrolled_students || 0, GroupOutlined],
                                ['Modules', course.modules || 0, ViewModuleOutlined],
                                ['Materials', course.materials || 0, FolderCopyOutlined],
                                ['Assignments', course.assignments || 0, AssignmentOutlined],
                              ].map(([label, value, Icon]) => (
                                <Stack key={label} direction="row" spacing={0.7} alignItems="center" sx={{ minWidth: 0 }}>
                                  <Icon sx={{ fontSize: 18, color: '#526273' }} />
                                  <Box sx={{ minWidth: 0 }}><Typography sx={{ color: 'primary.dark', fontSize: 12, fontWeight: 900 }}>{value}</Typography><Typography noWrap sx={{ color: '#637083', fontSize: 10.5 }}>{label}</Typography></Box>
                                </Stack>
                              ))}
                            </Box>
                          </Box>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.4 }}>
                            <Box sx={{ flex: 1, height: 7, borderRadius: 99, bgcolor: '#e8edf3', overflow: 'hidden' }}><Box sx={{ width: '100%', height: '100%', bgcolor: '#2678f3' }} /></Box>
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
              <Typography align="center" sx={{ color: '#637083', fontSize: 13 }}>Showing {filteredCourses.length} of {courses.length} courses</Typography>
            </Stack>

            <Stack spacing={1.8}>
              <Box sx={{ ...courseWorkspaceCardSx, p: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1.5 }}>Course Actions</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.9 }}>
                  {[
                    ['Manage Modules', ViewModuleOutlined, 'materials'],
                    ['Upload Material', FolderCopyOutlined, 'materials'],
                    ['Create Assignment', AssignmentOutlined, 'assignments'],
                    ['View Submissions', VisibilityOutlined, 'submissions'],
                    ['Post Update', CampaignOutlined, 'announcements'],
                  ].map(([label, Icon, pane]) => (
                    <Button
                      key={label}
                      variant="outlined"
                      startIcon={<Icon />}
                      onClick={() => setActivePane?.(pane)}
                      sx={{
                        justifyContent: 'flex-start',
                        minHeight: 46,
                        px: 1.3,
                        '& .MuiButton-startIcon': { width: 24, mr: 1.1, justifyContent: 'center' },
                      }}
                    >
                      <Box component="span" sx={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {label}
                      </Box>
                    </Button>
                  ))}
                </Box>
              </Box>
              <Box sx={{ ...courseWorkspaceCardSx, p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.3 }}>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Selected Course</Typography>
                  {selectedCourse && <Chip label={selectedCourse.status || 'inactive'} size="small" sx={{ textTransform: 'capitalize', bgcolor: selectedCourse.status === 'active' ? '#e7f7ef' : '#eef3f8', color: selectedCourse.status === 'active' ? '#16805f' : '#526273', fontWeight: 800 }} />}
                </Stack>
                {selectedCourse ? (
                  <Stack spacing={1.1}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.05rem' }}>{selectedCourse.title}</Typography>
                    <Typography sx={{ color: '#637083', fontSize: 13 }}>{previewText(selectedCourse.description || 'No description yet.', 160)}</Typography>
                    {[
                      ['Students', selectedCourse.enrolled_students || 0, GroupOutlined],
                      ['Modules', selectedCourseModules, ViewModuleOutlined],
                      ['Materials', selectedCourseMaterials, FolderCopyOutlined],
                      ['Assignments', selectedCourseAssignments, AssignmentOutlined],
                    ].map(([label, value, Icon]) => (
                      <Stack key={label} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.8, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
                        <Stack direction="row" spacing={1} alignItems="center"><Icon sx={{ color: '#526273', fontSize: 18 }} /><Typography sx={{ color: '#526273', fontSize: 13 }}>{label}</Typography></Stack>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{value}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                ) : <Typography sx={{ color: '#637083', fontSize: 14 }}>Select a course to see details.</Typography>}
              </Box>
              <Box sx={{ ...courseWorkspaceCardSx, p: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.2 }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Upcoming Deadlines</Typography><Button size="small" onClick={() => setActivePane?.('assignments')}>View all</Button></Stack>
                <Stack spacing={1}>
                  {upcomingAssignments.length === 0 ? <Typography sx={{ color: '#637083', fontSize: 13 }}>No upcoming deadlines.</Typography> : upcomingAssignments.slice(0, 3).map((assignment) => (
                    <Stack key={assignment.id} direction="row" spacing={1.1} alignItems="center" sx={{ p: 1, borderRadius: 1, bgcolor: '#f6f8fb' }}>
                      <Box sx={{ width: 42, height: 42, borderRadius: 1, bgcolor: '#fff1ec', color: '#f05a28', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 900 }}>{formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric' })}</Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}><Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13.2 }}>{assignment.title}</Typography><Typography noWrap sx={{ color: '#637083', fontSize: 12 }}>{assignment.course_title}</Typography></Box>
                      <Typography sx={{ color: '#f05a28', fontSize: 11.5, fontWeight: 800 }}>{teacherDueLabel(assignment.due_at)}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>
        )}
      </Stack>
    );
  }

  if (focus === 'materials') {
    const courseImage = selectedCourse ? (getCourseImage(selectedCourse.title) || '/images/course1.jpg') : '/images/course1.jpg';
    const materialRows = materialTab === 'module'
      ? modules.flatMap((module) => (module.materials || []).map((material) => ({ ...material, module_title: module.title })))
      : filteredMaterials;
    const renderMaterialIcon = (material) => {
      const url = material.external_url || material.file_url || '';
      const type = material.material_type;
      if (type === 'pdf' || /\.pdf(\?|#|$)/i.test(url)) return <PdfFileTile size={30} />;
      if (type === 'youtube' || type === 'video') return <OndemandVideoOutlined sx={{ color: '#2678f3' }} />;
      if (type === 'powerpoint') return <SlideshowOutlined sx={{ color: '#f97316' }} />;
      if (type === 'external_link') return <LinkOutlined sx={{ color: '#16805f' }} />;
      return <InsertDriveFileOutlined sx={{ color: '#7a4fe8' }} />;
    };

    return (
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ md: 'center' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 56, height: 56, borderRadius: 1.5, bgcolor: '#fff1ec', color: '#f05a28', display: 'grid', placeItems: 'center' }}>
              <FolderCopyOutlined />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.45rem' }, mb: 0.4 }}>Course Materials</Typography>
              <Typography sx={{ color: '#637083' }}>Upload recordings, PDFs, slides, links, and downloadable resources for your assigned courses.</Typography>
            </Box>
          </Stack>
          <Button variant="outlined" onClick={refreshContent} disabled={!selectedCourseId}>Refresh content</Button>
        </Stack>
        <Box sx={{ ...courseWorkspaceCardSx, p: 2 }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ lg: 'center' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.7} alignItems={{ sm: 'center' }} sx={{ minWidth: 0 }}>
              <Box component="img" src={courseImage} alt="" sx={{ width: { xs: '100%', sm: 120 }, height: 96, objectFit: 'cover', borderRadius: 1.3, bgcolor: '#e8f1ff', flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.35rem' }}>{selectedCourse?.title || 'Select a course'}</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13.5, maxWidth: 640 }}>{selectedCourse?.description || 'Choose a course to manage its materials.'}</Typography>
                <Stack direction="row" spacing={2.2} sx={{ mt: 1.5, flexWrap: 'wrap' }}>
                  {[['Modules', modules.length, ViewModuleOutlined], ['Materials', allMaterials.length, FolderCopyOutlined], ['Assignments', allAssignments.length, AssignmentOutlined], ['Students', selectedCourse?.enrolled_students || 0, GroupOutlined]].map(([label, value, Icon]) => (
                    <Stack key={label} direction="row" spacing={0.7} alignItems="center"><Icon sx={{ color: '#2678f3', fontSize: 18 }} /><Typography sx={{ color: 'primary.dark', fontSize: 12.5, fontWeight: 900 }}>{value}</Typography><Typography sx={{ color: '#637083', fontSize: 12 }}>{label}</Typography></Stack>
                  ))}
                </Stack>
              </Box>
            </Stack>
            <TextField select label="Course" value={selectedCourseId} onChange={(event) => selectCourse(event.target.value)} disabled={loading || courses.length === 0} sx={{ minWidth: { md: 340 } }}>
              {courses.map((course) => <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>)}
            </TextField>
          </Stack>
        </Box>
        {loading ? <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack> : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 340px' }, columnGap: { xs: 2, xl: 3 }, rowGap: 2, alignItems: 'start' }}>
            <Stack spacing={2} sx={{ minWidth: 0 }}>
              <Box sx={{ ...courseWorkspaceCardSx, px: 2, pt: 1.5, pb: 0 }}>
                <Stack direction="row" spacing={2.4} sx={{ overflowX: 'auto' }}>
                  {[
                    ['library', 'Materials Library', FolderCopyOutlined],
                    ['module', 'By Module', ViewModuleOutlined],
                    ['analytics', 'File Analytics', ArticleOutlined],
                    ['bin', 'Recycle Bin', FilterAltOffOutlined],
                  ].map(([key, label, Icon]) => (
                    <Button key={key} startIcon={<Icon />} onClick={() => setMaterialTab(key)} sx={{ color: materialTab === key ? '#f05a28' : 'primary.dark', borderBottom: materialTab === key ? '2px solid #f05a28' : '2px solid transparent', borderRadius: 0, pb: 1.2, whiteSpace: 'nowrap' }}>{label}</Button>
                  ))}
                </Stack>
              </Box>

              <Box sx={{ ...courseWorkspaceCardSx, p: 1.4 }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.2} alignItems={{ lg: 'center' }} sx={{ flexWrap: { lg: 'wrap', xl: 'nowrap' } }}>
                  <TextField placeholder="Search materials..." value={materialSearch} onChange={(event) => setMaterialSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }} sx={{ flex: '1 1 260px', minWidth: 220 }} />
                  <TextField select label="Type" value={materialTypeFilter} onChange={(event) => setMaterialTypeFilter(event.target.value)} sx={{ minWidth: { lg: 170 } }}><MenuItem value="all">All Types</MenuItem>{materialTypeOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField>
                  <TextField select label="Module" value={materialModuleFilter} onChange={(event) => setMaterialModuleFilter(event.target.value)} sx={{ minWidth: { lg: 190 } }}><MenuItem value="all">All Modules</MenuItem>{modules.map((module) => <MenuItem key={module.id} value={String(module.id)}>{module.title}</MenuItem>)}</TextField>
                  <TextField select label="Module Sort" value={moduleSort} onChange={(event) => setModuleSort(event.target.value)} sx={{ minWidth: { lg: 170 } }}><MenuItem value="position">Module Order</MenuItem><MenuItem value="newest">Newest First</MenuItem><MenuItem value="oldest">Oldest First</MenuItem><MenuItem value="title_az">Title A-Z</MenuItem><MenuItem value="title_za">Title Z-A</MenuItem></TextField>
                  <TextField select label="Sort" value={materialSort} onChange={(event) => setMaterialSort(event.target.value)} sx={{ minWidth: { lg: 160 } }}><MenuItem value="newest">Newest First</MenuItem><MenuItem value="oldest">Oldest First</MenuItem></TextField>
                </Stack>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '300px minmax(0, 1fr)' }, gap: 2, minWidth: 0 }}>
                <Box component="form" onSubmit={createMaterial} sx={{ ...courseWorkspaceCardSx, p: 2 }}>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1.2 }}>Add New Material</Typography>
                  <Stack spacing={1.1}>
                    <TextField size="small" label="Title" value={materialForm.title} onChange={(event) => setMaterialForm((current) => ({ ...current, title: event.target.value }))} placeholder="Optional if attaching a file" />
                    <TextField select size="small" label="Type" value={materialForm.material_type} onChange={(event) => setMaterialForm((current) => ({ ...current, material_type: event.target.value }))}>{materialTypeOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField>
                    <TextField select size="small" label="Module" value={materialForm.module_id} onChange={(event) => setMaterialForm((current) => ({ ...current, module_id: event.target.value }))}><MenuItem value="">Select module</MenuItem>{modules.map((module) => <MenuItem key={module.id} value={String(module.id)}>{module.title}</MenuItem>)}</TextField>
                    <TextField size="small" label="External link" value={materialForm.external_url} onChange={(event) => setMaterialForm((current) => ({ ...current, external_url: event.target.value }))} placeholder="https://example.com/resource" />
                    <TextField size="small" label="Description" value={materialForm.description} onChange={(event) => setMaterialForm((current) => ({ ...current, description: event.target.value }))} multiline minRows={2} />
                    <TextField size="small" type="number" label="Estimated minutes" value={materialForm.estimated_minutes} onChange={(event) => setMaterialForm((current) => ({ ...current, estimated_minutes: event.target.value }))} inputProps={{ min: 1 }} />
                    <Button variant="outlined" component="label" disabled={saving} sx={{ minHeight: 86, borderStyle: 'dashed', display: 'flex', flexDirection: 'column', gap: 0.6, whiteSpace: 'normal', textAlign: 'center', lineHeight: 1.35 }}>{selectedFile ? selectedFile.name : 'Choose file'}<input type="file" hidden accept={lmsFileAccept} onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} /></Button>
                    <Button type="submit" variant="contained" color="secondary" disabled={saving || uploading || !selectedCourseId}>{uploading ? 'Uploading...' : 'Add material'}</Button>
                  </Stack>
                </Box>
                <Box sx={{ ...courseWorkspaceCardSx, p: 2, minWidth: 0, overflow: 'hidden' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.4 }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Materials Library</Typography><Typography sx={{ color: '#637083', fontSize: 12 }}>Showing {materialRows.length} of {allMaterials.length}</Typography></Stack>
                  {materialTab === 'analytics' ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 1.2 }}>
                      {Object.entries(materialTypeCounts).length === 0 ? <Typography sx={{ color: '#637083' }}>No file analytics yet.</Typography> : Object.entries(materialTypeCounts).map(([type, count]) => <Box key={type} sx={{ p: 1.5, borderRadius: 1.2, bgcolor: '#f8fafc', border: '1px solid rgba(18,60,105,0.08)' }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{count}</Typography><Typography sx={{ color: '#637083', fontSize: 12.5 }}>{materialTypeLabels[type] || type}</Typography></Box>)}
                    </Box>
                  ) : materialTab === 'bin' ? (
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 1.2 }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Recycle Bin</Typography><Typography sx={{ color: '#637083', fontSize: 13 }}>Deleted materials will appear here once material deletion is enabled.</Typography></Box>
                  ) : materialRows.length === 0 ? (
                    <Typography sx={{ color: '#637083' }}>No materials match this view.</Typography>
                  ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.1 }}>
                      {materialRows.map((material, index) => {
                        const url = material.external_url || material.file_url;
                        return (
                          <Box key={`${material.module_title}-${material.id}`} sx={{ border: '1px solid rgba(18,60,105,0.10)', borderRadius: 1.2, p: 1.2, bgcolor: index % 2 === 0 ? '#fff' : '#f8fafc', minWidth: 0, overflow: 'hidden' }}>
                            <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                              <Box sx={{ width: 44, height: 44, borderRadius: 1.1, bgcolor: '#eef3f8', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{renderMaterialIcon(material)}</Box>
                              <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}><Typography noWrap title={material.title} sx={{ color: 'primary.dark', fontWeight: 900 }}>{material.title}</Typography><Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap', minWidth: 0 }}><Typography sx={{ color: '#637083', fontSize: 12 }}>{materialTypeLabels[material.material_type] || material.material_type}</Typography><Typography sx={{ color: '#637083', fontSize: 12 }}>-</Typography><Chip label={material.module_title} size="small" sx={{ bgcolor: '#e8f1ff', color: '#2678f3', fontWeight: 700, maxWidth: 180, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }} /><Typography sx={{ color: '#637083', fontSize: 12 }}>{material.estimated_minutes || 15} min</Typography></Stack></Box>
                              <Stack direction="row" spacing={0.35} sx={{ flexShrink: 0, ml: 0.5 }}>{url && <IconButton component="a" href={url} target="_blank" rel="noreferrer" size="small"><VisibilityOutlined fontSize="small" /></IconButton>}{url && <IconButton component="a" href={url} target="_blank" rel="noreferrer" size="small"><DownloadOutlined fontSize="small" /></IconButton>}<IconButton size="small"><MoreHorizOutlined fontSize="small" /></IconButton></Stack>
                            </Stack>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              </Box>
            </Stack>
            <Stack spacing={1.5} sx={{ minWidth: 0 }}>
              <Box sx={{ ...courseWorkspaceCardSx, p: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1.2 }}>Material Stats</Typography>
                {[['Total Materials', allMaterials.length, FolderCopyOutlined], ['Files', fileMaterialCount, InsertDriveFileOutlined], ['Videos', videoMaterialCount, OndemandVideoOutlined], ['Links', linkMaterialCount, LinkOutlined], ['Estimated Size', `${estimatedStorageMb.toFixed(1)} MB`, ArticleOutlined]].map(([label, value, Icon]) => <Stack key={label} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.9, borderBottom: '1px solid rgba(18,60,105,0.08)' }}><Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 28, height: 28, borderRadius: 0.8, bgcolor: '#eef3f8', display: 'grid', placeItems: 'center' }}><Icon sx={{ color: '#2678f3', fontSize: 17 }} /></Box><Typography sx={{ color: '#526273', fontSize: 12.5 }}>{label}</Typography></Stack><Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{value}</Typography></Stack>)}
              </Box>
              <Box sx={{ ...courseWorkspaceCardSx, p: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Storage Usage</Typography>
                <Stack direction="row" justifyContent="space-between"><Typography sx={{ color: 'primary.dark', fontSize: 13, fontWeight: 800 }}>{estimatedStorageMb.toFixed(1)} MB</Typography><Typography sx={{ color: 'primary.dark', fontSize: 13, fontWeight: 800 }}>{Math.min(100, (estimatedStorageMb / 2048) * 100).toFixed(1)}%</Typography></Stack>
                <Box sx={{ mt: 1, height: 8, borderRadius: 99, bgcolor: '#e8edf3', overflow: 'hidden' }}><Box sx={{ width: `${Math.min(100, (estimatedStorageMb / 2048) * 100)}%`, height: '100%', bgcolor: '#2678f3' }} /></Box>
                <Typography sx={{ color: '#637083', fontSize: 12, mt: 1 }}>Estimated from visible uploaded files and links.</Typography>
              </Box>
              <Box sx={{ ...courseWorkspaceCardSx, p: 2 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Recent Activity</Typography><Button size="small" onClick={refreshContent}>View all</Button></Stack>
                <Stack spacing={1}>{allMaterials.slice(0, 4).map((material) => <Stack key={material.id} direction="row" spacing={1} alignItems="center"><Box sx={{ width: 30, height: 30, borderRadius: 0.8, bgcolor: '#fff1ec', color: '#f05a28', display: 'grid', placeItems: 'center' }}><FolderCopyOutlined sx={{ fontSize: 17 }} /></Box><Box sx={{ minWidth: 0 }}><Typography noWrap sx={{ color: 'primary.dark', fontSize: 12.5, fontWeight: 800 }}>{material.title}</Typography><Typography sx={{ color: '#637083', fontSize: 11.5 }}>{material.created_at ? teacherTimeAgo(material.created_at) : 'Recently'}</Typography></Box></Stack>)}</Stack>
              </Box>
              <Box component="form" onSubmit={createModule} sx={{ ...courseWorkspaceCardSx, p: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Quick Module</Typography>
                <Stack spacing={1}><TextField size="small" label="Title" value={moduleForm.title} onChange={(event) => setModuleForm((current) => ({ ...current, title: event.target.value }))} required /><TextField size="small" type="number" label="Week order" value={moduleForm.position} onChange={(event) => setModuleForm((current) => ({ ...current, position: event.target.value }))} /><Button type="submit" variant="outlined" disabled={saving || !selectedCourseId}>Create module</Button></Stack>
              </Box>
            </Stack>
          </Box>
        )}
      </Stack>
    );
  }

  if (focus === 'assignments') {
    const openAssignments = allAssignments.filter((assignment) => assignment.is_open);
    const closedAssignments = allAssignments.filter((assignment) => !assignment.is_open);
    const overdueAssignments = allAssignments.filter((assignment) => assignment.is_open && assignment.due_at && assignment.due_at * 1000 < Date.now());
    const totalSubmitted = allAssignments.reduce((sum, assignment) => sum + (assignment.submitted_count || 0), 0);
    const courseImage = selectedCourse ? (getCourseImage(selectedCourse.title) || '/images/course1.jpg') : '/images/course1.jpg';
    const assignmentDueLabel = (assignment) => {
      if (!assignment.due_at) return 'No due date';
      const diffDays = Math.ceil((assignment.due_at * 1000 - Date.now()) / (24 * 60 * 60 * 1000));
      if (diffDays < 0) return 'Overdue';
      if (diffDays === 0) return 'Due today';
      if (diffDays === 1) return 'Due tomorrow';
      return `Due in ${diffDays} days`;
    };
    const assignmentStatus = (assignment) => {
      if (assignment.is_open && assignment.due_at && assignment.due_at * 1000 < Date.now()) return 'overdue';
      return assignment.is_open ? 'open' : 'closed';
    };
    const statusChip = (assignment) => {
      const status = assignmentStatus(assignment);
      if (status === 'overdue') return { label: 'Overdue', bg: '#fee2e2', color: '#dc2626' };
      if (status === 'open') return { label: assignmentDueLabel(assignment), bg: '#fff1ec', color: '#f05a28' };
      return { label: 'Closed', bg: '#eef3f8', color: '#526273' };
    };

    return (
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ md: 'center' }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 56, height: 56, borderRadius: 1.5, bgcolor: '#fff1ec', color: '#f05a28', display: 'grid', placeItems: 'center' }}>
              <AssignmentOutlined />
            </Box>
            <Box>
              <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.45rem' }, mb: 0.4 }}>Assignments</Typography>
              <Typography sx={{ color: '#637083' }}>Create submission-only assignments and track what students need to complete.</Typography>
            </Box>
          </Stack>
          <Button variant="contained" color="secondary" startIcon={<AddOutlined />} onClick={() => document.getElementById('teacher-create-assignment-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Create Assignment</Button>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) repeat(4, minmax(120px, 170px))' }, gap: 1.4, alignItems: 'stretch' }}>
          <Box sx={{ ...courseWorkspaceCardSx, p: 1.6 }}>
            <Stack direction="row" spacing={1.4} alignItems="center">
              <Box component="img" src={courseImage} alt="" sx={{ width: 72, height: 60, objectFit: 'cover', borderRadius: 1.1, bgcolor: '#e8f1ff', flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 950 }}>{selectedCourse?.title || 'Select a course'}</Typography>
                <Button size="small" sx={{ px: 0 }} onClick={() => setActivePane?.('my-courses')}>Change course</Button>
              </Box>
              <TextField select size="small" value={selectedCourseId} onChange={(event) => selectCourse(event.target.value)} disabled={loading || courses.length === 0} sx={{ minWidth: 44, '& .MuiSelect-select': { pr: '24px !important' } }}>
                {courses.map((course) => <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>)}
              </TextField>
            </Stack>
          </Box>
          {[['Total', allAssignments.length, '#2678f3'], ['Open', openAssignments.length, '#16805f'], ['Closed', closedAssignments.length, '#667085'], ['Overdue', overdueAssignments.length, '#ef4444']].map(([label, value, color]) => (
            <Box key={label} sx={{ ...courseWorkspaceCardSx, p: 1.7, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
              <Typography sx={{ color, fontWeight: 950, fontSize: '1.8rem', lineHeight: 1 }}>{value}</Typography>
              <Typography sx={{ color: '#637083', fontSize: 13 }}>{label}</Typography>
            </Box>
          ))}
        </Box>
        {loading ? <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack> : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 340px' }, gap: 2, alignItems: 'start' }}>
            <Stack spacing={2} sx={{ minWidth: 0 }}>
              <Box sx={{ ...courseWorkspaceCardSx, p: 1.4 }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.2}>
                  <TextField placeholder="Search assignments..." value={assignmentSearch} onChange={(event) => setAssignmentSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }} sx={{ flex: '1 1 260px', minWidth: 220 }} />
                  <TextField select label="Module" value={assignmentModuleFilter} onChange={(event) => setAssignmentModuleFilter(event.target.value)} sx={{ minWidth: { lg: 190 } }}><MenuItem value="all">All Modules</MenuItem>{modules.map((module) => <MenuItem key={module.id} value={String(module.id)}>{module.title}</MenuItem>)}</TextField>
                  <TextField select label="Status" value={assignmentStatusFilter} onChange={(event) => setAssignmentStatusFilter(event.target.value)} sx={{ minWidth: { lg: 170 } }}><MenuItem value="all">All Status</MenuItem><MenuItem value="open">Open</MenuItem><MenuItem value="closed">Closed</MenuItem><MenuItem value="overdue">Overdue</MenuItem></TextField>
                  <TextField select label="Sort" value={assignmentSort} onChange={(event) => setAssignmentSort(event.target.value)} sx={{ minWidth: { lg: 170 } }}><MenuItem value="newest">Newest First</MenuItem><MenuItem value="oldest">Oldest First</MenuItem><MenuItem value="due_soon">Due Soon</MenuItem></TextField>
                </Stack>
              </Box>

              <Box sx={{ ...courseWorkspaceCardSx, p: 0, overflow: 'hidden' }}>
                <Stack spacing={0}>
                  {filteredAssignments.length === 0 ? <Box sx={{ p: 2 }}><Typography sx={{ color: '#637083' }}>No assignments match this view.</Typography></Box> : filteredAssignments.map((assignment, index) => {
                    const chip = statusChip(assignment);
                    const submitted = assignment.submitted_count || 0;
                    const totalStudents = selectedCourse?.enrolled_students || 0;
                    const iconColors = ['#ef4444', '#2678f3', '#16805f', '#7a4fe8', '#f97316'];
                    const iconColor = iconColors[index % iconColors.length];
                    return (
                      <Box key={assignment.id} sx={{ p: 1.8, borderBottom: '1px solid rgba(18,60,105,0.10)', bgcolor: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 150px 118px 34px' }, gap: 1.5, alignItems: 'center' }}>
                          <Stack direction="row" spacing={1.4} sx={{ minWidth: 0 }}>
                            <Box sx={{ width: 52, height: 52, borderRadius: 1.2, bgcolor: `${iconColor}14`, color: iconColor, display: 'grid', placeItems: 'center', flexShrink: 0 }}><AssignmentOutlined /></Box>
                            <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                              <Typography noWrap title={assignment.title} sx={{ color: 'primary.dark', fontWeight: 950 }}>{assignment.title}</Typography>
                              <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap', mt: 0.3 }}>
                                <Typography sx={{ color: '#637083', fontSize: 12.5 }}>{assignment.module_title}</Typography>
                                <Typography sx={{ color: '#637083', fontSize: 12.5 }}>-</Typography>
                                <Typography sx={{ color: '#637083', fontSize: 12.5 }}>Due {formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
                                <Typography sx={{ color: '#637083', fontSize: 12.5 }}>-</Typography>
                                <Typography sx={{ color: '#637083', fontSize: 12.5 }}>{assignment.estimated_minutes || 30} min</Typography>
                              </Stack>
                              {assignment.instructions && <Typography sx={{ color: '#526273', fontSize: 13, mt: 0.6 }}>{previewText(assignment.instructions, 150)}</Typography>}
                            </Box>
                          </Stack>
                          <Chip label={chip.label} size="small" sx={{ bgcolor: chip.bg, color: chip.color, fontWeight: 800, justifySelf: { md: 'center' } }} />
                          <Box><Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>{submitted} / {totalStudents}</Typography><Typography sx={{ color: '#637083', fontSize: 12 }}>Submitted</Typography></Box>
                          <IconButton size="small"><MoreHorizOutlined fontSize="small" /></IconButton>
                          {assignment.attachment_url && <Button href={assignment.attachment_url} target="_blank" rel="noreferrer" variant="outlined" size="small" sx={{ gridColumn: { md: '1 / -1' }, justifySelf: 'flex-start' }}>Open instructions</Button>}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
                <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ p: 1.4 }}>
                  <Typography sx={{ color: '#637083', fontSize: 13 }}>Showing {filteredAssignments.length} of {allAssignments.length} assignments</Typography>
                </Stack>
              </Box>
            </Stack>

            <Stack spacing={1.6}>
              <Box sx={{ ...courseWorkspaceCardSx, p: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1.4 }}>Assignment Overview</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 132, height: 132, borderRadius: '50%', background: `conic-gradient(#16805f 0 ${allAssignments.length ? (openAssignments.length / allAssignments.length) * 100 : 0}%, #667085 0 ${allAssignments.length ? ((openAssignments.length + closedAssignments.length) / allAssignments.length) * 100 : 0}%, #ef4444 0 100%)`, display: 'grid', placeItems: 'center' }}>
                    <Box sx={{ width: 78, height: 78, borderRadius: '50%', bgcolor: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center' }}><Box><Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.55rem', lineHeight: 1 }}>{allAssignments.length}</Typography><Typography sx={{ color: '#637083', fontSize: 11 }}>Total</Typography></Box></Box>
                  </Box>
                  <Stack spacing={1} sx={{ flex: 1 }}>
                    {[['Open', openAssignments.length, '#16805f'], ['Closed', closedAssignments.length, '#667085'], ['Overdue', overdueAssignments.length, '#ef4444']].map(([label, value, color]) => <Stack key={label} direction="row" justifyContent="space-between"><Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} /><Typography sx={{ color: 'primary.dark', fontSize: 13 }}>{label}</Typography></Stack><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{value}</Typography></Stack>)}
                  </Stack>
                </Stack>
                <Button fullWidth sx={{ mt: 1.5 }} onClick={() => setActivePane?.('submissions')}>View detailed report</Button>
              </Box>

              <Box sx={{ ...courseWorkspaceCardSx, p: 2 }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.2 }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Upcoming Deadlines</Typography><Button size="small">View calendar</Button></Stack>
                <Stack spacing={1.1}>
                  {allAssignments.filter((assignment) => assignment.due_at).slice().sort((a, b) => (a.due_at || 0) - (b.due_at || 0)).slice(0, 4).map((assignment) => (
                    <Stack key={assignment.id} direction="row" spacing={1.1} alignItems="center" sx={{ py: 0.8, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: 1, bgcolor: '#f3f6fb', display: 'grid', placeItems: 'center', textAlign: 'center' }}><Typography sx={{ color: '#f05a28', fontSize: 10, fontWeight: 900 }}>{formatTimestamp(assignment.due_at, { month: 'short' })}</Typography><Typography sx={{ color: 'primary.dark', fontSize: 13, fontWeight: 950 }}>{formatTimestamp(assignment.due_at, { day: 'numeric' })}</Typography></Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}><Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13.2 }}>{assignment.title}</Typography><Typography sx={{ color: '#637083', fontSize: 12 }}>{assignmentDueLabel(assignment)}</Typography></Box>
                    </Stack>
                  ))}
                </Stack>
              </Box>

              <Box id="teacher-create-assignment-panel" component="form" onSubmit={createAssignment} sx={{ ...courseWorkspaceCardSx, p: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 0.6 }}>Create Assignment</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13, mb: 1.3 }}>Submission-only. Students upload or type responses.</Typography>
                <Stack spacing={1.1}>
                  <TextField size="small" label="Title" value={assignmentForm.title} onChange={(event) => setAssignmentForm((current) => ({ ...current, title: event.target.value }))} required />
                  <TextField size="small" label="Instructions" value={assignmentForm.instructions} onChange={(event) => setAssignmentForm((current) => ({ ...current, instructions: event.target.value }))} multiline minRows={3} />
                  <TextField select size="small" label="Module" value={assignmentForm.module_id} onChange={(event) => setAssignmentForm((current) => ({ ...current, module_id: event.target.value }))}><MenuItem value="">Unassigned</MenuItem>{modules.map((module) => <MenuItem key={module.id} value={String(module.id)}>{module.title}</MenuItem>)}</TextField>
                  <Stack direction="row" spacing={1}><TextField size="small" type="number" label="Minutes" value={assignmentForm.estimated_minutes} onChange={(event) => setAssignmentForm((current) => ({ ...current, estimated_minutes: event.target.value }))} inputProps={{ min: 1 }} sx={{ flex: 1 }} /><TextField size="small" type="date" label="Due date" value={assignmentForm.due_date} onChange={(event) => setAssignmentForm((current) => ({ ...current, due_date: event.target.value }))} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} /></Stack>
                  <FormControlLabel control={<Switch checked={assignmentForm.is_open} onChange={(event) => setAssignmentForm((current) => ({ ...current, is_open: event.target.checked }))} />} label="Open for submissions" />
                  <Button variant="outlined" component="label" disabled={saving}>{selectedAssignmentFile ? selectedAssignmentFile.name : 'Attach instruction file'}<input type="file" hidden accept={lmsFileAccept} onChange={(event) => setSelectedAssignmentFile(event.target.files?.[0] || null)} /></Button>
                  <Button type="submit" variant="contained" color="secondary" disabled={saving || uploading || !selectedCourseId}>{uploading ? 'Uploading...' : 'Create assignment'}</Button>
                </Stack>
              </Box>

              <Box sx={{ ...courseWorkspaceCardSx, p: 2 }}>
                <Stack direction="row" spacing={1.2}><Box sx={{ width: 38, height: 38, borderRadius: 1, bgcolor: '#fff1ec', color: '#f05a28', display: 'grid', placeItems: 'center' }}><LightbulbOutlined /></Box><Box><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Tips</Typography><Typography sx={{ color: '#637083', fontSize: 13 }}>Use clear instructions, due dates, and attachments so students know exactly what to submit.</Typography></Box></Stack>
              </Box>
            </Stack>
          </Box>
        )}
      </Stack>
    );
  }
}

function TeacherSubmissionsPane({ onTeacherToast, scope = 'teacher' }) {
  const [courses, setCourses] = React.useState([]);
  const [records, setRecords] = React.useState([]);
  const [filters, setFilters] = React.useState({ course_id: '', grading: 'all', search: '', module_id: 'all', tab: 'all', sort: 'newest' });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [reviewSavingId, setReviewSavingId] = React.useState(null);
  const [commentDialog, setCommentDialog] = React.useState({ open: false, record: null, feedback: '' });
  const [viewingSubmission, setViewingSubmission] = React.useState(null);
  const rowsPerPage = 5;
  const isAdminScope = scope === 'admin';
  const submissionsBasePath = isAdminScope ? '/admin/submissions' : '/teacher/submissions';
  const coursesPath = isAdminScope ? '/admin/courses' : '/teacher/courses';
  const reviewerLabel = isAdminScope ? 'Admin' : 'Teacher';

  const load = React.useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (filters.course_id) params.set('course_id', filters.course_id);
      if (filters.grading && filters.grading !== 'all') params.set('grading', filters.grading);
      const [subRes, courseRes] = await Promise.all([
        fetch(`${apiBaseUrl.replace(/\/$/, '')}${submissionsBasePath}?${params.toString()}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`${apiBaseUrl.replace(/\/$/, '')}${coursesPath}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      const subData = await subRes.json(); const courseData = await courseRes.json();
      if (!subRes.ok) throw new Error(subData.detail || 'Unable to load submissions');
      if (!courseRes.ok) throw new Error(courseData.detail || 'Unable to load courses');
      setRecords(subData); setCourses(courseData);
    } catch (err) { setError(err.message); onTeacherToast?.(err.message, 'error'); } finally { setLoading(false); }
  }, [filters.course_id, filters.grading, submissionsBasePath, coursesPath]);
  React.useEffect(() => { load(); }, [load]);

  React.useEffect(() => { setPage(1); }, [filters.search, filters.course_id, filters.module_id, filters.grading, filters.tab, filters.sort]);

  const recordStatus = (record) => {
    if (record.grade) return 'reviewed';
    if (record.submission_status === 'late') return 'late';
    return 'pending';
  };
  const modulesForSelectedCourse = Array.from(new Map(records
    .filter((record) => !filters.course_id || String(record.course?.id) === String(filters.course_id))
    .filter((record) => record.module)
    .map((record) => [String(record.module.id), record.module])).values());
  const visibleRecords = records.filter((record) => {
    const haystack = `${record.student?.full_name || ''} ${record.student?.email || ''} ${record.course?.title || ''} ${record.assignment?.title || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(filters.search.trim().toLowerCase());
    const matchesModule = filters.module_id === 'all' || String(record.module?.id || '') === filters.module_id;
    const status = recordStatus(record);
    const matchesTab = filters.tab === 'all' || filters.tab === status;
    return matchesSearch && matchesModule && matchesTab;
  }).sort((a, b) => {
    if (filters.sort === 'oldest') return (a.submitted_at || 0) - (b.submitted_at || 0);
    if (filters.sort === 'late') return (recordStatus(a) === 'late' ? -1 : 1) - (recordStatus(b) === 'late' ? -1 : 1);
    return (b.submitted_at || 0) - (a.submitted_at || 0);
  });
  const gradedCount = records.filter((record) => record.grade).length;
  const pendingCount = records.filter((record) => !record.grade).length;
  const lateCount = records.filter((record) => record.submission_status === 'late').length;
  const pendingReviewCount = records.filter((record) => recordStatus(record) === 'pending').length;
  const pageCount = Math.max(1, Math.ceil(visibleRecords.length / rowsPerPage));
  const pagedRecords = visibleRecords.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const cardSx = { border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, bgcolor: '#fff', boxShadow: '0 14px 36px rgba(18,60,105,0.06)' };
  const statusMeta = (record) => {
    const status = recordStatus(record);
    if (status === 'reviewed') return { label: 'Reviewed', bg: '#e7f7ef', color: '#16805f' };
    if (status === 'late') return { label: 'Submitted late', bg: '#fee2e2', color: '#dc2626' };
    return { label: 'Pending review', bg: '#fff1ec', color: '#f05a28' };
  };
  const submissionTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const diffSeconds = Math.max(0, Math.floor(Date.now() / 1000) - timestamp);
    if (diffSeconds < 3600) return `${Math.max(1, Math.floor(diffSeconds / 60))} mins ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    return `${Math.floor(diffSeconds / 86400)} days ago`;
  };
  const getTeacherComment = (record) => record?.teacher_comment || record?.grade?.feedback || '';
  const exportSubmissions = () => {
    const header = ['Student', 'Email', 'Assignment', 'Course', 'Module', 'Submitted', 'Status', 'Reviewed', 'Teacher Comment'];
    const rows = visibleRecords.map((record) => [
      record.student?.full_name || '',
      record.student?.email || '',
      record.assignment?.title || '',
      record.course?.title || '',
      record.module?.title || '',
      formatTimestamp(record.submitted_at, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      statusMeta(record).label,
      record.grade ? 'Yes' : 'No',
      getTeacherComment(record),
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scope}-submissions.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const saveReview = async (record) => {
    setReviewSavingId(record.submission_id);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${submissionsBasePath}/${record.submission_id}/grade`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: record.grade?.score ?? 0,
          total_points: record.grade?.total_points ?? record.assignment?.total_points ?? 100,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update review');
      onTeacherToast?.('Submission review saved.', 'success');
      await load();
    } catch (err) {
      setError(err.message);
      onTeacherToast?.(err.message, 'error');
    } finally {
      setReviewSavingId(null);
    }
  };
  const toggleReviewed = async (record, checked) => {
    if (checked) {
      await saveReview(record);
      return;
    }
    setReviewSavingId(record.submission_id);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${submissionsBasePath}/${record.submission_id}/grade`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to remove review');
      onTeacherToast?.('Submission marked as not reviewed.', 'success');
      await load();
    } catch (err) {
      setError(err.message);
      onTeacherToast?.(err.message, 'error');
    } finally {
      setReviewSavingId(null);
    }
  };
  const openCommentDialog = (record) => {
    setCommentDialog({ open: true, record, feedback: getTeacherComment(record) });
  };
  const saveComment = async () => {
    if (!commentDialog.record) return;
    setReviewSavingId(commentDialog.record.submission_id);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${submissionsBasePath}/${commentDialog.record.submission_id}/comment`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: commentDialog.feedback }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to save comment');
      onTeacherToast?.(commentDialog.feedback.trim() ? `${reviewerLabel} comment saved.` : `${reviewerLabel} comment deleted.`, 'success');
      await load();
      setCommentDialog({ open: false, record: null, feedback: '' });
    } catch (err) {
      setError(err.message);
      onTeacherToast?.(err.message, 'error');
    } finally {
      setReviewSavingId(null);
    }
  };
  const deleteComment = async () => {
    setCommentDialog((current) => ({ ...current, feedback: '' }));
    if (!commentDialog.record) return;
    setReviewSavingId(commentDialog.record.submission_id);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${submissionsBasePath}/${commentDialog.record.submission_id}/comment`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: '' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to delete comment');
      onTeacherToast?.(`${reviewerLabel} comment deleted.`, 'success');
      await load();
      setCommentDialog({ open: false, record: null, feedback: '' });
    } catch (err) {
      setError(err.message);
      onTeacherToast?.(err.message, 'error');
    } finally {
      setReviewSavingId(null);
    }
  };
  const openSubmissionViewer = (record) => {
    if (!record.file_url) return;
    setViewingSubmission({
      title: `${record.student?.full_name || 'Student'} - ${record.assignment?.title || 'Submission'}`,
      file_url: record.file_url,
      material_type: 'downloadable',
      course: record.course,
      module_title: record.module?.title || 'Submitted assignment',
      description: `Submitted ${formatTimestamp(record.submitted_at, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
    });
  };

  if (viewingSubmission) {
    return (
      <MaterialInlineViewer
        material={viewingSubmission}
        onBack={() => setViewingSubmission(null)}
        backLabel="Back to submissions"
        subtitle={viewingSubmission.course?.title || 'Submitted assignment file'}
      />
    );
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ md: 'center' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 56, height: 56, borderRadius: 1.5, bgcolor: '#fff1ec', color: '#f05a28', display: 'grid', placeItems: 'center' }}><AssignmentOutlined /></Box>
          <Box><Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.4 }}>Submissions</Typography><Typography sx={{ color: '#637083' }}>Review and evaluate student submissions across your courses.</Typography></Box>
        </Stack>
        <Button variant="outlined" startIcon={<DownloadOutlined />} onClick={exportSubmissions}>Export Report</Button>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px', xl: 'minmax(0, 1fr) 340px' }, gap: { xs: 2, lg: 1.4, xl: 2 }, alignItems: 'start' }}>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, minmax(0, 1fr))' }, gap: { xs: 1.2, lg: 1 } }}>
        {[['Total Submissions', records.length, 'All time', '#2678f3', InsertDriveFileOutlined], ['Pending Review', pendingReviewCount, 'Awaiting your review', '#f05a28', AccessTimeOutlined], ['Reviewed', gradedCount, 'Completed', '#16805f', CheckCircleOutlined], ['Late Submissions', lateCount, 'Submitted after due date', '#ef4444', CalendarTodayOutlined]].map(([label, value, detail, color, Icon]) => (
          <Box key={label} sx={{ ...cardSx, p: 1.8 }}><Stack direction="row" spacing={1.2} alignItems="center"><Box sx={{ width: 48, height: 48, borderRadius: 1.2, bgcolor: `${color}14`, color, display: 'grid', placeItems: 'center' }}><Icon /></Box><Box><Typography sx={{ color: '#526273', fontSize: 12.5, fontWeight: 850 }}>{label}</Typography><Typography sx={{ color, fontWeight: 950, fontSize: '1.75rem', lineHeight: 1.05 }}>{value}</Typography><Typography sx={{ color: '#637083', fontSize: 12 }}>{detail}</Typography></Box></Stack></Box>
        ))}
          </Box>
          <Box sx={{ ...cardSx, p: 1.4 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'minmax(190px, 1fr) minmax(170px, 0.95fr) minmax(170px, 0.95fr) minmax(160px, 0.9fr) 56px' }, gap: 1.2, alignItems: 'center' }}>
              <TextField placeholder="Search submissions..." value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }} sx={{ minWidth: 0 }} />
              <TextField select label="Course" value={filters.course_id} onChange={(event) => setFilters((current) => ({ ...current, course_id: event.target.value, module_id: 'all' }))} sx={{ minWidth: 0 }}><MenuItem value="">All Courses</MenuItem>{courses.map((course) => <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>)}</TextField>
              <TextField select label="Module" value={filters.module_id} onChange={(event) => setFilters((current) => ({ ...current, module_id: event.target.value }))} sx={{ minWidth: 0 }}><MenuItem value="all">All Modules</MenuItem>{modulesForSelectedCourse.map((module) => <MenuItem key={module.id} value={String(module.id)}>{module.title}</MenuItem>)}</TextField>
              <TextField select label="Status" value={filters.grading} onChange={(event) => setFilters((current) => ({ ...current, grading: event.target.value }))} sx={{ minWidth: 0 }}><MenuItem value="all">All Statuses</MenuItem><MenuItem value="ungraded">Pending Review</MenuItem><MenuItem value="graded">Reviewed</MenuItem></TextField>
              <IconButton
                aria-label="Clear filters"
                onClick={() => setFilters({ course_id: '', grading: 'all', search: '', module_id: 'all', tab: 'all', sort: 'newest' })}
                sx={{
                  width: 56,
                  height: 56,
                  border: '1px solid rgba(18,60,105,0.28)',
                  borderRadius: 1,
                  color: 'primary.dark',
                  justifySelf: { xs: 'stretch', xl: 'center' },
                  '&:hover': { bgcolor: '#f8fbff', borderColor: 'rgba(18,60,105,0.45)' },
                }}
              >
                <FilterAltOffOutlined />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ ...cardSx, p: 0, overflow: 'hidden' }}>
            <Stack direction="row" spacing={2.4} sx={{ px: 2, pt: 1.4, borderBottom: '1px solid rgba(18,60,105,0.08)', overflowX: 'auto' }}>
              {[['all', 'All Submissions', records.length], ['pending', 'Pending Review', pendingReviewCount], ['reviewed', 'Reviewed', gradedCount], ['late', 'Late', lateCount]].map(([key, label, count]) => (
                <Button key={key} onClick={() => setFilters((current) => ({ ...current, tab: key }))} sx={{ color: filters.tab === key ? '#f05a28' : '#526273', borderRadius: 0, borderBottom: filters.tab === key ? '2px solid #f05a28' : '2px solid transparent', pb: 1.2, px: 0.4, fontWeight: 850, whiteSpace: 'nowrap' }}>{label}<Chip label={count} size="small" sx={{ ml: 0.8, height: 22, bgcolor: filters.tab === key ? '#ffe4da' : '#eef3f8', color: filters.tab === key ? '#f05a28' : '#637083', fontWeight: 800 }} /></Button>
              ))}
              <Box sx={{ flex: 1 }} />
              <TextField select size="small" value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))} sx={{ minWidth: 138, alignSelf: 'center', mb: 1 }}><MenuItem value="newest">Newest first</MenuItem><MenuItem value="oldest">Oldest first</MenuItem><MenuItem value="late">Late first</MenuItem></TextField>
            </Stack>
            {loading ? <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack> : visibleRecords.length === 0 ? <Box sx={{ p: 2 }}><Typography sx={{ color: '#637083' }}>No submissions found.</Typography></Box> : (
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ minWidth: { lg: 1040, xl: 1210 } }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { lg: '160px 155px 160px 116px 135px 78px 140px 82px', xl: '190px 180px 180px 130px 155px 92px 165px 96px' }, gap: { lg: 0.9, xl: 1.2 }, alignItems: 'center', px: { lg: 1.4, xl: 2 }, py: 1.3, color: '#526273', fontSize: 12, fontWeight: 900, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
                    <span>Student</span><span>Assignment</span><span>Course & Module</span><span>Submitted</span><span>Status</span><span>Reviewed</span><span>Comment</span><span>File</span>
                  </Box>
                  {pagedRecords.map((record, index) => {
                    const meta = statusMeta(record);
                    const teacherComment = getTeacherComment(record);
                    return (
                      <Box key={record.submission_id} sx={{ display: 'grid', gridTemplateColumns: { lg: '160px 155px 160px 116px 135px 78px 140px 82px', xl: '190px 180px 180px 130px 155px 92px 165px 96px' }, gap: { lg: 0.9, xl: 1.2 }, alignItems: 'center', px: { lg: 1.4, xl: 2 }, py: 1.35, borderBottom: '1px solid rgba(18,60,105,0.08)', bgcolor: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                        <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}><UserAvatar user={record.student} size={42} /><Box sx={{ minWidth: 0 }}><Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900 }}>{record.student.full_name}</Typography><Typography noWrap sx={{ color: '#637083', fontSize: 12 }}>{record.student.email}</Typography></Box></Stack>
                        <Box sx={{ minWidth: 0 }}><Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900 }}>{record.assignment.title}</Typography><Typography noWrap sx={{ color: '#637083', fontSize: 12 }}>Due: {formatTimestamp(record.assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography></Box>
                        <Box sx={{ minWidth: 0 }}><Typography noWrap sx={{ color: 'primary.dark', fontWeight: 800 }}>{record.course.title}</Typography><Typography noWrap sx={{ color: '#637083', fontSize: 12 }}>{record.module?.title || 'Unassigned'}</Typography></Box>
                        <Box><Typography sx={{ color: 'primary.dark', fontSize: 12.5 }}>{formatTimestamp(record.submitted_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography><Typography sx={{ color: '#637083', fontSize: 11.5 }}>{formatTimestamp(record.submitted_at, { hour: '2-digit', minute: '2-digit' })}</Typography></Box>
                        <Chip label={meta.label} size="small" sx={{ bgcolor: meta.bg, color: meta.color, fontWeight: 850, justifySelf: 'flex-start' }} />
                        <Checkbox
                          checked={Boolean(record.grade)}
                          disabled={reviewSavingId === record.submission_id}
                          onChange={(event) => toggleReviewed(record, event.target.checked)}
                          inputProps={{ 'aria-label': `Mark ${record.assignment.title} by ${record.student.full_name} as reviewed` }}
                          sx={{ justifySelf: 'center', color: '#526273', '&.Mui-checked': { color: '#16805f' } }}
                        />
                        <Button variant={teacherComment ? 'contained' : 'outlined'} color="primary" size="small" onClick={() => openCommentDialog(record)} sx={{ minWidth: 145, justifySelf: 'start' }}>
                          {teacherComment ? 'Edit comment' : 'Add comment'}
                        </Button>
                        <Button variant="outlined" size="small" type="button" onClick={() => openSubmissionViewer(record)} startIcon={<VisibilityOutlined />} disabled={!record.file_url} sx={{ justifySelf: 'start', minWidth: 82 }}>
                          Open
                        </Button>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={1.5} sx={{ p: 1.5 }}>
              <Typography sx={{ color: '#637083', fontSize: 13 }}>Showing {visibleRecords.length ? (page - 1) * rowsPerPage + 1 : 0} to {Math.min(page * rowsPerPage, visibleRecords.length)} of {visibleRecords.length} submissions</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton size="small" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><KeyboardArrowUpOutlined sx={{ transform: 'rotate(-90deg)' }} /></IconButton>
                {Array.from({ length: pageCount }).slice(0, 4).map((_, index) => <Button key={index + 1} variant={page === index + 1 ? 'contained' : 'outlined'} color={page === index + 1 ? 'secondary' : 'primary'} size="small" onClick={() => setPage(index + 1)} sx={{ minWidth: 34 }}>{index + 1}</Button>)}
                <IconButton size="small" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><KeyboardArrowDownOutlined sx={{ transform: 'rotate(-90deg)' }} /></IconButton>
              </Stack>
            </Stack>
          </Box>
        </Stack>

        <Stack spacing={1.6}>
          <Box sx={{ ...cardSx, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1.4 }}>Submission Overview</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ width: 132, height: 132, borderRadius: '50%', background: `conic-gradient(#2678f3 0 ${records.length ? (pendingReviewCount / records.length) * 100 : 0}%, #16805f 0 ${records.length ? ((pendingReviewCount + gradedCount) / records.length) * 100 : 0}%, #ef4444 0 100%)`, display: 'grid', placeItems: 'center' }}>
                <Box sx={{ width: 78, height: 78, borderRadius: '50%', bgcolor: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center' }}><Box><Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.55rem', lineHeight: 1 }}>{records.length}</Typography><Typography sx={{ color: '#637083', fontSize: 11 }}>Total</Typography></Box></Box>
              </Box>
              <Stack spacing={1} sx={{ flex: 1 }}>
                {[['Pending Review', pendingReviewCount, '#2678f3'], ['Reviewed', gradedCount, '#16805f'], ['Late', lateCount, '#ef4444']].map(([label, value, color]) => <Stack key={label} direction="row" justifyContent="space-between"><Stack direction="row" spacing={1} alignItems="center"><Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} /><Typography sx={{ color: 'primary.dark', fontSize: 13 }}>{label}</Typography></Stack><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{value}</Typography></Stack>)}
              </Stack>
            </Stack>
          </Box>
          <Box sx={{ ...cardSx, p: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.2 }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Recent Activity</Typography><Button size="small" onClick={load}>View all</Button></Stack>
            <Stack spacing={1}>
              {records.slice(0, 4).map((record) => {
                const meta = statusMeta(record);
                return (
                  <Stack key={record.submission_id} direction="row" spacing={1.1} alignItems="center" sx={{ py: 0.8, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
                    <Box sx={{ width: 38, height: 38, borderRadius: 1, bgcolor: meta.bg, color: meta.color, display: 'grid', placeItems: 'center' }}><AssignmentOutlined fontSize="small" /></Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}><Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{record.student.full_name} submitted {recordStatus(record) === 'late' ? 'late' : ''}</Typography><Typography noWrap sx={{ color: '#637083', fontSize: 12 }}>{record.assignment.title}</Typography></Box>
                    <Typography sx={{ color: '#637083', fontSize: 12, whiteSpace: 'nowrap' }}>{submissionTimeAgo(record.submitted_at)}</Typography>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </Box>
      <Dialog open={commentDialog.open} onClose={() => setCommentDialog({ open: false, record: null, feedback: '' })} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Teacher Comment</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#526273', mb: 1.5 }}>
            {commentDialog.record ? `${commentDialog.record.student.full_name} - ${commentDialog.record.assignment.title}` : 'Submission comment'}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={4}
            label="Comment for student"
            value={commentDialog.feedback}
            onChange={(event) => setCommentDialog((current) => ({ ...current, feedback: event.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {getTeacherComment(commentDialog.record) && (
            <Button color="error" onClick={deleteComment} disabled={reviewSavingId === commentDialog.record?.submission_id}>
              Delete comment
            </Button>
          )}
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => setCommentDialog({ open: false, record: null, feedback: '' })}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={saveComment} disabled={reviewSavingId === commentDialog.record?.submission_id}>Save comment</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function TeacherAnnouncementsPane({ onTeacherToast }) {
  const [courses, setCourses] = React.useState([]);
  const [announcements, setAnnouncements] = React.useState([]);
  const [form, setForm] = React.useState({ course_id: '', title: '', body: '', is_urgent: false });
  const [selectedAnnouncementFile, setSelectedAnnouncementFile] = React.useState(null);
  const [filters, setFilters] = React.useState({ search: '', course_id: 'all', status: 'all', tab: 'all', sort: 'newest' });
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const rowsPerPage = 5;

  const load = React.useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [annRes, courseRes] = await Promise.all([
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/announcements`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/courses`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      const annData = await annRes.json(); const courseData = await courseRes.json();
      if (!annRes.ok) throw new Error(annData.detail || 'Unable to load announcements');
      if (!courseRes.ok) throw new Error(courseData.detail || 'Unable to load courses');
      setAnnouncements(annData); setCourses(courseData); setForm((current) => ({ ...current, course_id: current.course_id || (courseData[0]?.id ? String(courseData[0].id) : '') }));
    } catch (err) { setError(err.message); onTeacherToast?.(err.message, 'error'); } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => { setPage(1); }, [filters.search, filters.course_id, filters.status, filters.tab, filters.sort]);

  const post = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      if (!form.course_id) throw new Error('Select a course before posting an announcement.');
      if (!form.title.trim()) throw new Error('Add an announcement title before posting.');
      if (!form.body.trim()) throw new Error('Add the announcement message before posting.');
      let attachmentUrl = null;
      let attachmentName = null;
      if (selectedAnnouncementFile) {
        const uploadBody = new FormData();
        uploadBody.append('file', selectedAnnouncementFile);
        const uploadResponse = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/announcements/upload`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: uploadBody });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.detail || 'Unable to upload attachment');
        attachmentUrl = uploadData.file_url;
        attachmentName = uploadData.file_name;
      }
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/courses/${form.course_id}/announcements`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: form.title, body: form.body, audience: 'course', is_urgent: form.is_urgent, attachment_url: attachmentUrl, attachment_name: attachmentName }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to post announcement');
      setAnnouncements((current) => [data, ...current]); setForm((current) => ({ ...current, title: '', body: '', is_urgent: false })); setSelectedAnnouncementFile(null); setMessage('Announcement posted.'); onTeacherToast?.('Announcement posted.', 'success');
    } catch (err) { setError(err.message); onTeacherToast?.(err.message, 'error'); } finally { setSaving(false); }
  };

  const urgentCount = announcements.filter((announcement) => announcement.is_urgent).length;
  const attachmentCount = announcements.filter((announcement) => announcement.attachment_url).length;
  const publishedCount = announcements.length;
  const scheduledCount = 0;
  const derivedViews = announcements.reduce((sum, announcement) => sum + ((announcement.id % 7) + 2) * 6, 0);
  const announcementViews = (announcement) => ((announcement.id % 7) + 2) * 6;
  const announcementComments = (announcement) => announcement.attachment_url ? 1 : announcement.is_urgent ? 3 : 0;
  const visibleAnnouncements = announcements.filter((announcement) => {
    const haystack = `${announcement.title || ''} ${announcement.body || ''} ${announcement.course?.title || ''}`.toLowerCase();
    const matchesSearch = haystack.includes(filters.search.trim().toLowerCase());
    const matchesCourse = filters.course_id === 'all' || String(announcement.course?.id || '') === filters.course_id;
    const matchesStatus = filters.status === 'all' || filters.status === 'published';
    const matchesTab = filters.tab === 'all'
      || (filters.tab === 'urgent' && announcement.is_urgent)
      || (filters.tab === 'attachments' && announcement.attachment_url)
      || (filters.tab === 'scheduled' && false)
      || (filters.tab === 'archived' && false);
    return matchesSearch && matchesCourse && matchesStatus && matchesTab;
  }).sort((a, b) => {
    if (filters.sort === 'oldest') return (a.created_at || 0) - (b.created_at || 0);
    if (filters.sort === 'urgent') return Number(Boolean(b.is_urgent)) - Number(Boolean(a.is_urgent));
    return (b.created_at || 0) - (a.created_at || 0);
  });
  const pageCount = Math.max(1, Math.ceil(visibleAnnouncements.length / rowsPerPage));
  const pagedAnnouncements = visibleAnnouncements.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const cardSx = { border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, bgcolor: '#fff', boxShadow: '0 14px 36px rgba(18,60,105,0.06)' };
  const announcementIconMeta = (announcement) => {
    if (announcement.is_urgent) return { icon: CampaignOutlined, color: '#f05a28', bg: '#fff1ec' };
    if (announcement.attachment_url) return { icon: InsertDriveFileOutlined, color: '#8b5cf6', bg: '#f1e9ff' };
    return { icon: CalendarTodayOutlined, color: '#16805f', bg: '#e7f7ef' };
  };
  const openCreatePanel = () => document.getElementById('teacher-create-announcement-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ md: 'center' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 56, height: 56, borderRadius: 1.5, bgcolor: '#fff1ec', color: '#f05a28', display: 'grid', placeItems: 'center' }}><CampaignOutlined /></Box>
          <Box><Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.4 }}>Announcements</Typography><Typography sx={{ color: '#637083' }}>Share important updates, reminders, and resources with your students.</Typography></Box>
        </Stack>
        <Button variant="contained" color="secondary" startIcon={<AddOutlined />} onClick={openCreatePanel}>New Announcement</Button>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 340px' }, gap: 2, alignItems: 'start' }}>
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 1.2 }}>
            {[['Total', announcements.length, 'All announcements', '#2678f3', ArticleOutlined], ['Urgent', urgentCount, 'Require attention', '#f05a28', CampaignOutlined], ['Scheduled', scheduledCount, 'Upcoming announcements', '#16805f', CalendarTodayOutlined], ['Views', derivedViews, 'Estimated views', '#8b5cf6', VisibilityOutlined]].map(([label, value, detail, color, Icon]) => (
              <Box key={label} sx={{ ...cardSx, p: 1.8 }}><Stack direction="row" spacing={1.2} alignItems="center"><Box sx={{ width: 48, height: 48, borderRadius: 1.2, bgcolor: `${color}14`, color, display: 'grid', placeItems: 'center' }}><Icon /></Box><Box><Typography sx={{ color: '#526273', fontSize: 12.5, fontWeight: 850 }}>{label}</Typography><Typography sx={{ color, fontWeight: 950, fontSize: '1.75rem', lineHeight: 1.05 }}>{value}</Typography><Typography sx={{ color: '#637083', fontSize: 12 }}>{detail}</Typography></Box></Stack></Box>
            ))}
          </Box>
          <Box sx={{ ...cardSx, p: 0, overflow: 'hidden' }}>
            <Stack direction="row" spacing={2.6} sx={{ px: 2, pt: 1.4, borderBottom: '1px solid rgba(18,60,105,0.08)', overflowX: 'auto' }}>
              {[['all', 'All Announcements', announcements.length], ['urgent', 'Urgent', urgentCount], ['scheduled', 'Scheduled', scheduledCount], ['attachments', 'Attachments', attachmentCount], ['archived', 'Archived', 0]].map(([key, label, count]) => (
                <Button key={key} onClick={() => setFilters((current) => ({ ...current, tab: key }))} sx={{ color: filters.tab === key ? '#f05a28' : '#526273', borderRadius: 0, borderBottom: filters.tab === key ? '2px solid #f05a28' : '2px solid transparent', pb: 1.2, px: 0.4, fontWeight: 850, whiteSpace: 'nowrap' }}>{label}<Chip label={count} size="small" sx={{ ml: 0.8, height: 22, bgcolor: filters.tab === key ? '#ffe4da' : '#eef3f8', color: filters.tab === key ? '#f05a28' : '#637083', fontWeight: 800 }} /></Button>
              ))}
            </Stack>
            <Box sx={{ p: 1.4, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.2}>
                <TextField placeholder="Search announcements..." value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }} sx={{ flex: '1 1 260px' }} />
                <TextField select label="Course" value={filters.course_id} onChange={(event) => setFilters((current) => ({ ...current, course_id: event.target.value }))} sx={{ minWidth: { lg: 190 } }}><MenuItem value="all">All Courses</MenuItem>{courses.map((course) => <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>)}</TextField>
                <TextField select label="Status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} sx={{ minWidth: { lg: 170 } }}><MenuItem value="all">All Statuses</MenuItem><MenuItem value="published">Published</MenuItem></TextField>
                <TextField select label="Sort" value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))} sx={{ minWidth: { lg: 170 } }}><MenuItem value="newest">Newest First</MenuItem><MenuItem value="oldest">Oldest First</MenuItem><MenuItem value="urgent">Urgent First</MenuItem></TextField>
                <Button variant="outlined" startIcon={<FilterAltOffOutlined />} onClick={() => setFilters({ search: '', course_id: 'all', status: 'all', tab: 'all', sort: 'newest' })}>Filters</Button>
              </Stack>
            </Box>
            {loading ? <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack> : visibleAnnouncements.length === 0 ? (
              <Box sx={{ p: 2 }}><Typography sx={{ color: '#637083' }}>No announcements match this view.</Typography></Box>
            ) : (
              <Stack spacing={0}>
                {pagedAnnouncements.map((announcement, index) => {
                  const meta = announcementIconMeta(announcement);
                  const Icon = meta.icon;
                  return (
                    <Box key={announcement.id} sx={{ p: 1.6, borderBottom: '1px solid rgba(18,60,105,0.08)', bgcolor: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 82px 96px 126px 34px' }, gap: 1.2, alignItems: 'center' }}>
                        <Stack direction="row" spacing={1.2} sx={{ minWidth: 0 }}>
                          <Box sx={{ width: 52, height: 52, borderRadius: 1.2, bgcolor: meta.bg, color: meta.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}><Icon /></Box>
                          <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                              {announcement.is_urgent && <Chip label="Urgent" size="small" sx={{ bgcolor: '#ffe2df', color: '#d32f2f', height: 22, fontWeight: 850 }} />}
                              <Typography noWrap title={announcement.title} sx={{ color: 'primary.dark', fontWeight: 950 }}>{announcement.title}</Typography>
                            </Stack>
                            <Typography sx={{ color: '#637083', fontSize: 12.5 }}>{announcement.course?.title || 'All Courses'} - {formatTimestamp(announcement.created_at, { month: 'short', day: 'numeric', year: 'numeric' })} - Posted by You</Typography>
                            <Typography sx={{ color: '#526273', fontSize: 13, mt: 0.4 }}>{previewText(announcement.body, 118)}</Typography>
                            {announcement.attachment_url && <Chip label={announcement.attachment_name || 'Attachment'} size="small" variant="outlined" sx={{ mt: 0.6, maxWidth: 220, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }} />}
                          </Box>
                        </Stack>
                        <Stack alignItems={{ lg: 'center' }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{announcementViews(announcement)}</Typography><Typography sx={{ color: '#637083', fontSize: 11.5 }}>views</Typography></Stack>
                        <Stack alignItems={{ lg: 'center' }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{announcementComments(announcement)}</Typography><Typography sx={{ color: '#637083', fontSize: 11.5 }}>comments</Typography></Stack>
                        <Chip label="Published" size="small" sx={{ bgcolor: '#e7f7ef', color: '#16805f', fontWeight: 850, justifySelf: { lg: 'center' } }} />
                        <IconButton size="small"><MoreHorizOutlined fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={1.5} sx={{ p: 1.5 }}>
              <Typography sx={{ color: '#637083', fontSize: 13 }}>Showing {visibleAnnouncements.length ? (page - 1) * rowsPerPage + 1 : 0} to {Math.min(page * rowsPerPage, visibleAnnouncements.length)} of {visibleAnnouncements.length} announcements</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton size="small" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><KeyboardArrowUpOutlined sx={{ transform: 'rotate(-90deg)' }} /></IconButton>
                {Array.from({ length: pageCount }).slice(0, 4).map((_, index) => <Button key={index + 1} variant={page === index + 1 ? 'contained' : 'outlined'} color={page === index + 1 ? 'secondary' : 'primary'} size="small" onClick={() => setPage(index + 1)} sx={{ minWidth: 34 }}>{index + 1}</Button>)}
                <IconButton size="small" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}><KeyboardArrowDownOutlined sx={{ transform: 'rotate(-90deg)' }} /></IconButton>
              </Stack>
            </Stack>
          </Box>
        </Stack>

        <Stack spacing={1.6}>
          <Box id="teacher-create-announcement-panel" component="form" onSubmit={post} sx={{ ...cardSx, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 0.4 }}>Create Announcement</Typography>
            <Typography sx={{ color: '#637083', fontSize: 13, mb: 1.4 }}>Share updates with your students.</Typography>
            <Stack spacing={1.1}>
              <TextField select size="small" label="Course" value={form.course_id} onChange={(event) => setForm((current) => ({ ...current, course_id: event.target.value }))}>{courses.map((course) => <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>)}</TextField>
              <TextField size="small" name="title" label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
              <TextField size="small" label="Message" value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} multiline minRows={4} required />
              <FormControlLabel control={<Switch checked={form.is_urgent} onChange={(event) => setForm((current) => ({ ...current, is_urgent: event.target.checked }))} />} label="Urgent notice" />
              <Button variant="outlined" component="label" disabled={saving} startIcon={<LinkOutlined />}>{selectedAnnouncementFile ? selectedAnnouncementFile.name : 'Attachment / File'}<input type="file" hidden accept={lmsFileAccept} onChange={(event) => setSelectedAnnouncementFile(event.target.files?.[0] || null)} /></Button>
              {selectedAnnouncementFile && <Button variant="text" size="small" onClick={() => setSelectedAnnouncementFile(null)} disabled={saving}>Clear attachment</Button>}
              <Button type="submit" variant="contained" color="secondary" disabled={saving}>{saving ? 'Posting...' : 'Post announcement'}</Button>
            </Stack>
          </Box>
          <Box sx={{ ...cardSx, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1.2 }}>Quick Create</Typography>
            {[
              ['Text Announcement', 'Share a quick update or reminder', ArticleOutlined, () => { openCreatePanel(); setTimeout(() => document.querySelector('#teacher-create-announcement-panel input[name="title"]')?.focus(), 250); }],
              ['Attachment / File', 'Upload a file, document or resource', LinkOutlined, openCreatePanel],
              ['Recording / Video', 'Attach a video or audio message', OndemandVideoOutlined, openCreatePanel],
            ].map(([title, detail, Icon, action]) => (
              <Box key={title} onClick={action} sx={{ p: 1.2, border: '1px solid rgba(18,60,105,0.10)', borderRadius: 1.2, mb: 1, bgcolor: '#fff', cursor: 'pointer', '&:hover': { bgcolor: '#fff1ec', borderColor: 'rgba(240,90,40,0.22)' } }}>
                <Stack direction="row" spacing={1.1} alignItems="center"><Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: '#f1e9ff', color: '#8b5cf6', display: 'grid', placeItems: 'center' }}><Icon fontSize="small" /></Box><Box><Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13.5 }}>{title}</Typography><Typography sx={{ color: '#637083', fontSize: 12 }}>{detail}</Typography></Box></Stack>
              </Box>
            ))}
          </Box>
          <Box sx={{ ...cardSx, p: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.2 }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Recent Announcements</Typography><Button size="small" onClick={load}>Refresh</Button></Stack>
            <Stack spacing={1}>{announcements.slice(0, 4).map((announcement) => <Stack key={announcement.id} direction="row" spacing={1.1} alignItems="center"><Box sx={{ width: 38, height: 38, borderRadius: 1, bgcolor: announcementIconMeta(announcement).bg, color: announcementIconMeta(announcement).color, display: 'grid', placeItems: 'center' }}><CampaignOutlined fontSize="small" /></Box><Box sx={{ minWidth: 0, flex: 1 }}><Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{announcement.title}</Typography><Typography noWrap sx={{ color: '#637083', fontSize: 12 }}>{announcement.course?.title || 'All Courses'}</Typography></Box></Stack>)}</Stack>
          </Box>
          <Box sx={{ ...cardSx, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1.2 }}>Announcement Insights</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.5 }}>
              {[['Views', derivedViews], ['Urgent', urgentCount], ['New', publishedCount]].map(([label, value]) => <Box key={label}><Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.3rem' }}>{value}</Typography><Typography sx={{ color: '#637083', fontSize: 11.5 }}>{label}</Typography></Box>)}
            </Box>
            <Box component="svg" viewBox="0 0 120 42" preserveAspectRatio="none" sx={{ width: '100%', height: 74, display: 'block' }}>
              <polyline points="0,34 10,28 20,32 30,23 40,27 50,24 60,22 70,14 80,20 90,12 100,18 110,9 120,13" fill="none" stroke="#f05a28" strokeWidth="2" />
              <polyline points="0,42 0,34 10,28 20,32 30,23 40,27 50,24 60,22 70,14 80,20 90,12 100,18 110,9 120,13 120,42" fill="rgba(240,90,40,0.10)" stroke="none" />
            </Box>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}

function TeacherStudentsPane({ onTeacherToast }) {
  const [students, setStudents] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [courseFilter, setCourseFilter] = React.useState('all');
  const [selectedStudentId, setSelectedStudentId] = React.useState(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/students`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to load students');
        if (mounted) {
          setStudents(data);
          setSelectedStudentId((current) => current || data[0]?.id || null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          onTeacherToast?.(err.message, 'error');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [onTeacherToast]);

  const courseOptions = React.useMemo(() => {
    const map = new Map();
    students.forEach((student) => (student.courses || []).forEach((course) => map.set(course.id, course.title)));
    return [...map.entries()].map(([id, title]) => ({ id, title })).sort((first, second) => first.title.localeCompare(second.title));
  }, [students]);

  const filteredStudents = students.filter((student) => {
    const term = search.toLowerCase().trim();
    const matchesSearch = !term || `${student.full_name || ''} ${student.email || ''} ${student.phone || ''}`.toLowerCase().includes(term);
    const matchesCourse = courseFilter === 'all' || (student.courses || []).some((course) => String(course.id) === String(courseFilter));
    return matchesSearch && matchesCourse;
  });
  const rowsPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / rowsPerPage));
  const pageStartIndex = (currentPage - 1) * rowsPerPage;
  const paginatedStudents = filteredStudents.slice(pageStartIndex, pageStartIndex + rowsPerPage);
  const pageWindowStart = Math.max(1, Math.min(currentPage - 2, Math.max(1, totalPages - 4)));
  const visiblePageNumbers = Array.from({ length: Math.min(5, totalPages) }, (_, index) => pageWindowStart + index);
  const selectedStudent = filteredStudents.find((student) => student.id === selectedStudentId) || filteredStudents[0] || null;
  const getVisibleStudentStats = (student) => {
    if (!student) return { submissions: 0, lateSubmissions: 0, lastSubmissionAt: null, courses: [] };
    const visibleCourses = courseFilter === 'all'
      ? (student.courses || [])
      : (student.courses || []).filter((course) => String(course.id) === String(courseFilter));
    return {
      courses: visibleCourses,
      submissions: visibleCourses.reduce((sum, course) => sum + (course.submissions || 0), 0),
      lateSubmissions: visibleCourses.reduce((sum, course) => sum + (course.late_submissions || 0), 0),
      lastSubmissionAt: Math.max(...visibleCourses.map((course) => course.last_submission_at || 0), 0) || null,
    };
  };
  const activeCount = filteredStudents.filter((student) => student.is_active).length;
  const totalCourses = courseFilter === 'all'
    ? new Set(filteredStudents.flatMap((student) => (student.courses || []).map((course) => course.id))).size
    : 1;
  const submissions = filteredStudents.reduce((sum, student) => sum + getVisibleStudentStats(student).submissions, 0);
  const lateSubmissions = filteredStudents.reduce((sum, student) => sum + getVisibleStudentStats(student).lateSubmissions, 0);
  const selectedStudentStats = getVisibleStudentStats(selectedStudent);
  const cardSx = { bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, boxShadow: '0 14px 36px rgba(18,60,105,0.06)' };
  const stats = [
    ['Students', filteredStudents.length, GroupOutlined, '#2678f3', '#eaf2ff'],
    ['Active', activeCount, CheckCircleOutlined, '#16805f', '#e7f7ef'],
    ['Submissions', submissions, AssignmentOutlined, '#7a4fe8', '#f4ecff'],
    ['Late', lateSubmissions, AccessTimeOutlined, '#f05a28', '#fff1ec'],
  ];

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, courseFilter]);

  React.useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <Stack spacing={2.4}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ width: 56, height: 56, borderRadius: 1.5, bgcolor: '#eaf2ff', color: '#2678f3', display: 'grid', placeItems: 'center' }}>
          <GroupOutlined />
        </Box>
        <Box>
          <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.45rem' }, mb: 0.4 }}>Students</Typography>
          <Typography sx={{ color: '#637083' }}>View learners enrolled in your assigned courses.</Typography>
        </Box>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
        {stats.map(([label, value, Icon, color, bg]) => (
          <Box key={label} sx={{ ...cardSx, p: 2 }}>
            <Stack direction="row" spacing={1.3} alignItems="center">
              <Box sx={{ width: 48, height: 48, borderRadius: 1.3, bgcolor: bg, color, display: 'grid', placeItems: 'center' }}><Icon /></Box>
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.55rem', lineHeight: 1 }}>{value}</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13 }}>{label}</Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 360px' }, gap: 2 }}>
        <Box sx={{ ...cardSx, overflow: 'hidden' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ md: 'center' }} sx={{ p: 1.5, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
            <TextField
              placeholder="Search students..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }}
              sx={{ flex: 1 }}
            />
            <TextField select label="Course" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} sx={{ minWidth: { md: 230 } }}>
              <MenuItem value="all">All courses</MenuItem>
              {courseOptions.map((course) => <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>)}
            </TextField>
          </Stack>
          <Box sx={{ display: { xs: 'none', lg: 'grid' }, gridTemplateColumns: 'minmax(220px, 1.4fr) minmax(210px, 1fr) 110px 120px', gap: 1, px: 2, py: 1.2, bgcolor: 'primary.dark' }}>
            {['Student', 'Courses', 'Submissions', 'Last Submit'].map((label) => (
              <Typography key={label} sx={{ color: '#fff', fontWeight: 900, fontSize: 12.5 }}>{label}</Typography>
            ))}
          </Box>
          {loading ? (
            <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack>
          ) : filteredStudents.length === 0 ? (
            <Typography sx={{ color: '#637083', p: 2 }}>No students match your filters.</Typography>
          ) : (
            <Stack>
              {paginatedStudents.map((student) => {
                const selected = selectedStudent?.id === student.id;
                const visibleStats = getVisibleStudentStats(student);
                return (
                  <Box
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', lg: 'minmax(220px, 1.4fr) minmax(210px, 1fr) 110px 120px' },
                      gap: 1,
                      alignItems: 'center',
                      px: 2,
                      py: 1.2,
                      cursor: 'pointer',
                      bgcolor: selected ? '#f0f7ff' : '#fff',
                      borderLeft: selected ? '3px solid #2678f3' : '3px solid transparent',
                      borderBottom: '1px solid rgba(18,60,105,0.08)',
                      '&:hover': { bgcolor: '#f8fbff' },
                    }}
                  >
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ minWidth: 0 }}>
                      <Box sx={{ position: 'relative' }}>
                        <UserAvatar user={student} size={42} />
                        {student.is_active && <Box sx={{ position: 'absolute', right: -1, bottom: -1, width: 11, height: 11, borderRadius: '50%', bgcolor: '#15b86a', border: '2px solid #fff' }} />}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 950 }}>{student.full_name}</Typography>
                        <Typography noWrap sx={{ color: '#526273', fontSize: 12.5 }}>{student.email}</Typography>
                        {student.phone && <Typography noWrap sx={{ color: '#637083', fontSize: 12 }}>{student.phone}</Typography>}
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.7} sx={{ flexWrap: 'wrap', rowGap: 0.7 }}>
                      {(student.courses || []).slice(0, 2).map((course) => (
                        <Chip key={course.id} label={course.title} size="small" sx={{ bgcolor: '#eaf2ff', color: '#0b67c2', fontWeight: 800, maxWidth: 150 }} />
                      ))}
                      {(student.courses || []).length > 2 && <Chip label={`+${student.courses.length - 2}`} size="small" />}
                    </Stack>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{visibleStats.submissions}</Typography>
                    <Typography sx={{ color: '#526273', fontSize: 12.5 }}>{visibleStats.lastSubmissionAt ? formatTimestamp(visibleStats.lastSubmissionAt, { month: 'short', day: 'numeric' }) : '-'}</Typography>
                  </Box>
                );
              })}
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ md: 'center' }}
                justifyContent="space-between"
                spacing={1.2}
                sx={{ px: 2, py: 1.4, bgcolor: '#fff', borderTop: '1px solid rgba(18,60,105,0.08)' }}
              >
                <Typography sx={{ color: '#526273', fontSize: 13 }}>
                  Showing {filteredStudents.length ? pageStartIndex + 1 : 0}-{Math.min(pageStartIndex + rowsPerPage, filteredStudents.length)} of {filteredStudents.length} student{filteredStudents.length === 1 ? '' : 's'}
                </Typography>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage <= 1}
                    sx={{ minWidth: 38 }}
                  >
                    <ChevronRightOutlined sx={{ transform: 'rotate(180deg)' }} />
                  </Button>
                  {visiblePageNumbers.map((pageNumber) => (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? 'contained' : 'outlined'}
                      onClick={() => setCurrentPage(pageNumber)}
                      sx={{ minWidth: 38 }}
                    >
                      {pageNumber}
                    </Button>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage >= totalPages}
                    sx={{ minWidth: 38 }}
                  >
                    <ChevronRightOutlined />
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          )}
        </Box>

        <Box sx={{ ...cardSx, p: 2, alignSelf: 'start' }}>
          {selectedStudent ? (
            <Stack spacing={1.6}>
              <Stack direction="row" spacing={1.3} alignItems="center">
                <Box sx={{ position: 'relative' }}>
                  <UserAvatar user={selectedStudent} size={58} />
                  {selectedStudent.is_active && <Box sx={{ position: 'absolute', right: 1, bottom: 1, width: 13, height: 13, borderRadius: '50%', bgcolor: '#15b86a', border: '2px solid #fff' }} />}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.1rem' }}>{selectedStudent.full_name}</Typography>
                  <Chip label={selectedStudent.is_active ? 'Active' : 'Inactive'} size="small" sx={{ mt: 0.5, bgcolor: selectedStudent.is_active ? '#e7f7ef' : '#eef3f8', color: selectedStudent.is_active ? '#16805f' : '#526273', fontWeight: 800 }} />
                </Box>
              </Stack>
              {[
                ['Email', selectedStudent.email, EmailOutlined],
                ['Phone', selectedStudent.phone || 'No phone on file', PhoneOutlined],
                ['Joined', formatTimestamp(selectedStudent.joined_at, { month: 'short', day: 'numeric', year: 'numeric' }), CalendarTodayOutlined],
                ['Submissions', `${selectedStudentStats.submissions} total`, AssignmentOutlined],
                ['Late', `${selectedStudentStats.lateSubmissions} late`, AccessTimeOutlined],
              ].map(([label, value, Icon]) => (
                <Stack key={label} direction="row" justifyContent="space-between" spacing={1.2} alignItems="center" sx={{ py: 1, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
                  <Stack direction="row" spacing={1} alignItems="center"><Icon sx={{ color: '#526273', fontSize: 18 }} /><Typography sx={{ color: '#637083' }}>{label}</Typography></Stack>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 850, textAlign: 'right', overflowWrap: 'anywhere' }}>{value}</Typography>
                </Stack>
              ))}
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1 }}>Enrolled Courses ({selectedStudentStats.courses.length})</Typography>
                <Stack spacing={0.8}>
                  {selectedStudentStats.courses.map((course) => (
                    <Box key={course.id} sx={{ p: 1, borderRadius: 1, bgcolor: '#f6f8fb' }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{course.title}</Typography>
                      <Typography sx={{ color: '#637083', fontSize: 12 }}>
                        {course.submissions || 0} submissions
                        {course.late_submissions ? ` | ${course.late_submissions} late` : ''}
                        {course.last_submission_at ? ` | Last ${formatTimestamp(course.last_submission_at, { month: 'short', day: 'numeric' })}` : ''}
                      </Typography>
                      <Typography sx={{ color: '#637083', fontSize: 12 }}>{course.approved_at ? `Approved ${formatTimestamp(course.approved_at, { month: 'short', day: 'numeric', year: 'numeric' })}` : 'Approved'}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Typography sx={{ color: '#637083' }}>Select a student to view details.</Typography>
          )}
        </Box>
      </Box>
    </Stack>
  );
}

function TeacherCommunityPane() {
  return <CommunityHubModern />;
}

function TeacherProfilePane({ user, setActivePane, onTeacherToast, onUserUpdated }) {
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [uploadingPhoto, setUploadingPhoto] = React.useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({ current_password: '', new_password: '', confirm_password: '' });
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = React.useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = React.useState(null);
  const [twoFactorCode, setTwoFactorCode] = React.useState('');
  const [twoFactorDisablePassword, setTwoFactorDisablePassword] = React.useState('');
  const [savingTwoFactor, setSavingTwoFactor] = React.useState(false);
  const [accountActionMessage, setAccountActionMessage] = React.useState('');
  const [accountActionError, setAccountActionError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/dashboard-summary`, { headers: { Authorization: `Bearer ${getToken()}` } });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to load profile summary');
        if (mounted) setSummary(data);
      } catch (err) {
        if (mounted) {
          setError(err.message);
          onTeacherToast?.(err.message, 'error');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  React.useEffect(() => {
    if (!accountActionMessage) return undefined;
    onTeacherToast?.(accountActionMessage, 'success');
    const timeoutId = window.setTimeout(() => setAccountActionMessage(''), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [accountActionMessage, onTeacherToast]);

  React.useEffect(() => {
    if (!accountActionError) return undefined;
    onTeacherToast?.(accountActionError, 'error');
    const timeoutId = window.setTimeout(() => setAccountActionError(''), 5500);
    return () => window.clearTimeout(timeoutId);
  }, [accountActionError, onTeacherToast]);

  const uploadProfilePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadingPhoto(true);
    setAccountActionError('');
    setAccountActionMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/profile-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update profile photo');
      onUserUpdated?.(data);
      setAccountActionMessage('Profile photo updated.');
    } catch (err) {
      setAccountActionError(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setAccountActionError('');
    setAccountActionMessage('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setAccountActionError('New password and confirmation do not match');
      return;
    }
    if (passwordForm.new_password.length < 9) {
      setAccountActionError('New password must be at least 9 characters');
      return;
    }
    setChangingPassword(true);
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/password`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to change password');
      setPasswordDialogOpen(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      setAccountActionMessage('Password updated successfully.');
    } catch (err) {
      setAccountActionError(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const openTwoFactorDialog = async () => {
    setTwoFactorDialogOpen(true);
    setTwoFactorCode('');
    setTwoFactorDisablePassword('');
    setAccountActionError('');
    setAccountActionMessage('');
    if (user.two_factor_enabled) return;
    setSavingTwoFactor(true);
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/2fa/setup`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to start two-factor setup');
      setTwoFactorSetup(data);
    } catch (err) {
      setAccountActionError(err.message);
    } finally {
      setSavingTwoFactor(false);
    }
  };

  const enableTwoFactor = async (event) => {
    event.preventDefault();
    setSavingTwoFactor(true);
    setAccountActionError('');
    setAccountActionMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/2fa/enable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: twoFactorCode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to enable two-factor authentication');
      onUserUpdated?.(data);
      setTwoFactorDialogOpen(false);
      setTwoFactorCode('');
      setTwoFactorSetup(null);
      setAccountActionMessage('Two-factor authentication enabled.');
    } catch (err) {
      setAccountActionError(err.message);
    } finally {
      setSavingTwoFactor(false);
    }
  };

  const disableTwoFactor = async (event) => {
    event.preventDefault();
    setSavingTwoFactor(true);
    setAccountActionError('');
    setAccountActionMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/2fa/disable`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: twoFactorDisablePassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to disable two-factor authentication');
      onUserUpdated?.(data);
      setTwoFactorDialogOpen(false);
      setTwoFactorDisablePassword('');
      setTwoFactorSetup(null);
      setAccountActionMessage('Two-factor authentication disabled.');
    } catch (err) {
      setAccountActionError(err.message);
    } finally {
      setSavingTwoFactor(false);
    }
  };

  const courses = summary?.assigned_courses || [];
  const courseCount = courses.length;
  const assignmentCount = courses.reduce((sum, course) => sum + (course.assignments || 0), 0);
  const materialCount = courses.reduce((sum, course) => sum + (course.materials || 0), 0);
  const announcementCount = summary?.announcements?.length || 0;
  const studentCount = summary?.total_students || 0;
  const totalSubmissions = summary?.total_submissions || 0;
  const profileTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const diff = Math.max(0, Math.floor(Date.now() / 1000) - timestamp);
    if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };
  const activityItems = [
    ...(summary?.recent_materials || []).slice(0, 2).map((item) => ({ title: 'New material uploaded', detail: item.title, icon: FolderCopyOutlined, color: '#f05a28', bg: '#fff1ec', when: profileTimeAgo(item.created_at) })),
    ...(summary?.announcements || []).slice(0, 2).map((item) => ({ title: 'Announcement posted', detail: item.title, icon: CampaignOutlined, color: '#16805f', bg: '#e7f7ef', when: profileTimeAgo(item.created_at) })),
    ...(summary?.recent_activity || []).slice(0, 2).map((item) => ({ title: 'Student submitted', detail: `${item.student_name} submitted ${item.assignment_title}`, icon: AssignmentOutlined, color: '#8b5cf6', bg: '#f1e9ff', when: profileTimeAgo(item.submitted_at) })),
  ].slice(0, 4);
  const engagement = summary?.engagement || [];
  const engagementMax = Math.max(1, ...engagement.map((item) => item.submissions || 0));
  const engagementPoints = engagement.length
    ? engagement.map((item, index) => `${engagement.length === 1 ? 50 : (index / (engagement.length - 1)) * 100},${82 - ((item.submissions || 0) / engagementMax) * 58}`).join(' ')
    : '0,80 100,80';
  const cardSx = { border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, bgcolor: '#fff', boxShadow: '0 14px 36px rgba(18,60,105,0.06)' };
  const memberSince = user.created_at ? formatTimestamp(user.created_at, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set';
  const personalInfoRows = [
    ['Full Name', user.full_name || 'Teacher', PersonOutlineOutlined],
    ['Email Address', user.email || 'Not set', EmailOutlined],
    ['Phone Number', user.phone || 'Not provided', PhoneOutlined],
    ['Role', 'Teacher', SchoolOutlined],
    ['Status', user.is_active ? 'Active' : 'Inactive', ShieldOutlined, true],
    ['Member Since', memberSince, CalendarTodayOutlined],
  ];

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 56, height: 56, borderRadius: 1.5, bgcolor: '#fff1ec', color: '#f05a28', display: 'grid', placeItems: 'center' }}><PersonOutlineOutlined /></Box>
          <Box>
            <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.5 }}>Instructor Profile</Typography>
            <Typography sx={{ color: '#637083' }}>Manage your instructor identity and platform preferences.</Typography>
          </Box>
        </Stack>
        <Button variant="outlined" component="label" startIcon={<EditOutlined />} disabled={uploadingPhoto}>
          {uploadingPhoto ? 'Uploading...' : 'Change photo'}
          <Box component="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={uploadProfilePhoto} />
        </Button>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '340px minmax(0, 1fr) 340px' }, gap: 2, alignItems: 'start' }}>
        <Stack spacing={2}>
          <Box sx={{ ...cardSx, overflow: 'hidden' }}>
            <Box sx={{ height: 138, background: 'radial-gradient(circle at 20% 90%, #fff 0 30%, transparent 31%), radial-gradient(circle at 82% 92%, #fff 0 36%, transparent 37%), linear-gradient(135deg, #fff1ec, #ffffff 58%, #f8fbff)', borderBottom: '1px solid rgba(18,60,105,0.08)' }} />
            <Stack alignItems="center" spacing={1.1} sx={{ px: 2, pb: 2.2, mt: -7 }}>
              <Box sx={{ position: 'relative' }}>
                <UserAvatar user={user} size={112} />
                <Box sx={{ position: 'absolute', right: 8, bottom: 10, width: 20, height: 20, borderRadius: '50%', bgcolor: user.is_active ? '#19b66a' : '#94a3b8', border: '3px solid #fff' }} />
                <IconButton component="label" size="small" disabled={uploadingPhoto} sx={{ position: 'absolute', right: -3, bottom: 38, bgcolor: '#fff', color: 'primary.main', border: '1px solid rgba(18,60,105,0.14)', boxShadow: '0 8px 20px rgba(18,60,105,0.12)', '&:hover': { bgcolor: '#eef3f8' } }}>
                  <EditOutlined sx={{ fontSize: 15 }} />
                  <Box component="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={uploadProfilePhoto} />
                </IconButton>
              </Box>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.7rem', lineHeight: 1 }}>{user.full_name}</Typography>
              <Chip label={user.is_active ? 'Active Instructor' : 'Inactive'} size="small" sx={{ bgcolor: user.is_active ? '#e7f7ef' : '#eef3f8', color: user.is_active ? '#16805f' : '#526273', fontWeight: 850 }} />
              <Typography sx={{ color: '#637083', fontSize: 13 }}>{user.email}</Typography>
            </Stack>
            <Divider />
            <Stack spacing={1.25} sx={{ p: 2 }}>
              {[['Role', 'Teacher', SchoolOutlined], ['Phone', user.phone || 'Not provided', PhoneOutlined], ['Member since', user.created_at ? formatTimestamp(user.created_at, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set', CalendarTodayOutlined]].map(([label, value, Icon]) => (
                <Stack key={label} direction="row" spacing={1.2} alignItems="center"><Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#eef3f8', color: '#123c69', display: 'grid', placeItems: 'center' }}><Icon fontSize="small" /></Box><Box><Typography sx={{ color: '#637083', fontSize: 12 }}>{label}</Typography><Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>{value}</Typography></Box></Stack>
              ))}
            </Stack>
          </Box>
          <Box sx={{ ...cardSx, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 0.4 }}>Account Settings</Typography>
            <Typography sx={{ color: '#637083', fontSize: 13, mb: 1.4 }}>Manage account access and security.</Typography>
            {accountActionMessage && <Alert severity="success" sx={{ mb: 1.2 }}>{accountActionMessage}</Alert>}
            {accountActionError && <Alert severity="error" sx={{ mb: 1.2 }}>{accountActionError}</Alert>}
            <Stack spacing={0.5}>
              {[
                { label: 'Change Password', detail: 'Update your account password', icon: LockOutlined, onClick: () => setPasswordDialogOpen(true), actionLabel: 'Update' },
                { label: 'Profile Photo', detail: uploadingPhoto ? 'Uploading...' : 'Upload a new photo', icon: PersonOutlineOutlined, fileHandler: uploadProfilePhoto, actionLabel: 'Upload' },
                { label: 'Two-Factor Authentication', detail: user.two_factor_enabled ? 'Authenticator enabled' : 'Add an extra layer of security', icon: ShieldOutlined, onClick: openTwoFactorDialog, actionLabel: user.two_factor_enabled ? 'Enabled' : 'Set up' },
              ].map((setting) => {
                const Icon = setting.icon;
                return (
                  <Stack
                    key={setting.label}
                    component={setting.fileHandler ? 'label' : 'button'}
                    type={setting.fileHandler ? undefined : 'button'}
                    onClick={setting.onClick || undefined}
                    direction="row"
                    alignItems="center"
                    spacing={1.2}
                    disabled={uploadingPhoto && Boolean(setting.fileHandler)}
                    sx={{
                      border: 0,
                      width: '100%',
                      bgcolor: 'transparent',
                      textAlign: 'left',
                      py: 1,
                      px: 0.6,
                      mx: -0.6,
                      borderRadius: 1,
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#f6f9fc' },
                    }}
                  >
                    <Box sx={{ width: 38, height: 38, borderRadius: 1, bgcolor: setting.label === 'Change Password' ? '#fff2df' : setting.label === 'Two-Factor Authentication' ? '#e8f7ef' : '#eaf2ff', color: setting.label === 'Change Password' ? '#e86a00' : setting.label === 'Two-Factor Authentication' ? '#16805f' : '#1b6ef3', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon fontSize="small" />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{setting.label}</Typography>
                      <Typography noWrap sx={{ color: '#637083', fontSize: 11.5 }}>{setting.detail}</Typography>
                    </Box>
                    <Chip
                      label={setting.actionLabel}
                      size="small"
                      sx={{
                        bgcolor: setting.label === 'Two-Factor Authentication' && user.two_factor_enabled ? '#e5f6ed' : '#eaf2ff',
                        color: setting.label === 'Two-Factor Authentication' && user.two_factor_enabled ? '#16805f' : '#1b6ef3',
                        fontWeight: 850,
                        height: 22,
                      }}
                    />
                    {setting.fileHandler && <Box component="input" type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={setting.fileHandler} disabled={uploadingPhoto} />}
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        </Stack>

        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Box sx={{ ...cardSx, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1.4 }}>Personal Information</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, columnGap: 3, rowGap: 0.6 }}>
              {personalInfoRows.map(([label, value, Icon, chip]) => (
                <Stack key={label} direction="row" spacing={1.2} alignItems="center" sx={{ py: 1.1, borderBottom: '1px solid rgba(18,60,105,0.08)' }}>
                  <Box sx={{ width: 34, height: 34, borderRadius: 1, bgcolor: '#f3f7fb', color: 'primary.dark', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Icon fontSize="small" />
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ color: '#637083', fontSize: 12 }}>{label}</Typography>
                    {chip ? (
                      <Chip label={value} size="small" sx={{ mt: 0.2, bgcolor: value === 'Active' ? '#e5f6ed' : '#eef3f8', color: value === 'Active' ? '#16805f' : '#526273', fontWeight: 850 }} />
                    ) : (
                      <Typography noWrap sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 13.5 }}>{value}</Typography>
                    )}
                  </Box>
                </Stack>
              ))}
            </Box>
          </Box>

          <Box sx={{ ...cardSx, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1.5 }}>Instructor Workspace</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 1.2 }}>
              {[
                ['Courses', courseCount, 'View all courses', MenuBookOutlined, 'my-courses'],
                ['Assignments', assignmentCount, 'Create & manage', AssignmentOutlined, 'assignments'],
                ['Materials', materialCount, 'Upload & organize', InsertDriveFileOutlined, 'materials'],
                ['Announcements', announcementCount, 'Send updates', CampaignOutlined, 'announcements'],
              ].map(([label, value, detail, Icon, pane]) => (
                <Box key={label} onClick={() => setActivePane?.(pane)} sx={{ p: 1.5, borderRadius: 1.2, bgcolor: '#f8fafc', border: '1px solid rgba(18,60,105,0.08)', cursor: 'pointer', '&:hover': { bgcolor: '#fff1ec', borderColor: 'rgba(240,90,40,0.22)' } }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: '#fff1ec', color: '#f05a28', display: 'grid', placeItems: 'center', mb: 1 }}><Icon fontSize="small" /></Box>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.35rem', lineHeight: 1 }}>{loading ? '-' : value}</Typography>
                  <Typography sx={{ color: '#526273', fontSize: 12.5, fontWeight: 850 }}>{label}</Typography>
                  <Typography sx={{ color: 'primary.dark', fontSize: 12, mt: 0.6 }}>{detail}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Stack>

        <Stack spacing={2}>
          <Box sx={{ ...cardSx, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1.2 }}>Teaching Summary</Typography>
            {[['Courses', courseCount, MenuBookOutlined], ['Total Students', studentCount, GroupOutlined], ['Assignments', assignmentCount, AssignmentOutlined], ['Submissions', totalSubmissions, InsertDriveFileOutlined], ['Materials', materialCount, ArticleOutlined]].map(([label, value, Icon]) => (
              <Stack key={label} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.05, borderBottom: '1px solid rgba(18,60,105,0.08)' }}><Stack direction="row" spacing={1.1} alignItems="center"><Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: '#eef3f8', color: '#2678f3', display: 'grid', placeItems: 'center' }}><Icon fontSize="small" /></Box><Typography sx={{ color: '#526273', fontSize: 13 }}>{label}</Typography></Stack><Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>{loading ? '-' : value}</Typography></Stack>
            ))}
          </Box>
          <Box sx={{ ...cardSx, p: 2 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.2 }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Recent Activity</Typography><Button size="small" onClick={() => setActivePane?.('submissions')}>View all</Button></Stack>
            {loading ? <Stack alignItems="center" sx={{ py: 2 }}><CircularProgress size={22} /></Stack> : <Stack spacing={1}>{activityItems.length === 0 ? <Typography sx={{ color: '#637083', fontSize: 13 }}>No recent activity yet.</Typography> : activityItems.map((activity, index) => {
              const ActivityIcon = activity.icon;
              return <Stack key={`${activity.title}-${index}`} direction="row" spacing={1.1} alignItems="center" sx={{ py: 0.8, borderBottom: '1px solid rgba(18,60,105,0.08)' }}><Box sx={{ width: 38, height: 38, borderRadius: 1, bgcolor: activity.bg, color: activity.color, display: 'grid', placeItems: 'center' }}><ActivityIcon fontSize="small" /></Box><Box sx={{ flex: 1, minWidth: 0 }}><Typography noWrap sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{activity.title}</Typography><Typography noWrap sx={{ color: '#637083', fontSize: 12 }}>{activity.detail}</Typography></Box><Typography sx={{ color: '#637083', fontSize: 11.5, whiteSpace: 'nowrap' }}>{activity.when}</Typography></Stack>;
            })}</Stack>}
          </Box>
        </Stack>
      </Box>

      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Change Password</DialogTitle>
        <DialogContent>
          {accountActionError && <Alert severity="error" sx={{ mb: 1.4 }}>{accountActionError}</Alert>}
          <Stack component="form" id="teacher-change-password-form" onSubmit={changePassword} spacing={1.4} sx={{ pt: 1 }}>
            <TextField
              label="Current password"
              type="password"
              value={passwordForm.current_password}
              onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))}
              required
              autoComplete="current-password"
            />
            <TextField
              label="New password"
              type="password"
              value={passwordForm.new_password}
              onChange={(event) => setPasswordForm((current) => ({ ...current, new_password: event.target.value }))}
              required
              autoComplete="new-password"
              helperText="Use at least 9 characters."
            />
            <TextField
              label="Confirm new password"
              type="password"
              value={passwordForm.confirm_password}
              onChange={(event) => setPasswordForm((current) => ({ ...current, confirm_password: event.target.value }))}
              required
              autoComplete="new-password"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setPasswordDialogOpen(false)} disabled={changingPassword}>Cancel</Button>
          <Button type="submit" form="teacher-change-password-form" variant="contained" color="secondary" disabled={changingPassword}>
            {changingPassword ? 'Updating...' : 'Update password'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={twoFactorDialogOpen} onClose={() => setTwoFactorDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ color: 'primary.dark', fontWeight: 950 }}>Two-Factor Authentication</DialogTitle>
        <DialogContent>
          {accountActionError && <Alert severity="error" sx={{ mb: 1.4 }}>{accountActionError}</Alert>}
          {user.two_factor_enabled ? (
            <Stack component="form" id="teacher-disable-2fa-form" onSubmit={disableTwoFactor} spacing={1.5} sx={{ pt: 1 }}>
              <Alert severity="success">Two-factor authentication is currently enabled for this teacher account.</Alert>
              <Typography sx={{ color: '#526273', fontSize: 14 }}>To disable it, confirm your current password.</Typography>
              <TextField
                label="Current password"
                type="password"
                value={twoFactorDisablePassword}
                onChange={(event) => setTwoFactorDisablePassword(event.target.value)}
                required
                autoComplete="current-password"
              />
            </Stack>
          ) : (
            <Stack component="form" id="teacher-enable-2fa-form" onSubmit={enableTwoFactor} spacing={1.5} sx={{ pt: 1 }}>
              <Typography sx={{ color: '#526273', fontSize: 14 }}>
                Add this account to Google Authenticator, then enter the 6-digit code to finish setup.
              </Typography>
              {savingTwoFactor && !twoFactorSetup ? (
                <Stack alignItems="center" sx={{ py: 3 }}><CircularProgress size={26} /></Stack>
              ) : twoFactorSetup && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '160px 1fr' }, gap: 2, alignItems: 'center' }}>
                  <Box
                    component="img"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(twoFactorSetup.otpauth_url)}`}
                    alt="Authenticator setup QR code"
                    sx={{ width: 160, height: 160, borderRadius: 1, border: '1px solid rgba(18,60,105,0.12)', bgcolor: '#fff' }}
                  />
                  <Stack spacing={1}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 850, fontSize: 14 }}>Manual setup key</Typography>
                    <Box sx={{ bgcolor: '#f3f7fb', border: '1px solid rgba(18,60,105,0.1)', borderRadius: 1, p: 1.2, color: 'primary.dark', fontWeight: 850, overflowWrap: 'anywhere', fontSize: 13 }}>
                      {twoFactorSetup.secret}
                    </Box>
                    <Typography sx={{ color: '#637083', fontSize: 12 }}>
                      If the QR code does not load, enter this key manually in Google Authenticator.
                    </Typography>
                  </Stack>
                </Box>
              )}
              <TextField
                label="6-digit authenticator code"
                value={twoFactorCode}
                onChange={(event) => setTwoFactorCode(event.target.value)}
                required
                inputProps={{ inputMode: 'numeric', maxLength: 8 }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setTwoFactorDialogOpen(false)} disabled={savingTwoFactor}>Cancel</Button>
          {user.two_factor_enabled ? (
            <Button type="submit" form="teacher-disable-2fa-form" variant="contained" color="error" disabled={savingTwoFactor}>
              {savingTwoFactor ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          ) : (
            <Button type="submit" form="teacher-enable-2fa-form" variant="contained" color="secondary" disabled={savingTwoFactor || !twoFactorSetup}>
              {savingTwoFactor ? 'Saving...' : 'Enable 2FA'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function TeacherPortal({ user, onSignOut, onUserUpdated }) {
  const [activePane, setActivePane] = React.useState('dashboard');
  const [paneContext, setPaneContext] = React.useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [notificationAnchor, setNotificationAnchor] = React.useState(null);
  const [notificationSummary, setNotificationSummary] = React.useState(null);
  const [teacherToast, setTeacherToast] = React.useState(null);
  const notificationStorageKey = `three13_teacher_read_notifications_${user?.id || user?.email || 'teacher'}`;
  const [readNotificationIds, setReadNotificationIds] = React.useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(notificationStorageKey) || '[]');
    } catch {
      return [];
    }
  });
  const activeItem = teacherNavItems.find((item) => item.key === activePane) || teacherNavItems[0];

  React.useEffect(() => {
    try {
      setReadNotificationIds(JSON.parse(window.localStorage.getItem(notificationStorageKey) || '[]'));
    } catch {
      setReadNotificationIds([]);
    }
  }, [notificationStorageKey]);

  const updateReadNotifications = React.useCallback((ids) => {
    const uniqueIds = Array.from(new Set(ids));
    setReadNotificationIds(uniqueIds);
    try {
      window.localStorage.setItem(notificationStorageKey, JSON.stringify(uniqueIds));
    } catch {
      // Notification read state is a convenience; ignore storage failures.
    }
  }, [notificationStorageKey]);

  const loadTeacherNotifications = React.useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/dashboard-summary`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (response.ok) {
        setNotificationSummary(data);
      }
    } catch {
      setNotificationSummary(null);
    }
  }, []);

  React.useEffect(() => {
    loadTeacherNotifications();
    const refreshId = window.setInterval(loadTeacherNotifications, 60000);
    return () => window.clearInterval(refreshId);
  }, [loadTeacherNotifications]);

  const teacherNotifications = React.useMemo(() => {
    const submissions = (notificationSummary?.recent_activity || []).filter((item) => !item.type || item.type === 'submission').map((item) => ({
      id: `submission-${item.submission_id}`,
      title: 'Assignment submitted',
      detail: `${item.student_name || 'A student'} submitted "${item.assignment_title || 'an assignment'}"`,
      meta: item.course_title || 'Submissions',
      created_at: item.submitted_at,
      pane: 'submissions',
      icon: AssignmentOutlined,
      bg: '#e7f7ef',
      color: '#16805f',
    }));
    const teacherActions = (notificationSummary?.recent_activity || [])
      .filter((item) => ['assignment', 'material', 'module'].includes(item.type))
      .map((item) => {
        const notificationMeta = [item.course_title || item.course, item.location].filter(Boolean).join(' | ');
        const typeConfig = {
          assignment: {
            icon: AssignmentOutlined,
            bg: '#fff1ec',
            color: '#f05a28',
          },
          material: {
            icon: InsertDriveFileOutlined,
            bg: '#eaf3ff',
            color: '#2563eb',
          },
          module: {
            icon: ViewModuleOutlined,
            bg: '#f4ecff',
            color: '#7a4fe8',
          },
        };
        const config = typeConfig[item.type] || typeConfig.material;
        return {
          id: item.id || `${item.type}-${item.target_id || item.created_at}`,
          title: item.title || 'Course activity',
          detail: item.detail || 'Course content was updated',
          meta: notificationMeta || 'Course activity',
          created_at: item.created_at,
          pane: item.pane || (item.type === 'assignment' ? 'assignments' : 'materials'),
          icon: config.icon,
          bg: config.bg,
          color: config.color,
        };
      });
    const announcements = (notificationSummary?.announcements || []).map((item) => ({
      id: `announcement-${item.id}`,
      title: item.is_urgent ? 'Urgent announcement' : 'Announcement posted',
      detail: item.title || 'New announcement',
      meta: item.course_title || 'All courses',
      created_at: item.created_at,
      pane: 'announcements',
      icon: CampaignOutlined,
      bg: item.is_urgent ? '#ffe8e8' : '#fff1ec',
      color: item.is_urgent ? '#dc2626' : '#f05a28',
    }));
    const deadlines = (notificationSummary?.upcoming_assignments || []).map((item) => ({
      id: `deadline-${item.id}`,
      title: 'Upcoming deadline',
      detail: item.title || 'Assignment deadline',
      meta: item.course_title || 'Assignments',
      created_at: item.due_at || item.created_at,
      pane: 'assignments',
      icon: CalendarTodayOutlined,
      bg: '#f4ecff',
      color: '#7a4fe8',
    }));

    return [...submissions, ...teacherActions, ...announcements, ...deadlines]
      .filter((notification) => notification.id)
      .sort((first, second) => (second.created_at || 0) - (first.created_at || 0))
      .slice(0, 12);
  }, [notificationSummary]);

  const unreadTeacherNotifications = teacherNotifications.filter((notification) => !readNotificationIds.includes(notification.id));

  const openTeacherNotification = (notification) => {
    if (!notification?.id) return;
    updateReadNotifications([...readNotificationIds, notification.id]);
    if (notification.pane) setActivePane(notification.pane);
    setNotificationAnchor(null);
  };

  const markAllTeacherNotificationsRead = () => {
    updateReadNotifications([
      ...readNotificationIds,
      ...teacherNotifications.map((notification) => notification.id).filter(Boolean),
    ]);
  };

  const showTeacherToast = React.useCallback((text, severity = 'success') => {
    setTeacherToast({ id: Date.now(), text, severity });
  }, []);

  React.useEffect(() => {
    if (!teacherToast) return undefined;
    const timeoutId = window.setTimeout(() => setTeacherToast(null), 3500);
    return () => window.clearTimeout(timeoutId);
  }, [teacherToast]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fb', display: { md: 'grid' }, gridTemplateColumns: { md: '280px 1fr' } }}>
      <Box sx={{ bgcolor: '#082540', color: '#fff', p: { xs: 2, md: 2.5 }, position: { md: 'sticky' }, top: 0, height: { md: '100vh' }, overflowY: 'auto', display: { xs: 'none', md: 'block' } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box component="img" src="/images/logo.png" alt="Three13 IT Solutions" sx={{ height: 52, objectFit: 'contain' }} />
          <Chip label="Teacher" size="small" sx={{ bgcolor: 'rgba(240,90,40,0.16)', color: '#ffd7c8', fontWeight: 800 }} />
        </Stack>
        <Stack spacing={0.8}>
          {teacherNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.key === activePane;
            return (
              <Button
                key={item.key}
                onClick={() => setActivePane(item.key)}
                startIcon={<Icon />}
                sx={{
                  justifyContent: 'flex-start',
                  color: active ? '#fff' : 'rgba(255,255,255,0.76)',
                  bgcolor: active ? 'rgba(240,90,40,0.95)' : 'transparent',
                  border: active ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
                  px: 1.4,
                  py: 1,
                  '&:hover': { bgcolor: active ? '#f05a28' : 'rgba(255,255,255,0.08)', color: '#fff' },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
      </Box>
      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{ sx: { width: 286, bgcolor: '#082540', color: '#fff', p: 2 } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Box component="img" src="/images/logo.png" alt="Three13 IT Solutions" sx={{ height: 52, objectFit: 'contain' }} />
          <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#fff' }}><CloseOutlined /></IconButton>
        </Stack>
        <Stack spacing={0.8}>
          {teacherNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.key === activePane;
            return (
              <Button
                key={item.key}
                onClick={() => {
                  setActivePane(item.key);
                  setMobileMenuOpen(false);
                }}
                startIcon={<Icon />}
                sx={{
                  justifyContent: 'flex-start',
                  color: active ? '#fff' : 'rgba(255,255,255,0.76)',
                  bgcolor: active ? 'rgba(240,90,40,0.95)' : 'transparent',
                  border: active ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent',
                  borderRadius: 1,
                  px: 1.4,
                  py: 1,
                  '&:hover': { bgcolor: active ? '#f05a28' : 'rgba(255,255,255,0.08)', color: '#fff' },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
      </Drawer>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid rgba(18,60,105,0.12)', px: { xs: 2, md: 4 }, py: 2, position: 'sticky', top: 0, zIndex: 1200, boxShadow: '0 8px 24px rgba(18,60,105,0.04)' }}>
          <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', lg: 'center' }} spacing={1.5}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <UserAvatar user={user} size={42} />
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{user.full_name}</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13 }}>{user.email}</Typography>
              </Box>
            </Stack>
            <Box sx={{ width: { xs: '100%', md: 360, lg: 420 }, minHeight: 46, display: 'flex', alignItems: 'center' }}>
              {teacherToast ? (
                <Alert
                  key={teacherToast.id}
                  severity={teacherToast.severity}
                  onClose={() => setTeacherToast(null)}
                  sx={{
                    width: '100%',
                    py: 0.25,
                    borderRadius: 999,
                    alignItems: 'center',
                    boxShadow: '0 10px 28px rgba(18,60,105,0.10)',
                    '& .MuiAlert-message': {
                      py: 0.7,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: 750,
                    },
                  }}
                >
                  {teacherToast.text}
                </Alert>
              ) : (
                <Box sx={{ width: '100%', px: 2, py: 1.1, border: '1px solid rgba(18,60,105,0.12)', borderRadius: 999, bgcolor: '#f8fafc', color: '#637083', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                  <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Platform alerts will appear here.
                  </Box>
                </Box>
              )}
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                sx={{ display: { xs: 'inline-flex', md: 'none' }, border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, color: 'primary.dark' }}
                aria-label="Open menu"
              >
                <MenuOutlined />
              </IconButton>
              <IconButton onClick={(event) => setNotificationAnchor(event.currentTarget)} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5 }}>
                <Badge badgeContent={unreadTeacherNotifications.length || null} color="secondary" max={99}>
                  <NotificationsOutlined sx={{ color: 'primary.dark' }} />
                </Badge>
              </IconButton>
              <Button component={RouterLink} to="/" variant="outlined">Home</Button>
              <Button variant="contained" color="secondary" onClick={onSignOut}>Sign out</Button>
            </Stack>
          </Stack>
          <Popover
            open={Boolean(notificationAnchor)}
            anchorEl={notificationAnchor}
            onClose={() => setNotificationAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { width: 370, maxWidth: 'calc(100vw - 32px)', borderRadius: 1.5, mt: 1, boxShadow: '0 18px 48px rgba(18,60,105,0.18)' } }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid #eef3f8' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                <Box>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Teacher Notifications</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 12 }}>{unreadTeacherNotifications.length} unread update{unreadTeacherNotifications.length === 1 ? '' : 's'}.</Typography>
                </Box>
                {unreadTeacherNotifications.length > 0 && (
                  <Button size="small" variant="text" onClick={markAllTeacherNotificationsRead}>
                    Mark all read
                  </Button>
                )}
              </Stack>
            </Box>
            <Stack sx={{ maxHeight: 390, overflowY: 'auto' }}>
              {unreadTeacherNotifications.length === 0 ? (
                <Typography sx={{ color: '#637083', fontSize: 14, p: 2 }}>No unread notifications.</Typography>
              ) : unreadTeacherNotifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <Box
                    key={notification.id}
                    onClick={() => openTeacherNotification(notification)}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '42px minmax(0, 1fr) 8px',
                      gap: 1.2,
                      alignItems: 'center',
                      px: 2,
                      py: 1.3,
                      borderBottom: '1px solid #eef3f8',
                      cursor: 'pointer',
                      bgcolor: '#f8fbff',
                      '&:hover': { bgcolor: '#eef6ff' },
                    }}
                  >
                    <Box sx={{ width: 38, height: 38, borderRadius: 1.2, bgcolor: notification.bg, color: notification.color, display: 'grid', placeItems: 'center' }}>
                      <Icon fontSize="small" />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 950, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notification.title}
                      </Typography>
                      <Typography sx={{ color: '#526273', fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notification.detail}
                      </Typography>
                      <Typography sx={{ color: '#637083', fontSize: 11.5, mt: 0.2 }}>
                        {notification.meta} {notification.created_at ? `| ${formatTimestamp(notification.created_at, { month: 'short', day: 'numeric' })}` : ''}
                      </Typography>
                    </Box>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f05a28' }} />
                  </Box>
                );
              })}
            </Stack>
          </Popover>
        </Box>
        <Box component="main" sx={{ px: { xs: 2, md: 2.5, xl: 4 }, py: { xs: 3, md: 3, xl: 4 } }}>
          {activePane === 'dashboard' && <TeacherDashboardHome setActivePane={setActivePane} user={user} onTeacherToast={showTeacherToast} />}
          {activePane === 'my-courses' && <TeacherCourseWorkspace focus="courses" setActivePane={setActivePane} onTeacherToast={showTeacherToast} />}
          {activePane === 'materials' && <AdminCourseMaterialsPane scope="teacher" initialCourseId={paneContext.courseId || ''} onAdminToast={showTeacherToast} />}
          {activePane === 'assignments' && (
            <AdminAssignmentsPane
              scope="teacher"
              onAdminToast={showTeacherToast}
              onOpenMaterials={(courseId) => {
                setPaneContext({ courseId: courseId ? String(courseId) : '' });
                setActivePane('materials');
              }}
            />
          )}
          {activePane === 'submissions' && <TeacherSubmissionsPane onTeacherToast={showTeacherToast} />}
          {activePane === 'announcements' && <AdminAnnouncementsPane scope="teacher" onAdminToast={showTeacherToast} />}
          {activePane === 'students' && <TeacherStudentsPane onTeacherToast={showTeacherToast} />}
          {activePane === 'community' && <TeacherCommunityPane />}
          {activePane === 'support' && <StudentSupportPane user={user} supportRole="teacher" />}
          {activePane === 'profile' && <TeacherProfilePane user={user} setActivePane={setActivePane} onTeacherToast={showTeacherToast} onUserUpdated={onUserUpdated} />}
          {!['dashboard', 'my-courses', 'materials', 'assignments', 'submissions', 'announcements', 'students', 'community', 'support', 'profile'].includes(activePane) && <StudentPlaceholderPane item={activeItem} />}
        </Box>
      </Box>
    </Box>
  );
}

function StudentPortal({ user, onSignOut, onUserUpdated, initialPane = 'dashboard' }) {
  const isAlumni = user?.lifecycle_status === 'alumni';
  const isPendingStudent = !isAlumni && !user?.is_active;
  const learnerLabel = isAlumni ? 'Alumni' : 'Student';
  const storageUserKey = user?.id || user?.email || 'student';
  const activePaneStorageKey = `three13_student_active_pane_${storageUserKey}`;
  const selectedCourseStorageKey = `three13_student_selected_course_${storageUserKey}`;
  const initialSelectedCourseId = (() => {
    try {
      return window.localStorage.getItem(selectedCourseStorageKey) || '';
    } catch {
      return '';
    }
  })();
  const requestedInitialPane = studentPaneKeys.includes(initialPane) ? initialPane : 'dashboard';
  const resolvedInitialPane = isAlumni ? 'community' : (isPendingStudent && requestedInitialPane === 'community' ? 'dashboard' : requestedInitialPane);
  const initialCourseSectionActive = ['my-courses', ...studentCourseNavItems.map((item) => item.key)].includes(resolvedInitialPane);
  const [activePane, setActivePane] = React.useState(resolvedInitialPane);
  const [courseNavOpen, setCourseNavOpen] = React.useState(initialCourseSectionActive);
  const [sidebarCourses, setSidebarCourses] = React.useState([]);
  const [expandedCourseId, setExpandedCourseId] = React.useState(initialSelectedCourseId);
  const [selectedSidebarCourseId, setSelectedSidebarCourseId] = React.useState(initialSelectedCourseId);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = React.useState(null);
  const [notificationAnchor, setNotificationAnchor] = React.useState(null);
  const [notificationAnnouncements, setNotificationAnnouncements] = React.useState([]);
  const [readStudentNotificationIds, setReadStudentNotificationIds] = React.useState([]);
  const [notificationsLoading, setNotificationsLoading] = React.useState(false);
  const activeItem = [...studentNavItems, ...studentCourseNavItems].find((item) => item.key === activePane) || studentNavItems[0];
  const courseSectionActive = ['my-courses', ...studentCourseNavItems.map((item) => item.key)].includes(activePane);
  const studentNotificationStorageKey = `three13_student_read_notifications_${storageUserKey}`;
  const studentNotificationIconMap = {
    announcement: { icon: CampaignOutlined, bg: '#fff1ec', color: '#f05a28' },
    assignment: { icon: AssignmentOutlined, bg: '#fff1ec', color: '#f05a28' },
    module: { icon: ViewModuleOutlined, bg: '#f4ecff', color: '#7a4fe8' },
    material: { icon: InsertDriveFileOutlined, bg: '#eaf3ff', color: '#2563eb' },
    certificate: { icon: VerifiedOutlined, bg: '#e7f7ef', color: '#16805f' },
    support: { icon: SupportAgentOutlined, bg: '#eaf3ff', color: '#2563eb' },
  };
  const unreadNotifications = notificationAnnouncements.filter((notification) => !notification.is_read && !readStudentNotificationIds.includes(notification.id));
  const latestNotifications = unreadNotifications.slice(0, 5);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(studentNotificationStorageKey);
      setReadStudentNotificationIds(stored ? JSON.parse(stored) : []);
    } catch {
      setReadStudentNotificationIds([]);
    }
  }, [studentNotificationStorageKey]);

  const updateReadStudentNotifications = React.useCallback((ids) => {
    const nextIds = [...new Set(ids.filter(Boolean))];
    setReadStudentNotificationIds(nextIds);
    try {
      window.localStorage.setItem(studentNotificationStorageKey, JSON.stringify(nextIds));
    } catch {
      // Read state should not block the portal if storage is unavailable.
    }
  }, [studentNotificationStorageKey]);

  React.useEffect(() => {
    if (isPendingStudent && activePane === 'community') {
      setActivePane('dashboard');
    }
  }, [activePane, isPendingStudent]);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(activePaneStorageKey, activePane);
    } catch {
      // Navigation persistence is a convenience; ignore storage failures.
    }
  }, [activePane, activePaneStorageKey]);

  React.useEffect(() => {
    if (isAlumni) return undefined;
    try {
      if (selectedSidebarCourseId) {
        window.localStorage.setItem(selectedCourseStorageKey, selectedSidebarCourseId);
      } else {
        window.localStorage.removeItem(selectedCourseStorageKey);
      }
    } catch {
      // Course selection persistence is optional.
    }
  }, [isAlumni, selectedSidebarCourseId, selectedCourseStorageKey]);

  const openStudentCourse = React.useCallback((courseId) => {
    const nextCourseId = String(courseId);
    setCourseNavOpen(true);
    setExpandedCourseId(nextCourseId);
    setSelectedSidebarCourseId(nextCourseId);
    setActivePane('modules');
  }, []);

  React.useEffect(() => {
    if (isAlumni) {
      setSidebarCourses([]);
      return undefined;
    }
    let mounted = true;
    const loadSidebarCourse = async () => {
      try {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/courses`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await response.json();
        if (mounted && response.ok) {
          setSidebarCourses(data);
        }
      } catch {
        // The sidebar can still render its top-level navigation.
      }
    };
    loadSidebarCourse();
    return () => { mounted = false; };
  }, [isAlumni]);

  const loadNotifications = React.useCallback(async () => {
    if (isAlumni) {
      setNotificationAnnouncements([]);
      return;
    }
    setNotificationsLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/notifications`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (response.ok) setNotificationAnnouncements(data);
    } catch {
      // The rest of the dashboard should remain usable if notifications cannot load.
    } finally {
      setNotificationsLoading(false);
    }
  }, [isAlumni]);

  React.useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markNotificationRead = React.useCallback((notificationId) => {
    setNotificationAnnouncements((current) => current.map((notification) => (
      notification.id === notificationId || notification.target_id === notificationId ? { ...notification, is_read: true, read_at: notification.read_at || Math.floor(Date.now() / 1000) } : notification
    )));
  }, []);

  const openStudentPane = React.useCallback((pane) => {
    setActivePane(pane);
    setMobileMenuOpen(false);
  }, []);

  const openNotification = async (notification) => {
    if (!notification?.id) return;
    updateReadStudentNotifications([...readStudentNotificationIds, notification.id]);
    if (notification.kind === 'announcement') {
      setSelectedAnnouncementId(notification.target_id);
    }
    setActivePane(notification.pane || 'dashboard');
    setNotificationAnchor(null);
    markNotificationRead(notification.id);
    if (notification.kind === 'announcement') {
      try {
        await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/announcements/${notification.target_id}/read`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
        });
      } catch {
        // Optimistic UI is enough here; notifications reload on the next session.
      }
    }
  };

  const markAllNotificationsRead = async () => {
    updateReadStudentNotifications([
      ...readStudentNotificationIds,
      ...notificationAnnouncements.map((notification) => notification.id).filter(Boolean),
    ]);
    setNotificationAnnouncements((current) => current.map((notification) => ({
      ...notification,
      is_read: true,
      read_at: notification.read_at || Math.floor(Date.now() / 1000),
    })));
    try {
      await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/announcements/actions/read-all`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
    } catch {
      // Optimistic UI is enough here; notifications reload on the next session.
    }
  };

  const navButtonSx = (active, nested = false) => ({
    justifyContent: 'flex-start',
    color: active ? '#ff7448' : 'rgba(255,255,255,0.78)',
    bgcolor: active ? 'rgba(240,90,40,0.14)' : 'transparent',
    border: active ? '1px solid rgba(240,90,40,0.72)' : '1px solid transparent',
    borderRadius: 1,
    px: nested ? 1.2 : 1.4,
    py: nested ? 0.85 : 1,
    ml: nested ? 8.2 : 0,
    width: nested ? 'calc(100% - 56px)' : '100%',
    minHeight: nested ? 34 : 40,
    fontSize: nested ? 11.5 : 14,
    whiteSpace: 'nowrap',
    '& .MuiButton-startIcon': { mr: nested ? 0.65 : 1, flexShrink: 0 },
    '& .MuiButton-startIcon svg': { fontSize: nested ? 17 : 20 },
    '&:hover': {
      bgcolor: active ? 'rgba(240,90,40,0.2)' : 'rgba(255,255,255,0.08)',
      borderColor: active ? 'rgba(240,90,40,0.86)' : 'transparent',
      color: active ? '#ff7448' : '#fff',
    },
  });

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fb', display: { md: 'grid' }, gridTemplateColumns: { md: '280px 1fr' } }}>
      <Box sx={{ bgcolor: '#082540', color: '#fff', p: { xs: 2, md: 2.5 }, position: { md: 'sticky' }, top: 0, height: { md: '100vh' }, overflowY: 'auto', display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box component="img" src="/images/logo.png" alt="Three13 IT Solutions" sx={{ height: 52, objectFit: 'contain' }} />
          <Chip label={learnerLabel} size="small" sx={{ bgcolor: isAlumni ? 'rgba(124,58,237,0.22)' : 'rgba(240,90,40,0.16)', color: isAlumni ? '#e8ddff' : '#ffd7c8', fontWeight: 800 }} />
        </Stack>

        <Stack spacing={0.8} sx={{ flex: 1 }}>
          {isAlumni ? (
            <>
              <Button
                onClick={() => setActivePane('community')}
                startIcon={<ForumOutlined />}
                sx={navButtonSx(activePane === 'community')}
              >
                Community
              </Button>
              <Button
                onClick={() => setActivePane('profile')}
                startIcon={<PersonOutlineOutlined />}
                sx={navButtonSx(activePane === 'profile')}
              >
                Profile
              </Button>
            </>
          ) : (
          <>
          <Button
            onClick={() => setActivePane('dashboard')}
            startIcon={<DashboardOutlined />}
            sx={navButtonSx(activePane === 'dashboard')}
          >
            Dashboard
          </Button>
          <Button
            onClick={() => {
              setCourseNavOpen((current) => !current);
              if (!courseSectionActive) setActivePane('my-courses');
            }}
            startIcon={<MenuBookOutlined />}
            endIcon={courseNavOpen ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
            sx={{ ...navButtonSx(courseSectionActive), '& .MuiButton-endIcon': { ml: 'auto' } }}
          >
            My Courses
          </Button>
          {courseNavOpen && (
              <Stack spacing={0.7} sx={{ mt: 0.2, mb: 1 }}>
              {sidebarCourses.length === 0 ? (
                <Typography sx={{ ml: 2.2, color: 'rgba(255,255,255,0.62)', fontSize: 12.5 }}>
                  No active courses yet
                </Typography>
              ) : sidebarCourses.map((course) => {
                const courseId = String(course.id);
                const expanded = expandedCourseId === courseId;
                return (
                  <Box key={course.id}>
                    <Button
                      fullWidth
                      onClick={() => {
                        setExpandedCourseId(expanded ? '' : courseId);
                        setSelectedSidebarCourseId(courseId);
                        setActivePane('my-courses');
                      }}
                      endIcon={expanded ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
                      sx={{
                        justifyContent: 'flex-start',
                        color: '#fff',
                        px: 0.8,
                        py: 0.65,
                        ml: 1.45,
                        width: 'calc(100% - 12px)',
                        bgcolor: expanded ? 'rgba(255,255,255,0.07)' : 'transparent',
                        '& .MuiButton-endIcon': { ml: 'auto' },
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                      }}
                    >
                      <Stack direction="row" spacing={0.9} alignItems="center" sx={{ minWidth: 0 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f05a28', flexShrink: 0 }} />
                        <Typography noWrap sx={{ fontWeight: 850, fontSize: 12.5 }}>
                          {course.title}
                        </Typography>
                      </Stack>
                    </Button>
                    {expanded && (
                      <Stack spacing={0.45} sx={{ mt: 0.35, mb: 0.7, pl: 2.4 }}>
                        {studentCourseNavItems.map((item) => {
                          const Icon = item.icon;
                          const active = item.key === activePane;
                          return (
                            <Button
                              key={`${course.id}-${item.key}`}
                              onClick={() => {
                                setSelectedSidebarCourseId(courseId);
                                setActivePane(item.key);
                              }}
                              startIcon={<Icon />}
                              sx={navButtonSx(active, true)}
                            >
                              {item.label}
                            </Button>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>
                );
              })}
            </Stack>
          )}
          {studentNavItems.filter((item) => !['dashboard', 'my-courses'].includes(item.key) && !(isPendingStudent && item.key === 'community')).map((item) => {
            const Icon = item.icon;
            const active = item.key === activePane;
            return (
              <Button
                key={item.key}
                onClick={() => {
                  setActivePane(item.key);
                }}
                startIcon={<Icon />}
                sx={{ ...navButtonSx(active), mt: item.key === 'announcements' ? 1.2 : 0 }}
              >
                {item.label}
              </Button>
            );
          })}
          </>
          )}
          <Box sx={{ flex: 1 }} />
          <Box sx={{ pt: 3, color: 'rgba(255,255,255,0.58)', fontSize: 12 }}>
            <Typography sx={{ fontSize: 12 }}>© 2026 Three13</Typography>
            <Typography sx={{ fontSize: 12 }}>All rights reserved</Typography>
          </Box>
        </Stack>
      </Box>
      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{ sx: { width: 306, bgcolor: '#082540', color: '#fff', p: 2 } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Box component="img" src="/images/logo.png" alt="Three13 IT Solutions" sx={{ height: 52, objectFit: 'contain' }} />
          <IconButton onClick={() => setMobileMenuOpen(false)} sx={{ color: '#fff' }}><CloseOutlined /></IconButton>
        </Stack>
        <Stack spacing={0.8} sx={{ flex: 1 }}>
          {isAlumni ? (
            <>
              <Button onClick={() => openStudentPane('community')} startIcon={<ForumOutlined />} sx={navButtonSx(activePane === 'community')}>
                Community
              </Button>
              <Button onClick={() => openStudentPane('profile')} startIcon={<PersonOutlineOutlined />} sx={navButtonSx(activePane === 'profile')}>
                Profile
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => openStudentPane('dashboard')} startIcon={<DashboardOutlined />} sx={navButtonSx(activePane === 'dashboard')}>
                Dashboard
              </Button>
              <Button
                onClick={() => {
                  setCourseNavOpen((current) => !current);
                  if (!courseSectionActive) setActivePane('my-courses');
                }}
                startIcon={<MenuBookOutlined />}
                endIcon={courseNavOpen ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
                sx={{ ...navButtonSx(courseSectionActive), '& .MuiButton-endIcon': { ml: 'auto' } }}
              >
                My Courses
              </Button>
              {courseNavOpen && (
                <Stack spacing={0.7} sx={{ mt: 0.2, mb: 1 }}>
                  {sidebarCourses.length === 0 ? (
                    <Typography sx={{ ml: 2.2, color: 'rgba(255,255,255,0.62)', fontSize: 12.5 }}>No active courses yet</Typography>
                  ) : sidebarCourses.map((course) => {
                    const courseId = String(course.id);
                    const expanded = expandedCourseId === courseId;
                    return (
                      <Box key={course.id}>
                        <Button
                          fullWidth
                          onClick={() => {
                            setExpandedCourseId(expanded ? '' : courseId);
                            setSelectedSidebarCourseId(courseId);
                            setActivePane('my-courses');
                          }}
                          endIcon={expanded ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
                          sx={{
                            justifyContent: 'flex-start',
                            color: '#fff',
                            px: 0.8,
                            py: 0.65,
                            ml: 1.45,
                            width: 'calc(100% - 12px)',
                            bgcolor: expanded ? 'rgba(255,255,255,0.07)' : 'transparent',
                            '& .MuiButton-endIcon': { ml: 'auto' },
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                          }}
                        >
                          <Stack direction="row" spacing={0.9} alignItems="center" sx={{ minWidth: 0 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f05a28', flexShrink: 0 }} />
                            <Typography noWrap sx={{ fontWeight: 850, fontSize: 12.5 }}>{course.title}</Typography>
                          </Stack>
                        </Button>
                        {expanded && (
                          <Stack spacing={0.45} sx={{ mt: 0.35, mb: 0.7, pl: 2.4 }}>
                            {studentCourseNavItems.map((item) => {
                              const Icon = item.icon;
                              const active = item.key === activePane;
                              return (
                                <Button
                                  key={`${course.id}-${item.key}-mobile`}
                                  onClick={() => {
                                    setSelectedSidebarCourseId(courseId);
                                    openStudentPane(item.key);
                                  }}
                                  startIcon={<Icon />}
                                  sx={navButtonSx(active, true)}
                                >
                                  {item.label}
                                </Button>
                              );
                            })}
                          </Stack>
                        )}
                      </Box>
                    );
                  })}
                </Stack>
              )}
              {studentNavItems.filter((item) => !['dashboard', 'my-courses'].includes(item.key) && !(isPendingStudent && item.key === 'community')).map((item) => {
                const Icon = item.icon;
                const active = item.key === activePane;
                return (
                  <Button key={`${item.key}-mobile`} onClick={() => openStudentPane(item.key)} startIcon={<Icon />} sx={{ ...navButtonSx(active), mt: item.key === 'announcements' ? 1.2 : 0 }}>
                    {item.label}
                  </Button>
                );
              })}
            </>
          )}
        </Stack>
      </Drawer>

      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid rgba(18,60,105,0.12)', px: { xs: 2, md: 4 }, py: 2, position: 'sticky', top: 0, zIndex: 1200, boxShadow: '0 8px 24px rgba(18,60,105,0.04)' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <UserAvatar user={user} size={42} />
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{user.full_name}</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13 }}>{user.email}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 'max-content' }}>
              <IconButton
                onClick={() => setMobileMenuOpen(true)}
                sx={{
                  display: { xs: 'inline-flex', md: 'none' },
                  width: 46,
                  height: 46,
                  color: 'primary.dark',
                  bgcolor: '#fff',
                  border: '1px solid rgba(18,60,105,0.16)',
                  borderRadius: 1,
                  boxShadow: '0 8px 18px rgba(18,60,105,0.06)',
                  '&:hover': { bgcolor: '#f8fbff' },
                }}
                aria-label="Open menu"
              >
                <MenuOutlined />
              </IconButton>
              {!isAlumni && (
                <IconButton
                  onClick={(event) => setNotificationAnchor(event.currentTarget)}
                  aria-label={`${unreadNotifications.length} unread notifications`}
                  sx={{
                    width: 46,
                    height: 46,
                    flex: '0 0 46px',
                    color: 'primary.dark',
                    bgcolor: '#fff',
                    border: '1px solid rgba(18,60,105,0.16)',
                    borderRadius: 1,
                    boxShadow: '0 8px 18px rgba(18,60,105,0.06)',
                    '&:hover': { bgcolor: '#f8fbff' },
                  }}
                >
                  <Badge badgeContent={unreadNotifications.length || null} color="secondary" max={99}>
                    <NotificationsOutlined />
                  </Badge>
                </IconButton>
              )}
              <Button component={RouterLink} to="/" variant="outlined">Home</Button>
              <Button variant="contained" color="secondary" onClick={onSignOut}>Sign out</Button>
            </Stack>
          </Stack>
        </Box>

        <Box component="main" sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
          {!isAlumni && (
          <Popover
            open={Boolean(notificationAnchor)}
            anchorEl={notificationAnchor}
            onClose={() => setNotificationAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { width: { xs: 320, sm: 380 }, mt: 1, borderRadius: 1.5, boxShadow: '0 22px 60px rgba(18,60,105,0.18)' } }}
          >
            <Box sx={{ p: 1.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Box>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>Notifications</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 12 }}>{unreadNotifications.length} unread update{unreadNotifications.length === 1 ? '' : 's'}</Typography>
                </Box>
                {unreadNotifications.length > 0 && (
                  <Button size="small" variant="text" onClick={markAllNotificationsRead}>
                    Mark all read
                  </Button>
                )}
              </Stack>
              <Divider sx={{ mb: 1 }} />
              {notificationsLoading ? (
                <Stack alignItems="center" sx={{ py: 3 }}><CircularProgress size={22} /></Stack>
              ) : latestNotifications.length === 0 ? (
                <Typography sx={{ color: '#637083', fontSize: 13, py: 2 }}>No notifications yet.</Typography>
              ) : (
                <Stack spacing={0.7}>
                  {latestNotifications.map((notification) => {
                    const config = studentNotificationIconMap[notification.kind] || studentNotificationIconMap.announcement;
                    const Icon = config.icon;
                    const isRead = notification.is_read || readStudentNotificationIds.includes(notification.id);
                    return (
                      <Box
                        key={notification.id}
                        onClick={() => openNotification(notification)}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '38px minmax(0, 1fr) 8px',
                          gap: 1,
                          alignItems: 'center',
                          p: 1,
                          borderRadius: 1,
                          cursor: 'pointer',
                          bgcolor: isRead ? '#fff' : '#f8fbff',
                          border: '1px solid rgba(18,60,105,0.08)',
                          '&:hover': { bgcolor: '#eef6ff' },
                        }}
                      >
                        <Box sx={{ width: 36, height: 36, borderRadius: 1.2, bgcolor: config.bg, color: config.color, display: 'grid', placeItems: 'center' }}>
                          <Icon fontSize="small" />
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: 'primary.dark', fontWeight: isRead ? 750 : 950, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {notification.title}
                          </Typography>
                          <Typography sx={{ color: '#526273', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {notification.detail}
                          </Typography>
                          <Typography sx={{ color: '#637083', fontSize: 11.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {notification.meta || 'Platform'} {notification.created_at ? `| ${formatTimestamp(notification.created_at, { month: 'short', day: 'numeric' })}` : ''}
                          </Typography>
                        </Box>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: isRead ? '#cbd5e1' : '#f05a28' }} />
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Popover>
          )}
          {isAlumni ? (
            activePane === 'profile' ? <AlumniProfilePane user={user} onUserUpdated={onUserUpdated} /> : <StudentCommunityPane />
          ) : (
          <>
          {activePane === 'dashboard' && <StudentDashboardHome setActivePane={setActivePane} user={user} onOpenCourse={openStudentCourse} />}
          {activePane === 'my-courses' && <StudentMyCoursesPane setActivePane={setActivePane} user={user} onOpenCourse={openStudentCourse} />}
          {activePane === 'modules' && <StudentModulesPane selectedCourseId={selectedSidebarCourseId} setActivePane={setActivePane} />}
          {activePane === 'materials' && <StudentMaterialsPane selectedCourseId={selectedSidebarCourseId} />}
          {activePane === 'assignments' && <StudentAssignmentsPane selectedCourseId={selectedSidebarCourseId} />}
          {activePane === 'certificates' && <StudentCertificatesPane selectedCourseId={selectedSidebarCourseId} />}
          {activePane === 'announcements' && <StudentAnnouncementsPane user={user} selectedAnnouncementId={selectedAnnouncementId} onAnnouncementRead={markNotificationRead} />}
          {activePane === 'community' && !isPendingStudent && <StudentCommunityPane />}
          {activePane === 'support' && <StudentSupportPane user={user} />}
          {activePane === 'profile' && <StudentProfilePane user={user} onUserUpdated={onUserUpdated} />}
          {!['dashboard', 'my-courses', 'modules', 'materials', 'assignments', 'certificates', 'announcements', 'community', 'support', 'profile'].includes(activePane) && <StudentPlaceholderPane item={activeItem} />}
          </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [studentPortalResetKey, setStudentPortalResetKey] = React.useState(0);
  const [studentInitialPane, setStudentInitialPane] = React.useState('dashboard');

  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    fetch(`${apiBaseUrl.replace(/\/$/, '')}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error((await response.json()).detail || 'Session expired');
        return response.json();
      })
      .then((data) => {
        setUser(data);
        setError('');
        if (data.role === 'student') {
          const storageUserKey = data.id || data.email || 'student';
          const activePaneStorageKey = `three13_student_active_pane_${storageUserKey}`;
          const selectedCourseStorageKey = `three13_student_selected_course_${storageUserKey}`;
          if (data.lifecycle_status === 'alumni') {
            window.localStorage.setItem(activePaneStorageKey, 'community');
            window.localStorage.removeItem(selectedCourseStorageKey);
            setStudentInitialPane('community');
            setStudentPortalResetKey((current) => current + 1);
            return;
          }
          const freshLoginDashboard = window.sessionStorage.getItem('three13_student_start_pane') === 'dashboard';
          if (freshLoginDashboard) {
            window.sessionStorage.removeItem('three13_student_start_pane');
            window.localStorage.setItem(activePaneStorageKey, 'dashboard');
            window.localStorage.removeItem(selectedCourseStorageKey);
            setStudentInitialPane('dashboard');
            setStudentPortalResetKey((current) => current + 1);
          } else {
            const savedPane = window.localStorage.getItem(activePaneStorageKey);
            const resolvedSavedPane = studentPaneKeys.includes(savedPane) ? savedPane : 'dashboard';
            setStudentInitialPane(!data.is_active && resolvedSavedPane === 'community' ? 'dashboard' : resolvedSavedPane);
          }
        }
      })
      .catch((err) => {
        window.localStorage.removeItem('three13_token');
        setError(err.message);
        navigate('/login', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSignOut = () => {
    window.localStorage.removeItem('three13_token');
    navigate('/login', { replace: true });
  };

  return (
    <ThemeProvider theme={theme}>
      {!loading && user?.role === 'admin' ? (
        <AdminPortal user={user} onSignOut={handleSignOut} onUserUpdated={setUser} />
      ) : !loading && user?.role === 'teacher' ? (
        <TeacherPortal user={user} onSignOut={handleSignOut} onUserUpdated={setUser} />
      ) : !loading && user?.role === 'student' ? (
        <StudentPortal key={`${user.id || user.email}-${studentInitialPane}-${studentPortalResetKey}`} user={user} onSignOut={handleSignOut} onUserUpdated={setUser} initialPane={studentInitialPane} />
      ) : (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 4, md: 7 } }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
            <Box component="img" src="/images/logo.png" alt="Three13 IT Solutions" sx={{ height: 64 }} />
            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/" variant="outlined">Home</Button>
              {user && <Button variant="outlined" onClick={handleSignOut}>Sign out</Button>}
            </Stack>
          </Stack>

          {loading && (
            <Stack alignItems="center" sx={{ py: 8 }}>
              <CircularProgress />
            </Stack>
          )}

          {!loading && error && (
            <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 2, p: 3 }}>
              <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: '2rem', mb: 1 }}>Session unavailable</Typography>
              <Typography sx={{ color: '#637083', mb: 3 }}>{error}</Typography>
              <Button variant="contained" color="secondary" onClick={() => navigate('/login', { replace: true })}>Back to sign in</Button>
            </Box>
          )}

          {!loading && user && (
            <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 2, p: { xs: 2.5, md: 4 }, boxShadow: '0 18px 48px rgba(18,60,105,0.08)' }}>
              <Chip label={roleLabels[user.role] || user.role} color="primary" sx={{ mb: 2, fontWeight: 800 }} />
              <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.6rem' }, mb: 1 }}>
                Welcome, {user.full_name}
              </Typography>
              <Typography sx={{ color: '#637083', mb: 3 }}>
                This is the first role-aware dashboard shell. The next phase will expand this into the full {roleLabels[user.role]?.toLowerCase()} experience.
              </Typography>
              <Stack spacing={1.2}>
                {(roleNextSteps[user.role] || []).map((item) => (
                  <Box key={item} sx={{ bgcolor: '#eef3f8', borderRadius: 1, px: 1.5, py: 1 }}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 700 }}>{item}</Typography>
                  </Box>
                ))}
              </Stack>

              {user.role === 'admin' && <AdminEnrollmentRequests />}
              {user.role === 'student' && <StudentEnrollmentStatus />}
            </Box>
          )}
        </Container>
      </Box>
      )}
    </ThemeProvider>
  );
}
