import React from 'react';
import {
  Avatar,
  Box,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TableRow,
  TableCell,
  Checkbox,
} from '@mui/material';
import {
  PersonAdd,
  People,
  TrendingUp,
  Schedule,
  Edit,
  Delete,
  Visibility,
  Phone,
  Badge as BadgeIcon,
} from '@mui/icons-material';

/**
 * TEACHER ENTITY CONFIGURATION
 * Demonstrates how easily we can create a new entity page
 */

// ========================================
// KPI METRICS
// ========================================
export const getKPIMetrics = (kpis, theme) => [
  {
    label: 'Total Teachers',
    value: kpis.total || 0,
    icon: <People sx={{ fontSize: 28 }} />,
    color: theme.palette.primary.main,
    trend: 3.5,
    subtitle: 'Active staff',
  },
  {
    label: 'New Hires',
    value: kpis.newThisMonth || 0,
    icon: <PersonAdd sx={{ fontSize: 28 }} />,
    color: theme.palette.success.main,
    trend: 8.2,
    subtitle: 'This month',
  },
  {
    label: 'Teaching Hours',
    value: kpis.totalHours || 0,
    icon: <Schedule sx={{ fontSize: 28 }} />,
    color: theme.palette.info.main,
    subtitle: 'Weekly total',
    progress: kpis.hoursUtilization || 0,
    progressLabel: 'Utilization',
  },
  {
    label: 'Performance',
    value: `${(kpis.avgPerformance || 0).toFixed(1)}%`,
    icon: <TrendingUp sx={{ fontSize: 28 }} />,
    color: theme.palette.success.main,
    trend: 4.1,
    subtitle: 'Average rating',
  },
];

// ========================================
// TABLE COLUMNS
// ========================================
export const tableColumns = [
  { key: 'teacher', label: 'Teacher' },
  { key: 'staffId', label: 'Staff ID' },
  { key: 'department', label: 'Department' },
  { key: 'subjects', label: 'Subjects' },
  { key: 'contact', label: 'Contact' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', align: 'right' },
];

// ========================================
// FILTERS CONFIGURATION
// ========================================
export const getFilterConfig = (departments = [], subjects = []) => [
  {
    key: 'department',
    label: 'Department',
    type: 'select',
    options: [
      { value: '', label: 'All Departments' },
      ...departments.map((d) => ({ value: d._id, label: d.name })),
    ],
  },
  {
    key: 'subject',
    label: 'Subject',
    type: 'select',
    options: [
      { value: '', label: 'All Subjects' },
      ...subjects.map((s) => ({ value: s._id, label: s.name })),
    ],
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: '', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'on_leave', label: 'On Leave' },
      { value: 'suspended', label: 'Suspended' },
      { value: 'archived', label: 'Archived' },
    ],
  },
  {
    key: 'qualification',
    label: 'Qualification',
    type: 'select',
    options: [
      { value: '', label: 'All Qualifications' },
      { value: 'bachelor', label: "Bachelor's" },
      { value: 'master', label: "Master's" },
      { value: 'phd', label: 'PhD' },
    ],
  },
];

// ========================================
// TABLE ROW RENDERER
// ========================================
export const renderTableRow = (teacher, helpers) => {
  const { selected, onSelect, onView, onEdit, onArchive, theme, isMobile } = helpers;
  
  return (
    <TableRow key={teacher._id} hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onChange={onSelect} />
      </TableCell>

      {/* Teacher Info */}
      <TableCell>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={teacher.profileImage}
            sx={{
              width: 40,
              height: 40,
              border: `2px solid ${theme.palette.primary.light}`,
            }}
          >
            {teacher.firstName?.[0]}
            {teacher.lastName?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {teacher.firstName} {teacher.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {teacher.email}
            </Typography>
          </Box>
        </Stack>
      </TableCell>

      {/* Staff ID */}
      <TableCell>
        <Chip
          icon={<BadgeIcon />}
          label={teacher.staffId || 'N/A'}
          size="small"
          variant="outlined"
        />
      </TableCell>

      {/* Department */}
      <TableCell>
        <Typography variant="body2" fontWeight={500}>
          {teacher.department?.name || 'N/A'}
        </Typography>
      </TableCell>

      {/* Subjects */}
      <TableCell>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {(teacher.subjects || []).slice(0, 2).map((subject) => (
            <Chip
              key={subject._id}
              label={subject.name}
              size="small"
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
          {teacher.subjects?.length > 2 && (
            <Chip
              label={`+${teacher.subjects.length - 2}`}
              size="small"
              sx={{ fontSize: '0.7rem' }}
            />
          )}
        </Stack>
      </TableCell>

      {/* Contact */}
      <TableCell>
        <Typography variant="caption" sx={{ display: 'flex', gap: 0.5 }}>
          <Phone sx={{ fontSize: 14 }} />
          {teacher.phone}
        </Typography>
      </TableCell>

      {/* Status */}
      {!isMobile && (
        <TableCell>
          <Chip
            label={teacher.status || 'active'}
            size="small"
            color={teacher.status === 'active' ? 'success' : 'warning'}
            sx={{ fontWeight: 600 }}
          />
        </TableCell>
      )}

      {/* Actions */}
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="View Details">
            <IconButton size="small" onClick={onView}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" color="info" onClick={onEdit}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Archive">
            <IconButton size="small" color="error" onClick={onArchive}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

// ========================================
// MAIN CONFIGURATION OBJECT
// ========================================
export const teacherConfig = {
  // Entity identification
  entityName: 'Teacher',
  entityNamePlural: 'Teachers',
  apiEndpoint: 'teacher',
  
  // UI Customization
  addButtonText: 'Add New Teacher',
  addButtonIcon: <PersonAdd />,
  searchPlaceholder: 'Search by name, email, staff ID...',
  
  // Features
  getKPIMetrics,
  tableColumns,
  getFilterConfig,
  renderTableRow,
  
  // Available bulk actions
  bulkActions: ['changeDepartment', 'sendEmail', 'archive', 'export'],
  
  // Related data to fetch
  relatedDataEndpoints: {
    departments: '/department',
    subjects: '/subject',
  },
};

export default teacherConfig;