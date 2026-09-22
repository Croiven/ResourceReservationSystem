import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it, vi } from 'vitest';
import { theme } from '../theme/theme';
import { getAllTimeSlotValues } from '../utils/slotTime';
import { SlotDateTimeField } from './SlotDateTimeField';

describe('SlotDateTimeField', () => {
  it('shows only 30-minute time options after a date is selected', () => {
    const onChange = vi.fn();

    render(
      <ThemeProvider theme={theme}>
        <SlotDateTimeField label="Start time" value="" onChange={onChange} />
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText('Start time date'), {
      target: { value: '2030-06-01' },
    });

    expect(onChange).toHaveBeenCalledWith('2030-06-01T00:00');
  });

  it('limits time options on the minimum date', () => {
    render(
      <ThemeProvider theme={theme}>
        <SlotDateTimeField
          label="Start time"
          value="2030-06-01T10:30"
          onChange={vi.fn()}
          min="2030-06-01T10:30"
        />
      </ThemeProvider>,
    );

    fireEvent.mouseDown(screen.getByLabelText('Start time time'));
    const options = screen.getAllByRole('option');
    const optionValues = options.map((option) => option.getAttribute('data-value'));
    expect(optionValues).not.toContain('10:00');
    expect(optionValues).toContain('10:30');
    expect(optionValues).toHaveLength(getAllTimeSlotValues().filter((time) => time >= '10:30').length);
  });
});
