export interface ShopeeFeesBreakdown {
  commission: number;       // 8% of revenue
  paymentFee: number;       // 4.91% of revenue
  voucherXtraFee: number;   // 4% of revenue (nếu áp dụng)
  totalFees: number;        // Tổng phí Shopee
}

export interface PnLResult {
  skuId: string;
  skuName: string;
  revenue: number;
  cogs: number;
  adSpend: number;
  voucherShop: number;
  unitsSold: number;
  voucherXtraApplied: boolean;
  fees: ShopeeFeesBreakdown;
  netPnL: number;
  netMarginPct: number;
  cac: number;
  roi: number;
  grossMarginPerUnit: number;
}
