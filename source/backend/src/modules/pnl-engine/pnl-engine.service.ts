import { Injectable } from '@nestjs/common';
import {
  SHOPEE_COMMISSION_RATE,
  SHOPEE_PAYMENT_FEE_RATE,
  SHOPEE_VOUCHER_XTRA_RATE,
  THIN_MARGIN_THRESHOLD,
  CRITICAL_LOSS_THRESHOLD,
} from '../../common/constants/shopee-fees.constant';
import {
  ShopeeFeesBreakdown,
  PnLResult,
} from './interfaces/pnl-result.interface';

export interface CalculatePnLParams {
  skuId: string;
  skuName: string;
  revenue: number;
  cogs: number;
  adSpend: number;
  unitsSold: number;
  voucherShop?: number;
  voucherXtraApplied?: boolean;
}

@Injectable()
export class PnlEngineService {
  /**
   * Tính toán chi tiết các loại phí Shopee 2026.
   * - Phí cố định: 8% Doanh thu
   * - Phí thanh toán: 4.91% Doanh thu (đã gồm VAT)
   * - Phí dịch vụ Voucher Xtra: 4% Doanh thu (nếu áp dụng)
   */
  calculateShopeeFees(
    revenue: number,
    voucherXtraApplied: boolean = false,
  ): ShopeeFeesBreakdown {
    const commission = revenue * SHOPEE_COMMISSION_RATE;
    const paymentFee = revenue * SHOPEE_PAYMENT_FEE_RATE;
    const voucherXtraFee = voucherXtraApplied
      ? revenue * SHOPEE_VOUCHER_XTRA_RATE
      : 0.0;
    const totalFees = commission + paymentFee + voucherXtraFee;

    return {
      commission,
      paymentFee,
      voucherXtraFee,
      totalFees,
    };
  }

  /**
   * Tính P&L ròng chuẩn Shopee 2026.
   * Công thức cốt lõi:
   *   Net P&L = Revenue - COGS - Fees - AdSpend - Voucher_Shop
   *   CAC = AdSpend / UnitsSold
   *   Gross Margin / Unit = (Revenue - COGS) / UnitsSold
   *   Net Margin % = Net P&L / Revenue
   *   ROI Ads = Net P&L / AdSpend
   */
  calculatePnL(params: CalculatePnLParams): PnLResult {
    const {
      skuId,
      skuName,
      revenue,
      cogs,
      adSpend,
      unitsSold,
      voucherShop = 0.0,
      voucherXtraApplied = false,
    } = params;

    const fees = this.calculateShopeeFees(revenue, voucherXtraApplied);

    const grossMarginPerUnit =
      unitsSold > 0 ? (revenue - cogs) / unitsSold : 0.0;

    const netPnL =
      revenue - cogs - fees.totalFees - adSpend - voucherShop;

    const netMarginPct = revenue > 0 ? netPnL / revenue : 0.0;

    const cac = unitsSold > 0 ? adSpend / unitsSold : 0.0;

    const roi = adSpend > 0 ? netPnL / adSpend : 0.0;

    return {
      skuId,
      skuName,
      revenue,
      cogs,
      adSpend,
      voucherShop,
      unitsSold,
      voucherXtraApplied,
      fees,
      netPnL,
      netMarginPct,
      cac,
      roi,
      grossMarginPerUnit,
    };
  }

  /**
   * Trả về nhãn trạng thái theo biên lợi nhuận ròng.
   */
  getMarginLabel(margin: number): string {
    if (margin >= THIN_MARGIN_THRESHOLD) {
      return 'SAFE';
    } else if (margin >= CRITICAL_LOSS_THRESHOLD) {
      return 'WARNING (Biên mỏng)';
    } else {
      return 'CRITICAL (Đang LỖ)';
    }
  }
}
