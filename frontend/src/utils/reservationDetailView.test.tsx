import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { reservationDetailQueryContent } from './reservationDetailView';

describe('reservationDetailQueryContent', () => {
  it('shows loading spinner', () => {
    render(<>{reservationDetailQueryContent(true, null, null)}</>);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error alert', () => {
    render(<>{reservationDetailQueryContent(false, 'Failed', null)}</>);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('renders detail content when loaded', () => {
    render(<>{reservationDetailQueryContent(false, null, <div>Detail body</div>)}</>);
    expect(screen.getByText('Detail body')).toBeInTheDocument();
  });
});
