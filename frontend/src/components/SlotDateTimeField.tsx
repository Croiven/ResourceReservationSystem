import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useMemo } from 'react';
import {
  combineLocalDateTime,
  formatTimeSlotLabel,
  getAvailableTimeSlotsForDate,
  getMinDateLocal,
  splitLocalDateTime,
} from '../utils/slotTime';

interface SlotDateTimeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SlotDateTimeField({
  label,
  value,
  onChange,
  min,
  helperText = 'Select a date and a time on the hour or half-hour',
  required = false,
  disabled = false,
}: SlotDateTimeFieldProps) {
  const { date, time } = splitLocalDateTime(value);
  const minDate = getMinDateLocal(min);
  const availableTimes = useMemo(
    () => getAvailableTimeSlotsForDate(date, min),
    [date, min],
  );
  const selectedTime = time && availableTimes.includes(time) ? time : '';

  const handleDateChange = (nextDate: string) => {
    if (!nextDate) {
      onChange('');
      return;
    }

    const timesForDate = getAvailableTimeSlotsForDate(nextDate, min);
    const nextTime = time && timesForDate.includes(time) ? time : (timesForDate[0] ?? '');
    onChange(combineLocalDateTime(nextDate, nextTime));
  };

  const handleTimeChange = (nextTime: string) => {
    onChange(combineLocalDateTime(date, nextTime));
  };

  const timeLabelId = `${label.replace(/\s+/g, '-').toLowerCase()}-time-label`;

  return (
    <Stack spacing={0.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label={`${label} date`}
          type="date"
          value={date}
          disabled={disabled}
          onChange={(event) => {
            handleDateChange(event.target.value);
          }}
          required={required}
          fullWidth
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: minDate ? { min: minDate } : {},
          }}
        />
        <FormControl
          fullWidth
          required={required}
          disabled={disabled || !date || availableTimes.length === 0}
        >
          <InputLabel id={timeLabelId} shrink>
            {`${label} time`}
          </InputLabel>
          <Select
            labelId={timeLabelId}
            label={`${label} time`}
            value={selectedTime}
            onChange={(event) => {
              handleTimeChange(event.target.value);
            }}
            displayEmpty
          >
            {!selectedTime && (
              <MenuItem value="" disabled>
                Select time
              </MenuItem>
            )}
            {availableTimes.map((slot) => (
              <MenuItem key={slot} value={slot}>
                {formatTimeSlotLabel(slot)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </Stack>
  );
}
