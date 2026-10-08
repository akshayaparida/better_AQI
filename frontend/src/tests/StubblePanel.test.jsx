import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StubblePanel from '../components/StubblePanel';

const mockStubbleData = {
  status: 'success',
  summary: {
    total_monitored_fires: 524,
    smoke_transport_risk: 'HIGH',
    stubble_contribution_to_ncr: '28 - 36%',
    advisory: 'North-westerly winds are actively transporting biomass smoke plumes toward Delhi NCR.',
  },
  meteorology: {
    wind_direction_deg: 305,
    wind_direction_cardinal: 'NW',
    wind_speed_kmh: 14.8,
    boundary_layer_height_m: 650,
  },
  hotspot_clusters: [
    {
      state: 'Punjab',
      district: 'Sangrur',
      active_fire_count: 142,
      max_frp_mw: 245.0,
      latitude: 30.245,
      longitude: 75.842,
    },
    {
      state: 'Haryana',
      district: 'Kaithal',
      active_fire_count: 88,
      max_frp_mw: 198.5,
      latitude: 29.801,
      longitude: 76.399,
    },
  ],
};

describe('StubblePanel Component', () => {
  it('renders stubble burning tracker header and smoke transport risk', () => {
    render(<StubblePanel stubbleData={mockStubbleData} />);

    expect(screen.getByText('Stubble Burning & Smoke Tracker')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText(/North-westerly winds are actively transporting/i)).toBeInTheDocument();
  });

  it('displays active fire metrics and NCR contribution', () => {
    render(<StubblePanel stubbleData={mockStubbleData} />);

    expect(screen.getByText('524')).toBeInTheDocument();
    expect(screen.getByText('14.8 km/h')).toBeInTheDocument();
    expect(screen.getByText('28 - 36%')).toBeInTheDocument();
  });

  it('renders key hotspot districts', () => {
    render(<StubblePanel stubbleData={mockStubbleData} />);

    expect(screen.getByText(/Sangrur/i)).toBeInTheDocument();
    expect(screen.getByText(/Kaithal/i)).toBeInTheDocument();
  });

  it('renders nothing when stubbleData is null', () => {
    const { container } = render(<StubblePanel stubbleData={null} />);
    expect(container.firstChild).toBeNull();
  });
});
