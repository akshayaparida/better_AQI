import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AiAirAdvisorCard from '../components/AiAirAdvisorCard';

const mockCapabilities = {
  framework: 'AWS Strands Agents SDK',
  package: 'strands-agents (open source)',
  agent_name: 'better_AQI AirIntelligenceAgent',
  registered_tools: [
    { name: 'check_live_air_quality', description: 'Retrieve real-time multi-pollutant telemetry' },
    { name: 'evaluate_school_safety', description: 'Evaluate operational school safety protocols' },
    { name: 'calculate_commute_inhalation', description: 'Calculate inhaled toxic particulate matter' },
  ],
};

const mockConsultResponse = {
  status: 'success',
  agent: 'AWS Strands Agents SDK (strands-agents)',
  prompt: 'Should our school conduct outdoor sports recess today?',
  synthesis: 'Based on live PM2.5 of 67.3 µg/m³ (Moderate), morning assembly should be brief and outdoor sports recess is Restricted.',
  tool_executions: [
    { tool: 'check_live_air_quality', output: { pm2_5: 67.3, category: 'Moderate' } },
    { tool: 'evaluate_school_safety', output: { morning_assembly: 'Brief (under 15 min)' } },
    { tool: 'calculate_commute_inhalation', output: { inhaled_pm25_ug: 22.88, cigarette_equivalent: 1.04 } },
  ],
  recommendation_summary: {
    category: 'Moderate',
    outdoor_sports: 'Restricted',
    commute_inhaled_ug: 22.88,
    commute_cigarette_equiv: 1.04,
    ventilation_window: '1:00 PM - 3:00 PM',
  },
};

describe('AiAirAdvisorCard Component', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (typeof url === 'string' && url.includes('/api/agent/capabilities')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockCapabilities) });
      }
      if (typeof url === 'string' && url.includes('/api/agent/consult')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(mockConsultResponse) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }));
  });

  it('renders header, AWS Strands framework badge, and tools drawer', async () => {
    render(<AiAirAdvisorCard activeCity={{ id: 'delhi', name: 'Delhi NCR', lat: 28.6139, lon: 77.209 }} />);

    expect(screen.getByText('AI Air Intelligence Advisor')).toBeInTheDocument();
    expect(screen.getByText('AWS Strands Agents SDK')).toBeInTheDocument();
    expect(screen.getByText(/strands-agents/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Registered Agent Tools/i)).toBeInTheDocument();
    });
  });

  it('renders prompt input, sample suggestion pills, and consult button', async () => {
    render(<AiAirAdvisorCard activeCity={{ id: 'delhi', name: 'Delhi NCR', lat: 28.6139, lon: 77.209 }} />);

    expect(screen.getByRole('button', { name: /Consult Agent/i })).toBeInTheDocument();
    expect(screen.getByText(/School Recess Safety/i)).toBeInTheDocument();
    expect(screen.getByText(/Cycling Exposure Risk/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Based on live PM2.5 of 67.3/i)).toBeInTheDocument();
    });
  });

  it('displays agent synthesis and autonomous tool execution trail on response', async () => {
    render(<AiAirAdvisorCard activeCity={{ id: 'delhi', name: 'Delhi NCR', lat: 28.6139, lon: 77.209 }} />);

    await waitFor(() => {
      expect(screen.getByText(/Based on live PM2.5 of 67.3/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(screen.getByText(/Autonomous Tool Execution Audit Trail/i)).toBeInTheDocument();
    expect(screen.getAllByText('@check_live_air_quality').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('@evaluate_school_safety').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('@calculate_commute_inhalation').length).toBeGreaterThanOrEqual(1);
  });

  it('submits consultation when prompt input button is clicked', async () => {
    render(<AiAirAdvisorCard activeCity={{ id: 'delhi', name: 'Delhi NCR', lat: 28.6139, lon: 77.209 }} />);

    await waitFor(() => {
      expect(screen.getByText(/Based on live PM2.5 of 67.3/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Ask anything about air quality/i);
    fireEvent.change(input, { target: { value: 'Is it safe to run in Delhi?' } });

    const btn = screen.getByRole('button', { name: /Consult Agent/i });
    fireEvent.click(btn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/agent/consult', expect.objectContaining({
        method: 'POST',
      }));
    });
  });
});
