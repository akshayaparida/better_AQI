import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GlobalCitySearch from '../components/GlobalCitySearch';
import { POPULAR_WORLD_CITIES } from '../data/locations';

describe('GlobalCitySearch Component', () => {
  const mockCity = POPULAR_WORLD_CITIES[0]; // Delhi NCR

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders search input and popular global city quick pills', () => {
    render(<GlobalCitySearch activeCity={mockCity} onCitySelect={vi.fn()} />);

    expect(screen.getByPlaceholderText(/search any city or location worldwide/i)).toBeInTheDocument();
    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Tokyo')).toBeInTheDocument();
    expect(screen.getByText('New York City')).toBeInTheDocument();
    expect(screen.getByText('Paris')).toBeInTheDocument();
  });

  it('triggers onCitySelect when user clicks a world city pill', () => {
    const handleCitySelect = vi.fn();
    render(<GlobalCitySearch activeCity={mockCity} onCitySelect={handleCitySelect} />);

    const londonBtn = screen.getByText('London');
    fireEvent.click(londonBtn);

    expect(handleCitySelect).toHaveBeenCalledTimes(1);
    expect(handleCitySelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'London', country: 'United Kingdom' })
    );
  });

  it('performs debounced search and displays results dropdown', async () => {
    const mockSearchResults = {
      query: 'Berlin',
      results: [
        { name: 'Berlin', country: 'Germany', admin1: 'Berlin', lat: 52.52, lon: 13.405 },
      ],
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    });

    const handleCitySelect = vi.fn();
    render(<GlobalCitySearch activeCity={mockCity} onCitySelect={handleCitySelect} />);

    const input = screen.getByPlaceholderText(/search any city or location worldwide/i);
    fireEvent.change(input, { target: { value: 'Berlin' } });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/geo/search?q=Berlin');
    });

    await waitFor(() => {
      expect(screen.getByText(/Germany/i)).toBeInTheDocument();
    });

    // Click result dropdown button
    const resultItem = screen.getByText(/Berlin,\s*Germany/i).closest('button');
    fireEvent.click(resultItem);

    expect(handleCitySelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.405 })
    );
  });

  it('selects city immediately when typing and pressing Enter or clicking Search button', () => {
    const handleCitySelect = vi.fn();
    render(<GlobalCitySearch activeCity={mockCity} onCitySelect={handleCitySelect} />);

    const input = screen.getByPlaceholderText(/search any city or location worldwide/i);
    fireEvent.change(input, { target: { value: 'Jaipur' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(handleCitySelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Jaipur', country: 'India' })
    );

    // Also test search submit button
    const searchBtn = screen.getByRole('button', { name: /^search$/i });
    fireEvent.change(input, { target: { value: 'Mumbai' } });
    fireEvent.click(searchBtn);

    expect(handleCitySelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Mumbai', country: 'India' })
    );
  });
});
