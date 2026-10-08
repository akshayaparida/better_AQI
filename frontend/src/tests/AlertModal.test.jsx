import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AlertModal from '../components/AlertModal';

describe('AlertModal Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<AlertModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal inputs and submit button when isOpen is true', () => {
    render(<AlertModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Automated Spike Alerts')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name@school.edu or user@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('Activate Alerts')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<AlertModal isOpen={true} onClose={handleClose} />);

    const closeBtn = screen.getByLabelText('Close Modal');
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('submits subscription payload to backend API and displays success message', async () => {
    const mockResponse = {
      status: 'subscribed',
      subscription_id: 'sub_002',
      message: 'Successfully registered for alerts when PM2.5 exceeds 90 µg/m³.',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    render(<AlertModal isOpen={true} onClose={vi.fn()} />);

    const emailInput = screen.getByPlaceholderText('name@school.edu or user@gmail.com');
    fireEvent.change(emailInput, { target: { value: 'test@school.edu' } });

    const submitBtn = screen.getByText('Activate Alerts');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/alerts/subscribe', expect.objectContaining({
        method: 'POST',
      }));
      expect(screen.getByText(/Successfully registered for alerts/i)).toBeInTheDocument();
    });
  });
});
