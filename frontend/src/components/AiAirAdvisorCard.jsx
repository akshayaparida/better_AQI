import React, { useState, useEffect } from 'react';
import { Sparkles, Bot, Send, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function AiAirAdvisorCard({ activeCity }) {
  const [prompt, setPrompt] = useState('Should our school conduct outdoor sports recess today?');
  const [commuteMode, setCommuteMode] = useState('bicycle');
  const [distanceKm, setDistanceKm] = useState(8.5);
  const [isLoading, setIsLoading] = useState(false);
  const [agentResponse, setAgentResponse] = useState(null);
  const [capabilities, setCapabilities] = useState(null);
  const [showTools, setShowTools] = useState(true);

  // Fetch Strands Agent introspection metadata
  useEffect(() => {
    async function fetchCapabilities() {
      try {
        const res = await fetch('/api/agent/capabilities');
        if (res.ok) {
          setCapabilities(await res.json());
        }
      } catch (err) {
        console.warn('Failed to fetch agent capabilities:', err);
      }
    }
    fetchCapabilities();
  }, []);

  // Proactively run an initial assessment for active city
  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      if (!activeCity?.name) return;
      setIsLoading(true);
      try {
        const res = await fetch('/api/agent/consult', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `What are the school and commute safety directives for ${activeCity.name} right now?`,
            latitude: activeCity.lat || 28.6139,
            longitude: activeCity.lon || 77.2090,
            commute_mode: 'bicycle',
            distance_km: 8.5,
          }),
        });
        if (res.ok && !ignore) {
          const data = await res.json();
          setAgentResponse(data);
        }
      } catch (err) {
        if (!ignore) console.warn('Initial agent fetch error:', err);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    loadInitial();
    return () => {
      ignore = true;
    };
  }, [activeCity]);

  const handleConsult = async (queryText) => {
    const q = queryText || prompt;
    if (!q || !q.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/agent/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q.trim(),
          latitude: activeCity?.lat || 28.6139,
          longitude: activeCity?.lon || 77.2090,
          commute_mode: commuteMode,
          distance_km: Number(distanceKm),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAgentResponse(data);
      }
    } catch (err) {
      console.error('Agent consultation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    { label: '🏫 School Recess Safety', text: `Should our school conduct outdoor sports recess today in ${activeCity?.name || 'Delhi'}?` },
    { label: '🚴 Cycling Exposure Risk', text: `Is it safe to cycle ${distanceKm} km to college right now?` },
    { label: '👶 Sensitive Health Advice', text: `What are the health precautions for children and asthma patients in ${activeCity?.name || 'Delhi'}?` },
    { label: '🪟 Cleanest Air Ventilation Window', text: 'When is the optimal time to open windows for natural air circulation?' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(139, 92, 246, 0.45)',
          }}>
            <Sparkles size={24} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.25rem', margin: 0, fontWeight: '800' }}>
                AI Air Intelligence Advisor
              </h3>
              <span style={{
                fontSize: '0.68rem',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'rgba(139, 92, 246, 0.2)',
                color: '#A78BFA',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                AWS Strands Agents SDK
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Autonomous multi-tool environmental reasoning agent for {activeCity?.name || 'Delhi NCR'}
            </p>
          </div>
        </div>

        {/* Live Framework Introspection Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '10px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          fontSize: '0.78rem',
        }}>
          <Bot size={16} color="#60A5FA" />
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.68rem' }}>FRAMEWORK</span>
            <strong style={{ color: '#60A5FA' }}>AWS strands-agents</strong>
          </div>
        </div>
      </div>

      {/* Autonomous Toolset Introspection Drawer */}
      {capabilities?.registered_tools && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '10px',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color)',
        }}>
          <div
            onClick={() => setShowTools(!showTools)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#10B981" />
              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                Registered Agent Tools ({capabilities.registered_tools.length})
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                — Autonomous Tool Calling Enabled
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#60A5FA' }}>
              {showTools ? 'Hide Details ▲' : 'Inspect Tools ▼'}
            </span>
          </div>

          {showTools && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginTop: '12px' }}>
              {capabilities.registered_tools.map((t, idx) => (
                <div key={idx} style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <code style={{ fontSize: '0.76rem', color: '#A78BFA', fontWeight: '700' }}>
                      @{t.name}
                    </code>
                  </div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                    {t.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 1-Click Prompt Suggestion Pills */}
      <div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', display: 'block', marginBottom: '8px' }}>
          Ask Agent (1-Click Suggestions):
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {samplePrompts.map((sp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setPrompt(sp.text);
                handleConsult(sp.text);
              }}
              className="btn-secondary"
              style={{
                fontSize: '0.78rem',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: prompt === sp.text ? 'rgba(139, 92, 246, 0.25)' : undefined,
                borderColor: prompt === sp.text ? '#8B5CF6' : undefined,
                color: prompt === sp.text ? '#A78BFA' : undefined,
              }}
            >
              <span>{sp.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Console & Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        background: 'rgba(15, 23, 42, 0.6)',
        padding: '16px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            id="ai-agent-prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleConsult(); }}
            placeholder="Ask anything about air quality, school safety, exercise risk, or commute..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-color)',
              color: '#FFFFFF',
              fontSize: '0.88rem',
              outline: 'none',
            }}
          />
          <button
            type="button"
            id="btn-consult-ai-agent"
            aria-label="Consult Agent"
            onClick={() => handleConsult()}
            disabled={isLoading || !prompt.trim()}
            className="btn-primary"
            style={{
              padding: '12px 22px',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            <span>{isLoading ? 'Reasoning...' : 'Consult Agent'}</span>
          </button>
        </div>

        {/* Query Context Parameters (Commute mode + Distance) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Commute Mode:</span>
            <select
              value={commuteMode}
              onChange={(e) => setCommuteMode(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: '#1F2937',
                border: '1px solid var(--border-color)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
              }}
            >
              <option value="bicycle">Bicycle</option>
              <option value="two_wheeler">Two-Wheeler</option>
              <option value="car_ac">Car (AC Cabin)</option>
              <option value="walking">Walking</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Trip Distance:</span>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              style={{ width: '100px', accentColor: '#8B5CF6' }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: '700' }}>
              {distanceKm} km
            </span>
          </div>
        </div>
      </div>

      {/* Agent Response Visualization */}
      {agentResponse && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Synthesized Recommendation */}
          <div style={{
            padding: '18px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color="#10B981" />
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Agent Synthesis & Actionable Directive
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Target: {activeCity?.name || 'Current Location'}
              </span>
            </div>

            <p style={{ fontSize: '0.96rem', lineHeight: 1.6, color: '#FFFFFF', margin: 0, fontWeight: '500' }}>
              {agentResponse.synthesis}
            </p>

            {/* Quick Metrics Cards */}
            {agentResponse.recommendation_summary && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginTop: '16px' }}>
                <div style={{ padding: '10px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>AIR TIER</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#FBBF24' }}>
                    {agentResponse.recommendation_summary.category}
                  </span>
                </div>
                <div style={{ padding: '10px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>OUTDOOR RECESS</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#EF4444' }}>
                    {agentResponse.recommendation_summary.outdoor_sports}
                  </span>
                </div>
                <div style={{ padding: '10px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>COMMUTE INHALED</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#60A5FA' }}>
                    {agentResponse.recommendation_summary.commute_inhaled_ug} µg
                  </span>
                </div>
                <div style={{ padding: '10px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>CIGARETTE EQUIV</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#F87171' }}>
                    {agentResponse.recommendation_summary.commute_cigarette_equiv} cigs
                  </span>
                </div>
                <div style={{ padding: '10px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>VENTILATION</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#10B981' }}>
                    {agentResponse.recommendation_summary.ventilation_window}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Autonomous Multi-Step Execution Trail */}
          {agentResponse.tool_executions && agentResponse.tool_executions.length > 0 && (
            <div style={{
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-color)',
            }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700', display: 'block', marginBottom: '10px' }}>
                Autonomous Tool Execution Audit Trail:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {agentResponse.tool_executions.map((step, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.8rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: '#8B5CF6',
                        color: '#FFFFFF',
                        fontSize: '0.65rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {idx + 1}
                      </span>
                      <code style={{ color: '#A78BFA', fontWeight: '600' }}>
                        @{step.tool}
                      </code>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                      {step.tool === 'check_live_air_quality' && `PM2.5: ${step.output?.pm2_5} µg/m³ (${step.output?.category})`}
                      {step.tool === 'evaluate_school_safety' && `Assembly: ${step.output?.morning_assembly}`}
                      {step.tool === 'calculate_commute_inhalation' && `${step.output?.inhaled_pm25_ug} µg inhaled (${step.output?.cigarette_equivalent} cigs)`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
