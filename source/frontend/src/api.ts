import type { OrchestratorReport, OrderTelemetry } from './types';

const API_BASE_URL = 'http://localhost:3001/api/orchestrator';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/mock-data`, { method: 'GET', signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchDemoReport(useCsv: boolean = false): Promise<{ data: OrchestratorReport; isLive: boolean }> {
  try {
    const url = useCsv ? `${API_BASE_URL}/demo?csv=true` : `${API_BASE_URL}/demo`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { data, isLive: true };
  } catch (err) {
    console.warn('Backend unavailable, using simulated response:', err);
    return { data: getFallbackReport(useCsv), isLive: false };
  }
}

export async function runCustomSimulation(telemetry: OrderTelemetry[]): Promise<{ data: OrchestratorReport; isLive: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customTelemetry: telemetry }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return { data, isLive: true };
  } catch (err) {
    console.warn('Backend unavailable for custom run, calculating client-side fallback:', err);
    return { data: calculateClientFallback(telemetry), isLive: false };
  }
}

function getFallbackReport(useCsv: boolean): OrchestratorReport {
  if (useCsv) {
    return {
      totalSkus: 5,
      normalCount: 3,
      warningCount: 1,
      criticalCount: 1,
      campaignsKilled: 1,
      bidsLowered: 1,
      maintained: 3,
      totalEstimatedSavings: 84185,
      analyses: [
        {
          skuId: 'SKU-001',
          skuName: 'Ốp Lưng iPhone 15 Pro Premium',
          netPnL: 211905,
          netMarginPct: 0.4709,
          cac: 15000,
          grossMarginPerUnit: 110000,
          roi: 4.709,
          riskLevel: 'NORMAL',
          reason: 'An toàn — Biên LN ròng 47.1%, CAC kiểm soát tốt',
        },
        {
          skuId: 'SKU-002',
          skuName: 'Tai Nghe Bluetooth V5.3',
          netPnL: 10815,
          netMarginPct: 0.0309,
          cac: 20000,
          grossMarginPerUnit: 60000,
          roi: 0.27,
          riskLevel: 'WARNING',
          reason: 'Biên mỏng 3.1% — dưới ngưỡng an toàn 5%, cần theo dõi',
        },
        {
          skuId: 'SKU-003',
          skuName: 'Bộ Sạc Nhanh 20W (SKU Mega Sale ⚡)',
          netPnL: -84185,
          netMarginPct: -0.2405,
          cac: 85000,
          grossMarginPerUnit: 80000,
          roi: -0.99,
          riskLevel: 'CRITICAL',
          reason: 'Lỗ ròng -24.1% (-84.185 VNĐ) — đang đốt tiền mỗi đơn | CAC 85.000 VNĐ > Biên gộp 80.000 VNĐ',
        },
        {
          skuId: 'SKU-004',
          skuName: 'Dây Cáp USB-C 2m Bền',
          netPnL: 56762,
          netMarginPct: 0.3153,
          cac: 4000,
          grossMarginPerUnit: 20000,
          roi: 2.84,
          riskLevel: 'NORMAL',
          reason: 'An toàn — Biên LN ròng 31.5%, CAC kiểm soát tốt',
        },
        {
          skuId: 'SKU-005',
          skuName: 'Pin Dự Phòng 20000mAh Anker',
          netPnL: 82085,
          netMarginPct: 0.1263,
          cac: 45000,
          grossMarginPerUnit: 110000,
          roi: 0.91,
          riskLevel: 'NORMAL',
          reason: 'An toàn — Biên LN ròng 12.6%, CAC kiểm soát tốt',
        },
      ],
      actions: [
        {
          skuId: 'SKU-001',
          command: 'MAINTAIN',
          reason: '✅ MAINTAIN: Ốp Lưng iPhone an toàn. Giữ nguyên.',
        },
        {
          skuId: 'SKU-002',
          command: 'LOWER_BID_50',
          reason: '⚠️ LOWER_BID_50: Tai Nghe Bluetooth biên mỏng 3.1%. Hạ 50% giá thầu từ 20.000 → ~10.000 VNĐ.',
          newBidPrice: 10000,
        },
        {
          skuId: 'SKU-003',
          command: 'KILL_CAMPAIGN',
          reason: '🚨 KILL_CAMPAIGN: Bộ Sạc Nhanh 20W đang lỗ ròng -84.185 VNĐ. Dừng ngay cắt lỗ.',
          estimatedSavings: 84185,
        },
        {
          skuId: 'SKU-004',
          command: 'MAINTAIN',
          reason: '✅ MAINTAIN: Dây Cáp USB-C an toàn. Giữ nguyên.',
        },
        {
          skuId: 'SKU-005',
          command: 'MAINTAIN',
          reason: '✅ MAINTAIN: Pin Dự Phòng 20000mAh an toàn. Giữ nguyên.',
        },
      ],
      executedAt: new Date().toISOString(),
    };
  }

  return {
    totalSkus: 3,
    normalCount: 1,
    warningCount: 1,
    criticalCount: 1,
    campaignsKilled: 1,
    bidsLowered: 1,
    maintained: 1,
    totalEstimatedSavings: 84185,
    analyses: [
      {
        skuId: 'SKU-001',
        skuName: 'Ốp Lưng iPhone 15 Pro Premium',
        netPnL: 211905,
        netMarginPct: 0.4709,
        cac: 15000,
        grossMarginPerUnit: 110000,
        roi: 4.709,
        riskLevel: 'NORMAL',
        reason: 'An toàn — Biên LN ròng 47.1%, CAC kiểm soát tốt',
      },
      {
        skuId: 'SKU-002',
        skuName: 'Tai Nghe Bluetooth V5.3',
        netPnL: 10815,
        netMarginPct: 0.0309,
        cac: 20000,
        grossMarginPerUnit: 60000,
        roi: 0.27,
        riskLevel: 'WARNING',
        reason: 'Biên mỏng 3.1% — dưới ngưỡng an toàn 5%, cần theo dõi',
      },
      {
        skuId: 'SKU-003',
        skuName: 'Bộ Sạc Nhanh 20W (SKU Mega Sale ⚡)',
        netPnL: -84185,
        netMarginPct: -0.2405,
        cac: 85000,
        grossMarginPerUnit: 80000,
        roi: -0.99,
        riskLevel: 'CRITICAL',
        reason: 'Lỗ ròng -24.1% (-84.185 VNĐ) — đang đốt tiền mỗi đơn | CAC 85.000 VNĐ > Biên gộp 80.000 VNĐ',
      },
    ],
    actions: [
      {
        skuId: 'SKU-001',
        command: 'MAINTAIN',
        reason: '✅ MAINTAIN: Ốp Lưng iPhone an toàn. Giữ nguyên.',
      },
      {
        skuId: 'SKU-002',
        command: 'LOWER_BID_50',
        reason: '⚠️ LOWER_BID_50: Tai Nghe Bluetooth biên mỏng 3.1%. Hạ 50% giá thầu từ 20.000 → ~10.000 VNĐ.',
        newBidPrice: 10000,
      },
      {
        skuId: 'SKU-003',
        command: 'KILL_CAMPAIGN',
        reason: '🚨 KILL_CAMPAIGN: Bộ Sạc Nhanh 20W đang lỗ ròng -84.185 VNĐ. Dừng ngay cắt lỗ.',
        estimatedSavings: 84185,
      },
    ],
    executedAt: new Date().toISOString(),
  };
}

function calculateClientFallback(items: OrderTelemetry[]): OrchestratorReport {
  // Shopee 2026 rates
  const COMMISSION = 0.08;
  const PAYMENT = 0.0491;
  const VOUCHER_XTRA = 0.04;

  let normalCount = 0;
  let warningCount = 0;
  let criticalCount = 0;
  let campaignsKilled = 0;
  let bidsLowered = 0;
  let maintained = 0;
  let totalEstimatedSavings = 0;

  const analyses = items.map((item) => {
    const feeRate = COMMISSION + PAYMENT + (item.voucherXtraApplied ? VOUCHER_XTRA : 0);
    const totalFees = item.revenue * feeRate;
    const grossMarginPerUnit = item.unitsSold > 0 ? (item.revenue - item.cogs) / item.unitsSold : 0;
    const netPnL = item.revenue - item.cogs - totalFees - item.adSpend - (item.voucherShop || 0);
    const netMarginPct = item.revenue > 0 ? netPnL / item.revenue : 0;
    const cac = item.unitsSold > 0 ? item.adSpend / item.unitsSold : 0;
    const roi = item.adSpend > 0 ? netPnL / item.adSpend : 0;

    let riskLevel: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    let reason = `An toàn — Biên LN ròng ${(netMarginPct * 100).toFixed(1)}%`;

    if (netMarginPct < 0 || (cac > grossMarginPerUnit && grossMarginPerUnit > 0)) {
      riskLevel = 'CRITICAL';
      reason = `Lỗ ròng ${(netMarginPct * 100).toFixed(1)}% | CAC ${cac.toLocaleString()} > Biên gộp ${grossMarginPerUnit.toLocaleString()}`;
      criticalCount++;
    } else if (netMarginPct < 0.05) {
      riskLevel = 'WARNING';
      reason = `Biên mỏng ${(netMarginPct * 100).toFixed(1)}% < 5%`;
      warningCount++;
    } else {
      normalCount++;
    }

    return {
      skuId: item.skuId,
      skuName: item.skuName,
      netPnL,
      netMarginPct,
      cac,
      grossMarginPerUnit,
      roi,
      riskLevel,
      reason,
    };
  });

  const actions = analyses.map((a) => {
    if (a.riskLevel === 'CRITICAL') {
      campaignsKilled++;
      const saved = Math.abs(a.netPnL);
      totalEstimatedSavings += saved;
      return {
        skuId: a.skuId,
        command: 'KILL_CAMPAIGN' as const,
        reason: `🚨 KILL_CAMPAIGN: ${a.skuName} đang lỗ ròng. Dừng ngay để cắt lỗ.`,
        estimatedSavings: saved,
      };
    } else if (a.riskLevel === 'WARNING') {
      bidsLowered++;
      return {
        skuId: a.skuId,
        command: 'LOWER_BID_50' as const,
        reason: `⚠️ LOWER_BID_50: ${a.skuName} biên mỏng. Hạ 50% giá thầu để bảo vệ biên.`,
        newBidPrice: a.cac * 0.5,
      };
    } else {
      maintained++;
      return {
        skuId: a.skuId,
        command: 'MAINTAIN' as const,
        reason: `✅ MAINTAIN: ${a.skuName} an toàn. Giữ nguyên.`,
      };
    }
  });

  return {
    totalSkus: items.length,
    normalCount,
    warningCount,
    criticalCount,
    campaignsKilled,
    bidsLowered,
    maintained,
    totalEstimatedSavings,
    analyses,
    actions,
    executedAt: new Date().toISOString(),
  };
}
