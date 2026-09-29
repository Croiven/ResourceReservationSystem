import type { ReactNode } from 'react';
import { CenteredLoading } from '../components/CenteredLoading';

export function listQueryContent(
  isLoading: boolean,
  isEmpty: boolean,
  emptyContent: ReactNode,
  loadedContent: ReactNode,
): ReactNode {
  if (isLoading) {
    return <CenteredLoading />;
  }
  if (isEmpty) {
    return emptyContent;
  }
  return loadedContent;
}
