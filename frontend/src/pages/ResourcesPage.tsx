import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import * as resourceApi from '../services/resourceApi';
import type { ListResourcesQuery, Resource, ResourceType } from '../types/resource';
import { ApiError } from '../types/api';
import {
  ACTIVE_FILTER_OPTIONS,
  getResourceTypeLabel,
  RESOURCE_TYPE_OPTIONS,
  type ActiveFilter,
} from '../utils/resourceLabels';

function buildQuery(
  search: string,
  typeFilter: ResourceType | '',
  activeFilter: ActiveFilter,
): ListResourcesQuery {
  const query: ListResourcesQuery = {};

  if (activeFilter !== 'all') {
    query.active = activeFilter;
  }
  if (typeFilter !== '') {
    query.type = typeFilter;
  }
  const trimmedSearch = search.trim();
  if (trimmedSearch.length > 0) {
    query.search = trimmedSearch;
  }

  return query;
}

function truncateDescription(description: string | null, maxLength = 80): string {
  if (!description) {
    return '—';
  }
  if (description.length <= maxLength) {
    return description;
  }
  return `${description.slice(0, maxLength)}…`;
}

export function ResourcesPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceType | ''>('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('true');
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    const loadResources = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await resourceApi.listResources(
          buildQuery(debouncedSearch, typeFilter, activeFilter),
        );
        if (!cancelled) {
          setResources(data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError('Unable to load resources. Please try again.');
          }
          setResources([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadResources();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, typeFilter, activeFilter]);

  const handleRowClick = (id: string) => {
    void navigate(`/resources/${id}`);
  };

  return (
    <AppLayout maxWidth="lg">
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          Resources
        </Typography>

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
                setSearch(event.target.value);
              }}
              fullWidth
              size="small"
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="resource-type-filter-label">Type</InputLabel>
              <Select
                labelId="resource-type-filter-label"
                label="Type"
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(event.target.value);
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
              <InputLabel id="resource-status-filter-label">Status</InputLabel>
              <Select
                labelId="resource-status-filter-label"
                label="Status"
                value={activeFilter}
                onChange={(event) => {
                  setActiveFilter(event.target.value);
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

        {error && <Alert severity="error">{error}</Alert>}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : resources.length === 0 ? (
          <Typography color="text.secondary">No resources match your filters.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow
                    key={resource.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      handleRowClick(resource.id);
                    }}
                  >
                    <TableCell>{resource.name}</TableCell>
                    <TableCell>
                      <Chip label={getResourceTypeLabel(resource.type)} size="small" />
                    </TableCell>
                    <TableCell>{truncateDescription(resource.description)}</TableCell>
                    <TableCell>
                      <Chip
                        label={resource.isActive ? 'Active' : 'Inactive'}
                        color={resource.isActive ? 'success' : 'default'}
                        size="small"
                        variant={resource.isActive ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </AppLayout>
  );
}
