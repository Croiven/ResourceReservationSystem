import Alert from '@mui/material/Alert';
import type { ReactNode } from 'react';
import { CenteredLoading } from '../components/CenteredLoading';

export function reservationDetailQueryContent(
  isLoading: boolean,
  error: string | null,
  detailContent: ReactNode | null,
): ReactNode {
  if (isLoading) {
    return <CenteredLoading />;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  return detailContent;
}
