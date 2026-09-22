import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import * as resourceApi from '../services/resourceApi';
import { getTokens } from '../services/tokenStorage';
import type { CreateResourceInput, Resource, ResourceType, UpdateResourceInput } from '../types/resource';
import { ApiError } from '../types/api';
import { getResourceTypeLabel, RESOURCE_TYPE_OPTIONS } from '../utils/resourceLabels';

const RESOURCE_TYPE_FORM_OPTIONS = RESOURCE_TYPE_OPTIONS.filter((option) => option.value !== '');

interface ResourceFormDialogProps {
  open: boolean;
  resource?: Resource | null;
  onClose: () => void;
  onSuccess: (resource: Resource) => void;
}

export function ResourceFormDialog({ open, resource, onClose, onSuccess }: ResourceFormDialogProps) {
  const isEdit = resource !== undefined && resource !== null;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ResourceType>('ROOM');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (resource) {
        setName(resource.name);
        setDescription(resource.description ?? '');
        setType(resource.type);
        setIsActive(resource.isActive);
      } else {
        setName('');
        setDescription('');
        setType('ROOM');
        setIsActive(true);
      }
      setError(null);
    }
  }, [open, resource]);

  const handleSubmit = async () => {
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required.');
      return;
    }

    const tokens = getTokens();
    if (!tokens?.accessToken) {
      setError('You must be signed in to manage resources.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEdit && resource) {
        const data: UpdateResourceInput = {
          name: trimmedName,
          description: description.trim() === '' ? null : description.trim(),
          type,
          isActive,
        };
        const updated = await resourceApi.updateResource(resource.id, data, tokens.accessToken);
        onSuccess(updated);
      } else {
        const data: CreateResourceInput = {
          name: trimmedName,
          type,
        };
        const trimmedDescription = description.trim();
        if (trimmedDescription.length > 0) {
          data.description = trimmedDescription;
        }
        const created = await resourceApi.createResource(data, tokens.accessToken);
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Unable to save resource. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit resource' : 'Add resource'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
            }}
            fullWidth
            multiline
            minRows={2}
          />
          <FormControl fullWidth>
            <InputLabel id="resource-type-label">Type</InputLabel>
            <Select
              labelId="resource-type-label"
              label="Type"
              value={type}
              onChange={(event) => {
                setType(event.target.value);
              }}
            >
              {RESOURCE_TYPE_FORM_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {getResourceTypeLabel(option.value as ResourceType)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {isEdit && (
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(event) => {
                    setIsActive(event.target.checked);
                  }}
                />
              }
              label="Active"
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={() => void handleSubmit()} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} /> : isEdit ? 'Save changes' : 'Create resource'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
