import Chip from '@mui/material/Chip';
import type { Resource } from '../types/resource';

type ResourceStatusChipProps = Readonly<{
  resource: Resource;
}>;

export function ResourceStatusChip({ resource }: ResourceStatusChipProps) {
  return (
    <Chip
      label={resource.isActive ? 'Active' : 'Inactive'}
      color={resource.isActive ? 'success' : 'default'}
      size="small"
      variant={resource.isActive ? 'filled' : 'outlined'}
    />
  );
}
