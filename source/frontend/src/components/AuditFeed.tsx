import React from 'react';
import { History, ShieldAlert, TrendingDown, CheckCircle2, Clock } from 'lucide-react';
import type { ActionCommandResult, PnLAnalysisResult } from '../types';

interface AuditFeedProps {
  actions: ActionCommandResult[];
  analyses: PnLAnalysisResult[];
  executedAt: string;
}

export const AuditFeed: React.FC<AuditFeedProps> = ({ actions, analyses, executedAt }) => {
  const getAnalysis = (skuId: string) => analyses.find(a => a.skuId === skuId);

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'rgba(99, 102, 241, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <History size={18} color="#818CF8" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              📝 Nhật Ký Can Thiệp Tự Trị (Autonomous Action Feed)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Lịch sử các quyết định can thiệp tức thời của Agent 3
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--text-dim)' }}>
          <Clock size={14} />
          <span>{new Date(executedAt).toLocaleTimeString('vi-VN')}</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {actions.map((action, idx) => {
          const analysis = getAnalysis(action.skuId);
          const isKill = action.command === 'KILL_CAMPAIGN';
          const isLower = action.command === 'LOWER_BID_50';

          return (
            <div
              key={idx}
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: isKill
                  ? 'rgba(239, 68, 68, 0.08)'
                  : isLower
                  ? 'rgba(245, 158, 11, 0.06)'
                  : 'rgba(16, 185, 129, 0.05)',
                border: isKill
                  ? '1px solid rgba(239, 68, 68, 0.25)'
                  : isLower
                  ? '1px solid rgba(245, 158, 11, 0.2)'
                  : '1px solid rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div style={{ marginTop: 2 }}>
                {isKill && <ShieldAlert size={18} color="#EF4444" />}
                {isLower && <TrendingDown size={18} color="#F59E0B" />}
                {!isKill && !isLower && <CheckCircle2 size={18} color="#10B981" />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.875rem' }}>
                    {analysis?.skuName || action.skuId}
                  </span>
                  <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    [{action.skuId}]
                  </span>
                  {action.estimatedSavings && (
                    <span className="badge badge-critical" style={{ fontSize: '0.65rem' }}>
                      Cắt lỗ: +{action.estimatedSavings.toLocaleString('vi-VN')} đ
                    </span>
                  )}
                  {action.newBidPrice !== undefined && (
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                      Giá thầu mới: ~{action.newBidPrice.toLocaleString('vi-VN')} đ
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.4 }}>
                  {action.reason}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
