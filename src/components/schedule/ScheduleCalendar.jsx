import { useState, useMemo } from 'react';
import {
  Box, Grid, Typography, Stack, IconButton, Paper,
  Tooltip, alpha, useTheme,
} from '@mui/material';
import { ChevronLeft, ChevronRight, Today } from '@mui/icons-material';
import ScheduleCard from './ScheduleCard';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS   = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

/**
 * Monthly calendar view for sessions.
 * Shared between student, teacher and campus-manager views.
 *
 * Props:
 *   sessions  – array of schedule documents
 *   onView    – (session) => void
 *   onEdit    – (session) => void   (optional)
 *   onDelete  – (id) => void        (optional)
 */
const ScheduleCalendar = ({ sessions = [], onView, onEdit, onDelete }) => {
  const theme = useTheme();
  const today = new Date();

  const [current, setCurrent] = useState({
    year:  today.getFullYear(),
    month: today.getMonth(),
  });

  const prev = () =>
    setCurrent((c) =>
      c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 }
    );

  const next = () =>
    setCurrent((c) =>
      c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 }
    );

  const resetToToday = () =>
    setCurrent({ year: today.getFullYear(), month: today.getMonth() });

  // Build calendar grid (42 cells = 6 weeks)
  const cells = useMemo(() => {
    const firstDay = new Date(current.year, current.month, 1);
    // Shift so week starts on Monday (JS getDay: 0=Sun → shift to Mon-based)
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();
    const grid = [];

    for (let i = 0; i < 42; i++) {
      const dayNum = i - startOffset + 1;
      if (dayNum < 1 || dayNum > daysInMonth) {
        grid.push(null);
      } else {
        grid.push(new Date(current.year, current.month, dayNum));
      }
    }
    return grid;
  }, [current]);

  // Group sessions by date key "YYYY-MM-DD"
  const dateKey = (d) => {
    if (!d) return '';
    const date = new Date(d);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }; 

  const sessionsByDay = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      const key = dateKey(s.startTime); 
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [sessions]);

  
  const isToday  = (d) => d && dateKey(d) === dateKey(today);

  return (
    <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
      {/* Navigation header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 3, py: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}
      >
        <IconButton onClick={prev} sx={{ color: 'inherit' }}>
          <ChevronLeft />
        </IconButton>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            {MONTHS[current.month]} {current.year}
          </Typography>
          <Tooltip title="Today">
            <IconButton onClick={resetToToday} size="small" sx={{ color: 'inherit' }}>
              <Today fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
        <IconButton onClick={next} sx={{ color: 'inherit' }}>
          <ChevronRight />
        </IconButton>
      </Stack>

      {/* Day headers */}
      <Grid container sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        {WEEKDAYS.map((d) => (
          <Grid key={d} size={{ xs: 12 / 7 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              align="center"
              display="block"
              sx={{ py: 1, color: 'text.secondary' }}
            >
              {d}
            </Typography>
          </Grid>
        ))}
      </Grid>

      {/* Calendar cells */}
      <Grid container sx={{ minHeight: 480 }}>
        {cells.map((day, idx) => {
          const currentDayKey = day ? dateKey(day) : null;
          const key = currentDayKey ?? `empty-${idx}`;
          const daySessions = currentDayKey ? (sessionsByDay[currentDayKey] ?? []) : [];
          const highlight   = isToday(day);

          return (
            <Grid
              key={key}
              size={{ xs: 12 / 7 }}
              sx={{
                minHeight: 80,
                borderRight: `1px solid ${theme.palette.divider}`,
                borderBottom: `1px solid ${theme.palette.divider}`,
                p: 0.5,
                bgcolor: !day
                  ? alpha(theme.palette.action.disabled, 0.04)
                  : highlight
                  ? alpha(theme.palette.primary.main, 0.06)
                  : 'transparent',
              }}
            >
              {day && (
                <Box>
                  <Typography
                    variant="caption"
                    fontWeight={highlight ? 800 : 500}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      mb: 0.5,
                      bgcolor: highlight ? 'primary.main' : 'transparent',
                      color: highlight ? 'primary.contrastText' : 'text.primary',
                    }}
                  >
                    {day.getDate()}
                  </Typography>
                  <Stack spacing={0.5}>
                    {daySessions.slice(0, 3).map((s) => {
                    
                    // Skip malformed entries without crashing the calendar
                    if (!s?._id) return null;
                    return (
                      <ScheduleCard
                        key={s._id}
                        session={s}
                        compact
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        showActions={false}
                      />
                    );
                 })}
                    {daySessions.length > 3 && (
                      <Typography variant="caption" color="primary" fontWeight={600}>
                        +{daySessions.length - 3} more
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )}
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default ScheduleCalendar;