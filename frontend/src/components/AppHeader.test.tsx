import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('renders the provided title', () => {
    render(<AppHeader title="Resource Reservation System" />);

    expect(screen.getByRole('heading', { name: 'Resource Reservation System' })).toBeInTheDocument();
  });
});
