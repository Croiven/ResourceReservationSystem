import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { ReactNode } from 'react';
import type { Resource } from '../types/resource';
import { getResourceTypeLabel } from '../utils/resourceLabels';
import { truncateResourceDescription } from '../utils/resourceListQuery';
import { ResourceStatusChip } from './ResourceStatusChip';

type ResourceBrowseTableProps = Readonly<{
  resources: Resource[];
  onRowClick?: (resource: Resource) => void;
  renderActions?: (resource: Resource) => ReactNode;
}>;

export function ResourceBrowseTable({ resources, onRowClick, renderActions }: ResourceBrowseTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Status</TableCell>
            {renderActions && <TableCell align="right">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {resources.map((resource) => (
            <TableRow
              key={resource.id}
              hover
              sx={onRowClick ? { cursor: 'pointer' } : undefined}
              onClick={
                onRowClick
                  ? () => {
                      onRowClick(resource);
                    }
                  : undefined
              }
            >
              <TableCell>{resource.name}</TableCell>
              <TableCell>
                <Chip label={getResourceTypeLabel(resource.type)} size="small" />
              </TableCell>
              <TableCell>{truncateResourceDescription(resource.description)}</TableCell>
              <TableCell>
                <ResourceStatusChip resource={resource} />
              </TableCell>
              {renderActions && <TableCell align="right">{renderActions(resource)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
