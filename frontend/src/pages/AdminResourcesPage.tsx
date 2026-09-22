import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
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
import { useCallback, useEffect, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { ResourceFormDialog } from '../components/ResourceFormDialog';
import * as resourceApi from '../services/resourceApi';
import { getTokens } from '../services/tokenStorage';
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

export function AdminResourcesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ResourceType | ''>('');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [deactivateResource, setDeactivateResource] = useState<Resource | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const loadResources = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await resourceApi.listResources(
        buildQuery(debouncedSearch, typeFilter, activeFilter),
      );
      setResources(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to load resources. Please try again.');
      }
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, typeFilter, activeFilter]);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  const handleDeactivateConfirm = async () => {
    if (!deactivateResource) return;

    const tokens = getTokens();
    if (!tokens?.accessToken) return;

    setIsDeactivating(true);
    try {
      await resourceApi.deactivateResource(deactivateResource.id, tokens.accessToken);
      setDeactivateResource(null);
      await loadResources();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to deactivate resource. Please try again.');
      }
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleReactivate = async (resource: Resource) => {
    const tokens = getTokens();
    if (!tokens?.accessToken) return;

    try {
      await resourceApi.updateResource(resource.id, { isActive: true }, tokens.accessToken);
      await loadResources();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to reactivate resource. Please try again.');
      }
    }
  };

  return (
    <AppLayout maxWidth="lg">
      <Stack spacing={3}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" component="h1">
            Manage resources
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditResource(null);
              setFormOpen(true);
            }}
          >
            Add resource
          </Button>
        </Stack>

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
              <InputLabel id="admin-resource-type-filter-label">Type</InputLabel>
              <Select
                labelId="admin-resource-type-filter-label"
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
              <InputLabel id="admin-resource-status-filter-label">Status</InputLabel>
              <Select
                labelId="admin-resource-status-filter-label"
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
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resources.map((resource) => (
                  <TableRow key={resource.id} hover>
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
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          onClick={() => {
                            setEditResource(resource);
                            setFormOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        {resource.isActive ? (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => {
                              setDeactivateResource(resource);
                            }}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            color="success"
                            onClick={() => {
                              void handleReactivate(resource);
                            }}
                          >
                            Reactivate
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>

      <ResourceFormDialog
        open={formOpen}
        resource={editResource}
        onClose={() => {
          setFormOpen(false);
          setEditResource(null);
        }}
        onSuccess={() => {
          void loadResources();
        }}
      />

      <Dialog open={deactivateResource !== null} onClose={() => setDeactivateResource(null)}>
        <DialogTitle>Deactivate resource?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deactivateResource?.name} will no longer be available for new bookings. Existing
            reservations are not affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateResource(null)} disabled={isDeactivating}>
            Cancel
          </Button>
          <Button
            onClick={() => void handleDeactivateConfirm()}
            color="error"
            disabled={isDeactivating}
          >
            {isDeactivating ? 'Deactivating…' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
}
