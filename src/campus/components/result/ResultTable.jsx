import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Avatar,
  useTheme,
  useMediaQuery,
  LinearProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

/**
 * REUSABLE RESULT TABLE COMPONENT
 * 
 * Features:
 * - Automatic color coding (Red < 10, Blue 10-15, Green > 15)
 * - Responsive design
 * - Grade display with mentions
 * - Works for Student/Class/Campus views
 * 
 * @param {Array} results - Array of result objects
 * @param {Function} onEdit - Edit handler (optional)
 * @param {Function} onDelete - Delete handler (optional)
 * @param {Function} onView - View details handler
 * @param {Boolean} showStudent - Show student column (default: true)
 * @param {Boolean} readOnly - Hide action buttons
 */
const ResultTable = ({
  results = [],
  onEdit,
  onDelete,
  onView,
  showStudent = true,
  readOnly = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Calculate statistics
  const stats = useMemo(() => {
    if (results.length === 0) return null;

    const scores = results.map(r => (r.score / r.maxScore) * 20); // Normalize to /20
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const passCount = results.filter(r => r.status === 'pass').length;
    const passRate = (passCount / results.length) * 100;

    return {
      average: average.toFixed(2),
      passRate: passRate.toFixed(1),
      total: results.length,
      passCount,
    };
  }, [results]);

  // Get score color based on value (out of 20)
  const getScoreColor = (score, maxScore = 20) => {
    const normalized = (score / maxScore) * 20;
    if (normalized < 10) return '#ef4444'; // Red
    if (normalized < 15) return '#3b82f6'; // Blue
    return '#10b981'; // Green
  };

  // Get background color (lighter version)
  const getScoreBgColor = (score, maxScore = 20) => {
    const normalized = (score / maxScore) * 20;
    if (normalized < 10) return '#fef2f2'; // Light red
    if (normalized < 15) return '#eff6ff'; // Light blue
    return '#f0fdf4'; // Light green
  };

  // Get grade icon
  const getGradeIcon = (status) => {
    return status === 'pass' ? (
      <TrendingUpIcon sx={{ fontSize: 16, color: '#10b981' }} />
    ) : (
      <TrendingDownIcon sx={{ fontSize: 16, color: '#ef4444' }} />
    );
  };

  if (results.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 3 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No results available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Results will appear here once published
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Statistics Summary */}
      {stats && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            bgcolor: 'primary.50',
            border: '1px solid',
            borderColor: 'primary.100'
          }}
        >
          <Stack direction="row" spacing={4} flexWrap="wrap">
            <Box>
              <Typography variant="caption" color="text.secondary">
                Class Average
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary">
                {stats.average}/20
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary">
                Pass Rate
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {stats.passRate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ({stats.passCount}/{stats.total})
                </Typography>
              </Stack>
            </Box>

            <Box flex={1} display="flex" alignItems="center">
              <Box width="100%">
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary">
                    Progress
                  </Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {stats.passCount} passed
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={parseFloat(stats.passRate)}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: parseFloat(stats.passRate) >= 75 ? 'success.main' : 'warning.main'
                    }
                  }}
                />
              </Box>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* Results Table */}
      <TableContainer
        component={Paper}
        elevation={3}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          '& .MuiTableCell-root': {
            fontSize: isTablet ? '0.875rem' : '1rem'
          }
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              {showStudent && <TableCell>Student</TableCell>}
              <TableCell>Subject</TableCell>
              <TableCell align="center">Score</TableCell>
              <TableCell align="center">Grade</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell>Mention</TableCell>
              {!isMobile && <TableCell>Exam</TableCell>}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {results.map((result) => {
              const scoreColor = getScoreColor(result.score, result.maxScore);
              const scoreBgColor = getScoreBgColor(result.score, result.maxScore);

              return (
                <TableRow key={result._id} hover>
                  {/* Student Column */}
                  {showStudent && (
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          src={result.student?.profileImage}
                          sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                        >
                          {result.student?.firstName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {result.student?.firstName} {result.student?.lastName}
                          </Typography>
                          {!isMobile && (
                            <Typography variant="caption" color="text.secondary">
                              {result.student?.email}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                  )}

                  {/* Subject Column */}
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 8,
                          height: 32,
                          borderRadius: 1,
                          bgcolor: result.subject?.color || '#1976d2'
                        }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {result.subject?.subject_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {result.subject?.subject_code}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Score Column - COLOR CODED */}
                  <TableCell align="center">
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: scoreBgColor,
                        border: `2px solid ${scoreColor}`,
                      }}
                    >
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        sx={{ color: scoreColor }}
                      >
                        {result.score}/{result.maxScore}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {result.percentage?.toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Grade Column */}
                  <TableCell align="center">
                    <Chip
                      label={result.grade}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        bgcolor: scoreBgColor,
                        color: scoreColor,
                        border: `1px solid ${scoreColor}`
                      }}
                    />
                  </TableCell>

                  {/* Status Column */}
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                      {getGradeIcon(result.status)}
                      <Chip
                        label={result.status === 'pass' ? 'Pass' : 'Fail'}
                        size="small"
                        color={result.status === 'pass' ? 'success' : 'error'}
                      />
                    </Stack>
                  </TableCell>

                  {/* Mention Column */}
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {result.mention}
                    </Typography>
                  </TableCell>

                  {/* Exam Info */}
                  {!isMobile && (
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {result.examPeriod}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {new Date(result.examDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                  )}

                  {/* Actions Column */}
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      {onView && (
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => onView(result)}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {!readOnly && onEdit && (
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => onEdit(result)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {!readOnly && onDelete && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => onDelete(result._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ResultTable;