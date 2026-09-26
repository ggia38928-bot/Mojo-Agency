import React, { useState } from 'react';
import { Flame, X, Play } from 'lucide-react';
import type { OrderTelemetry } from '../types';

interface MegaSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunSimulation: (items: OrderTelemetry[]) => void;
}

export const MegaSaleModal: React.FC<MegaSaleModalProps> = ({ isOpen, onClose, onRunSimulation }) => {
  const [skuName, setSkuName] = useState('Loa Bluetooth Mini Bass (SKU Flash Sale)');
  const [revenue, setRevenue] = useState(300000);
  const [cogs, setCogs] = useState(200000);
  const [adSpend, setAdSpend] = useState(95000); // Intentionally high to trigger critical
  const [unitsSold, setUnitsSold] = useState(1);
  const [voucherShop, setVoucherShop] = useState(15000);
  const [voucherXtra, setVoucherXtra] = useState(true);

  if (!isOpen) return null;

  // Real-time quick preview calculation
  const fees = revenue * (0.08 + 0.0491 + (voucherXtra ? 0.04 : 0));
  const estimatedPnL = revenue - cogs - fees - adSpend - voucherShop;
  const estimatedMargin = revenue > 0 ? (estimatedPnL / revenue) * 100 : 0;
  const cac = unitsSold > 0 ? adSpend / unitsSold : 0;
  const grossMarginPerUnit = unitsSold > 0 ? (revenue - cogs) / unitsSold : 0;
  const isLoss = estimatedPnL < 0 || cac > grossMarginPerUnit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSku: OrderTelemetry = {
      skuId: 'SKU-SIM-FLASH',
      skuName,
      revenue,
      cogs,
      adSpend,
      unitsSold,
      voucherShop,
      voucherXtraApplied: voucherXtra,
      campaignId: 'CAMP-SIM-99',
      timestamp: new Date().toISOString(),
    };

    // Run along with the 2 standard SKUs
    onRunSimulation([
      {
        skuId: 'SKU-001',
        skuName: 'Ốp Lưng iPhone 15 Pro Premium',
        revenue: 450000,
        cogs: 120000,
        adSpend: 45000,
        unitsSold: 3,
        voucherShop: 15000,
        voucherXtraApplied: false,
      },
      newSku,
    ]);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: 16,
    }}>
      <div className="glass-card" style={{
        maxWidth: 580,
        width: '100%',
        padding: '28px',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(239, 68, 68, 0.25)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Flame size={20} color="#EF4444" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FFFFFF' }}>
                Giả Lập Kịch Bản Mega Sale Shopee
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tạo một SKU bẫy đốt tiền để kiểm thử phản ứng tự trị tức thì của MarginGuard AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Estimate Callout */}
        <div style={{
          padding: '14px 16px',
          borderRadius: '12px',
          background: isLoss ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          border: isLoss ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: isLoss ? '#F87171' : '#34D399', fontWeight: 600 }}>
              {isLoss ? '🚨 BẪY CẮT LỖ PHÁT HIỆN: CÀNG BÁN CÀNG LỖ' : '✅ CHIẾN DỊCH AN TOÀN'}
            </div>
            <div className="mono" style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginTop: 2 }}>
              Dự phóng Net P&amp;L: {estimatedPnL.toLocaleString('vi-VN')} đ ({estimatedMargin.toFixed(1)}%)
            </div>
          </div>
          {isLoss && (
            <span className="badge badge-critical" style={{ fontSize: '0.7rem' }}>
              Sẽ bị KILL
            </span>
          )}
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
              Tên SKU Sản Phẩm
            </label>
            <input
              type="text"
              value={skuName}
              onChange={(e) => setSkuName(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-subtle)',
                color: '#FFFFFF',
                fontSize: '0.875rem',
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Doanh thu (VNĐ)
              </label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--border-subtle)',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                }}
                min={0}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Giá vốn COGS (VNĐ)
              </label>
              <input
                type="number"
                value={cogs}
                onChange={(e) => setCogs(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--border-subtle)',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                }}
                min={0}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#F87171', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                Chi phí Ads (VNĐ) 🔥
              </label>
              <input
                type="number"
                value={adSpend}
                onChange={(e) => setAdSpend(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
                min={0}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Số đơn bán được
              </label>
              <input
                type="number"
                value={unitsSold}
                onChange={(e) => setUnitsSold(Math.max(1, Number(e.target.value)))}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--border-subtle)',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                }}
                min={1}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                Voucher Shop tự tài trợ
              </label>
              <input
                type="number"
                value={voucherShop}
                onChange={(e) => setVoucherShop(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--border-subtle)',
                  color: '#FFFFFF',
                  fontSize: '0.875rem',
                }}
                min={0}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <input
              type="checkbox"
              id="xtra-check"
              checked={voucherXtra}
              onChange={(e) => setVoucherXtra(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="xtra-check" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
              Áp dụng chương trình Voucher Xtra (Shopee thu thêm 4% phí dịch vụ)
            </label>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-danger">
              <Play size={16} />
              <span>Chạy Giả Lập &amp; Kích Hoạt Multi-Agent</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
