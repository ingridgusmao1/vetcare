import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../src/components/atoms/Button';
import { expect, vi } from 'vitest';

test('renders the label and fires onClick', () => {
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Cliquer ici</Button>);

  // The button should be in the DOM with its label visible.
  const btn = screen.getByRole('button', { name: 'Cliquer ici' });
  expect(btn).toBeInTheDocument();

  fireEvent.click(btn);
  expect(onClick).toHaveBeenCalledTimes(1);
});