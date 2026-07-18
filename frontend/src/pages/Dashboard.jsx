import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import {
  AccountCircleOutlined,
  AddOutlined,
  AssignmentOutlined,
  CampaignOutlined,
  DashboardOutlined,
  FolderCopyOutlined,
  GradeOutlined,
  GroupOutlined,
  HelpOutlineOutlined,
  HistoryOutlined,
  MenuBookOutlined,
  PersonAddAltOutlined,
  SchoolOutlined,
  SupportAgentOutlined,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
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

const roleLabels = {
  admin: 'Admin Portal',
  teacher: 'Teacher Portal',
  student: 'Student Portal',
};

const roleNextSteps = {
  admin: ['Review pending enrollment requests', 'Create courses and assign teachers', 'Post announcements'],
  teacher: ['Open assigned courses', 'Upload course materials', 'Grade pending submissions'],
  student: ['Continue approved courses', 'Check assignments', 'View recent announcements'],
};

const adminNavItems = [
  { key: 'dashboard', label: 'Dashboard', icon: DashboardOutlined },
  { key: 'students', label: 'Students', icon: GroupOutlined },
  { key: 'teachers', label: 'Teachers', icon: SchoolOutlined },
  { key: 'courses', label: 'Courses', icon: MenuBookOutlined },
  { key: 'enrollment', label: 'Enrollment Requests', icon: PersonAddAltOutlined },
  { key: 'materials', label: 'Course Materials', icon: FolderCopyOutlined },
  { key: 'assignments', label: 'Assignments', icon: AssignmentOutlined },
  { key: 'grades', label: 'Grades Overview', icon: GradeOutlined },
  { key: 'announcements', label: 'Announcements', icon: CampaignOutlined },
  { key: 'support', label: 'Support', icon: SupportAgentOutlined },
  { key: 'history', label: 'History', icon: HistoryOutlined },
];

const studentNavItems = [
  { key: 'dashboard', label: 'Dashboard', icon: DashboardOutlined },
  { key: 'my-courses', label: 'My Courses', icon: MenuBookOutlined },
  { key: 'available-courses', label: 'Available Courses', icon: SchoolOutlined },
  { key: 'materials', label: 'Course Materials', icon: FolderCopyOutlined },
  { key: 'assignments', label: 'Assignments', icon: AssignmentOutlined },
  { key: 'grades', label: 'My Grades', icon: GradeOutlined },
  { key: 'announcements', label: 'Announcements', icon: CampaignOutlined },
  { key: 'profile', label: 'Profile', icon: AccountCircleOutlined },
];

const teacherNavItems = [
  { key: 'dashboard', label: 'Dashboard', icon: DashboardOutlined },
  { key: 'my-courses', label: 'My Courses', icon: MenuBookOutlined },
  { key: 'materials', label: 'Course Materials', icon: FolderCopyOutlined },
  { key: 'assignments', label: 'Assignments', icon: AssignmentOutlined },
  { key: 'submissions', label: 'Submissions', icon: AssignmentOutlined },
  { key: 'grades', label: 'Grades', icon: GradeOutlined },
  { key: 'announcements', label: 'Announcements', icon: CampaignOutlined },
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

function getMaterialUrl(material) {
  return material?.external_url || material?.file_url || '';
}

function getYouTubeEmbedUrl(url) {
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
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  } catch {
    return '';
  }
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

function MaterialInlineViewer({ material, onBack }) {
  const url = getMaterialUrl(material);
  const youtubeUrl = material?.material_type === 'youtube' ? getYouTubeEmbedUrl(url) : '';
  const previewUrl = youtubeUrl || url;

  return (
    <Stack spacing={2.2}>
      <StudentPageHeader
        title={material?.title || 'Course Material'}
        subtitle={material?.course?.title ? `${material.course.title} | ${material.module_title || 'Course resource'}` : 'Course resource'}
        icon={FolderCopyOutlined}
        action={<Button variant="outlined" onClick={onBack}>Back to materials</Button>}
      />
      {material?.description && (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.6 }}>
          <Typography sx={{ color: '#526273' }}>{material.description}</Typography>
        </Box>
      )}
      <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: { xs: 1, md: 1.5 } }}>
        {previewUrl ? (
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
            {!youtubeUrl && url ? 'Some document types may download or block embedded preview depending on the file format and browser.' : 'Video is playing inside the Three13 portal.'}
          </Typography>
          {url && <Button component="a" href={url} target="_blank" rel="noreferrer" variant="outlined" size="small">Open tab</Button>}
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

function AdminEnrollmentRequests({ onAdminDataChanged, initialStatus = 'pending', showStatusFilters = true, compactTitle = false }) {
  const [requests, setRequests] = React.useState([]);
  const [statusFilter, setStatusFilter] = React.useState(initialStatus);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [busyId, setBusyId] = React.useState(null);

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

function AdminDashboardHome({ refreshKey, onAdminDataChanged }) {
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/dashboard-summary`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to load admin dashboard');
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
  }, [refreshKey]);

  const totals = summary?.totals || {};
  const stats = [
    { label: 'Total students', value: totals.students ?? 0, color: '#123c69' },
    { label: 'Total teachers', value: totals.teachers ?? 0, color: '#16805f' },
    { label: 'Total courses', value: totals.courses ?? 0, color: '#f05a28' },
    { label: 'Pending requests', value: totals.pending_enrollment_requests ?? 0, color: '#b45309' },
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>
          Admin Dashboard
        </Typography>
        <Typography sx={{ color: '#637083' }}>
          Control student access, course operations, announcements, and learning activity from one portal.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.5 }}>
            {stats.map((stat) => (
              <Box key={stat.label} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
                <Typography sx={{ color: '#637083', fontSize: 13, fontWeight: 700 }}>{stat.label}</Typography>
                <Typography sx={{ color: stat.color, fontWeight: 900, fontSize: '2.25rem', lineHeight: 1.1 }}>{stat.value}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
            <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Recent Submissions</Typography>
              {summary.recent_submissions.length === 0 ? (
                <Typography sx={{ color: '#637083', fontSize: 14 }}>No submissions yet.</Typography>
              ) : (
                <Stack spacing={1}>
                  {summary.recent_submissions.map((submission) => (
                    <Box key={submission.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.2 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{submission.student_name}</Typography>
                      <Typography sx={{ color: '#637083', fontSize: 13 }}>Status: {submission.status}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Recent Announcements</Typography>
              {summary.recent_announcements.length === 0 ? (
                <Typography sx={{ color: '#637083', fontSize: 14 }}>No announcements yet.</Typography>
              ) : (
                <Stack spacing={1}>
                  {summary.recent_announcements.map((announcement) => (
                    <Box key={announcement.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.2 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{announcement.title}</Typography>
                      <Typography sx={{ color: '#637083', fontSize: 13 }}>{announcement.audience} by {announcement.author_name}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 1 }}>
            <AdminEnrollmentRequests
              onAdminDataChanged={onAdminDataChanged}
              initialStatus="pending"
              showStatusFilters={false}
              compactTitle
            />
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

function AdminStudentsPane({ onAdminDataChanged }) {
  const [students, setStudents] = React.useState([]);
  const [courses, setCourses] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [courseFilter, setCourseFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('az');
  const [selectedStudentId, setSelectedStudentId] = React.useState(null);
  const [expandedRequestHistory, setExpandedRequestHistory] = React.useState({});
  const [courseActivity, setCourseActivity] = React.useState({});
  const [activityLoadingKey, setActivityLoadingKey] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [studentCourseSelections, setStudentCourseSelections] = React.useState({});

  const loadStudents = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      params.set('status', statusFilter);
      const [studentsResponse, coursesResponse] = await Promise.all([
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/students?${params.toString()}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/courses`),
      ]);
      const studentsData = await studentsResponse.json();
      const coursesData = await coursesResponse.json();
      if (!studentsResponse.ok) throw new Error(studentsData.detail || 'Unable to load students');
      if (!coursesResponse.ok) throw new Error(coursesData.detail || 'Unable to load courses');
      setStudents(studentsData);
      setCourses(coursesData);
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

  const getLatestEnrollmentTime = (student) => {
    const timestamps = student.enrolled_courses.map((course) => course.approved_at || 0);
    return timestamps.length ? Math.max(...timestamps) : 0;
  };

  const visibleStudents = React.useMemo(() => {
    return students
      .filter((student) => {
        if (courseFilter === 'all') return true;
        return student.enrolled_courses.some((course) => course.id === Number(courseFilter));
      })
      .sort((first, second) => {
        if (sortBy === 'enroll-time') return getLatestEnrollmentTime(second) - getLatestEnrollmentTime(first);
        if (sortBy === 'za') return second.full_name.localeCompare(first.full_name);
        return first.full_name.localeCompare(second.full_name);
      });
  }, [students, courseFilter, sortBy]);

  const shouldShowProfiles = search.trim().length > 0;
  const selectedStudent = students.find((student) => student.id === selectedStudentId);
  const displayedStudents = selectedStudent ? [selectedStudent] : visibleStudents;

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
      setMessage(isActive ? 'Student account approved/activated.' : 'Student account suspended.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const removeStudentFromCourse = async (studentId, enrollmentId) => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/students/${studentId}/enrollments/${enrollmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to remove student from course');
      updateStudentInList(data);
      onAdminDataChanged?.();
      setMessage('Student removed from course.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const assignStudentToCourse = async (studentId) => {
    const courseId = Number(studentCourseSelections[studentId]);
    if (!courseId) return;

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/students/${studentId}/assign-course`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course_id: courseId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to assign student to course');
      updateStudentInList(data);
      setStudentCourseSelections((current) => ({ ...current, [studentId]: '' }));
      onAdminDataChanged?.();
      setMessage('Student assigned to course.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const loadStudentCourseActivity = async (studentId, courseId) => {
    const key = `${studentId}-${courseId}`;
    if (courseActivity[key]) {
      setCourseActivity((current) => ({
        ...current,
        [key]: { ...current[key], open: !current[key].open },
      }));
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
      setCourseActivity((current) => ({ ...current, [key]: { open: true, data } }));
    } catch (err) {
      setError(err.message);
    } finally {
      setActivityLoadingKey('');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not set';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const renderActivityPanel = (activity) => {
    const data = activity.data;
    const submittedCount = data.assignments.filter((assignment) => assignment.submission).length;
    const gradedCount = data.assignments.filter((assignment) => assignment.grade).length;

    return (
      <Box sx={{ bgcolor: '#f6f8fb', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1, p: 1.4, mt: 1 }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 1 }}>
            {[
              ['Materials', data.materials.length],
              ['Assignments', data.assignments.length],
              ['Submitted', submittedCount],
              ['Graded', gradedCount],
            ].map(([label, value]) => (
              <Box key={label} sx={{ bgcolor: '#fff', borderRadius: 1, p: 1 }}>
                <Typography sx={{ color: '#637083', fontSize: 12, fontWeight: 800 }}>{label}</Typography>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: '1.35rem' }}>{value}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ bgcolor: '#fff', borderRadius: 1, p: 1.2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 0.8 }}>Assignments</Typography>
            {data.assignments.length === 0 ? (
              <Typography sx={{ color: '#637083', fontSize: 13 }}>No assignments for this course yet.</Typography>
            ) : (
              <Stack spacing={0.8}>
                {data.assignments.map((assignment) => (
                  <Box key={assignment.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{assignment.title}</Typography>
                        <Typography sx={{ color: '#637083', fontSize: 12 }}>Due: {formatDate(assignment.due_at)} | {assignment.total_points} points</Typography>
                        {assignment.grade?.feedback && (
                          <Typography sx={{ color: '#637083', fontSize: 12 }}>Feedback: {assignment.grade.feedback}</Typography>
                        )}
                      </Box>
                      <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap', alignSelf: { xs: 'flex-start', md: 'center' } }}>
                        <Chip label={assignment.submission ? assignment.submission.status : 'not submitted'} size="small" color={assignment.submission ? 'success' : 'default'} />
                        <Chip label={assignment.grade ? `${assignment.grade.score}/${assignment.grade.total_points}` : 'not graded'} size="small" color={assignment.grade ? 'primary' : 'default'} />
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1 }}>
            <Box sx={{ bgcolor: '#fff', borderRadius: 1, p: 1.2 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 0.8 }}>Recent Materials</Typography>
              {data.materials.length === 0 ? (
                <Typography sx={{ color: '#637083', fontSize: 13 }}>No materials posted yet.</Typography>
              ) : (
                <Stack spacing={0.7}>
                  {data.materials.slice(0, 5).map((material) => (
                    <Box key={material.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 13 }}>{material.title}</Typography>
                      <Typography sx={{ color: '#637083', fontSize: 12 }}>{material.material_type} | {material.is_visible ? 'visible' : 'hidden'}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>

            <Box sx={{ bgcolor: '#fff', borderRadius: 1, p: 1.2 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 0.8 }}>Announcements</Typography>
              {data.announcements.length === 0 ? (
                <Typography sx={{ color: '#637083', fontSize: 13 }}>No announcements yet.</Typography>
              ) : (
                <Stack spacing={0.7}>
                  {data.announcements.slice(0, 5).map((announcement) => (
                    <Box key={announcement.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 13 }}>{announcement.title}</Typography>
                      <Typography sx={{ color: '#637083', fontSize: 12 }}>{announcement.audience} by {announcement.author_name}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Stack>
      </Box>
    );
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>
          Students
        </Typography>
        <Typography sx={{ color: '#637083' }}>
          View student profiles, monitor enrolled courses, and manage account access.
        </Typography>
      </Box>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 180px 190px 220px auto' }, gap: 1.5, alignItems: 'center' }}>
          <TextField label="Search students" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, or phone" />
          <TextField select label="Account status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <MenuItem value="all">All students</MenuItem>
            <MenuItem value="active">Active only</MenuItem>
            <MenuItem value="suspended">Suspended only</MenuItem>
          </TextField>
          <TextField select label="Sort by" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <MenuItem value="az">A-Z</MenuItem>
            <MenuItem value="za">Z-A</MenuItem>
            <MenuItem value="enroll-time">Enroll time</MenuItem>
          </TextField>
          <TextField select label="Enrolled course" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
            <MenuItem value="all">All courses</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={loadStudents}>Refresh</Button>
        </Box>
      </Box>

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1} sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{selectedStudent ? 'Student Profile' : 'Student Profiles'}</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>
              {selectedStudent ? 'Viewing one student profile' : `${visibleStudents.length} student${visibleStudents.length === 1 ? '' : 's'} found`}
            </Typography>
          </Box>
          {selectedStudent && (
            <Button variant="outlined" onClick={() => setSelectedStudentId(null)}>
              Back to students
            </Button>
          )}
        </Stack>

        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : displayedStudents.length === 0 ? (
          <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 700 }}>No students match this view.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {displayedStudents.map((student) => {
              const expanded = shouldShowProfiles || selectedStudentId === student.id;
              const requestSummary = student.enrollment_requests.reduce((summary, request) => ({
                ...summary,
                [request.status]: (summary[request.status] || 0) + 1,
              }), {});
              const showRequestHistory = expandedRequestHistory[student.id];

              return (
              <Box
                key={student.id}
                onClick={() => {
                  if (!selectedStudentId) setSelectedStudentId(student.id);
                }}
                sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: { xs: 1.6, md: selectedStudent ? 2.2 : 1.6 }, cursor: selectedStudent ? 'default' : 'pointer', border: expanded ? '1px solid rgba(18,60,105,0.22)' : '1px solid transparent' }}
              >
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} justifyContent="space-between">
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', mb: 0.6 }}>
                      <UserAvatar user={student} />
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{student.full_name}</Typography>
                      <Chip label={student.is_active ? 'active' : 'suspended'} size="small" color={student.is_active ? 'success' : 'error'} />
                      <Chip label={`${student.enrolled_courses.length} enrolled`} size="small" color="primary" />
                    </Stack>
                    <Typography sx={{ color: '#526273', fontSize: 14 }}>{student.email}</Typography>
                    <Typography sx={{ color: '#526273', fontSize: 14 }}>{student.phone || 'No phone provided'}</Typography>

                    {expanded && (
                    <>
                    <Box sx={{ mt: 1.2 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 14, mb: 0.6 }}>Enrolled Courses</Typography>
                      {student.enrolled_courses.length === 0 ? (
                        <Typography sx={{ color: '#637083', fontSize: 13 }}>No approved courses yet.</Typography>
                      ) : (
                        <Stack spacing={0.8}>
                          {student.enrolled_courses.map((course) => (
                            <Box key={course.enrollment_id} sx={{ bgcolor: '#fff', borderRadius: 1, p: 1 }}>
                              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                                <Box>
                                  <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{course.title}</Typography>
                                  <Typography sx={{ color: '#637083', fontSize: 12 }}>Status: {course.status}</Typography>
                                </Box>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                                  <Button variant="outlined" size="small" disabled={activityLoadingKey === `${student.id}-${course.id}`} onClick={(event) => { event.stopPropagation(); loadStudentCourseActivity(student.id, course.id); }}>
                                    {courseActivity[`${student.id}-${course.id}`]?.open ? 'Hide activity' : 'View course activity'}
                                  </Button>
                                  <Button variant="outlined" color="error" size="small" disabled={saving} onClick={(event) => { event.stopPropagation(); removeStudentFromCourse(student.id, course.enrollment_id); }}>
                                    Remove from course
                                  </Button>
                                </Stack>
                              </Stack>
                              {activityLoadingKey === `${student.id}-${course.id}` && (
                                <Stack alignItems="center" sx={{ py: 2 }}>
                                  <CircularProgress size={22} />
                                </Stack>
                              )}
                              {courseActivity[`${student.id}-${course.id}`]?.open && renderActivityPanel(courseActivity[`${student.id}-${course.id}`])}
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>

                    <Box sx={{ mt: 1.2 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={1} sx={{ mb: 0.6 }}>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 14 }}>Enrollment History</Typography>
                        {student.enrollment_requests.length > 0 && (
                          <Button
                            size="small"
                            variant="text"
                            onClick={(event) => {
                              event.stopPropagation();
                              setExpandedRequestHistory((current) => ({ ...current, [student.id]: !current[student.id] }));
                            }}
                          >
                            {showRequestHistory ? 'Hide details' : 'Show details'}
                          </Button>
                        )}
                      </Stack>
                      {student.enrollment_requests.length === 0 ? (
                        <Typography sx={{ color: '#637083', fontSize: 13 }}>No enrollment requests.</Typography>
                      ) : (
                        <>
                          <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap' }}>
                            {Object.entries(requestSummary).map(([status, count]) => (
                              <Chip
                                key={status}
                                label={`${count} ${status}`}
                                size="small"
                                color={status === 'approved' ? 'success' : status === 'pending' ? 'warning' : status === 'rejected' ? 'error' : 'default'}
                                sx={{ mb: 0.8 }}
                              />
                            ))}
                          </Stack>
                          {showRequestHistory && (
                            <Stack spacing={0.7} sx={{ mt: 0.8 }}>
                              {student.enrollment_requests.map((request) => (
                                <Box key={request.id} sx={{ bgcolor: '#fff', borderRadius: 1, px: 1, py: 0.8 }}>
                                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={0.8} justifyContent="space-between">
                                    <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 13 }}>{request.course_title}</Typography>
                                    <Chip
                                      label={request.status}
                                      size="small"
                                      color={request.status === 'approved' ? 'success' : request.status === 'pending' ? 'warning' : request.status === 'rejected' ? 'error' : 'default'}
                                      sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                                    />
                                  </Stack>
                                </Box>
                              ))}
                            </Stack>
                          )}
                        </>
                      )}
                    </Box>
                    </>
                    )}
                  </Box>

                  {expanded && (
                  <Stack spacing={1} sx={{ minWidth: { lg: 220 } }}>
                    <Stack direction={{ xs: 'column', sm: 'row', lg: 'column' }} spacing={1}>
                      <TextField
                        select
                        size="small"
                        label="Assign course"
                        value={studentCourseSelections[student.id] || ''}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => setStudentCourseSelections((current) => ({ ...current, [student.id]: event.target.value }))}
                        disabled={!student.is_active}
                        sx={{ bgcolor: '#fff' }}
                      >
                        <MenuItem value="">Select a course</MenuItem>
                        {courses.map((course) => (
                          <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
                        ))}
                      </TextField>
                      <Button variant="contained" color="primary" disabled={saving || !student.is_active || !studentCourseSelections[student.id]} onClick={(event) => { event.stopPropagation(); assignStudentToCourse(student.id); }}>
                        Assign course
                      </Button>
                    </Stack>
                    <Button variant="contained" color={student.is_active ? 'error' : 'success'} disabled={saving} onClick={(event) => { event.stopPropagation(); updateStudentStatus(student.id, !student.is_active); }}>
                      {student.is_active ? 'Suspend account' : 'Approve account'}
                    </Button>
                  </Stack>
                  )}
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

function AdminTeachersPane({ onAdminDataChanged }) {
  const [teachers, setTeachers] = React.useState([]);
  const [courses, setCourses] = React.useState([]);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [courseFilter, setCourseFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('az');
  const [selectedTeacherId, setSelectedTeacherId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({ full_name: '', email: '', phone: '', password: '' });
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
        if (sortBy === 'za') return second.full_name.localeCompare(first.full_name);
        return first.full_name.localeCompare(second.full_name);
      });
  }, [teachers, search, statusFilter, courseFilter, sortBy]);

  const shouldShowProfiles = search.trim().length > 0;

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
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
      onAdminDataChanged?.();
      setMessage('Teacher account created.');
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
      setTeachers((current) => current.map((teacher) => (teacher.id === teacherId ? data : teacher)));
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
      setTeachers((current) => current.map((teacher) => (teacher.id === teacherId ? data : teacher)));
      setCourseSelections((current) => ({ ...current, [teacherId]: '' }));
      onAdminDataChanged?.();
      setMessage('Course assigned to teacher.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>
          Teachers
        </Typography>
        <Typography sx={{ color: '#637083' }}>
          Add instructor accounts, manage access, and assign teachers to active courses.
        </Typography>
      </Box>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box component="form" onSubmit={createTeacher} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <AddOutlined color="secondary" />
          <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Add Teacher</Typography>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
          <TextField label="Full name" value={form.full_name} onChange={(event) => updateForm('full_name', event.target.value)} required />
          <TextField label="Email" type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} required />
          <TextField label="Phone" value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} />
          <TextField label="Temporary password" type="password" value={form.password} onChange={(event) => updateForm('password', event.target.value)} required helperText="At least 9 characters" />
        </Box>
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" color="secondary" disabled={saving}>
            Create teacher
          </Button>
        </Stack>
      </Box>

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 180px 150px 220px auto' }, gap: 1.5, alignItems: 'center', mb: 2 }}>
          <TextField label="Search teachers" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, email, or phone" />
          <TextField select label="Account status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <MenuItem value="all">All teachers</MenuItem>
            <MenuItem value="active">Active only</MenuItem>
            <MenuItem value="inactive">Inactive only</MenuItem>
          </TextField>
          <TextField select label="Sort by" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <MenuItem value="az">A-Z</MenuItem>
            <MenuItem value="za">Z-A</MenuItem>
          </TextField>
          <TextField select label="Assigned course" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
            <MenuItem value="all">All courses</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={loadTeachers}>Refresh</Button>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Teacher Accounts</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>{visibleTeachers.length} teacher{visibleTeachers.length === 1 ? '' : 's'} found</Typography>
          </Box>
        </Stack>

        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : visibleTeachers.length === 0 ? (
          <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 700 }}>No teachers match this view.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {visibleTeachers.map((teacher) => {
              const expanded = shouldShowProfiles || selectedTeacherId === teacher.id;

              return (
              <Box
                key={teacher.id}
                onClick={() => setSelectedTeacherId((current) => (current === teacher.id ? null : teacher.id))}
                sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.6, cursor: 'pointer', border: expanded ? '1px solid rgba(18,60,105,0.22)' : '1px solid transparent' }}
              >
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} justifyContent="space-between">
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', mb: 0.6 }}>
                      <UserAvatar user={teacher} />
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{teacher.full_name}</Typography>
                      <Chip label={teacher.is_active ? 'active' : 'inactive'} size="small" color={teacher.is_active ? 'success' : 'default'} />
                      <Chip label={`${teacher.assigned_courses.length} assigned`} size="small" color="primary" />
                    </Stack>
                    <Typography sx={{ color: '#526273', fontSize: 14 }}>{teacher.email}</Typography>
                    <Typography sx={{ color: '#526273', fontSize: 14 }}>{teacher.phone || 'No phone provided'}</Typography>
                    {expanded && (
                    <Box sx={{ mt: 1.2 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 14, mb: 0.6 }}>Assigned Courses</Typography>
                      {teacher.assigned_courses.length === 0 ? (
                        <Typography sx={{ color: '#637083', fontSize: 13 }}>No courses assigned.</Typography>
                      ) : (
                        <Stack spacing={0.8}>
                          {teacher.assigned_courses.map((course) => (
                            <Box key={course.id} sx={{ bgcolor: '#fff', borderRadius: 1, p: 1 }}>
                              <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{course.title}</Typography>
                              <Typography sx={{ color: '#637083', fontSize: 12 }}>Status: {course.status}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>
                    )}
                  </Box>

                  {expanded && (
                  <Stack spacing={1} sx={{ minWidth: { lg: 360 } }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <TextField
                        select
                        size="small"
                        label="Assign course"
                        value={courseSelections[teacher.id] || ''}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => setCourseSelections((current) => ({ ...current, [teacher.id]: event.target.value }))}
                        disabled={!teacher.is_active}
                        sx={{ flex: 1, bgcolor: '#fff' }}
                      >
                        <MenuItem value="">Select a course</MenuItem>
                        {courses.map((course) => (
                          <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>
                        ))}
                      </TextField>
                      <Button variant="contained" color="primary" disabled={saving || !teacher.is_active || !courseSelections[teacher.id]} onClick={(event) => { event.stopPropagation(); assignCourse(teacher.id); }}>
                        Assign
                      </Button>
                    </Stack>
                    <Button variant="outlined" color={teacher.is_active ? 'error' : 'success'} disabled={saving} onClick={(event) => { event.stopPropagation(); updateTeacherStatus(teacher.id, !teacher.is_active); }}>
                      {teacher.is_active ? 'Deactivate teacher' : 'Activate teacher'}
                    </Button>
                  </Stack>
                  )}
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

function AdminCoursesPane({ onAdminDataChanged }) {
  const [courses, setCourses] = React.useState([]);
  const [teachers, setTeachers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [selectedCourseId, setSelectedCourseId] = React.useState(null);
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
      setCourses(coursesData);
      setTeachers(teachersData.filter((teacher) => teacher.is_active));
      setEditForms(coursesData.reduce((forms, course) => ({
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
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>
          Courses
        </Typography>
        <Typography sx={{ color: '#637083' }}>
          Create courses, assign teachers, set availability, and view enrolled students.
        </Typography>
      </Box>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box component="form" onSubmit={createCourse} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <AddOutlined color="secondary" />
          <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Create Course</Typography>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1.5fr 160px 220px' }, gap: 1.5 }}>
          <TextField label="Course title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
          <TextField label="Description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
          <TextField select label="Status" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
            <MenuItem value="archived">Archived</MenuItem>
          </TextField>
          <TextField select label="Teacher" value={form.teacher_id} onChange={(event) => setForm((current) => ({ ...current, teacher_id: event.target.value }))}>
            <MenuItem value="">Unassigned</MenuItem>
            {teachers.map((teacher) => (
              <MenuItem key={teacher.id} value={teacher.id}>{teacher.full_name}</MenuItem>
            ))}
          </TextField>
        </Box>
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" color="secondary" disabled={saving}>Create course</Button>
        </Stack>
      </Box>

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Course Catalog</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>{courses.length} course{courses.length === 1 ? '' : 's'} found</Typography>
          </Box>
          <Button variant="outlined" onClick={loadCourses}>Refresh</Button>
        </Stack>

        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
        ) : courses.length === 0 ? (
          <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}><Typography sx={{ color: 'primary.dark', fontWeight: 700 }}>No courses yet.</Typography></Box>
        ) : selectedCourseId ? (() => {
          const course = courses.find((item) => item.id === selectedCourseId);
          if (!course) return null;
          const editForm = editForms[course.id] || {};
          const courseImage = getCourseImage(course.title);

          return (
            <Stack spacing={2}>
              <Button variant="outlined" onClick={() => setSelectedCourseId(null)} sx={{ alignSelf: 'flex-start' }}>
                Back to courses
              </Button>
              <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: { xs: 1.6, md: 2 } }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      minHeight: 220,
                      borderRadius: 1,
                      p: { xs: 2, md: 2.5 },
                      color: '#fff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      bgcolor: '#123c69',
                      backgroundImage: courseImage ? `linear-gradient(180deg, rgba(8,37,64,0.18), rgba(8,37,64,0.86)), url(${courseImage})` : 'linear-gradient(135deg, #123c69, #f05a28)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', mb: 0.8 }}>
                      <Chip label={course.status} size="small" color={course.status === 'active' ? 'success' : course.status === 'inactive' ? 'warning' : 'default'} />
                      <Chip label={`${course.enrolled_students.length} enrolled`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.92)', color: '#123c69', fontWeight: 800 }} />
                    </Stack>
                    <Typography variant="h4" sx={{ fontSize: { xs: '1.7rem', md: '2.25rem' }, fontWeight: 900 }}>{course.title}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 760 }}>{course.description || 'No description yet'}</Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: 14, mt: 0.5 }}>Teacher: {course.teacher?.full_name || 'Unassigned'}</Typography>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 420px' }, gap: 2 }}>
                    <Box sx={{ bgcolor: '#fff', borderRadius: 1, p: 1.5 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Enrolled Students</Typography>
                      {course.enrolled_students.length === 0 ? (
                        <Typography sx={{ color: '#637083', fontSize: 13 }}>No approved students enrolled.</Typography>
                      ) : (
                        <Stack spacing={0.8}>
                          {course.enrolled_students.map((student) => (
                            <Stack key={student.enrollment_id} direction="row" spacing={1} alignItems="center" sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1 }}>
                              <UserAvatar user={student} size={34} />
                              <Box>
                                <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{student.full_name}</Typography>
                                <Typography sx={{ color: '#637083', fontSize: 12 }}>{student.email}</Typography>
                              </Box>
                            </Stack>
                          ))}
                        </Stack>
                      )}
                    </Box>

                    <Stack spacing={1} sx={{ bgcolor: '#fff', borderRadius: 1, p: 1.5 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Course Settings</Typography>
                      <TextField size="small" label="Title" value={editForm.title || ''} onChange={(event) => setEditForms((current) => ({ ...current, [course.id]: { ...current[course.id], title: event.target.value } }))} />
                      <TextField size="small" label="Description" value={editForm.description || ''} onChange={(event) => setEditForms((current) => ({ ...current, [course.id]: { ...current[course.id], description: event.target.value } }))} />
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField select size="small" label="Status" value={editForm.status || 'inactive'} onChange={(event) => setEditForms((current) => ({ ...current, [course.id]: { ...current[course.id], status: event.target.value } }))} sx={{ flex: 1 }}>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                          <MenuItem value="archived">Archived</MenuItem>
                        </TextField>
                        <TextField select size="small" label="Teacher" value={editForm.teacher_id || ''} onChange={(event) => setEditForms((current) => ({ ...current, [course.id]: { ...current[course.id], teacher_id: event.target.value } }))} sx={{ flex: 1 }}>
                          <MenuItem value="">Unassigned</MenuItem>
                          {teachers.map((teacher) => (
                            <MenuItem key={teacher.id} value={teacher.id}>{teacher.full_name}</MenuItem>
                          ))}
                        </TextField>
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Button variant="contained" color="primary" disabled={saving} onClick={() => saveCourse(course.id)}>Save changes</Button>
                        <Button variant="outlined" color="error" disabled={saving || course.status === 'archived'} onClick={() => archiveCourse(course.id)}>Archive course</Button>
                      </Stack>
                      <Box sx={{ borderTop: '1px solid rgba(18,60,105,0.12)', pt: 1 }}>
                        <Typography sx={{ color: '#637083', fontSize: 12, mb: 0.8 }}>
                          Permanent delete is only allowed for courses with no enrollments, requests, materials, assignments, modules, or announcements.
                        </Typography>
                        <Button variant="contained" color="error" disabled={saving} onClick={() => deleteCoursePermanently(course.id)}>
                          Delete permanently
                        </Button>
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          );
        })() : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 1.5 }}>
            {courses.map((course) => {
              const courseImage = getCourseImage(course.title);

              return (
              <Box key={course.id} onClick={() => setSelectedCourseId(course.id)} sx={{ bgcolor: '#eef3f8', borderRadius: 1, overflow: 'hidden', cursor: 'pointer', border: '1px solid transparent', minHeight: 260, display: 'flex', flexDirection: 'column', '&:hover': { borderColor: 'rgba(18,60,105,0.24)', transform: 'translateY(-2px)', boxShadow: '0 14px 32px rgba(18,60,105,0.12)' }, transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease' }}>
                <Box
                  sx={{
                    minHeight: 150,
                    p: 1.6,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'flex-end',
                    bgcolor: '#123c69',
                    backgroundImage: courseImage ? `linear-gradient(180deg, rgba(8,37,64,0.08), rgba(8,37,64,0.76)), url(${courseImage})` : 'linear-gradient(135deg, #123c69, #f05a28)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', lineHeight: 1.2 }}>{course.title}</Typography>
                </Box>
                <Box sx={{ p: 1.6, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#526273', fontSize: 14 }}>{course.description || 'No description yet'}</Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 2 }}>
                    <Chip label={course.status} size="small" color={course.status === 'active' ? 'success' : course.status === 'inactive' ? 'warning' : 'default'} />
                    <Chip label={`${course.enrolled_students.length} enrolled`} size="small" color="primary" />
                    <Chip label={course.teacher?.full_name || 'Unassigned'} size="small" />
                  </Stack>
                </Box>
              </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Stack>
  );
}

function AdminCourseMaterialsPane({ onAdminDataChanged }) {
  const [courses, setCourses] = React.useState([]);
  const [selectedCourseId, setSelectedCourseId] = React.useState('');
  const [content, setContent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [contentLoading, setContentLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [selectedMaterialFile, setSelectedMaterialFile] = React.useState(null);
  const [expandedModuleId, setExpandedModuleId] = React.useState(null);
  const [moduleForm, setModuleForm] = React.useState({ title: '', description: '', position: 1, is_visible: true });
  const [materialForm, setMaterialForm] = React.useState({
    title: '',
    description: '',
    material_type: 'youtube',
    module_id: '',
    external_url: '',
    file_url: '',
    is_visible: true,
  });

  const selectedCourse = courses.find((course) => course.id === Number(selectedCourseId));

  const loadContent = React.useCallback(async (courseId) => {
    if (!courseId) {
      setContent(null);
      return;
    }
    setContentLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/courses/${courseId}/content`, {
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
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/courses`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load courses');
      setCourses(data);
      const firstCourseId = data[0]?.id ? String(data[0].id) : '';
      setSelectedCourseId((current) => current || firstCourseId);
      if (firstCourseId) await loadContent(firstCourseId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadContent]);

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
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/courses/${selectedCourseId}/modules`, {
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
        const uploadResponse = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/courses/${selectedCourseId}/materials/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: uploadBody,
        });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.detail || 'Unable to upload file');
        uploadedFileUrl = uploadData.file_url;
        materialTitle = materialTitle || uploadData.file_name;
      }

      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/courses/${selectedCourseId}/materials`, {
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
      });
      setSelectedMaterialFile(null);
      setMessage('Material added.');
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
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/modules/${module.id}`, {
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
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/materials/${material.id}`, {
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
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/materials/${materialId}`, {
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
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/modules/${moduleId}`, {
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

  const renderMaterial = (material) => (
    <Box key={material.id} sx={{ bgcolor: '#fff', borderRadius: 1, p: 1.2, border: '1px solid rgba(18,60,105,0.1)' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.2}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', mb: 0.4 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{material.title}</Typography>
            <Chip label={materialTypeLabels[material.material_type] || material.material_type} size="small" color="primary" />
            <Chip label={material.is_visible ? 'Visible' : 'Hidden'} size="small" color={material.is_visible ? 'success' : 'default'} />
          </Stack>
          {material.description && <Typography sx={{ color: '#637083', fontSize: 13 }}>{material.description}</Typography>}
          {(material.external_url || material.file_url) && (
            <Typography component="a" href={material.external_url || material.file_url} target="_blank" rel="noreferrer" sx={{ display: 'block', color: '#123c69', fontSize: 13, mt: 0.4, overflowWrap: 'anywhere' }}>
              {material.external_url || material.file_url}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
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

  const renderAssignment = (assignment) => (
    <Box key={assignment.id} sx={{ bgcolor: 'rgba(240,90,40,0.08)', borderRadius: 1, p: 1.1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
        <AssignmentOutlined color="secondary" fontSize="small" />
        <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{assignment.title}</Typography>
        <Chip label={`${assignment.total_points} pts`} size="small" />
        <Chip label={assignment.is_open ? 'Open' : 'Closed'} size="small" color={assignment.is_open ? 'success' : 'default'} />
      </Stack>
    </Box>
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>
          Course Materials
        </Typography>
        <Typography sx={{ color: '#637083' }}>
          Organize learning content by course, module/week, materials, and assignments.
        </Typography>
      </Box>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }} justifyContent="space-between">
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Course Workspace</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>{selectedCourse?.description || 'Choose a course to manage its content.'}</Typography>
          </Box>
          <TextField select label="Course" value={selectedCourseId} onChange={handleCourseChange} disabled={loading || courses.length === 0} sx={{ minWidth: { md: 320 } }}>
            {courses.map((course) => (
              <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Box>

      {loading || contentLoading ? (
        <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
      ) : courses.length === 0 ? (
        <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}><Typography sx={{ color: 'primary.dark', fontWeight: 700 }}>Create a course before adding materials.</Typography></Box>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '0.85fr 1.15fr' }, gap: 2 }}>
            <Box component="form" onSubmit={createModule} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1.5 }}>Create Module / Week</Typography>
              <Stack spacing={1.3}>
                <TextField label="Module title" placeholder="Week 1: Introduction" value={moduleForm.title} onChange={(event) => setModuleForm((current) => ({ ...current, title: event.target.value }))} required />
                <TextField label="Description" value={moduleForm.description} onChange={(event) => setModuleForm((current) => ({ ...current, description: event.target.value }))} multiline minRows={2} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ sm: 'center' }}>
                  <TextField type="number" label="Order" value={moduleForm.position} onChange={(event) => setModuleForm((current) => ({ ...current, position: event.target.value }))} sx={{ maxWidth: { sm: 150 } }} />
                  <FormControlLabel control={<Switch checked={moduleForm.is_visible} onChange={(event) => setModuleForm((current) => ({ ...current, is_visible: event.target.checked }))} />} label="Visible to students" />
                </Stack>
                <Button type="submit" variant="contained" color="secondary" disabled={saving}>Create module</Button>
              </Stack>
            </Box>

            <Box component="form" onSubmit={createMaterial} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1.5 }}>Add Material</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.3 }}>
                <TextField label="Material title" value={materialForm.title} onChange={(event) => setMaterialForm((current) => ({ ...current, title: event.target.value }))} placeholder="Leave blank to use attached filename" />
                <TextField select label="Material type" value={materialForm.material_type} onChange={(event) => setMaterialForm((current) => ({ ...current, material_type: event.target.value }))}>
                  {materialTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </TextField>
                <TextField select label="Module / Week" value={materialForm.module_id} onChange={(event) => setMaterialForm((current) => ({ ...current, module_id: event.target.value }))}>
                  <MenuItem value="">Unassigned</MenuItem>
                  {(content?.modules || []).map((module) => (
                    <MenuItem key={module.id} value={String(module.id)}>{module.title}</MenuItem>
                  ))}
                </TextField>
                <TextField label="External link" placeholder="YouTube or website URL" value={materialForm.external_url} onChange={(event) => setMaterialForm((current) => ({ ...current, external_url: event.target.value }))} />
                <TextField label="File URL" placeholder="Optional hosted file link" value={materialForm.file_url} onChange={(event) => setMaterialForm((current) => ({ ...current, file_url: event.target.value }))} />
                <FormControlLabel control={<Switch checked={materialForm.is_visible} onChange={(event) => setMaterialForm((current) => ({ ...current, is_visible: event.target.checked }))} />} label="Visible to students" />
              </Box>
              <Box sx={{ mt: 1.3, bgcolor: '#eef3f8', borderRadius: 1, p: 1.2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 14 }}>Attach from computer</Typography>
                    <Typography sx={{ color: '#637083', fontSize: 12, overflowWrap: 'anywhere' }}>
                      {selectedMaterialFile ? `${selectedMaterialFile.name} (${Math.ceil(selectedMaterialFile.size / 1024)} KB)` : 'PDFs, slides, documents, code files, zip files. Max 25 MB.'}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    {selectedMaterialFile && (
                      <Button variant="outlined" size="small" disabled={saving} onClick={() => setSelectedMaterialFile(null)}>
                        Clear
                      </Button>
                    )}
                    <Button variant="outlined" component="label" disabled={saving}>
                      Choose file
                      <input
                        type="file"
                        hidden
                        onChange={(event) => setSelectedMaterialFile(event.target.files?.[0] || null)}
                        accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.md,.csv,.xlsx,.zip,.py,.js,.jsx,.ts,.tsx,.html,.css,.json,.sql"
                      />
                    </Button>
                  </Stack>
                </Stack>
              </Box>
              <TextField label="Description" value={materialForm.description} onChange={(event) => setMaterialForm((current) => ({ ...current, description: event.target.value }))} multiline minRows={2} sx={{ mt: 1.3 }} fullWidth />
              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
                <Button type="submit" variant="contained" color="secondary" disabled={saving || uploading}>
                  {uploading ? 'Uploading...' : 'Add material'}
                </Button>
              </Stack>
            </Box>
          </Box>

          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2 }}>
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{content?.course?.title || 'Course'} Structure</Typography>
                <Typography sx={{ color: '#637083', fontSize: 14 }}>{content?.modules?.length || 0} module{content?.modules?.length === 1 ? '' : 's'} organized</Typography>
              </Box>
              <Button variant="outlined" onClick={() => loadContent(selectedCourseId)}>Refresh</Button>
            </Stack>

            {(content?.modules || []).length === 0 ? (
              <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>No modules yet. Create Week 1 to start organizing this course.</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {content.modules.map((module) => (
                  <Box
                    key={module.id}
                    onClick={() => setExpandedModuleId((current) => (current === module.id ? null : module.id))}
                    sx={{
                      bgcolor: '#eef3f8',
                      borderRadius: 1,
                      p: { xs: 1.4, md: 1.8 },
                      cursor: 'pointer',
                      border: expandedModuleId === module.id ? '1px solid rgba(18,60,105,0.28)' : '1px solid transparent',
                      '&:hover': { borderColor: 'rgba(18,60,105,0.28)', bgcolor: '#e8eff6' },
                    }}
                  >
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.2}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap' }}>
                          <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{module.title}</Typography>
                          <Chip label={`Order ${module.position}`} size="small" />
                          <Chip label={module.is_visible ? 'Visible' : 'Hidden'} size="small" color={module.is_visible ? 'success' : 'default'} />
                          <Chip label={`${module.materials.length} material${module.materials.length === 1 ? '' : 's'}`} size="small" color="primary" />
                          <Chip label={`${module.assignments.length} assignment${module.assignments.length === 1 ? '' : 's'}`} size="small" />
                        </Stack>
                        <Typography sx={{ color: '#637083', fontSize: 13, mt: 0.4 }}>
                          {expandedModuleId === module.id ? 'Module details are open.' : 'Click to view module details.'}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} onClick={(event) => event.stopPropagation()}>
                        <Button size="small" variant="outlined" disabled={saving} onClick={() => toggleModuleVisibility(module)}>{module.is_visible ? 'Hide' : 'Show'}</Button>
                        <Button size="small" variant="outlined" color="error" disabled={saving} onClick={() => deleteModule(module.id)}>Delete</Button>
                      </Stack>
                    </Stack>

                    {expandedModuleId === module.id && (
                      <Stack spacing={1} sx={{ mt: 1.4, cursor: 'default' }} onClick={(event) => event.stopPropagation()}>
                        {module.description && <Typography sx={{ color: '#637083', fontSize: 13 }}>{module.description}</Typography>}
                        <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 14 }}>Materials</Typography>
                        {module.materials.length === 0 ? (
                          <Typography sx={{ color: '#637083', fontSize: 13 }}>No materials in this module yet.</Typography>
                        ) : (
                          <Stack spacing={1}>{module.materials.map(renderMaterial)}</Stack>
                        )}
                        <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 14, pt: 0.8 }}>Assignments</Typography>
                        {module.assignments.length === 0 ? (
                          <Typography sx={{ color: '#637083', fontSize: 13 }}>No assignments linked to this module yet.</Typography>
                        ) : (
                          <Stack spacing={1}>{module.assignments.map(renderAssignment)}</Stack>
                        )}
                      </Stack>
                    )}
                  </Box>
                ))}
              </Stack>
            )}

            {((content?.unassigned_materials || []).length > 0 || (content?.unassigned_assignments || []).length > 0) && (
              <Box sx={{ mt: 2, borderTop: '1px solid rgba(18,60,105,0.12)', pt: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Unassigned Content</Typography>
                {(content?.unassigned_materials || []).length > 0 && <Stack spacing={1} sx={{ mb: 1.5 }}>{content.unassigned_materials.map(renderMaterial)}</Stack>}
                {(content?.unassigned_assignments || []).length > 0 && <Stack spacing={1}>{content.unassigned_assignments.map(renderAssignment)}</Stack>}
              </Box>
            )}
          </Box>
        </>
      )}
    </Stack>
  );
}

function AdminAssignmentsPane() {
  const [assignments, setAssignments] = React.useState([]);
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [filters, setFilters] = React.useState({ course_id: '', status: 'all', grading: 'all' });

  const loadAssignments = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        status: filters.status,
        grading: filters.grading,
      });
      if (filters.course_id) params.set('course_id', filters.course_id);

      const [assignmentsResponse, coursesResponse] = await Promise.all([
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/assignments?${params.toString()}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/courses`, {
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
  }, [filters]);

  React.useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const totals = assignments.reduce((summary, assignment) => ({
    assignments: summary.assignments + 1,
    submissions: summary.submissions + assignment.submissions.total,
    pending: summary.pending + assignment.submissions.pending_grading,
    graded: summary.graded + assignment.submissions.graded,
  }), { assignments: 0, submissions: 0, pending: 0, graded: 0 });

  const gradingChip = (assignment) => {
    if (assignment.grading.status === 'needs_grading') return <Chip label={`${assignment.submissions.pending_grading} need grading`} size="small" color="warning" />;
    if (assignment.grading.status === 'fully_graded') return <Chip label="Fully graded" size="small" color="success" />;
    return <Chip label="No submissions" size="small" />;
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>
          Assignments
        </Typography>
        <Typography sx={{ color: '#637083' }}>
          View assignments across courses, track due dates, submissions, and teacher grading activity.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 1.5 }}>
        {[
          ['Assignments', totals.assignments, '#123c69'],
          ['Submissions', totals.submissions, '#16805f'],
          ['Need grading', totals.pending, '#f05a28'],
          ['Graded', totals.graded, '#6d5dfc'],
        ].map(([label, value, color]) => (
          <Box key={label} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
            <Typography sx={{ color: '#637083', fontSize: 13, fontWeight: 800 }}>{label}</Typography>
            <Typography sx={{ color, fontWeight: 900, fontSize: '2.15rem', lineHeight: 1.1 }}>{value}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.3} alignItems={{ lg: 'center' }} justifyContent="space-between">
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Assignment Filters</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>Narrow the overview by course, open status, or grading progress.</Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ minWidth: { lg: 620 } }}>
            <TextField select size="small" label="Course" value={filters.course_id} onChange={(event) => setFilters((current) => ({ ...current, course_id: event.target.value }))} sx={{ flex: 1 }}>
              <MenuItem value="">All courses</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} sx={{ flex: 1 }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
            <TextField select size="small" label="Grading" value={filters.grading} onChange={(event) => setFilters((current) => ({ ...current, grading: event.target.value }))} sx={{ flex: 1 }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="needs_grading">Needs grading</MenuItem>
              <MenuItem value="fully_graded">Fully graded</MenuItem>
              <MenuItem value="no_submissions">No submissions</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Assignment Overview</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>{assignments.length} assignment{assignments.length === 1 ? '' : 's'} found</Typography>
          </Box>
          <Button variant="outlined" onClick={loadAssignments}>Refresh</Button>
        </Stack>

        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
        ) : assignments.length === 0 ? (
          <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>No assignments match these filters yet.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.2}>
            {assignments.map((assignment) => (
              <Box key={assignment.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: { xs: 1.3, md: 1.6 } }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={1.4}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', mb: 0.5 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{assignment.title}</Typography>
                      <Chip label={assignment.is_open ? 'Open' : 'Closed'} size="small" color={assignment.is_open ? 'success' : 'default'} />
                      {gradingChip(assignment)}
                    </Stack>
                    <Typography sx={{ color: '#526273', fontSize: 13 }}>
                      {assignment.course.title}{assignment.module ? ` | ${assignment.module.title}` : ''} | {assignment.total_points} points
                    </Typography>
                    <Typography sx={{ color: '#637083', fontSize: 13 }}>
                      Due: {formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                    <Typography sx={{ color: '#637083', fontSize: 13 }}>
                      Teacher: {assignment.teacher?.full_name || 'Unassigned'}
                    </Typography>
                    {assignment.submissions.latest_student && (
                      <Typography sx={{ color: '#637083', fontSize: 13 }}>
                        Latest submission: {assignment.submissions.latest_student.full_name} on {formatTimestamp(assignment.submissions.latest_submitted_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, 92px)' }, gap: 0.8, alignSelf: { lg: 'center' } }}>
                    {[
                      ['Submitted', assignment.submissions.total],
                      ['Graded', assignment.submissions.graded],
                      ['Pending', assignment.submissions.pending_grading],
                      ['Late', assignment.submissions.late],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ bgcolor: '#fff', borderRadius: 1, p: 1, textAlign: 'center' }}>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: '1.15rem' }}>{value}</Typography>
                        <Typography sx={{ color: '#637083', fontSize: 11, fontWeight: 800 }}>{label}</Typography>
                      </Box>
                    ))}
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

function AdminGradesPane() {
  const [records, setRecords] = React.useState([]);
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [filters, setFilters] = React.useState({ course_id: '', status: 'all', search: '' });

  const loadGrades = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        status: filters.status,
        search: filters.search,
      });
      if (filters.course_id) params.set('course_id', filters.course_id);

      const [gradesResponse, coursesResponse] = await Promise.all([
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/grades?${params.toString()}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/courses`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
      ]);
      const gradesData = await gradesResponse.json();
      const coursesData = await coursesResponse.json();
      if (!gradesResponse.ok) throw new Error(gradesData.detail || 'Unable to load grades');
      if (!coursesResponse.ok) throw new Error(coursesData.detail || 'Unable to load courses');
      setRecords(gradesData);
      setCourses(coursesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    loadGrades();
  }, [loadGrades]);

  const totals = records.reduce((summary, record) => {
    const isGraded = Boolean(record.grade);
    return {
      submissions: summary.submissions + 1,
      graded: summary.graded + (isGraded ? 1 : 0),
      ungraded: summary.ungraded + (isGraded ? 0 : 1),
      scoreTotal: summary.scoreTotal + (record.grade?.percentage || 0),
      scoreCount: summary.scoreCount + (isGraded && record.grade?.percentage !== null ? 1 : 0),
    };
  }, { submissions: 0, graded: 0, ungraded: 0, scoreTotal: 0, scoreCount: 0 });
  const average = totals.scoreCount ? Math.round((totals.scoreTotal / totals.scoreCount) * 10) / 10 : null;

  const exportPreview = records.map((record) => ({
    student: record.student.full_name,
    email: record.student.email,
    course: record.course.title,
    assignment: record.assignment.title,
    submitted_at: record.submitted_at,
    status: record.grade ? 'graded' : 'ungraded',
    score: record.grade?.score ?? '',
    total_points: record.grade?.total_points ?? record.assignment.total_points,
    percentage: record.grade?.percentage ?? '',
    teacher: record.teacher?.full_name || '',
  }));

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>
          Grades Overview
        </Typography>
        <Typography sx={{ color: '#637083' }}>
          View student grades across courses and check graded or ungraded submissions.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 1.5 }}>
        {[
          ['Submissions', totals.submissions, '#123c69'],
          ['Graded', totals.graded, '#16805f'],
          ['Ungraded', totals.ungraded, '#f05a28'],
          ['Average', average === null ? 'N/A' : `${average}%`, '#6d5dfc'],
        ].map(([label, value, color]) => (
          <Box key={label} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
            <Typography sx={{ color: '#637083', fontSize: 13, fontWeight: 800 }}>{label}</Typography>
            <Typography sx={{ color, fontWeight: 900, fontSize: '2.15rem', lineHeight: 1.1 }}>{value}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.3} alignItems={{ lg: 'center' }} justifyContent="space-between">
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Grade Filters</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>Search by student, email, course, or assignment.</Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ minWidth: { lg: 760 } }}>
            <TextField size="small" label="Search" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} sx={{ flex: 1.2 }} />
            <TextField select size="small" label="Course" value={filters.course_id} onChange={(event) => setFilters((current) => ({ ...current, course_id: event.target.value }))} sx={{ flex: 1 }}>
              <MenuItem value="">All courses</MenuItem>
              {courses.map((course) => (
                <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} sx={{ flex: 0.8 }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="graded">Graded</MenuItem>
              <MenuItem value="ungraded">Ungraded</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Grade Records</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>{records.length} export-ready record{records.length === 1 ? '' : 's'}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" disabled title="CSV export will use the export-ready grade data already loaded here.">Export later</Button>
            <Button variant="outlined" onClick={loadGrades}>Refresh</Button>
          </Stack>
        </Stack>

        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
        ) : records.length === 0 ? (
          <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>No grade records match these filters yet.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.2}>
            {records.map((record) => (
              <Box key={record.submission_id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: { xs: 1.3, md: 1.6 } }}>
                <Stack direction={{ xs: 'column', xl: 'row' }} justifyContent="space-between" spacing={1.4}>
                  <Stack direction="row" spacing={1.2} sx={{ minWidth: 0 }}>
                    <UserAvatar user={record.student} size={42} />
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 0.3 }} alignItems="center">
                        <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{record.student.full_name}</Typography>
                        <Chip label={record.grade ? 'Graded' : 'Ungraded'} size="small" color={record.grade ? 'success' : 'warning'} />
                        <Chip label={record.submission_status} size="small" />
                      </Stack>
                      <Typography sx={{ color: '#637083', fontSize: 13 }}>{record.student.email}</Typography>
                      <Typography sx={{ color: '#526273', fontSize: 13 }}>
                        {record.course.title} | {record.assignment.title}{record.assignment.module ? ` | ${record.assignment.module.title}` : ''}
                      </Typography>
                      <Typography sx={{ color: '#637083', fontSize: 13 }}>
                        Submitted: {formatTimestamp(record.submitted_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </Typography>
                      <Typography sx={{ color: '#637083', fontSize: 13 }}>
                        Teacher: {record.teacher?.full_name || 'Unassigned'}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, 106px)' }, gap: 0.8, alignSelf: { xl: 'center' } }}>
                    {[
                      ['Score', record.grade ? `${record.grade.score}/${record.grade.total_points}` : '--'],
                      ['Percent', record.grade?.percentage !== null && record.grade?.percentage !== undefined ? `${record.grade.percentage}%` : '--'],
                      ['Due', formatTimestamp(record.assignment.due_at, { month: 'short', day: 'numeric' })],
                      ['Graded', record.grade ? formatTimestamp(record.grade.graded_at, { month: 'short', day: 'numeric' }) : '--'],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ bgcolor: '#fff', borderRadius: 1, p: 1, textAlign: 'center' }}>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 900, fontSize: 13 }}>{value}</Typography>
                        <Typography sx={{ color: '#637083', fontSize: 11, fontWeight: 800 }}>{label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Stack>
                {record.grade?.feedback && (
                  <Box sx={{ bgcolor: '#fff', borderRadius: 1, p: 1, mt: 1 }}>
                    <Typography sx={{ color: '#637083', fontSize: 12, fontWeight: 800 }}>Feedback</Typography>
                    <Typography sx={{ color: 'primary.dark', fontSize: 13 }}>{record.grade.feedback}</Typography>
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Box sx={{ display: 'none' }} data-export-preview={JSON.stringify(exportPreview)} />
    </Stack>
  );
}

function AdminAnnouncementsPane({ onAdminDataChanged }) {
  const [announcements, setAnnouncements] = React.useState([]);
  const [courses, setCourses] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [filters, setFilters] = React.useState({ audience: 'all', urgent: 'all' });
  const [form, setForm] = React.useState({ title: '', body: '', audience: 'platform', course_id: '', is_urgent: false });

  const loadAnnouncements = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams(filters);
      const [announcementsResponse, coursesResponse] = await Promise.all([
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/announcements?${params.toString()}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/courses`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
      ]);
      const announcementsData = await announcementsResponse.json();
      const coursesData = await coursesResponse.json();
      if (!announcementsResponse.ok) throw new Error(announcementsData.detail || 'Unable to load announcements');
      if (!coursesResponse.ok) throw new Error(coursesData.detail || 'Unable to load courses');
      setAnnouncements(announcementsData);
      setCourses(coursesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const totals = announcements.reduce((summary, announcement) => ({
    total: summary.total + 1,
    platform: summary.platform + (announcement.audience === 'platform' ? 1 : 0),
    course: summary.course + (announcement.audience === 'course' ? 1 : 0),
    urgent: summary.urgent + (announcement.is_urgent ? 1 : 0),
  }), { total: 0, platform: 0, course: 0, urgent: 0 });

  const createAnnouncement = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/announcements`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          course_id: form.audience === 'course' ? Number(form.course_id) : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to post announcement');
      setAnnouncements((current) => [data, ...current]);
      setForm({ title: '', body: '', audience: 'platform', course_id: '', is_urgent: false });
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
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to delete announcement');
      setAnnouncements((current) => current.filter((announcement) => announcement.id !== announcementId));
      setMessage('Announcement deleted.');
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>
          Announcements
        </Typography>
        <Typography sx={{ color: '#637083' }}>
          Post platform-wide announcements, course-specific updates, and urgent notices.
        </Typography>
      </Box>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 1.5 }}>
        {[
          ['Announcements', totals.total, '#123c69'],
          ['Platform-wide', totals.platform, '#16805f'],
          ['Course-specific', totals.course, '#6d5dfc'],
          ['Urgent', totals.urgent, '#f05a28'],
        ].map(([label, value, color]) => (
          <Box key={label} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
            <Typography sx={{ color: '#637083', fontSize: 13, fontWeight: 800 }}>{label}</Typography>
            <Typography sx={{ color, fontWeight: 900, fontSize: '2.15rem', lineHeight: 1.1 }}>{value}</Typography>
          </Box>
        ))}
      </Box>

      <Box component="form" onSubmit={createAnnouncement} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <CampaignOutlined color="secondary" />
          <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Post Announcement</Typography>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 220px 260px' }, gap: 1.3 }}>
          <TextField label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required />
          <TextField select label="Audience" value={form.audience} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value, course_id: '' }))}>
            <MenuItem value="platform">Platform-wide</MenuItem>
            <MenuItem value="course">Course-specific</MenuItem>
          </TextField>
          <TextField select label="Course" value={form.course_id} onChange={(event) => setForm((current) => ({ ...current, course_id: event.target.value }))} disabled={form.audience !== 'course'} required={form.audience === 'course'}>
            <MenuItem value="">Select a course</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>
            ))}
          </TextField>
        </Box>
        <TextField label="Message" value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} multiline minRows={4} required fullWidth sx={{ mt: 1.3 }} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mt: 1.5 }}>
          <FormControlLabel control={<Switch checked={form.is_urgent} onChange={(event) => setForm((current) => ({ ...current, is_urgent: event.target.checked }))} />} label="Urgent notice" />
          <Button type="submit" variant="contained" color="secondary" disabled={saving || (form.audience === 'course' && !form.course_id)}>
            Post announcement
          </Button>
        </Stack>
      </Box>

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.3} alignItems={{ lg: 'center' }} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Posted Announcements</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>{announcements.length} announcement{announcements.length === 1 ? '' : 's'} found</Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ minWidth: { lg: 440 } }}>
            <TextField select size="small" label="Audience" value={filters.audience} onChange={(event) => setFilters((current) => ({ ...current, audience: event.target.value }))} sx={{ flex: 1 }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="platform">Platform-wide</MenuItem>
              <MenuItem value="course">Course-specific</MenuItem>
            </TextField>
            <TextField select size="small" label="Urgency" value={filters.urgent} onChange={(event) => setFilters((current) => ({ ...current, urgent: event.target.value }))} sx={{ flex: 1 }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={loadAnnouncements}>Refresh</Button>
          </Stack>
        </Stack>

        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
        ) : announcements.length === 0 ? (
          <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>No announcements match these filters yet.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.2}>
            {announcements.map((announcement) => (
              <Box key={announcement.id} sx={{ bgcolor: announcement.is_urgent ? 'rgba(240,90,40,0.1)' : '#eef3f8', border: announcement.is_urgent ? '1px solid rgba(240,90,40,0.34)' : '1px solid transparent', borderRadius: 1, p: { xs: 1.3, md: 1.6 } }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} justifyContent="space-between" spacing={1.4}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', mb: 0.5 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{announcement.title}</Typography>
                      <Chip label={announcement.audience === 'platform' ? 'Platform-wide' : 'Course-specific'} size="small" color="primary" />
                      {announcement.is_urgent && <Chip label="Urgent" size="small" color="error" />}
                    </Stack>
                    <Typography sx={{ color: '#526273', fontSize: 14, whiteSpace: 'pre-wrap' }}>{announcement.body}</Typography>
                    <Typography sx={{ color: '#637083', fontSize: 13, mt: 0.8 }}>
                      {announcement.course ? `${announcement.course.title} | ` : ''}{announcement.author.full_name} | {formatTimestamp(announcement.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                  </Box>
                  <Button variant="outlined" color="error" disabled={saving} onClick={() => deleteAnnouncement(announcement.id)} sx={{ alignSelf: { xs: 'flex-start', lg: 'center' } }}>
                    Delete
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

function AdminSupportPane({ onAdminDataChanged }) {
  const [tickets, setTickets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [filters, setFilters] = React.useState({ status: 'all', category: 'all', search: '' });

  const loadTickets = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams(filters);
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
  }, [filters]);

  React.useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const totals = tickets.reduce((summary, ticket) => ({
    total: summary.total + 1,
    open: summary.open + (ticket.status === 'open' ? 1 : 0),
    progress: summary.progress + (ticket.status === 'in_progress' ? 1 : 0),
    closed: summary.closed + (ticket.status === 'closed' ? 1 : 0),
  }), { total: 0, open: 0, progress: 0, closed: 0 });

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

  const statusChip = (status) => {
    if (status === 'open') return <Chip label="Open" size="small" color="warning" />;
    if (status === 'in_progress') return <Chip label="In progress" size="small" color="primary" />;
    return <Chip label="Closed" size="small" color="success" />;
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>
          Support
        </Typography>
        <Typography sx={{ color: '#637083' }}>
          Manage student questions, teacher issues, technical problems, and enrollment confirmation issues.
        </Typography>
      </Box>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }, gap: 1.5 }}>
        {[
          ['Tickets', totals.total, '#123c69'],
          ['Open', totals.open, '#f05a28'],
          ['In progress', totals.progress, '#6d5dfc'],
          ['Closed', totals.closed, '#16805f'],
        ].map(([label, value, color]) => (
          <Box key={label} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
            <Typography sx={{ color: '#637083', fontSize: 13, fontWeight: 800 }}>{label}</Typography>
            <Typography sx={{ color, fontWeight: 900, fontSize: '2.15rem', lineHeight: 1.1 }}>{value}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.3} alignItems={{ lg: 'center' }} justifyContent="space-between">
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Support Filters</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>Search by name, email, subject, or message.</Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ minWidth: { lg: 780 } }}>
            <TextField size="small" label="Search" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} sx={{ flex: 1.2 }} />
            <TextField select size="small" label="Category" value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))} sx={{ flex: 1 }}>
              <MenuItem value="all">All categories</MenuItem>
              {supportCategoryOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            <TextField select size="small" label="Status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} sx={{ flex: 0.8 }}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="in_progress">In progress</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </TextField>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Support Inbox</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>{tickets.length} ticket{tickets.length === 1 ? '' : 's'} found</Typography>
          </Box>
          <Button variant="outlined" onClick={loadTickets}>Refresh</Button>
        </Stack>

        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
        ) : tickets.length === 0 ? (
          <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>No support tickets match these filters yet.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.2}>
            {tickets.map((ticket) => (
              <Box key={ticket.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: { xs: 1.3, md: 1.6 } }}>
                <Stack direction={{ xs: 'column', xl: 'row' }} justifyContent="space-between" spacing={1.5}>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', mb: 0.5 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{ticket.subject}</Typography>
                      {statusChip(ticket.status)}
                      <Chip label={supportCategoryLabels[ticket.category] || ticket.category} size="small" color="primary" />
                    </Stack>
                    <Typography sx={{ color: '#637083', fontSize: 13 }}>
                      {ticket.name} | {ticket.email} | {formatTimestamp(ticket.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Typography>
                    {ticket.user && (
                      <Typography sx={{ color: '#637083', fontSize: 13 }}>
                        Linked account: {ticket.user.full_name} ({ticket.user.role})
                      </Typography>
                    )}
                    <Typography sx={{ color: '#526273', fontSize: 14, whiteSpace: 'pre-wrap', mt: 1 }}>
                      {ticket.message}
                    </Typography>
                    {ticket.attachment_url && (
                      <Typography component="a" href={ticket.attachment_url} target="_blank" rel="noreferrer" sx={{ display: 'block', color: '#123c69', fontSize: 13, mt: 0.8, overflowWrap: 'anywhere' }}>
                        Attachment: {ticket.attachment_url}
                      </Typography>
                    )}
                  </Box>

                  <Stack direction={{ xs: 'column', sm: 'row', xl: 'column' }} spacing={1} sx={{ minWidth: { xl: 170 }, alignSelf: { xl: 'center' } }}>
                    <Button variant={ticket.status === 'open' ? 'contained' : 'outlined'} color="warning" disabled={savingId === ticket.id} onClick={() => updateTicketStatus(ticket.id, 'open')}>
                      Open
                    </Button>
                    <Button variant={ticket.status === 'in_progress' ? 'contained' : 'outlined'} color="primary" disabled={savingId === ticket.id} onClick={() => updateTicketStatus(ticket.id, 'in_progress')}>
                      In progress
                    </Button>
                    <Button variant={ticket.status === 'closed' ? 'contained' : 'outlined'} color="success" disabled={savingId === ticket.id} onClick={() => updateTicketStatus(ticket.id, 'closed')}>
                      Closed
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
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

function AdminSettingsPane({ onAdminDataChanged }) {
  const [settings, setSettings] = React.useState(null);
  const [categoryText, setCategoryText] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const loadSettings = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/admin/settings`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load settings');
      setSettings(data);
      setCategoryText((data.course_categories || []).join('\n'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSection = (section, field, value) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const payload = {
        platform_profile: settings.platform_profile,
        enrollment_rules: settings.enrollment_rules,
        security: {
          ...settings.security,
          session_timeout_hours: Number(settings.security.session_timeout_hours) || 8,
          password_min_length: Number(settings.security.password_min_length) || 9,
        },
        course_categories: categoryText.split('\n').map((category) => category.trim()).filter(Boolean),
        notifications: settings.notifications,
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
      setSettings(data);
      setCategoryText((data.course_categories || []).join('\n'));
      setMessage('Settings saved.');
      onAdminDataChanged?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const settingPanel = (title, body, children) => (
    <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
      <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{title}</Typography>
      <Typography sx={{ color: '#637083', fontSize: 14, mb: 1.5 }}>{body}</Typography>
      {children}
    </Box>
  );

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>
          Settings
        </Typography>
        <Typography sx={{ color: '#637083' }}>
          Manage platform profile, enrollment rules, security defaults, categories, and notification preferences.
        </Typography>
      </Box>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      {loading || !settings ? (
        <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
      ) : (
        <Box component="form" onSubmit={saveSettings}>
          <Stack spacing={2}>
            {settingPanel('Platform Profile', 'Basic identity and contact details used across the platform.', (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.3 }}>
                <TextField label="Platform name" value={settings.platform_profile.platform_name || ''} onChange={(event) => updateSection('platform_profile', 'platform_name', event.target.value)} />
                <TextField label="Contact phone" value={settings.platform_profile.contact_phone || ''} onChange={(event) => updateSection('platform_profile', 'contact_phone', event.target.value)} />
                <TextField label="Contact email" value={settings.platform_profile.contact_email || ''} onChange={(event) => updateSection('platform_profile', 'contact_email', event.target.value)} />
                <TextField label="Support email" value={settings.platform_profile.support_email || ''} onChange={(event) => updateSection('platform_profile', 'support_email', event.target.value)} />
              </Box>
            ))}

            {settingPanel('Manual Enrollment Rules', 'Controls the default language and behavior for manual payment and course access approval.', (
              <Stack spacing={1.3}>
                <TextField label="Manual payment note" value={settings.enrollment_rules.manual_payment_note || ''} onChange={(event) => updateSection('enrollment_rules', 'manual_payment_note', event.target.value)} multiline minRows={2} />
                <TextField label="Enrollment instructions" value={settings.enrollment_rules.instructions || ''} onChange={(event) => updateSection('enrollment_rules', 'instructions', event.target.value)} multiline minRows={2} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.3}>
                  <TextField select label="Default enrollment status" value={settings.enrollment_rules.default_enrollment_status || 'pending'} onChange={(event) => updateSection('enrollment_rules', 'default_enrollment_status', event.target.value)} sx={{ flex: 1 }}>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                  </TextField>
                  <FormControlLabel control={<Switch checked={Boolean(settings.enrollment_rules.allow_rejected_reapply)} onChange={(event) => updateSection('enrollment_rules', 'allow_rejected_reapply', event.target.checked)} />} label="Allow rejected students to request again" sx={{ flex: 1 }} />
                </Stack>
              </Stack>
            ))}

            {settingPanel('Security', 'MVP-level security defaults. MFA and notification behavior will be wired deeper as those systems mature.', (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.3 }}>
                <TextField type="number" label="Session timeout hours" value={settings.security.session_timeout_hours || 8} onChange={(event) => updateSection('security', 'session_timeout_hours', event.target.value)} />
                <TextField type="number" label="Password minimum length" value={settings.security.password_min_length || 9} onChange={(event) => updateSection('security', 'password_min_length', event.target.value)} />
                <FormControlLabel control={<Switch checked={Boolean(settings.security.mfa_required)} onChange={(event) => updateSection('security', 'mfa_required', event.target.checked)} />} label="Require MFA" />
                <FormControlLabel control={<Switch checked={Boolean(settings.security.google_sign_in_enabled)} onChange={(event) => updateSection('security', 'google_sign_in_enabled', event.target.checked)} />} label="Google sign-in enabled" />
              </Box>
            ))}

            {settingPanel('Course Categories', 'One category per line. These can later drive course filtering and reporting.', (
              <TextField label="Categories" value={categoryText} onChange={(event) => setCategoryText(event.target.value)} multiline minRows={5} fullWidth />
            ))}

            {settingPanel('Notifications', 'Email notifications are prepared here and can be connected when the email service is added.', (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1 }}>
                <FormControlLabel control={<Switch checked={Boolean(settings.notifications.enrollment_decisions)} onChange={(event) => updateSection('notifications', 'enrollment_decisions', event.target.checked)} />} label="Enrollment approved/rejected" />
                <FormControlLabel control={<Switch checked={Boolean(settings.notifications.assignment_posted)} onChange={(event) => updateSection('notifications', 'assignment_posted', event.target.checked)} />} label="Assignment posted" />
                <FormControlLabel control={<Switch checked={Boolean(settings.notifications.grade_posted)} onChange={(event) => updateSection('notifications', 'grade_posted', event.target.checked)} />} label="Grade posted" />
                <FormControlLabel control={<Switch checked={Boolean(settings.notifications.urgent_announcements)} onChange={(event) => updateSection('notifications', 'urgent_announcements', event.target.checked)} />} label="Urgent announcements" />
              </Box>
            ))}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="flex-end">
              <Button variant="outlined" onClick={loadSettings} disabled={saving}>Reset</Button>
              <Button type="submit" variant="contained" color="secondary" disabled={saving}>Save settings</Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Stack>
  );
}

function AdminPortal({ user, onSignOut }) {
  const [activePane, setActivePane] = React.useState('dashboard');
  const [adminRefreshKey, setAdminRefreshKey] = React.useState(0);
  const activeItem = adminNavItems.find((item) => item.key === activePane) || adminNavItems[0];
  const markAdminDataChanged = React.useCallback(() => {
    setAdminRefreshKey((current) => current + 1);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fb', display: { md: 'grid' }, gridTemplateColumns: { md: '280px 1fr' } }}>
      <Box sx={{ bgcolor: '#082540', color: '#fff', p: { xs: 2, md: 2.5 }, position: { md: 'sticky' }, top: 0, height: { md: '100vh' }, overflowY: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box component="img" src="/images/logo.png" alt="Three13 IT Solutions" sx={{ height: 52, objectFit: 'contain' }} />
          <Chip label="Admin" size="small" sx={{ bgcolor: 'rgba(240,90,40,0.16)', color: '#ffd7c8', fontWeight: 800 }} />
        </Stack>

        <Stack spacing={0.8}>
          {adminNavItems.map((item) => {
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

      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid rgba(18,60,105,0.12)', px: { xs: 2, md: 4 }, py: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <UserAvatar user={user} size={42} />
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{user.full_name}</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13 }}>{user.email}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/" variant="outlined">Home</Button>
              <Button variant="contained" color="secondary" onClick={onSignOut}>Sign out</Button>
            </Stack>
          </Stack>
        </Box>

        <Box component="main" sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
          {activePane === 'dashboard' && <AdminDashboardHome refreshKey={adminRefreshKey} onAdminDataChanged={markAdminDataChanged} />}
          {activePane === 'students' && <AdminStudentsPane onAdminDataChanged={markAdminDataChanged} />}
          {activePane === 'teachers' && <AdminTeachersPane onAdminDataChanged={markAdminDataChanged} />}
          {activePane === 'courses' && <AdminCoursesPane onAdminDataChanged={markAdminDataChanged} />}
          {activePane === 'enrollment' && <AdminEnrollmentRequests onAdminDataChanged={markAdminDataChanged} />}
          {activePane === 'materials' && <AdminCourseMaterialsPane onAdminDataChanged={markAdminDataChanged} />}
          {activePane === 'assignments' && <AdminAssignmentsPane />}
          {activePane === 'grades' && <AdminGradesPane />}
          {activePane === 'announcements' && <AdminAnnouncementsPane onAdminDataChanged={markAdminDataChanged} />}
          {activePane === 'support' && <AdminSupportPane onAdminDataChanged={markAdminDataChanged} />}
          {activePane === 'history' && <AdminHistoryPane />}
          {activePane === 'settings' && <AdminSettingsPane onAdminDataChanged={markAdminDataChanged} />}
          {!['dashboard', 'students', 'teachers', 'courses', 'enrollment', 'materials', 'assignments', 'grades', 'announcements', 'support', 'history', 'settings'].includes(activePane) && <AdminPlaceholderPane item={activeItem} />}
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

function StudentDashboardHome({ setActivePane }) {
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

  const listPanel = (title, items, emptyText, renderItem) => (
    <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
      <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>{title}</Typography>
      {items.length === 0 ? (
        <Typography sx={{ color: '#637083', fontSize: 14 }}>{emptyText}</Typography>
      ) : (
        <Stack spacing={1}>{items.map(renderItem)}</Stack>
      )}
    </Box>
  );

  const approvedCourses = summary?.approved_courses || [];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>
          Student Dashboard
        </Typography>
        <Typography sx={{ color: '#637083' }}>
          Continue learning, track assignments, and follow course updates from one place.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress size={28} />
        </Stack>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.5 }}>
            {[
              { label: 'Enrolled courses', value: approvedCourses.length, color: '#123c69' },
              { label: 'Recent materials', value: summary.recent_materials.length, color: '#16805f' },
              { label: 'Upcoming assignments', value: summary.upcoming_assignments.length, color: '#f05a28' },
              { label: 'Recent grades', value: summary.recent_grades.length, color: '#b45309' },
            ].map((stat) => (
              <Box key={stat.label} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
                <Typography sx={{ color: '#637083', fontSize: 13, fontWeight: 700 }}>{stat.label}</Typography>
                <Typography sx={{ color: stat.color, fontWeight: 900, fontSize: '2.25rem', lineHeight: 1.1 }}>{stat.value}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 0.6 }}>Approved Courses</Typography>
                <Typography sx={{ color: '#637083', fontSize: 14 }}>
                  These are the courses currently open to you after admin approval.
                </Typography>
              </Box>
              <Button variant="contained" color="secondary" disabled={approvedCourses.length === 0} onClick={() => setActivePane('my-courses')}>
                Continue learning
              </Button>
            </Stack>
            {approvedCourses.length === 0 ? (
              <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.5, mt: 2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 700 }}>No approved courses yet.</Typography>
              </Box>
            ) : (
              <Stack spacing={1} sx={{ mt: 2 }}>
                {approvedCourses.map((item) => (
                  <Box key={item.course.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.4 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{item.course.title}</Typography>
                        {item.course.description && (
                          <Typography sx={{ color: '#637083', fontSize: 13 }}>{item.course.description}</Typography>
                        )}
                      </Box>
                      <Chip label="approved" size="small" color="success" sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }} />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1.5 }}>
            {listPanel('Recent Materials', summary.recent_materials, 'No materials posted yet.', (material) => (
              <Box key={material.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{material.title}</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13 }}>{material.course_title} | {material.material_type}</Typography>
              </Box>
            ))}

            {listPanel('Upcoming Assignments', summary.upcoming_assignments, 'No upcoming assignments yet.', (assignment) => (
              <Box key={assignment.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{assignment.title}</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13 }}>{assignment.course_title} | {assignment.total_points} points</Typography>
              </Box>
            ))}

            {listPanel('Recent Grades', summary.recent_grades, 'No grades posted yet.', (grade) => (
              <Box key={grade.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{grade.assignment_title}</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13 }}>{grade.course_title} | {grade.score}/{grade.total_points}</Typography>
              </Box>
            ))}

            {listPanel('Announcements', summary.announcements, 'No announcements yet.', (announcement) => (
              <Box key={announcement.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.2 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{announcement.title}</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13 }}>{announcement.course_title} by {announcement.author_name}</Typography>
              </Box>
            ))}
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
        <Stack direction="row" spacing={0.8} sx={{ flexWrap: 'wrap' }}>
          {course.teacher?.full_name && <Chip label={course.teacher.full_name} size="small" color="primary" />}
          {status && <Chip label={status} size="small" color={status === 'approved' ? 'success' : status === 'pending' ? 'warning' : 'default'} />}
        </Stack>
        <Button variant="contained" color="secondary" onClick={onOpen} disabled={disabled} sx={{ alignSelf: 'flex-start' }}>
          {label}
        </Button>
      </Stack>
    </Box>
  );
}

function StudentMyCoursesPane({ setActivePane }) {
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
            Due {formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })} | {assignment.total_points} points
          </Typography>
          {assignment.attachment_url && (
            <Typography component="a" href={assignment.attachment_url} target="_blank" rel="noreferrer" sx={{ color: '#123c69', fontSize: 13, fontWeight: 800 }}>
              {assignment.attachment_name || 'Assignment attachment'}
            </Typography>
          )}
        </Box>
        <Chip label={assignment.student_status.replace('_', ' ')} size="small" color={assignment.student_status === 'graded' ? 'success' : assignment.student_status === 'not_submitted' ? 'warning' : 'primary'} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }} />
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
          <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>No approved courses yet.</Typography>
          <Typography sx={{ color: '#637083', mb: 1.5 }}>You can browse available courses while admin reviews your enrollment.</Typography>
          <Button variant="contained" color="secondary" onClick={() => setActivePane('available-courses')}>Browse courses</Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          {courses.map((course) => <StudentCourseCard key={course.id} course={course} status="approved" onOpen={() => openCourse(course.id)} />)}
        </Box>
      )}
    </Stack>
  );
}

function StudentAvailableCoursesPane() {
  const [courses, setCourses] = React.useState([]);
  const [status, setStatus] = React.useState({ approved: [], pending: [], rejected: [] });
  const [requestingId, setRequestingId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [coursesResponse, statusResponse] = await Promise.all([
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/courses`),
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/enrollments`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      const coursesData = await coursesResponse.json();
      const statusData = await statusResponse.json();
      if (!coursesResponse.ok) throw new Error(coursesData.detail || 'Unable to load courses');
      if (!statusResponse.ok) throw new Error(statusData.detail || 'Unable to load enrollment status');
      setCourses(coursesData);
      setStatus(statusData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const statusByCourse = React.useMemo(() => {
    const map = {};
    ['approved', 'pending', 'rejected'].forEach((group) => {
      status[group].forEach((item) => { map[item.course.id] = item.status; });
    });
    return map;
  }, [status]);

  const requestCourse = async (courseId) => {
    setRequestingId(courseId);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/enrollment-requests`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId, prerequisites: 'no' }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to request enrollment');
      setMessage('Enrollment request sent. Course access is pending admin approval.');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <Stack spacing={3}>
      <StudentPageHeader title="Available Courses" subtitle="Browse active courses and request enrollment approval." icon={SchoolOutlined} />
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack> : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 1.5 }}>
          {courses.map((course) => {
            const currentStatus = statusByCourse[course.id];
            return (
              <StudentCourseCard
                key={course.id}
                course={course}
                status={currentStatus || 'not requested'}
                label={currentStatus === 'approved' ? 'Already enrolled' : currentStatus === 'pending' ? 'Pending approval' : 'Request enrollment'}
                onOpen={() => requestCourse(course.id)}
                disabled={Boolean(currentStatus)}
              />
            );
          })}
        </Box>
      )}
      {requestingId && <Typography sx={{ color: '#637083', fontSize: 13 }}>Sending request...</Typography>}
    </Stack>
  );
}

function StudentMaterialsPane() {
  const [materials, setMaterials] = React.useState([]);
  const [courseFilter, setCourseFilter] = React.useState('all');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [viewingMaterial, setViewingMaterial] = React.useState(null);

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
          ...courseContent.unassigned_materials.map((material) => ({ ...material, course: courseContent.course, module_title: 'General' })),
          ...courseContent.modules.flatMap((module) => module.materials.map((material) => ({ ...material, course: courseContent.course, module_title: module.title }))),
        ]);
        if (mounted) setMaterials(nextMaterials);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const visibleMaterials = materials.filter((material) => courseFilter === 'all' || material.course.id === Number(courseFilter));
  const courses = Array.from(new Map(materials.map((material) => [material.course.id, material.course])).values());

  if (viewingMaterial) {
    return <MaterialInlineViewer material={viewingMaterial} onBack={() => setViewingMaterial(null)} />;
  }

  return (
    <Stack spacing={3}>
      <StudentPageHeader
        title="Course Materials"
        subtitle="Recordings, documents, links, and downloadable learning resources."
        icon={FolderCopyOutlined}
        action={<TextField select size="small" label="Course" value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} sx={{ minWidth: 220 }}><MenuItem value="all">All courses</MenuItem>{courses.map((course) => <MenuItem key={course.id} value={course.id}>{course.title}</MenuItem>)}</TextField>}
      />
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack> : visibleMaterials.length === 0 ? (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2 }}>No materials posted yet.</Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }, gap: 1.4 }}>
          {visibleMaterials.map((material) => (
            <Box key={`${material.course.id}-${material.id}`} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.7 }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                  <Chip label={materialTypeLabels[material.material_type] || material.material_type} size="small" color="primary" />
                  <Chip label={material.module_title} size="small" />
                </Stack>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>{material.title}</Typography>
                {material.description && <Typography sx={{ color: '#637083', fontSize: 14 }}>{material.description}</Typography>}
                <Typography sx={{ color: '#637083', fontSize: 13 }}>{material.course.title}</Typography>
                {(material.file_url || material.external_url) && (
                  <Button onClick={() => setViewingMaterial(material)} variant="contained" color="secondary" sx={{ alignSelf: 'flex-start' }}>
                    Open material
                  </Button>
                )}
              </Stack>
            </Box>
          ))}
        </Box>
      )}
    </Stack>
  );
}

function StudentAssignmentsPane() {
  const [assignments, setAssignments] = React.useState([]);
  const [filter, setFilter] = React.useState('all');
  const [forms, setForms] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState(null);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/assignments?status=${filter}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to load assignments');
      setAssignments(data);
      setForms(data.reduce((next, assignment) => ({ ...next, [assignment.id]: { text_response: assignment.submission?.text_response || '', file_url: assignment.submission?.file_url || '' } }), {}));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => { load(); }, [load]);

  const submitAssignment = async (assignmentId) => {
    setSavingId(assignmentId);
    setError('');
    setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(forms[assignmentId] || {}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to submit assignment');
      setAssignments((current) => current.map((assignment) => (assignment.id === assignmentId ? data : assignment)));
      setMessage('Assignment submitted.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Stack spacing={3}>
      <StudentPageHeader
        title="Assignments"
        subtitle="View instructions, submit responses, and track grading status."
        icon={AssignmentOutlined}
        action={<TextField select size="small" label="Status" value={filter} onChange={(event) => setFilter(event.target.value)} sx={{ minWidth: 180 }}><MenuItem value="all">All</MenuItem><MenuItem value="open">Open</MenuItem><MenuItem value="submitted">Submitted</MenuItem><MenuItem value="graded">Graded</MenuItem><MenuItem value="late">Late</MenuItem></TextField>}
      />
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack> : assignments.length === 0 ? (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2 }}>No assignments in this view.</Box>
      ) : (
        <Stack spacing={1.4}>
          {assignments.map((assignment) => {
            const form = forms[assignment.id] || {};
            return (
              <Box key={assignment.id} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.8 }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} justifyContent="space-between">
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 0.7 }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>{assignment.title}</Typography>
                      <Chip label={assignment.student_status.replace('_', ' ')} size="small" color={assignment.student_status === 'graded' ? 'success' : assignment.student_status === 'late' ? 'error' : 'warning'} />
                    </Stack>
                    <Typography sx={{ color: '#637083', fontSize: 13 }}>{assignment.course.title} | Due {formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric', year: 'numeric' })} | {assignment.total_points} points</Typography>
                    {assignment.instructions && <Typography sx={{ color: '#526273', mt: 1, whiteSpace: 'pre-wrap' }}>{assignment.instructions}</Typography>}
                    {assignment.attachment_url && (
                      <Button component="a" href={assignment.attachment_url} target="_blank" rel="noreferrer" variant="outlined" size="small" sx={{ mt: 1 }}>
                        {assignment.attachment_name || 'Open homework file'}
                      </Button>
                    )}
                    {assignment.grade && <Alert severity="success" sx={{ mt: 1 }}>Grade: {assignment.grade.score}/{assignment.grade.total_points}{assignment.grade.feedback ? ` - ${assignment.grade.feedback}` : ''}</Alert>}
                  </Box>
                  <Stack spacing={1} sx={{ width: { xs: '100%', lg: 360 } }}>
                    <TextField size="small" label="Text response" value={form.text_response || ''} multiline minRows={3} onChange={(event) => setForms((current) => ({ ...current, [assignment.id]: { ...current[assignment.id], text_response: event.target.value } }))} />
                    <TextField size="small" label="File link" value={form.file_url || ''} onChange={(event) => setForms((current) => ({ ...current, [assignment.id]: { ...current[assignment.id], file_url: event.target.value } }))} />
                    <Button variant="contained" color="secondary" disabled={savingId === assignment.id || assignment.student_status === 'graded'} onClick={() => submitAssignment(assignment.id)}>Submit</Button>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

function StudentGradesPane() {
  const [grades, setGrades] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    let mounted = true;
    fetch(`${apiBaseUrl.replace(/\/$/, '')}/student/grades`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to load grades');
        if (mounted) setGrades(data);
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);
  return (
    <Stack spacing={3}>
      <StudentPageHeader title="My Grades" subtitle="Review scores and instructor feedback." icon={GradeOutlined} />
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack> : grades.length === 0 ? (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2 }}>No grades posted yet.</Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 1.4 }}>
          {grades.map((grade) => (
            <Box key={grade.id} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 1.8 }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>{grade.assignment.title}</Typography>
              <Typography sx={{ color: '#637083', fontSize: 13 }}>{grade.course.title} | {grade.teacher.full_name}</Typography>
              <Typography sx={{ color: '#16805f', fontWeight: 950, fontSize: '2rem', lineHeight: 1.2, mt: 1 }}>{grade.score}/{grade.total_points}</Typography>
              {grade.feedback && <Typography sx={{ color: '#526273', mt: 1 }}>{grade.feedback}</Typography>}
              <Typography sx={{ color: '#637083', fontSize: 12, mt: 1 }}>Graded {formatTimestamp(grade.graded_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
            </Box>
          ))}
        </Box>
      )}
    </Stack>
  );
}

function StudentAnnouncementsPane() {
  const [announcements, setAnnouncements] = React.useState([]);
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
  return (
    <Stack spacing={3}>
      <StudentPageHeader title="Announcements" subtitle="Course updates, platform notices, and deadline reminders." icon={CampaignOutlined} />
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? <Stack alignItems="center" sx={{ py: 5 }}><CircularProgress size={28} /></Stack> : announcements.length === 0 ? (
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2 }}>No announcements yet.</Box>
      ) : (
        <Stack spacing={1.3}>
          {announcements.map((announcement) => (
            <Box key={announcement.id} sx={{ bgcolor: announcement.is_urgent ? 'rgba(240,90,40,0.1)' : '#fff', border: `1px solid ${announcement.is_urgent ? 'rgba(240,90,40,0.28)' : 'rgba(18,60,105,0.12)'}`, borderRadius: 1.5, p: 1.8 }}>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 0.8 }}>
                <Typography sx={{ color: 'primary.dark', fontWeight: 950 }}>{announcement.title}</Typography>
                {announcement.is_urgent && <Chip label="Urgent" size="small" color="error" />}
                <Chip label={announcement.course?.title || 'Platform'} size="small" color="primary" />
              </Stack>
              <Typography sx={{ color: '#526273', whiteSpace: 'pre-wrap' }}>{announcement.body}</Typography>
              <Typography sx={{ color: '#637083', fontSize: 12, mt: 1 }}>{announcement.author.full_name} | {formatTimestamp(announcement.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function StudentProfilePane({ user }) {
  const [form, setForm] = React.useState({ subject: '', message: '', category: 'student_question' });
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const sendSupport = async (event) => {
    event.preventDefault();
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
      setForm({ subject: '', message: '', category: 'student_question' });
      setMessage('Message sent to support.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={3}>
      <StudentPageHeader title="Profile" subtitle="Your student account and support access." icon={AccountCircleOutlined} />
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.1fr' }, gap: 1.5 }}>
        <Box sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <UserAvatar user={user} size={68} />
            <Box>
              <Typography sx={{ color: 'primary.dark', fontWeight: 950, fontSize: '1.25rem' }}>{user.full_name}</Typography>
              <Typography sx={{ color: '#637083' }}>{user.email}</Typography>
              <Chip label="Student" color="primary" size="small" sx={{ mt: 1 }} />
            </Box>
          </Stack>
          <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.3, mt: 2 }}>
            <Typography sx={{ color: 'primary.dark', fontWeight: 850 }}>Account note</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>Password and profile photo management will be connected during the next account settings phase.</Typography>
          </Box>
        </Box>
        <Box component="form" onSubmit={sendSupport} sx={{ bgcolor: '#fff', border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2 }}>
          <Typography sx={{ color: 'primary.dark', fontWeight: 950, mb: 1 }}>Send Support Message</Typography>
          <Stack spacing={1.2}>
            <TextField select label="Topic" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
              {supportCategoryOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField label="Subject" value={form.subject} onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))} required />
            <TextField label="Message" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} multiline minRows={4} required />
            <Button type="submit" variant="contained" color="secondary" disabled={saving}>Send message</Button>
          </Stack>
        </Box>
      </Box>
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
          We will add course pages, materials, assignments, grades, announcements, and profile management behind this navigation.
        </Typography>
      </Box>
    </Box>
  );
}

function TeacherDashboardHome({ setActivePane }) {
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

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
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const courses = summary?.assigned_courses || [];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>Teacher Dashboard</Typography>
        <Typography sx={{ color: '#637083' }}>Manage assigned courses, materials, assignments, submissions, and course announcements.</Typography>
      </Box>
      {error && <Alert severity="error">{error}</Alert>}
      {loading ? (
        <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
            {[
              ['Assigned courses', courses.length, '#123c69'],
              ['Enrolled students', summary.total_students, '#16805f'],
              ['Need grading', summary.pending_submissions, '#f05a28'],
            ].map(([label, value, color]) => (
              <Box key={label} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
                <Typography sx={{ color: '#637083', fontSize: 13, fontWeight: 800 }}>{label}</Typography>
                <Typography sx={{ color, fontWeight: 900, fontSize: '2.15rem', lineHeight: 1.1 }}>{value}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>My Courses</Typography>
                <Typography sx={{ color: '#637083', fontSize: 14 }}>Open your course workspace to add content and assignments.</Typography>
              </Box>
              <Button variant="contained" color="secondary" disabled={courses.length === 0} onClick={() => setActivePane('my-courses')}>Open courses</Button>
            </Stack>
            <Stack spacing={1} sx={{ mt: 2 }}>
              {courses.length === 0 ? (
                <Typography sx={{ color: '#637083', fontSize: 14 }}>No courses assigned yet.</Typography>
              ) : courses.map((course) => (
                <Box key={course.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.2 }}>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{course.title}</Typography>
                  <Typography sx={{ color: '#637083', fontSize: 13 }}>{course.description || 'No description yet'}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1.5 }}>
            <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Upcoming Assignments</Typography>
              {(summary.upcoming_assignments || []).length === 0 ? <Typography sx={{ color: '#637083', fontSize: 14 }}>No upcoming assignments.</Typography> : (
                <Stack spacing={1}>{summary.upcoming_assignments.map((assignment) => (
                  <Box key={assignment.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.2 }}>
                    <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{assignment.title}</Typography>
                    <Typography sx={{ color: '#637083', fontSize: 13 }}>{assignment.course_title} | Due {formatTimestamp(assignment.due_at, { month: 'short', day: 'numeric' })}</Typography>
                  </Box>
                ))}</Stack>
              )}
            </Box>
            <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Recent Activity</Typography>
              {(summary.recent_activity || []).length === 0 ? <Typography sx={{ color: '#637083', fontSize: 14 }}>No submissions yet.</Typography> : (
                <Stack spacing={1}>{summary.recent_activity.map((item) => (
                  <Box key={item.submission_id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.2 }}>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      <Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>{item.student_name}</Typography>
                      <Chip label={item.graded ? 'graded' : 'needs grading'} size="small" color={item.graded ? 'success' : 'warning'} />
                    </Stack>
                    <Typography sx={{ color: '#637083', fontSize: 13 }}>{item.assignment_title} | {item.course_title}</Typography>
                  </Box>
                ))}</Stack>
              )}
            </Box>
          </Box>
        </>
      )}
    </Stack>
  );
}

function TeacherCourseWorkspace({ focus = 'courses' }) {
  const [courses, setCourses] = React.useState([]);
  const [selectedCourseId, setSelectedCourseId] = React.useState('');
  const [content, setContent] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [selectedAssignmentFile, setSelectedAssignmentFile] = React.useState(null);
  const [moduleForm, setModuleForm] = React.useState({ title: '', description: '', position: 1, is_visible: true });
  const [materialForm, setMaterialForm] = React.useState({ title: '', description: '', material_type: 'youtube', module_id: '', external_url: '', file_url: '', is_visible: true });
  const [assignmentForm, setAssignmentForm] = React.useState({ title: '', instructions: '', module_id: '', total_points: 100, due_date: '', is_open: true });

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
  const modules = content?.modules || [];

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
    } catch (err) { setError(err.message); } finally { setSaving(false); }
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
        body: JSON.stringify({ ...materialForm, title, module_id: materialForm.module_id ? Number(materialForm.module_id) : null, external_url: materialForm.external_url || null, file_url: fileUrl || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to add material');
      setContent(data);
      setMaterialForm({ title: '', description: '', material_type: 'youtube', module_id: materialForm.module_id, external_url: '', file_url: '', is_visible: true });
      setSelectedFile(null);
      setMessage('Material added.');
    } catch (err) { setError(err.message); } finally { setUploading(false); setSaving(false); }
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
        body: JSON.stringify({ title: assignmentForm.title, instructions: assignmentForm.instructions, module_id: assignmentForm.module_id ? Number(assignmentForm.module_id) : null, attachment_url: attachmentUrl || null, attachment_name: attachmentName || null, total_points: Number(assignmentForm.total_points) || 100, due_at, is_open: assignmentForm.is_open }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to create assignment');
      setContent(data);
      setAssignmentForm({ title: '', instructions: '', module_id: assignmentForm.module_id, total_points: 100, due_date: '', is_open: true });
      setSelectedAssignmentFile(null);
      setMessage('Assignment created.');
    } catch (err) { setError(err.message); } finally { setUploading(false); setSaving(false); }
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
        <Chip label={`${assignment.total_points} pts`} size="small" color="primary" />
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

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>{focus === 'assignments' ? 'Assignments' : focus === 'materials' ? 'Course Materials' : 'My Courses'}</Typography>
        <Typography sx={{ color: '#637083' }}>Manage content and assignments for courses assigned to you.</Typography>
      </Box>
      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ md: 'center' }}>
          <Box>
            <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{selectedCourse?.title || 'Course Workspace'}</Typography>
            <Typography sx={{ color: '#637083', fontSize: 14 }}>{selectedCourse?.description || 'Select a course to manage.'}</Typography>
          </Box>
          <TextField select label="Course" value={selectedCourseId} onChange={async (event) => { setSelectedCourseId(event.target.value); await loadContent(event.target.value); }} disabled={loading || courses.length === 0} sx={{ minWidth: { md: 320 } }}>
            {courses.map((course) => <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>)}
          </TextField>
        </Stack>
      </Box>
      {loading ? <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack> : courses.length === 0 ? (
        <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 2 }}><Typography sx={{ color: 'primary.dark', fontWeight: 800 }}>No assigned courses yet.</Typography></Box>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr 1fr' }, gap: 2 }}>
            <Box component="form" onSubmit={createModule} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Create Module / Week</Typography>
              <Stack spacing={1}>
                <TextField label="Title" value={moduleForm.title} onChange={(event) => setModuleForm((current) => ({ ...current, title: event.target.value }))} required />
                <TextField label="Description" value={moduleForm.description} onChange={(event) => setModuleForm((current) => ({ ...current, description: event.target.value }))} />
                <TextField type="number" label="Week order" value={moduleForm.position} onChange={(event) => setModuleForm((current) => ({ ...current, position: event.target.value }))} />
                <Button type="submit" variant="contained" color="secondary" disabled={saving}>Create module</Button>
              </Stack>
            </Box>
            <Box component="form" onSubmit={createMaterial} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Add Material</Typography>
              <Stack spacing={1}>
                <TextField label="Title" value={materialForm.title} onChange={(event) => setMaterialForm((current) => ({ ...current, title: event.target.value }))} placeholder="Optional if attaching a file" />
                <TextField select label="Type" value={materialForm.material_type} onChange={(event) => setMaterialForm((current) => ({ ...current, material_type: event.target.value }))}>{materialTypeOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField>
                <TextField select label="Module" value={materialForm.module_id} onChange={(event) => setMaterialForm((current) => ({ ...current, module_id: event.target.value }))}><MenuItem value="">Unassigned</MenuItem>{modules.map((module) => <MenuItem key={module.id} value={String(module.id)}>{module.title}</MenuItem>)}</TextField>
                <TextField label="External link" value={materialForm.external_url} onChange={(event) => setMaterialForm((current) => ({ ...current, external_url: event.target.value }))} />
                <Button variant="outlined" component="label" disabled={saving}>{selectedFile ? selectedFile.name : 'Choose file'}<input type="file" hidden onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} /></Button>
                <Button type="submit" variant="contained" color="secondary" disabled={saving || uploading}>{uploading ? 'Uploading...' : 'Add material'}</Button>
              </Stack>
            </Box>
            <Box component="form" onSubmit={createAssignment} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
              <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Create Assignment</Typography>
              <Stack spacing={1}>
                <TextField label="Title" value={assignmentForm.title} onChange={(event) => setAssignmentForm((current) => ({ ...current, title: event.target.value }))} required />
                <TextField label="Instructions" value={assignmentForm.instructions} onChange={(event) => setAssignmentForm((current) => ({ ...current, instructions: event.target.value }))} multiline minRows={2} />
                <TextField select label="Module" value={assignmentForm.module_id} onChange={(event) => setAssignmentForm((current) => ({ ...current, module_id: event.target.value }))}><MenuItem value="">Unassigned</MenuItem>{modules.map((module) => <MenuItem key={module.id} value={String(module.id)}>{module.title}</MenuItem>)}</TextField>
                <Stack direction="row" spacing={1}><TextField type="number" label="Points" value={assignmentForm.total_points} onChange={(event) => setAssignmentForm((current) => ({ ...current, total_points: event.target.value }))} sx={{ flex: 1 }} /><TextField type="date" label="Due date" value={assignmentForm.due_date} onChange={(event) => setAssignmentForm((current) => ({ ...current, due_date: event.target.value }))} InputLabelProps={{ shrink: true }} sx={{ flex: 1 }} /></Stack>
                <Button variant="outlined" component="label" disabled={saving}>{selectedAssignmentFile ? selectedAssignmentFile.name : 'Attach homework file'}<input type="file" hidden onChange={(event) => setSelectedAssignmentFile(event.target.files?.[0] || null)} /></Button>
                <Button type="submit" variant="contained" color="secondary" disabled={saving || uploading}>{uploading ? 'Uploading...' : 'Create assignment'}</Button>
              </Stack>
            </Box>
          </Box>
          <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>Course Structure</Typography><Button variant="outlined" onClick={refreshContent}>Refresh</Button></Stack>
            <Stack spacing={1.5}>
              {modules.length === 0 && <Typography sx={{ color: '#637083' }}>No modules yet.</Typography>}
              {modules.map((module) => (
                <Box key={module.id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.5 }}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{module.title}</Typography><Chip label={`Week order ${module.position}`} size="small" /></Stack>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 14 }}>Materials</Typography>
                  <Stack spacing={1} sx={{ my: 1 }}>{module.materials.length ? module.materials.map(renderMaterial) : <Typography sx={{ color: '#637083', fontSize: 13 }}>No materials.</Typography>}</Stack>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 800, fontSize: 14 }}>Assignments</Typography>
                  <Stack spacing={1} sx={{ mt: 1 }}>{module.assignments.length ? module.assignments.map(renderAssignment) : <Typography sx={{ color: '#637083', fontSize: 13 }}>No assignments.</Typography>}</Stack>
                </Box>
              ))}
              {(content?.unassigned_materials?.length > 0 || content?.unassigned_assignments?.length > 0) && (
                <Box sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.5 }}>
                  <Typography sx={{ color: 'primary.dark', fontWeight: 900, mb: 1 }}>Unassigned Content</Typography>
                  <Stack spacing={1}>{content.unassigned_materials.map(renderMaterial)}{content.unassigned_assignments.map(renderAssignment)}</Stack>
                </Box>
              )}
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  );
}

function TeacherSubmissionsPane({ gradesOnly = false }) {
  const [courses, setCourses] = React.useState([]);
  const [records, setRecords] = React.useState([]);
  const [filters, setFilters] = React.useState({ course_id: '', grading: gradesOnly ? 'graded' : 'all' });
  const [gradeForms, setGradeForms] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState(null);
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams({ grading: filters.grading });
      if (filters.course_id) params.set('course_id', filters.course_id);
      const [subRes, courseRes] = await Promise.all([
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/submissions?${params.toString()}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
        fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/courses`, { headers: { Authorization: `Bearer ${getToken()}` } }),
      ]);
      const subData = await subRes.json(); const courseData = await courseRes.json();
      if (!subRes.ok) throw new Error(subData.detail || 'Unable to load submissions');
      if (!courseRes.ok) throw new Error(courseData.detail || 'Unable to load courses');
      setRecords(subData); setCourses(courseData);
      setGradeForms(subData.reduce((forms, record) => ({ ...forms, [record.submission_id]: { score: record.grade?.score || '', total_points: record.grade?.total_points || record.assignment.total_points, feedback: record.grade?.feedback || '' } }), {}));
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, [filters]);
  React.useEffect(() => { load(); }, [load]);

  const gradeSubmission = async (submissionId) => {
    const form = gradeForms[submissionId];
    setSavingId(submissionId); setError(''); setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/submissions/${submissionId}/grade`, {
        method: 'POST', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: Number(form.score), total_points: Number(form.total_points), feedback: form.feedback }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to save grade');
      setMessage('Grade saved.');
      await load();
    } catch (err) { setError(err.message); } finally { setSavingId(null); }
  };

  return (
    <Stack spacing={3}>
      <Box><Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>{gradesOnly ? 'Grades' : 'Submissions'}</Typography><Typography sx={{ color: '#637083' }}>{gradesOnly ? 'Review graded submissions across your courses.' : 'Review student submissions and leave grades with feedback.'}</Typography></Box>
      {message && <Alert severity="success">{message}</Alert>}{error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}><TextField select label="Course" value={filters.course_id} onChange={(event) => setFilters((current) => ({ ...current, course_id: event.target.value }))} sx={{ flex: 1 }}><MenuItem value="">All courses</MenuItem>{courses.map((course) => <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>)}</TextField><TextField select label="Grading" value={filters.grading} onChange={(event) => setFilters((current) => ({ ...current, grading: event.target.value }))} sx={{ flex: 1 }}><MenuItem value="all">All</MenuItem><MenuItem value="ungraded">Ungraded</MenuItem><MenuItem value="graded">Graded</MenuItem></TextField><Button variant="outlined" onClick={load}>Refresh</Button></Stack>
      </Box>
      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>
        {loading ? <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack> : records.length === 0 ? <Typography sx={{ color: '#637083' }}>No submissions found.</Typography> : (
          <Stack spacing={1.4}>{records.map((record) => {
            const form = gradeForms[record.submission_id] || {};
            return (
              <Box key={record.submission_id} sx={{ bgcolor: '#eef3f8', borderRadius: 1, p: 1.5 }}>
                <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} justifyContent="space-between">
                  <Box sx={{ minWidth: 0 }}><Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{record.student.full_name}</Typography><Chip label={record.grade ? 'graded' : 'ungraded'} size="small" color={record.grade ? 'success' : 'warning'} /></Stack><Typography sx={{ color: '#637083', fontSize: 13 }}>{record.course.title} | {record.assignment.title}</Typography><Typography sx={{ color: '#637083', fontSize: 13 }}>Submitted {formatTimestamp(record.submitted_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>{record.text_response && <Typography sx={{ color: '#526273', mt: 1, whiteSpace: 'pre-wrap' }}>{record.text_response}</Typography>}{record.file_url && <Typography component="a" href={record.file_url} target="_blank" rel="noreferrer" sx={{ color: '#123c69', fontSize: 13 }}>Submission file</Typography>}</Box>
                  <Stack spacing={1} sx={{ minWidth: { lg: 360 } }}><Stack direction="row" spacing={1}><TextField size="small" type="number" label="Score" value={form.score} onChange={(event) => setGradeForms((current) => ({ ...current, [record.submission_id]: { ...current[record.submission_id], score: event.target.value } }))} sx={{ flex: 1 }} /><TextField size="small" type="number" label="Total" value={form.total_points} onChange={(event) => setGradeForms((current) => ({ ...current, [record.submission_id]: { ...current[record.submission_id], total_points: event.target.value } }))} sx={{ flex: 1 }} /></Stack><TextField size="small" label="Feedback" value={form.feedback} onChange={(event) => setGradeForms((current) => ({ ...current, [record.submission_id]: { ...current[record.submission_id], feedback: event.target.value } }))} multiline minRows={2} /><Button variant="contained" color="secondary" disabled={savingId === record.submission_id || !form.score} onClick={() => gradeSubmission(record.submission_id)}>Save grade</Button></Stack>
                </Stack>
              </Box>
            );
          })}</Stack>
        )}
      </Box>
    </Stack>
  );
}

function TeacherAnnouncementsPane() {
  const [courses, setCourses] = React.useState([]);
  const [announcements, setAnnouncements] = React.useState([]);
  const [form, setForm] = React.useState({ course_id: '', title: '', body: '', is_urgent: false });
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
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
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }, []);
  React.useEffect(() => { load(); }, [load]);
  const post = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/teacher/courses/${form.course_id}/announcements`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ title: form.title, body: form.body, audience: 'course', is_urgent: form.is_urgent }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to post announcement');
      setAnnouncements((current) => [data, ...current]); setForm((current) => ({ ...current, title: '', body: '', is_urgent: false })); setMessage('Announcement posted.');
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };
  return (
    <Stack spacing={3}><Box><Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>Announcements</Typography><Typography sx={{ color: '#637083' }}>Post course reminders, recording updates, and urgent notices.</Typography></Box>{message && <Alert severity="success">{message}</Alert>}{error && <Alert severity="error">{error}</Alert>}
      <Box component="form" onSubmit={post} sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}><Stack spacing={1.2}><TextField select label="Course" value={form.course_id} onChange={(event) => setForm((current) => ({ ...current, course_id: event.target.value }))}>{courses.map((course) => <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>)}</TextField><TextField label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required /><TextField label="Message" value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} multiline minRows={4} required /><Stack direction="row" justifyContent="space-between"><FormControlLabel control={<Switch checked={form.is_urgent} onChange={(event) => setForm((current) => ({ ...current, is_urgent: event.target.checked }))} />} label="Urgent notice" /><Button type="submit" variant="contained" color="secondary" disabled={saving || !form.course_id}>Post</Button></Stack></Stack></Box>
      <Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}>{loading ? <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack> : <Stack spacing={1.2}>{announcements.length === 0 ? <Typography sx={{ color: '#637083' }}>No announcements yet.</Typography> : announcements.map((announcement) => <Box key={announcement.id} sx={{ bgcolor: announcement.is_urgent ? 'rgba(240,90,40,0.1)' : '#eef3f8', borderRadius: 1, p: 1.4 }}><Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{announcement.title}</Typography>{announcement.is_urgent && <Chip label="Urgent" size="small" color="error" />}</Stack><Typography sx={{ color: '#526273', whiteSpace: 'pre-wrap' }}>{announcement.body}</Typography><Typography sx={{ color: '#637083', fontSize: 13 }}>{announcement.course?.title || 'Platform'} | {formatTimestamp(announcement.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Typography></Box>)}</Stack>}</Box>
    </Stack>
  );
}

function TeacherProfilePane({ user }) {
  return (
    <Stack spacing={3}><Box><Typography variant="h3" sx={{ color: 'primary.dark', fontSize: { xs: '2rem', md: '2.55rem' }, mb: 0.8 }}>Profile</Typography><Typography sx={{ color: '#637083' }}>Your instructor account details.</Typography></Box><Box sx={{ border: '1px solid rgba(18,60,105,0.12)', borderRadius: 1.5, p: 2, bgcolor: '#fff' }}><Stack direction="row" spacing={1.5} alignItems="center"><UserAvatar user={user} size={58} /><Box><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{user.full_name}</Typography><Typography sx={{ color: '#637083' }}>{user.email}</Typography><Chip label="Teacher" size="small" color="primary" sx={{ mt: 1 }} /></Box></Stack></Box></Stack>
  );
}

function TeacherPortal({ user, onSignOut }) {
  const [activePane, setActivePane] = React.useState('dashboard');
  const activeItem = teacherNavItems.find((item) => item.key === activePane) || teacherNavItems[0];
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fb', display: { md: 'grid' }, gridTemplateColumns: { md: '280px 1fr' } }}>
      <Box sx={{ bgcolor: '#082540', color: '#fff', p: { xs: 2, md: 2.5 }, position: { md: 'sticky' }, top: 0, height: { md: '100vh' }, overflowY: 'auto' }}><Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}><Box component="img" src="/images/logo.png" alt="Three13 IT Solutions" sx={{ height: 52, objectFit: 'contain' }} /><Chip label="Teacher" size="small" sx={{ bgcolor: 'rgba(240,90,40,0.16)', color: '#ffd7c8', fontWeight: 800 }} /></Stack><Stack spacing={0.8}>{teacherNavItems.map((item) => { const Icon = item.icon; const active = item.key === activePane; return <Button key={item.key} onClick={() => setActivePane(item.key)} startIcon={<Icon />} sx={{ justifyContent: 'flex-start', color: active ? '#fff' : 'rgba(255,255,255,0.76)', bgcolor: active ? 'rgba(240,90,40,0.95)' : 'transparent', border: active ? '1px solid rgba(255,255,255,0.22)' : '1px solid transparent', px: 1.4, py: 1, '&:hover': { bgcolor: active ? '#f05a28' : 'rgba(255,255,255,0.08)', color: '#fff' } }}>{item.label}</Button>; })}</Stack></Box>
      <Box sx={{ minWidth: 0 }}><Box sx={{ bgcolor: '#fff', borderBottom: '1px solid rgba(18,60,105,0.12)', px: { xs: 2, md: 4 }, py: 2 }}><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}><Stack direction="row" spacing={1.2} alignItems="center"><UserAvatar user={user} size={42} /><Box><Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{user.full_name}</Typography><Typography sx={{ color: '#637083', fontSize: 13 }}>{user.email}</Typography></Box></Stack><Stack direction="row" spacing={1}><Button component={RouterLink} to="/" variant="outlined">Home</Button><Button variant="contained" color="secondary" onClick={onSignOut}>Sign out</Button></Stack></Stack></Box>
        <Box component="main" sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
          {activePane === 'dashboard' && <TeacherDashboardHome setActivePane={setActivePane} />}
          {['my-courses', 'materials', 'assignments'].includes(activePane) && <TeacherCourseWorkspace focus={activePane === 'my-courses' ? 'courses' : activePane} />}
          {activePane === 'submissions' && <TeacherSubmissionsPane />}
          {activePane === 'grades' && <TeacherSubmissionsPane gradesOnly />}
          {activePane === 'announcements' && <TeacherAnnouncementsPane />}
          {activePane === 'profile' && <TeacherProfilePane user={user} />}
          {!['dashboard', 'my-courses', 'materials', 'assignments', 'submissions', 'grades', 'announcements', 'profile'].includes(activePane) && <StudentPlaceholderPane item={activeItem} />}
        </Box>
      </Box>
    </Box>
  );
}

function StudentPortal({ user, onSignOut }) {
  const [activePane, setActivePane] = React.useState('dashboard');
  const activeItem = studentNavItems.find((item) => item.key === activePane) || studentNavItems[0];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fb', display: { md: 'grid' }, gridTemplateColumns: { md: '280px 1fr' } }}>
      <Box sx={{ bgcolor: '#082540', color: '#fff', p: { xs: 2, md: 2.5 }, position: { md: 'sticky' }, top: 0, height: { md: '100vh' }, overflowY: 'auto' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box component="img" src="/images/logo.png" alt="Three13 IT Solutions" sx={{ height: 52, objectFit: 'contain' }} />
          <Chip label="Student" size="small" sx={{ bgcolor: 'rgba(240,90,40,0.16)', color: '#ffd7c8', fontWeight: 800 }} />
        </Stack>

        <Stack spacing={0.8}>
          {studentNavItems.map((item) => {
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

      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid rgba(18,60,105,0.12)', px: { xs: 2, md: 4 }, py: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5}>
            <Stack direction="row" spacing={1.2} alignItems="center">
              <UserAvatar user={user} size={42} />
              <Box>
                <Typography sx={{ color: 'primary.dark', fontWeight: 900 }}>{user.full_name}</Typography>
                <Typography sx={{ color: '#637083', fontSize: 13 }}>{user.email}</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button component={RouterLink} to="/" variant="outlined">Home</Button>
              <Button variant="contained" color="secondary" onClick={onSignOut}>Sign out</Button>
            </Stack>
          </Stack>
        </Box>

        <Box component="main" sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
          {activePane === 'dashboard' && <StudentDashboardHome setActivePane={setActivePane} />}
          {activePane === 'my-courses' && <StudentMyCoursesPane setActivePane={setActivePane} />}
          {activePane === 'available-courses' && <StudentAvailableCoursesPane />}
          {activePane === 'materials' && <StudentMaterialsPane />}
          {activePane === 'assignments' && <StudentAssignmentsPane />}
          {activePane === 'grades' && <StudentGradesPane />}
          {activePane === 'announcements' && <StudentAnnouncementsPane />}
          {activePane === 'profile' && <StudentProfilePane user={user} />}
          {!['dashboard', 'my-courses', 'available-courses', 'materials', 'assignments', 'grades', 'announcements', 'profile'].includes(activePane) && <StudentPlaceholderPane item={activeItem} />}
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

  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate('/login');
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
      })
      .catch((err) => {
        window.localStorage.removeItem('three13_token');
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleSignOut = () => {
    window.localStorage.removeItem('three13_token');
    navigate('/login');
  };

  return (
    <ThemeProvider theme={theme}>
      {!loading && user?.role === 'admin' ? (
        <AdminPortal user={user} onSignOut={handleSignOut} />
      ) : !loading && user?.role === 'teacher' ? (
        <TeacherPortal user={user} onSignOut={handleSignOut} />
      ) : !loading && user?.role === 'student' ? (
        <StudentPortal user={user} onSignOut={handleSignOut} />
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
              <Button variant="contained" color="secondary" onClick={() => navigate('/login')}>Back to sign in</Button>
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
