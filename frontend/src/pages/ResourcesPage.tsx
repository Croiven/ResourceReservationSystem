import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ResourceBrowseTable } from '../components/ResourceBrowseTable';
import { ResourceListFilters } from '../components/ResourceListFilters';
import { useResourceList } from '../hooks/useResourceList';
import { listQueryContent } from '../utils/queryStateContent';

export function ResourcesPage() {
  const navigate = useNavigate();
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
  } = useResourceList('true');

  return (
    <AppLayout maxWidth="lg">
      <Stack spacing={3}>
        <Typography variant="h4" component="h1">
          Resources
        </Typography>

        <ResourceListFilters
          idPrefix="resource"
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
            onRowClick={(resource) => {
              void navigate(`/resources/${resource.id}`);
            }}
          />,
        )}
      </Stack>
    </AppLayout>
  );
}
