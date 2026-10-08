import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SchoolAdvisoryCard from '../components/SchoolAdvisoryCard';

const mockSchoolData = {
  status: 'success',
  school_name: 'Delhi Public School, Rohini',
  current_air: {
    pm2_5: 85.2,
    cpcb_category: 'MODERATE',
    health_statement: 'Breathing discomfort to people with asthma, heart ailments and children',
  },
  advisory: {
    assembly: {
      status: 'CAUTION',
      recommendation: 'Keep outdoor assembly brief (under 15 minutes).',
      severity: 'medium',
    },
    sports_and_recess: {
      status: 'RESTRICTED',
      recommendation: 'Limit intense aerobic drills; provide frequent water breaks.',
      severity: 'medium',
    },
    classroom_purifiers: {
      mode: 'MEDIUM',
      guidance: 'Run classroom air purifiers at medium speed.',
      severity: 'medium',
    },
    optimal_air_exchange_window: {
      window: '14:00 - 16:00',
      reason: 'Mid-day solar heating breaks the morning ground inversion layer.',
    },
    vulnerable_students_alert: 'Students with known bronchial asthma or allergies should stay indoors.',
  },
};

describe('SchoolAdvisoryCard Component', () => {
  it('renders school name and current air status', () => {
    render(<SchoolAdvisoryCard advisoryData={mockSchoolData} />);

    expect(screen.getByText('School & Student Air Advisory')).toBeInTheDocument();
    expect(screen.getByText(/Delhi Public School, Rohini/i)).toBeInTheDocument();
  });

  it('renders morning assembly and sports directives', () => {
    render(<SchoolAdvisoryCard advisoryData={mockSchoolData} />);

    expect(screen.getByText('Morning Assembly')).toBeInTheDocument();
    expect(screen.getByText(/Keep outdoor assembly brief/i)).toBeInTheDocument();
    expect(screen.getByText('Outdoor Sports')).toBeInTheDocument();
    expect(screen.getByText(/Limit intense aerobic drills/i)).toBeInTheDocument();
  });

  it('displays optimal air exchange window and vulnerable alert', () => {
    render(<SchoolAdvisoryCard advisoryData={mockSchoolData} />);

    expect(screen.getByText(/14:00 - 16:00/i)).toBeInTheDocument();
    expect(screen.getByText(/Students with known bronchial asthma/i)).toBeInTheDocument();
  });

  it('renders nothing when advisoryData is null or invalid', () => {
    const { container } = render(<SchoolAdvisoryCard advisoryData={null} />);
    expect(container.firstChild).toBeNull();
  });
});
