import AddIcon from '@mui/icons-material/Add';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { ResourceBrowseTable } from '../components/ResourceBrowseTable';
import { ResourceFormDialog } from '../components/ResourceFormDialog';
import { ResourceListFilters } from '../components/ResourceListFilters';
import { useResourceList } from '../hooks/useResourceList';
import * as resourceApi from '../services/resourceApi';
import { getTokens } from '../services/tokenStorage';
import type { Resource } from '../types/resource';
import { ApiError } from '../types/api';
import { listQueryContent } from '../utils/queryStateContent';

export function AdminResourcesPage() {
  const {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    activeFilter,
    setActiveFilter,
    resources,
    isLoading,
    error,
    setError,
    loadResources,
  } = useResourceList('all');

  const [formOpen, setFormOpen] = useState(false);
  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [deactivateResource, setDeactivateResource] = useState<Resource | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

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

        <ResourceListFilters
          idPrefix="admin-resource"
          search={search}
          onSearchChange={setSearch}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          activeFilter={activeFilter}
          onActiveFilterChange={setActiveFilter}
        />

        {error && <Alert severity="error">{error}</Alert>}

        {listQueryContent(
          isLoading,
          resources.length === 0,
          <Typography color="text.secondary">No resources match your filters.</Typography>,
          <ResourceBrowseTable
            resources={resources}
            renderActions={(resource) => (
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
            )}
          />,
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
