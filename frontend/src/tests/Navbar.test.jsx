import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../components/Navbar';

describe('Navbar Component with GPS Location', () => {
  it('renders brand identity and navigation tabs', () => {
    render(
      <Navbar
        activeTab="overview"
        setActiveTab={vi.fn()}
        onOpenAlertModal={vi.fn()}
      />
    );

    expect(screen.getByText('better_')).toBeInTheDocument();
    expect(screen.getByText('AQI')).toBeInTheDocument();
    expect(screen.getByText('Live AQI & Map')).toBeInTheDocument();
    expect(screen.getByText('Cleanest Commute')).toBeInTheDocument();
    expect(screen.getByText('Citizen Action')).toBeInTheDocument();
    expect(screen.getByText('Spike Alerts')).toBeInTheDocument();
  });

  it('renders Detect Location button and triggers onDetectLocation callback', () => {
    const handleDetectLocation = vi.fn();
    render(
      <Navbar
        activeTab="overview"
        setActiveTab={vi.fn()}
        onOpenAlertModal={vi.fn()}
        onDetectLocation={handleDetectLocation}
      />
    );

    const detectBtn = screen.getByRole('button', { name: /detect location/i });
    expect(detectBtn).toBeInTheDocument();

    fireEvent.click(detectBtn);
    expect(handleDetectLocation).toHaveBeenCalledTimes(1);
  });

  it('renders Detecting... loading state when isDetectingLocation is true', () => {
    render(
      <Navbar
        activeTab="overview"
        setActiveTab={vi.fn()}
        onOpenAlertModal={vi.fn()}
        isDetectingLocation={true}
        onDetectLocation={vi.fn()}
      />
    );

    const btn = screen.getByRole('button', { name: /detecting\.\.\./i });
    expect(btn).toBeInTheDocument();
    expect(btn).toBeDisabled();
  });

  it('renders GPS Active badge when userLocation is set', () => {
    render(
      <Navbar
        activeTab="overview"
        setActiveTab={vi.fn()}
        onOpenAlertModal={vi.fn()}
        userLocation={{ lat: 28.5355, lon: 77.3910, name: 'My Current Location' }}
        onDetectLocation={vi.fn()}
      />
    );

    expect(screen.getByText('GPS Active')).toBeInTheDocument();
  });
});
