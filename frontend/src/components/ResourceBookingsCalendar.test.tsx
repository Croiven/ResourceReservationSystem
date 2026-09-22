import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it, vi } from 'vitest';
import { theme } from '../theme/theme';
import { getWeekStart } from '../utils/calendar';
import { ResourceBookingsCalendar } from './ResourceBookingsCalendar';

function renderCalendar(
  bookings: Array<{ startTime: string; endTime: string; status: 'PENDING' | 'CONFIRMED' }> = [],
) {
  const weekStart = getWeekStart(new Date('2026-06-01T12:00:00.000Z'));
  const onWeekChange = vi.fn();

  render(
    <ThemeProvider theme={theme}>
      <ResourceBookingsCalendar
        bookings={bookings}
        weekStart={weekStart}
        onWeekChange={onWeekChange}
      />
    </ThemeProvider>,
  );

  return { onWeekChange, weekStart };
}

describe('ResourceBookingsCalendar', () => {
  it('renders week headers and navigates weeks', () => {
    const { onWeekChange } = renderCalendar();

    expect(screen.getByLabelText('Previous week')).toBeInTheDocument();
    expect(screen.getByLabelText('Next week')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Next week'));
    expect(onWeekChange).toHaveBeenCalled();
  });

  it('renders booking blocks for the visible week', () => {
    renderCalendar([
      {
        startTime: '2026-06-02T09:00:00.000Z',
        endTime: '2026-06-02T10:30:00.000Z',
        status: 'CONFIRMED',
      },
    ]);

    expect(screen.getByText(/Confirmed/i)).toBeInTheDocument();
  });
});
