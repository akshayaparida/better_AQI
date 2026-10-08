import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import IndoorPurifierCard from '../components/IndoorPurifierCard';

const mockIndoorResponse = {
  status: 'success',
  room_specs: {
    area_sqft: 240,
    volume_m3: 67.96,
    window_sealing: 'standard',
  },
  air_metrics: {
    outdoor_pm25: 85.2,
    indoor_pm25_without_purifier: 51.1,
    indoor_pm25_with_purifier: 9.8,
  },
  purifier_performance: {
    cadr_m3h: 320,
    ach: 4.7,
    minutes_to_reach_safe_air: 15,
  },
  action_advisory: 'Run purifier for 15 minutes before students arrive.',
};

describe('IndoorPurifierCard Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockIndoorResponse,
    });
  });

  it('renders room area and CADR controls and titles', async () => {
    render(<IndoorPurifierCard />);

    expect(screen.getByText('Indoor Air & Purifier Calculator')).toBeInTheDocument();
    expect(screen.getByText(/Room Area/i)).toBeInTheDocument();
    expect(screen.getByText(/Purifier CADR/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/15 Minutes to Safe Air/i)).toBeInTheDocument();
      expect(screen.getByText('85.2 µg')).toBeInTheDocument();
      expect(screen.getByText('9.8 µg')).toBeInTheDocument();
    });
  });

  it('triggers recalculation fetch when room area slider changes', async () => {
    render(<IndoorPurifierCard />);

    await waitFor(() => {
      expect(screen.getByText(/15 Minutes to Safe Air/i)).toBeInTheDocument();
    });

    const sliders = screen.getAllByRole('slider');
    const areaSlider = sliders[0];
    fireEvent.change(areaSlider, { target: { value: '350' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/indoor/estimate', expect.objectContaining({
        method: 'POST',
      }));
    });
  });
});
