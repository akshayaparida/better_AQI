import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CitizenResponsibilityCard from '../components/CitizenResponsibilityCard';

describe('CitizenResponsibilityCard Component', () => {
  it('renders header, score badge, and clean air pillars', () => {
    render(<CitizenResponsibilityCard />);

    expect(screen.getByText('Citizen Responsibility for Clean Air')).toBeInTheDocument();
    expect(screen.getByText(/Daily Clean Air Action Checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/The 5 Pillars of Community Air Quality Stewardship/i)).toBeInTheDocument();
    expect(screen.getByText(/Personal Commute Shift Calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/Report Illegal Open Burning/i)).toBeInTheDocument();
  });

  it('allows toggling citizen action checkboxes and updates earned score', () => {
    render(<CitizenResponsibilityCard />);

    // Default completed actions include transit (25) + idling (15) = 40 pts
    expect(screen.getByText('40 / 120 pts')).toBeInTheDocument();

    // Toggle No Open Burning (+30 pts)
    const burningCheckbox = screen.getByText('Zero Open Burning & Leaf Composting');
    fireEvent.click(burningCheckbox);

    // New score should be 40 + 30 = 70 pts
    expect(screen.getByText('70 / 120 pts')).toBeInTheDocument();
  });

  it('records civic pledge when clicking the button', () => {
    render(<CitizenResponsibilityCard />);

    const pledgeBtn = screen.getByRole('button', { name: /Record Daily Civic Pledge/i });
    expect(pledgeBtn).toBeInTheDocument();

    fireEvent.click(pledgeBtn);

    expect(screen.getByText('Pledge Recorded! 🎉')).toBeInTheDocument();
    expect(screen.getByText(/Thank you for being an active air quality steward!/i)).toBeInTheDocument();
  });

  it('updates commute shift savings when slider changes', () => {
    render(<CitizenResponsibilityCard />);

    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();

    // Default 12 km
    expect(screen.getByText('12 km / day')).toBeInTheDocument();

    fireEvent.change(slider, { target: { value: '25' } });

    expect(screen.getByText('25 km / day')).toBeInTheDocument();
    // 25 * 3.6 = 90.0 g PM2.5
    expect(screen.getByText('90.0 g')).toBeInTheDocument();
  });
});
