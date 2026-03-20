/**
 * @file AttendanceTeacher.jsx
 * @description Attendance page for teachers.
 *
 * Tabs:
 *  0 — Roll-call   : pick a session and mark student attendance
 *  1 — My Records  : personal attendance history (self-service)
 *
 * Role: TEACHER
 *
 * Navigation contract:
 *   ScheduleTeacher navigates to /teacher/attendance with:
 *     location.state = { session: <StudentSchedule document> }
 *   This auto-selects the session and switches to the Roll-call tab.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, Stack, Paper, Avatar, Chip,
  Alert, CircularProgress, Snackbar, Button,
  FormControl, InputLabel, Select, MenuItem,
  alpha, useTheme, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
} from '@mui/material';
import {
  HowToReg, History, CalendarMonth, CheckCircle,
  Cancel, HelpOutline,
} from '@mui/icons-material';

import KPICards        from '../../../components/shared/KpiCard';
import useFormSnackbar from '../../../hooks/useFormSnackBar';
import {
  AttendanceStatusChip,
  AttendanceSummaryBar,
  AttendanceEmptyState,
  AttendanceSelfFilters,
  AttendanceLinearBar,
} from '../../../components/attendance/AttendanceShared';
import RollCallSheet from '../../../components/attendance/RollCallSheet';
import {
  getSessionStudentAttendance,
  initStudentAttendance,
  toggleStudentAttendance,
  justifyStudentAbsence,
  submitStudentAttendance,
  getMyTeacherAttendance,
  getMyTeacherAttendanceStats,
} from '../../../services/attendance.service';
import { useLocation } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────

const AttendanceTeacher = () => {
  const location = useLocation();

  // Auto-switch to roll-call tab when navigated here with a session in state
  const incomingSession = location.state?.session ?? null;
  const [tab,             setTab]             = useState(incomingSession ? 0 : 0);
  const [selectedSession, setSelectedSession] = useState(incomingSession);

  // When the user navigates back here with a different session, update state
  useEffect(() => {
    if (location.state?.session) {
      setSelectedSession(location.state.session);
      setTab(0);
    }
  }, [location.state?.session?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800}>Attendance</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage roll-call for your sessions and view your own attendance record
        </Typography>
      </Box>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
          '& .MuiTabs-indicator': { height: 3, borderRadius: 2 },
        }}
      >
        <Tab value={0} label="Roll-call"     icon={<HowToReg />} iconPosition="start" />
        <Tab value={1} label="My Attendance" icon={<History />}  iconPosition="start" />
      </Tabs>

      {/* Always mount both tabs but only show the active one */}
      <Box display={tab === 0 ? 'block' : 'none'}>
        <TeacherRollCallTab
          selectedSession={selectedSession}
          onSessionClear={() => setSelectedSession(null)}
        />
      </Box>
      <Box display={tab === 1 ? 'block' : 'none'}>
        <TeacherSelfTab />
      </Box>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROLL-CALL TAB
// Manages all API calls directly (no useAttendance hook) for precision control.
// ─────────────────────────────────────────────────────────────────────────────

const TeacherRollCallTab = ({ selectedSession, onSessionClear }) => {
  const theme = useTheme();
  const { snackbar, showSnackbar, closeSnackbar } = useFormSnackbar();

  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  // Derive the first class and a stable date string from the session
  const sessionClassId = useMemo(() => {
    if (!selectedSession) return null;
    // StudentSchedule stores classes as [{classId, className}]
    // The controller also accepts a flat `class._id` from older formats
    return (
      selectedSession.classes?.[0]?.classId?._id
      || selectedSession.classes?.[0]?.classId
      || selectedSession.class?._id
      || selectedSession.class
      || null
    );
  }, [selectedSession]);

  const attendanceDateISO = useMemo(() => {
    if (!selectedSession?.startTime) return null;
    return new Date(selectedSession.startTime).toISOString().slice(0, 10);
  }, [selectedSession?.startTime]);

  // Fetch existing attendance records whenever the session changes
  const loadRecords = useCallback(async () => {
    if (!selectedSession?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getSessionStudentAttendance(selectedSession._id, {
        date:    attendanceDateISO,
        classId: sessionClassId,
      });
      const raw = res.data?.data ?? res.data;
      setRecords(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance records.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [selectedSession?._id, attendanceDateISO, sessionClassId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const handleInit = useCallback(async (scheduleId, payload) => {
    await initStudentAttendance(scheduleId, payload);
    await loadRecords();
  }, [loadRecords]);

  const handleToggle = useCallback(async (attendanceId, status) => {
    await toggleStudentAttendance(attendanceId, { status });
    await loadRecords();
  }, [loadRecords]);

  const handleJustify = useCallback(async (attendanceId, payload) => {
    await justifyStudentAbsence(attendanceId, payload);
    showSnackbar('Justification saved.', 'success');
    await loadRecords();
  }, [loadRecords, showSnackbar]);

  const handleSubmit = useCallback(async (scheduleId, date, classId) => {
    await submitStudentAttendance(scheduleId, {
      attendanceDate: date,
      classId,
    });
    showSnackbar('Attendance sheet locked successfully.', 'success');
    await loadRecords();
  }, [loadRecords, showSnackbar]);

  // ── Summary computed locally ───────────────────────────────────────────────

  const summary = useMemo(() => {
    const total     = records.length;
    const present   = records.filter((r) => r.status === true).length;
    const absent    = records.filter((r) => r.status === false).length;
    const justified = records.filter((r) => r.isJustified).length;
    const locked    = records.filter((r) => r.isLocked).length;
    const rate      = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, justified, locked, rate };
  }, [records]);

  // ── No session selected ────────────────────────────────────────────────────

  if (!selectedSession) {
    return (
      <Paper
        sx={{
          p: 4, textAlign: 'center', borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <HowToReg sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" fontWeight={700} mb={1}>
          No session selected
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Go to your <strong>Schedule</strong>, open a session and click{' '}
          <strong>"Start Roll-call"</strong> to begin.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          The "Start Roll-call" button appears on past and in-progress published sessions.
        </Typography>
      </Paper>
    );
  }

  // ── Session header ─────────────────────────────────────────────────────────

  const subjectName = selectedSession.subject?.subject_name
    || selectedSession.subject?.name
    || selectedSession.subject
    || 'Session';

  const className = selectedSession.classes?.[0]?.className
    || selectedSession.class?.className
    || selectedSession.class
    || '—';

  return (
    <Box>
      {/* Session info banner */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <CalendarMonth />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>{subjectName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {className}
                {selectedSession.startTime && ` · ${new Date(selectedSession.startTime).toLocaleString('en-GB', {
                  weekday: 'short', day: 'numeric', month: 'short',
                  hour: '2-digit', minute: '2-digit',
                })}`}
              </Typography>
            </Box>
          </Stack>
          <Button size="small" variant="outlined" color="inherit" onClick={onSessionClear}>
            Change session
          </Button>
        </Stack>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <RollCallSheet
        session={{
          ...selectedSession,
          // Normalise: RollCallSheet expects session.class and session.subject as objects
          class:   { _id: sessionClassId, className },
          subject: {
            _id:  selectedSession.subject?.subjectId || selectedSession.subject?._id || selectedSession.subject,
            name: subjectName,
          },
        }}
        records={records}
        loading={loading}
        summary={summary}
        onInit={handleInit}
        onToggle={handleToggle}
        onJustify={handleJustify}
        onSubmit={handleSubmit}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SELF-SERVICE TAB — teacher's own attendance history
// ─────────────────────────────────────────────────────────────────────────────

const TeacherSelfTab = () => {
  const theme = useTheme();

  const [filters,      setFilters]      = useState({ academicYear: '', semester: '', period: 'all' });
  const [records,      setRecords]      = useState([]);
  const [statsData,    setStatsData]    = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error,        setError]        = useState(null);

  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const loadAttendance = useCallback(async () => {
    if (!filters.academicYear || !filters.semester) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getMyTeacherAttendance({
        academicYear: filters.academicYear,
        semester:     filters.semester,
      });
      const raw = res.data?.data ?? res.data;
      setRecords(Array.isArray(raw) ? raw : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  }, [filters.academicYear, filters.semester]);

  const loadStats = useCallback(async () => {
    if (!filters.academicYear || !filters.semester) return;
    setStatsLoading(true);
    try {
      const res = await getMyTeacherAttendanceStats({
        academicYear: filters.academicYear,
        semester:     filters.semester,
        period:       filters.period || 'all',
      });
      setStatsData(res.data?.data ?? null);
    } finally {
      setStatsLoading(false);
    }
  }, [filters.academicYear, filters.semester, filters.period]);

  const handleLoad = () => {
    loadAttendance();
    loadStats();
  };

  const kpis = statsData ? [
    { key: 'total',   label: 'Total Sessions', value: statsData.totalSessions,  icon: <CalendarMonth />, color: theme.palette.grey[700] },
    { key: 'present', label: 'Present',        value: statsData.presentCount,   icon: <CheckCircle />,   color: theme.palette.success.main },
    { key: 'absent',  label: 'Absent',         value: statsData.absentCount,    icon: <Cancel />,        color: theme.palette.error.main },
    { key: 'hours',   label: 'Total Hours',
      value: `${(statsData.totalHours ?? 0).toFixed(1)}h`,
      icon: <History />, color: theme.palette.secondary.main },
  ] : [];

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2} mb={3}
        alignItems={{ sm: 'flex-end' }}
        flexWrap="wrap"
      >
        <AttendanceSelfFilters filters={filters} onChange={handleFilterChange} />
        <Button
          variant="contained"
          onClick={handleLoad}
          disabled={!filters.academicYear || !filters.semester || loading}
        >
          {loading ? <CircularProgress size={18} color="inherit" /> : 'Load Records'}
        </Button>
      </Stack>

      {/* Stats KPIs */}
      {statsLoading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : statsData ? (
        <Box mb={3}>
          <KPICards metrics={kpis} />
          <Box mt={2}>
            <AttendanceLinearBar
              rate={statsData.attendanceRate ?? 0}
              label={`Attendance rate — ${(statsData.attendanceRate ?? 0).toFixed(1)}%`}
            />
          </Box>
        </Box>
      ) : null}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Records table */}
      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : records.length === 0 ? (
        <AttendanceEmptyState
          message={
            !filters.academicYear
              ? 'Select an academic year and semester, then click "Load Records".'
              : 'No attendance records found for this period.'
          }
        />
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.06) }}>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Session</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {record.attendanceDate
                        ? new Date(record.attendanceDate).toLocaleDateString('en-GB', {
                            weekday: 'short', day: 'numeric', month: 'short',
                          })
                        : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{record.class?.className || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {record.sessionStartTime} – {record.sessionEndTime}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {record.sessionDuration != null
                        ? `${Math.floor(record.sessionDuration / 60)}h${String(record.sessionDuration % 60).padStart(2, '0')}`
                        : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <AttendanceStatusChip status={record.status} isJustified={record.isJustified} />
                  </TableCell>
                  <TableCell>
                    {record.status ? (
                      record.isPaid
                        ? <Chip label="Paid" size="small" color="success" />
                        : <Chip label="Pending" size="small" color="warning" />
                    ) : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AttendanceTeacher;