import React from 'react';
import { AlertTriangle, CheckCircle, ShieldX, TrendingDown } from 'lucide-react';
import type { PnLAnalysisResult, ActionCommandResult } from '../types';

interface SkuTableProps {
  analyses: PnLAnalysisResult[];
  actions: ActionCommandResult[];
}

export const SkuTable: React.FC<SkuTableProps> = ({ analyses, actions }) => {
  const getActionForSku = (skuId: string) => {
    return actions.find((a) => a.skuId === skuId);
  };

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
            📊 Ma Trận Giám Sát Rủi Ro &amp; P&amp;L Từng SKU
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Dữ liệu tính toán Net P&amp;L chuẩn công thức Shopee 2026 và quyết định can thiệp tự trị
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-critical">Critical: {analyses.filter(a => a.riskLevel === 'CRITICAL').length}</span>
          <span className="badge badge-warning">Warning: {analyses.filter(a => a.riskLevel === 'WARNING').length}</span>
          <span className="badge badge-normal">Normal: {analyses.filter(a => a.riskLevel === 'NORMAL').length}</span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 14px' }}>SKU &amp; Sản Phẩm</th>
              <th style={{ padding: '12px 14px' }}>Net P&amp;L (VNĐ)</th>
              <th style={{ padding: '12px 14px' }}>Biên LN Ròng</th>
              <th style={{ padding: '12px 14px' }}>CAC vs Biên Gộp</th>
              <th style={{ padding: '12px 14px' }}>Mức Rủi Ro</th>
              <th style={{ padding: '12px 14px' }}>Lệnh Can Thiệp</th>
              <th style={{ padding: '12px 14px' }}>Hiệu Quả Cắt Lỗ</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.875rem' }}>
            {analyses.map((item) => {
              const action = getActionForSku(item.skuId);
              const isCritical = item.riskLevel === 'CRITICAL';
              const isWarning = item.riskLevel === 'WARNING';
              const isProfitable = item.netPnL > 0;
              const cacExceedsMargin = item.cac > item.grossMarginPerUnit;

              return (
                <tr
                  key={item.skuId}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  {/* SKU name & id */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{item.skuName}</div>
                    <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 2 }}>
                      {item.skuId}
                    </div>
                  </td>

                  {/* Net PnL */}
                  <td style={{ padding: '14px' }}>
                    <div className="mono" style={{
                      fontWeight: 700,
                      color: isProfitable ? '#34D399' : '#F87171',
                      fontSize: '0.95rem',
                    }}>
                      {item.netPnL > 0 ? '+' : ''}{item.netPnL.toLocaleString('vi-VN')} VNĐ
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      ROI Ads: {item.roi.toFixed(2)}x
                    </div>
                  </td>

                  {/* Net margin % */}
                  <td style={{ padding: '14px' }}>
                    <span className="mono" style={{
                      fontWeight: 700,
                      color: isCritical ? '#F87171' : isWarning ? '#FBBF24' : '#34D399',
                    }}>
                      {(item.netMarginPct * 100).toFixed(1)}%
                    </span>
                  </td>

                  {/* CAC vs Gross Margin */}
                  <td style={{ padding: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div className="mono" style={{ fontSize: '0.8rem', color: cacExceedsMargin ? '#F87171' : 'var(--text-main)' }}>
                        CAC: {item.cac.toLocaleString('vi-VN')} đ
                      </div>
                      <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        Biên gộp: {item.grossMarginPerUnit.toLocaleString('vi-VN')} đ
                      </div>
                      {cacExceedsMargin && (
                        <span style={{ fontSize: '0.65rem', color: '#F87171', fontWeight: 600 }}>
                          ⚠️ CAC &gt; Biên gộp!
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Risk Level Badge */}
                  <td style={{ padding: '14px' }}>
                    {isCritical && (
                      <span className="badge badge-critical">
                        <AlertTriangle size={12} />
                        CRITICAL
                      </span>
                    )}
                    {isWarning && (
                      <span className="badge badge-warning">
                        <TrendingDown size={12} />
                        WARNING
                      </span>
                    )}
                    {!isCritical && !isWarning && (
                      <span className="badge badge-normal">
                        <CheckCircle size={12} />
                        NORMAL
                      </span>
                    )}
                  </td>

                  {/* Action Command Badge */}
                  <td style={{ padding: '14px' }}>
                    {action?.command === 'KILL_CAMPAIGN' && (
                      <span className="badge badge-critical" style={{ background: '#DC2626', color: '#FFFFFF', border: 'none' }}>
                        <ShieldX size={12} />
                        KILL_CAMPAIGN
                      </span>
                    )}
                    {action?.command === 'LOWER_BID_50' && (
                      <span className="badge badge-warning" style={{ background: '#D97706', color: '#FFFFFF', border: 'none' }}>
                        <TrendingDown size={12} />
                        LOWER_BID_50
                      </span>
                    )}
                    {action?.command === 'MAINTAIN' && (
                      <span className="badge badge-normal" style={{ background: '#059669', color: '#FFFFFF', border: 'none' }}>
                        <CheckCircle size={12} />
                        MAINTAIN
                      </span>
                    )}
                  </td>

                  {/* Savings / New Bid details */}
                  <td style={{ padding: '14px' }}>
                    {action?.estimatedSavings ? (
                      <div style={{ color: '#F87171', fontWeight: 700 }}>
                        Cắt lỗ: +{action.estimatedSavings.toLocaleString('vi-VN')} đ
                      </div>
                    ) : action?.newBidPrice ? (
                      <div style={{ color: '#FBBF24', fontWeight: 600 }}>
                        Bid mới: ~{action.newBidPrice.toLocaleString('vi-VN')} đ
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                        Hoạt động tối ưu
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
