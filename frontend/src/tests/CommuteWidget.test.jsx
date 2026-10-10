import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

  it('renders origin and destination selectors and triggers onEndpointsChange', () => {
    const handleEndpointsChange = vi.fn();
    render(
      <CommuteWidget
        commuteData={mockCommuteData}
        onModeChange={vi.fn()}
        originId="connaught_place"
        destinationId="dtu_campus"
        onEndpointsChange={handleEndpointsChange}
      />
    );

    const originSelect = screen.getByLabelText('Start Origin:');
    const destinationSelect = screen.getByLabelText('Target Destination:');

    expect(originSelect).toBeInTheDocument();
    expect(destinationSelect).toBeInTheDocument();
    expect(originSelect.value).toBe('connaught_place');
    expect(destinationSelect.value).toBe('dtu_campus');

    // Change destination to Cyber Hub
    fireEvent.change(destinationSelect, { target: { value: 'cyber_hub' } });
    expect(handleEndpointsChange).toHaveBeenCalledWith({
      originId: 'connaught_place',
      destinationId: 'cyber_hub',
    });
  });

  it('swaps origin and destination when swap button is clicked', () => {
    const handleEndpointsChange = vi.fn();
    render(
      <CommuteWidget
        commuteData={mockCommuteData}
        onModeChange={vi.fn()}
        originId="connaught_place"
        destinationId="dtu_campus"
        onEndpointsChange={handleEndpointsChange}
      />
    );

    const swapButton = screen.getByRole('button', { name: /swap origin and destination/i });
    fireEvent.click(swapButton);

    expect(handleEndpointsChange).toHaveBeenCalledWith({
      originId: 'dtu_campus',
      destinationId: 'connaught_place',
    });
  });

  it('renders My Current Location option when userLocation is present', () => {
    render(
      <CommuteWidget
        commuteData={mockCommuteData}
        onModeChange={vi.fn()}
        userLocation={{ lat: 28.5355, lon: 77.3910, name: 'My Current Location' }}
      />
    );

    expect(screen.getByText(/📍 My Current Location \(28.535, 77.391\)/i)).toBeInTheDocument();
  });

  it('renders Uber-style pickup and drop-off typeahead inputs and landmark chips', () => {
    const handleEndpointsChange = vi.fn();
    render(
      <CommuteWidget
        commuteData={mockCommuteData}
        onModeChange={vi.fn()}
        originId="connaught_place"
        destinationId="dtu_campus"
        onEndpointsChange={handleEndpointsChange}
      />
    );

    const originInput = screen.getByPlaceholderText(/pickup location/i);
    const destInput = screen.getByPlaceholderText(/drop-off destination/i);

    expect(originInput).toBeInTheDocument();
    expect(destInput).toBeInTheDocument();
    expect(originInput.value).toContain('Connaught Place');
    expect(destInput.value).toContain('DTU Campus');

    // Clicking a landmark chip selects destination
    const chip = screen.getByRole('button', { name: /cyber hub/i });
    expect(chip).toBeInTheDocument();
    fireEvent.click(chip);

    expect(handleEndpointsChange).toHaveBeenCalledWith(
      expect.objectContaining({
        destinationId: 'cyber_hub',
      })
    );
  });

  it('supports normal typing in destination input and pressing Enter to apply', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        query: 'Ajmer',
        results: [{ name: 'Ajmer', country: 'India', lat: 26.4499, lon: 74.6399 }],
      }),
    });

    const handleEndpointsChange = vi.fn();
    render(
      <CommuteWidget
        commuteData={mockCommuteData}
        onModeChange={vi.fn()}
        originId="connaught_place"
        destinationId="dtu_campus"
        onEndpointsChange={handleEndpointsChange}
      />
    );

    const destInput = screen.getByPlaceholderText(/drop-off destination/i);
    fireEvent.change(destInput, { target: { value: 'Ajmer' } });
    fireEvent.keyDown(destInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(handleEndpointsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          destinationId: expect.any(String),
        })
      );
    });

    global.fetch = originalFetch;
  });

  it('opens Google Maps route navigation when clicking Open in Google Maps button', () => {
    const originalOpen = window.open;
    window.open = vi.fn();

    render(
      <CommuteWidget
        commuteData={mockCommuteData}
        onModeChange={vi.fn()}
        originId="connaught_place"
        destinationId="dtu_campus"
      />
    );

    const mapsBtn = screen.getByRole('button', { name: /open in google maps/i });
    expect(mapsBtn).toBeInTheDocument();
    fireEvent.click(mapsBtn);

    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('google.com/maps/dir'),
      '_blank',
      'noopener,noreferrer'
    );

    window.open = originalOpen;
  });
});
