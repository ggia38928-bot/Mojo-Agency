import React from 'react';
import { ShieldAlert, Play, Database, Flame, RefreshCw } from 'lucide-react';

interface NavbarProps {
  isBackendLive: boolean;
  loading: boolean;
  onRunDemo: (useCsv: boolean) => void;
  onOpenMegaSaleModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isBackendLive,
  loading,
  onRunDemo,
  onOpenMegaSaleModal,
}) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      backgroundColor: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '14px 24px',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #4F46E5 0%, #EF4444 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
          }}>
            <ShieldAlert size={26} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                MarginGuard AI
              </h1>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                Shopee 2026
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Multi-Agent P&amp;L Protection System • Sea × OpenAI Codex Hackathon
            </p>
          </div>
        </div>

        {/* Server status & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Backend Status indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            borderRadius: 20,
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.75rem',
          }}>
            <span
              className="pulse-dot"
              style={{
                backgroundColor: isBackendLive ? '#10B981' : '#F59E0B',
                boxShadow: isBackendLive ? '0 0 10px #10B981' : '0 0 10px #F59E0B',
              }}
            />
            <span style={{ color: isBackendLive ? '#34D399' : '#FBBF24', fontWeight: 500 }}>
              {isBackendLive ? 'NestJS API: Online (Port 3001)' : 'Chế độ giả lập (Offline)'}
            </span>
          </div>

          {/* Action Buttons */}
          <button
            id="btn-run-demo"
            className="btn btn-primary"
            onClick={() => onRunDemo(false)}
            disabled={loading}
          >
            {loading ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
            <span>Chạy Demo (3 SKU)</span>
          </button>

          <button
            id="btn-run-csv"
            className="btn btn-secondary"
            onClick={() => onRunDemo(true)}
            disabled={loading}
          >
            <Database size={16} />
            <span>Nạp CSV (5 SKU)</span>
          </button>

          <button
            id="btn-trigger-mega-sale"
            className="btn btn-danger"
            onClick={onOpenMegaSaleModal}
            disabled={loading}
          >
            <Flame size={16} />
            <span>Test Bẫy Cắt Lỗ</span>
          </button>
        </div>
      </div>
    </header>
  );
};
