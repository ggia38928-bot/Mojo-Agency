import React from 'react';
import { DollarSign, ShieldAlert, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import type { OrchestratorReport } from '../types';

interface KpiMetricsProps {
  report: OrchestratorReport;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({ report }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: 16,
      marginBottom: 24,
    }}>
      {/* Hero Card: Total Money Saved */}
      <div
        className="glass-card glow-alert"
        style={{
          padding: '20px 24px',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              💰 Tiền Cắt Lỗ Thành Công
            </span>
            <div className="mono" style={{ fontSize: '1.875rem', fontWeight: 800, color: '#FFFFFF', marginTop: 6 }}>
              {report.totalEstimatedSavings.toLocaleString('vi-VN')} <span style={{ fontSize: '1rem', color: '#F87171' }}>VNĐ</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Số tiền lỗ ròng được ngắt kịp thời trước khi ngân sách Ads bị thiêu rụi
            </p>
          </div>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <DollarSign size={24} color="#EF4444" />
          </div>
        </div>
      </div>

      {/* Card 2: Campaigns Killed */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🛑 Chiến Dịch Bị KILL
            </span>
            <div className="mono" style={{ fontSize: '1.875rem', fontWeight: 800, color: '#FFFFFF', marginTop: 6 }}>
              {report.campaignsKilled} <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>chiến dịch</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Phát hiện CAC &gt; Biên gộp hoặc Lỗ ròng &lt; 0%
            </p>
          </div>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ShieldAlert size={24} color="#EF4444" />
          </div>
        </div>
      </div>

      {/* Card 3: Lower Bid 50% */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              📉 Hạ 50% Giá Thầu
            </span>
            <div className="mono" style={{ fontSize: '1.875rem', fontWeight: 800, color: '#FFFFFF', marginTop: 6 }}>
              {report.bidsLowered} <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>chiến dịch</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Biên mỏng 0% - 5%, hạ thầu để bảo vệ lợi nhuận
            </p>
          </div>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ArrowDownRight size={24} color="#F59E0B" />
          </div>
        </div>
      </div>

      {/* Card 4: Maintained */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ✅ Giữ Nguyên An Toàn
            </span>
            <div className="mono" style={{ fontSize: '1.875rem', fontWeight: 800, color: '#FFFFFF', marginTop: 6 }}>
              {report.maintained} <span style={{ fontSize: '0.875rem', color: 'var(--text-dim)' }}>chiến dịch</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Biên LN ròng &ge; 5%, CAC trong tầm kiểm soát
            </p>
          </div>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CheckCircle2 size={24} color="#10B981" />
          </div>
        </div>
      </div>
    </div>
  );
};
