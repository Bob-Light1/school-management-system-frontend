import React, { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import {
  CalendarViewWeek as WeekIcon,
  CalendarViewDay as DayIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Room as RoomIcon,
} from '@mui/icons-material';

/**
 * REUSABLE SCHEDULE TABLE COMPONENT
 * 
 * Features:
 * - Week/Day toggle view
 * - Soft, pleasant colors
 * - Responsive design
 * - Works for Teacher/Student/Class schedules
 * 
 * @param {Array} schedules - Array of schedule objects
 * @param {Function} onEdit - Edit handler (optional, for managers)
 * @param {Function} onDelete - Delete handler (optional, for managers)
 * @param {Boolean} readOnly - If true, hide edit/delete buttons
 */
const ScheduleTable = ({ schedules = [], onEdit, onDelete, readOnly = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [view, setView] = useState('week'); // 'week' or 'day'
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = generateTimeSlots('07:00', '18:00', 30); // 7am-6pm, 30min intervals

  // Group schedules by day
  const schedulesByDay = useMemo(() => {
    const grouped = {};
    days.forEach(day => { grouped[day] = []; });
    
    schedules.forEach(schedule => {
      if (schedule.status === 'active' && grouped[schedule.dayOfWeek]) {
        grouped[schedule.dayOfWeek].push(schedule);
      }
    });
    
    return grouped;
  }, [schedules]);

  // Get subject color with soft pastel variants
  const getSubjectColor = (subject) => {
    const color = subject?.color || '#1976d2';
    return alpha(color, 0.15); // Very soft, transparent version
  };

  // Get text color for readability
  const getTextColor = (subject) => {
    return subject?.color || '#1976d2';
  };

  // Find schedule at specific time slot and day
  const findScheduleAtSlot = (day, time) => {
    return schedulesByDay[day]?.find(schedule => {
      const scheduleStart = timeToMinutes(schedule.startTime);
      const scheduleEnd = timeToMinutes(schedule.endTime);
      const slotTime = timeToMinutes(time);
      
      return slotTime >= scheduleStart && slotTime < scheduleEnd;
    });
  };

  // Calculate row span for multi-slot sessions
  const getRowSpan = (schedule) => {
    const start = timeToMinutes(schedule.startTime);
    const end = timeToMinutes(schedule.endTime);
    const duration = end - start;
    return Math.ceil(duration / 30); // 30-minute slots
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
      if (newView === 'day' && !selectedDay) {
        setSelectedDay('Monday');
      }
    }
  };

  if (schedules.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 3 }}>
        <WeekIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No schedule available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The schedule will appear here once created
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Toggle Week/Day View */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Typography variant="h6" fontWeight={600}>
          {view === 'week' ? 'Weekly Schedule' : `Schedule for ${selectedDay}`}
        </Typography>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
          sx={{ borderRadius: 2 }}
        >
          <ToggleButton value="week">
            <WeekIcon sx={{ mr: 1, fontSize: 20 }} />
            {!isMobile && 'Week'}
          </ToggleButton>
          <ToggleButton value="day">
            <DayIcon sx={{ mr: 1, fontSize: 20 }} />
            {!isMobile && 'Day'}
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Day selector for day view */}
      {view === 'day' && (
        <Stack direction="row" spacing={1} mb={3} sx={{ overflowX: 'auto', pb: 1 }}>
          {days.map(day => (
            <Chip
              key={day}
              label={day}
              onClick={() => setSelectedDay(day)}
              color={selectedDay === day ? 'primary' : 'default'}
              variant={selectedDay === day ? 'filled' : 'outlined'}
              sx={{ fontWeight: selectedDay === day ? 600 : 400 }}
            />
          ))}
        </Stack>
      )}

      {/* Week View Table */}
      {view === 'week' && (
        <TableContainer
          component={Paper}
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: 'auto',
            maxHeight: 600,
            '& .MuiTableCell-root': {
              fontSize: isMobile ? '0.75rem' : '0.875rem',
            }
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'grey.100', fontWeight: 700, minWidth: 80 }}>
                  Time
                </TableCell>
                {days.map(day => (
                  <TableCell
                    key={day}
                    align="center"
                    sx={{ bgcolor: 'grey.100', fontWeight: 700, minWidth: 150 }}
                  >
                    {isMobile ? day.substring(0, 3) : day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {timeSlots.map((time, timeIndex) => (
                <TableRow key={time} sx={{ '&:hover': { bgcolor: 'grey.50' } }}>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                    {time}
                  </TableCell>
                  
                  {days.map(day => {
                    const schedule = findScheduleAtSlot(day, time);
                    
                    // Skip if this cell is part of a multi-row session
                    if (schedule && schedule.startTime !== time) {
                      return null;
                    }
                    
                    if (schedule) {
                      const rowSpan = getRowSpan(schedule);
                      return (
                        <TableCell
                          key={day}
                          rowSpan={rowSpan}
                          sx={{
                            bgcolor: getSubjectColor(schedule.subject),
                            borderLeft: `4px solid ${schedule.subject?.color || '#1976d2'}`,
                            p: 1.5,
                            verticalAlign: 'top',
                          }}
                        >
                          <ScheduleCell
                            schedule={schedule}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            readOnly={readOnly}
                            compact={isMobile}
                          />
                        </TableCell>
                      );
                    }
                    
                    return <TableCell key={day} sx={{ bgcolor: 'white' }} />;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Day View List */}
      {view === 'day' && (
        <Stack spacing={2}>
          {schedulesByDay[selectedDay]?.length > 0 ? (
            schedulesByDay[selectedDay]
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map(schedule => (
                <Paper
                  key={schedule._id}
                  elevation={2}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    borderLeft: `6px solid ${schedule.subject?.color || '#1976d2'}`,
                    bgcolor: getSubjectColor(schedule.subject),
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s',
                    }
                  }}
                >
                  <ScheduleCell
                    schedule={schedule}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    readOnly={readOnly}
                    compact={false}
                    expanded
                  />
                </Paper>
              ))
          ) : (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 3 }}>
              <Typography color="text.secondary">
                No classes scheduled for {selectedDay}
              </Typography>
            </Paper>
          )}
        </Stack>
      )}
    </Box>
  );
};

/**
 * Individual Schedule Cell Component
 */
const ScheduleCell = ({ schedule, onEdit, onDelete, readOnly, compact, expanded = false }) => (
  <Box>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
      <Box flex={1}>
        <Typography
          variant={compact ? 'caption' : 'subtitle2'}
          fontWeight={700}
          color="primary"
          sx={{ display: 'block', mb: 0.5 }}
        >
          {schedule.subject?.subject_name || 'Subject'}
        </Typography>
        
        {!compact && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {schedule.subject?.subject_code}
          </Typography>
        )}
      </Box>

      {!readOnly && (onEdit || onDelete) && !compact && (
        <Stack direction="row" spacing={0.5}>
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(schedule)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDelete(schedule._id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )}
    </Stack>

    <Stack spacing={0.5} mt={1}>
      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        🕐 {schedule.startTime} - {schedule.endTime}
      </Typography>
      
      {schedule.teacher && (
        <Typography variant="caption" color="text.secondary">
          👨‍🏫 {schedule.teacher.firstName} {schedule.teacher.lastName}
        </Typography>
      )}
      
      {schedule.room && (
        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <RoomIcon sx={{ fontSize: 12 }} />
          {schedule.building && `${schedule.building} - `}{schedule.room}
        </Typography>
      )}

      {expanded && schedule.class && (
        <Typography variant="caption" color="text.secondary">
          📚 {schedule.class.className}
        </Typography>
      )}

      {expanded && schedule.sessionType && schedule.sessionType !== 'lecture' && (
        <Chip
          label={schedule.sessionType}
          size="small"
          sx={{ mt: 1, height: 20, fontSize: '0.7rem', textTransform: 'capitalize' }}
        />
      )}
    </Stack>
  </Box>
);

// Helper functions
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const generateTimeSlots = (start, end, interval) => {
  const slots = [];
  let current = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  
  while (current < endMinutes) {
    const hours = Math.floor(current / 60);
    const mins = current % 60;
    slots.push(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
    current += interval;
  }
  
  return slots;
};

export default ScheduleTable;