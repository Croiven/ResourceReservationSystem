import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import * as resourceApi from '../services/resourceApi';
import type { Resource } from '../types/resource';
import { ApiError } from '../types/api';
import { getResourceTypeLabel } from '../utils/resourceLabels';

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadResource = async () => {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      try {
        const data = await resourceApi.getResource(id);
        if (!cancelled) {
          setResource(data);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError && err.statusCode === 404) {
            setNotFound(true);
            setResource(null);
          } else if (err instanceof ApiError) {
            setError(err.message);
          } else {
            setError('Unable to load resource. Please try again.');
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadResource();

    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <AppLayout maxWidth="md">
      <Stack spacing={2}>
        <Button component={RouterLink} to="/resources" variant="text" sx={{ alignSelf: 'flex-start' }}>
          Back to resources
        </Button>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : notFound ? (
          <Stack spacing={2}>
            <Alert severity="warning">Resource not found.</Alert>
            <Button component={RouterLink} to="/resources" variant="contained">
              Browse resources
            </Button>
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : resource ? (
          <Card>
            <CardHeader
              title={resource.name}
              subheader={`Added ${formatDate(resource.createdAt)}`}
              action={
                <Stack direction="row" spacing={1}>
                  <Chip label={getResourceTypeLabel(resource.type)} size="small" />
                  <Chip
                    label={resource.isActive ? 'Active' : 'Inactive'}
                    color={resource.isActive ? 'success' : 'default'}
                    size="small"
                    variant={resource.isActive ? 'filled' : 'outlined'}
                  />
                </Stack>
              }
            />
            <CardContent>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {resource.description ?? 'No description provided.'}
              </Typography>
            </CardContent>
          </Card>
        ) : null}
      </Stack>
    </AppLayout>
  );
}
