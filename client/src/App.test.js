import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login form', () => {
  render(<App />);
  const linkElement = screen.getByRole('heading', { name: /Login/i });
  expect(linkElement).toBeInTheDocument();
});
