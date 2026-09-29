import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import type { ResourceType } from '../types/resource';
import {
  ACTIVE_FILTER_OPTIONS,
  RESOURCE_TYPE_OPTIONS,
  type ActiveFilter,
} from '../utils/resourceLabels';

type ResourceListFiltersProps = Readonly<{
  idPrefix: string;
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: ResourceType | '';
  onTypeFilterChange: (value: ResourceType | '') => void;
  activeFilter: ActiveFilter;
  onActiveFilterChange: (value: ActiveFilter) => void;
}>;

export function ResourceListFilters({
  idPrefix,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  activeFilter,
  onActiveFilterChange,
}: ResourceListFiltersProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'stretch', md: 'center' } }}
      >
        <TextField
          label="Search"
          placeholder="Search by name or description"
          value={search}
          onChange={(event) => {
            onSearchChange(event.target.value);
          }}
          fullWidth
          size="small"
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id={`${idPrefix}-type-filter-label`}>Type</InputLabel>
          <Select
            labelId={`${idPrefix}-type-filter-label`}
            label="Type"
            value={typeFilter}
            onChange={(event) => {
              onTypeFilterChange(event.target.value);
            }}
          >
            {RESOURCE_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.label} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel id={`${idPrefix}-status-filter-label`}>Status</InputLabel>
          <Select
            labelId={`${idPrefix}-status-filter-label`}
            label="Status"
            value={activeFilter}
            onChange={(event) => {
              onActiveFilterChange(event.target.value);
            }}
          >
            {ACTIVE_FILTER_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </Paper>
  );
}
