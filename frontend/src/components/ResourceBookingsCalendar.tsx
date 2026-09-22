import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import type { ResourceBooking } from '../types/reservation';
import { addDays } from '../utils/calendar';
import { buildCalendarEvents, formatEventTimeLabel } from '../utils/calendarEvents';
import { getReservationStatusLabel, getStatusChipColor } from '../utils/reservationLabels';
const ROW_HEIGHT_PX = 20;
const TIME_COLUMN_WIDTH_PX = 56;
const DAY_MIN_WIDTH_PX = 88;
const CALENDAR_MAX_HEIGHT_PX = 720;

interface ResourceBookingsCalendarProps {
  bookings: ResourceBooking[];
  weekStart: Date;
  onWeekChange: (nextWeekStart: Date) => void;
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: weekStart.getFullYear() === weekEnd.getFullYear() ? undefined : 'numeric',
  });
  return `${formatter.format(weekStart)} – ${formatter.format(weekEnd)}`;
}

function formatDayHeader(date: Date): { weekday: string; day: string } {
  return {
    weekday: new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(date),
    day: new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' }).format(date),
  };
}

function formatHourLabel(hour: number, minute: number): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function ResourceBookingsCalendar({
  bookings,
  weekStart,
  onWeekChange,
}: ResourceBookingsCalendarProps) {
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const timeSlots = useMemo(() => {
    const slots: Array<{ hour: number; minute: number }> = [];
    for (let hour = 0; hour < 24; hour += 1) {
      slots.push({ hour, minute: 0 });
      slots.push({ hour, minute: 30 });
    }
    return slots;
  }, []);

  const events = useMemo(
    () => buildCalendarEvents(bookings, weekStart, ROW_HEIGHT_PX),
    [bookings, weekStart],
  );
  const gridHeightPx = timeSlots.length * ROW_HEIGHT_PX;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton
          aria-label="Previous week"
          onClick={() => {
            onWeekChange(addDays(weekStart, -7));
          }}
          size="small"
        >
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {formatWeekRange(weekStart)}
        </Typography>
        <IconButton
          aria-label="Next week"
          onClick={() => {
            onWeekChange(addDays(weekStart, 7));
          }}
          size="small"
        >
          <ChevronRightIcon />
        </IconButton>
      </Stack>

      <Box
        sx={{
          overflow: 'auto',
          maxHeight: CALENDAR_MAX_HEIGHT_PX,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `${TIME_COLUMN_WIDTH_PX}px repeat(7, minmax(${DAY_MIN_WIDTH_PX}px, 1fr))`,
            minWidth: TIME_COLUMN_WIDTH_PX + DAY_MIN_WIDTH_PX * 7,
          }}
        >
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'grey.50',
            }}
          />
          {weekDays.map((day) => {
            const header = formatDayHeader(day);
            return (
              <Box
                key={day.toISOString()}
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  borderBottom: 1,
                  borderLeft: 1,
                  borderColor: 'divider',
                  px: 1,
                  py: 1,
                  bgcolor: 'grey.50',
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {header.weekday}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {header.day}
                </Typography>
              </Box>
            );
          })}

          <Box sx={{ position: 'relative' }}>
            {timeSlots.map((slot, index) => (
              <Box
                key={`${slot.hour}-${slot.minute}`}
                sx={{
                  height: ROW_HEIGHT_PX,
                  borderBottom: index < timeSlots.length - 1 ? 1 : 0,
                  borderColor: 'divider',
                  px: 0.5,
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                {slot.minute === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: -0.75 }}>
                    {formatHourLabel(slot.hour, slot.minute)}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>

          {weekDays.map((day, dayIndex) => (
            <Box
              key={`grid-${day.toISOString()}`}
              sx={{
                position: 'relative',
                borderLeft: 1,
                borderColor: 'divider',
                height: gridHeightPx,
                bgcolor: 'background.paper',
              }}
            >
              {timeSlots.map((slot, index) => (
                <Box
                  key={`${dayIndex}-${slot.hour}-${slot.minute}`}
                  sx={{
                    position: 'absolute',
                    top: index * ROW_HEIGHT_PX,
                    left: 0,
                    right: 0,
                    height: ROW_HEIGHT_PX,
                    borderBottom: index < timeSlots.length - 1 ? 1 : 0,
                    borderColor: 'divider',
                  }}
                />
              ))}

              {events
                .filter((event) => event.dayIndex === dayIndex)
                .map((event) => (
                  <Box
                    key={`${event.booking.startTime}-${event.booking.endTime}-${dayIndex}-${event.visibleStart.toISOString()}`}
                    sx={{
                      position: 'absolute',
                      top: event.topPx,
                      left: 4,
                      right: 4,
                      height: event.heightPx,
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: (theme) =>
                        event.booking.status === 'CONFIRMED'
                          ? theme.palette.success.light
                          : theme.palette.warning.light,
                      color: 'text.primary',
                      overflow: 'hidden',
                      zIndex: 1,
                    }}
                  >
                    <Typography variant="caption" noWrap sx={{ display: 'block', fontWeight: 600 }}>
                      {formatEventTimeLabel(event)}
                    </Typography>
                    <Chip
                      label={getReservationStatusLabel(event.booking.status)}
                      color={getStatusChipColor(event.booking.status)}
                      size="small"
                      sx={{ height: 18, fontSize: '0.65rem', mt: 0.25 }}
                    />
                  </Box>
                ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Stack>
  );
}
