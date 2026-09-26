import React from 'react';
import { Radio, Calculator, BrainCircuit, Zap } from 'lucide-react';

export const AgentPipelineVisualizer: React.FC = () => {
  const steps = [
    {
      agent: 'AGENT 1',
      title: 'Telemetry Agent',
      desc: 'Hứng luồng đơn hàng, giá vốn & chi phí Shopee Ads real-time',
      icon: Radio,
      color: '#06B6D4',
      bg: 'rgba(6, 182, 212, 0.15)',
    },
    {
      agent: 'CORE ENGINE',
      title: 'P&L Calculator 2026',
      desc: 'Khấu trừ 8% phí cố định + 4.91% phí thanh toán + 4% Voucher Xtra',
      icon: Calculator,
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.15)',
    },
    {
      agent: 'AGENT 2',
      title: 'Risk Threshold Agent',
      desc: 'So sánh CAC vs Biên gộp đơn hàng & phân loại rủi ro',
      icon: BrainCircuit,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.15)',
    },
    {
      agent: 'AGENT 3',
      title: 'Action Agent',
      desc: 'Can thiệp tự trị tức thì: KILL_CAMPAIGN hoặc hạ 50% giá thầu',
      icon: Zap,
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.15)',
    },
  ];

  return (
    <div className="glass-card" style={{ padding: '20px 24px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            🤖 Quy Trình Điều Phối Multi-Agent (Agent Delegation Pattern)
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Pipeline tự động hóa hoàn toàn từ nạp dữ liệu đến can thiệp cắt lỗ, không có độ trễ con người
          </p>
        </div>
        <span className="badge badge-violet">Autonomous Pipeline</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 14,
        position: 'relative',
      }}>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: step.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={18} color={step.color} />
                </div>
                <div>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: step.color, letterSpacing: '0.05em' }}>
                    {step.agent}
                  </span>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF' }}>
                    {step.title}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
