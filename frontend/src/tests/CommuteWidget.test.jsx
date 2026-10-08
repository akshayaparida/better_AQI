import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommuteWidget from '../components/CommuteWidget';

const mockCommuteData = {
  status: 'success',
  analysis: {
    recommended_route: 'Green Belt Route',
    summary: "Choosing 'Green Belt Route' saves your lungs 31.3% toxic PM2.5 exposure (sparing you the equivalent of 0.36 cigarettes).",
    percent_inhalation_reduction: 31.3,
    cigarettes_saved: 0.36,
    routes: [
      {
        name: 'Green Belt Route',
        distance_km: 22.7,
        duration_minutes: 49.0,
        avg_pm25: 61.3,
        inhaled_pm25_micrograms: 17.3,
        cigarette_smoke_equivalent: 0.79,
        color: '#10B981',
      },
      {
        name: 'Highway Corridor',
        distance_km: 20.5,
        duration_minutes: 38.0,
        avg_pm25: 115.0,
        inhaled_pm25_micrograms: 25.2,
        cigarette_smoke_equivalent: 1.15,
        color: '#EF4444',
      },
    ],
  },
};

describe('CommuteWidget Component', () => {
  it('renders commute header and route names properly', () => {
    render(<CommuteWidget commuteData={mockCommuteData} onModeChange={vi.fn()} selectedMode="cycling" />);

    expect(screen.getByText('Cleanest Commute Planner')).toBeInTheDocument();
    expect(screen.getByText('Green Belt Route')).toBeInTheDocument();
    expect(screen.getByText('Highway Corridor')).toBeInTheDocument();
  });

  it('displays cigarette savings comparison banner', () => {
    render(<CommuteWidget commuteData={mockCommuteData} onModeChange={vi.fn()} selectedMode="cycling" />);

    expect(screen.getByText(/0.36 passively smoked cigarettes/i)).toBeInTheDocument();
  });

  it('triggers onModeChange callback when user selects a different transit mode', () => {
    const handleModeChange = vi.fn();
    render(<CommuteWidget commuteData={mockCommuteData} onModeChange={handleModeChange} selectedMode="cycling" />);

    const carButton = screen.getByText('Car (AC / Cabin Filter)');
    fireEvent.click(carButton);

    expect(handleModeChange).toHaveBeenCalledTimes(1);
    expect(handleModeChange).toHaveBeenCalledWith('car_ac');
  });
});
